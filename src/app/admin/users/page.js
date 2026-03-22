"use client";

import {
  Alert, Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, IconButton, InputLabel, MenuItem, Select, Switch, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography, CircularProgress, TextField,
} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { useEffect, useState } from "react";

const planColors = { free: "default", pro: "primary", business: "secondary" };

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [editPlan, setEditPlan] = useState("free");
  const [editManualGrant, setEditManualGrant] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to load users");
      setUsers(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUpdateUser = async () => {
    await fetch(`/api/admin/users/${editUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ plan: editPlan, isManualGrant: editManualGrant }),
    });
    setEditUser(null);
    fetchUsers();
  };

  const handleDeleteUser = async () => {
    await fetch(`/api/admin/users/${deleteConfirm.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeleteConfirm(null);
    fetchUsers();
  };

  const filtered = users.filter((u) => u.username?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Box sx={{ display: "grid", placeItems: "center", minHeight: 400 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Users</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Manage all registered users</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        placeholder="Search by username..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, width: 300 }}
      />

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Plan</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Automations</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Replies (Month)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar src={user.profilePictureUrl} sx={{ width: 32, height: 32 }}>{user.username?.[0]?.toUpperCase()}</Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>@{user.username}</Typography>
                        {user.isManualGrant && <Chip label="Manual" size="small" sx={{ height: 18, fontSize: "0.65rem" }} />}
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip label={user.plan.toUpperCase()} size="small" color={planColors[user.plan] || "default"} />
                  </TableCell>
                  <TableCell>{user.automationCount}</TableCell>
                  <TableCell>{user.repliesThisMonth}</TableCell>
                  <TableCell>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => { setEditUser(user); setEditPlan(user.plan); setEditManualGrant(user.isManualGrant); }}
                    >
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteConfirm(user)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center"><Typography color="text.secondary">No users found</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit User — @{editUser?.username}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>Plan</InputLabel>
            <Select value={editPlan} onChange={(e) => setEditPlan(e.target.value)} label="Plan">
              <MenuItem value="free">Free</MenuItem>
              <MenuItem value="pro">Pro</MenuItem>
              <MenuItem value="business">Business</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Switch checked={editManualGrant} onChange={(e) => setEditManualGrant(e.target.checked)} />
            <Typography variant="body2">Manual Grant (free access)</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateUser}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs">
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>@{deleteConfirm?.username}</strong>? This will also delete all their automations and usage data.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteUser}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
