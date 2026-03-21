"use client";

import { Box, Typography, Stack } from "@mui/material";

export default function TermsPage() {
  return (
    <Box sx={{ maxWidth: 860, mx: "auto", p: 4 }}>
      <Typography variant="h3" sx={{ mb: 3 }}>Terms of Service</Typography>
      <Typography sx={{ mb: 2 }}>By using InstaFlow, you agree to use the service only for lawful Instagram automation related to your own professional account.</Typography>
      <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>Use of the Service</Typography>
      <Stack component="ul" spacing={0.5} sx={{ pl: 3 }}>
        <li>You must connect only Instagram accounts you are authorized to control.</li>
        <li>You are responsible for the automation rules, reply text, and links you configure.</li>
        <li>You must comply with Meta platform policies and applicable laws.</li>
      </Stack>
      <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>Service Availability</Typography>
      <Typography>We may update, improve, or temporarily interrupt the service for maintenance, debugging, or platform changes.</Typography>
      <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>Account Removal</Typography>
      <Typography>You may disconnect the app at any time through Meta or Instagram settings. You may also request account data deletion using the data deletion instructions page.</Typography>
      <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>Contact</Typography>
      <Typography>For support or legal questions, contact <a href="mailto:abishekincrix@gmail.com">abishekincrix@gmail.com</a>.</Typography>
    </Box>
  );
}
