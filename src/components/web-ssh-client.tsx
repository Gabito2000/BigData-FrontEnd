import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export function WebSshClient() {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const [term, setTerm] = useState<Terminal | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const username = "testuser"; // Hardcoded username
  const password = "testpass"; // Hardcoded password
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize the terminal only when connected
    if (connected && terminalRef.current) {
      const terminal = new Terminal({
        cursorBlink: true,
        cursorStyle: "block",
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        rows: 20,
      });
      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);
      terminal.open(terminalRef.current);
      fitAddon.fit();
      setTerm(terminal);

      terminal.writeln("Welcome to the terminal!"); // Optional welcome message
      terminal.writeln("Type 'exit' to disconnect."); // Inform user how to disconnect

      // Handle input data from terminal
      terminal.onData((data) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "input", data }));
        }
      });

      // Cleanup on unmount
      return () => {
        terminal.dispose();
      };
    }
  }, [connected]);

  const handleConnect = () => {
    setLoading(true);
    console.log("Connecting to SSH server...");
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("WebSocket connection established");
      ws.send(JSON.stringify({ type: "connect", username, password }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Message received from server:", data); // Log the received message

      if (data.type === "output" && term) {
        term.write(data.data);
      } else if (data.type === "connection") {
        console.log("Connection message received:", data); // Debugging line
        if (data.status === "success") {
          console.log("Connection established, opening terminal...");
          setConnected(true); // Set connected state to true
        } else {
          console.error("Failed to connect: " + data.message);
          setConnected(false);
        }
      }
      setLoading(false);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setConnected(false);
      if (term) term.writeln("Disconnected from SSH server");
      setLoading(false);
    };

    setSocket(ws);
  };

  const handleDisconnect = () => {
    if (socket) {
      socket.close();
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>WebSSH Client</CardTitle>
        <CardDescription>Connect to SSH server via WebSSH</CardDescription>
      </CardHeader>
      <CardContent>
        {!connected ? (
          <div className="space-y-4">
            <Button onClick={handleConnect} disabled={loading}>
              {loading ? "Connecting..." : "Connect"}
            </Button>
          </div>
        ) : (
          <>
            <div
              ref={terminalRef}
              className="h-[400px] bg-black rounded-md overflow-hidden mb-4"
            />
            <Button onClick={handleDisconnect}>Disconnect</Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
