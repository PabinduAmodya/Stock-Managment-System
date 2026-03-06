import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';
import LinkIcon from '@mui/icons-material/Link';
import { CategoriesAPI, ProductsAPI } from '../api/endpoints';
import type { Category, Product } from '../types/api';
import { PageHeader } from '../components/PageHeader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Toast, ToastState } from '../components/Toast';
import { fmtLKR } from '../utils/money';

/* ─────────────────────────── helpers ──────────────────────────── */

/** Build a map: categoryId → Product[] from the full product list */
function buildProductMap(products: Product[]): Record<number, Product[]> {
  const map: Record<number, Product[]> = {};
  products.forEach((p) => {
    const catId = p.category?.id;
    if (catId) {
      if (!map[catId]) map[catId] = [];
      map[catId].push(p);
    }
  });
  return map;
}

/* ─────────────────────────── component ────────────────────────── */

export function CategoriesPage() {
  /* ── data state ─────────────────────────────────────────────── */
  const [rows, setRows] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productMap, setProductMap] = useState<Record<number, Product[]>>({});

  /* ── UI state ───────────────────────────────────────────────── */
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);                       // CRUD dialog
  const [mappingOpen, setMappingOpen] = useState(false);          // product-mapping dialog
  const [mappingCategory, setMappingCategory] = useState<Category | null>(null);
  const [mappingSelected, setMappingSelected] = useState<Set<number>>(new Set());
  const [mappingSearch, setMappingSearch] = useState('');
  const [mappingSaving, setMappingSaving] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [toast, setToast] = useState<ToastState>({ open: false, message: '', severity: 'info' });

  /* ── form state (CRUD) ─────────────────────────────────────── */
  const [id, setId] = useState<number>(0);
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const isEdit = useMemo(() => id !== 0, [id]);

  /* ── data loading ───────────────────────────────────────────── */
  const load = async () => {
    try {
      const [cats, prods] = await Promise.all([CategoriesAPI.list(), ProductsAPI.list()]);
      setRows(cats);
      setAllProducts(prods);
      setProductMap(buildProductMap(prods));
    } catch (e: any) {
      setToast({ open: true, message: e?.response?.data?.message ?? 'Failed to load data', severity: 'error' });
    }
  };

  useEffect(() => { load(); }, []);

  /* ── filtered rows ──────────────────────────────────────────── */
  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (c: Category) =>
        c.categoryName.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q)
    );
  }, [rows, search]);

  /* ──────────────── CRUD handlers ────────────────────────────── */
  const openCreate = () => {
    setId(0);
    setCategoryName('');
    setDescription('');
    setOpen(true);
  };

  const openEdit = (c: Category) => {
    setId(c.id);
    setCategoryName(c.categoryName);
    setDescription(c.description ?? '');
    setOpen(true);
  };

  const save = async () => {
    if (!categoryName.trim()) {
      setToast({ open: true, message: 'Category name is required', severity: 'warning' });
      return;
    }
    try {
      const payload = { categoryName: categoryName.trim(), description: description.trim() || null };
      if (isEdit) await CategoriesAPI.update(id, payload);
      else await CategoriesAPI.create(payload);
      setToast({ open: true, message: isEdit ? 'Category updated' : 'Category created', severity: 'success' });
      setOpen(false);
      await load();
    } catch (e: any) {
      setToast({ open: true, message: e?.response?.data?.message ?? 'Save failed', severity: 'error' });
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await CategoriesAPI.remove(deleting.id);
      setToast({ open: true, message: 'Category deleted', severity: 'success' });
      setDeleting(null);
      await load();
    } catch (e: any) {
      setToast({ open: true, message: e?.response?.data?.message ?? 'Delete failed', severity: 'error' });
    }
  };

  /* ──────────────── Product Mapping handlers ─────────────────── */
  const openMapping = (c: Category) => {
    setMappingCategory(c);
    // Pre-select products currently in this category
    const currentIds = (productMap[c.id] ?? []).map((p: Product) => p.id);
    setMappingSelected(new Set(currentIds));
    setMappingSearch('');
    setMappingOpen(true);
  };

  const toggleProduct = (productId: number) => {
    setMappingSelected((prev: Set<number>) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const saveMapping = async () => {
    if (!mappingCategory) return;
    setMappingSaving(true);
    try {
      const catId = mappingCategory.id;
      const currentlyMapped = new Set((productMap[catId] ?? []).map((p: Product) => p.id));

      // Products to add to this category
      const toAdd: number[] = [...mappingSelected].filter((pid: number) => !currentlyMapped.has(pid));
      // Products to remove from this category
      const toRemove: number[] = [...currentlyMapped].filter((pid: number) => !mappingSelected.has(pid));

      const promises: Promise<any>[] = [];

      // Assign category to newly selected products
      toAdd.forEach((pid: number) => {
        const prod = allProducts.find((p: Product) => p.id === pid);
        if (prod) {
          promises.push(
            ProductsAPI.update(pid, { category: { id: catId } as any })
          );
        }
      });

      // Remove category from deselected products (set category to null)
      toRemove.forEach((pid: number) => {
        promises.push(
          ProductsAPI.update(pid, { category: null } as any)
        );
      });

      await Promise.all(promises);

      setToast({
        open: true,
        message: `Product mapping updated — ${toAdd.length} added, ${toRemove.length} removed`,
        severity: 'success'
      });
      setMappingOpen(false);
      await load();
    } catch (e: any) {
      setToast({ open: true, message: e?.response?.data?.message ?? 'Mapping update failed', severity: 'error' });
    } finally {
      setMappingSaving(false);
    }
  };

  const filteredMappingProducts = useMemo(() => {
    if (!mappingSearch.trim()) return allProducts;
    const q = mappingSearch.toLowerCase();
    return allProducts.filter(
      (p: Product) =>
        p.name.toLowerCase().includes(q) ||
        (p.barcode ?? '').toLowerCase().includes(q)
    );
  }, [allProducts, mappingSearch]);

  /* ──────────────── Row expand toggle ────────────────────────── */
  const toggleExpand = (catId: number) =>
    setExpandedId((prev: number | null) => (prev === catId ? null : catId));

  /* ──────────────────────── render ────────────────────────────── */
  return (
    <Box>
      <PageHeader
        title="Categories"
        subtitle="Manage categories and map products to them"
        actionLabel="Add Category"
        onAction={openCreate}
      />

      {/* Search bar */}
      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search categories…"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
          sx={{ width: { xs: '100%', sm: 320 } }}
        />
      </Box>

      <Card>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={40} />
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Products</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((c: Category) => {
                const mappedProducts = productMap[c.id] ?? [];
                const isExpanded = expandedId === c.id;

                return (
                  <React.Fragment key={c.id}>
                    {/* ── Main row ── */}
                    <TableRow hover>
                      <TableCell>
                        <IconButton size="small" onClick={() => toggleExpand(c.id)}>
                          {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>{c.id}</TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700 }}>{c.categoryName}</Typography>
                      </TableCell>
                      <TableCell>{c.description ?? '-'}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={mappedProducts.length}
                          size="small"
                          color={mappedProducts.length > 0 ? 'primary' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Map Products">
                          <IconButton size="small" color="primary" onClick={() => openMapping(c)}>
                            <LinkIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Button size="small" onClick={() => openEdit(c)}>Edit</Button>
                        <Button size="small" color="error" onClick={() => setDeleting(c)}>Delete</Button>
                      </TableCell>
                    </TableRow>

                    {/* ── Expanded product list ── */}
                    <TableRow>
                      <TableCell colSpan={6} sx={{ py: 0, borderBottom: isExpanded ? undefined : 'none' }}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ py: 2, pl: 4 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Products in "{c.categoryName}"
                            </Typography>
                            {mappedProducts.length === 0 ? (
                              <Typography variant="body2" color="text.secondary">
                                No products mapped to this category.
                              </Typography>
                            ) : (
                              <Table size="small" sx={{ maxWidth: 800 }}>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Product</TableCell>
                                    <TableCell>Barcode</TableCell>
                                    <TableCell align="right">Price</TableCell>
                                    <TableCell align="right">Qty</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {mappedProducts.map((p: Product) => (
                                    <TableRow key={p.id}>
                                      <TableCell>{p.name}</TableCell>
                                      <TableCell>{p.barcode ?? '-'}</TableCell>
                                      <TableCell align="right">{fmtLKR(p.price)}</TableCell>
                                      <TableCell align="right">
                                        <Chip
                                          label={p.quantity}
                                          size="small"
                                          color={p.quantity <= p.reorderLevel ? 'error' : 'success'}
                                          variant="outlined"
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {search ? 'No categories match your search.' : 'No categories yet.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ──────────── CRUD Dialog (Create / Edit) ──────────────── */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <TextField
            label="Category Name"
            value={categoryName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategoryName(e.target.value)}
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
            multiline
            minRows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* ──────────── Product Mapping Dialog ───────────────────── */}
      <Dialog open={mappingOpen} onClose={() => setMappingOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Map Products → {mappingCategory?.categoryName}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Check the products that should belong to this category. Unchecking a product removes it from
            this category.
          </Typography>

          <TextField
            size="small"
            fullWidth
            placeholder="Search products…"
            value={mappingSearch}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMappingSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
            sx={{ mb: 1 }}
          />

          <Divider />

          <List dense sx={{ maxHeight: 360, overflow: 'auto' }}>
            {filteredMappingProducts.map((p: Product) => {
              const checked = mappingSelected.has(p.id);
              const otherCat = p.category && p.category.id !== mappingCategory?.id
                ? p.category.categoryName
                : null;

              return (
                <ListItem
                  key={p.id}
                  secondaryAction={
                    <Checkbox
                      edge="end"
                      checked={checked}
                      onChange={() => toggleProduct(p.id)}
                    />
                  }
                  sx={{ cursor: 'pointer' }}
                  onClick={() => toggleProduct(p.id)}
                >
                  <ListItemText
                    primary={p.name}
                    secondary={
                      otherCat
                        ? `Currently in: ${otherCat}`
                        : p.category
                        ? 'In this category'
                        : 'No category'
                    }
                  />
                </ListItem>
              );
            })}
            {filteredMappingProducts.length === 0 && (
              <ListItem>
                <ListItemText primary="No products found." />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Typography variant="body2" sx={{ flexGrow: 1, pl: 2 }} color="text.secondary">
            {mappingSelected.size} product{mappingSelected.size !== 1 ? 's' : ''} selected
          </Typography>
          <Button onClick={() => setMappingOpen(false)}>Cancel</Button>
          <Button onClick={saveMapping} variant="contained" disabled={mappingSaving}>
            {mappingSaving ? <CircularProgress size={20} /> : 'Save Mapping'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ──────────── Delete confirmation ──────────────────────── */}
      <ConfirmDialog
        open={!!deleting}
        title="Delete category?"
        description={
          deleting
            ? `This will delete "${deleting.categoryName}"${
                (productMap[deleting.id] ?? []).length > 0
                  ? ` and un-map its ${productMap[deleting.id].length} product(s).`
                  : '.'
              }`
            : undefined
        }
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        confirmLabel="Delete"
      />

      <Toast state={toast} onClose={() => setToast((t: ToastState) => ({ ...t, open: false }))} />
    </Box>
  );
}
