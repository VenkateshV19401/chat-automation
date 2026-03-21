"use client";

import { Box, Typography, Stack } from "@mui/material";

export default function PrivacyPage() {
  return (
    <Box sx={{ maxWidth: 860, mx: "auto", p: 4 }}>
      <Typography variant="h3" sx={{ mb: 3 }}>Privacy Policy</Typography>
      <Typography sx={{ mb: 2 }}>InstaFlow helps Instagram professional accounts connect their account, load media, and create automation rules for comment replies and private replies.</Typography>
      <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>Information We Collect</Typography>
      <Stack component="ul" spacing={0.5} sx={{ pl: 3 }}>
        <li>Instagram account identifiers such as account ID, username, and account type.</li>
        <li>Instagram access tokens required to operate the connected automation features.</li>
        <li>Media metadata such as post or reel IDs, captions, permalinks, and media URLs used for rule selection.</li>
        <li>Automation configuration data such as trigger keywords, reply text, and target media.</li>
      </Stack>
      <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>How We Use Information</Typography>
      <Stack component="ul" spacing={0.5} sx={{ pl: 3 }}>
        <li>To authenticate the connected Instagram professional account.</li>
        <li>To display the user&apos;s media inside the dashboard.</li>
        <li>To process webhook events and run automation rules configured by the user.</li>
        <li>To support troubleshooting, security, and service improvements.</li>
      </Stack>
      <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>Data Sharing</Typography>
      <Typography>We do not sell personal data. Data is used only to provide the automation features requested by the connected account owner.</Typography>
      <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>Data Retention</Typography>
      <Typography>We retain connected account data and automation records only as long as necessary to operate the app or until the user requests deletion.</Typography>
      <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>Contact</Typography>
      <Typography>For privacy questions, contact <a href="mailto:abishekincrix@gmail.com">abishekincrix@gmail.com</a>.</Typography>
    </Box>
  );
}
