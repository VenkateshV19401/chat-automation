"use client";

import InstagramIcon from "@mui/icons-material/Instagram";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";

const features = [
  { icon: <BoltRoundedIcon sx={{ fontSize: 20 }} />, title: "Instant Replies", desc: "Auto-reply to comments in seconds" },
  { icon: <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 20 }} />, title: "DM Automation", desc: "Send personalized DMs automatically" },
  { icon: <AutoAwesomeRoundedIcon sx={{ fontSize: 20 }} />, title: "Smart Triggers", desc: "Match keywords with exact or fuzzy logic" },
];

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const reason = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("reason") : null;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    // Fresh login — token in URL from OAuth callback
    if (token) {
      window.localStorage.setItem("token", token);
      router.replace("/dashboard");
      return;
    }

    // Already has a valid token
    const savedToken = window.localStorage.getItem("token");
    if (savedToken) {
      router.replace("/dashboard");
      return;
    }

    // No token in localStorage — try silent refresh via cookie
    if (reason !== "session-expired") {
      api.post("/auth/refresh")
        .then((res) => {
          const newToken = res.data?.token;
          if (newToken) {
            window.localStorage.setItem("token", newToken);
            router.replace("/dashboard");
          } else {
            setChecking(false);
          }
        })
        .catch(() => {
          setChecking(false);
        });
    } else {
      setChecking(false);
    }
  }, [router, reason]);

  if (checking) {
    return <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "#f8f9fb" }}><CircularProgress size={32} /></Box>;
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", px: 2, bgcolor: "#f8f9fb" }}>
      <Box sx={{ width: "min(480px, 100%)" }}>
        <Stack spacing={4} alignItems="center" textAlign="center">
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Insta<span style={{ color: "#3b82f6" }}>Flow</span>
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 360, mx: "auto" }}>
              Automate your Instagram engagement. Reply to comments and DMs on autopilot.
            </Typography>
          </Box>

          {reason === "session-expired" && (
            <Alert severity="warning" sx={{ width: "100%" }}>
              Your session expired. Please log in again.
            </Alert>
          )}

          <Box
            sx={{
              width: "100%",
              p: 4,
              borderRadius: 3,
              border: "1px solid rgba(0,0,0,0.08)",
              bgcolor: "#fff",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            <Stack spacing={3}>
              <Stack spacing={2.5}>
                {features.map((f) => (
                  <Stack key={f.title} direction="row" spacing={2} alignItems="flex-start" sx={{ textAlign: "left" }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: "rgba(59,130,246,0.08)", color: "primary.main", display: "flex" }}>
                      {f.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: "text.primary" }}>{f.title}</Typography>
                      <Typography variant="body2">{f.desc}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>

              <Button
                href="/api/auth/login"
                size="large"
                startIcon={<InstagramIcon />}
                sx={{
                  py: 1.5,
                  fontSize: "0.95rem",
                  background: "linear-gradient(135deg, #3b82f6, #ec4899)",
                  color: "#fff",
                  "&:hover": { background: "linear-gradient(135deg, #2563eb, #db2777)" },
                }}
                variant="contained"
                fullWidth
              >
                Continue with Instagram
              </Button>

              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
