"use client";

import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, IconButton } from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SIDEBAR_WIDTH = 240;

const navItems = [
  { label: "Overview", icon: <DashboardRoundedIcon />, path: "/admin" },
  { label: "Users", icon: <PeopleRoundedIcon />, path: "/admin/users" },
  { label: "Automations", icon: <SmartToyRoundedIcon />, path: "/admin/automations" },
  { label: "Plans", icon: <TuneRoundedIcon />, path: "/admin/plans" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setAuthed(true);
      return;
    }
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin/login");
    } else {
      setAuthed(true);
    }
  }, [pathname, router]);

  if (!authed) return null;

  if (pathname === "/admin/login") return children;

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    document.cookie = "admin_token=; Max-Age=0; path=/";
    router.replace("/admin/login");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f0f2f5" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH, bgcolor: "#fff", borderRight: "1px solid #e5e7eb" },
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
            Insta<span style={{ color: "#3b82f6" }}>Flow</span>
          </Typography>
          <Typography variant="caption" color="text.secondary">Admin Panel</Typography>
        </Box>

        <Divider />

        <List sx={{ px: 1, py: 1 }}>
          {navItems.map((item) => (
            <ListItemButton
              key={item.path}
              selected={pathname === item.path}
              onClick={() => router.push(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": { bgcolor: "#eff6ff", color: "#3b82f6" },
                "&.Mui-selected .MuiListItemIcon-root": { color: "#3b82f6" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: "0.88rem", fontWeight: 500 }} />
            </ListItemButton>
          ))}
        </List>

        <Box sx={{ mt: "auto", p: 1 }}>
          <Divider sx={{ mb: 1 }} />
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 36 }}><LogoutRoundedIcon /></ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: "0.88rem" }} />
          </ListItemButton>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, minWidth: 0 }}>
        {children}
      </Box>
    </Box>
  );
}
