import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { useToast } from '../../context/ToastContext';
import { Order, OrderStatus, OrderStep } from '../../types';

export const AdminOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, updateOrderStatus, updatePackagingChecklist, assignCarrier } = useOrders();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered'>('all');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>(['order-1', 'order-2']);

  // Active Workflow Order Drawer
  const [activeWorkflowOrder, setActiveWorkflowOrder] = useState<Order | null>(orders[0] || null);
  const [workflowStatus, setWorkflowStatus] = useState<OrderStatus>('processing');
  const [workflowStep, setWorkflowStep] = useState<OrderStep>('Bound');
  const [carrierInput, setCarrierInput] = useState('BookNest Curator Courier (Priority Hand-off)');
  const [barcodeInput, setBarcodeInput] = useState('BKN-NY-89241-EXP');
  const [checklist, setChecklist] = useState({
    verifiedVolumes: true,
    enclosedVellum: true,
    affixedLabel: false,
  });

  const handleOpenWorkflow = (order: Order) => {
    setActiveWorkflowOrder(order);
    setWorkflowStatus(order.status);
    setWorkflowStep(order.statusStep);
    setCarrierInput(order.carrier);
    setBarcodeInput(order.trackingNumber);
    setChecklist(
      order.packagingChecklist || {
        verifiedVolumes: true,
        enclosedVellum: true,
        affixedLabel: false,
      }
    );

    const drawer = document.getElementById('fulfillment-drawer-card');
    if (drawer) {
      drawer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleConfirmFulfillment = () => {
    if (!activeWorkflowOrder) return;
    updateOrderStatus(activeWorkflowOrder.id, workflowStatus, workflowStep, carrierInput, barcodeInput);
    updatePackagingChecklist(activeWorkflowOrder.id, checklist);
    assignCarrier(activeWorkflowOrder.id, carrierInput, barcodeInput);

    showToast(
      `Status for ${activeWorkflowOrder.orderNumber} updated to ${workflowStatus.toUpperCase()}! Reader notified via email.`,
      'success',
      'send_and_archive'
    );
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.trackingNumber.toLowerCase().includes(q) ||
        o.items.some((i) => i.title.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (filterTab !== 'all' && o.status !== filterTab) {
      return false;
    }

    return true;
  });

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const packedCount = orders.filter((o) => o.status === 'processing').length;
  const transitCount = orders.filter((o) => o.status === 'shipped').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  const handleExportManifest = () => {
    showToast('Exporting Courier Intake Manifest CSV...', 'info', 'download');
    setTimeout(() => {
      showToast('Intake manifest generated successfully', 'success', 'download_done');
    }, 1000);
  };

  const handlePrintLabels = () => {
    showToast(`Printing thermal courier labels for ${selectedOrderIds.length} orders...`, 'info', 'print');
  };

  const handleBatchDispatch = () => {
    selectedOrderIds.forEach((id) => {
      updateOrderStatus(id, 'shipped', 'Shipped');
    });
    showToast(`Dispatched ${selectedOrderIds.length} orders with courier!`, 'success', 'local_shipping');
  };

  return (
    <div className="flex flex-col w-full pb-20 max-w-4xl mx-auto px-3 sm:px-6">
      {/* 1. Header & Manifest Shortcuts */}
      <div className="py-2.5 flex items-center justify-between border-b border-[#dfe2ec]/60 mb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="w-10 h-10 -ml-1 flex items-center justify-center text-[#57423b] hover:text-[#9f3c16] rounded-lg transition-colors"
            aria-label="Back to Dashboard"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <span className="font-title-md text-sm sm:text-base text-[#181c23] leading-tight font-semibold">
              Order Fulfillment
            </span>
            <span className="font-label-sm text-[10px] text-[#8a726a] uppercase tracking-wider leading-none">
              Admin Logistics
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportManifest}
            className="h-8 px-2.5 rounded-lg bg-white text-[#181c23] hover:bg-[#ebeef7] border border-[#dfe2ec] font-label-md text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[15px] text-[#9f3c16]">download</span>
            <span>Manifest</span>
          </button>
          <button
            type="button"
            onClick={handlePrintLabels}
            className="h-8 px-3 rounded-lg bg-[#9f3c16] hover:bg-[#bf542c] text-white font-label-md text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">print</span>
            <span>Print Labels</span>
          </button>
        </div>
      </div>

      {/* 2. Top Operational Banner & 3-Column KPI Cards */}
      <section className="bg-[#f1f3fd] rounded-xl p-4 shadow-xs border border-[#dfe2ec] mb-3">
        <div className="mb-3">
          <h1 className="font-headline-lg-mobile sm:font-headline-md text-xl sm:text-2xl text-[#181c23]">
            Fulfillment Queue
          </h1>
          <p className="font-body-sm text-xs text-[#57423b] mt-0.5">
            Process, pack, and dispatch reader orders across courier routes.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white p-3 rounded-xl shadow-xs border border-[#dfe2ec] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[10px] text-[#8a726a] uppercase tracking-wider font-bold">
                Pending
              </span>
              <span className="w-2 h-2 rounded-full bg-[#fe932c]"></span>
            </div>
            <div className="mt-2">
              <div className="font-headline-sm text-lg sm:text-xl font-bold text-[#9f3c16] leading-none">
                {pendingCount}
              </div>
              <div className="font-label-sm text-[10px] text-[#904d00] mt-1 font-semibold truncate">
                Priority dispatch
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl shadow-xs border border-[#dfe2ec] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[10px] text-[#8a726a] uppercase tracking-wider font-bold">
                In Transit
              </span>
              <span className="w-2 h-2 rounded-full bg-[#0051d5]"></span>
            </div>
            <div className="mt-2">
              <div className="font-headline-sm text-lg sm:text-xl font-bold text-[#181c23] leading-none">
                {transitCount}
              </div>
              <div className="font-label-sm text-[10px] text-[#0051d5] mt-1 font-semibold truncate">
                On schedule
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl shadow-xs border border-[#dfe2ec] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[10px] text-[#8a726a] uppercase tracking-wider font-bold">
                Fulfilled
              </span>
              <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
            </div>
            <div className="mt-2">
              <div className="font-headline-sm text-lg sm:text-xl font-bold text-[#181c23] leading-none">
                {deliveredCount}
              </div>
              <div className="font-label-sm text-[10px] text-[#57423b] mt-1 font-semibold truncate">
                Completed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Search & Status Tabs */}
      <section className="space-y-2 mb-3">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8a726a] text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search Order ID (#BN-...), customer, or tracking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-8 rounded-xl bg-white text-[#181c23] font-body-sm text-xs placeholder:text-[#8a726a] focus:outline-none focus:ring-1 focus:ring-[#9f3c16] border border-[#dfe2ec] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`h-8 px-3 rounded-full font-label-sm text-xs flex items-center gap-1 transition-all ${
              filterTab === 'all'
                ? 'bg-[#9f3c16] text-white shadow-xs font-semibold'
                : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
            }`}
          >
            <span>All</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">{orders.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('pending')}
            className={`h-8 px-3 rounded-full font-label-sm text-xs flex items-center gap-1 transition-all ${
              filterTab === 'pending'
                ? 'bg-[#9f3c16] text-white shadow-xs font-semibold'
                : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
            }`}
          >
            <span>Pending</span>
            <span className="bg-[#ffdcc3] text-[#2f1500] px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {pendingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('processing')}
            className={`h-8 px-3 rounded-full font-label-sm text-xs flex items-center gap-1 transition-all ${
              filterTab === 'processing'
                ? 'bg-[#9f3c16] text-white shadow-xs font-semibold'
                : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
            }`}
          >
            <span>Packed</span>
            <span className="bg-[#dfe2ec] text-[#181c23] px-1.5 py-0.2 rounded-full text-[10px]">
              {packedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('shipped')}
            className={`h-8 px-3 rounded-full font-label-sm text-xs flex items-center gap-1 transition-all ${
              filterTab === 'shipped'
                ? 'bg-[#9f3c16] text-white shadow-xs font-semibold'
                : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
            }`}
          >
            <span>In Transit</span>
            <span className="bg-[#dfe2ec] text-[#181c23] px-1.5 py-0.2 rounded-full text-[10px]">
              {transitCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('delivered')}
            className={`h-8 px-3 rounded-full font-label-sm text-xs flex items-center gap-1 transition-all ${
              filterTab === 'delivered'
                ? 'bg-[#9f3c16] text-white shadow-xs font-semibold'
                : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
            }`}
          >
            <span>Delivered</span>
            <span className="bg-[#dfe2ec] text-[#181c23] px-1.5 py-0.2 rounded-full text-[10px]">
              {deliveredCount}
            </span>
          </button>
        </div>
      </section>

      {/* 4. Batch Operations Bar */}
      <section className="bg-[#2d3138] text-white p-2.5 rounded-xl shadow-xs flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedOrderIds.length > 0}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedOrderIds(orders.map((o) => o.id));
              } else {
                setSelectedOrderIds([]);
              }
            }}
            className="w-4 h-4 rounded accent-[#9f3c16] cursor-pointer"
          />
          <span className="font-label-md text-xs font-semibold">
            {selectedOrderIds.length} orders selected
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => showToast('Pick list dispatched to shelf printer', 'success', 'checklist')}
            className="bg-[#9f3c16] hover:bg-[#bf542c] text-white px-2.5 py-1 rounded-lg font-label-sm text-xs transition-colors flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-[14px]">checklist</span>
            <span>Pick Lists</span>
          </button>
          <button
            type="button"
            onClick={handleBatchDispatch}
            className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg font-label-sm text-xs transition-colors flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-[14px]">send</span>
            <span>Dispatch</span>
          </button>
        </div>
      </section>

      {/* 5. Order Fulfillment Queue Cards */}
      <section className="space-y-3 mb-6">
        {filteredOrders.map((order) => {
          const isSelected = selectedOrderIds.includes(order.id);

          return (
            <article
              key={order.id}
              className="bg-white rounded-xl p-4 shadow-xs border border-[#dfe2ec] flex flex-col gap-3 transition-all hover:shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrderIds((prev) => [...prev, order.id]);
                      } else {
                        setSelectedOrderIds((prev) => prev.filter((id) => id !== order.id));
                      }
                    }}
                    className="mt-1 w-4 h-4 accent-[#9f3c16] rounded cursor-pointer"
                  />
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-title-md text-sm font-bold text-[#181c23]">
                        {order.orderNumber}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#904d00]"></span>
                      <span className="font-body-sm text-xs text-[#57423b]">{order.placedTime}</span>
                    </div>
                    <span className="font-label-sm text-[10px] text-[#904d00] font-semibold uppercase tracking-wider">
                      {order.shippingMethodLabel}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-semibold whitespace-nowrap shadow-xs flex items-center gap-1 ${
                    order.status === 'pending'
                      ? 'bg-[#ffdcc3] text-[#2f1500]'
                      : order.status === 'processing'
                      ? 'bg-[#ebeef7] text-[#181c23]'
                      : order.status === 'shipped'
                      ? 'bg-[#dbe1ff] text-[#00174b]'
                      : 'bg-[#dcfce7] text-[#15803d]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  <span>{order.statusLabel}</span>
                </span>
              </div>

              {/* Customer Dossier */}
              <div className="bg-[#f1f3fd] p-2.5 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#ffdbcf] flex items-center justify-center text-[#822801] font-title-md text-xs font-bold shrink-0">
                    {order.customerName.charAt(0)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-title-md text-xs font-semibold text-[#181c23] truncate">
                      {order.customerName}
                    </span>
                    <span className="font-body-sm text-[11px] text-[#57423b] truncate">
                      {order.customerEmail} • {order.customerCity}, {order.customerState}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[#8a726a]">{order.trackingNumber}</span>
              </div>

              {/* Items Allocation */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[#8a726a] font-label-sm text-[10px] uppercase tracking-wider px-1">
                  <span>Shelf Allocation & Volume</span>
                  <span>Bin / Qty</span>
                </div>

                {order.items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 bg-[#f9f9ff] p-2 rounded-lg border border-[#dfe2ec]/50">
                    <img
                      src={it.coverImage}
                      alt={it.title}
                      referrerPolicy="no-referrer"
                      className="w-9 h-12 object-cover rounded shadow-xs shrink-0"
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-headline-sm text-xs font-semibold text-[#181c23] truncate">
                        {it.title}
                      </span>
                      <span className="font-body-sm text-[10px] text-[#57423b] truncate">
                        {it.format}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="bg-[#ebeef7] text-[#181c23] font-mono text-[9px] px-1 py-0.2 rounded font-bold">
                          {it.shelfLocation}
                        </span>
                        <span className="text-[10px] text-[#8a726a] font-mono">ISBN {it.isbn}</span>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-[#9f3c16] shrink-0 px-1">×{it.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Price & Action Tray */}
              <div className="flex items-center justify-between pt-1 border-t border-[#dfe2ec]/60 text-xs">
                <div className="flex items-center gap-1 text-[#57423b]">
                  <span className="material-symbols-outlined text-[15px] text-[#904d00]">verified</span>
                  <span>{order.carrier}</span>
                </div>
                <div className="font-bold text-sm text-[#181c23]">${order.total.toFixed(2)}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => showToast(`Packing slip generated for ${order.orderNumber}`, 'info', 'description')}
                  className="py-2 px-3 rounded-lg bg-[#ebeef7] hover:bg-[#dfe2ec] text-[#181c23] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">description</span>
                  <span>Packing Slip</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenWorkflow(order)}
                  className="py-2 px-3 rounded-lg bg-[#9f3c16] hover:bg-[#bf542c] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">package_2</span>
                  <span>Pack & Ship</span>
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {/* 6. Interactive Fulfillment Workflow Drawer */}
      {activeWorkflowOrder && (
        <section
          id="fulfillment-drawer-card"
          className="bg-white rounded-2xl p-5 shadow-lg border border-[#dec0b7]/50 space-y-3 mb-6 animate-fade-in"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#dfe2ec]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#ffdbcf] flex items-center justify-center text-[#9f3c16]">
                <span className="material-symbols-outlined text-[17px]">verified</span>
              </div>
              <div>
                <h2 className="font-title-lg text-sm sm:text-base font-semibold text-[#181c23]">
                  Fulfillment Workflow
                </h2>
                <span className="font-label-sm text-[11px] text-[#9f3c16] font-mono tracking-wide">
                  Active: {activeWorkflowOrder.orderNumber} ({activeWorkflowOrder.customerName})
                </span>
              </div>
            </div>
            <span className="bg-[#ffdcc3] text-[#2f1500] px-2 py-0.5 rounded font-label-sm text-[10px] font-bold">
              Active Run
            </span>
          </div>

          {/* Logistics Milestone Step Selector */}
          <div className="space-y-1.5">
            <span className="font-label-sm text-[10px] uppercase tracking-wider text-[#8a726a] font-bold">
              Logistics Milestone
            </span>
            <div className="grid grid-cols-4 gap-1 p-1 bg-[#f1f3fd] rounded-xl text-center">
              {[
                { st: 'pending', step: 'Placed', label: 'Pending' },
                { st: 'processing', step: 'Bound', label: 'Packing' },
                { st: 'shipped', step: 'Shipped', label: 'Shipped' },
                { st: 'delivered', step: 'Delivered', label: 'Delivered' },
              ].map((m) => (
                <button
                  key={m.st}
                  type="button"
                  onClick={() => {
                    setWorkflowStatus(m.st as OrderStatus);
                    setWorkflowStep(m.step as OrderStep);
                  }}
                  className={`py-1.5 px-1 rounded-lg font-label-sm text-xs font-semibold transition-all ${
                    workflowStatus === m.st
                      ? 'bg-[#9f3c16] text-white shadow-xs font-bold'
                      : 'text-[#57423b] hover:text-[#181c23]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Carrier & Barcode Inputs */}
          <div className="space-y-2 pt-1">
            <div>
              <label className="font-label-sm text-[10px] text-[#57423b] uppercase block mb-1">
                Assigned Carrier
              </label>
              <select
                value={carrierInput}
                onChange={(e) => setCarrierInput(e.target.value)}
                className="w-full h-10 px-3 bg-[#f1f3fd] rounded-lg text-xs text-[#181c23] border border-[#dfe2ec] focus:outline-none focus:bg-white"
              >
                <option>BookNest Curator Courier (Priority Hand-off)</option>
                <option>FedEx Express Courier</option>
                <option>USPS Media Mail Insured</option>
                <option>UPS Carbon Neutral Ground</option>
              </select>
            </div>

            <div>
              <label className="font-label-sm text-[10px] text-[#57423b] uppercase block mb-1">
                Tracking ID / Package Barcode
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="flex-1 h-10 px-3 bg-[#f1f3fd] font-mono text-xs text-[#181c23] rounded-lg border border-[#dfe2ec] focus:outline-none focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newScan = `BKN-${Math.floor(10000 + Math.random() * 90000)}-EXP`;
                    setBarcodeInput(newScan);
                    showToast(`Scanned package barcode: ${newScan}`, 'info', 'photo_camera');
                  }}
                  className="h-10 px-3 rounded-lg bg-[#ebeef7] hover:bg-[#dfe2ec] text-[#181c23] font-label-md text-xs font-semibold flex items-center gap-1 shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#9f3c16]">photo_camera</span>
                  <span>Scan</span>
                </button>
              </div>
            </div>
          </div>

          {/* Packaging Craft Checklist */}
          <div className="bg-[#f1f3fd] p-3.5 rounded-xl border border-[#dfe2ec] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[10px] uppercase tracking-wider text-[#8a726a] font-bold">
                Packaging Craft Checklist
              </span>
              <span className="font-label-sm text-[10px] text-[#9f3c16] font-bold">
                {Object.values(checklist).filter(Boolean).length} of 3 Checked
              </span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#181c23]">
              <input
                type="checkbox"
                checked={checklist.verifiedVolumes}
                onChange={(e) => setChecklist({ ...checklist, verifiedVolumes: e.target.checked })}
                className="w-4 h-4 accent-[#9f3c16] rounded"
              />
              <span>Verified volumes, deckle edges & correct editions</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#181c23]">
              <input
                type="checkbox"
                checked={checklist.enclosedVellum}
                onChange={(e) => setChecklist({ ...checklist, enclosedVellum: e.target.checked })}
                className="w-4 h-4 accent-[#9f3c16] rounded"
              />
              <span>Enclosed acid-free vellum wrap & letterpress bookmark</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#181c23]">
              <input
                type="checkbox"
                checked={checklist.affixedLabel}
                onChange={(e) => setChecklist({ ...checklist, affixedLabel: e.target.checked })}
                className="w-4 h-4 accent-[#9f3c16] rounded"
              />
              <span>Affixed thermal shipping label to exterior carton</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#dfe2ec]">
            <button
              type="button"
              onClick={() => setActiveWorkflowOrder(null)}
              className="flex-1 py-2.5 bg-[#ebeef7] hover:bg-[#dfe2ec] text-[#181c23] rounded-xl text-xs font-semibold transition-colors"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={handleConfirmFulfillment}
              className="flex-[2] py-2.5 bg-[#9f3c16] hover:bg-[#bf542c] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[17px]">send_and_archive</span>
              <span>Update & Notify Reader</span>
            </button>
          </div>
        </section>
      )}

      {/* 7. Database Telemetry Footer */}
      <footer className="pt-2 pb-4 space-y-2 text-center text-xs text-[#57423b]">
        <div className="flex items-center justify-center gap-2 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-[#904d00]"></span>
          <span>MongoDB collection: <strong className="font-mono text-[#181c23]">'orders'</strong></span>
          <span>•</span>
          <span>Synced 1m ago</span>
          <span>•</span>
          <span className="font-mono">v2.4 REST</span>
        </div>
      </footer>
    </div>
  );
};
