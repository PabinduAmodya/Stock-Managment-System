export type ID = number;

export interface Category {
  id: ID;
  categoryName: string;
  description?: string | null;
}

export interface Supplier {
  id: ID;
  supplierName: string;
  contactNumber?: string | null;
  email?: string | null;
  address?: string | null;
  companyName?: string | null;
}

export interface Customer {
  id: ID;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface Product {
  id: ID;
  name: string;
  barcode?: string | null;
  price: number;
  costPrice: number;
  quantity: number;
  reorderLevel: number;
  category?: Category | null;
  supplier?: Supplier | null;
}

export interface User {
  id: ID;
  name: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

// ─── JWT Login ───────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER';
  status: 'ACTIVE' | 'INACTIVE';
}

// ─── Auth state stored in localStorage ───────────────────────────────────────

export interface AuthUser {
  token: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER';
  status: 'ACTIVE' | 'INACTIVE';
}

// ─── Rest of types ────────────────────────────────────────────────────────────

export interface Purchase {
  id: ID;
  supplier: Supplier;
  totalAmount: number;
  date?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  purchaseItems?: PurchaseItem[];
}

export interface PurchaseItem {
  id?: ID;
  purchase?: Purchase;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: ID;
  customerName?: string | null;
  totalAmount: number;
  date?: string;
  paymentMethod: 'CASH' | 'CARD' | 'ONLINE';
  customer?: Customer | null;
  saleItems?: SaleItem[];
}

export interface SaleItem {
  id?: ID;
  sale?: Sale;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Stock {
  id: ID;
  product: Product;
  quantityAdded: number;
  date?: string;
  type: 'PURCHASE' | 'ADJUSTMENT';
  note?: string | null;
}

export interface PurchaseRequest {
  purchase: Partial<Purchase>;
  items: PurchaseItem[];
}

export interface SaleRequest {
  sale: Partial<Sale>;
  items: SaleItem[];
}

export interface RoleChangeRequest {
  role: User['role'];
}

export interface PasswordResetRequest {
  password: string;
}

export interface StockAdjustRequest {
  adjustment: number;
  note?: string;
}