import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    restoreSampleCart,
    promoCode,
    promoInput,
    setPromoInput,
    applyPromoCode,
    removePromoCode,
    subtotal,
    discountAmount,
    taxAmount,
    shippingCost,
    total,
    totalItemCount,
    freeShippingQualified,
  } = useCart();

  const { showToast } = useToast();

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    if (res.success) {
      showToast(res.message, 'success', 'local_offer');
    } else {
      showToast(res.message, 'warning');
    }
  };

  const handleProceedCheckout = () => {
    if (items.length === 0) {
      showToast('Your cart is empty. Add a literary work first.', 'warning');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="flex flex-col w-full pb-32 max-w-3xl mx-auto px-3 sm:px-6">
      {/* 1. Header Bar */}
      <div className="py-3 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h1 className="font-headline-lg-mobile sm:font-headline-md text-xl sm:text-2xl text-[#181c23]">
            Shopping Cart
          </h1>
          <span className="font-label-sm text-xs text-[#57423b] bg-[#e5e8f2] px-2 py-0.5 rounded-full font-semibold">
            ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})
          </span>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={() => {
              clearCart();
              showToast('Cart cleared', 'info', 'remove_shopping_cart');
            }}
            className="text-[#57423b] hover:text-[#ba1a1a] transition-colors flex items-center gap-1 font-label-md text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-[16px]">remove_shopping_cart</span>
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* 2. Free Express Shipping Unlocked Progress */}
      {items.length > 0 && (
        <div className="mb-3">
          <div className="bg-[#f1f3fd] rounded-xl p-3 flex items-center gap-3 shadow-xs border border-[#dfe2ec]">
            <div className="w-8 h-8 rounded-full bg-[#ffdcc3] text-[#2f1500] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-[#904d00]">Free Express Shipping Unlocked!</span>
                <span className="text-[#57423b] font-normal text-[11px]">Qualified</span>
              </div>
              <div className="w-full bg-[#dfe2ec] rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className="bg-[#fe932c] h-full rounded-full transition-all duration-500"
                  style={{ width: freeShippingQualified ? '100%' : '50%' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Cart Items List */}
      {items.length > 0 ? (
        <div className="flex flex-col gap-2.5 mb-5">
          {items.map((item) => (
            <div
              key={item.bookId}
              className="bg-white rounded-xl p-3 shadow-xs flex gap-3 relative transition-all border border-[#dfe2ec]/70 hover:shadow-sm"
            >
              {/* Thumbnail */}
              <div className="w-20 h-28 rounded-lg overflow-hidden shrink-0 bg-[#ebeef7] border border-[#dec0b7]/40 shadow-xs">
                <img
                  src={item.book.coverImage}
                  alt={item.book.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info & Quantity */}
              <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h2 className="font-headline-sm text-sm sm:text-base text-[#181c23] line-clamp-1 leading-snug">
                      {item.book.title}
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        removeFromCart(item.bookId);
                        showToast(`Removed "${item.book.title}" from parcel`, 'info', 'delete');
                      }}
                      className="text-[#8a726a] hover:text-[#ba1a1a] transition-colors p-1"
                      aria-label={`Remove ${item.book.title}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">delete_outline</span>
                    </button>
                  </div>
                  <p className="font-body-sm text-xs text-[#57423b]">{item.book.author}</p>
                  <span className="inline-block mt-1 font-label-sm text-[10px] bg-[#ebeef7] px-1.5 py-0.5 rounded text-[#57423b] font-medium">
                    {item.selectedFormat}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#dfe2ec]/50">
                  <div className="flex flex-col">
                    <span className="font-title-md text-sm sm:text-base text-[#9f3c16] font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <span className="font-label-sm text-[11px] text-[#8a726a]">
                      ${item.price.toFixed(2)} each
                    </span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center bg-[#f1f3fd] rounded-lg p-0.5 shadow-xs border border-[#dfe2ec]">
                    <button
                      type="button"
                      onClick={() => decrementQuantity(item.bookId)}
                      className="w-7 h-7 flex items-center justify-center rounded text-[#181c23] hover:bg-[#dfe2ec] transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <span className="font-title-md text-xs sm:text-sm w-7 text-center font-bold text-[#181c23]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => incrementQuantity(item.bookId)}
                      className="w-7 h-7 flex items-center justify-center rounded text-[#181c23] hover:bg-[#dfe2ec] transition-colors"
                      aria-label="Increase quantity"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty Cart View */
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl p-6 border border-[#dfe2ec] my-4 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-[#f1f3fd] flex items-center justify-center text-[#9f3c16] mb-3 shadow-inner">
            <span className="material-symbols-outlined text-[44px]">auto_stories</span>
          </div>
          <h2 className="font-headline-md text-xl text-[#181c23] mb-1">Your shelf is quiet</h2>
          <p className="font-body-md text-xs sm:text-sm text-[#57423b] max-w-xs mb-5">
            You don't have any literary works waiting in your bag. Discover rare releases and curated collections.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <Link
              to="/catalog"
              className="bg-[#9f3c16] hover:bg-[#bf542c] text-white px-5 py-2.5 rounded-xl font-label-md text-xs font-semibold shadow-sm transition-all"
            >
              Browse Catalog
            </Link>
            <button
              type="button"
              onClick={restoreSampleCart}
              className="bg-[#ebeef7] hover:bg-[#dfe2ec] text-[#181c23] px-4 py-2.5 rounded-xl font-label-md text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[17px]">replay</span>
              <span>Restore Sample Cart</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Voucher & Summary Section */}
      {items.length > 0 && (
        <div className="flex flex-col gap-3">
          {/* Curator Voucher Input Card */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-[#dfe2ec] flex flex-col gap-2.5">
            <label htmlFor="promoInput" className="font-label-md text-xs text-[#181c23] font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#904d00]">loyalty</span>
              <span>Curator Voucher or Promo</span>
            </label>

            <div className="flex gap-2">
              <input
                id="promoInput"
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="Enter coupon code (e.g. NEST15)"
                className="flex-1 bg-[#f1f3fd] text-[#181c23] uppercase tracking-wider rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#9f3c16] border border-[#dfe2ec]"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="bg-[#904d00] hover:bg-[#6e3900] text-white px-4 py-2 rounded-lg font-label-md text-xs uppercase tracking-wide transition-colors active:scale-95 shadow-xs font-bold"
              >
                Apply
              </button>
            </div>

            {/* Promo Badge if applied */}
            {promoCode && (
              <div className="flex items-center justify-between bg-[#ffdbcf] text-[#822801] px-3 py-1.5 rounded-lg border border-[#dec0b7]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="material-symbols-outlined text-[16px] shrink-0">check_circle</span>
                  <span className="font-label-sm text-xs font-bold truncate">
                    {promoCode.code} - {promoCode.discountPercent}% OFF applied
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-label-sm text-xs font-bold">-${discountAmount.toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => {
                      removePromoCode();
                      showToast('Promo code removed', 'info');
                    }}
                    className="text-[#822801] hover:opacity-75 p-0.5"
                    aria-label="Remove promo code"
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Card */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-[#dfe2ec] flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#dfe2ec]/50">
              <span className="font-headline-sm text-sm sm:text-base text-[#181c23]">Order Summary</span>
              <span className="font-label-sm text-[10px] text-[#904d00] bg-[#ffdcc3] px-2 py-0.5 rounded uppercase font-bold">
                Verified Pricing
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5 text-xs text-[#57423b]">
              <span>Subtotal</span>
              <span className="font-title-md text-[#181c23] tabular-nums font-semibold">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5 text-xs text-[#57423b]">
              <div className="flex items-center gap-1">
                <span>Shipping</span>
                <span className="material-symbols-outlined text-[14px]" title="Free standard express shipping on qualified orders">
                  info
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-label-sm text-[11px] line-through text-[#8a726a]">$4.99</span>
                <span className="font-label-md text-xs text-[#904d00] font-bold uppercase tracking-wider">
                  FREE
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center py-0.5 text-xs text-[#57423b]">
              <span>Estimated Tax (8%)</span>
              <span className="font-title-md text-[#181c23] tabular-nums font-semibold">
                ${taxAmount.toFixed(2)}
              </span>
            </div>

            {promoCode && (
              <div className="flex justify-between items-center py-0.5 text-xs text-[#9f3c16]">
                <span className="font-medium">Curator Discount ({promoCode.discountPercent}%)</span>
                <span className="font-title-md tabular-nums font-bold">-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="h-px bg-[#dfe2ec] my-1" />

            <div className="flex justify-between items-baseline pt-1">
              <div>
                <span className="font-title-lg text-sm sm:text-base text-[#181c23] font-bold">
                  Estimated Total
                </span>
                <p className="font-label-sm text-[10px] text-[#8a726a]">
                  Including taxes and standard courier fees
                </p>
              </div>
              <span className="font-headline-md text-xl sm:text-2xl text-[#9f3c16] font-bold tabular-nums">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Literary Delivery Pledge & SSL Badge */}
          <div className="bg-[#f1f3fd] rounded-xl p-3 flex flex-col gap-2 shadow-xs border border-[#dfe2ec]">
            <div className="flex items-center gap-1.5 text-[#181c23]">
              <span className="material-symbols-outlined text-[#904d00] text-[18px]">verified_user</span>
              <span className="font-label-md text-xs font-bold">BookNest Literary Delivery Pledge</span>
            </div>
            <p className="font-body-sm text-[11px] text-[#57423b] leading-relaxed">
              Packaged in archival acid-free wrapping with corner guards. Ships within 24 hours from independent bookshops with end-to-end tracked courier.
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-[#dfe2ec]/60">
              <div className="flex items-center gap-1 text-[#57423b] font-label-sm text-[11px]">
                <span className="material-symbols-outlined text-[15px] text-[#0051d5]">lock</span>
                <span>256-bit SSL Secure Checkout</span>
              </div>
              <div className="flex items-center gap-1 opacity-80">
                <span className="px-1.5 py-0.5 rounded bg-[#dfe2ec] text-[9px] font-bold text-[#181c23]">VISA</span>
                <span className="px-1.5 py-0.5 rounded bg-[#dfe2ec] text-[9px] font-bold text-[#181c23]">MC</span>
                <span className="px-1.5 py-0.5 rounded bg-[#dfe2ec] text-[9px] font-bold text-[#181c23]">AMEX</span>
                <span className="px-1.5 py-0.5 rounded bg-[#dfe2ec] text-[9px] font-bold text-[#181c23]">APPLE</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Sticky / Docked Checkout Bar */}
      {items.length > 0 && (
        <div className="fixed bottom-16 md:bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 shadow-xl border-t border-[#dec0b7]/40 flex items-center justify-between gap-4 max-w-3xl mx-auto">
          <div className="flex flex-col">
            <span className="font-label-sm text-[10px] text-[#8a726a] uppercase tracking-wider leading-none">
              Total Due
            </span>
            <span className="font-headline-sm text-lg sm:text-xl text-[#9f3c16] font-bold tabular-nums mt-0.5">
              ${total.toFixed(2)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleProceedCheckout}
            className="flex-1 max-w-xs bg-[#9f3c16] text-white py-3 px-4 rounded-xl font-label-md text-xs sm:text-sm font-bold hover:bg-[#bf542c] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
};
