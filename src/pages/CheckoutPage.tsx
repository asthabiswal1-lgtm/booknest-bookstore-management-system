import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { items, subtotal, discountAmount, taxAmount, total, promoCode, clearCart } = useCart();
  const { createOrder } = useOrders();
  const { showToast } = useToast();

  const [step, setStep] = useState<number>(2); // 1: Delivery, 2: Payment, 3: Confirm
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [itemsAccordionOpen, setItemsAccordionOpen] = useState(true);
  const [paymentTab, setPaymentTab] = useState<'card' | 'applepay' | 'paypal'>('card');
  const [submitting, setSubmitting] = useState(false);

  // Address State
  const [recipientName, setRecipientName] = useState(currentUser?.name || 'Elena Rostova');
  const [streetAddress, setStreetAddress] = useState('742 Evergreen Terrace, Apt 4B');
  const [city, setCity] = useState('Brooklyn');
  const [state, setState] = useState('NY');
  const [zip, setZip] = useState('11201');
  const [phone, setPhone] = useState('+1 (555) 389-4091');
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Card Form State
  const [cardholderName, setCardholderName] = useState(currentUser?.name || 'Elena Rostova');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4291');
  const [expiryDate, setExpiryDate] = useState('08 / 27');
  const [cvv, setCvv] = useState('842');
  const [saveCard, setSaveCard] = useState(true);
  const [billingMatches, setBillingMatches] = useState(true);

  // Calculate adjusted shipping & total
  const shippingFee = shippingMethod === 'express' ? 6.5 : 0;
  const grandTotal = Math.max(0, total + shippingFee);

  const handlePlaceOrder = () => {
    if (items.length === 0) {
      showToast('Your cart has no volumes. Return to catalog to select books.', 'warning');
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      const orderItems = items.map((i) => ({
        bookId: i.bookId,
        title: i.book.title,
        author: i.book.author,
        format: i.selectedFormat,
        price: i.price,
        quantity: i.quantity,
        coverImage: i.book.coverImage,
        shelfLocation: i.book.shelfLocation,
        isbn: i.book.isbn,
      }));

      const newOrder = createOrder({
        customerId: currentUser?.id || 'usr-8902',
        customerName: recipientName,
        customerEmail: currentUser?.email || 'elena.rostova@literary.org',
        customerCity: city,
        customerState: state,
        customerAddress: `${streetAddress}, ${city}, ${state} ${zip}`,
        customerPhone: phone,
        items: orderItems,
        subtotal,
        shippingCost: shippingFee,
        shippingMethod,
        shippingMethodLabel:
          shippingMethod === 'express'
            ? 'Express Literary Delivery (Guaranteed Next Day)'
            : 'Curator Courier (Eco-Carbon Standard dispatch)',
        tax: taxAmount,
        discount: discountAmount,
        discountCode: promoCode?.code,
        total: grandTotal,
        paymentMethod: paymentTab === 'applepay' ? 'Apple Pay' : paymentTab === 'paypal' ? 'PayPal' : 'Credit Card',
        paymentCardLast4: '4291',
        paymentCardBrand: 'VISA',
      });

      clearCart();
      setSubmitting(false);
      setStep(3);
      showToast(`Order ${newOrder.orderNumber} confirmed! Dispatching soon.`, 'success', 'menu_book');
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full pb-20 max-w-xl mx-auto px-3 sm:px-6">
      {/* 1. Header Back Bar */}
      <div className="py-2.5 flex items-center justify-between border-b border-[#dfe2ec]/60 mb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 -ml-1 flex items-center justify-center text-[#181c23] hover:text-[#9f3c16] transition-colors rounded-lg"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <span className="font-title-md text-sm sm:text-base text-[#181c23] leading-tight font-semibold">
              Checkout Flow
            </span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[13px] text-[#9f3c16]">lock</span>
              <span className="font-label-sm text-[10px] text-[#57423b] uppercase tracking-wider leading-none">
                256-Bit SSL Encrypted
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-[#f1f3fd] px-2.5 py-1 rounded-full text-[#57423b] font-label-sm text-[11px] border border-[#dfe2ec]">
          <span className="w-2 h-2 rounded-full bg-[#9f3c16] animate-pulse"></span>
          <span>Secure Checkout</span>
        </div>
      </div>

      {/* 2. Stepper Progress Bar */}
      <div className="px-3 py-3 bg-[#f1f3fd] rounded-xl shadow-xs border border-[#dfe2ec] mb-4">
        <div className="flex items-center justify-between relative max-w-md mx-auto">
          {/* Step 1: Delivery */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-xs font-bold ${
                step >= 1 ? 'bg-[#9f3c16] text-white' : 'bg-[#dfe2ec] text-[#57423b]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
            </div>
            <span className="font-label-sm text-[11px] text-[#9f3c16] font-semibold">Delivery</span>
          </div>

          <div className={`flex-1 h-0.5 mx-2 rounded-full ${step >= 2 ? 'bg-[#9f3c16]' : 'bg-[#dfe2ec]'}`} />

          {/* Step 2: Payment */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-xs font-bold ${
                step >= 2 ? 'bg-[#bf542c] text-white animate-pulse' : 'bg-[#dfe2ec] text-[#57423b]'
              }`}
            >
              {step > 2 ? <span className="material-symbols-outlined text-[16px]">check</span> : '2'}
            </div>
            <span className="font-label-sm text-[11px] text-[#181c23] font-bold">Payment</span>
          </div>

          <div className={`flex-1 h-0.5 mx-2 rounded-full ${step >= 3 ? 'bg-[#9f3c16]' : 'bg-[#dfe2ec]'}`} />

          {/* Step 3: Confirm */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 3 ? 'bg-[#9f3c16] text-white' : 'bg-[#dfe2ec] text-[#57423b]'
              }`}
            >
              {step === 3 ? <span className="material-symbols-outlined text-[16px]">check</span> : '3'}
            </div>
            <span className="font-label-sm text-[11px] text-[#57423b]">Confirm</span>
          </div>
        </div>
      </div>

      {step === 3 ? (
        /* Order Confirmed View */
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#dfe2ec] text-center flex flex-col items-center animate-fade-in my-4">
          <div className="w-16 h-16 rounded-full bg-[#ffdbcf] text-[#9f3c16] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[36px]">verified</span>
          </div>
          <h2 className="font-headline-md text-2xl text-[#181c23] mb-1">Curated Parcel Confirmed!</h2>
          <p className="font-body-md text-xs sm:text-sm text-[#57423b] max-w-sm mb-5 leading-relaxed">
            Your literary volumes are being wrapped in acid-free vellum with our signature botanical wax seal.
          </p>

          <div className="w-full bg-[#f1f3fd] rounded-xl p-3.5 mb-6 text-left border border-[#dfe2ec] text-xs">
            <div className="flex justify-between py-1 border-b border-[#dfe2ec]/60">
              <span className="text-[#8a726a]">Destination</span>
              <span className="font-semibold text-[#181c23]">{streetAddress}, {city}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#dfe2ec]/60">
              <span className="text-[#8a726a]">Shipping</span>
              <span className="font-semibold text-[#904d00]">
                {shippingMethod === 'express' ? 'Express Literary Delivery' : 'Curator Courier (Free)'}
              </span>
            </div>
            <div className="flex justify-between py-1 pt-1.5">
              <span className="text-[#8a726a] font-bold">Total Paid</span>
              <span className="font-bold text-[#9f3c16]">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="flex-1 py-3 bg-[#9f3c16] hover:bg-[#bf542c] text-white rounded-xl font-label-md text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">package_2</span>
              <span>View In Orders</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/catalog')}
              className="flex-1 py-3 bg-[#f1f3fd] hover:bg-[#dfe2ec] text-[#181c23] rounded-xl font-label-md text-xs sm:text-sm font-semibold transition-colors"
            >
              Explore More Titles
            </button>
          </div>
        </div>
      ) : (
        /* Steps 1 & 2 Main Content */
        <div className="space-y-4">
          {/* Literary Warm Greeting / Banner */}
          <div className="bg-[#ffdcc3]/40 rounded-xl p-3.5 shadow-xs flex items-start gap-3 border border-[#dec0b7]">
            <div className="w-8 h-8 rounded-full bg-[#fe932c] text-[#2f1500] flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">auto_stories</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-sm sm:text-base text-[#181c23] leading-snug">
                Carefully curated parcel
              </span>
              <span className="font-body-sm text-xs text-[#57423b] mt-0.5 leading-relaxed">
                Your bespoke literary bundle will be packed with acid-free vellum wrap and botanical wax seal.
              </span>
            </div>
          </div>

          {/* Section: Shipping Address */}
          <div className="bg-[#f1f3fd] rounded-xl p-4 shadow-xs border border-[#dfe2ec] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#9f3c16] text-[20px]">local_shipping</span>
                <h2 className="font-title-md text-sm sm:text-base text-[#181c23] font-semibold">Shipping Address</h2>
              </div>
              <span className="font-label-sm text-[10px] text-[#9f3c16] uppercase font-bold tracking-wider bg-[#ffdbcf] px-2 py-0.5 rounded-full">
                Step 1 Verified
              </span>
            </div>

            {/* Selected Address Card */}
            {!isEditingAddress ? (
              <div className="bg-white rounded-xl p-3.5 shadow-xs border border-[#dfe2ec] flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-1 w-4 h-4 rounded-full bg-[#9f3c16] flex items-center justify-center text-white shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-title-md text-xs sm:text-sm text-[#181c23] font-bold truncate">
                        {recipientName}
                      </span>
                      <span className="bg-[#ffdbcf] text-[#822801] font-label-sm text-[10px] px-2 py-0.2 rounded-full font-semibold">
                        Primary
                      </span>
                    </div>
                    <p className="font-body-md text-xs text-[#57423b] mt-1 leading-relaxed">
                      {streetAddress}<br />
                      {city}, {state} {zip}
                    </p>
                    <span className="font-body-sm text-[11px] text-[#8a726a] mt-0.5">{phone}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditingAddress(true)}
                  className="text-[#9f3c16] hover:text-[#bf542c] font-label-md text-xs px-2 py-1 rounded-lg transition-colors flex items-center gap-1 shrink-0 font-semibold"
                >
                  <span className="material-symbols-outlined text-[15px]">edit</span>
                  <span>Edit</span>
                </button>
              </div>
            ) : (
              /* Inline Address Edit Form */
              <div className="bg-white rounded-xl p-3.5 shadow-xs border border-[#dfe2ec] space-y-2.5">
                <div>
                  <label className="font-label-sm text-[#57423b] text-[10px] uppercase block mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full h-9 px-3 bg-[#f1f3fd] rounded-lg text-xs text-[#181c23] focus:outline-none focus:bg-white border border-[#dfe2ec]"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-[#57423b] text-[10px] uppercase block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full h-9 px-3 bg-[#f1f3fd] rounded-lg text-xs text-[#181c23] focus:outline-none focus:bg-white border border-[#dfe2ec]"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-label-sm text-[#57423b] text-[10px] uppercase block mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-9 px-3 bg-[#f1f3fd] rounded-lg text-xs text-[#181c23] focus:outline-none focus:bg-white border border-[#dfe2ec]"
                    />
                  </div>
                  <div>
                    <label className="font-label-sm text-[#57423b] text-[10px] uppercase block mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full h-9 px-3 bg-[#f1f3fd] rounded-lg text-xs text-[#181c23] focus:outline-none focus:bg-white border border-[#dfe2ec]"
                    />
                  </div>
                  <div>
                    <label className="font-label-sm text-[#57423b] text-[10px] uppercase block mb-1">ZIP</label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full h-9 px-3 bg-[#f1f3fd] rounded-lg text-xs text-[#181c23] focus:outline-none focus:bg-white border border-[#dfe2ec]"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingAddress(false);
                    showToast('Delivery address updated', 'success');
                  }}
                  className="w-full py-2 bg-[#9f3c16] text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Save Address
                </button>
              </div>
            )}

            {/* Delivery Method Selector */}
            <div className="pt-2 space-y-2">
              <label className="font-label-md text-xs text-[#181c23] font-semibold block">Select Speed & Care</label>

              {/* Standard */}
              <label
                onClick={() => setShippingMethod('standard')}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  shippingMethod === 'standard'
                    ? 'bg-white border-[#9f3c16] shadow-xs'
                    : 'bg-white/60 border-[#dfe2ec] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="shipping_method"
                    checked={shippingMethod === 'standard'}
                    onChange={() => setShippingMethod('standard')}
                    className="w-4 h-4 text-[#9f3c16] accent-[#9f3c16]"
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-title-md text-xs sm:text-sm text-[#181c23]">Curator Courier</span>
                      <span className="bg-[#ebeef7] px-2 py-0.2 rounded-full font-label-sm text-[10px] text-[#57423b]">
                        Eco-Carbon
                      </span>
                    </div>
                    <span className="font-body-sm text-[11px] text-[#57423b]">Standard dispatch • 2–3 business days</span>
                  </div>
                </div>
                <span className="font-title-md text-xs sm:text-sm text-[#9f3c16] font-bold">FREE</span>
              </label>

              {/* Express */}
              <label
                onClick={() => setShippingMethod('express')}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  shippingMethod === 'express'
                    ? 'bg-white border-[#9f3c16] shadow-xs'
                    : 'bg-white/60 border-[#dfe2ec] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="shipping_method"
                    checked={shippingMethod === 'express'}
                    onChange={() => setShippingMethod('express')}
                    className="w-4 h-4 text-[#9f3c16] accent-[#9f3c16]"
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-title-md text-xs sm:text-sm text-[#181c23]">Express Literary Delivery</span>
                      <span className="bg-[#ffdcc3] text-[#2f1500] font-label-sm text-[10px] px-1.5 py-0.2 rounded-full font-semibold">
                        Priority
                      </span>
                    </div>
                    <span className="font-body-sm text-[11px] text-[#57423b]">
                      Guaranteed Next Day Delivery before 2 PM
                    </span>
                  </div>
                </div>
                <span className="font-title-md text-xs sm:text-sm text-[#181c23] font-bold">$6.50</span>
              </label>
            </div>
          </div>

          {/* Section: Collapsible Order Items Preview */}
          <div className="bg-[#f1f3fd] rounded-xl p-4 shadow-xs border border-[#dfe2ec] space-y-2">
            <button
              type="button"
              onClick={() => setItemsAccordionOpen(!itemsAccordionOpen)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#ffdbcf] text-[#9f3c16] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[17px]">menu_book</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-title-md text-xs sm:text-sm text-[#181c23] font-semibold">
                    Curated Parcel ({items.reduce((acc, i) => acc + i.quantity, 0)} Items)
                  </span>
                  <span className="font-body-sm text-[11px] text-[#57423b]">
                    {items.length} unique volumes carefully gathered
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#9f3c16] text-xs font-semibold">
                <span>{itemsAccordionOpen ? 'Hide Books' : 'View Books'}</span>
                <span
                  className="material-symbols-outlined text-[18px] transition-transform duration-200"
                  style={{ transform: itemsAccordionOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                >
                  expand_more
                </span>
              </div>
            </button>

            {itemsAccordionOpen && (
              <div className="space-y-2 pt-2 border-t border-[#dfe2ec]/60">
                {items.map((item) => (
                  <div
                    key={item.bookId}
                    className="bg-white rounded-xl p-2.5 shadow-xs border border-[#dfe2ec] flex items-center gap-3"
                  >
                    <div className="w-12 h-16 rounded overflow-hidden bg-[#ebeef7] shrink-0 border border-[#dec0b7]/40 shadow-xs">
                      <img
                        src={item.book.coverImage}
                        alt={item.book.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      {item.book.badge && (
                        <span className="bg-[#ffdcc3] text-[#2f1500] font-label-sm text-[9px] px-1.5 py-0.2 rounded-full inline-block mb-0.5 font-bold">
                          {item.book.badge}
                        </span>
                      )}
                      <h3 className="font-title-md text-xs sm:text-sm text-[#181c23] truncate leading-tight">
                        {item.book.title}
                      </h3>
                      <p className="font-body-sm text-[11px] text-[#57423b]">
                        {item.book.author} • {item.selectedFormat}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-label-sm text-[10px] text-[#57423b] bg-[#ebeef7] px-2 py-0.2 rounded">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-title-md text-xs sm:text-sm text-[#181c23] font-bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Payment Details Form */}
          <div className="bg-[#f1f3fd] rounded-xl p-4 shadow-xs border border-[#dfe2ec] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#9f3c16] text-[20px]">credit_card</span>
                <h2 className="font-title-md text-sm sm:text-base text-[#181c23] font-semibold">Payment Method</h2>
              </div>
              <div className="flex items-center gap-1 text-[#57423b] font-label-sm text-[11px]">
                <span className="material-symbols-outlined text-[15px] text-[#9f3c16]">verified_user</span>
                <span>Encrypted</span>
              </div>
            </div>

            {/* Payment Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-[#ebeef7] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPaymentTab('card')}
                className={`py-2 rounded-lg font-label-md text-xs flex items-center justify-center gap-1.5 transition-colors font-semibold ${
                  paymentTab === 'card' ? 'bg-white shadow-xs text-[#9f3c16]' : 'text-[#57423b] hover:text-[#181c23]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">credit_card</span>
                <span>Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentTab('applepay')}
                className={`py-2 rounded-lg font-label-md text-xs flex items-center justify-center gap-1.5 transition-colors font-semibold ${
                  paymentTab === 'applepay' ? 'bg-white shadow-xs text-[#9f3c16]' : 'text-[#57423b] hover:text-[#181c23]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">payments</span>
                <span>Apple Pay</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentTab('paypal')}
                className={`py-2 rounded-lg font-label-md text-xs flex items-center justify-center gap-1.5 transition-colors font-semibold ${
                  paymentTab === 'paypal' ? 'bg-white shadow-xs text-[#9f3c16]' : 'text-[#57423b] hover:text-[#181c23]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                <span>PayPal</span>
              </button>
            </div>

            {/* Card Inputs Form */}
            {paymentTab === 'card' ? (
              <div className="space-y-2.5">
                <div>
                  <label className="font-label-sm text-[10px] text-[#57423b] uppercase font-semibold tracking-wider block mb-1">
                    Cardholder Full Name
                  </label>
                  <div className="relative bg-white rounded-xl shadow-xs border border-[#dfe2ec] flex items-center px-3 py-2">
                    <input
                      type="text"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      className="bg-transparent w-full text-xs text-[#181c23] focus:outline-none"
                    />
                    <span className="material-symbols-outlined text-[#8a726a] text-[18px]">person</span>
                  </div>
                </div>

                <div>
                  <label className="font-label-sm text-[10px] text-[#57423b] uppercase font-semibold tracking-wider block mb-1">
                    Card Number
                  </label>
                  <div className="relative bg-white rounded-xl shadow-xs border border-[#dfe2ec] flex items-center px-3 py-2 justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="material-symbols-outlined text-[#8a726a] text-[18px]">credit_card</span>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="bg-transparent w-full text-xs text-[#181c23] tracking-wider focus:outline-none font-mono"
                      />
                    </div>
                    <div className="bg-[#ffdbcf] text-[#822801] font-label-sm text-[10px] px-2 py-0.5 rounded font-bold tracking-widest uppercase">
                      VISA
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-label-sm text-[10px] text-[#57423b] uppercase font-semibold tracking-wider block mb-1">
                      Expiry Date
                    </label>
                    <div className="bg-white rounded-xl shadow-xs border border-[#dfe2ec] px-3 py-2 flex items-center justify-between">
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="bg-transparent w-full text-xs text-[#181c23] focus:outline-none font-mono"
                      />
                      <span className="material-symbols-outlined text-[#8a726a] text-[16px]">calendar_today</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-label-sm text-[10px] text-[#57423b] uppercase font-semibold tracking-wider">
                        CVV / CVC
                      </label>
                      <span className="material-symbols-outlined text-[#8a726a] text-[13px]" title="3 digits on back of card">
                        info
                      </span>
                    </div>
                    <div className="bg-white rounded-xl shadow-xs border border-[#dfe2ec] px-3 py-2 flex items-center justify-between">
                      <input
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="bg-transparent w-full text-xs text-[#181c23] tracking-widest focus:outline-none font-mono"
                      />
                      <span className="material-symbols-outlined text-[#9f3c16] text-[16px]">lock</span>
                    </div>
                  </div>
                </div>

                {/* Checkbox Options */}
                <div className="pt-1 space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer text-xs text-[#181c23]">
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-[#9f3c16] accent-[#9f3c16]"
                    />
                    <span>Save card securely for future literary purchases & first edition reservations</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer text-xs text-[#181c23]">
                    <input
                      type="checkbox"
                      checked={billingMatches}
                      onChange={(e) => setBillingMatches(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-[#9f3c16] accent-[#9f3c16]"
                    />
                    <span>Billing address matches shipping address ({city}, {state} {zip})</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white rounded-xl text-center border border-[#dfe2ec]">
                <span className="material-symbols-outlined text-[32px] text-[#9f3c16] mb-1">
                  {paymentTab === 'applepay' ? 'payments' : 'account_balance_wallet'}
                </span>
                <p className="text-xs text-[#57423b]">
                  You will be prompted to authenticate with {paymentTab === 'applepay' ? 'Apple Pay' : 'PayPal'} when you place your order.
                </p>
              </div>
            )}
          </div>

          {/* Section: Payment Summary Breakdown */}
          <div className="bg-[#f1f3fd] rounded-xl p-4 shadow-xs border border-[#dfe2ec] space-y-2">
            <div className="flex items-center justify-between pb-1">
              <h2 className="font-title-md text-sm sm:text-base text-[#181c23] font-semibold">Payment Summary</h2>
              <span className="font-label-sm text-[10px] text-[#57423b] bg-[#ebeef7] px-2 py-0.5 rounded-full font-bold">
                USD ($)
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-[#57423b] pt-1">
              <div className="flex justify-between items-center">
                <span>Items Subtotal ({items.length} Titles, {items.reduce((acc, i) => acc + i.quantity, 0)} Books)</span>
                <span className="font-semibold text-[#181c23]">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Curator Courier Shipping</span>
                <span className="text-[#9f3c16] font-semibold">
                  {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>

              {promoCode && (
                <div className="flex justify-between items-center bg-[#ffdcc3]/60 px-2.5 py-1 rounded-lg text-[#2f1500]">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px]">local_offer</span>
                    <span className="font-semibold text-xs">Curator Promo ({promoCode.code})</span>
                  </div>
                  <span className="font-bold text-xs">-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span>Estimated State & Local Tax</span>
                <span className="font-semibold text-[#181c23]">${taxAmount.toFixed(2)}</span>
              </div>

              {/* Total Pill */}
              <div className="pt-2 bg-white p-3 rounded-xl shadow-xs border border-[#dfe2ec] flex justify-between items-baseline mt-2">
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-[#8a726a] uppercase tracking-wider font-bold">
                    Total Amount
                  </span>
                  <span className="font-body-sm text-[11px] text-[#57423b]">
                    Includes all duties and archival packing
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-headline-lg-mobile text-xl sm:text-2xl text-[#9f3c16] font-bold tracking-tight">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Guarantee Badges Bento */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white p-2.5 rounded-xl shadow-xs border border-[#dfe2ec] flex flex-col items-center text-center gap-1">
              <span className="material-symbols-outlined text-[#9f3c16] text-[18px]">shield</span>
              <span className="font-label-sm text-[10px] text-[#181c23] font-semibold leading-tight">
                256-Bit SSL Encrypted
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-xl shadow-xs border border-[#dfe2ec] flex flex-col items-center text-center gap-1">
              <span className="material-symbols-outlined text-[#904d00] text-[18px]">verified</span>
              <span className="font-label-sm text-[10px] text-[#181c23] font-semibold leading-tight">
                Independent Bookseller
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-xl shadow-xs border border-[#dfe2ec] flex flex-col items-center text-center gap-1">
              <span className="material-symbols-outlined text-[#9f3c16] text-[18px]">recycling</span>
              <span className="font-label-sm text-[10px] text-[#181c23] font-semibold leading-tight">
                Archival Eco Packaging
              </span>
            </div>
          </div>

          {/* CTA Place Order Area */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={handlePlaceOrder}
              className="w-full py-3.5 px-4 bg-[#9f3c16] hover:bg-[#bf542c] active:scale-[0.99] text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-2 font-bold text-sm"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>
                  <span>Securing your order...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  <span>Place Order • ${grandTotal.toFixed(2)}</span>
                </>
              )}
            </button>
            <p className="font-body-sm text-[11px] text-center text-[#8a726a] px-3 leading-relaxed">
              By placing your order, you agree to BookNest's{' '}
              <a href="#" className="underline text-[#9f3c16]">Terms of Service</a> and{' '}
              <a href="#" className="underline text-[#9f3c16]">Privacy Policy</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
