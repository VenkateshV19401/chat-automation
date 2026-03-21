"use client";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import PhotoLibraryRoundedIcon from "@mui/icons-material/PhotoLibraryRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
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
  IconButton,
  LinearProgress,
  Stack,
  Switch,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { deleteAutomation, getAutomations, getMe, getMedia, getUsage, createPortalSession, logoutSession, toggleAutomation } from "../../lib/api";

function MediaCard({ item, automated, onSelect }) {
  const image = item.thumbnail_url || item.media_url;

  return (
    <Card
      onClick={() => onSelect(item)}
      sx={{
        cursor: "pointer",
        overflow: "hidden",
        position: "relative",
        "&:hover": { borderColor: "rgba(0,0,0,0.15)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", transform: "translateY(-2px)" },
        transition: "all 0.2s ease",
      }}
    >
      {automated && (
        <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}>
          <Chip
            icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 14 }} />}
            label="Active"
            size="small"
            sx={{ bgcolor: "rgba(34,197,94,0.1)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.2)", fontWeight: 600 }}
          />
        </Box>
      )}
      {image ? (
        <CardMedia component="img" image={image} sx={{ aspectRatio: "1", objectFit: "cover" }} />
      ) : (
        <Box sx={{ aspectRatio: "1", display: "grid", placeItems: "center", bgcolor: "#f3f4f6" }}>
          <PhotoLibraryRoundedIcon sx={{ fontSize: 40, color: "#d1d5db" }} />
        </Box>
      )}
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Chip
          label={item.media_type === "VIDEO" ? "Reel" : "Post"}
          size="small"
          variant="outlined"
          sx={{ fontSize: "0.7rem", height: 22 }}
        />
        <Typography
          variant="body2"
          sx={{
            mt: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontSize: "0.8rem",
            lineHeight: 1.5,
            color: "text.secondary",
          }}
        >
          {item.caption || "No caption"}
        </Typography>
      </CardContent>
    </Card>
  );
}

