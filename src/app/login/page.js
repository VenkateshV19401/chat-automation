"use client";

import InstagramIcon from "@mui/icons-material/Instagram";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";

const features = [
  { icon: <BoltRoundedIcon />, title: "Instant Replies", desc: "Auto-reply to comments the moment they appear" },
  { icon: <ChatBubbleOutlineRoundedIcon />, title: "DM Automation", desc: "Send personalized DMs to engaged followers" },
  { icon: <AutoAwesomeRoundedIcon />, title: "Smart Triggers", desc: "Match keywords with exact or contains logic" },
  { icon: <SendRoundedIcon />, title: "Multi-Channel", desc: "Reply via comments, DMs, or both at once" },
];

const stats = [
  { value: "10K+", label: "Replies Sent" },
  { value: "500+", label: "Automations" },
  { value: "99.9%", label: "Uptime" },
];

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const reason = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("reason") : null;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      window.localStorage.setItem("token", token);
      router.replace("/dashboard");
      return;
    }

    const savedToken = window.localStorage.getItem("token");
    if (savedToken) {
      router.replace("/dashboard");
      return;
    }

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
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: { xs: "column", md: "row" } }}>
      {/* Left Panel — Branding */}
      <Box
        sx={{
          flex: { xs: "0 0 auto", md: "0 0 50%" },
          background: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: { xs: 4, md: 8 },
          py: { xs: 6, md: 8 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decoration */}
        <Box sx={{ position: "absolute", top: -100, right: -100, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)" }} />
        <Box sx={{ position: "absolute", bottom: -80, left: -80, width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)" }} />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: "-0.5px" }}>
            Insta<span style={{ color: "#3b82f6" }}>Flow</span>
          </Typography>
          <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.6)", fontWeight: 400, mb: 5, maxWidth: 400 }}>
            Automate your Instagram engagement. Reply to comments and DMs on autopilot.
          </Typography>

          <Stack spacing={3} sx={{ mb: 6 }}>
            {features.map((f) => (
              <Stack key={f.title} direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(59,130,246,0.12)",
                    color: "#60a5fa",
                    flexShrink: 0,
                  }}
                >
                  {f.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}>{f.title}</Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem" }}>{f.desc}</Typography>
                </Box>
              </Stack>
            ))}
          </Stack>

          {/* Stats */}
          <Stack direction="row" spacing={4}>
            {stats.map((s) => (
              <Box key={s.label}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#fff" }}>{s.value}</Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.75rem" }}>{s.label}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Right Panel — Login */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f8f9fb",
          px: { xs: 3, md: 6 },
          py: { xs: 6, md: 8 },
        }}
      >
        <Box sx={{ width: "min(420px, 100%)" }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: "#0f172a" }}>
                Connect Instagram
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Use your Instagram Business or Creator account to connect to InstaFlow.
              </Typography>
            </Box>

            {reason === "session-expired" && (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                Your session expired. Please log in again.
              </Alert>
            )}

            <Box
              sx={{
                p: 4,
                borderRadius: 3,
                border: "1px solid rgba(0,0,0,0.08)",
                bgcolor: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <Stack spacing={3}>
                <Stack spacing={1.5}>
                  {[
                    "Set your permissions on Instagram",
                    "Your account will be linked to InstaFlow",
                    "Start automating in under 2 minutes",
                  ].map((text) => (
                    <Stack key={text} direction="row" spacing={1.5} alignItems="center">
                      <CheckCircleRoundedIcon sx={{ fontSize: 18, color: "#22c55e" }} />
                      <Typography variant="body2" sx={{ color: "#334155", fontSize: "0.85rem" }}>{text}</Typography>
                    </Stack>
                  ))}
                </Stack>

                <Button
                  href="/api/auth/login"
                  size="large"
                  startIcon={<InstagramIcon />}
                  sx={{
                    py: 1.6,
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                    color: "#fff",
                    borderRadius: 2.5,
                    textTransform: "none",
                    "&:hover": { background: "linear-gradient(135deg, #2563eb, #4f46e5)", boxShadow: "0 4px 12px rgba(59,130,246,0.3)" },
                  }}
                  variant="contained"
                  fullWidth
                >
                  Connect via Instagram
                </Button>
              </Stack>
            </Box>

            <Typography variant="caption" sx={{ color: "#94a3b8", textAlign: "center" }}>
              By continuing, you agree to our{" "}
              <a href="/terms" style={{ color: "#3b82f6", textDecoration: "none" }}>Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy" style={{ color: "#3b82f6", textDecoration: "none" }}>Privacy Policy</a>.
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
