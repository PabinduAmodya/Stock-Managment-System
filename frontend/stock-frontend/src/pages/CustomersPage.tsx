import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { CustomersAPI } from '../api/endpoints';
import type { Customer } from '../types/api';
import { PageHeader } from '../components/PageHeader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Toast, ToastState } from '../components/Toast';

export function CustomersPage() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [toast, setToast] = useState<ToastState>({ open: false, message: '', severity: 'info' });

  const [id, setId] = useState<number>(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const isEdit = useMemo(() => id !== 0, [id]);

  const load = async () => setRows(await CustomersAPI.list());
  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setId(0);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setOpen(true);
  };

  const openEdit = (c: Customer) => {
    setId(c.id);
    setName(c.name);
    setPhone(c.phone ?? '');
    setEmail(c.email ?? '');
    setAddress(c.address ?? '');
    setOpen(true);
  };

  const save = async () => {
    if (!name.trim()) {
      setToast({ open: true, message: 'Customer name is required', severity: 'warning' });
      return;
    }
    const payload = {
      name: name.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      address: address.trim() || null
    };
    try {
      if (isEdit) await CustomersAPI.update(id, payload);
      else await CustomersAPI.create(payload);
      setToast({ open: true, message: isEdit ? 'Customer updated' : 'Customer created', severity: 'success' });
      setOpen(false);
      await load();
    } catch (e: any) {
      setToast({ open: true, message: e?.response?.data?.message ?? 'Save failed', severity: 'error' });
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await CustomersAPI.remove(deleting.id);
      setToast({ open: true, message: 'Customer deleted', severity: 'success' });
      setDeleting(null);
      await load();
    } catch (e: any) {
      setToast({ open: true, message: e?.response?.data?.message ?? 'Delete failed', severity: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader title="Customers" actionLabel="Add Customer" onAction={openCreate} />

      <Card>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Address</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700 }}>{c.name}</Typography>
                  </TableCell>
                  <TableCell>{c.phone ?? '-'}</TableCell>
                  <TableCell>{c.email ?? '-'}</TableCell>
                  <TableCell>{c.address ?? '-'}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => openEdit(c)}>
                      Edit
                    </Button>
                    <Button size="small" color="error" onClick={() => setDeleting(c)}>
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
        <DialogTitle>{isEdit ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
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
        title="Delete customer?"
        description={deleting ? `This will delete: ${deleting.name}` : undefined}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        confirmLabel="Delete"
      />

      <Toast state={toast} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </Box>
  );
}