function StatCard({ label, value, total, color }) {
  const percent = total ? Math.min((value / total) * 100, 100) : 0;
  return (
    <Box sx={{ flex: 1 }}>
      <Typography variant="body2" sx={{ mb: 0.5, color: "text.secondary" }}>{label}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
        {value}{" "}
        <Typography component="span" variant="body2" sx={{ fontWeight: 400, color: "text.secondary" }}>
          / {total ?? "\u221E"}
        </Typography>
      </Typography>
      {total && (
        <LinearProgress
          variant="determinate"
          value={percent}
          sx={{
            mt: 1,
            height: 4,
            borderRadius: 2,
            bgcolor: "rgba(0,0,0,0.06)",
            "& .MuiLinearProgress-bar": { bgcolor: color || "primary.main", borderRadius: 2 },
          }}
        />
      )}
    </Box>
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
  const [mediaTab, setMediaTab] = useState(0);
  const [error, setError] = useState("");

  const automationByMediaId = useMemo(() => new Map(automations.map((item) => [item.targetMediaId, item])), [automations]);
  const posts = useMemo(() => media.filter((item) => item.media_type === "IMAGE" || item.media_type === "CAROUSEL_ALBUM"), [media]);
  const reels = useMemo(() => media.filter((item) => item.media_type === "VIDEO"), [media]);

  useEffect(() => {
    const token = window.localStorage.getItem("token");
    if (!token) { router.replace("/login"); return; }

    async function load() {
      try {
        const [meRes, mediaRes, automationRes, usageRes] = await Promise.all([getMe(), getMedia(), getAutomations(), getUsage()]);
        setProfile(meRes.data);
        setMedia(Array.isArray(mediaRes.data) ? mediaRes.data : []);
        setAutomations(Array.isArray(automationRes.data) ? automationRes.data : []);
        setUsage(usageRes.data);
      } catch (loadError) {
        const status = loadError.response?.status;
        if (status === 401) {
          window.localStorage.removeItem("token");
          router.replace("/login?reason=session-expired");
          return;
        }
        setError(loadError.response?.data?.error || loadError.message || "Failed to load dashboard");
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

  const handleToggle = async (id) => { await toggleAutomation(id); await refreshAutomations(); };
  const handleDelete = async (id) => { await deleteAutomation(id); await refreshAutomations(); };

  const handleManageBilling = async () => {
    try {
      const res = await createPortalSession();
      window.location.href = res.data.url;
    } catch (_err) {
      setError("Failed to open billing portal");
    }
  };

  const handleLogout = async () => {
    try { await logoutSession(); } catch (_error) {}
    window.localStorage.removeItem("token");
    router.replace("/login");
  };

  if (loading) {
    return <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}><CircularProgress size={32} /></Box>;
  }

  const currentMediaList = mediaTab === 0 ? posts : reels;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fb" }}>
      {/* Navbar */}
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          bgcolor: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
          Insta<span style={{ color: "#3b82f6" }}>Flow</span>
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" sx={{ mr: 1, color: "text.secondary" }}>@{profile?.username}</Typography>
          <Tooltip title="Logout">
            <IconButton size="small" onClick={handleLogout} sx={{ color: "text.secondary" }}>
              <LogoutRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 1400, mx: "auto" }}>
        <Stack spacing={3}>
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}

          {/* Stats Row */}
          {usage && (
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <Card sx={{ flex: 1, p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <StatCard label="Replies this month" value={usage.usage.repliesSent} total={usage.usage.maxRepliesPerMonth} color="#3b82f6" />
                  <TrendingUpRoundedIcon sx={{ color: "#d1d5db" }} />
                </Stack>
              </Card>
              <Card sx={{ flex: 1, p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <StatCard label="Active automations" value={automations.length} total={usage.usage.maxAutomations} color="#ec4899" />
                  <AutoAwesomeRoundedIcon sx={{ color: "#d1d5db" }} />
                </Stack>
              </Card>
              <Card sx={{ flex: 1, p: 3 }}>
                <Stack spacing={1}>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>Current Plan</Typography>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{usage.planName}</Typography>
                    <Chip
                      label={usage.plan.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: usage.plan === "free" ? "rgba(0,0,0,0.06)" : "rgba(59,130,246,0.1)",
                        color: usage.plan === "free" ? "text.secondary" : "#3b82f6",
                        fontWeight: 600,
                      }}
                    />
                  </Stack>
                  {usage.plan === "free" ? (
                    <Button variant="contained" size="small" onClick={() => router.push("/pricing")} sx={{ alignSelf: "flex-start", mt: 0.5 }}>
                      Upgrade
                    </Button>
                  ) : (
                    <Button variant="outlined" size="small" onClick={handleManageBilling} sx={{ alignSelf: "flex-start", mt: 0.5 }}>
                      Manage Billing
                    </Button>
                  )}
                </Stack>
              </Card>
            </Stack>
          )}

          {/* Main Tabs */}
          <Box sx={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
            <Tabs value={mainTab} onChange={(_event, value) => setMainTab(value)}>
              <Tab label="Create Rule" />
              <Tab label={`Automations (${automations.length})`} />
            </Tabs>
          </Box>

          {mainTab === 0 ? (
            <>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={`Posts (${posts.length})`}
                  onClick={() => setMediaTab(0)}
                  variant={mediaTab === 0 ? "filled" : "outlined"}
                  sx={{
                    bgcolor: mediaTab === 0 ? "rgba(59,130,246,0.1)" : "transparent",
                    color: mediaTab === 0 ? "#3b82f6" : "text.secondary",
                    borderColor: mediaTab === 0 ? "#3b82f6" : "rgba(0,0,0,0.12)",
                    cursor: "pointer",
                  }}
                />
                <Chip
                  label={`Reels (${reels.length})`}
                  onClick={() => setMediaTab(1)}
                  variant={mediaTab === 1 ? "filled" : "outlined"}
                  sx={{
                    bgcolor: mediaTab === 1 ? "rgba(236,72,153,0.1)" : "transparent",
                    color: mediaTab === 1 ? "#ec4899" : "text.secondary",
                    borderColor: mediaTab === 1 ? "#ec4899" : "rgba(0,0,0,0.12)",
                    cursor: "pointer",
                  }}
                />
              </Stack>

              <Grid container spacing={2}>
                {currentMediaList.map((item) => (
                  <Grid key={item.id} size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }}>
                    <MediaCard item={item} automated={automationByMediaId.has(item.id)} onSelect={handleSelectMedia} />
                  </Grid>
                ))}
                {currentMediaList.length === 0 && (
                  <Grid size={12}>
                    <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
                      <PhotoLibraryRoundedIcon sx={{ fontSize: 48, color: "#d1d5db", mb: 2 }} />
                      <Typography>No {mediaTab === 0 ? "posts" : "reels"} found</Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </>
          ) : (
            <Grid container spacing={2}>
              {automations.length === 0 ? (
                <Grid size={12}>
                  <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
                    <AutoAwesomeRoundedIcon sx={{ fontSize: 48, color: "#d1d5db", mb: 2 }} />
                    <Typography>No automations yet. Select a post or reel to create one.</Typography>
                  </Box>
                </Grid>
              ) : automations.map((automation) => (
                <Grid key={automation.id} size={{ xs: 12 }}>
                  <Card sx={{ overflow: "hidden" }}>
                    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "stretch" }}>
                      {automation.targetMediaUrl && (
                        <CardMedia
                          component="img"
                          image={automation.targetMediaUrl}
                          sx={{
                            flex: { xs: "0 0 auto", md: "0 0 260px" },
                            width: { xs: "100%", md: 260 },
                            aspectRatio: { xs: "16/9", md: "4/5" },
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <CardContent sx={{ flex: 1, minWidth: 0, p: 3, "&:last-child": { pb: 3 } }}>
                        {/* Header: Keyword + Toggle */}
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                                &ldquo;{automation.triggerKeyword}&rdquo;
                              </Typography>
                              <Chip
                                label={automation.active !== false ? "Active" : "Paused"}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: "0.7rem",
                                  bgcolor: automation.active !== false ? "rgba(34,197,94,0.1)" : "rgba(0,0,0,0.06)",
                                  color: automation.active !== false ? "#16a34a" : "text.secondary",
                                  fontWeight: 600,
                                }}
                              />
                            </Stack>
                            <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
                              <Chip label={automation.matchType} size="small" variant="outlined" sx={{ height: 22, fontSize: "0.7rem" }} />
                              <Chip label={automation.replyType} size="small" variant="outlined" sx={{ height: 22, fontSize: "0.7rem" }} />
                            </Stack>
                          </Box>
                          <Switch checked={automation.active !== false} onChange={() => handleToggle(automation.id)} size="small" />
                        </Stack>

                        {/* Reply Message */}
                        <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.08)" }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.65rem" }}>
                            Reply Message
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5, color: "text.primary", fontSize: "0.85rem", lineHeight: 1.6 }}>
                            {automation.replyMessage}
                          </Typography>
                          {automation.productLink && (
                            <Typography variant="body2" sx={{ mt: 0.5, fontSize: "0.8rem", color: "#3b82f6", wordBreak: "break-all" }}>
                              {automation.productLink}
                            </Typography>
                          )}
                        </Box>

                        {/* Caption */}
                        {automation.targetMediaCaption && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.65rem" }}>
                              Post Caption
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                mt: 0.5,
                                fontSize: "0.8rem",
                                color: "text.secondary",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                lineHeight: 1.5,
                              }}
                            >
                              {automation.targetMediaCaption}
                            </Typography>
                          </Box>
                        )}

                        {/* Stats Row */}
                        <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
                          <Box sx={{ textAlign: "center" }}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 16, color: "#3b82f6" }} />
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary", fontSize: "1rem" }}>
                                {automation.commentReplies || 0}
                              </Typography>
                            </Stack>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem" }}>Comments</Typography>
                          </Box>
                          <Box sx={{ textAlign: "center" }}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <SendRoundedIcon sx={{ fontSize: 16, color: "#ec4899" }} />
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary", fontSize: "1rem" }}>
                                {automation.dmReplies || 0}
                              </Typography>
                            </Stack>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem" }}>DMs sent</Typography>
                          </Box>
                          <Box sx={{ textAlign: "center" }}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <CalendarTodayRoundedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                              <Typography variant="body2" sx={{ fontWeight: 500, color: "text.secondary", fontSize: "0.8rem" }}>
                                {automation.createdAt ? new Date(automation.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                              </Typography>
                            </Stack>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem" }}>Created</Typography>
                          </Box>
                        </Stack>

                        <Divider sx={{ mb: 1.5 }} />

                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditRoundedIcon sx={{ fontSize: 16 }} />}
                            onClick={() => router.push(`/dashboard/automations/builder?mediaId=${automation.targetMediaId}`)}
                            sx={{ fontSize: "0.8rem" }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteOutlineIcon sx={{ fontSize: 16 }} />}
                            onClick={() => handleDelete(automation.id)}
                            sx={{ fontSize: "0.8rem" }}
                          >
                            Delete
                          </Button>
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
    </Box>
  );
}
