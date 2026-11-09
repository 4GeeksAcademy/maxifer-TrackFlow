"""Deterministic OpenAI-compatible gateway for isolated container smoke tests."""
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def do_POST(self):
        payload = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        if self.path == "/embeddings":
            inputs = payload["input"]
            if isinstance(inputs, str):
                inputs = [inputs]
            result = {"data": [{"index": index, "embedding": [1.0, 0.0, 0.0]}
                               for index, _ in enumerate(inputs)]}
        elif self.path == "/chat/completions":
            result = {"choices": [{"finish_reason": "stop", "message": {
                "content": "Respuesta de prueba basada en el contexto recuperado."}}]}
        else:
            self.send_error(404)
            return
        data = json.dumps(result).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", 8090), Handler).serve_forever()
