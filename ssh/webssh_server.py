import asyncio
import json
import websockets
import paramiko
import threading
import socket

# SSH Server Class
class SimpleSSHServer(paramiko.ServerInterface):
    def __init__(self):
        self.event = threading.Event()

    def check_auth_password(self, username, password):
        if username == "testuser" and password == "testpass":  # Replace with your own logic
            return paramiko.AUTH_SUCCESSFUL
        return paramiko.AUTH_FAILED

    def get_allowed_auths(self, username):
        return 'password'

    def check_channel_request(self, kind, chanid):
        if kind == 'session':
            return paramiko.CHANNEL_OPEN_ACCEPTED
        return paramiko.CHANNEL_OPEN_REJECTED, None

async def handle_ssh_connection(websocket, path):
    print("WebSocket Client connected")
    try:
        async for message in websocket:
            data = json.loads(message)
            if data['type'] == 'connect':
                username = data['username']
                password = data['password']
                print(f"Attempting to connect as {username}")

                # Start SSH server in a separate thread
                threading.Thread(target=start_ssh_server, args=(websocket, username, password)).start()

    except websockets.exceptions.ConnectionClosed:
        print("WebSocket Client disconnected")

def start_ssh_server(websocket, username, password):
    server = SimpleSSHServer()
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(('localhost', 2222))  # Bind to localhost on port 2222
    sock.listen(100)
    
    print("SSH Server is running on port 2222")
    
    while True:
        try:
            client, addr = sock.accept()
            print(f"SSH connection from {addr}")
            
            transport = paramiko.Transport(client)
            transport.add_server_key(paramiko.RSAKey.generate(2048))
            transport.start_server(server=server)

            # Wait for a session
            channel = transport.accept(20)  # timeout in seconds
            if channel is None:
                continue

            channel.send("Welcome to the SSH server!\n")
            try:
                while True:
                    command = channel.recv(1024).decode('utf-8')
                    if not command:
                        break
                    response = f"You typed: {command}"
                    channel.send(response.encode('utf-8'))
            except Exception as e:
                print(f"Error in SSH session: {e}")
            finally:
                channel.close()
                transport.close()
                print(f"SSH connection from {addr} closed")

        except Exception as e:
            print(f"Error accepting SSH connection: {e}")

async def main():
    print("Starting WebSocket server...")
    websocket_server = websockets.serve(handle_ssh_connection, "localhost", 8080)
    await websocket_server
    print("WebSocket server started.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        print(f"Error starting WebSocket server: {e}")
