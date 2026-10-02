export type UserRole = 'customer' | 'curator' | 'admin';

export type MembershipTier =
  | 'Standard Reader'
  | 'Book Club Member'
  | "Curator's Circle VIP"
  | 'Archive Fellow'
  | 'Poetry Fellowship Tier'
  | 'First Edition Collector';

export type AccountStatus = 'active' | 'suspended' | 'pending';

export interface User {
  id: string;
  userCode: string; // e.g. #USR-8902
  name: string;
  email: string;
  role: UserRole;
  roleTitle?: string;
  membershipTier: MembershipTier;
  status: AccountStatus;
  city: string;
  state: string;
  ordersCount: number;
  totalSpent: number;
  libraryCount: number;
  lastOrderId?: string;
  lastOrderDate?: string;
  shippingAddress: string;
  phone?: string;
  avatarUrl?: string;
  curatorReviewsCount?: number;
  lastActive?: string;
  subscriptions: {
    weeklyLetters: boolean;
    smsAlerts: boolean;
    auctionNotifications: boolean;
  };
}

export type BookFormat =
  | 'Hardcover'
  | 'Paperback'
  | 'Collector Edition'
  | 'Signed Edition'
  | 'Deckle-Edge'
  | 'Clothbound Illustrated Monograph';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  price: number;
  originalPrice?: number;
  cost: number;
  stock: number;
  format: BookFormat;
  rating: number;
  reviewsCount: number;
  badge?: 'Staff Pick' | 'Bestseller' | 'Sale' | 'New Release' | 'Signed' | 'Speculative' | 'Historical' | 'Essays' | 'Sci-Fi' | 'Contemporary';
  shelfLocation: string;
  coverImage: string;
  synopsis: string;
  publicationYear: number;
  pages: number;
  language: string;
  publisher?: string;
}

export interface CartItem {
  bookId: string;
  book: Book;
  quantity: number;
  selectedFormat: BookFormat;
  price: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type OrderStep = 'Placed' | 'Bound' | 'Shipped' | 'Delivered';

export interface OrderItem {
  bookId: string;
  title: string;
  author: string;
  format: string;
  price: number;
  quantity: number;
  coverImage: string;
  shelfLocation: string;
  isbn?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. #BN-89241
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerCity: string;
  customerState: string;
  customerAddress: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  shippingMethod: 'standard' | 'express';
  shippingMethodLabel: string;
  tax: number;
  discount: number;
  discountCode?: string;
  total: number;
  status: OrderStatus;
  statusLabel: string;
  statusStep: OrderStep;
  placedTime: string;
  placedDate: string;
  estimatedDelivery: string;
  carrier: string;
  trackingNumber: string;
  courierNotes?: string;
  deliveryNotes?: string;
  paymentMethod: string;
  paymentCardLast4?: string;
  paymentCardBrand?: string;
  timeline: {
    placed: string;
    bound?: string;
    shipped?: string;
    delivered?: string;
  };
  packagingChecklist?: {
    verifiedVolumes: boolean;
    enclosedVellum: boolean;
    affixedLabel: boolean;
  };
}

export interface PromoCode {
  code: string;
  discountPercent: number;
  description: string;
  minSubtotal?: number;
}
