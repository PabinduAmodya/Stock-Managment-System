import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockResetIcon from '@mui/icons-material/LockReset';
import dayjs from 'dayjs';
import { UsersAPI } from '../api/endpoints';
import type { User } from '../types/api';
import { PageHeader } from '../components/PageHeader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Toast, ToastState } from '../components/Toast';
import { useAuth } from '../auth/AuthContext';

const ROLE_COLORS: Record<string, 'error' | 'warning' | 'success'> = {
  ADMIN:   'error',
  MANAGER: 'warning',
  CASHIER: 'success',
};

export function UsersPage() {
  const { user: currentUser } = useAuth();

  const [rows,    setRows]    = useState<User[]>([]);
  const [open,    setOpen]    = useState(false);
  const [deleting,setDeleting]= useState<User | null>(null);
  const [toast,   setToast]   = useState<ToastState>({ open: false, message: '', severity: 'info' });

  // ── Form state ──
  const [id,       setId]       = useState<number>(0);
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [role,     setRole]     = useState<User['role']>('CASHIER');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);

  const isEdit = useMemo(() => id !== 0, [id]);

  // ── Load ──
  const load = async () => {
    try {
      setRows(await UsersAPI.list());
    } catch {
      setToast({ open: true, message: 'Failed to load users', severity: 'error' });
    }
  };

  useEffect(() => { load(); }, []);

  // ── Open dialogs ──
  const openCreate = () => {
    setId(0);
    setName('');
    setEmail('');
    setRole('CASHIER');
    setPassword('');
    setShowPwd(false);
    setOpen(true);
  };

  const openEdit = (u: User) => {
    setId(u.id);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setPassword('');
    setShowPwd(false);
    setOpen(true);
  };

  // ── Save ──
  const save = async () => {
    if (!name.trim()) {
      setToast({ open: true, message: 'Name is required', severity: 'warning' });
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setToast({ open: true, message: 'A valid email is required', severity: 'warning' });
      return;
    }

    try {
      if (!isEdit) {
        // ── CREATE ──
        if (!password || password.length < 6) {
          setToast({ open: true, message: 'Password must be at least 6 characters', severity: 'warning' });
          return;
        }
        await UsersAPI.create({
          name:     name.trim(),
          email:    email.trim(),
          password,
          role,
          status:   'ACTIVE',
        } as any);
        setToast({ open: true, message: 'User created successfully', severity: 'success' });

      } else {
        // ── UPDATE ──
        // Step 1: update name + email (role NOT sent — handled separately)
        await UsersAPI.update(id, { name: name.trim(), email: email.trim() } as any);

        // Step 2: update role via dedicated endpoint
        const original = rows.find((r) => r.id === id);
        if (original && original.role !== role) {
          await UsersAPI.changeRole(id, { role });
        }

        // Step 3: reset password only if a new one was entered
        if (password) {
          if (password.length < 6) {
            setToast({ open: true, message: 'Password must be at least 6 characters', severity: 'warning' });
            return;
          }
          await UsersAPI.resetPassword(id, { password });
        }

        setToast({ open: true, message: 'User updated successfully', severity: 'success' });
      }

      setOpen(false);
      await load();
    } catch (e: any) {
      setToast({ open: true, message: e?.response?.data?.message ?? 'Save failed', severity: 'error' });
    }
  };

  // ── Toggle status ──
  const toggleStatus = async (u: User) => {
    // Prevent admin from deactivating themselves
    if (u.email === currentUser?.email) {
      setToast({ open: true, message: 'You cannot change your own status', severity: 'warning' });
      return;
    }
    try {
      if (u.status === 'ACTIVE') await UsersAPI.deactivate(u.id);
      else await UsersAPI.activate(u.id);
      setToast({ open: true, message: 'Status updated', severity: 'success' });
      await load();
    } catch (e: any) {
      setToast({ open: true, message: e?.response?.data?.message ?? 'Update failed', severity: 'error' });
    }
  };

  // ── Delete ──
  const remove = async () => {
    if (!deleting) return;
    try {
      await UsersAPI.remove(deleting.id);
      setToast({ open: true, message: 'User deleted', severity: 'success' });
      setDeleting(null);
      await load();
    } catch (e: any) {
      setToast({ open: true, message: e?.response?.data?.message ?? 'Delete failed', severity: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Users"
        subtitle="Manage system accounts and permissions"
        actionLabel="Add User"
        onAction={openCreate}
      />

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((u) => {
                const isSelf = u.email === currentUser?.email;
                return (
                  <TableRow key={u.id} hover>
                    <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>{u.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{u.name}</Typography>
                        {isSelf && (
                          <Chip label="You" size="small" sx={{ fontSize: 10, height: 18, bgcolor: '#E3F2FD' }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{u.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.role}
                        size="small"
                        color={ROLE_COLORS[u.role]}
                        sx={{ fontSize: 11 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.status}
                        size="small"
                        color={u.status === 'ACTIVE' ? 'success' : 'default'}
                        sx={{ fontSize: 11 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: 13 }}>
                      {u.createdAt ? dayjs(u.createdAt).format('YYYY-MM-DD') : '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => openEdit(u)}>
                        Edit
                      </Button>
                      <Tooltip title={isSelf ? 'Cannot change your own status' : ''}>
                        <span>
                          <Button
                            size="small"
                            color={u.status === 'ACTIVE' ? 'warning' : 'success'}
                            disabled={isSelf}
                            onClick={() => toggleStatus(u)}
                          >
                            {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </Button>
                        </span>
                      </Tooltip>
                      <Tooltip title={isSelf ? 'Cannot delete your own account' : ''}>
                        <span>
                          <Button
                            size="small"
                            color="error"
                            disabled={isSelf}
                            onClick={() => setDeleting(u)}
                          >
                            Delete
                          </Button>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Add / Edit dialog ── */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {isEdit ? 'Edit User' : 'Add New User'}
        </DialogTitle>

        <DialogContent sx={{ pt: '16px !important' }}>
          {/* ── Basic info section ── */}
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
            ACCOUNT DETAILS
          </Typography>
          <Box sx={{ display: 'grid', gap: 2, mt: 1, mb: 2 }}>
            <TextField
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              autoFocus
            />
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value as User['role'])}
              >
                <MenuItem value="ADMIN">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="ADMIN" size="small" color="error" sx={{ fontSize: 11 }} />
                    <Typography variant="body2">Full system access</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="MANAGER">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="MANAGER" size="small" color="warning" sx={{ fontSize: 11 }} />
                    <Typography variant="body2">Purchases, stock, reports</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="CASHIER">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="CASHIER" size="small" color="success" sx={{ fontSize: 11 }} />
                    <Typography variant="body2">Sales and customers only</Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* ── Password section ── */}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <LockResetIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
              {isEdit ? 'RESET PASSWORD (optional)' : 'SET PASSWORD'}
            </Typography>
          </Box>
          <TextField
            label={isEdit ? 'New Password' : 'Password'}
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            helperText={
              isEdit
                ? 'Leave blank to keep the current password unchanged'
                : 'Minimum 6 characters required'
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPwd((v) => !v)}>
                    {showPwd
                      ? <VisibilityOffIcon fontSize="small" />
                      : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} variant="contained">
            {isEdit ? 'Save Changes' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete confirm dialog ── */}
      <ConfirmDialog
        open={!!deleting}
        title="Delete this user?"
        description={
          deleting
            ? `This will permanently delete the account for ${deleting.name} (${deleting.email}). This action cannot be undone.`
            : undefined
        }
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        confirmLabel="Delete"
      />

      <Toast state={toast} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </Box>
  );
}