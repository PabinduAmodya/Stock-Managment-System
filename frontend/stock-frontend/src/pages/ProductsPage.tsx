import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
import { CategoriesAPI, ProductsAPI, SuppliersAPI } from '../api/endpoints';
import type { Category, Product, Supplier } from '../types/api';
import { PageHeader } from '../components/PageHeader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Toast, ToastState } from '../components/Toast';
import { fmtLKR, toNumber } from '../utils/money';

const emptyForm = {
  id: 0,
  name: '',
  barcode: '',
  price: 0,
  costPrice: 0,
  quantity: 0,
  reorderLevel: 10,
  categoryId: '',
  supplierId: ''
};

type FormState = typeof emptyForm;

export function ProductsPage() {
  const [rows, setRows] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [toast, setToast] = useState<ToastState>({ open: false, message: '', severity: 'info' });

  const isEdit = useMemo(() => form.id !== 0, [form.id]);

  const load = async () => {
    const [p, c, s] = await Promise.all([ProductsAPI.list(), CategoriesAPI.list(), SuppliersAPI.list()]);
    setRows(p);
    setCategories(c);
    setSuppliers(s);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setOpen(true); };

  const openEdit = (p: Product) => {
    setForm({
      id: p.id,
      name: p.name,
      barcode: p.barcode ?? '',
      price: toNumber(p.price),
      costPrice: toNumber(p.costPrice),
      quantity: p.quantity ?? 0,
      reorderLevel: p.reorderLevel ?? 10,
      categoryId: p.category?.id ? String(p.category.id) : '',
      supplierId: p.supplier?.id ? String(p.supplier.id) : ''
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      setToast({ open: true, message: 'Product name is required', severity: 'warning' });
      return;
    }
    if (form.price < 0 || form.costPrice < 0) {
      setToast({ open: true, message: 'Price/Cost cannot be negative', severity: 'warning' });
      return;
    }

    const payload: any = {
      name: form.name.trim(),
      barcode: form.barcode.trim() || null,
      price: form.price,
      costPrice: form.costPrice,
      quantity: form.quantity,
      reorderLevel: form.reorderLevel,
      category: form.categoryId ? { id: Number(form.categoryId) } : null,
      supplier: form.supplierId ? { id: Number(form.supplierId) } : null
    };

    try {
      if (isEdit) {
        await ProductsAPI.update(form.id, payload);
        setToast({ open: true, message: 'Product updated', severity: 'success' });
      } else {
        await ProductsAPI.create(payload);
        setToast({
          open: true,
          message: form.quantity > 0
            ? `Product created with opening stock of ${form.quantity} units`
            : 'Product created',
          severity: 'success'
        });
      }
      setOpen(false);
      await load();
    } catch (e: any) {
      setToast({ open: true, message: e?.response?.data?.message ?? 'Save failed', severity: 'error' });
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await ProductsAPI.remove(deleting.id);
      setToast({ open: true, message: 'Product deleted', severity: 'success' });
      setDeleting(null);
      await load();
    } catch (e: any) {
      setToast({ open: true, message: e?.response?.data?.message ?? 'Delete failed', severity: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Products"
        subtitle="Manage products, prices, barcode and reorder levels"
        actionLabel="Add Product"
        onAction={openCreate}
      />

      <Card>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Barcode</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell align="right">Sell Price</TableCell>
                <TableCell align="right">Cost</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Reorder</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700 }}>{p.name}</Typography>
                  </TableCell>
                  <TableCell>{p.barcode ?? '-'}</TableCell>
                  <TableCell>{p.category?.categoryName ?? '-'}</TableCell>
                  <TableCell>{p.supplier?.supplierName ?? '-'}</TableCell>
                  <TableCell align="right">{fmtLKR(p.price)}</TableCell>
                  <TableCell align="right">{fmtLKR(p.costPrice)}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={p.quantity}
                      size="small"
                      color={p.quantity <= p.reorderLevel ? 'error' : 'success'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">{p.reorderLevel}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => openEdit(p)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => setDeleting(p)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <TextField
            label="Barcode (optional)"
            value={form.barcode}
            onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))}
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Selling Price (LKR)"
              type="number"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: toNumber(e.target.value) }))}
            />
            <TextField
              label="Cost Price (LKR)"
              type="number"
              value={form.costPrice}
              onChange={(e) => setForm((f) => ({ ...f, costPrice: toNumber(e.target.value) }))}
            />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label={isEdit ? 'Stock Quantity' : 'Opening Stock Qty'}
              type="number"
              value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: Math.max(0, Math.trunc(toNumber(e.target.value))) }))}
              helperText={isEdit ? 'Current stock on hand' : 'Initial stock on hand'}
            />
            <TextField
              label="Reorder Level"
              type="number"
              value={form.reorderLevel}
              onChange={(e) => setForm((f) => ({ ...f, reorderLevel: Math.max(0, Math.trunc(toNumber(e.target.value))) }))}
              helperText="Alert threshold"
            />
          </Box>

          {/* Only show opening stock notice on create */}
          {!isEdit && form.quantity > 0 && (
            <Alert severity="info" sx={{ py: 0.5 }}>
              An opening stock entry of <strong>{form.quantity} units</strong> will be recorded in stock history.
            </Alert>
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: String(e.target.value) }))}
              >
                <MenuItem value="">None</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>{c.categoryName}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Supplier</InputLabel>
              <Select
                label="Supplier"
                value={form.supplierId}
                onChange={(e) => setForm((f) => ({ ...f, supplierId: String(e.target.value) }))}
              >
                <MenuItem value="">None</MenuItem>
                {suppliers.map((s) => (
                  <MenuItem key={s.id} value={String(s.id)}>{s.supplierName}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        title="Delete product?"
        description={deleting ? `This will permanently delete: ${deleting.name}` : undefined}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        confirmLabel="Delete"
      />

      <Toast state={toast} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </Box>
  );
}
