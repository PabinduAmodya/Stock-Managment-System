import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RequireAuth } from './auth/RequireAuth';
import { AppLayout } from './layout/AppLayout';

import { LoginPage }       from './pages/LoginPage';
import { DashboardPage }   from './pages/DashboardPage';
import { ProductsPage }    from './pages/ProductsPage';
import { CategoriesPage }  from './pages/CategoriesPage';
import { SuppliersPage }   from './pages/SuppliersPage';
import { CustomersPage }   from './pages/CustomersPage';
import { PurchasesPage }   from './pages/PurchasesPage';
import { SalesPage }       from './pages/SalesPage';
import { StockPage }       from './pages/StockPage';
import { ReportsPage }     from './pages/ReportsPage';
import { UsersPage }       from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />

          {/* All protected routes share AppLayout */}
          <Route
            path="/*"
            element={
              <RequireAuth>
                <AppLayout>
                  <Routes>
                    {/* All roles */}
                    <Route path="/"          element={<DashboardPage />} />
                    <Route path="/products"  element={<ProductsPage />} />
                    <Route path="/customers" element={<CustomersPage />} />
                    <Route path="/sales"     element={<SalesPage />} />
                    <Route path="/categories"element={<CategoriesPage />} />

                    {/* Settings — all roles, self-service */}
                    <Route path="/settings"  element={<SettingsPage />} />



                    <Route
                      path="/suppliers"
                      element={
                        <RequireAuth allowedRoles={['ADMIN', 'MANAGER']}>
                          <SuppliersPage />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/purchases"
                      element={
                        <RequireAuth allowedRoles={['ADMIN', 'MANAGER']}>
                          <PurchasesPage />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/stock"
                      element={
                        <RequireAuth allowedRoles={['ADMIN', 'MANAGER']}>
                          <StockPage />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/reports"
                      element={
                        <RequireAuth allowedRoles={['ADMIN', 'MANAGER']}>
                          <ReportsPage />
                        </RequireAuth>
                      }
                    />

                    {/* Admin only */}
                    <Route
                      path="/users"
                      element={
                        <RequireAuth allowedRoles={['ADMIN']}>
                          <UsersPage />
                        </RequireAuth>
                      }
                    />
                  </Routes>
                </AppLayout>
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}