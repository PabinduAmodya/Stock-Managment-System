import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';
import { CategoriesAPI, CustomersAPI, ProductsAPI, PurchasesAPI, SalesAPI, SuppliersAPI } from '../api/endpoints';
import { useAuth } from '../auth/AuthContext';
import { fmtLKR } from '../utils/money';

function buildDailySales(sales: any[]) {
  const days: Record<string, { total: number; count: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const key = dayjs().subtract(i, 'day').format('MMM DD');
    days[key] = { total: 0, count: 0 };
  }
  for (const s of sales) {
    if (!s.date) continue;
    const key = dayjs(s.date).format('MMM DD');
    if (days[key]) {
      days[key].total += Number(s.totalAmount ?? 0);
      days[key].count += 1;
    }
  }
  return Object.entries(days).map(([date, v]) => ({ date, total: v.total, count: v.count }));
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 2, px: 2, py: 1.5, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 800, color: '#1976d2' }}>{fmtLKR(payload[0]?.value ?? 0)}</Typography>
      <Typography variant="caption" color="text.secondary">
        {payload[1]?.value ?? 0} sale{payload[1]?.value !== 1 ? 's' : ''}
      </Typography>
    </Box>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const [busy, setBusy] = useState(true);
  const [counts, setCounts] = useState({
    products: 0,
    categories: 0,
    suppliers: 0,
    customers: 0,
    purchases: 0,
    sales: 0
  });
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [allSales, setAllSales] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setBusy(true);
      try {
        if (isAdminOrManager) {
          const [products, categories, suppliers, customers, purchases, sales, low] = await Promise.all([
            ProductsAPI.list(),
            CategoriesAPI.list(),
            SuppliersAPI.list(),
            CustomersAPI.list(),
            PurchasesAPI.list(),
            SalesAPI.list(),
            ProductsAPI.lowStock()
          ]);
          setCounts({
            products: products.length,
            categories: categories.length,
            suppliers: suppliers.length,
            customers: customers.length,
            purchases: purchases.length,
            sales: sales.length
          });
          setLowStock(low);
          setAllSales(sales);
        } else {
          // Cashier: only call APIs they are allowed to access
          const [products, categories, customers, sales] = await Promise.all([
            ProductsAPI.list(),
            CategoriesAPI.list(),
            CustomersAPI.list(),
            SalesAPI.list()
          ]);
          setCounts({
            products: products.length,
            categories: categories.length,
            suppliers: 0,
            customers: customers.length,
            purchases: 0,
            sales: sales.length
          });
          setAllSales(sales);
        }
      } catch (e) {
        console.error('Dashboard load error:', e);
      } finally {
        setBusy(false);
      }
    })();
  }, [isAdminOrManager]);

  const cards = useMemo(() => {
    if (isAdminOrManager) {
      return [
        { label: 'Products',   value: counts.products,   color: '#1976d2' },
        { label: 'Categories', value: counts.categories, color: '#7b1fa2' },
        { label: 'Suppliers',  value: counts.suppliers,  color: '#0288d1' },
        { label: 'Customers',  value: counts.customers,  color: '#388e3c' },
        { label: 'Purchases',  value: counts.purchases,  color: '#f57c00' },
        { label: 'Sales',      value: counts.sales,      color: '#d32f2f' }
      ];
    }
    return [
      { label: 'Products',   value: counts.products,   color: '#1976d2' },
      { label: 'Categories', value: counts.categories, color: '#7b1fa2' },
      { label: 'Customers',  value: counts.customers,  color: '#388e3c' },
      { label: 'Sales',      value: counts.sales,      color: '#d32f2f' }
    ];
  }, [counts, isAdminOrManager]);

  const chartData = useMemo(() => buildDailySales(allSales), [allSales]);

  const todayTotal = useMemo(() => {
    const todayKey = dayjs().format('MMM DD');
    return chartData.find((d) => d.date === todayKey)?.total ?? 0;
  }, [chartData]);

  const last7Total = useMemo(() => {
    return chartData.slice(-7).reduce((sum, d) => sum + d.total, 0);
  }, [chartData]);

  return (
    <Box>
      {busy ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {cards.map((c) => (
              <Grid key={c.label} item xs={12} sm={6} md={4} lg={isAdminOrManager ? 2 : 3}>
                <Card sx={{ borderTop: `4px solid ${c.color}` }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">{c.label}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: c.color }}>{c.value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Daily Sales — Last 30 Days</Typography>
                  <Typography variant="body2" color="text.secondary">Revenue per day</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">Today</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1976d2', lineHeight: 1.2 }}>
                      {fmtLKR(todayTotal)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">Last 7 Days</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#388e3c', lineHeight: 1.2 }}>
                      {fmtLKR(last7Total)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {chartData.every((d) => d.total === 0) ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                  <Typography variant="body2" color="text.secondary">No sales data in the last 30 days.</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#1976d2" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#1976d2" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888' }} tickLine={false} axisLine={false} interval={4} />
                    <YAxis tick={{ fontSize: 11, fill: '#888' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={45} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="total" stroke="#1976d2" strokeWidth={2.5} fill="url(#salesGradient)" dot={false} activeDot={{ r: 5, fill: '#1976d2' }} />
                    <Area type="monotone" dataKey="count" stroke="transparent" fill="transparent" legendType="none" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Grid container spacing={2}>
            {isAdminOrManager && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Low Stock Alerts</Typography>
                    {lowStock.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No low-stock items.</Typography>
                    ) : (
                      <List dense>
                        {lowStock.slice(0, 10).map((p: any) => (
                          <ListItem key={p.id} divider>
                            <ListItemText
                              primary={`${p.name} (Qty: ${p.quantity}, Reorder: ${p.reorderLevel})`}
                              secondary={`Sell: ${fmtLKR(p.price)} • Cost: ${fmtLKR(p.costPrice)}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12} md={isAdminOrManager ? 6 : 12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Tips</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isAdminOrManager ? (
                      <>
                        • Add Categories → Suppliers → Products first.<br />
                        • Purchases (GRN) increase product quantities.<br />
                        • Sales decrease product quantities.<br />
                        • Stock Adjustments can fix mismatches.
                      </>
                    ) : (
                      <>
                        • Select a customer or enter a walk-in name when creating a sale.<br />
                        • Check product stock levels before adding items to a sale.<br />
                        • Use the Print button on any sale to get a printable invoice.
                      </>
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}