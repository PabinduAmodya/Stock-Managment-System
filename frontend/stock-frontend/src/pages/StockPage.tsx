import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import { ProductsAPI, StockAPI } from '../api/endpoints';
import type { Product, Stock } from '../types/api';
import { PageHeader } from '../components/PageHeader';
import { Toast, ToastState } from '../components/Toast';
import { toNumber } from '../utils/money';

export function StockPage() {
  const [rows, setRows] = useState<Stock[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [toast, setToast] = useState<ToastState>({ open: false, message: '', severity: 'info' });

  const [productId, setProductId] = useState('');
  const [adjustment, setAdjustment] = useState<number>(0);
  const [note, setNote] = useState('');

  // Filter state for history table
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PURCHASE' | 'ADJUSTMENT'>('ALL');
  const [filterProduct, setFilterProduct] = useState('');

  const load = async () => {
    const [h, p] = await Promise.all([StockAPI.history(), ProductsAPI.list()]);
    setRows(h);
    setProducts(p);
  };

  useEffect(() => { load(); }, []);

  const selectedProduct = useMemo(
    () => products.find((p) => String(p.id) === productId) ?? null,
    [products, productId]
  );

  const submit = async () => {
    if (!productId) {
      setToast({ open: true, message: 'Select a product', severity: 'warning' });
      return;
    }
    if (!Number.isFinite(adjustment) || adjustment === 0) {
      setToast({ open: true, message: 'Adjustment must be a non-zero number', severity: 'warning' });
      return;
    }
    if (!note.trim()) {
      setToast({ open: true, message: 'Please enter a reason / note', severity: 'warning' });
      return;
    }
    try {
      await StockAPI.adjust(Number(productId), { adjustment, note: note.trim() });
      setToast({
        open: true,
        message: `Stock ${adjustment > 0 ? 'increased' : 'decreased'} by ${Math.abs(adjustment)} units`,
        severity: 'success'
      });
      setAdjustment(0);
      setNote('');
      await load();
    } catch (e: any) {
      setToast({ open: true, message: e?.response?.data?.message ?? 'Adjustment failed', severity: 'error' });
    }
  };

  // Filtered + sorted history
  const filteredRows = useMemo(() => {
    return rows
      .filter((r) => typeFilter === 'ALL' || r.type === typeFilter)
      .filter((r) => !filterProduct || String(r.product?.id) === filterProduct)
      .slice()
      .sort((a, b) => (a.date && b.date ? b.date.localeCompare(a.date) : 0));
  }, [rows, typeFilter, filterProduct]);

  const typeChipColor = (type: string) => {
    if (type === 'PURCHASE') return 'primary';
    return 'default';
  };

  return (
    <Box>
      <PageHeader title="Stock" subtitle="Manual adjustments and full stock movement history" />

      {/* Adjustment card */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Stock Adjustment
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 2fr auto' }, gap: 2, alignItems: 'flex-start' }}>
            <FormControl fullWidth>
              <InputLabel>Product</InputLabel>
              <Select
                label="Product"
                value={productId}
                onChange={(e) => setProductId(String(e.target.value))}
              >
                <MenuItem value="">Select…</MenuItem>
                {products.map((p) => (
                  <MenuItem key={p.id} value={String(p.id)}>
                    {p.name} — stock: {p.quantity}
                  </MenuItem>
                ))}
              </Select>
              {selectedProduct && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 0.5 }}>
                  Current stock: <strong>{selectedProduct.quantity}</strong> units
                  {adjustment !== 0 && (
                    <> → after: <strong style={{ color: (selectedProduct.quantity + adjustment) < 0 ? 'red' : 'green' }}>
                      {selectedProduct.quantity + adjustment}
                    </strong></>
                  )}
                </Typography>
              )}
            </FormControl>

            <TextField
              label="Qty (+/-)"
              type="number"
              value={adjustment}
              onChange={(e) => setAdjustment(Math.trunc(toNumber(e.target.value)))}
              helperText="Use negative to reduce"
            />

            <TextField
              label="Reason / Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              helperText="Required — e.g. Damaged goods, Recount"
            />

            <Button
              variant="contained"
              onClick={submit}
              sx={{ height: 56 }}
              color={adjustment < 0 ? 'error' : 'primary'}
            >
              Apply
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* History card */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Stock History
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Filter by product */}
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Filter by Product</InputLabel>
                <Select
                  label="Filter by Product"
                  value={filterProduct}
                  onChange={(e) => setFilterProduct(String(e.target.value))}
                >
                  <MenuItem value="">All Products</MenuItem>
                  {products.map((p) => (
                    <MenuItem key={p.id} value={String(p.id)}>{p.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Filter by type */}
              <ToggleButtonGroup
                size="small"
                value={typeFilter}
                exclusive
                onChange={(_, v) => v && setTypeFilter(v)}
              >
                <ToggleButton value="ALL">All</ToggleButton>
                <ToggleButton value="PURCHASE">Purchase</ToggleButton>
                <ToggleButton value="ADJUSTMENT">Adjustment</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Qty Change</TableCell>
                <TableCell>Note / Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ color: 'text.secondary', py: 3 }}>
                    No stock movements found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{r.id}</TableCell>
                    <TableCell>{r.date ? dayjs(r.date).format('YYYY-MM-DD HH:mm') : '-'}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                        {r.product?.name ?? '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.type}
                        size="small"
                        color={typeChipColor(r.type)}
                        variant={r.type === 'PURCHASE' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: r.quantityAdded > 0 ? 'success.main' : 'error.main'
                        }}
                      >
                        {r.quantityAdded > 0 ? `+${r.quantityAdded}` : r.quantityAdded}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>
                      {r.note ?? '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {filteredRows.length > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Showing {filteredRows.length} record{filteredRows.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Toast state={toast} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </Box>
  );
}