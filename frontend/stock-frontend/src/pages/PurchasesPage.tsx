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
import { ProductsAPI, PurchasesAPI, SuppliersAPI } from '../api/endpoints';
import type { Product, Purchase, PurchaseItem, Supplier } from '../types/api';
import { PageHeader } from '../components/PageHeader';
import { Toast, ToastState } from '../components/Toast';
import { fmtLKR, toNumber } from '../utils/money';

type Line = {
    productId: string;
    quantity: number;
    unitPrice: number;
};

export function PurchasesPage() {
    const [rows, setRows] = useState<Purchase[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    const [open, setOpen] = useState(false);
    const [supplierId, setSupplierId] = useState('');
    const [lines, setLines] = useState<Line[]>([{ productId: '', quantity: 1, unitPrice: 0 }]);

    const [toast, setToast] = useState<ToastState>({ open: false, message: '', severity: 'info' });

    const load = async () => {
        const [purchases, s, p] = await Promise.all([PurchasesAPI.list(), SuppliersAPI.list(), ProductsAPI.list()]);
        setRows(purchases);
        setSuppliers(s);
        setProducts(p);
    };

    useEffect(() => {
        load();
    }, []);

    const openCreate = () => {
        setSupplierId('');
        setLines([{ productId: '', quantity: 1, unitPrice: 0 }]);
        setOpen(true);
    };

    const addLine = () => setLines((ls) => [...ls, { productId: '', quantity: 1, unitPrice: 0 }]);

    const removeLine = (idx: number) => setLines((ls) => (ls.length <= 1 ? ls : ls.filter((_, i) => i !== idx)));

    const updateLine = (idx: number, patch: Partial<Line>) =>
        setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

    const total = useMemo(() => {
        return lines.reduce((sum, l) => sum + toNumber(l.unitPrice) * Math.max(0, Math.trunc(toNumber(l.quantity))), 0);
    }, [lines]);

    const submit = async () => {
        if (!supplierId) {
            setToast({ open: true, message: 'Select a supplier', severity: 'warning' });
            return;
        }
        const items: PurchaseItem[] = [];
        for (const l of lines) {
            if (!l.productId) continue;
            const qty = Math.max(1, Math.trunc(toNumber(l.quantity)));
            const unit = Math.max(0, toNumber(l.unitPrice));
            items.push({
                product: { id: Number(l.productId) } as any,
                quantity: qty,
                unitPrice: unit,
                totalPrice: unit * qty
            });
        }
        if (items.length === 0) {
            setToast({ open: true, message: 'Add at least 1 product line', severity: 'warning' });
            return;
        }

        try {
            await PurchasesAPI.create({
                purchase: { supplier: { id: Number(supplierId) } as any },
                items
            });
            setToast({ open: true, message: 'Purchase (GRN) created. Approve it to add stock.', severity: 'success' });
            setOpen(false);
            await load();
        } catch (e: any) {
            setToast({ open: true, message: e?.response?.data?.message ?? 'Create failed', severity: 'error' });
        }
    };

    const approve = async (id: number) => {
        try {
            await PurchasesAPI.approve(id);
            setToast({ open: true, message: `Purchase #${id} approved (stock updated)`, severity: 'success' });
            await load();
        } catch (e: any) {
            setToast({ open: true, message: e?.response?.data?.message ?? 'Approve failed', severity: 'error' });
        }
    };

    const reject = async (id: number) => {
        try {
            await PurchasesAPI.reject(id);
            setToast({ open: true, message: `Purchase #${id} rejected`, severity: 'info' });
            await load();
        } catch (e: any) {
            setToast({ open: true, message: e?.response?.data?.message ?? 'Reject failed', severity: 'error' });
        }
    };

    const printGRN = async (saleId: number) => {
        try {
            const [sale, items] = await Promise.all([
                PurchasesAPI.get(saleId),
                PurchasesAPI.items(saleId)
            ]);

            const customer = sale.supplier?.supplierName ?? "Walk-in";

            const rowsHtml = (items ?? [])
                .map((it: any) => `
        <tr>
          <td>${it.product?.name ?? ""}</td>
          <td>${it.quantity}</td>
          <td>${it.unitPrice}</td>
          <td>${it.totalPrice}</td>
        </tr>
      `)
                .join("");

            const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${sale.id}</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #000; padding: 8px; }
            th { background: #eee; }
            h2 { margin-bottom: 0; }
          </style>
        </head>
        <body>
          <h2>Purchase Invoice</h2>
          <p><b>Invoice #:</b> ${sale.id}</p>
          <p><b>Supplier:</b> ${customer}</p>
          <p><b>Date:</b> ${sale.date}</p>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <h3>Total: ${sale.totalAmount}</h3>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

            const blob = new Blob([html], { type: "text/html" });
            const url = URL.createObjectURL(blob);

            const printWindow = window.open(url, "_blank");

            if (!printWindow) {
                alert("Please allow popups to print.");
                return;
            }

        } catch (err) {
            console.error(err);
            alert("Print failed");
        }
    };

    return (
        <Box>
            <PageHeader
                title="Purchases (GRN)"
                subtitle="Create purchases, then approve to increase stock"
                actionLabel="Create GRN"
                onAction={openCreate}
            />

            <Card>
                <CardContent>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Supplier</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Total</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((r) => (
                                <TableRow key={r.id} hover>
                                    <TableCell>{r.id}</TableCell>
                                    <TableCell>{r.supplier?.supplierName ?? '-'}</TableCell>
                                    <TableCell>{r.date ? dayjs(r.date).format('YYYY-MM-DD HH:mm') : '-'}</TableCell>
                                    <TableCell>{r.status}</TableCell>
                                    <TableCell align="right">{fmtLKR(r.totalAmount)}</TableCell>
                                    <TableCell align="right">
                                        <Button size="small" disabled={r.status !== 'PENDING'} onClick={() => approve(r.id)}>
                                            Approve
                                        </Button>
                                        <Button size="small" disabled={r.status !== 'PENDING'} color="warning" onClick={() => reject(r.id)}>
                                            Reject
                                        </Button>
                                        <Button size="small" disabled={r.status !== 'APPROVED'} onClick={() => printGRN(r.id)}>
                                            Print
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Create Purchase (GRN)</DialogTitle>
                <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>Supplier</InputLabel>
                        <Select label="Supplier" value={supplierId} onChange={(e) => setSupplierId(String(e.target.value))}>
                            <MenuItem value="">Select…</MenuItem>
                            {suppliers.map((s) => (
                                <MenuItem key={s.id} value={String(s.id)}>
                                    {s.supplierName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        Items
                    </Typography>

                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ width: '45%' }}>Product</TableCell>
                                <TableCell style={{ width: '15%' }}>Qty</TableCell>
                                <TableCell style={{ width: '20%' }}>Unit Price</TableCell>
                                <TableCell style={{ width: '20%' }} align="right">
                                    Total
                                </TableCell>
                                <TableCell align="right"> </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {lines.map((l, idx) => {
                                const qty = Math.max(1, Math.trunc(toNumber(l.quantity)));
                                const unit = Math.max(0, toNumber(l.unitPrice));
                                const lineTotal = unit * qty;

                                return (
                                    <TableRow key={idx}>
                                        <TableCell>
                                            <FormControl fullWidth size="small">
                                                <Select
                                                    value={l.productId}
                                                    displayEmpty
                                                    onChange={(e) => {
                                                        const pid = String(e.target.value);
                                                        const p = products.find((x) => String(x.id) === pid);
                                                        updateLine(idx, { productId: pid, unitPrice: p ? toNumber(p.costPrice) : 0 });
                                                    }}
                                                >
                                                    <MenuItem value="">Select product…</MenuItem>
                                                    {products.map((p) => (
                                                        <MenuItem key={p.id} value={String(p.id)}>
                                                            {p.name} (In stock: {p.quantity})
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={l.quantity}
                                                onChange={(e) => updateLine(idx, { quantity: toNumber(e.target.value, 1) })}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={l.unitPrice}
                                                onChange={(e) => updateLine(idx, { unitPrice: toNumber(e.target.value) })}
                                            />
                                        </TableCell>
                                        <TableCell align="right">{fmtLKR(lineTotal)}</TableCell>
                                        <TableCell align="right">
                                            <Button size="small" color="error" onClick={() => removeLine(idx)}>
                                                Remove
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <Button onClick={addLine}>+ Add line</Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Typography sx={{ fontWeight: 800 }}>Total: {fmtLKR(total)}</Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={submit} variant="contained">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            <Toast state={toast} onClose={() => setToast((t) => ({ ...t, open: false }))} />
        </Box>
    );
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}