import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: username, password }),
      });
      if (!res.ok) {
        setError("Invalid credentials");
        return;
      }
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      navigate("/business-intelligence"); // Redirect to home
    } catch (err) {
      setError("Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-96 border border-blue-200 flex flex-col items-center"
      >
        <div className="flex flex-col items-center mb-6">
          <img src="/vite.svg" alt="Logo" className="w-16 h-16 mb-2 drop-shadow-lg" />
          <h2 className="text-2xl font-extrabold text-blue-700 mb-1 tracking-tight">Bienvenido</h2>
          <p className="text-sm text-gray-500">Iniciá sesión para continuar</p>
        </div>
        <Input
          placeholder="Usuario"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="mb-3 focus:ring-2 focus:ring-blue-400"
        />
        <Input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="mb-4 focus:ring-2 focus:ring-blue-400"
        />
        {error && <div className="text-red-500 mb-3 text-center w-full">{error}</div>}
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors shadow-md"
        >
          Ingresar
        </Button>
      </form>
    </div>
  );
}
