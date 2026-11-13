#!/usr/bin/env python3
"""
High-performance static server with full HTTP Range (206 Partial Content) support,
threaded concurrency, dual-stack IPv4/IPv6 support, and CORS enabled.
"""

import http.server
import socket
import contextlib
import os
import sys

DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'site')
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3000

class RangeHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Range, Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_head(self):
        if 'Range' not in self.headers:
            self.range = None
            return super().send_head()

        path = self.translate_path(self.path)
        f = None
        try:
            f = open(path, 'rb')
        except OSError:
            self.send_error(404, 'File not found')
            return None

        fs = os.fstat(f.fileno())
        total_len = fs.st_size

        range_header = self.headers['Range'].strip()
        if not range_header.startswith('bytes='):
            self.send_error(400, 'Bad Request')
            f.close()
            return None

        range_val = range_header[6:]
        parts = range_val.split('-')
        start = int(parts[0]) if parts[0] else 0
        end = int(parts[1]) if len(parts) > 1 and parts[1] else total_len - 1

        if start >= total_len or end >= total_len or start > end:
            self.send_error(416, 'Requested Range Not Satisfiable')
            self.send_header('Content-Range', f'bytes */{total_len}')
            self.end_headers()
            f.close()
            return None

        self.send_response(206)
        ctype = self.guess_type(path)
        self.send_header('Content-type', ctype)
        self.send_header('Content-Range', f'bytes {start}-{end}/{total_len}')
        self.send_header('Content-Length', str(end - start + 1))
        self.send_header('Last-Modified', self.date_time_string(fs.st_mtime))
        self.end_headers()

        f.seek(start)
        self.range = (start, end)
        return f

    def copyfile(self, source, outputfile):
        if not hasattr(self, 'range') or not self.range:
            return super().copyfile(source, outputfile)
        
        start, end = self.range
        bytes_to_send = end - start + 1
        buffer_size = 64 * 1024
        
        while bytes_to_send > 0:
            read_len = min(bytes_to_send, buffer_size)
            buf = source.read(read_len)
            if not buf:
                break
            outputfile.write(buf)
            bytes_to_send -= len(buf)

def run_server():
    server = None
    if hasattr(socket, 'has_dualstack_ipv6') and socket.has_dualstack_ipv6():
        try:
            class DualStackServer(http.server.ThreadingHTTPServer):
                address_family = socket.AF_INET6
                def server_bind(self):
                    with contextlib.suppress(Exception):
                        self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
                    return super().server_bind()
            server = DualStackServer(('', PORT), RangeHTTPRequestHandler)
        except Exception:
            server = None

    if server is None:
        class ThreadedServer(http.server.ThreadingHTTPServer):
            pass
        server = ThreadedServer(('', PORT), RangeHTTPRequestHandler)

    with server as httpd:
        print(f'Serving HTTP on port {PORT} from {DIRECTORY}...')
        print(f'Ready at http://localhost:{PORT}/ and http://127.0.0.1:{PORT}/')
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\nServer stopped.')

if __name__ == '__main__':
    run_server()
