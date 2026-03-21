"use client";

import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
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
    if (!token) {
      router.push("/login");
      return;
    }

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
    return <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ minHeight: "100vh", px: { xs: 2, md: 6 }, py: 8 }}>
      <Stack spacing={2} alignItems="center" sx={{ mb: 6 }}>
        <Typography variant="overline" sx={{ color: "secondary.main", letterSpacing: 2 }}>Pricing</Typography>
        <Typography variant="h3" textAlign="center">Simple, transparent pricing</Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          Start free. Upgrade when you need more power.
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      <Stack direction={{ xs: "column", md: "row" }} spacing={3} justifyContent="center" alignItems="stretch">
        {plans.map((plan) => {
          const isPro = plan.id === "pro";
          const isFree = plan.id === "free";

          return (
            <Card
              key={plan.id}
              sx={{
                flex: 1,
                maxWidth: 360,
                position: "relative",
                border: isPro ? "2px solid" : "1px solid",
                borderColor: isPro ? "secondary.main" : "divider",
                background: isPro
                  ? "linear-gradient(135deg, rgba(245,133,41,0.08), rgba(129,52,175,0.12))"
                  : undefined,
              }}
            >
              {isPro && (
                <Box sx={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)" }}>
                  <Chip label="Most Popular" color="secondary" size="small" />
                </Box>
              )}
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h5">{plan.name}</Typography>
                    <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ mt: 1 }}>
                      <Typography variant="h3">${plan.priceUsd === 0 ? "0" : plan.priceUsd}</Typography>
                      {plan.priceUsd > 0 && <Typography variant="body2" color="text.secondary">/month</Typography>}
                    </Stack>
                  </Box>

                  <Divider />

                  <Stack spacing={1.5}>
                    {plan.features.map((feature) => (
                      <Stack key={feature} direction="row" spacing={1} alignItems="center">
                        <CheckRoundedIcon fontSize="small" sx={{ color: "secondary.main" }} />
                        <Typography variant="body2">{feature}</Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <Button
                    variant={isPro ? "contained" : "outlined"}
                    color={isPro ? "secondary" : "inherit"}
                    fullWidth
                    disabled={isFree || checkoutLoading === plan.id}
                    onClick={() => !isFree && handleUpgrade(plan.id)}
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

      <Stack alignItems="center" sx={{ mt: 6 }}>
        <Button variant="text" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </Stack>
    </Box>
  );
}
