import { api } from './client';
import type {
  AuthUser,
  Category,
  Customer,
  LoginRequest,
  LoginResponse,
  PasswordChangeRequest,
  PasswordResetRequest,
  Product,
  ProfileUpdateRequest,
  Purchase,
  PurchaseItem,
  PurchaseRequest,
  RoleChangeRequest,
  Sale,
  SaleItem,
  SaleRequest,
  Stock,
  StockAdjustRequest,
  Supplier,
  User
} from '../types/api';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const AuthAPI = {
  login: async (payload: LoginRequest): Promise<LoginResponse> =>
    (await api.post<LoginResponse>('/api/auth/login', payload)).data
};

// ─── Profile (self-service — any role) ───────────────────────────────────────
export const ProfileAPI = {
  get: async (): Promise<User> =>
    (await api.get<User>('/api/users/profile')).data,
  update: async (payload: ProfileUpdateRequest): Promise<User> =>
    (await api.put<User>('/api/users/profile', payload)).data,
  changePassword: async (payload: PasswordChangeRequest): Promise<string> =>
    (await api.patch<string>('/api/users/profile/password', payload)).data
};

// ─── Users (ADMIN only) ───────────────────────────────────────────────────────
export const UsersAPI = {
  list: async () => (await api.get<User[]>('/api/users')).data,
  get: async (id: number) => (await api.get<User>(`/api/users/${id}`)).data,
  create: async (payload: Partial<User>) =>
    (await api.post<User>('/api/users', payload)).data,
  update: async (id: number, payload: Partial<User>) =>
    (await api.put<User>(`/api/users/${id}`, payload)).data,
  remove: async (id: number) =>
    (await api.delete<string>(`/api/users/${id}`)).data,
  activate: async (id: number) =>
    (await api.patch<User>(`/api/users/${id}/activate`)).data,
  deactivate: async (id: number) =>
    (await api.patch<User>(`/api/users/${id}/deactivate`)).data,
  changeRole: async (id: number, payload: RoleChangeRequest) =>
    (await api.patch<User>(`/api/users/${id}/role`, payload)).data,
  resetPassword: async (id: number, payload: PasswordResetRequest) =>
    (await api.patch<string>(`/api/users/${id}/reset-password`, payload)).data
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const CategoriesAPI = {
  list: async () => (await api.get<Category[]>('/api/categories')).data,
  create: async (payload: Partial<Category>) =>
    (await api.post<Category>('/api/categories', payload)).data,
  update: async (id: number, payload: Partial<Category>) =>
    (await api.put<Category>(`/api/categories/${id}`, payload)).data,
  remove: async (id: number) =>
    (await api.delete<string>(`/api/categories/${id}`)).data
};

// ─── Suppliers ────────────────────────────────────────────────────────────────
export const SuppliersAPI = {
  list: async () => (await api.get<Supplier[]>('/api/suppliers')).data,
  create: async (payload: Partial<Supplier>) =>
    (await api.post<Supplier>('/api/suppliers', payload)).data,
  update: async (id: number, payload: Partial<Supplier>) =>
    (await api.put<Supplier>(`/api/suppliers/${id}`, payload)).data,
  remove: async (id: number) =>
    (await api.delete<string>(`/api/suppliers/${id}`)).data
};

// ─── Customers ────────────────────────────────────────────────────────────────
export const CustomersAPI = {
  list: async () => (await api.get<Customer[]>('/api/customers')).data,
  create: async (payload: Partial<Customer>) =>
    (await api.post<Customer>('/api/customers', payload)).data,
  update: async (id: number, payload: Partial<Customer>) =>
    (await api.put<Customer>(`/api/customers/${id}`, payload)).data,
  remove: async (id: number) =>
    (await api.delete<string>(`/api/customers/${id}`)).data
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const ProductsAPI = {
  list: async () => (await api.get<Product[]>('/api/products')).data,
  get: async (id: number) => (await api.get<Product>(`/api/products/${id}`)).data,
  create: async (payload: Partial<Product>) =>
    (await api.post<Product>('/api/products', payload)).data,
  update: async (id: number, payload: Partial<Product>) =>
    (await api.put<Product>(`/api/products/${id}`, payload)).data,
  remove: async (id: number) =>
    (await api.delete<string>(`/api/products/${id}`)).data,
  search: async (name: string) =>
    (await api.get<Product[]>('/api/products/search', { params: { name } })).data,
  lowStock: async () =>
    (await api.get<Product[]>('/api/products/low-stock')).data,
  byBarcode: async (barcode: string) =>
    (await api.get<Product>(`/api/products/barcode/${barcode}`)).data
};

// ─── Purchases ────────────────────────────────────────────────────────────────
export const PurchasesAPI = {
  list: async () => (await api.get<Purchase[]>('/api/purchases')).data,
  get: async (id: number) => (await api.get<Purchase>(`/api/purchases/${id}`)).data,
  create: async (payload: PurchaseRequest) =>
    (await api.post<Purchase>('/api/purchases/create', payload)).data,
  update: async (id: number, payload: Partial<Purchase>) =>
    (await api.put<Purchase>(`/api/purchases/${id}`, payload)).data,
  remove: async (id: number) =>
    (await api.delete<string>(`/api/purchases/${id}`)).data,
  approve: async (id: number) =>
    (await api.patch<Purchase>(`/api/purchases/${id}/approve`)).data,
  reject: async (id: number) =>
    (await api.patch<Purchase>(`/api/purchases/${id}/reject`)).data,
  items: async (id: number) =>
    (await api.get<PurchaseItem[]>(`/api/purchases/${id}/items`)).data
};

// ─── Sales ────────────────────────────────────────────────────────────────────
export const SalesAPI = {
  list: async () => (await api.get<Sale[]>('/api/sales')).data,
  get: async (id: number) => (await api.get<Sale>(`/api/sales/${id}`)).data,
  create: async (payload: SaleRequest) =>
    (await api.post<Sale>('/api/sales/create', payload)).data,
  update: async (id: number, payload: Partial<Sale>) =>
    (await api.put<Sale>(`/api/sales/${id}`, payload)).data,
  remove: async (id: number) =>
    (await api.delete<string>(`/api/sales/${id}`)).data,
  items: async (id: number) =>
    (await api.get<SaleItem[]>(`/api/sales/${id}/items`)).data,
  invoice: async (id: number) =>
    (await api.get<Sale>(`/api/sales/${id}/invoice`)).data
};

// ─── Stock ────────────────────────────────────────────────────────────────────
export const StockAPI = {
  list: async () => (await api.get<Stock[]>('/api/stocks')).data,
  history: async () => (await api.get<Stock[]>('/api/stocks/history')).data,
  byProduct: async (productId: number) =>
    (await api.get<Stock[]>(`/api/stocks/product/${productId}`)).data,
  adjust: async (productId: number, payload: StockAdjustRequest) =>
    (await api.post<Stock>(`/api/stocks/adjust/${productId}`, payload)).data
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const ReportsAPI = {
  sales: async (startISO: string, endISO: string) =>
    (await api.get('/api/reports/sales', { params: { start: startISO, end: endISO } })).data,
  purchases: async (startISO: string, endISO: string) =>
    (await api.get('/api/reports/purchases', { params: { start: startISO, end: endISO } })).data,
  profit: async (startISO: string, endISO: string) =>
    (await api.get('/api/reports/profit', { params: { start: startISO, end: endISO } })).data,
  lowStock: async () =>
    (await api.get<Product[]>('/api/reports/low-stock')).data,
  suppliers: async () =>
    (await api.get<Supplier[]>('/api/reports/suppliers')).data,
  dailySalesCsv: async (dateISO: string) =>
    (await api.get('/api/reports/daily-sales/csv', {
      params: { date: dateISO },
      responseType: 'blob'
    })).data
};

export const SalesAPI = {
  list: async () => (await api.get<Sale[]>('/api/sales')).data,
  get: async (id: number) => (await api.get<Sale>(`/api/sales/${id}`)).data,
  create: async (payload: SaleRequest) =>
      (await api.post<Sale>('/api/sales/create', payload)).data,
  update: async (id: number, payload: Partial<Sale>) =>
      (await api.put<Sale>(`/api/sales/${id}`, payload)).data,
  remove: async (id: number) => (await api.delete<string>(`/api/sales/${id}`)).data,
  items: async (id: number) => (await api.get<SaleItem[]>(`/api/sales/${id}/items`)).data,
  invoice: async (id: number) => (await api.get<Sale>(`/api/sales/${id}/invoice`)).data
};
