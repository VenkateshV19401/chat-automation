"use client";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createAutomation, getAutomationByMedia, getMedia, updateAutomation } from "../../../../lib/api";

export default function BuilderPage() {
  const router = useRouter();
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [existingAutomation, setExistingAutomation] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    triggerKeyword: "",
    matchType: "contains",
    replyType: "both",
    replyMessage: "",
    productLink: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mediaId = params.get("mediaId");
    const mediaUrl = params.get("mediaUrl");
    const mediaCaption = params.get("mediaCaption");
    const mediaType = params.get("mediaType");

    async function load() {
      try {
        const mediaResponse = await getMedia();
        const found = (mediaResponse.data || []).find((item) => item.id === mediaId);
        const media = found || (mediaId ? { id: mediaId, media_url: mediaUrl, thumbnail_url: mediaUrl, caption: mediaCaption, media_type: mediaType } : null);
        setSelectedMedia(media);

        if (mediaId) {
          try {
            const automationResponse = await getAutomationByMedia(mediaId);
            const automation = automationResponse.data;
            setExistingAutomation(automation);
            setForm({
              triggerKeyword: automation.triggerKeyword || "",
              matchType: automation.matchType || "contains",
              replyType: automation.replyType || "both",
              replyMessage: automation.replyMessage || "",
              productLink: automation.productLink || "",
            });
          } catch (_error) {
            setExistingAutomation(null);
          }
        }
      } catch (loadError) {
        setError(loadError.response?.data?.error || loadError.message || "Failed to load media details");
      }
    }
    load();
  }, []);

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async () => {
    if (!selectedMedia?.id) { setError("No media selected"); return; }
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      targetMediaId: selectedMedia.id,
      targetMediaUrl: selectedMedia.thumbnail_url || selectedMedia.media_url || "",
      targetMediaCaption: selectedMedia.caption || "",
      targetMediaType: selectedMedia.media_type || "",
    };

    try {
      if (existingAutomation?.id) {
        await updateAutomation(existingAutomation.id, payload);
      } else {
        await createAutomation(payload);
      }
      router.push("/dashboard");
    } catch (saveError) {
      const maybeExisting = saveError.response?.data?.automation;
      if (maybeExisting) setExistingAutomation(maybeExisting);
      setError(saveError.response?.data?.error || saveError.message || "Failed to save automation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fb" }}>
      {/* Navbar */}
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 1.5,
          display: "flex",
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
      </Box>

      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 1100, mx: "auto" }}>
        <Stack spacing={3}>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => router.push("/dashboard")}
            sx={{ alignSelf: "flex-start", color: "text.secondary" }}
          >
            Back to dashboard
          </Button>

          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h4">{existingAutomation ? "Edit Automation" : "New Automation"}</Typography>
            {existingAutomation && <Chip label="Editing" size="small" color="primary" />}
          </Stack>

          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}

          <Stack direction={{ xs: "column", lg: "row" }} spacing={3} alignItems="flex-start">
            {/* Media Preview */}
            <Card sx={{ flex: "0 0 320px", maxWidth: { xs: "100%", lg: 320 }, overflow: "hidden" }}>
              {(selectedMedia?.thumbnail_url || selectedMedia?.media_url) && (
                <CardMedia
                  component="img"
                  image={selectedMedia.thumbnail_url || selectedMedia.media_url}
                  sx={{ aspectRatio: "1", objectFit: "cover" }}
                />
              )}
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Chip
                    label={selectedMedia?.media_type === "VIDEO" ? "Reel" : "Post"}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: "0.7rem", height: 22 }}
                  />
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>Selected media</Typography>
                </Stack>
                <Typography
                  variant="body2"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    fontSize: "0.8rem",
                  }}
                >
                  {selectedMedia?.caption || "No caption available"}
                </Typography>
              </CardContent>
            </Card>

            {/* Form */}
            <Card sx={{ flex: 1 }}>
              <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                <Stack spacing={3}>
                  {existingAutomation && (
                    <Alert severity="info" variant="outlined">
                      An automation already exists for this media. Saving will update it.
                    </Alert>
                  )}

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: "text.secondary" }}>Trigger</Typography>
                    <Stack spacing={2}>
                      <TextField
                        label="Keyword"
                        value={form.triggerKeyword}
                        onChange={handleChange("triggerKeyword")}
                        fullWidth
                        placeholder="e.g. price, buy, link"
                      />
                      <TextField select label="Match type" value={form.matchType} onChange={handleChange("matchType")}>
                        <MenuItem value="contains">Contains keyword</MenuItem>
                        <MenuItem value="exact">Exact match only</MenuItem>
                      </TextField>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: "text.secondary" }}>Response</Typography>
                    <Stack spacing={2}>
                      <TextField select label="Reply type" value={form.replyType} onChange={handleChange("replyType")}>
                        <MenuItem value="both">Comment + DM</MenuItem>
                        <MenuItem value="comment">Comment only</MenuItem>
                        <MenuItem value="dm">DM only</MenuItem>
                      </TextField>
                      <TextField
                        label="Reply message"
                        value={form.replyMessage}
                        onChange={handleChange("replyMessage")}
                        fullWidth
                        multiline
                        minRows={3}
                        placeholder="Type the auto-reply message..."
                      />
                      <TextField
                        label="Product link (optional)"
                        value={form.productLink}
                        onChange={handleChange("productLink")}
                        fullWidth
                        placeholder="https://..."
                      />
                    </Stack>
                  </Box>

                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={saving || !form.triggerKeyword.trim() || !form.replyMessage.trim()}
                    sx={{ py: 1.3 }}
                  >
                    {saving ? "Saving..." : existingAutomation ? "Update Automation" : "Activate Automation"}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
