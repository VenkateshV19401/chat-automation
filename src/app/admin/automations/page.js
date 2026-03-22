"use client";

import {
  Alert, Box, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Button, IconButton, Switch, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, CircularProgress, TextField,
} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useEffect, useState } from "react";

export default function AdminAutomationsPage() {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";

  const fetchAutomations = async () => {
    try {
      const res = await fetch("/api/admin/automations", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to load automations");
      setAutomations(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAutomations(); }, []);

  const handleToggle = async (id, currentActive) => {
    await fetch(`/api/admin/automations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ active: !currentActive }),
    });
    fetchAutomations();
  };

  const handleDelete = async () => {
    await fetch(`/api/admin/automations/${deleteConfirm.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeleteConfirm(null);
    fetchAutomations();
  };

  const filtered = automations.filter((a) =>
    a.triggerKeyword?.toLowerCase().includes(search.toLowerCase()) ||
    a.username?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Box sx={{ display: "grid", placeItems: "center", minHeight: 400 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Automations</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>View and manage all automations across users</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        placeholder="Search by keyword or username..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, width: 350 }}
      />

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Trigger</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Match</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Reply Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Replies</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Active</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar src={a.profilePictureUrl} sx={{ width: 28, height: 28 }}>{a.username?.[0]?.toUpperCase()}</Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>@{a.username}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>&ldquo;{a.triggerKeyword}&rdquo;</Typography>
                  </TableCell>
                  <TableCell><Chip label={a.matchType} size="small" variant="outlined" sx={{ height: 22, fontSize: "0.72rem" }} /></TableCell>
                  <TableCell><Chip label={a.replyType} size="small" variant="outlined" sx={{ height: 22, fontSize: "0.72rem" }} /></TableCell>
                  <TableCell>
                    <Typography variant="body2">{a.commentReplies} / {a.dmReplies}</Typography>
                    <Typography variant="caption" color="text.secondary">comments / DMs</Typography>
                  </TableCell>
                  <TableCell>
                    <Switch checked={a.active} size="small" onChange={() => handleToggle(a.id, a.active)} />
                  </TableCell>
                  <TableCell>
                    {a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="error" onClick={() => setDeleteConfirm(a)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} align="center"><Typography color="text.secondary">No automations found</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs">
        <DialogTitle>Delete Automation</DialogTitle>
        <DialogContent>
          <Typography>Delete automation &ldquo;{deleteConfirm?.triggerKeyword}&rdquo; by @{deleteConfirm?.username}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
