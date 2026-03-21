"use client";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
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
        const media = found || (mediaId ? {
          id: mediaId,
          media_url: mediaUrl,
          thumbnail_url: mediaUrl,
          caption: mediaCaption,
          media_type: mediaType,
        } : null);
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
    if (!selectedMedia?.id) {
      setError("No media selected");
      return;
    }

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
    <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
      <Stack spacing={3}>
        <Button variant="text" startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: "flex-start" }} onClick={() => router.push("/dashboard")}>Back to dashboard</Button>
        <Typography variant="h4">{existingAutomation ? "Edit Automation" : "Setup Automation Rule"}</Typography>
        {error ? <Alert severity="error">{error}</Alert> : null}

        <Stack direction={{ xs: "column", lg: "row" }} spacing={3} alignItems="stretch">
          <Card sx={{ flex: "0 0 360px", maxWidth: 420 }}>
            {selectedMedia?.thumbnail_url || selectedMedia?.media_url ? (
              <CardMedia component="img" image={selectedMedia.thumbnail_url || selectedMedia.media_url} sx={{ aspectRatio: "4 / 5", objectFit: "cover" }} />
            ) : null}
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Selected target</Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>{selectedMedia?.media_type || "Instagram Media"}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {selectedMedia?.caption || "No caption available"}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Stack spacing={2.5}>
                {existingAutomation ? <Alert severity="info">Automation already exists for this media. You are editing the existing rule.</Alert> : null}
                <TextField label="Trigger keyword" value={form.triggerKeyword} onChange={handleChange("triggerKeyword")} fullWidth />
                <TextField select label="Match type" value={form.matchType} onChange={handleChange("matchType")}>
                  <MenuItem value="contains">Contains</MenuItem>
                  <MenuItem value="exact">Exact</MenuItem>
                </TextField>
                <TextField select label="Reply type" value={form.replyType} onChange={handleChange("replyType")}>
                  <MenuItem value="both">Both comment and DM</MenuItem>
                  <MenuItem value="comment">Comment only</MenuItem>
                  <MenuItem value="dm">DM only</MenuItem>
                </TextField>
                <TextField label="Reply message" value={form.replyMessage} onChange={handleChange("replyMessage")} fullWidth multiline minRows={4} />
                <TextField label="Product link (optional)" value={form.productLink} onChange={handleChange("productLink")} fullWidth />
                <Button variant="contained" size="large" onClick={handleSubmit} disabled={saving}>
                  {existingAutomation ? "Update automation" : "Activate automation"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Stack>
    </Box>
  );
}
