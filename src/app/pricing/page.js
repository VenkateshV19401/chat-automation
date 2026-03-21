"use client";

import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createCheckoutSession, getPlans } from "../../lib/api";

export default function PricingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getPlans()
      .then((res) => setPlans(res.data))
      .catch(() => setError("Failed to load plans"))
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async (planId) => {
    const token = window.localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    setCheckoutLoading(planId);
    setError("");
    try {
      const res = await createCheckoutSession(planId);
      window.location.href = res.data.url;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to start checkout");
      setCheckoutLoading("");
    }
  };

  if (loading) {
    return <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}><CircularProgress size={32} /></Box>;
  }

  return (
    <Box sx={{ minHeight: "100vh", px: { xs: 2, md: 6 }, py: 6, maxWidth: 1100, mx: "auto" }}>
      <Button
        startIcon={<ArrowBackRoundedIcon />}
        onClick={() => router.push("/dashboard")}
        sx={{ mb: 4, color: "text.secondary" }}
      >
        Back to Dashboard
      </Button>

      <Stack spacing={1.5} sx={{ mb: 6 }}>
        <Typography variant="h3">Choose your plan</Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 480 }}>
          Start free, upgrade when you need more automations and replies.
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError("")}>{error}</Alert>}

      <Stack direction={{ xs: "column", md: "row" }} spacing={2.5} alignItems="stretch">
        {plans.map((plan) => {
          const isPro = plan.id === "pro";
          const isFree = plan.id === "free";

          return (
            <Card
              key={plan.id}
              sx={{
                flex: 1,
                position: "relative",
                borderColor: isPro ? "primary.main" : "divider",
                bgcolor: isPro ? "rgba(59,130,246,0.03)" : "#fff",
                boxShadow: isPro ? "0 4px 24px rgba(59,130,246,0.1)" : "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              {isPro && (
                <Box sx={{ position: "absolute", top: -12, left: 24 }}>
                  <Chip
                    label="RECOMMENDED"
                    size="small"
                    sx={{ bgcolor: "primary.main", color: "#fff", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.05em" }}
                  />
                </Box>
              )}
              <CardContent sx={{ p: 3.5 }}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="overline" sx={{ color: "text.secondary" }}>{plan.name}</Typography>
                    <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ mt: 0.5 }}>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {plan.priceInr === 0 ? "Free" : `\u20B9${plan.priceInr}`}
                      </Typography>
                      {plan.priceInr > 0 && (
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>/month</Typography>
                      )}
                    </Stack>
                  </Box>

                  <Stack spacing={1.5}>
                    {plan.features.map((feature) => (
                      <Stack key={feature} direction="row" spacing={1.5} alignItems="center">
                        <CheckRoundedIcon sx={{ fontSize: 18, color: isPro ? "primary.main" : "success.main" }} />
                        <Typography variant="body2" sx={{ color: "text.primary" }}>{feature}</Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <Button
                    variant={isPro ? "contained" : "outlined"}
                    fullWidth
                    disabled={isFree || checkoutLoading === plan.id}
                    onClick={() => !isFree && handleUpgrade(plan.id)}
                    sx={{ py: 1.2 }}
                  >
                    {checkoutLoading === plan.id
                      ? <CircularProgress size={20} />
                      : isFree
                      ? "Current Plan"
                      : `Upgrade to ${plan.name}`}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}
