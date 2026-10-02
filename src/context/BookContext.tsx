import React, { createContext, useContext, useEffect, useState } from 'react';
import { INITIAL_BOOKS } from '../data/mockData';
import { Book } from '../types';

interface BookContextType {
  books: Book[];
  getBook: (id: string) => Book | undefined;
  addBook: (book: Omit<Book, 'id'>) => Book;
  updateBook: (id: string, updates: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  updateStock: (id: string, newStock: number) => void;
  incrementStock: (id: string, delta?: number) => void;
  decrementStock: (id: string, delta?: number) => void;
  restockBook: (id: string, amount: number) => void;
  resetDefaultCatalog: () => void;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const stored = localStorage.getItem('booknest_catalog');
      return stored ? JSON.parse(stored) : INITIAL_BOOKS;
    } catch {
      return INITIAL_BOOKS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('booknest_catalog', JSON.stringify(books));
    } catch (e) {
      console.error('Failed to save catalog to localStorage', e);
    }
  }, [books]);

  const getBook = (id: string) => {
    return books.find((b) => b.id === id);
  };

  const addBook = (bookData: Omit<Book, 'id'>): Book => {
    const id = `book-${Date.now()}`;
    const newBook: Book = {
      ...bookData,
      id,
    };
    setBooks((prev) => [newBook, ...prev]);
    return newBook;
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          return { ...b, ...updates };
        }
        return b;
      })
    );
  };

  const deleteBook = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const updateStock = (id: string, newStock: number) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, stock: Math.max(0, newStock) } : b))
    );
  };

  const incrementStock = (id: string, delta: number = 1) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, stock: b.stock + delta } : b))
    );
  };

  const decrementStock = (id: string, delta: number = 1) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, stock: Math.max(0, b.stock - delta) } : b))
    );
  };

  const restockBook = (id: string, amount: number) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, stock: b.stock + amount } : b))
    );
  };

  const resetDefaultCatalog = () => {
    setBooks(INITIAL_BOOKS);
  };

  return (
    <BookContext.Provider
      value={{
        books,
        getBook,
        addBook,
        updateBook,
        deleteBook,
        updateStock,
        incrementStock,
        decrementStock,
        restockBook,
        resetDefaultCatalog,
      }}
    >
      {children}
    </BookContext.Provider>
  );
};

export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
};
