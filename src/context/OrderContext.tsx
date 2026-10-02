import React, { createContext, useContext, useEffect, useState } from 'react';
import { INITIAL_ORDERS } from '../data/mockData';
import { Order, OrderStatus, OrderStep } from '../types';

interface CreateOrderParams {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerCity: string;
  customerState: string;
  customerAddress: string;
  customerPhone?: string;
  items: Order['items'];
  subtotal: number;
  shippingCost: number;
  shippingMethod: 'standard' | 'express';
  shippingMethodLabel: string;
  tax: number;
  discount: number;
  discountCode?: string;
  total: number;
  paymentMethod: string;
  paymentCardLast4?: string;
  paymentCardBrand?: string;
}

interface OrderContextType {
  orders: Order[];
  getOrder: (idOrNumber: string) => Order | undefined;
  createOrder: (params: CreateOrderParams) => Order;
  updateOrderStatus: (id: string, status: OrderStatus, step?: OrderStep, carrier?: string, trackingNumber?: string) => void;
  updatePackagingChecklist: (id: string, checklist: { verifiedVolumes: boolean; enclosedVellum: boolean; affixedLabel: boolean }) => void;
  assignCarrier: (id: string, carrier: string, trackingNumber: string) => void;
  deleteOrder: (id: string) => void;
  resetDefaultOrders: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem('booknest_orders');
      return stored ? JSON.parse(stored) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('booknest_orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage', e);
    }
  }, [orders]);

  const getOrder = (idOrNumber: string) => {
    return orders.find(
      (o) =>
        o.id === idOrNumber ||
        o.orderNumber.toLowerCase() === idOrNumber.toLowerCase() ||
        o.orderNumber.replace('#', '').toLowerCase() === idOrNumber.replace('#', '').toLowerCase()
    );
  };

  const createOrder = (params: CreateOrderParams): Order => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `#BN-${randomNum}`;
    const id = `order-${Date.now()}`;
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeFormatted = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const newOrder: Order = {
      id,
      orderNumber,
      customerId: params.customerId,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerCity: params.customerCity,
      customerState: params.customerState,
      customerAddress: params.customerAddress,
      customerPhone: params.customerPhone,
      items: params.items,
      subtotal: params.subtotal,
      shippingCost: params.shippingCost,
      shippingMethod: params.shippingMethod,
      shippingMethodLabel: params.shippingMethodLabel,
      tax: params.tax,
      discount: params.discount,
      discountCode: params.discountCode,
      total: params.total,
      status: 'pending',
      statusLabel: 'Awaiting Packing',
      statusStep: 'Placed',
      placedTime: timeFormatted,
      placedDate: dateFormatted,
      estimatedDelivery: 'In 2-3 business days',
      carrier: params.shippingMethod === 'express' ? 'BookNest Curator Express' : 'BookNest Courier',
      trackingNumber: `BKN-${params.customerState.toUpperCase() || 'NY'}-${randomNum}-EXP`,
      courierNotes: 'Curator Parcel • Wrapped in acid-free vellum with botanical wax seal',
      deliveryNotes: 'Standard dispatch with end-to-end tracked courier',
      paymentMethod: params.paymentMethod,
      paymentCardLast4: params.paymentCardLast4 || '4291',
      paymentCardBrand: params.paymentCardBrand || 'VISA',
      timeline: {
        placed: `${dateFormatted} ${timeFormatted}`,
      },
      packagingChecklist: {
        verifiedVolumes: true,
        enclosedVellum: true,
        affixedLabel: false,
      },
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (
    id: string,
    status: OrderStatus,
    step?: OrderStep,
    carrier?: string,
    trackingNumber?: string
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === id || order.orderNumber === id) {
          const nowStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
          const newTimeline = { ...order.timeline };
          const computedStep =
            step ||
            (status === 'pending'
              ? 'Placed'
              : status === 'processing'
              ? 'Bound'
              : status === 'shipped'
              ? 'Shipped'
              : status === 'delivered'
              ? 'Delivered'
              : order.statusStep);

          if (computedStep === 'Bound' && !newTimeline.bound) {
            newTimeline.bound = `Today ${nowStr}`;
          } else if (computedStep === 'Shipped' && !newTimeline.shipped) {
            newTimeline.shipped = `Today ${nowStr}`;
          } else if (computedStep === 'Delivered' && !newTimeline.delivered) {
            newTimeline.delivered = `Today ${nowStr}`;
          }

          const statusLabel =
            status === 'pending'
              ? 'Awaiting Packing'
              : status === 'processing'
              ? 'Packed & Ready'
              : status === 'shipped'
              ? 'Dispatched'
              : status === 'delivered'
              ? 'Delivered'
              : 'Cancelled';

          return {
            ...order,
            status,
            statusLabel,
            statusStep: computedStep,
            carrier: carrier || order.carrier,
            trackingNumber: trackingNumber || order.trackingNumber,
            timeline: newTimeline,
          };
        }
        return order;
      })
    );
  };

  const updatePackagingChecklist = (
    id: string,
    checklist: { verifiedVolumes: boolean; enclosedVellum: boolean; affixedLabel: boolean }
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === id || order.orderNumber === id) {
          return {
            ...order,
            packagingChecklist: checklist,
          };
        }
        return order;
      })
    );
  };

  const assignCarrier = (id: string, carrier: string, trackingNumber: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === id || order.orderNumber === id) {
          return {
            ...order,
            carrier,
            trackingNumber,
          };
        }
        return order;
      })
    );
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id && o.orderNumber !== id));
  };

  const resetDefaultOrders = () => {
    setOrders(INITIAL_ORDERS);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        getOrder,
        createOrder,
        updateOrderStatus,
        updatePackagingChecklist,
        assignCarrier,
        deleteOrder,
        resetDefaultOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
