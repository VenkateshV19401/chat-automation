"use client";

import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { useMemo } from "react";

export default function MuiProvider({ children }) {
  const theme = useMemo(() => createTheme({
    palette: {
      mode: "dark",
      primary: { main: "#f58529" },
      secondary: { main: "#dd2a7b" },
      background: {
        default: "#0b1020",
        paper: "rgba(16, 24, 48, 0.88)",
      },
      text: {
        primary: "#eef2ff",
        secondary: "#a7b0d4",
      },
    },
    shape: { borderRadius: 20 },
    typography: {
      fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
      h3: { fontWeight: 800 },
      h4: { fontWeight: 800 },
      h5: { fontWeight: 700 },
      button: { textTransform: "none", fontWeight: 700 },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.08)",
            backgroundImage: "none",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            paddingInline: 18,
          },
        },
      },
    },
  }), []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
