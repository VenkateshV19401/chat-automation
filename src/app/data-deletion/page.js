"use client";

import { Box, Typography, Stack } from "@mui/material";

export default function DataDeletionPage() {
  return (
    <Box sx={{ maxWidth: 860, mx: "auto", p: 4 }}>
      <Typography variant="h3" sx={{ mb: 3 }}>Data Deletion Instructions</Typography>
      <Typography sx={{ mb: 2 }}>If you want your connected account data removed from InstaFlow, send a deletion request to <a href="mailto:abishekincrix@gmail.com">abishekincrix@gmail.com</a> with the subject &quot;Data Deletion Request&quot;.</Typography>
      <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>Please Include</Typography>
      <Stack component="ul" spacing={0.5} sx={{ pl: 3 }}>
        <li>Your Instagram username.</li>
        <li>The email address used to contact us.</li>
        <li>A short note requesting deletion of your app data.</li>
      </Stack>
      <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>What Will Be Deleted</Typography>
      <Stack component="ul" spacing={0.5} sx={{ pl: 3 }}>
        <li>Stored Instagram account details.</li>
        <li>Stored access tokens.</li>
        <li>Saved automation rules and related media mappings.</li>
      </Stack>
      <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>Processing Time</Typography>
      <Typography>We aim to process verified deletion requests within 7 business days.</Typography>
    </Box>
  );
}
