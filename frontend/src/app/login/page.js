"use client";

import InstagramIcon from "@mui/icons-material/Instagram";
import { Alert, Box, Button, Card, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const reason =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("reason")
      : null;

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
    }
  }, [router]);

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2 }}>
      <Card sx={{ width: "min(520px, 100%)", p: 4, background: "linear-gradient(180deg, rgba(17,24,39,0.9), rgba(17,24,39,0.72))" }}>
        <Stack spacing={3}>
          {reason === "session-expired" ? (
            <Alert severity="warning">
              Your Instagram session expired. Please log in again to continue.
            </Alert>
          ) : null}
          <Box>
            <Typography variant="overline" sx={{ color: "secondary.main", letterSpacing: 2 }}>Instagram Automation</Typography>
            <Typography variant="h3" sx={{ mt: 1 }}>Login with Instagram</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5 }}>
              Connect your Instagram account, load your posts and reels, and automate replies with a polished MUI dashboard.
            </Typography>
          </Box>
          <Button
            href={`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}/auth/login`}
            size="large"
            startIcon={<InstagramIcon />}
            sx={{ py: 1.6, background: "linear-gradient(90deg, #f58529, #dd2a7b, #8134af)" }}
            variant="contained"
          >
            Continue with Instagram
          </Button>
        </Stack>
      </Card>
    </Box>
  );
}
