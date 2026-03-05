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
import { SuppliersAPI } from '../api/endpoints';
import type { Supplier } from '../types/api';
import { PageHeader } from '../components/PageHeader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Toast, ToastState } from '../components/Toast';

export function SuppliersPage() {
  const [rows, setRows] = useState<Supplier[]>([]);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<Supplier | null>(null);
  const [toast, setToast] = useState<ToastState>({ open: false, message: '', severity: 'info' });

  const [id, setId] = useState<number>(0);
  const [supplierName, setSupplierName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const isEdit = useMemo(() => id !== 0, [id]);

  const load = async () => setRows(await SuppliersAPI.list());
  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setId(0);
    setSupplierName('');
    setCompanyName('');
    setContactNumber('');
    setEmail('');
    setAddress('');
    setOpen(true);
  };

  const openEdit = (s: Supplier) => {
    setId(s.id);
    setSupplierName(s.supplierName);
    setCompanyName(s.companyName ?? '');
    setContactNumber(s.contactNumber ?? '');
    setEmail(s.email ?? '');
    setAddress(s.address ?? '');
    setOpen(true);
  };

  const save = async () => {
    if (!supplierName.trim()) {
      setToast({ open: true, message: 'Supplier name is required', severity: 'warning' });
      return;
    }
    const payload = {
      supplierName: supplierName.trim(),
      companyName: companyName.trim() || null,
      contactNumber: contactNumber.trim() || null,
      email: email.trim() || null,
      address: address.trim() || null
    };
    try {
      if (isEdit) await SuppliersAPI.update(id, payload);
      else await SuppliersAPI.create(payload);
      setToast({ open: true, message: isEdit ? 'Supplier updated' : 'Supplier created', severity: 'success' });
      setOpen(false);
      await load();
    } catch (e: any) {
      setToast({ open: true, message: e?.response?.data?.message ?? 'Save failed', severity: 'error' });
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await SuppliersAPI.remove(deleting.id);
      setToast({ open: true, message: 'Supplier deleted', severity: 'success' });
      setDeleting(null);
      await load();
    } catch (e: any) {
      setToast({ open: true, message: e?.response?.data?.message ?? 'Delete failed', severity: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader title="Suppliers" actionLabel="Add Supplier" onAction={openCreate} />

      <Card>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Address</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700 }}>{s.supplierName}</Typography>
                  </TableCell>
                  <TableCell>{s.companyName ?? '-'}</TableCell>
                  <TableCell>{s.contactNumber ?? '-'}</TableCell>
                  <TableCell>{s.email ?? '-'}</TableCell>
                  <TableCell>{s.address ?? '-'}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => openEdit(s)}>
                      Edit
                    </Button>
                    <Button size="small" color="error" onClick={() => setDeleting(s)}>
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
        <DialogTitle>{isEdit ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <TextField label="Supplier Name" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} />
          <TextField label="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          <TextField label="Contact Number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
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
        title="Delete supplier?"
        description={deleting ? `This will delete: ${deleting.supplierName}` : undefined}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        confirmLabel="Delete"
      />

      <Toast state={toast} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </Box>
  );
}
