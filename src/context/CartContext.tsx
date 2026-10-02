import React, { createContext, useContext, useEffect, useState } from 'react';
import { INITIAL_BOOKS, VALID_PROMO_CODES } from '../data/mockData';
import { Book, BookFormat, CartItem, PromoCode } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (book: Book, quantity?: number, format?: BookFormat) => void;
  removeFromCart: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  incrementQuantity: (bookId: string) => void;
  decrementQuantity: (bookId: string) => void;
  clearCart: () => void;
  restoreSampleCart: () => void;
  promoCode: PromoCode | null;
  promoInput: string;
  setPromoInput: (val: string) => void;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingCost: number;
  total: number;
  totalItemCount: number;
  freeShippingQualified: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getDefaultSampleCart = (): CartItem[] => {
  const b1 = INITIAL_BOOKS[0]; // Tomorrow
  const b2 = INITIAL_BOOKS[1]; // Babel
  const b3 = INITIAL_BOOKS[2]; // Midnight Library

  return [
    {
      bookId: b1.id,
      book: b1,
      quantity: 1,
      selectedFormat: 'Hardcover',
      price: 19.99,
    },
    {
      bookId: b2.id,
      book: b2,
      quantity: 2,
      selectedFormat: 'Paperback',
      price: 21.5,
    },
    {
      bookId: b3.id,
      book: b3,
      quantity: 1,
      selectedFormat: 'Hardcover',
      price: 18.99,
    },
  ];
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('booknest_cart');
      return stored ? JSON.parse(stored) : getDefaultSampleCart();
    } catch {
      return getDefaultSampleCart();
    }
  });

  const [promoCode, setPromoCode] = useState<PromoCode | null>(() => {
    try {
      const stored = localStorage.getItem('booknest_promo');
      return stored ? JSON.parse(stored) : VALID_PROMO_CODES[0]; // NEST15 by default like in mockup!
    } catch {
      return VALID_PROMO_CODES[0];
    }
  });

  const [promoInput, setPromoInput] = useState<string>('NEST15');

  useEffect(() => {
    try {
      localStorage.setItem('booknest_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      if (promoCode) {
        localStorage.setItem('booknest_promo', JSON.stringify(promoCode));
      } else {
        localStorage.removeItem('booknest_promo');
      }
    } catch (e) {
      console.error('Failed to save promo to localStorage', e);
    }
  }, [promoCode]);

  const addToCart = (book: Book, quantity: number = 1, format?: BookFormat) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.bookId === book.id);
      if (existing) {
        return prev.map((item) =>
          item.bookId === book.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          bookId: book.id,
          book,
          quantity,
          selectedFormat: format || book.format,
          price: book.price,
        },
      ];
    });
  };

  const removeFromCart = (bookId: string) => {
    setItems((prev) => prev.filter((item) => item.bookId !== bookId));
  };

  const updateQuantity = (bookId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.bookId === bookId ? { ...item, quantity } : item))
    );
  };

  const incrementQuantity = (bookId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.bookId === bookId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementQuantity = (bookId: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.bookId === bookId);
      if (target && target.quantity > 1) {
        return prev.map((item) =>
          item.bookId === bookId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter((item) => item.bookId !== bookId);
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const restoreSampleCart = () => {
    const sample = getDefaultSampleCart();
    setItems(sample);
    setPromoCode(VALID_PROMO_CODES[0]);
    setPromoInput('NEST15');
  };

  const applyPromoCode = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const found = VALID_PROMO_CODES.find((p) => p.code === cleanCode);
    if (found) {
      setPromoCode(found);
      return { success: true, message: `Promo code ${found.code} applied (${found.discountPercent}% off)!` };
    }
    return { success: false, message: 'Invalid promo voucher code. Try "NEST15" for 15% off.' };
  };

  const removePromoCode = () => {
    setPromoCode(null);
    setPromoInput('');
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const discountAmount = promoCode ? (subtotal * promoCode.discountPercent) / 100 : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = subtotal > 0 ? taxableAmount * 0.08 : 0;
  const shippingCost = 0; // Free express shipping qualified over $35
  const freeShippingQualified = subtotal >= 35 || items.length > 0;
  const total = subtotal > 0 ? taxableAmount + taxAmount + shippingCost : 0;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
