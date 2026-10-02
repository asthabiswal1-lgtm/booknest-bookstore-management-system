import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { totalItemCount } = useCart();
  const isAdminSection = location.pathname.startsWith('/admin');

  return (
    <nav className="fixed bottom-0 w-full z-40 pb-safe bg-[#f9f9ff]/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.06)] border-t border-[#dec0b7]/30 md:hidden">
      {isAdminSection ? (
        /* Admin Console Mobile Nav */
        <div className="flex justify-around items-center h-16 px-1">
          <Link
            to="/admin"
            className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] transition-colors ${
              location.pathname === '/admin' ? 'text-[#9f3c16] font-semibold' : 'text-[#57423b] hover:text-[#9f3c16]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">dashboard</span>
            <span className="font-label-sm text-[11px] mt-0.5 leading-none">Dashboard</span>
          </Link>

          <Link
            to="/admin/books"
            className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] transition-colors ${
              location.pathname.startsWith('/admin/books')
                ? 'text-[#9f3c16] font-semibold'
                : 'text-[#57423b] hover:text-[#9f3c16]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">inventory_2</span>
            <span className="font-label-sm text-[11px] mt-0.5 leading-none">Books</span>
          </Link>

          <Link
            to="/admin/orders"
            className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] transition-colors ${
              location.pathname.startsWith('/admin/orders')
                ? 'text-[#9f3c16] font-semibold'
                : 'text-[#57423b] hover:text-[#9f3c16]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">local_shipping</span>
            <span className="font-label-sm text-[11px] mt-0.5 leading-none">Orders</span>
          </Link>

          <Link
            to="/admin/users"
            className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] transition-colors ${
              location.pathname.startsWith('/admin/users')
                ? 'text-[#9f3c16] font-semibold'
                : 'text-[#57423b] hover:text-[#9f3c16]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">group</span>
            <span className="font-label-sm text-[11px] mt-0.5 leading-none">Users</span>
          </Link>

          <Link
            to="/"
            className="flex flex-col items-center justify-center min-w-[54px] min-h-[44px] text-[#57423b] hover:text-[#9f3c16] transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">storefront</span>
            <span className="font-label-sm text-[11px] mt-0.5 leading-none">Store</span>
          </Link>
        </div>
      ) : (
        /* Storefront Mobile Nav */
        <div className="flex justify-around items-center h-16 px-1">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
              location.pathname === '/' ? 'text-[#9f3c16] font-semibold' : 'text-[#57423b] hover:text-[#9f3c16]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">cottage</span>
            <span className="font-label-sm text-label-sm mt-0.5 leading-none">Home</span>
          </Link>

          <Link
            to="/catalog"
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
              location.pathname.startsWith('/catalog')
                ? 'text-[#9f3c16] font-semibold'
                : 'text-[#57423b] hover:text-[#9f3c16]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">menu_book</span>
            <span className="font-label-sm text-label-sm mt-0.5 leading-none">Catalog</span>
          </Link>

          <Link
            to="/orders"
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
              location.pathname.startsWith('/orders')
                ? 'text-[#9f3c16] font-semibold'
                : 'text-[#57423b] hover:text-[#9f3c16]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">package_2</span>
            <span className="font-label-sm text-label-sm mt-0.5 leading-none">Orders</span>
          </Link>

          <Link
            to="/cart"
            className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
              location.pathname.startsWith('/cart')
                ? 'text-[#9f3c16] font-semibold'
                : 'text-[#57423b] hover:text-[#9f3c16]'
            }`}
          >
            <div className="relative">
              <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
              {totalItemCount > 0 && (
                <span className="absolute -top-1 -right-2.5 bg-[#9f3c16] text-[#ffffff] text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-none min-w-[16px] h-4 flex items-center justify-center shadow-sm">
                  {totalItemCount}
                </span>
              )}
            </div>
            <span className="font-label-sm text-label-sm mt-0.5 leading-none">Cart</span>
          </Link>

          <Link
            to="/admin"
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
              location.pathname.startsWith('/admin')
                ? 'text-[#9f3c16] font-semibold'
                : 'text-[#57423b] hover:text-[#9f3c16]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">shield_person</span>
            <span className="font-label-sm text-label-sm mt-0.5 leading-none">Admin</span>
          </Link>
        </div>
      )}
    </nav>
  );
};
