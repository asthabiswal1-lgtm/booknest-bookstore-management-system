import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import { Order } from '../types';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [searchOrderQuery, setSearchOrderQuery] = useState('');

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (searchOrderQuery.trim()) {
      const q = searchOrderQuery.toLowerCase();
      const match =
        o.orderNumber.toLowerCase().includes(q) ||
        o.items.some((i) => i.title.toLowerCase().includes(q) || i.author.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (activeFilter === 'active') {
      return o.status === 'pending' || o.status === 'processing' || o.status === 'shipped';
    }
    if (activeFilter === 'delivered') {
      return o.status === 'delivered';
    }
    if (activeFilter === 'cancelled') {
      return o.status === 'cancelled';
    }
    return true;
  });

  const activeCount = orders.filter((o) => o.status === 'pending' || o.status === 'processing' || o.status === 'shipped').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      // Re-add mock item book representation
      const mockBook = {
        id: item.bookId,
        title: item.title,
        author: item.author,
        isbn: item.isbn || '978-0000000000',
        genre: 'Literary Fiction',
        price: item.price,
        cost: item.price * 0.6,
        stock: 10,
        format: 'Hardcover' as const,
        rating: 5,
        reviewsCount: 100,
        shelfLocation: item.shelfLocation,
        coverImage: item.coverImage,
        synopsis: 'Archival book volume from previous order.',
        publicationYear: 2023,
        pages: 320,
        language: 'English',
      };
      addToCart(mockBook, item.quantity);
    });
    showToast(`Added ${order.items.length} titles from ${order.orderNumber} back into cart!`, 'success', 'replay');
    navigate('/cart');
  };

  const handleDownloadInvoice = (orderNumber: string) => {
    showToast(`Generating archival invoice PDF for ${orderNumber}...`, 'info', 'download');
    setTimeout(() => {
      showToast(`Invoice PDF ready for download`, 'success', 'description');
    }, 1000);
  };

  return (
    <div className="flex flex-col w-full pb-20 max-w-xl mx-auto px-3 sm:px-6">
      {/* 1. Header & Archival Log Eyebrow */}
      <div className="py-3 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdcc3] text-[#2f1500] font-label-sm text-[11px] font-semibold">
            <span className="material-symbols-outlined text-[14px]">auto_stories</span>
            <span className="uppercase tracking-wider">Archival Log</span>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchOrderQuery}
              onChange={(e) => setSearchOrderQuery(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs bg-[#f1f3fd] rounded-full border border-[#dfe2ec] text-[#181c23] focus:outline-none focus:bg-white w-36 sm:w-48 transition-all"
            />
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#8a726a]">
              search
            </span>
          </div>
        </div>

        <h1 className="font-headline-lg-mobile sm:font-headline-md text-xl sm:text-2xl text-[#181c23] tracking-tight">
          My Literary Orders
        </h1>
        <p className="font-body-md text-xs sm:text-sm text-[#57423b]">
          Track ongoing shipments, download archival receipts, and re-order curated titles.
        </p>
      </div>

      {/* 2. Filter & Status Pill Rails */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 -mx-3 px-3 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full font-label-md text-xs transition-all flex items-center gap-1.5 ${
            activeFilter === 'all'
              ? 'bg-[#9f3c16] text-white shadow-xs font-semibold'
              : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
          }`}
        >
          <span>All Orders</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-bold">
            {orders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('active')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full font-label-md text-xs transition-all flex items-center gap-1.5 ${
            activeFilter === 'active'
              ? 'bg-[#9f3c16] text-white shadow-xs font-semibold'
              : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
          }`}
        >
          <span>Active & In Transit</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#ffdbcf] text-[#822801] text-[10px] font-bold">
            {activeCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('delivered')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full font-label-md text-xs transition-all flex items-center gap-1.5 ${
            activeFilter === 'delivered'
              ? 'bg-[#9f3c16] text-white shadow-xs font-semibold'
              : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
          }`}
        >
          <span>Delivered</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#dfe2ec] text-[#181c23] text-[10px] font-bold">
            {deliveredCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('cancelled')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full font-label-md text-xs transition-all flex items-center gap-1.5 ${
            activeFilter === 'cancelled'
              ? 'bg-[#9f3c16] text-white shadow-xs font-semibold'
              : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
          }`}
        >
          <span>Cancelled</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#dfe2ec] text-[#181c23] text-[10px] font-bold">
            {cancelledCount}
          </span>
        </button>
      </div>

      {/* 3. Orders Listing */}
      <div className="flex flex-col gap-4 mt-2">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const isDelivered = order.status === 'delivered';
            const isActive = order.status === 'pending' || order.status === 'processing' || order.status === 'shipped';

            return (
              <article
                key={order.id}
                className="rounded-xl bg-white p-4 shadow-sm border border-[#dfe2ec] flex flex-col gap-3 relative overflow-hidden"
              >
                {/* Subtle Ambient Decorative Tint for Active Orders */}
                {isActive && (
                  <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full bg-[#ffdcc3]/30 blur-2xl pointer-events-none" />
                )}

                {/* Card Header: ID, Date & Status */}
                <div className="flex items-start justify-between gap-2 relative z-10">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-title-md text-sm sm:text-base text-[#181c23] font-bold">
                        {order.orderNumber}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#9f3c16]" />
                      <span className="font-body-sm text-xs text-[#57423b]">{order.placedDate}</span>
                    </div>
                    <span className="font-label-sm text-[10px] text-[#9f3c16] tracking-wide mt-0.5 uppercase font-bold">
                      {order.shippingMethodLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f1f3fd] text-[#181c23] border border-[#dfe2ec]">
                    <span
                      className={`material-symbols-outlined text-[15px] ${
                        order.status === 'shipped' || order.status === 'pending'
                          ? 'text-[#904d00] animate-pulse'
                          : order.status === 'delivered'
                          ? 'text-[#15803D]'
                          : 'text-[#8a726a]'
                      }`}
                    >
                      {order.status === 'delivered'
                        ? 'check_circle'
                        : order.status === 'shipped'
                        ? 'flight_takeoff'
                        : 'local_shipping'}
                    </span>
                    <span className="font-label-sm text-[11px] font-semibold">{order.statusLabel}</span>
                  </div>
                </div>

                {/* Live Delivery Window / Expected Arrival Notice */}
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#f1f3fd] text-[#181c23] text-xs">
                  <div className="w-7 h-7 rounded-full bg-[#ffdbcf] text-[#9f3c16] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[16px]">
                      {isDelivered ? 'home_pin' : 'schedule'}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-[9px] uppercase tracking-wider text-[#8a726a]">
                      {isDelivered ? 'Delivery Note' : 'Estimated Hand-off'}
                    </span>
                    <span className="font-semibold text-xs truncate">
                      {isDelivered
                        ? `Delivered on ${order.placedDate} • ${order.courierNotes || 'Left safely at front porch bench'}`
                        : `${order.estimatedDelivery} • ${order.courierNotes || 'Curator Delivery'}`}
                    </span>
                  </div>
                </div>

                {/* Real-time Progress Stepper for Active Orders */}
                {isActive && (
                  <div className="flex flex-col gap-1.5 pt-1">
                    <div className="relative w-full h-1.5 rounded-full bg-[#dfe2ec] overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#fe932c] to-[#9f3c16] transition-all duration-500"
                        style={{
                          width:
                            order.statusStep === 'Placed'
                              ? '25%'
                              : order.statusStep === 'Bound'
                              ? '50%'
                              : order.statusStep === 'Shipped'
                              ? '78%'
                              : '100%',
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-center font-label-sm text-[10px]">
                      <div className="flex flex-col items-center">
                        <span className="text-[#9f3c16] font-semibold">Placed</span>
                        <span className="text-[#8a726a] text-[9px]">{order.placedTime}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[#9f3c16] font-semibold">Bound</span>
                        <span className="text-[#8a726a] text-[9px]">11:30 AM</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[#9f3c16] font-bold">Shipped</span>
                        <span className="text-[#9f3c16] text-[9px]">In Transit</span>
                      </div>
                      <div className="flex flex-col items-center opacity-40">
                        <span className="text-[#57423b]">Delivered</span>
                        <span className="text-[#8a726a] text-[9px]">Pending</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Book Items Preview */}
                <div className="flex flex-col gap-2 pt-1">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2 rounded-lg bg-[#f1f3fd]/60 hover:bg-[#f1f3fd] transition-colors border border-[#dfe2ec]/50"
                    >
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-11 h-15 rounded object-cover shadow-xs shrink-0"
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-title-md text-xs sm:text-sm text-[#181c23] truncate font-semibold">
                          {item.title}
                        </span>
                        <span className="font-body-sm text-[11px] text-[#57423b]">
                          {item.author} • {item.format}
                        </span>
                        <span className="font-label-sm text-xs text-[#9f3c16] font-semibold mt-0.5">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#e5e8f2] font-label-sm text-[10px] text-[#57423b] font-medium">
                        Qty {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total & Action Triggers */}
                <div className="pt-2 border-t border-[#dfe2ec]/60 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#57423b]">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'} •{' '}
                      {order.items.reduce((acc, i) => acc + i.quantity, 0)} curated copies
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-label-sm text-[10px] text-[#8a726a] uppercase">Total</span>
                      <span className="font-headline-sm text-base text-[#181c23] font-bold">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Actions Tray */}
                  <div className="grid grid-cols-2 gap-2">
                    {isDelivered ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(order);
                            setReviewModalOpen(true);
                          }}
                          className="h-10 px-3 rounded-lg bg-[#ebeef7] text-[#181c23] hover:bg-[#dfe2ec] transition-colors font-label-md text-xs font-semibold flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[17px]">rate_review</span>
                          <span>Leave Review</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReorder(order)}
                          className="h-10 px-3 rounded-lg bg-[#ffdbcf] text-[#822801] hover:bg-[#9f3c16] hover:text-white transition-all font-label-md text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[17px]">replay</span>
                          <span>Reorder Titles</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(order);
                            setDetailsModalOpen(true);
                          }}
                          className="h-10 px-3 rounded-lg bg-[#ebeef7] text-[#181c23] hover:bg-[#dfe2ec] transition-colors font-label-md text-xs font-semibold flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[17px]">receipt_long</span>
                          <span>View Details</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(order);
                            setTrackingModalOpen(true);
                          }}
                          className="h-10 px-3 rounded-lg bg-[#9f3c16] text-white hover:bg-[#bf542c] transition-all font-label-md text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[17px]">near_me</span>
                          <span>Track Package</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="bg-white p-8 rounded-2xl text-center border border-[#dfe2ec] my-4 shadow-sm">
            <span className="material-symbols-outlined text-[44px] text-[#8a726a] mb-2">package_2</span>
            <h3 className="font-headline-sm text-lg text-[#181c23]">No orders found</h3>
            <p className="text-xs text-[#57423b] mt-1 max-w-xs mx-auto">
              There are no orders matching this filter or search inquiry.
            </p>
          </div>
        )}
      </div>

      {/* 4. Literary Concierge Support Card */}
      <section className="mt-6 rounded-2xl bg-[#ebeef7] p-5 relative overflow-hidden flex flex-col gap-3 shadow-xs border border-[#dfe2ec]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#904d00] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <span className="material-symbols-outlined text-[20px]">support_agent</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-base text-[#181c23]">Literary Concierge Desk</span>
            <p className="font-body-sm text-xs text-[#57423b] leading-relaxed mt-0.5">
              Need help with an archival delivery, customized gift packaging, or missing collector edition slipcase? Our curators are here for you.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => showToast('Connecting you to live curator dispatch desk...', 'info', 'chat_bubble')}
            className="flex-1 h-10 rounded-xl bg-white text-[#181c23] hover:bg-[#f1f3fd] transition-colors font-label-md text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs border border-[#dfe2ec]"
          >
            <span className="material-symbols-outlined text-[17px] text-[#9f3c16]">chat_bubble</span>
            <span>Live Curator Chat</span>
          </button>
          <button
            type="button"
            onClick={() => showToast('Support ticket dispatched to concierge@booknest.press', 'success', 'mail')}
            className="h-10 px-4 rounded-xl bg-white text-[#181c23] hover:bg-[#f1f3fd] transition-colors font-label-md text-xs font-semibold flex items-center justify-center gap-1 shadow-xs border border-[#dfe2ec]"
          >
            <span className="material-symbols-outlined text-[17px] text-[#9f3c16]">mail</span>
            <span>Email Us</span>
          </button>
        </div>
      </section>

      {/* 5. Tracking Modal */}
      {trackingModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#181c23]/60 backdrop-blur-sm" onClick={() => setTrackingModalOpen(false)} />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl z-10 border border-[#dec0b7]/40 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#dfe2ec]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#9f3c16] text-[22px]">near_me</span>
                <div>
                  <h3 className="font-headline-sm text-base text-[#181c23]">Carrier Tracking</h3>
                  <span className="font-mono text-xs text-[#9f3c16] font-bold">{selectedOrder.orderNumber}</span>
                </div>
              </div>
              <button onClick={() => setTrackingModalOpen(false)} className="text-[#8a726a] hover:text-[#181c23] p-1">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="p-3 bg-[#f1f3fd] rounded-xl border border-[#dfe2ec] text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#8a726a]">Assigned Courier</span>
                  <span className="font-semibold text-[#181c23]">{selectedOrder.carrier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a726a]">Tracking ID</span>
                  <span className="font-mono text-[#9f3c16] font-bold">{selectedOrder.trackingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a726a]">Destination</span>
                  <span className="font-semibold text-[#181c23]">{selectedOrder.customerCity}, {selectedOrder.customerState}</span>
                </div>
              </div>

              {/* Waypoints */}
              <div className="space-y-3 pl-3 border-l-2 border-[#9f3c16] text-xs">
                <div>
                  <span className="font-bold text-[#181c23] block">Out for Delivery</span>
                  <span className="text-[#57423b] text-[11px]">Courier Marcus H. has package aboard zero-emission van</span>
                  <span className="text-[10px] text-[#8a726a] block mt-0.5">Today 1:45 PM</span>
                </div>
                <div>
                  <span className="font-semibold text-[#181c23] block">Curator Packaged & Sealed</span>
                  <span className="text-[#57423b] text-[11px]">Verified volumes wrapped with botanical wax seal</span>
                  <span className="text-[10px] text-[#8a726a] block mt-0.5">Today 11:30 AM</span>
                </div>
                <div>
                  <span className="font-semibold text-[#181c23] block">Order Received</span>
                  <span className="text-[#57423b] text-[11px]">Order logged in BookNest archival node</span>
                  <span className="text-[10px] text-[#8a726a] block mt-0.5">Today 9:14 AM</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setTrackingModalOpen(false)}
              className="w-full py-2.5 bg-[#9f3c16] text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Done Tracking
            </button>
          </div>
        </div>
      )}

      {/* 6. View Details Modal */}
      {detailsModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#181c23]/60 backdrop-blur-sm" onClick={() => setDetailsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl z-10 border border-[#dec0b7]/40 max-h-[85vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#dfe2ec]">
              <div>
                <h3 className="font-headline-sm text-base text-[#181c23]">Order Details</h3>
                <span className="font-mono text-xs text-[#9f3c16] font-bold">{selectedOrder.orderNumber}</span>
              </div>
              <button onClick={() => setDetailsModalOpen(false)} className="text-[#8a726a] hover:text-[#181c23] p-1">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="py-3 space-y-3 text-xs">
              <div className="space-y-1 bg-[#f1f3fd] p-3 rounded-xl border border-[#dfe2ec]">
                <div className="font-bold text-[#181c23]">Shipping Address</div>
                <div className="text-[#57423b]">{selectedOrder.customerName}</div>
                <div className="text-[#57423b]">{selectedOrder.customerAddress}</div>
              </div>

              <div>
                <div className="font-bold text-[#181c23] mb-2">Curated Titles ({selectedOrder.items.length})</div>
                <div className="space-y-2">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1 border-b border-[#dfe2ec]/50">
                      <div>
                        <div className="font-semibold text-[#181c23]">{it.title}</div>
                        <div className="text-[11px] text-[#57423b]">{it.format} • Qty {it.quantity}</div>
                      </div>
                      <span className="font-bold text-[#181c23]">${(it.price * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#dfe2ec] space-y-1">
                <div className="flex justify-between text-[#57423b]">
                  <span>Subtotal</span>
                  <span>${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#57423b]">
                  <span>Shipping</span>
                  <span>{selectedOrder.shippingCost === 0 ? 'FREE' : `$${selectedOrder.shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-[#57423b]">
                  <span>Tax</span>
                  <span>${selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#9f3c16] pt-1">
                  <span>Total</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#dfe2ec]">
              <button
                type="button"
                onClick={() => handleDownloadInvoice(selectedOrder.orderNumber)}
                className="flex-1 py-2.5 bg-[#ebeef7] hover:bg-[#dfe2ec] text-[#181c23] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Invoice PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="flex-1 py-2.5 bg-[#9f3c16] text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Leave Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#181c23]/60 backdrop-blur-sm" onClick={() => setReviewModalOpen(false)} />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl z-10 border border-[#dec0b7]/40 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#dfe2ec]">
              <h3 className="font-headline-sm text-base text-[#181c23]">Leave a Reader Review</h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-[#8a726a] hover:text-[#181c23] p-1">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="py-4 space-y-3">
              <div className="flex justify-center gap-1 text-[#904d00]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="material-symbols-outlined text-[28px] fill-1 cursor-pointer">
                    star
                  </span>
                ))}
              </div>
              <textarea
                placeholder="Share your thoughts on the printing quality, translation, and literary journey..."
                rows={4}
                className="w-full p-3 rounded-xl bg-[#f1f3fd] text-xs text-[#181c23] border border-[#dfe2ec] focus:outline-none focus:bg-white resize-none"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setReviewModalOpen(false);
                showToast('Thank you! Your literary review has been submitted to the curation panel.', 'success');
              }}
              className="w-full py-2.5 bg-[#9f3c16] text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Submit Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
