#!/usr/bin/env python3
"""Static file server for StudyStack, with a GET/POST /api/decks endpoint
backed by decks.json. Mirrors ugc-net-quiz's server.py pattern."""

import http.server
import json
import os
import sys

DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "decks.json")


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
            with open(DATA_FILE, "w") as f:
                json.dump(data, f)
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
