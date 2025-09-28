#!/usr/bin/env python
"""
Simple standalone server to test if the mobile app can connect
Run with: python simple_auth_test.py
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from datetime import datetime, timedelta
import base64
from io import BytesIO
import qrcode

class AuthHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        """Override to add timestamp to logs"""
        print(f"{datetime.now()} - {self.address_string()} - {format%args}")
    def do_GET(self):
        if self.path == '/api/auth/me':
            # Extract username from Authorization header if present
            auth_header = self.headers.get('Authorization', '')
            username = 'testuser'  # default
            
            if auth_header.startswith('Bearer mock-token-'):
                # Extract username from token
                username = auth_header.replace('Bearer mock-token-', '').split('-')[0]
            
            # Return current user info based on token
            response = {
                "id": f"user-{username}-123",
                "username": username,
                "email": f"{username}@example.com",
                "first_name": username.capitalize(),
                "last_name": "User",
                "user_type": "volunteer",
                "is_verified": True,
                "profile_picture": None,
                "zip_code": "10001"
            }
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            
        elif self.path == '/api/users/verification-status':
            # Return verification status
            response = {
                "is_verified": True,
                "verification_date": "2025-01-01T00:00:00Z",
                "verification_method": "id_verification"
            }
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            
        elif self.path == '/api/opportunities/featured':
            # Return featured opportunities
            response = []
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            
        elif '/qr-code' in self.path and self.path.startswith('/api/tickets/'):
            # Extract ticket ID from path like /api/tickets/{ticket_id}/qr-code
            parts = self.path.split('/')
            if len(parts) >= 5 and parts[4] == 'qr-code':
                ticket_id = parts[3]
                # For now, use the ticket_id as the QR data
                # In production, this would generate a secure token
                qr_data = f"MISHMOB-{ticket_id}-{datetime.now().strftime('%H%M%S')}"
            else:
                qr_data = "INVALID-TICKET"
            
            print(f"Generating QR code for: {qr_data}")
            print(f"Current time: {datetime.now().isoformat()}")
            
            # Create QR code with the exact data received
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(qr_data)
            qr.make(fit=True)
            
            # Create image
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            img_str = base64.b64encode(buffer.getvalue()).decode()
            
            response = {
                "qr_code_base64": f"data:image/png;base64,{img_str}",
                "expires_at": (datetime.now() + timedelta(seconds=30)).isoformat(),
                "valid_seconds": 30
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            
        else:
            print(f"GET request for unknown path: {self.path}")
            self.send_error(404, "Not Found")
    
    def do_POST(self):
        if self.path == '/api/auth/login':
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body)
            
            print(f"Login request: {data}")
            
            # Simple auth check - accept any username/password for testing
            username = data.get('username')
            password = data.get('password')
            
            if username and password:
                # Accept any credentials for testing
                response = {
                    "access_token": f"mock-token-{username}",
                    "token_type": "bearer",
                    "user_id": f"user-{username}-123",
                    "username": username,
                    "email": f"{username}@example.com",
                    "user_type": "volunteer"
                }
                self.send_response(200)
                print(f"Login successful for user: {username}")
            else:
                response = {"error": "Invalid credentials"}
                self.send_response(401)
                
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            
        elif self.path == '/api/auth/logout':
            response = {"message": "Successfully logged out"}
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', 8090), AuthHandler)
    print('Starting simple auth server on port 8090...')
    server.serve_forever()