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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import { UsersAPI } from '../api/endpoints';
import type { User } from '../types/api';
import { PageHeader } from '../components/PageHeader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Toast, ToastState } from '../components/Toast';

export function UsersPage() {
  const [rows, setRows] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [toast, setToast] = useState<ToastState>({ open: false, message: '', severity: 'info' });

  const [id, setId] = useState<number>(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<User['role']>('CASHIER');

  const isEdit = useMemo(() => id !== 0, [id]);

  const load = async () => setRows(await UsersAPI.list());
  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setId(0);
    setName('');
    setEmail('');
    setPassword('');
    setRole('CASHIER');
    setOpen(true);
  };

  const openEdit = (u: User) => {
    setId(u.id);
    setName(u.name);
    setEmail(u.email);
    setPassword('');
    setRole(u.role);
    setOpen(true);
  };

  const save = async () => {
    if (!name.trim() || !email.trim()) {
      setToast({ open: true, message: 'Name and email are required', severity: 'warning' });
      return;
    }
    try {
      if (!isEdit) {
        if (!password) {
          setToast({ open: true, message: 'Password is required to create user', severity: 'warning' });
          return;
        }
        await UsersAPI.create({ name: name.trim(), email: email.trim(), password, role, status: 'ACTIVE' } as any);
        setToast({ open: true, message: 'User created', severity: 'success' });
      } else {
        await UsersAPI.update(id, { name: name.trim(), email: email.trim(), role } as any);
        if (password) {
          await UsersAPI.resetPassword(id, { password });
        }
        setToast({ open: true, message: 'User updated', severity: 'success' });
      }
      setOpen(false);
      await load();
    } catch (e: any) {
      setToast({ open: true, message: e?.response?.data?.message ?? 'Save failed', severity: 'error' });
    }
  };

  const toggleStatus = async (u: User) => {
    try {
      if (u.status === 'ACTIVE') await UsersAPI.deactivate(u.id);
      else await UsersAPI.activate(u.id);
      setToast({ open: true, message: 'Status updated', severity: 'success' });
      await load();
    } catch (e: any) {
      setToast({ open: true, message: e?.response?.data?.message ?? 'Update failed', severity: 'error' });
    }
  };

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
      <PageHeader title="Users" subtitle="Admin / Manager / Cashier" actionLabel="Add User" onAction={openCreate} />

      <Card>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700 }}>{u.name}</Typography>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip label={u.role} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip label={u.status} size="small" color={u.status === 'ACTIVE' ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell>{u.createdAt ? dayjs(u.createdAt).format('YYYY-MM-DD') : '-'}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => openEdit(u)}>
                      Edit
                    </Button>
                    <Button size="small" onClick={() => toggleStatus(u)}>
                      {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button size="small" color="error" onClick={() => setDeleting(u)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select label="Role" value={role} onChange={(e) => setRole(e.target.value as any)}>
              <MenuItem value="ADMIN">ADMIN</MenuItem>
              <MenuItem value="MANAGER">MANAGER</MenuItem>
              <MenuItem value="CASHIER">CASHIER</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label={isEdit ? 'New Password (optional)' : 'Password'}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText={isEdit ? 'Leave empty to keep current password' : undefined}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        title="Delete user?"
        description={deleting ? `This will delete: ${deleting.email}` : undefined}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        confirmLabel="Delete"
      />

      <Toast state={toast} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </Box>
  );
}
