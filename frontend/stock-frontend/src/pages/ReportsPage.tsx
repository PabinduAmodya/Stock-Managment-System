import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import { ReportsAPI } from '../api/endpoints';
import { PageHeader } from '../components/PageHeader';
import { Toast, ToastState } from '../components/Toast';
import { fmtLKR } from '../utils/money';

function toISOFromLocal(value: string) {
  if (!value) return '';
  return dayjs(value).format('YYYY-MM-DDTHH:mm:ss');
}

export function ReportsPage() {
  const now = dayjs();
  const [start, setStart] = useState(now.startOf('month').format('YYYY-MM-DDTHH:mm'));
  const [end, setEnd] = useState(now.endOf('day').format('YYYY-MM-DDTHH:mm'));

  const [busy, setBusy] = useState(false);
  const [salesTotal, setSalesTotal] = useState<number | null>(null);
  const [purchaseTotal, setPurchaseTotal] = useState<number | null>(null);
  const [profit, setProfit] = useState<number | null>(null);
  const [salesCount, setSalesCount] = useState<number | null>(null);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  const [toast, setToast] = useState<ToastState>({ open: false, message: '', severity: 'info' });

  const canRun = useMemo(() => !!start && !!end, [start, end]);

  const downloadDailySalesCsv = async () => {
    try {
      const dateISO = dayjs().format('YYYY-MM-DD');
      const blob: Blob = await ReportsAPI.dailySalesCsv(dateISO);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daily_sales_${dateISO}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setToast({ open: true, message: e?.response?.data?.message ?? 'CSV download failed', severity: 'error' });
    }
  };

  const run = async () => {
    if (!canRun) return;
    setBusy(true);
    try {
      const startISO = toISOFromLocal(start);
      const endISO = toISOFromLocal(end);

      const [salesData, purchasesData, profitData] = await Promise.all([
        ReportsAPI.sales(startISO, endISO),
        ReportsAPI.purchases(startISO, endISO),
        ReportsAPI.profit(startISO, endISO)
      ]);

      setSalesTotal(Number(salesData?.totalSalesAmount ?? 0));
      setSalesCount(Number(salesData?.totalTransactions ?? 0));
      setRecentSales(salesData?.recentSales ?? salesData?.sales ?? []);
      setTopProducts(salesData?.topSellingProducts ?? []);
      setPurchaseTotal(Number(purchasesData?.totalPurchaseAmount ?? 0));
      setProfit(Number(profitData?.profit ?? 0));

      setToast({ open: true, message: 'Report generated successfully', severity: 'success' });
    } catch (e: any) {
      setToast({ open: true, message: e?.response?.data?.message ?? 'Report failed', severity: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const profitColor = profit !== null ? (profit >= 0 ? 'success.main' : 'error.main') : 'text.primary';
  const hasResults = salesTotal !== null;

  return (
    <Box>
      <PageHeader title="Reports" subtitle="Sales, purchases and profit summary by date range" />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto' }, gap: 2, alignItems: 'center' }}>
            <TextField
              label="From"
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="To"
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <Button
              variant="contained"
              size="large"
              onClick={run}
              disabled={!canRun || busy}
              sx={{ height: 56, px: 4 }}
            >
              {busy ? <CircularProgress size={20} color="inherit" /> : 'Generate'}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="outlined" onClick={downloadDailySalesCsv}>
              Download Daily Sales CSV (Today)
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Sales Revenue</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                {busy ? <CircularProgress size={22} /> : hasResults ? fmtLKR(salesTotal!) : '—'}
              </Typography>
              {hasResults && (
                <Typography variant="caption" color="text.secondary">
                  {salesCount} transaction{salesCount !== 1 ? 's' : ''}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Purchases Cost</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                {busy ? <CircularProgress size={22} /> : hasResults ? fmtLKR(purchaseTotal!) : '—'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Net Profit</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: profitColor }}>
                {busy ? <CircularProgress size={22} /> : hasResults ? fmtLKR(profit!) : '—'}
              </Typography>
              {hasResults && profit !== null && (
                <Chip
                  label={profit >= 0 ? 'Profitable' : 'Loss'}
                  size="small"
                  color={profit >= 0 ? 'success' : 'error'}
                  sx={{ mt: 0.5 }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Period</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>
                {dayjs(start).format('DD MMM')} — {dayjs(end).format('DD MMM YYYY')}
              </Typography>
              {hasResults && (
                <Typography variant="caption" color="text.secondary">
                  {salesCount} sales recorded
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {hasResults && !busy && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Top Selling Products
                </Typography>
                {topProducts.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No sales data for this period.
                  </Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Units Sold</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topProducts.map((p: any, i: number) => (
                        <TableRow key={p.productId} hover>
                          <TableCell>
                            <Typography sx={{ fontWeight: 700, color: i === 0 ? 'warning.main' : 'text.primary' }}>
                              {i + 1}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                              {p.productName}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip label={p.totalQty} size="small" color="primary" variant="outlined" />
                          </TableCell>
                          <TableCell align="right">{fmtLKR(p.totalRevenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Recent Sales
                </Typography>
                {recentSales.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No sales in this period.
                  </Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Sale #</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Payment</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentSales.slice(0, 10).map((s: any) => (
                        <TableRow key={s.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>#{s.id}</TableCell>
                          <TableCell>{s.date ? dayjs(s.date).format('DD MMM, HH:mm') : '-'}</TableCell>
                          <TableCell>{s.customer?.name ?? s.customerName ?? 'Walk-in'}</TableCell>
                          <TableCell>
                            <Chip label={s.paymentMethod} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>
                            {fmtLKR(s.totalAmount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Toast state={toast} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </Box>
  );
}