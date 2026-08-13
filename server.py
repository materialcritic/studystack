#!/usr/bin/env python3
"""Static file server for StudyStack, with a GET/POST /api/decks endpoint
backed by decks.json.

Backup strategy (the old one rotated 10 slots on *every* write, and the client
POSTs 400ms after any change — so a minute of typing could evict every
snapshot before you noticed a card was missing):

  * numbered slots decks.json.1..10 rotate at most once every BACKUP_INTERVAL
  * one dated snapshot per calendar day, kept for DAILY_KEEP_DAYS
  * an extra pre-shrink snapshot whenever a write drops a large fraction of
    the cards, which is what data loss actually looks like

Writes stay atomic (tmp file + os.replace) so a crash can't truncate
decks.json into something unparseable.
"""

import datetime
import http.server
import json
import os
import sys
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "decks.json")
BACKUP_DIR = os.path.join(BASE_DIR, ".backups")

BACKUP_COUNT = 10
BACKUP_INTERVAL = 600        # seconds between numbered rotations
DAILY_KEEP_DAYS = 30
SHRINK_RATIO = 0.9           # a write keeping <90% of cards gets its own snapshot
MAX_BODY = 64 * 1024 * 1024


def _card_count(data):
    try:
        return sum(len(d.get("cards") or []) for d in data.get("decks") or [])
    except AttributeError:
        return 0


def _load_current():
    if not os.path.exists(DATA_FILE):
        return None, b""
    with open(DATA_FILE, "rb") as f:
        raw = f.read()
    try:
        return json.loads(raw), raw
    except json.JSONDecodeError:
        return None, raw


def _snapshot(raw, name):
    os.makedirs(BACKUP_DIR, exist_ok=True)
    with open(os.path.join(BACKUP_DIR, name), "wb") as f:
        f.write(raw)


def _rotate_numbered(raw):
    """Shift decks.json.1..N down a slot, but only if the newest slot is older
    than BACKUP_INTERVAL — otherwise a burst of keystroke-triggered saves
    flushes the whole history."""
    os.makedirs(BACKUP_DIR, exist_ok=True)
    newest = os.path.join(BACKUP_DIR, "decks.json.1")
    if os.path.exists(newest) and time.time() - os.path.getmtime(newest) < BACKUP_INTERVAL:
        return
    for i in range(BACKUP_COUNT, 1, -1):
        src = os.path.join(BACKUP_DIR, f"decks.json.{i - 1}")
        dst = os.path.join(BACKUP_DIR, f"decks.json.{i}")
        if os.path.exists(src):
            os.replace(src, dst)
    _snapshot(raw, "decks.json.1")


def _daily(raw):
    today = datetime.date.today().isoformat()
    path = os.path.join(BACKUP_DIR, f"decks.json.{today}")
    if not os.path.exists(path):
        _snapshot(raw, f"decks.json.{today}")
    cutoff = datetime.date.today() - datetime.timedelta(days=DAILY_KEEP_DAYS)
    if not os.path.isdir(BACKUP_DIR):
        return
    for name in os.listdir(BACKUP_DIR):
        stamp = name.replace("decks.json.", "")
        if len(stamp) != 10 or stamp.count("-") != 2:
            continue
        try:
            if datetime.date.fromisoformat(stamp) < cutoff:
                os.remove(os.path.join(BACKUP_DIR, name))
        except ValueError:
            continue


def _back_up(incoming):
    current, raw = _load_current()
    if not raw:
        return
    _daily(raw)
    _rotate_numbered(raw)
    if current is not None:
        before, after = _card_count(current), _card_count(incoming)
        if before > 20 and after < before * SHRINK_RATIO:
            stamp = time.strftime("%Y%m%dT%H%M%S")
            name = f"pre-shrink-{stamp}-{before}to{after}.json"
            _snapshot(raw, name)
            sys.stderr.write(
                f"WARNING: card count dropping {before} -> {after}; "
                f"snapshot saved to .backups/{name}\n"
            )


def _valid(data):
    """Reject structurally wrong payloads instead of letting a buggy or
    malicious client overwrite decks.json with junk."""
    if not isinstance(data, dict) or not isinstance(data.get("decks"), list):
        return False
    for deck in data["decks"]:
        if not isinstance(deck, dict) or not isinstance(deck.get("id"), str):
            return False
        if not isinstance(deck.get("cards"), list):
            return False
    if "bests" in data and not isinstance(data["bests"], dict):
        return False
    return True


def _write_decks(data):
    _back_up(data)
    tmp_path = DATA_FILE + ".tmp"
    # indent=1 keeps git diffs readable (the old single-line blob made it
    # impossible to see what a commit actually changed); ensure_ascii=False
    # keeps the text legible rather than \uXXXX-escaped.
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=1, ensure_ascii=False)
        f.write("\n")
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp_path, DATA_FILE)


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/decks":
            self._send_decks()
        else:
            super().do_GET()

    def do_POST(self):
        if self.path != "/api/decks":
            self.send_error(404)
            return

        # Only same-origin writes. A page on any other origin can otherwise
        # POST here and wipe the file.
        origin = self.headers.get("Origin")
        if origin and origin not in self._allowed_origins():
            self.send_error(403, "cross-origin write refused")
            return

        try:
            length = int(self.headers.get("Content-Length", 0))
        except ValueError:
            self.send_error(400, "bad Content-Length")
            return
        if length <= 0 or length > MAX_BODY:
            self.send_error(400, "missing or oversized body")
            return

        raw = self.rfile.read(length)
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            self.send_error(400, "invalid JSON")
            return
        if not _valid(data):
            self.send_error(400, "unexpected payload shape")
            return

        try:
            _write_decks(data)
        except OSError as e:
            sys.stderr.write(f"write failed: {e}\n")
            self.send_error(500, "could not write decks.json")
            return

        body = b'{"ok":true}'
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _allowed_origins(self):
        host = self.headers.get("Host") or ""
        return {f"http://{host}", f"https://{host}"}

    def _send_decks(self):
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, "rb") as f:
                body = f.read()
        else:
            body = json.dumps({"decks": [], "bests": {}}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    port = int(args[0]) if args else 8745
    # Localhost by default — the old 0.0.0.0 bind exposed an unauthenticated
    # write endpoint to the whole network. Pass --lan to opt in deliberately.
    host = "0.0.0.0" if "--lan" in sys.argv else "127.0.0.1"
    os.chdir(BASE_DIR)
    server = http.server.HTTPServer((host, port), Handler)
    print(f"StudyStack serving on http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
