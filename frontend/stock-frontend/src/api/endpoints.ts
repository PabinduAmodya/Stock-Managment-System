import { api } from './client';
import type {
  AuthUser,
  Category,
  Customer,
  LoginRequest,
  LoginResponse,
  Product,
  Purchase,
  PurchaseItem,
  PurchaseRequest,
  Sale,
  SaleItem,
  SaleRequest,
  Stock,
  Supplier,
  User,
  RoleChangeRequest,
  PasswordResetRequest,
  StockAdjustRequest
} from '../types/api';


export const AuthAPI = {
  login: async (payload: LoginRequest): Promise<LoginResponse> =>
    (await api.post<LoginResponse>('/api/auth/login', payload)).data
};


export const UsersAPI = {
  list: async () => (await api.get<User[]>('/api/users')).data,
  get: async (id: number) => (await api.get<User>(`/api/users/${id}`)).data,
  create: async (payload: Partial<User>) => (await api.post<User>('/api/users', payload)).data,
  update: async (id: number, payload: Partial<User>) =>
    (await api.put<User>(`/api/users/${id}`, payload)).data,
  remove: async (id: number) => (await api.delete<string>(`/api/users/${id}`)).data,
  activate: async (id: number) => (await api.patch<User>(`/api/users/${id}/activate`)).data,
  deactivate: async (id: number) => (await api.patch<User>(`/api/users/${id}/deactivate`)).data,
  changeRole: async (id: number, payload: RoleChangeRequest) =>
    (await api.patch<User>(`/api/users/${id}/role`, payload)).data,
  resetPassword: async (id: number, payload: PasswordResetRequest) =>
    (await api.patch<string>(`/api/users/${id}/reset-password`, payload)).data
};

// products
export const ProductsAPI = {
  list: async () => (await api.get<Product[]>('/api/products')).data,
  get: async (id: number) => (await api.get<Product>(`/api/products/${id}`)).data,
  create: async (payload: Partial<Product>) =>
    (await api.post<Product>('/api/products', payload)).data,
  update: async (id: number, payload: Partial<Product>) =>
    (await api.put<Product>(`/api/products/${id}`, payload)).data,
  remove: async (id: number) => (await api.delete<string>(`/api/products/${id}`)).data,
  search: async (name: string) =>
    (await api.get<Product[]>('/api/products/search', { params: { name } })).data,
  lowStock: async () => (await api.get<Product[]>('/api/products/low-stock')).data,
  byBarcode: async (barcode: string) =>
    (await api.get<Product>(`/api/products/barcode/${barcode}`)).data
};