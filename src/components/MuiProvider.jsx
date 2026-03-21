"use client";

import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { useMemo } from "react";

export default function MuiProvider({ children }) {
  const theme = useMemo(() => createTheme({
    palette: {
      mode: "light",
      primary: { main: "#3b82f6" },
      secondary: { main: "#ec4899" },
      success: { main: "#22c55e" },
      warning: { main: "#f59e0b" },
      error: { main: "#ef4444" },
      background: {
        default: "#f8f9fb",
        paper: "#ffffff",
      },
      text: {
        primary: "#1a1a2e",
        secondary: "#6b7280",
      },
      divider: "rgba(0,0,0,0.08)",
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      h3: { fontWeight: 700, letterSpacing: "-0.02em", color: "#1a1a2e" },
      h4: { fontWeight: 700, letterSpacing: "-0.01em", color: "#1a1a2e" },
      h5: { fontWeight: 600, color: "#1a1a2e" },
      h6: { fontWeight: 600, color: "#1a1a2e" },
      subtitle1: { fontWeight: 500 },
      body2: { color: "#6b7280" },
      button: { textTransform: "none", fontWeight: 600, fontSize: "0.875rem" },
      overline: { fontWeight: 600, letterSpacing: "0.08em", fontSize: "0.7rem" },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            backgroundImage: "none",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            paddingInline: 20,
            paddingBlock: 8,
          },
          contained: {
            boxShadow: "none",
            "&:hover": { boxShadow: "0 2px 8px rgba(59,130,246,0.25)" },
          },
          outlined: {
            borderColor: "rgba(0,0,0,0.15)",
            "&:hover": { borderColor: "rgba(0,0,0,0.3)", background: "rgba(0,0,0,0.02)" },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, fontSize: "0.75rem" },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            minHeight: 44,
            color: "#6b7280",
            "&.Mui-selected": { color: "#3b82f6" },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 10,
              backgroundColor: "#fff",
              "& fieldset": { borderColor: "rgba(0,0,0,0.12)" },
              "&:hover fieldset": { borderColor: "rgba(0,0,0,0.25)" },
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 10 },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            "&.Mui-checked": { color: "#22c55e" },
            "&.Mui-checked + .MuiSwitch-track": { backgroundColor: "#22c55e" },
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
