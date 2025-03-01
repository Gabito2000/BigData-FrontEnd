import asyncio
import websockets
import paramiko
import socket
import threading
import json

# Updated SSH server interface with explicit session handling
class SimpleSSHServer(paramiko.ServerInterface):
    def __init__(self):
        self.event = threading.Event()

    def check_auth_password(self, username, password):
        if username == 'testuser' and password == 'testpass':
            return paramiko.AUTH_SUCCESSFUL
        return paramiko.AUTH_FAILED

    def get_allowed_auths(self, username):
        return 'password'

    # Explicitly allow session requests to avoid "administratively prohibited" errors
    def check_channel_request(self, kind, chanid):
        if kind == 'session':
            return paramiko.OPEN_SUCCEEDED
        return paramiko.OPEN_FAILED_ADMINISTRATIVELY_PROHIBITED

def handle_ssh_client(client_socket):
    transport = paramiko.Transport(client_socket)
    transport.add_server_key(paramiko.RSAKey.generate(2048))
    server = SimpleSSHServer()

    try:
        transport.start_server(server=server)
        channel = transport.accept(20)  # Adjusted timeout to wait for channel
        if channel is None:
            print("No channel.")
            return

        print("SSH client connected.")
        channel.send("Welcome to the SSH server!\n".encode())

        while True:
            try:
                if channel.recv_ready():
                    command = channel.recv(1024).decode()
                    if command.strip() == "exit":
                        channel.send("Goodbye!\n".encode())
                        break
                    channel.send(f"Command received: {command}\n".encode())
            except Exception as e:
                print(f"Error handling SSH command: {e}")
                break
    except Exception as e:
        print(f"SSH Error: {e}")
    finally:
        transport.close()

# WebSocket server code
async def handle_websocket_client(websocket, path):
    try:
        # Receive initial connection message
        message = await websocket.recv()
        data = json.loads(message)

        if data['type'] == 'connect':
            username = 'testuser'
            password = 'testpass'

            # Create socket to SSH server
            ssh_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            ssh_socket.connect(('localhost', 2222))

            # Start transport and authenticate
            transport = paramiko.Transport(ssh_socket)
            transport.start_client()

            # Authenticate
            transport.auth_password(username, password)

            # Attempt to open channel
            try:
                channel = transport.open_session()
                channel.get_pty()
                channel.invoke_shell()
            except paramiko.SSHException as e:
                print(f"Failed to open channel: {e}")
                await websocket.send(json.dumps({"type": "connection", "status": "failed", "message": "Unable to open SSH channel"}))
                return

            await websocket.send(json.dumps({"type": "connection", "status": "success"}))

            # Bidirectional communication
            async def send_ssh_output():
                while channel and not channel.closed:
                    if channel.recv_ready():
                        output = channel.recv(1024).decode('utf-8')
                        await websocket.send(json.dumps({"type": "output", "data": output}))
                    await asyncio.sleep(0.1)

            async def receive_user_input():
                while True:
                    try:
                        message = await websocket.recv()
                        data = json.loads(message)
                        if data['type'] == 'input':
                            channel.send(data['data'])
                    except websockets.ConnectionClosed:
                        print("WebSocket connection closed by client.")
                        break

            await asyncio.gather(send_ssh_output(), receive_user_input())

    except websockets.ConnectionClosed:
        print("WebSocket connection closed")
    finally:
        if 'channel' in locals() and channel:
            channel.close()
        if 'transport' in locals() and transport:
            transport.close()

async def start_websocket_server():
    server = await websockets.serve(handle_websocket_client, "localhost", 8080)
    print("WebSocket server started on ws://localhost:8080")
    await server.wait_closed()

def start_ssh_server(host='localhost', port=2222):
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind((host, port))
    server_socket.listen(5)
    print(f"SSH server listening for connection on {host}:{port}...")

    while True:
        client_socket, addr = server_socket.accept()
        print(f"SSH connection from {addr}")
        client_handler = threading.Thread(target=handle_ssh_client, args=(client_socket,))
        client_handler.start()

if __name__ == "__main__":
    # Start SSH server in a separate thread
    ssh_thread = threading.Thread(target=start_ssh_server)
    ssh_thread.start()

    # Start WebSocket server in the main thread
    asyncio.run(start_websocket_server())
