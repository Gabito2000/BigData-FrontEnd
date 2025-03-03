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
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import axios from 'axios';

export function SSHTerminal() {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const [term, setTerm] = useState<Terminal | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState("testuser");
  const [password, setPassword] = useState("testpass");
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<"checking" | "running" | "stopped">("checking");

  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      setServerStatus("checking");
      const response = await axios.get("http://localhost:8000/api/check-ssh-server");
      setServerStatus(response.data.running ? "running" : "stopped");
    } catch (error) {
      console.error("Error checking SSH server status:", error);
      setServerStatus("stopped");
    }
  };

  const startServer = async () => {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:8000/api/start-ssh-server");
      if (response.data.success) {
        setServerStatus("running");
      } else {
        console.error("Failed to start SSH server:", response.data.message);
      }
    } catch (error) {
      console.error("Error starting SSH server:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize the terminal only when connected
    if (connected && terminalRef.current) {
      const terminal = new Terminal({
        cursorBlink: true,
        cursorStyle: "block",
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        rows: 24,
        cols: 80,
        theme: {
          background: "#1e1e1e",
          foreground: "#f0f0f0",
          cursor: "#ffffff",
          selectionBackground: "rgba(255, 255, 255, 0.3)",
        }
      });
      
      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);
      terminal.open(terminalRef.current);
      fitAddon.fit();
      setTerm(terminal);

      terminal.writeln("Connected to SSH server");
      terminal.writeln("Type 'exit' to disconnect");

      // Handle input data from terminal
      terminal.onData((data) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "input", data }));
        }
      });

      // Handle window resize
      const handleResize = () => {
        if (fitAddon) {
          fitAddon.fit();
        }
      };
      
      window.addEventListener('resize', handleResize);

      // Cleanup on unmount
      return () => {
        terminal.dispose();
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [connected, socket]);

  const handleConnect = () => {
    setLoading(true);
    
    try {
      const ws = new WebSocket("ws://localhost:8080");

      ws.onopen = () => {
        console.log("WebSocket connection established");
        ws.send(JSON.stringify({ type: "connect", username, password }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === "output" && term) {
          term.write(data.data);
        } else if (data.type === "connection") {
          if (data.status === "success") {
            setConnected(true);
          } else {
            console.error("Failed to connect:", data.message);
            setConnected(false);
          }
        }
        setLoading(false);
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed");
        setConnected(false);
        if (term) term.writeln("\r\nDisconnected from SSH server");
        setLoading(false);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnected(false);
        setLoading(false);
      };

      setSocket(ws);
    } catch (error) {
      console.error("Error connecting to SSH server:", error);
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    if (socket) {
      socket.close();
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>SSH Terminal</CardTitle>
        <CardDescription>Connect to remote server via SSH</CardDescription>
      </CardHeader>
      <CardContent>
        {serverStatus === "stopped" && (
          <div className="mb-4">
            <Button onClick={startServer} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting server...
                </>
              ) : (
                "Start SSH Server"
              )}
            </Button>
          </div>
        )}

        {serverStatus === "checking" && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Checking server status...</span>
          </div>
        )}

        {serverStatus === "running" && !connected && (
          <div className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleConnect} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </div>
        )}

        {connected && (
          <>
            <div
              ref={terminalRef}
              className="h-[500px] bg-[#1e1e1e] rounded-md overflow-hidden mb-4"
            />
            <Button onClick={handleDisconnect} variant="destructive">
              Disconnect
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}