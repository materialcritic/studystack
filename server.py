#!/usr/bin/env python3
"""Static file server for StudyStack, with a GET/POST /api/decks endpoint
backed by decks.json. Mirrors ugc-net-quiz's server.py pattern."""

import http.server
import json
import os
import sys

DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "decks.json")
BACKUP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".backups")
BACKUP_COUNT = 10


def _rotate_backups():
    if not os.path.exists(DATA_FILE):
        return
    os.makedirs(BACKUP_DIR, exist_ok=True)
    for i in range(BACKUP_COUNT, 1, -1):
        src = os.path.join(BACKUP_DIR, f"decks.json.{i - 1}")
        dst = os.path.join(BACKUP_DIR, f"decks.json.{i}")
        if os.path.exists(src):
            os.replace(src, dst)
    with open(DATA_FILE, "rb") as f:
        current = f.read()
    with open(os.path.join(BACKUP_DIR, "decks.json.1"), "wb") as f:
        f.write(current)


def _write_decks(data):
    # Snapshot the previous version before touching anything, then write
    # atomically (tmp file + os.replace) so a crash mid-write can't truncate
    # decks.json into an unparseable state.
    _rotate_backups()
    tmp_path = DATA_FILE + ".tmp"
    with open(tmp_path, "w") as f:
        json.dump(data, f)
    os.replace(tmp_path, DATA_FILE)


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/decks":
            self._send_decks()
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == "/api/decks":
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length)
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                self.send_response(400)
                self.end_headers()
                return
            _write_decks(data)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"ok":true}')
        else:
            self.send_response(404)
            self.end_headers()

    def _send_decks(self):
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, "rb") as f:
                body = f.read()
        else:
            body = json.dumps({"decks": [], "bests": {}}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8745
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = http.server.HTTPServer(("0.0.0.0", port), Handler)
    print(f"StudyStack serving on http://0.0.0.0:{port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
