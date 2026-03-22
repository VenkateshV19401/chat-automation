"use client";

import { Box, Card, CardContent, Grid, Typography, CircularProgress, Alert } from "@mui/material";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import { useEffect, useState } from "react";

function StatCard({ title, value, icon, color }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{title}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{value}</Typography>
          </Box>
          <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: `${color}14` }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to load stats");
        setStats(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Box sx={{ display: "grid", placeItems: "center", minHeight: 400 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Dashboard Overview</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Monitor your InstaFlow platform</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Users" value={stats.totalUsers} icon={<PeopleRoundedIcon sx={{ color: "#3b82f6" }} />} color="#3b82f6" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="New Users (7d)" value={stats.newUsersThisWeek} icon={<PersonAddRoundedIcon sx={{ color: "#10b981" }} />} color="#10b981" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Replies This Month" value={stats.totalRepliesThisMonth} icon={<ReplyRoundedIcon sx={{ color: "#ec4899" }} />} color="#ec4899" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Automations" value={stats.totalAutomations} icon={<SmartToyRoundedIcon sx={{ color: "#f59e0b" }} />} color="#f59e0b" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Active Automations" value={stats.activeAutomations} icon={<TrendingUpRoundedIcon sx={{ color: "#8b5cf6" }} />} color="#8b5cf6" />
        </Grid>
      </Grid>

      <Card sx={{ mt: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Plan Breakdown</Typography>
          <Grid container spacing={2}>
            {Object.entries(stats.planBreakdown).map(([plan, count]) => (
              <Grid item xs={6} sm={4} md={3} key={plan}>
                <Box sx={{ p: 2, bgcolor: "#f8f9fb", borderRadius: 2, textAlign: "center" }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{count}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textTransform: "capitalize" }}>{plan || "free"}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
