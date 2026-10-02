import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { AuthModal } from './AuthModal';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, isAuthenticated, isAdmin, switchUser, users } = useAuth();
  const { totalItemCount } = useCart();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Dynamic subtitle based on route
  const getRouteSubtitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Home Storefront';
    if (path.startsWith('/catalog')) return 'Catalog Browser';
    if (path.startsWith('/cart')) return 'Shopping Cart';
    if (path.startsWith('/checkout')) return 'Checkout Flow';
    if (path.startsWith('/orders')) return 'Archival Log';
    if (path === '/admin') return 'Admin Portal';
    if (path.startsWith('/admin/books')) return 'Book Inventory';
    if (path.startsWith('/admin/orders')) return 'Order Fulfillment';
    if (path.startsWith('/admin/users')) return 'Reader Directory';
    return 'Curated Bookstore';
  };

  const isCurrentAdminPath = location.pathname.startsWith('/admin');

  return (
    <>
      <header className="fixed top-0 w-full z-40 pt-safe bg-[#f9f9ff]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#dec0b7]/30">
        <div className="max-w-7xl mx-auto h-16 px-3 sm:px-6 flex items-center justify-between">
          {/* Left: Brand Identity & Subtitle */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              alt="BookNest Logo"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida/AEtjO1Uj7DCYuyVaa9QDRUu6PWJa7YACH2sHeGaj71oOKPQkxHzzMp2l0Pgc1iUjmxeg2-djy7gZ-aMvLCLf5-58x-4PDOnzcjsjZTIA5RYOo1STkVteNoLXlmxxsRq2dlpEvkm6_gDwu0uJV2HIAXxj16vYsjvRkArt2E01_qHrHYjRo75KZryaaja0iHIkVwQVzBc0o3MyUJoIkn3nOHTQCsFn-4KNIxIJIZO8JZkRs1zjrbl40j6BQkYe2Mag"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-[#9f3c16] tracking-tight leading-none text-[19px]">
                  BookNest
                </span>
                {isAdmin && isCurrentAdminPath && (
                  <span className="bg-[#904d00]/15 text-[#904d00] px-1.5 py-0.2 rounded font-label-sm text-[10px] tracking-wide uppercase leading-none font-bold">
                    Curator
                  </span>
                )}
              </div>
              <span className="font-label-sm text-[#57423b] uppercase tracking-wider leading-none mt-0.5 text-[11px]">
                {getRouteSubtitle()}
              </span>
            </div>
          </Link>

          {/* Center (Desktop Navigation) */}
          <nav className="hidden md:flex items-center gap-6 font-medium text-sm text-[#57423b]">
            <Link
              to="/"
              className={`hover:text-[#9f3c16] transition-colors ${
                location.pathname === '/' ? 'text-[#9f3c16] font-semibold' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/catalog"
              className={`hover:text-[#9f3c16] transition-colors ${
                location.pathname.startsWith('/catalog') ? 'text-[#9f3c16] font-semibold' : ''
              }`}
            >
              Catalog
            </Link>
            <Link
              to="/orders"
              className={`hover:text-[#9f3c16] transition-colors ${
                location.pathname.startsWith('/orders') ? 'text-[#9f3c16] font-semibold' : ''
              }`}
            >
              Orders
            </Link>
            <Link
              to="/cart"
              className={`hover:text-[#9f3c16] transition-colors flex items-center gap-1.5 ${
                location.pathname.startsWith('/cart') ? 'text-[#9f3c16] font-semibold' : ''
              }`}
            >
              <span>Cart</span>
              {totalItemCount > 0 && (
                <span className="bg-[#9f3c16] text-[#ffffff] text-[11px] font-bold px-1.5 py-0.2 rounded-full leading-none">
                  {totalItemCount}
                </span>
              )}
            </Link>

            {/* Admin navigation link */}
            <Link
              to="/admin"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                isCurrentAdminPath
                  ? 'bg-[#9f3c16] text-white font-semibold shadow-sm'
                  : 'text-[#904d00] hover:bg-[#ffdcc3]/50 font-semibold'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">shield_person</span>
              <span>Admin Console</span>
            </Link>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Search Button */}
            <button
              aria-label="Search catalog"
              onClick={() => navigate('/catalog')}
              className="w-10 h-10 flex items-center justify-center text-[#57423b] hover:text-[#9f3c16] transition-colors rounded-lg hover:bg-[#ebeef7]"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">search</span>
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                aria-label="Notifications"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative w-10 h-10 flex items-center justify-center text-[#57423b] hover:text-[#9f3c16] transition-colors rounded-lg hover:bg-[#ebeef7]"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#9f3c16] ring-2 ring-[#f9f9ff]"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#dec0b7]/40 p-3 z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-[#dfe2ec]">
                    <span className="font-headline-sm text-sm text-[#181c23]">Curator Dispatch Alerts</span>
                    <span className="text-[10px] bg-[#ffdcc3] text-[#2f1500] px-1.5 py-0.5 rounded font-bold uppercase">
                      2 Unread
                    </span>
                  </div>
                  <div className="divide-y divide-[#dfe2ec] text-xs text-[#181c23]">
                    <div className="py-2.5">
                      <div className="flex items-center gap-1 text-[#9f3c16] font-semibold text-[11px]">
                        <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                        <span>Order #BN-89241 Out for Delivery</span>
                      </div>
                      <p className="text-[#57423b] mt-0.5">Marcus H. is en route with your archival book parcel.</p>
                      <span className="text-[10px] text-[#8a726a] mt-1 block">12 min ago</span>
                    </div>
                    <div className="py-2.5">
                      <div className="flex items-center gap-1 text-[#904d00] font-semibold text-[11px]">
                        <span className="material-symbols-outlined text-[14px]">stars</span>
                        <span>Curator's Spotlight Refreshed</span>
                      </div>
                      <p className="text-[#57423b] mt-0.5">Explore 4 new signed editions and staff picks.</p>
                      <span className="text-[10px] text-[#8a726a] mt-1 block">2 hours ago</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="w-full mt-2 py-1.5 text-center text-xs text-[#9f3c16] font-semibold bg-[#f1f3fd] hover:bg-[#dfe2ec] rounded-lg transition-colors"
                  >
                    Mark All as Read
                  </button>
                </div>
              )}
            </div>

            {/* Profile Dropdown & Quick Persona Toggle */}
            <div className="relative ml-1">
              <button
                aria-label="Account and portal mode"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:ring-2 hover:ring-[#9f3c16]/30 transition-all"
                type="button"
              >
                <div className="relative">
                  {currentUser?.avatarUrl ? (
                    <img
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover shadow-sm border border-[#dec0b7]"
                      src={currentUser.avatarUrl}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#ffdbcf] text-[#822801] flex items-center justify-center font-bold text-xs shadow-sm">
                      {currentUser?.name
                        ? currentUser.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                        : 'ER'}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#904d00] text-white flex items-center justify-center text-[9px] shadow">
                    <span className="material-symbols-outlined text-[9px]">expand_more</span>
                  </span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#dec0b7]/40 p-3 z-50 animate-fade-in">
                  {/* User Info Card */}
                  <div className="p-2.5 bg-[#f1f3fd] rounded-xl flex items-center gap-2.5 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#ffdcc3] flex items-center justify-center font-bold text-sm text-[#2f1500] shrink-0">
                      {currentUser?.name
                        ? currentUser.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                        : 'ER'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-[#181c23] truncate flex items-center gap-1">
                        <span>{currentUser?.name || 'Guest Bibliophile'}</span>
                        {currentUser?.role === 'admin' && (
                          <span className="material-symbols-outlined text-[14px] text-[#9f3c16]">verified</span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#57423b] truncate">{currentUser?.email}</div>
                      <div className="text-[10px] text-[#9f3c16] font-semibold mt-0.5">
                        {currentUser?.membershipTier || 'Standard Reader'}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-1 text-xs text-[#181c23] pb-2 border-b border-[#dfe2ec]">
                    <Link
                      to="/orders"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-[#f1f3fd] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[17px] text-[#57423b]">receipt_long</span>
                      <span>My Literary Orders</span>
                    </Link>
                    <Link
                      to="/cart"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-[#f1f3fd] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[17px] text-[#57423b]">shopping_bag</span>
                      <span>Active Cart ({totalItemCount})</span>
                    </Link>
                    <Link
                      to="/admin"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-[#ffdbcf]/50 text-[#9f3c16] font-semibold transition-colors"
                    >
                      <span className="material-symbols-outlined text-[17px]">dashboard</span>
                      <span>Admin Management Console</span>
                    </Link>
                  </div>

                  {/* Persona Switcher Quick Selection */}
                  <div className="py-2 border-b border-[#dfe2ec]">
                    <span className="font-label-sm text-[#8a726a] text-[10px] uppercase tracking-wider block px-1 mb-1">
                      Switch Role Persona
                    </span>
                    <div className="space-y-1">
                      {users.slice(0, 4).map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            switchUser(u.id);
                            setProfileDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                            currentUser?.id === u.id ? 'bg-[#ffdbcf] text-[#822801] font-semibold' : 'hover:bg-[#f1f3fd] text-[#57423b]'
                          }`}
                        >
                          <span className="truncate">{u.name}</span>
                          <span className="text-[10px] uppercase font-bold opacity-75">{u.role}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Auth Actions */}
                  <div className="pt-2">
                    {isAuthenticated ? (
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-[#ba1a1a] hover:bg-[#ffdad6]/50 flex items-center gap-2 font-medium transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">logout</span>
                        <span>Sign Out of Reading Nook</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalOpen(true);
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-[#9f3c16] hover:bg-[#ffdbcf]/50 flex items-center gap-2 font-semibold transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">login</span>
                        <span>Sign In / Register</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal Triggerable from anywhere */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};
