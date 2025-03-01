import asyncio
import websockets
import paramiko
import json

async def handle_ssh_connection(websocket, path):
    try:
        # Wait for the initial connection message
        message = await websocket.recv()
        data = json.loads(message)

        if data['type'] == 'connect':
            # Extract connection details
            host = data['host']
            port = int(data['port'])
            username = data['username']
            password = data['password']

            # Create SSH client
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

            try:
                # Connect to the SSH server
                ssh.connect(hostname=host, port=port, username=username, password=password)
                await websocket.send(json.dumps({"type": "connection", "status": "success"}))

                # Create an interactive shell
                channel = ssh.invoke_shell()

                # Handle bidirectional communication
                async def send_ssh_output():
                    while True:
                        if channel.recv_ready():
                            output = channel.recv(1024).decode('utf-8')
                            await websocket.send(json.dumps({"type": "output", "data": output}))
                        await asyncio.sleep(0.1)

                async def receive_user_input():
                    while True:
                        message = await websocket.recv()
                        data = json.loads(message)
                        if data['type'] == 'input':
                            channel.send(data['data'])

                # Run both tasks concurrently
                await asyncio.gather(send_ssh_output(), receive_user_input())

            except Exception as e:
                await websocket.send(json.dumps({"type": "connection", "status": "failed", "message": str(e)}))
            finally:
                ssh.close()

    except websockets.exceptions.ConnectionClosed:
        print("WebSocket connection closed")

async def main():
    server = await websockets.serve(handle_ssh_connection, "localhost", 8080)
    print("WebSSH server started on ws://localhost:8080")
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())