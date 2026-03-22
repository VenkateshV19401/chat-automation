"use client";

import { Box, Button, Card, TextField, Typography, Alert } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("admin_token", data.token);
      router.replace("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f0f2f5" }}>
      <Card sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Admin Login</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>InstaFlow Dashboard</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleLogin}>
          <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} required />
          <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 3 }} required />
          <Button fullWidth variant="contained" type="submit" disabled={loading} sx={{ py: 1.2 }}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Card>
    </Box>
  );
}
