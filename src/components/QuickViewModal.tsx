import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Book, BookFormat } from '../types';

interface QuickViewModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ book, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedFormat, setSelectedFormat] = useState<BookFormat>(book?.format || 'Hardcover');
  const { addToCart } = useCart();
  const { showToast } = useToast();

  if (!isOpen || !book) return null;

  const handleAddToCart = () => {
    addToCart(book, quantity, selectedFormat);
    showToast(`Added ${quantity} × "${book.title}" (${selectedFormat}) to cart!`, 'success', 'shopping_bag');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#181c23]/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl z-10 border border-[#dec0b7]/40 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f1f3fd] hover:bg-[#ebeef7] flex items-center justify-center text-[#57423b] transition-colors"
          aria-label="Close details"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex flex-col sm:flex-row gap-5">
          {/* Left: Book Cover Showcase */}
          <div className="w-full sm:w-52 shrink-0 flex flex-col items-center">
            <div className="relative aspect-[2/3] w-44 sm:w-full rounded-xl overflow-hidden shadow-lg bg-[#ebeef7] border border-[#dec0b7]/50">
              <img
                src={book.coverImage}
                alt={book.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {book.badge && (
                <span className="absolute top-2 left-2 bg-[#9f3c16]/90 backdrop-blur-sm text-white font-label-sm text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold shadow">
                  {book.badge}
                </span>
              )}
            </div>

            <div className="mt-3 text-center">
              <span className="font-mono text-[11px] text-[#8a726a] tracking-wider block">
                ISBN {book.isbn}
              </span>
              <span className="text-[11px] text-[#57423b] block mt-0.5">
                Location: {book.shelfLocation}
              </span>
            </div>
          </div>

          {/* Right: Book Details & Actions */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="bg-[#f1f3fd] text-[#57423b] font-label-sm text-[10px] px-2 py-0.5 rounded-md">
                  {book.genre}
                </span>
                <span className="text-[#8a726a] text-xs">•</span>
                <div className="flex items-center text-[#904d00] gap-0.5 text-xs font-bold">
                  <span className="material-symbols-outlined text-[15px] fill-1">star</span>
                  <span>{book.rating.toFixed(1)}</span>
                  <span className="text-[#8a726a] font-normal">({book.reviewsCount} reviews)</span>
                </div>
              </div>

              <h2 className="font-headline-md text-xl sm:text-2xl text-[#181c23] leading-tight mb-1">
                {book.title}
              </h2>
              <p className="font-body-md text-sm text-[#57423b] mb-3">
                By <span className="text-[#181c23] font-medium">{book.author}</span> • {book.publisher} ({book.publicationYear})
              </p>

              {/* Price & Stock */}
              <div className="flex items-baseline gap-2.5 mb-3 p-2.5 rounded-xl bg-[#f1f3fd]">
                <span className="font-headline-sm text-2xl font-bold text-[#9f3c16]">
                  ${book.price.toFixed(2)}
                </span>
                {book.originalPrice && book.originalPrice > book.price && (
                  <span className="text-sm text-[#8a726a] line-through">
                    ${book.originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="ml-auto font-label-sm text-[11px] text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded-md font-semibold">
                  {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              {/* Format Selector */}
              <div className="mb-3">
                <label className="font-label-sm text-[#57423b] uppercase tracking-wider block mb-1.5">
                  Available Formats & Bindings
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['Hardcover', 'Paperback'] as BookFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setSelectedFormat(fmt)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                        selectedFormat === fmt
                          ? 'border-[#9f3c16] bg-[#ffdbcf]/30 text-[#9f3c16]'
                          : 'border-[#dfe2ec] bg-white text-[#57423b] hover:border-[#dec0b7]'
                      }`}
                    >
                      <span>{fmt}</span>
                      <span className="material-symbols-outlined text-[16px]">
                        {selectedFormat === fmt ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Synopsis */}
              <div className="mb-4">
                <label className="font-label-sm text-[#57423b] uppercase tracking-wider block mb-1">
                  Curator Synopsis
                </label>
                <p className="font-body-sm text-xs sm:text-sm text-[#57423b] leading-relaxed max-h-36 overflow-y-auto pr-1">
                  {book.synopsis}
                </p>
              </div>

              {/* Bibliographic Info Strip */}
              <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-[#f9f9ff] border border-[#dfe2ec] text-[11px] text-[#57423b] mb-4">
                <div>
                  <span className="block text-[#8a726a] uppercase text-[9px]">Pages</span>
                  <span className="font-semibold text-[#181c23]">{book.pages}</span>
                </div>
                <div>
                  <span className="block text-[#8a726a] uppercase text-[9px]">Language</span>
                  <span className="font-semibold text-[#181c23]">{book.language}</span>
                </div>
                <div>
                  <span className="block text-[#8a726a] uppercase text-[9px]">Binding</span>
                  <span className="font-semibold text-[#181c23]">{book.format}</span>
                </div>
              </div>
            </div>

            {/* Quantity Stepper & Add to Cart Button */}
            <div className="flex items-center gap-3 pt-2 border-t border-[#dfe2ec]">
              <div className="flex items-center bg-[#f1f3fd] rounded-xl p-1 shadow-sm border border-[#dfe2ec]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#181c23] hover:bg-white transition-colors"
                  aria-label="Decrease quantity"
                >
                  <span className="material-symbols-outlined text-[16px]">remove</span>
                </button>
                <span className="w-8 text-center font-bold text-sm text-[#181c23]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#181c23] hover:bg-white transition-colors"
                  aria-label="Increase quantity"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={book.stock <= 0}
                className="flex-1 h-11 bg-[#9f3c16] hover:bg-[#bf542c] disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                <span>Add to Literary Parcel • ${(book.price * quantity).toFixed(2)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
