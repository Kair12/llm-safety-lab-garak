"""Loopback-only HTTP demonstration. Run with python -m testbed.server."""

import argparse
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from . import settings
from .engine import LocalEngine


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--audit", type=Path, default=settings.ROOT / "evidence" / "application-audit.jsonl")
    args = parser.parse_args()
    engine = LocalEngine(args.audit)

    class Handler(BaseHTTPRequestHandler):
        def reply(self, value, code=200):
            data = json.dumps(value, ensure_ascii=False).encode()
            self.send_response(code)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(data)

        def do_GET(self):
            if self.path == "/health":
                return self.reply({"ready": True, **engine.metadata})
            if self.path != "/":
                return self.reply({"error": "Not found"}, 404)
            data = (settings.ROOT / "web" / "index.html").read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'")
            self.end_headers()
            self.wfile.write(data)

        def do_POST(self):
            if self.path != "/evaluate":
                return self.reply({"error": "Not found"}, 404)
            origin = self.headers.get("Origin")
            if origin and origin not in (f"http://127.0.0.1:{args.port}", f"http://localhost:{args.port}"):
                return self.reply({"error": "Cross-origin requests are disabled"}, 403)
            try:
                if "application/json" not in self.headers.get("Content-Type", ""):
                    return self.reply({"error": "JSON content required"}, 415)
                length = int(self.headers.get("Content-Length", "0"))
                if not 0 < length <= 150000:
                    return self.reply({"error": "Invalid request size"}, 413)
                value = json.loads(self.rfile.read(length))
                if not isinstance(value, dict):
                    raise ValueError("JSON object required")
                result = engine.evaluate(value.get("prompt"), value.get("mode"), str(value.get("case_id", "interactive"))[:200])
                self.reply(result)
            except (ValueError, TypeError, UnicodeDecodeError) as error:
                self.reply({"error": str(error)}, 400)

        def log_message(self, format, *values):
            if self.path != "/health":
                print(f"HTTP {self.address_string()} {format % values}", flush=True)

    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    print(f"Open http://127.0.0.1:{args.port}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
