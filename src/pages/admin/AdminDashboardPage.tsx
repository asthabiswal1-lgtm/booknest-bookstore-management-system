import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBooks } from '../../context/BookContext';
import { useOrders } from '../../context/OrderContext';
import { useToast } from '../../context/ToastContext';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, users } = useAuth();
  const { books, restockBook } = useBooks();
  const { orders, updateOrderStatus } = useOrders();
  const { showToast } = useToast();

  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('today');

  // Low stock books (< 6)
  const lowStockBooks = books.filter((b) => b.stock <= 5);

  const handleRestock = (bookId: string, title: string, amount: number) => {
    restockBook(bookId, amount);
    showToast(`Restocked ${amount} copies of "${title}"`, 'success', 'add_box');
  };

  const handleQuickShip = (orderId: string, orderNumber: string) => {
    updateOrderStatus(orderId, 'shipped', 'Shipped');
    showToast(`Order ${orderNumber} dispatched with curator courier!`, 'success', 'local_shipping');
  };

  const handleQuickPack = (orderId: string, orderNumber: string) => {
    updateOrderStatus(orderId, 'processing', 'Bound');
    showToast(`Order ${orderNumber} marked as packed & ready.`, 'success', 'inventory');
  };

  const handleExportCSV = () => {
    showToast('Exporting sales & order audit trail CSV...', 'info', 'download');
    setTimeout(() => {
      showToast('Sales log CSV downloaded (892 records)', 'success', 'description');
    }, 1000);
  };

  return (
    <div className="flex flex-col w-full pb-20 max-w-4xl mx-auto px-3 sm:px-6">
      {/* 1. Admin Welcome & Quick Status Header */}
      <section className="flex flex-col gap-2.5 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-body-sm text-xs text-[#57423b] font-medium tracking-wide">
              Thursday, May 22, 2025
            </span>
            <h1 className="font-headline-lg-mobile sm:font-headline-md text-xl sm:text-2xl text-[#181c23] tracking-tight mt-0.5">
              Welcome back, {currentUser?.name?.split(' ')[0] || 'Elena'}
            </h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#ffdbcf] flex items-center justify-center text-[#822801] font-title-md font-bold shadow-xs">
            {currentUser?.name
              ? currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
              : 'ER'}
          </div>
        </div>

        {/* MongoDB Sync Capsule */}
        <div className="flex items-center gap-2 bg-[#f1f3fd] px-3 py-1.5 rounded-xl shadow-xs border border-[#dfe2ec]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#904d00] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#904d00]"></span>
          </span>
          <span className="font-label-sm text-[11px] text-[#181c23] font-semibold tracking-wide truncate">
            MongoDB Cluster: Synced • REST API v2.4 Healthy
          </span>
        </div>

        {/* Period Filter Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          {(['today', 'week', 'month', 'year'] as const).map((p) => {
            const labels = {
              today: 'Today',
              week: 'This Week',
              month: 'May 2025',
              year: 'Yearly',
            };
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-full font-label-md text-xs transition-all whitespace-nowrap active:scale-95 ${
                  period === p
                    ? 'bg-[#9f3c16] text-white shadow-xs font-semibold'
                    : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
                }`}
              >
                {labels[p]}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. 4 Key Metric Overview Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-4">
        {/* Revenue */}
        <div className="flex flex-col p-3.5 rounded-xl bg-white shadow-xs border border-[#dfe2ec] gap-1">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[10px] text-[#8a726a] uppercase tracking-wider font-bold">
              Revenue
            </span>
            <span className="bg-[#ffdbcf] text-[#822801] px-1.5 py-0.2 rounded text-[10px] font-bold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">trending_up</span>+14.2%
            </span>
          </div>
          <span className="font-headline-sm text-lg sm:text-xl text-[#181c23] tracking-tight mt-0.5 font-bold">
            $42,850.40
          </span>
          <span className="font-body-sm text-[11px] text-[#57423b] truncate">348 orders this month</span>
        </div>

        {/* Total Books */}
        <div className="flex flex-col p-3.5 rounded-xl bg-white shadow-xs border border-[#dfe2ec] gap-1">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[10px] text-[#8a726a] uppercase tracking-wider font-bold">
              Total Books
            </span>
            <span className="bg-[#ebeef7] text-[#181c23] px-1.5 py-0.2 rounded text-[10px] font-bold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">library_add</span>+46
            </span>
          </div>
          <span className="font-headline-sm text-lg sm:text-xl text-[#181c23] tracking-tight mt-0.5 font-bold">
            {books.length} titles
          </span>
          <span className="font-body-sm text-[11px] text-[#57423b] truncate">8 genres active in store</span>
        </div>

        {/* Total Orders */}
        <div className="flex flex-col p-3.5 rounded-xl bg-white shadow-xs border border-[#dfe2ec] gap-1">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[10px] text-[#8a726a] uppercase tracking-wider font-bold">
              Total Orders
            </span>
            <span className="bg-[#ffdbcf] text-[#822801] px-1.5 py-0.2 rounded text-[10px] font-bold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">trending_up</span>+8.7%
            </span>
          </div>
          <span className="font-headline-sm text-lg sm:text-xl text-[#181c23] tracking-tight mt-0.5 font-bold">
            {orders.length} orders
          </span>
          <span className="font-body-sm text-[11px] text-[#ba1a1a] font-medium truncate">14 pending dispatch</span>
        </div>

        {/* Readers */}
        <div className="flex flex-col p-3.5 rounded-xl bg-white shadow-xs border border-[#dfe2ec] gap-1">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[10px] text-[#8a726a] uppercase tracking-wider font-bold">
              Readers
            </span>
            <span className="bg-[#dbe1ff] text-[#00174b] px-1.5 py-0.2 rounded text-[10px] font-bold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">person_add</span>+215
            </span>
          </div>
          <span className="font-headline-sm text-lg sm:text-xl text-[#181c23] tracking-tight mt-0.5 font-bold">
            {users.length * 1000 + 120} users
          </span>
          <span className="font-body-sm text-[11px] text-[#57423b] truncate">Active reader community</span>
        </div>
      </section>

      {/* 3. Sales & Revenue Trend Chart Section */}
      <section className="flex flex-col p-4 rounded-xl bg-white shadow-xs border border-[#dfe2ec] gap-3 mt-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h2 className="font-title-lg text-base sm:text-lg text-[#181c23]">Revenue & Volume</h2>
            <span className="font-body-sm text-xs text-[#57423b]">Weekly breakdown of book sales</span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-[#ffdcc3] text-[#2f1500] font-label-sm text-[11px] font-bold uppercase tracking-wider">
            Peak: Sat ($8.4k)
          </span>
        </div>

        {/* Interactive Bar Chart Visualization */}
        <div className="w-full flex flex-col gap-1 pt-2">
          <div className="h-36 w-full flex items-end justify-between gap-2 px-1">
            {[
              { day: 'M', value: '$4.1k', height: '48%', isPeak: false },
              { day: 'T', value: '$5.3k', height: '62%', isPeak: false },
              { day: 'W', value: '$4.8k', height: '56%', isPeak: false },
              { day: 'T', value: '$6.2k', height: '72%', isPeak: false },
              { day: 'F', value: '$7.1k', height: '82%', isPeak: false },
              { day: 'S', value: '$8.4k', height: '100%', isPeak: true },
              { day: 'S', value: '$6.8k', height: '78%', isPeak: false },
            ].map((bar, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer"
                onClick={() => showToast(`${bar.day}: ${bar.value} sales recorded`, 'info')}
              >
                <span
                  className={`font-label-sm text-[9px] transition-opacity ${
                    bar.isPeak ? 'text-[#9f3c16] font-bold opacity-100' : 'text-[#8a726a] opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {bar.value}
                </span>
                <div
                  className={`w-full rounded-t-sm transition-all ${
                    bar.isPeak ? 'bg-[#9f3c16] shadow-xs' : 'bg-[#dfe2ec] group-hover:bg-[#bf542c]/60'
                  }`}
                  style={{ height: bar.height }}
                />
                <span className={`font-label-sm text-[11px] ${bar.isPeak ? 'font-bold text-[#9f3c16]' : 'text-[#57423b]'}`}>
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Micro conversion & AOV */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#dfe2ec]/60">
          <div className="p-2.5 bg-[#f1f3fd] rounded-lg flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-[#8a726a] uppercase">Avg Order Value</span>
              <span className="font-title-md text-sm text-[#181c23] font-bold">$64.20</span>
            </div>
            <span className="material-symbols-outlined text-[#9f3c16] text-[20px]">shopping_bag</span>
          </div>

          <div className="p-2.5 bg-[#f1f3fd] rounded-lg flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-[#8a726a] uppercase">Store Conversion</span>
              <span className="font-title-md text-sm text-[#181c23] font-bold">3.8%</span>
            </div>
            <span className="material-symbols-outlined text-[#904d00] text-[20px]">insights</span>
          </div>
        </div>
      </section>

      {/* 4. Low-Stock & Restock Urgent Alerts */}
      <section className="flex flex-col gap-2.5 mt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#ba1a1a] text-[20px]">warning</span>
            <h2 className="font-title-lg text-base sm:text-lg text-[#181c23]">Inventory Watch</h2>
          </div>
          <span className="bg-[#ffdad6] text-[#93000a] font-label-sm text-[11px] px-2 py-0.5 rounded-full font-bold">
            {lowStockBooks.length} Low Stock
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {lowStockBooks.slice(0, 3).map((book) => (
            <div
              key={book.id}
              className="p-3.5 bg-white rounded-xl shadow-xs border border-[#dfe2ec] flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="font-headline-sm text-sm sm:text-base text-[#181c23] leading-tight truncate">
                    {book.title}
                  </span>
                  <span className="font-body-sm text-xs text-[#57423b]">{book.author}</span>
                  <span className="font-label-sm text-[10px] text-[#8a726a] tracking-wide mt-0.5">
                    ISBN {book.isbn} • {book.shelfLocation}
                  </span>
                </div>
                <span
                  className={`font-label-sm text-[11px] px-2 py-0.5 rounded font-bold whitespace-nowrap ${
                    book.stock <= 2
                      ? 'bg-[#ffdad6] text-[#93000a]'
                      : 'bg-[#ffdcc3] text-[#2f1500]'
                  }`}
                >
                  {book.stock} left
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#dfe2ec]/50 text-xs">
                <span className="text-[#8a726a] text-[11px]">Reorder trigger &lt; 5 units</span>
                <button
                  type="button"
                  onClick={() => handleRestock(book.id, book.title, 20)}
                  className="px-3 py-1 bg-[#9f3c16] hover:bg-[#bf542c] text-white font-label-md text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1 font-semibold"
                >
                  <span className="material-symbols-outlined text-[15px]">add_box</span>
                  <span>Restock 20</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Recent Customer Orders Feed */}
      <section className="flex flex-col gap-2.5 mt-5">
        <div className="flex items-center justify-between">
          <h2 className="font-title-lg text-base sm:text-lg text-[#181c23]">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="font-label-md text-xs text-[#9f3c16] flex items-center gap-0.5 hover:underline font-semibold"
          >
            <span>View All ({orders.length})</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          {orders.slice(0, 3).map((order) => (
            <div
              key={order.id}
              className="p-3.5 bg-white rounded-xl shadow-xs border border-[#dfe2ec] flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-title-md text-sm text-[#181c23] font-bold">{order.orderNumber}</span>
                  <span
                    className={`font-label-sm text-[10px] px-2 py-0.2 rounded font-bold uppercase tracking-wider ${
                      order.status === 'pending'
                        ? 'bg-[#ffdbcf] text-[#822801]'
                        : order.status === 'processing'
                        ? 'bg-[#ebeef7] text-[#181c23]'
                        : 'bg-[#dbe1ff] text-[#00174b]'
                    }`}
                  >
                    {order.statusLabel}
                  </span>
                </div>
                <span className="font-title-md text-sm text-[#9f3c16] font-bold">
                  ${order.total.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#57423b] text-xs">
                <span>
                  {order.customerName} • {order.items.length} titles
                </span>
                <span className="text-[11px] text-[#8a726a]">{order.placedTime}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#dfe2ec]/50">
                <button
                  type="button"
                  onClick={() => navigate('/admin/orders')}
                  className="px-3 py-1 bg-[#ebeef7] hover:bg-[#dfe2ec] text-[#181c23] font-label-md text-xs rounded-lg transition-colors"
                >
                  Details
                </button>
                {order.status === 'pending' ? (
                  <button
                    type="button"
                    onClick={() => handleQuickShip(order.id, order.orderNumber)}
                    className="px-3 py-1 bg-[#9f3c16] hover:bg-[#bf542c] text-white font-label-md text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1 font-semibold"
                  >
                    <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                    <span>Ship Parcel</span>
                  </button>
                ) : order.status === 'processing' ? (
                  <button
                    type="button"
                    onClick={() => handleQuickPack(order.id, order.orderNumber)}
                    className="px-3 py-1 bg-[#904d00] hover:bg-[#6e3900] text-white font-label-md text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1 font-semibold"
                  >
                    <span className="material-symbols-outlined text-[14px]">inventory</span>
                    <span>Pack</span>
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Quick Admin Actions Grid */}
      <section className="flex flex-col gap-2.5 mt-5">
        <h2 className="font-title-lg text-base sm:text-lg text-[#181c23]">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/admin/books?action=new')}
            className="p-3.5 rounded-xl bg-[#9f3c16] text-white shadow-xs flex flex-col items-start gap-2 text-left hover:bg-[#bf542c] transition-all active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">auto_stories</span>
            </div>
            <div className="flex flex-col">
              <span className="font-title-md text-xs sm:text-sm font-semibold leading-tight">+ Add New Book</span>
              <span className="font-body-sm text-[10px] text-white/80 mt-0.5">Catalog SKU & metadata</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => showToast('Generating custom billing sheet...', 'info', 'receipt_long')}
            className="p-3.5 rounded-xl bg-white text-[#181c23] shadow-xs border border-[#dfe2ec] flex flex-col items-start gap-2 text-left hover:bg-[#f1f3fd] transition-all active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-lg bg-[#ebeef7] flex items-center justify-center text-[#9f3c16]">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            </div>
            <div className="flex flex-col">
              <span className="font-title-md text-xs sm:text-sm font-semibold leading-tight">Generate Invoice</span>
              <span className="font-body-sm text-[10px] text-[#57423b] mt-0.5">Custom billing sheet</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => showToast('Promo code creation active. Code NEST15 is live.', 'info', 'sell')}
            className="p-3.5 rounded-xl bg-white text-[#181c23] shadow-xs border border-[#dfe2ec] flex flex-col items-start gap-2 text-left hover:bg-[#f1f3fd] transition-all active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-lg bg-[#ebeef7] flex items-center justify-center text-[#904d00]">
              <span className="material-symbols-outlined text-[18px]">sell</span>
            </div>
            <div className="flex flex-col">
              <span className="font-title-md text-xs sm:text-sm font-semibold leading-tight">Bulk Discount</span>
              <span className="font-body-sm text-[10px] text-[#57423b] mt-0.5">Create promotion code</span>
            </div>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="p-3.5 rounded-xl bg-white text-[#181c23] shadow-xs border border-[#dfe2ec] flex flex-col items-start gap-2 text-left hover:bg-[#f1f3fd] transition-all active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-lg bg-[#ebeef7] flex items-center justify-center text-[#0051d5]">
              <span className="material-symbols-outlined text-[18px]">download</span>
            </div>
            <div className="flex flex-col">
              <span className="font-title-md text-xs sm:text-sm font-semibold leading-tight">Export CSV Log</span>
              <span className="font-body-sm text-[10px] text-[#57423b] mt-0.5">Dump sales audit trail</span>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};
