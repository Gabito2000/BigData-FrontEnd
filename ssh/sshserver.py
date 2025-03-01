import paramiko
import socket
import threading

class SimpleSSHServer(paramiko.ServerInterface):
    def __init__(self):
        self.event = threading.Event()

    def check_auth_password(self, username, password):
        if username == 'testuser' and password == 'testpass':
            return paramiko.AUTH_SUCCESSFUL
        return paramiko.AUTH_FAILED

    def get_allowed_auths(self, username):
        return 'password'

def handle_client(client_socket):
    transport = paramiko.Transport(client_socket)
    # Corrected line: Add a dot before RSAKey
    transport.add_server_key(paramiko.RSAKey.generate(2048))
    server = SimpleSSHServer()

    try:
        transport.start_server(server=server)

        # Wait for a client to connect
        channel = transport.accept(20)
        if channel is None:
            print("No channel.")
            return

        print("Client connected.")
        channel.send("Welcome to the SSH server!\n".encode())

        while True:
            command = channel.recv(1024).decode()
            if command.strip() == "exit":
                channel.send("Goodbye!\n".encode())
                break
            channel.send(f"Command received: {command}\n".encode())
    except Exception as e:
        print(f"Error: {e}")
    finally:
        transport.close()

def start_server(host='0.0.0.0', port=2222):
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind((host, port))
    server_socket.listen(5)
    print(f"Listening for connection on {host}:{port}...")

    while True:
        client_socket, addr = server_socket.accept()
        print(f"Connection from {addr}")
        client_handler = threading.Thread(target=handle_client, args=(client_socket,))
        client_handler.start()

if __name__ == "__main__":
    start_server()
