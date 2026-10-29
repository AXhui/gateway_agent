#!/usr/bin/env python3
"""
Figma 插件本地桥接小助手。
跑在设计师电脑上，监听 http://localhost:7777。

端点：
  GET /list                       → 返回 GitHub 上的 figma-html-list.json
  GET /download?file_token=xxx    → 用 lark-cli 从飞书云盘下载 HTML，返回内容
  GET /health                     → 健康检查

用法：
  python tools/html_bridge.py
  保持窗口开着，然后在 Figma 插件里点「刷新 HTML 列表」。
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

GITHUB_RAW_LIST = "https://raw.githubusercontent.com/AXhui/gateway_agent/main/figma-html-list.json"
PORT = 7777


def resolve_lark_cli():
    for candidate in (
        os.environ.get("LARK_CLI"),
        shutil.which("lark-cli"),
        shutil.which("lark-cli.cmd"),
        os.path.expandvars(r"%APPDATA%\npm\lark-cli.cmd"),
    ):
        if candidate and os.path.isfile(candidate):
            return candidate
    return "lark-cli"


class Handler(BaseHTTPRequestHandler):
    def _send(self, code, body, content_type="application/json; charset=utf-8"):
        if isinstance(body, str):
            body = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send(204, b"")

    def do_GET(self):
        parsed = urlparse(self.path)
        qs = parse_qs(parsed.query)

        if parsed.path == "/health":
            return self._send(200, json.dumps({"ok": True, "service": "html-bridge"}))

        if parsed.path == "/list":
            try:
                with urllib.request.urlopen(GITHUB_RAW_LIST, timeout=10) as resp:
                    data = resp.read().decode("utf-8")
                return self._send(200, data)
            except Exception as e:
                return self._send(502, json.dumps({"error": f"拉取清单失败: {e}"}))

        if parsed.path == "/download":
            file_token = (qs.get("file_token") or [""])[0]
            file_name = (qs.get("file_name") or ["demo.html"])[0]
            if not file_token:
                return self._send(400, json.dumps({"error": "缺少 file_token"}))
            try:
                tmp_dir = tempfile.gettempdir()
                out_path = os.path.join(tmp_dir, f"figma_{file_name}")
                cli = resolve_lark_cli()
                cmd = [cli, "drive", "+download",
                       "--file-token", file_token,
                       "--output", out_path,
                       "--overwrite",
                       "--as", "user"]
                r = subprocess.run(cmd, capture_output=True, text=True,
                                   timeout=120, encoding="utf-8", errors="replace")
                if r.returncode != 0 or not os.path.isfile(out_path):
                    return self._send(500, json.dumps({
                        "error": f"下载失败: {(r.stderr or r.stdout)[:300]}"
                    }))
                with open(out_path, "r", encoding="utf-8", errors="replace") as f:
                    html = f.read()
                try:
                    os.remove(out_path)
                except Exception:
                    pass
                return self._send(200, html, content_type="text/html; charset=utf-8")
            except Exception as e:
                return self._send(500, json.dumps({"error": str(e)}))

        return self._send(404, json.dumps({"error": "not found"}))

    def log_message(self, fmt, *args):
        print(f"[html-bridge] {self.address_string()} - {fmt % args}")


def main():
    print(f"[html-bridge] 启动在 http://localhost:{PORT}")
    print(f"[html-bridge] 清单来源: {GITHUB_RAW_LIST}")
    print(f"[html-bridge] lark-cli: {resolve_lark_cli()}")
    print("[html-bridge] 保持本窗口开着，去 Figma 插件点「刷新 HTML 列表」")
    server = HTTPServer(("127.0.0.1", PORT), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[html-bridge] 已停止")


if __name__ == "__main__":
    main()
