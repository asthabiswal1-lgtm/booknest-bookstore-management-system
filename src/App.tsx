/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { AuthProvider } from './context/AuthContext';
import { BookProvider } from './context/BookContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ToastProvider } from './context/ToastContext';

// Storefront Pages
import { CartPage } from './pages/CartPage';
import { CatalogPage } from './pages/CatalogPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { HomePage } from './pages/HomePage';
import { OrdersPage } from './pages/OrdersPage';

// Admin Console Pages
import { AdminBooksPage } from './pages/admin/AdminBooksPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookProvider>
          <CartProvider>
            <OrderProvider>
              <ToastProvider>
                <div className="min-h-screen flex flex-col bg-[#f9f9ff] text-[#181c23]">
                  {/* Top Navigation Bar */}
                  <Header />

                  {/* Main Content Viewport */}
                  <main className="flex-1 w-full pt-16">
                    <Routes>
                      {/* Storefront Routes */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/catalog" element={<CatalogPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/orders" element={<OrdersPage />} />

                      {/* Admin Management Routes */}
                      <Route path="/admin" element={<AdminDashboardPage />} />
                      <Route path="/admin/books" element={<AdminBooksPage />} />
                      <Route path="/admin/orders" element={<AdminOrdersPage />} />
                      <Route path="/admin/users" element={<AdminUsersPage />} />

                      {/* Fallback */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>

                  {/* Mobile Tab Navigation */}
                  <MobileNav />
                </div>
              </ToastProvider>
            </OrderProvider>
          </CartProvider>
        </BookProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
