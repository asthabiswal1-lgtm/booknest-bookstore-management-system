import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Book } from '../types';
import { QuickViewModal } from './QuickViewModal';

interface BookCardProps {
  book: Book;
  compact?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({ book, compact = false }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (book.stock <= 0) {
      showToast(`"${book.title}" is currently out of stock`, 'warning');
      return;
    }
    addToCart(book, 1);
    showToast(`Added "${book.title}" to cart`, 'success', 'shopping_bag');
  };

  return (
    <>
      <article
        onClick={() => setModalOpen(true)}
        className="group bg-[#ffffff] rounded-xl p-2.5 sm:p-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 border border-[#dfe2ec]/60 cursor-pointer"
      >
        <div className="flex flex-col">
          {/* Stylized Book Jacket Container */}
          <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-[#ebeef7] mb-2 sm:mb-2.5 shadow-inner flex items-center justify-center">
            <img
              src={book.coverImage}
              alt={book.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {book.badge && (
              <span className="absolute top-1.5 left-1.5 bg-[#9f3c16]/90 backdrop-blur-sm text-white font-label-sm text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold shadow">
                {book.badge}
              </span>
            )}
            {book.stock <= 0 && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                <span className="bg-red-700 text-white font-bold text-[10px] px-2 py-1 rounded shadow uppercase">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="bg-[#f1f3fd] text-[#57423b] font-label-sm text-[10px] px-2 py-0.5 rounded-md truncate max-w-[90px]">
              {book.genre}
            </span>
            <div className="flex items-center text-[#904d00] gap-0.5 shrink-0">
              <span className="material-symbols-outlined text-[14px] fill-1">star</span>
              <span className="font-label-sm text-[11px] font-bold">{book.rating.toFixed(1)}</span>
            </div>
          </div>

          <h3
            className="font-headline-sm text-sm sm:text-[15px] text-[#181c23] line-clamp-1 leading-tight mb-0.5"
            title={book.title}
          >
            {book.title}
          </h3>
          <p className="font-body-sm text-[11px] sm:text-xs text-[#57423b] truncate mb-1">
            {book.author}
          </p>

          {!compact && (
            <span className="font-mono text-[9px] text-[#8a726a] tracking-wider uppercase mb-2 block">
              {book.isbn}
            </span>
          )}
        </div>

        {/* Pricing, Status & Actions */}
        <div className="pt-1 flex flex-col gap-1.5 mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-title-md text-sm sm:text-base text-[#9f3c16] font-bold">
                ${book.price.toFixed(2)}
              </span>
              {book.originalPrice && book.originalPrice > book.price && (
                <span className="font-body-sm text-[10px] sm:text-[11px] text-[#8a726a] line-through">
                  ${book.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {book.stock <= 3 && book.stock > 0 ? (
              <span className="inline-flex items-center gap-1 font-label-sm text-[10px] text-[#B45309] bg-[#FFFBEB] px-1.5 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]"></span>
                {book.stock} left
              </span>
            ) : book.stock > 3 ? (
              <span className="inline-flex items-center gap-1 font-label-sm text-[10px] text-[#15803D] bg-[#F0FDF4] px-1.5 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
                {book.stock} left
              </span>
            ) : null}
          </div>

          <div className="grid grid-cols-4 gap-1.5 mt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(true);
              }}
              className="col-span-1 bg-[#ebeef7] hover:bg-[#dfe2ec] text-[#57423b] rounded-lg py-2 flex items-center justify-center active:scale-90 transition-transform"
              title="Quick view synopsis"
              aria-label="View book details"
            >
              <span className="material-symbols-outlined text-[17px]">visibility</span>
            </button>
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={book.stock <= 0}
              className="col-span-3 bg-[#9f3c16] hover:bg-[#bf542c] disabled:opacity-50 text-white font-label-md text-xs py-2 rounded-lg flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm font-semibold"
              title="Add to cart"
            >
              <span className="material-symbols-outlined text-[15px]">shopping_bag</span>
              <span>Add</span>
            </button>
          </div>
        </div>
      </article>

      <QuickViewModal book={book} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
