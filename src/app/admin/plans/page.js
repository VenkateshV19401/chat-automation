"use client";

import {
  Alert, Box, Button, Card, CardContent, Chip, Divider, Grid,
  IconButton, Snackbar, Stack, Switch, TextField, Typography, CircularProgress,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { useEffect, useState } from "react";

function PlanCard({ plan, onChange, onRemoveFeature, onAddFeature }) {
  const isUnlimited = (val) => val === -1;

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{plan.name}</Typography>
          <Chip label={plan.planId.toUpperCase()} size="small" color={plan.planId === "free" ? "default" : plan.planId === "pro" ? "primary" : "secondary"} />
        </Stack>

        <TextField
          fullWidth label="Plan Name" size="small" value={plan.name}
          onChange={(e) => onChange("name", e.target.value)} sx={{ mb: 2 }}
        />

        <TextField
          fullWidth label="Price (INR/month)" size="small" type="number" value={plan.priceInr}
          onChange={(e) => onChange("priceInr", Number(e.target.value))} sx={{ mb: 2 }}
        />

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            fullWidth size="small"
            label={isUnlimited(plan.maxAutomations) ? "Max Automations (Unlimited)" : "Max Automations"}
            type="number"
            value={isUnlimited(plan.maxAutomations) ? -1 : plan.maxAutomations}
            onChange={(e) => onChange("maxAutomations", Number(e.target.value))}
            helperText="Use -1 for unlimited"
          />
          <TextField
            fullWidth size="small"
            label={isUnlimited(plan.maxRepliesPerMonth) ? "Max Replies/Month (Unlimited)" : "Max Replies/Month"}
            type="number"
            value={isUnlimited(plan.maxRepliesPerMonth) ? -1 : plan.maxRepliesPerMonth}
            onChange={(e) => onChange("maxRepliesPerMonth", Number(e.target.value))}
            helperText="Use -1 for unlimited"
          />
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Switch checked={plan.canSendDM} onChange={(e) => onChange("canSendDM", e.target.checked)} size="small" />
          <Typography variant="body2">Can Send DMs</Typography>
        </Stack>

        <TextField
          fullWidth label="Stripe Price ID" size="small" value={plan.stripePriceId || ""}
          onChange={(e) => onChange("stripePriceId", e.target.value)} sx={{ mb: 2 }}
          placeholder="price_..."
        />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Features (shown on pricing page)</Typography>
        {plan.features.map((feature, idx) => (
          <Stack key={idx} direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <TextField
              fullWidth size="small" value={feature}
              onChange={(e) => {
                const updated = [...plan.features];
                updated[idx] = e.target.value;
                onChange("features", updated);
              }}
            />
            <IconButton size="small" color="error" onClick={() => onRemoveFeature(idx)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
        <Button size="small" startIcon={<AddRoundedIcon />} onClick={onAddFeature} sx={{ mt: 0.5 }}>
          Add Feature
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/plans", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to load plans");
        setPlans(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (planIdx, field, value) => {
    setPlans((prev) => {
      const updated = [...prev];
      updated[planIdx] = { ...updated[planIdx], [field]: value };
      return updated;
    });
  };

  const handleRemoveFeature = (planIdx, featureIdx) => {
    setPlans((prev) => {
      const updated = [...prev];
      updated[planIdx] = {
        ...updated[planIdx],
        features: updated[planIdx].features.filter((_, i) => i !== featureIdx),
      };
      return updated;
    });
  };

  const handleAddFeature = (planIdx) => {
    setPlans((prev) => {
      const updated = [...prev];
      updated[planIdx] = {
        ...updated[planIdx],
        features: [...updated[planIdx].features, ""],
      };
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(plans),
      });
      if (!res.ok) throw new Error("Failed to save plans");
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: "grid", placeItems: "center", minHeight: 400 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Plans</Typography>
          <Typography variant="body2" color="text.secondary">Modify plan limits, pricing, and features</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveRoundedIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {plans.map((plan, idx) => (
          <Grid item xs={12} md={4} key={plan.planId}>
            <PlanCard
              plan={plan}
              onChange={(field, value) => handleChange(idx, field, value)}
              onRemoveFeature={(featureIdx) => handleRemoveFeature(idx, featureIdx)}
              onAddFeature={() => handleAddFeature(idx)}
            />
          </Grid>
        ))}
      </Grid>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)} message="Plans saved successfully" />
    </Box>
  );
}
