"use client";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Switch,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { deleteAutomation, getAutomations, getMe, getMedia, getUsage, createPortalSession, logoutSession, toggleAutomation } from "../../lib/api";

function MediaCard({ item, automated, onSelect }) {
  const image = item.thumbnail_url || item.media_url;

  return (
    <Card onClick={() => onSelect(item)} sx={{ cursor: "pointer", overflow: "hidden", position: "relative" }}>
      <Box sx={{ position: "absolute", top: 12, left: 12, zIndex: 2 }}>
        <Chip label={automated ? "Automated" : item.media_type || "Media"} color={automated ? "secondary" : "default"} size="small" />
      </Box>
      {image ? (
        <CardMedia component="img" image={image} sx={{ aspectRatio: "9 / 12", objectFit: "cover" }} />
      ) : (
        <Box sx={{ aspectRatio: "9 / 12", display: "grid", placeItems: "center", bgcolor: "rgba(255,255,255,0.05)" }}>
          <SmartToyRoundedIcon />
        </Box>
      )}
      <CardContent>
        <Typography variant="subtitle1" noWrap>{item.media_type || "Post"}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 42 }}>
          {item.caption || "No caption available"}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [media, setMedia] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [usage, setUsage] = useState(null);
  const [mainTab, setMainTab] = useState(0);
  const [error, setError] = useState("");

  const automationByMediaId = useMemo(() => new Map(automations.map((item) => [item.targetMediaId, item])), [automations]);

  useEffect(() => {
    const token = window.localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    async function load() {
      try {
        const [meRes, mediaRes, automationRes, usageRes] = await Promise.all([getMe(), getMedia(), getAutomations(), getUsage()]);
        setProfile(meRes.data);
        setMedia(Array.isArray(mediaRes.data) ? mediaRes.data : []);
        setAutomations(Array.isArray(automationRes.data) ? automationRes.data : []);
        setUsage(usageRes.data);
      } catch (loadError) {
        setError(loadError.response?.data?.error || loadError.message || "Failed to load dashboard");
        window.localStorage.removeItem("token");
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  const refreshAutomations = async () => {
    const response = await getAutomations();
    setAutomations(response.data || []);
  };

  const handleSelectMedia = (item) => {
    const params = new URLSearchParams({
      mediaId: item.id,
      mediaType: item.media_type || "",
      mediaUrl: item.media_url || item.thumbnail_url || "",
      mediaCaption: item.caption || "",
    });
    router.push(`/dashboard/automations/builder?${params.toString()}`);
  };

  const handleToggle = async (id) => {
    await toggleAutomation(id);
    await refreshAutomations();
  };

  const handleDelete = async (id) => {
    await deleteAutomation(id);
    await refreshAutomations();
  };

  const handleManageBilling = async () => {
    try {
      const res = await createPortalSession();
      window.location.href = res.data.url;
    } catch (_err) {
      setError("Failed to open billing portal");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutSession();
    } catch (_error) {
      // Even if the backend session is already gone, we still clear the local app token.
    }
    window.localStorage.removeItem("token");
    router.replace("/login");
  };

  if (loading) {
    return <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
      <Stack spacing={3}>
        <Card sx={{ p: 3, background: "linear-gradient(135deg, rgba(245,133,41,0.16), rgba(129,52,175,0.18))" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} alignItems={{ xs: "flex-start", md: "center" }}>
            <Box>
              <Typography variant="overline" sx={{ color: "secondary.main", letterSpacing: 2 }}>Creator Console</Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>Welcome, @{profile?.username}</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Pick a reel or post, define a trigger word, and automate the comment reply or private message flow.
              </Typography>
            </Box>
            <Button variant="outlined" color="inherit" startIcon={<LogoutRoundedIcon />} onClick={handleLogout}>Logout</Button>
          </Stack>
        </Card>

        {usage && (
          <Card sx={{ p: 2.5 }}>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2}>
              <Stack spacing={0.5}>
                <Typography variant="overline" sx={{ color: "text.secondary", lineHeight: 1.2 }}>Current Plan</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h6">{usage.planName}</Typography>
                  <Chip label={usage.plan.toUpperCase()} size="small" color={usage.plan === "free" ? "default" : "secondary"} />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Replies this month: {usage.usage.repliesSent} / {usage.usage.maxRepliesPerMonth ?? "∞"}
                  {" · "}
                  Automations: {automations.length} / {usage.usage.maxAutomations ?? "∞"}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                {usage.plan === "free" ? (
                  <Button variant="contained" color="secondary" onClick={() => router.push("/pricing")}>Upgrade Plan</Button>
                ) : (
                  <Button variant="outlined" onClick={handleManageBilling}>Manage Billing</Button>
                )}
              </Stack>
            </Stack>
          </Card>
        )}

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Card sx={{ p: 2.5 }}>
          <Tabs value={mainTab} onChange={(_event, value) => setMainTab(value)}>
            <Tab label="Create Rule" />
            <Tab label="Active Automations" />
          </Tabs>
        </Card>

        {mainTab === 0 ? (
          <Grid container spacing={3}>
            {media.map((item) => (
              <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <MediaCard item={item} automated={automationByMediaId.has(item.id)} onSelect={handleSelectMedia} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {automations.length === 0 ? (
              <Grid size={12}><Alert severity="info">No automations created yet.</Alert></Grid>
            ) : automations.map((automation) => (
              <Grid key={automation.id} size={{ xs: 12, lg: 6 }}>
                <Card sx={{ overflow: "hidden" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      alignItems: "stretch",
                    }}
                  >
                    {automation.targetMediaUrl ? (
                      <Box
                        sx={{
                          flex: { xs: "0 0 auto", md: "0 0 260px" },
                          p: 2,
                          pb: { xs: 0, md: 2 },
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={automation.targetMediaUrl}
                          sx={{
                            width: "100%",
                            maxWidth: { xs: "100%", md: 260 },
                            aspectRatio: "4 / 5",
                            objectFit: "cover",
                            objectPosition: "center",
                            borderRadius: 3,
                            display: "block",
                            bgcolor: "rgba(255,255,255,0.04)",
                          }}
                        />
                      </Box>
                    ) : null}
                    <CardContent sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                      <Box>
                        <Typography variant="h6">Trigger: "{automation.triggerKeyword}"</Typography>
                        <Typography variant="body2" color="text.secondary">{automation.matchType} match • {automation.replyType.toUpperCase()}</Typography>
                      </Box>
                      <Switch checked={automation.active !== false} onChange={() => handleToggle(automation.id)} />
                    </Stack>
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={1.2}>
                      <Typography variant="body2"><strong>Reply:</strong> {automation.replyMessage}</Typography>
                      {automation.productLink ? <Typography variant="body2"><strong>Link:</strong> {automation.productLink}</Typography> : null}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 5,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {automation.targetMediaCaption || "No caption stored"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                      <Button variant="contained" startIcon={<EditRoundedIcon />} onClick={() => router.push(`/dashboard/automations/builder?mediaId=${automation.targetMediaId}`)}>Edit</Button>
                      <Button variant="outlined" color="error" startIcon={<DeleteOutlineIcon />} onClick={() => handleDelete(automation.id)}>Delete</Button>
                    </Stack>
                    </CardContent>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </Box>
  );
}
