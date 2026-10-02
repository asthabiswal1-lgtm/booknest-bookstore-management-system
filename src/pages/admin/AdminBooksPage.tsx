import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBooks } from '../../context/BookContext';
import { useToast } from '../../context/ToastContext';
import { Book, BookFormat } from '../../types';

export const AdminBooksPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { books, addBook, updateBook, deleteBook, incrementStock, decrementStock, restockBook } = useBooks();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'instock' | 'lowstock' | 'outofstock'>('all');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedBooks, setSelectedBooks] = useState<string[]>(['book-1', 'book-3']);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isNewMode, setIsNewMode] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  // Form Fields for Add / Edit
  const [formTitle, setFormTitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formIsbn, setFormIsbn] = useState('');
  const [formGenre, setFormGenre] = useState('Contemporary Fiction');
  const [formPrice, setFormPrice] = useState(19.99);
  const [formCost, setFormCost] = useState(11.2);
  const [formStock, setFormStock] = useState(2);
  const [formFormat, setFormFormat] = useState<BookFormat>('Hardcover');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formSynopsis, setFormSynopsis] = useState('');

  // Handle open with ?action=new
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      handleOpenCreate();
    }
  }, [searchParams]);

  const handleOpenEdit = (book: Book) => {
    setIsNewMode(false);
    setEditingBook(book);
    setFormTitle(book.title);
    setFormAuthor(book.author);
    setFormIsbn(book.isbn);
    setFormGenre(book.genre);
    setFormPrice(book.price);
    setFormCost(book.cost);
    setFormStock(book.stock);
    setFormFormat(book.format);
    setFormCoverImage(book.coverImage);
    setFormSynopsis(book.synopsis);

    const formEl = document.getElementById('book-edit-form-card');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleOpenCreate = () => {
    setIsNewMode(true);
    setEditingBook(null);
    setFormTitle('');
    setFormAuthor('');
    setFormIsbn(`978-${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setFormGenre('Contemporary Fiction');
    setFormPrice(22.0);
    setFormCost(11.0);
    setFormStock(15);
    setFormFormat('Hardcover');
    setFormCoverImage(
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAHF7l3kGCbtPGNTzFZKCieZMIIGTVW1GU8ZAbkdh73wCMSrW-GVAnCw2Txo8rOoqkUiohW9etFUDfAft5Ll-dTyKga4hDobSpYbjmde5mgTE2LLHMQl_EhVTvzOVqSoHSKJWwkVoyTeMvwL_zMdxg1ob6mhfuKYHtc3amrKlrbYGwPZ-eQfnkBCj88f0qHPzyeUi4efaTizs5t6Bs208crK5XV5i-YU0r2LnbLU9RZIgjhJtitHxNFXg'
    );
    setFormSynopsis('');

    const formEl = document.getElementById('book-edit-form-card');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Please provide a title', 'warning');
      return;
    }

    if (isNewMode) {
      const created = addBook({
        title: formTitle.trim(),
        author: formAuthor.trim() || 'Unknown Author',
        isbn: formIsbn.trim(),
        genre: formGenre,
        price: Number(formPrice) || 19.99,
        cost: Number(formCost) || 10.0,
        stock: Number(formStock) || 0,
        format: formFormat,
        rating: 5.0,
        reviewsCount: 1,
        shelfLocation: 'Shelf A-01',
        coverImage: formCoverImage || books[0].coverImage,
        synopsis: formSynopsis || 'Curated literary volume from BookNest archives.',
        publicationYear: 2024,
        pages: 320,
        language: 'English',
        publisher: 'BookNest Archival Press',
      });
      showToast(`Created new volume: "${created.title}"`, 'success', 'library_add');
    } else if (editingBook) {
      updateBook(editingBook.id, {
        title: formTitle.trim(),
        author: formAuthor.trim(),
        isbn: formIsbn.trim(),
        genre: formGenre,
        price: Number(formPrice),
        cost: Number(formCost),
        stock: Number(formStock),
        format: formFormat,
        coverImage: formCoverImage,
        synopsis: formSynopsis,
      });
      showToast(`Updated "${formTitle}" in MongoDB collection`, 'success', 'save');
    }

    setEditingBook(null);
    setIsNewMode(false);
  };

  const handleDeleteConfirmed = () => {
    if (deleteConfirmationId) {
      const target = books.find((b) => b.id === deleteConfirmationId);
      deleteBook(deleteConfirmationId);
      showToast(`Deleted "${target?.title}" from catalog`, 'info', 'delete');
      setDeleteConfirmationId(null);
      if (editingBook?.id === deleteConfirmationId) {
        setEditingBook(null);
      }
    }
  };

  // Filtered books
  const filteredBooks = books.filter((b) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (filterTab === 'instock' && b.stock <= 0) return false;
    if (filterTab === 'lowstock' && (b.stock > 5 || b.stock <= 0)) return false;
    if (filterTab === 'outofstock' && b.stock > 0) return false;

    if (selectedGenre !== 'all' && !b.genre.toLowerCase().includes(selectedGenre.toLowerCase())) {
      return false;
    }

    return true;
  });

  const lowStockCount = books.filter((b) => b.stock <= 5 && b.stock > 0).length;
  const outOfStockCount = books.filter((b) => b.stock === 0).length;
  const inStockCount = books.filter((b) => b.stock > 0).length;

  return (
    <div className="flex flex-col w-full pb-20 max-w-4xl mx-auto px-3 sm:px-6">
      {/* 1. Header Bar with Back to Dashboard */}
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
              Book Inventory
            </span>
            <span className="font-label-sm text-[10px] text-[#8a726a] uppercase tracking-wider leading-none">
              Admin Management
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="h-9 px-3 rounded-lg bg-[#9f3c16] hover:bg-[#bf542c] text-white font-label-md text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[17px]">add</span>
            <span>+ Book</span>
          </button>
        </div>
      </div>

      {/* 2. Header Banner & Micro Stats Strip */}
      <section className="bg-[#f1f3fd] rounded-xl p-4 shadow-xs border border-[#dfe2ec] mb-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div>
            <span className="inline-flex items-center gap-1 text-[#9f3c16] font-label-sm text-xs uppercase tracking-wider font-bold mb-0.5">
              <span className="material-symbols-outlined text-[14px]">auto_stories</span>
              <span>Catalog Administration</span>
            </span>
            <h1 className="font-headline-lg-mobile sm:font-headline-md text-xl sm:text-2xl text-[#181c23]">
              Book Inventory
            </h1>
            <p className="font-body-sm text-xs text-[#57423b] mt-0.5">
              Manage titles, stock levels, pricing, and metadata
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => showToast('Connecting to ISBN / EDI metadata feed...', 'info', 'upload_file')}
              className="h-8 px-2.5 rounded-lg bg-white text-[#181c23] hover:bg-[#ebeef7] border border-[#dfe2ec] font-label-md text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              <span>Import</span>
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="h-8 px-3 rounded-lg bg-[#9f3c16] hover:bg-[#bf542c] text-white font-label-md text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add Book</span>
            </button>
          </div>
        </div>

        {/* Micro Stats Strip */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white p-2.5 rounded-lg shadow-xs border border-[#dfe2ec]">
            <p className="font-label-sm text-[10px] text-[#8a726a] uppercase font-bold">Catalog Size</p>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="font-title-lg text-sm sm:text-base text-[#181c23] font-bold">
                {books.length}
              </span>
              <span className="font-label-sm text-[10px] text-[#0051d5] font-semibold">+12 this wk</span>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-lg shadow-xs border border-[#dfe2ec]">
            <p className="font-label-sm text-[10px] text-[#ba1a1a] uppercase font-bold">Needs Attention</p>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="font-title-lg text-sm sm:text-base text-[#ba1a1a] font-bold">
                {lowStockCount + outOfStockCount}
              </span>
              <span className="font-label-sm text-[10px] text-[#ba1a1a] font-semibold">Critical</span>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-lg shadow-xs border border-[#dfe2ec]">
            <p className="font-label-sm text-[10px] text-[#8a726a] uppercase font-bold">Avg. Margin</p>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="font-title-lg text-sm sm:text-base text-[#181c23] font-bold">41.8%</span>
              <span className="font-label-sm text-[10px] text-[#904d00] font-semibold">Healthy</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Search & Filter Controls */}
      <section className="space-y-2 mb-3">
        {/* Search Bar */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8a726a] text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by title, author, or ISBN-13..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-8 rounded-xl bg-white text-[#181c23] font-body-sm text-xs placeholder:text-[#8a726a] focus:outline-none focus:ring-1 focus:ring-[#9f3c16] border border-[#dfe2ec] shadow-xs"
          />
          <button
            type="button"
            onClick={() => showToast('Barcode camera scanner ready', 'info', 'barcode_scanner')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a726a] hover:text-[#9f3c16]"
            title="Scan barcode"
          >
            <span className="material-symbols-outlined text-[18px]">barcode_scanner</span>
          </button>
        </div>

        {/* Filter Chips Rail */}
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
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">{books.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('instock')}
            className={`h-8 px-3 rounded-full font-label-sm text-xs flex items-center gap-1 transition-all ${
              filterTab === 'instock'
                ? 'bg-[#9f3c16] text-white shadow-xs font-semibold'
                : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
            }`}
          >
            <span>In Stock</span>
            <span className="bg-[#dfe2ec] text-[#181c23] px-1.5 py-0.2 rounded-full text-[10px]">
              {inStockCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('lowstock')}
            className={`h-8 px-3 rounded-full font-label-sm text-xs flex items-center gap-1 transition-all ${
              filterTab === 'lowstock'
                ? 'bg-[#9f3c16] text-white shadow-xs font-semibold'
                : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
            }`}
          >
            <span>Low Stock</span>
            <span className="bg-[#ffdad6] text-[#93000a] px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {lowStockCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('outofstock')}
            className={`h-8 px-3 rounded-full font-label-sm text-xs flex items-center gap-1 transition-all ${
              filterTab === 'outofstock'
                ? 'bg-[#9f3c16] text-white shadow-xs font-semibold'
                : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
            }`}
          >
            <span>Out of Stock</span>
            <span className="bg-[#dfe2ec] text-[#181c23] px-1.5 py-0.2 rounded-full text-[10px]">
              {outOfStockCount}
            </span>
          </button>
        </div>
      </section>

      {/* 4. Batch Operations Bar */}
      <section className="bg-[#e5e8f2] rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-xs border border-[#dfe2ec] mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <input
            type="checkbox"
            checked={selectedBooks.length > 0}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedBooks(books.map((b) => b.id));
              } else {
                setSelectedBooks([]);
              }
            }}
            className="w-4 h-4 rounded text-[#9f3c16] accent-[#9f3c16] cursor-pointer"
          />
          <span className="font-label-sm text-xs font-bold text-[#181c23]">
            {selectedBooks.length} titles
          </span>
          <span className="font-body-sm text-[11px] text-[#57423b] truncate">selected</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => showToast('Batch price update prompt queued', 'info')}
            className="h-7 px-2.5 rounded bg-white text-[#181c23] hover:bg-[#f1f3fd] font-label-sm text-xs flex items-center gap-1 shadow-xs border border-[#dfe2ec]"
          >
            <span className="material-symbols-outlined text-[14px] text-[#9f3c16]">price_change</span>
            <span>Price</span>
          </button>
          <button
            type="button"
            onClick={() => {
              selectedBooks.forEach((id) => restockBook(id, 10));
              showToast(`Restocked 10 copies for ${selectedBooks.length} titles!`, 'success');
            }}
            className="h-7 px-2.5 rounded bg-white text-[#181c23] hover:bg-[#f1f3fd] font-label-sm text-xs flex items-center gap-1 shadow-xs border border-[#dfe2ec]"
          >
            <span className="material-symbols-outlined text-[14px] text-[#0051d5]">local_shipping</span>
            <span>Restock</span>
          </button>
        </div>
      </section>

      {/* 5. Book Management List */}
      <section className="space-y-3 mb-6">
        {filteredBooks.map((book) => {
          const margin = Math.round(((book.price - book.cost) / book.price) * 100);
          const isSelected = selectedBooks.includes(book.id);

          return (
            <article
              key={book.id}
              className="bg-white rounded-xl p-3 shadow-xs border border-[#dfe2ec] flex flex-col gap-2.5 transition-all hover:shadow-sm"
            >
              <div className="flex gap-3">
                {/* Book Thumbnail */}
                <div className="relative shrink-0 w-16 h-24 rounded overflow-hidden bg-[#ebeef7] shadow-inner border border-[#dec0b7]/40">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1 left-1 bg-white/90 px-1 py-0.2 rounded text-[9px] font-label-sm text-[#181c23] uppercase font-bold">
                    {book.format.split(' ')[0]}
                  </span>
                </div>

                {/* Info Container */}
                <div className="flex flex-col min-w-0 flex-1 justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      {book.stock <= 2 && book.stock > 0 ? (
                        <span className="bg-[#ffdad6] text-[#93000a] font-label-sm text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wide inline-flex items-center gap-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] animate-pulse"></span>
                          {book.stock} copies left
                        </span>
                      ) : book.stock === 0 ? (
                        <span className="bg-[#ffdad6] text-[#93000a] font-label-sm text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wide">
                          0 (Out of Stock)
                        </span>
                      ) : (
                        <span className="bg-[#ebeef7] text-[#181c23] font-label-sm text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wide">
                          {book.stock} in stock
                        </span>
                      )}
                      <span className="font-label-sm text-[10px] text-[#8a726a] font-mono">
                        ISBN {book.isbn}
                      </span>
                    </div>

                    <h2 className="font-headline-sm text-sm sm:text-base text-[#181c23] font-semibold leading-tight mt-1 line-clamp-1">
                      {book.title}
                    </h2>
                    <p className="font-body-sm text-xs text-[#57423b] truncate">
                      {book.author} • <span className="text-[#181c23]">{book.genre}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-title-md text-sm sm:text-base font-bold text-[#9f3c16]">
                        ${book.price.toFixed(2)}
                      </span>
                      <span className="font-body-sm text-[11px] text-[#8a726a]">
                        Cost: ${book.cost.toFixed(2)}
                      </span>
                      <span className="font-label-sm text-[11px] text-[#904d00] font-semibold">
                        {margin}% Margin
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Action Toolbar */}
              <div className="flex items-center justify-between pt-1 bg-[#f1f3fd] -mx-3 -mb-3 px-3 py-2 rounded-b-xl border-t border-[#dfe2ec]">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => decrementStock(book.id, 1)}
                    className="w-7 h-7 rounded bg-[#dfe2ec] text-[#181c23] font-title-md flex items-center justify-center hover:bg-[#d7dae3] transition-colors active:scale-95"
                    aria-label="Decrease stock"
                  >
                    -
                  </button>
                  <span className="font-label-md text-xs text-[#181c23] px-1.5 min-w-[20px] text-center font-bold">
                    {book.stock}
                  </span>
                  <button
                    type="button"
                    onClick={() => incrementStock(book.id, 1)}
                    className="w-7 h-7 rounded bg-[#dfe2ec] text-[#181c23] font-title-md flex items-center justify-center hover:bg-[#d7dae3] transition-colors active:scale-95"
                    aria-label="Increase stock"
                  >
                    +
                  </button>
                  <span className="font-body-sm text-[11px] text-[#57423b] ml-1">in stock</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(book)}
                    className="h-7 px-2.5 rounded bg-[#dfe2ec] hover:bg-[#d7dae3] text-[#181c23] font-label-sm text-xs flex items-center gap-1 transition-colors font-semibold"
                  >
                    <span className="material-symbols-outlined text-[15px] text-[#9f3c16]">edit</span>
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmationId(book.id)}
                    className="w-7 h-7 rounded bg-[#ffdad6]/60 text-[#ba1a1a] hover:bg-[#ffdad6] flex items-center justify-center transition-colors"
                    title="Delete book"
                    aria-label={`Delete ${book.title}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>

              {/* Inline Delete Confirmation Safeguard */}
              {deleteConfirmationId === book.id && (
                <div className="bg-[#ffdad6] text-[#93000a] p-3 rounded-lg space-y-2 mt-2 border border-[#ba1a1a]/30 animate-fade-in">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#ba1a1a] text-[20px] shrink-0 mt-0.5">
                      warning
                    </span>
                    <div className="text-xs leading-tight font-body-sm">
                      <span className="font-bold">Are you sure you want to delete "{book.title}"?</span>
                      <p className="mt-0.5 text-[#93000a]/90">
                        This will cascade to MongoDB references, active inventory records, and public catalog routes.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmationId(null)}
                      className="h-7 px-2.5 rounded bg-white text-[#181c23] font-label-sm text-xs font-semibold"
                    >
                      Keep Title
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteConfirmed}
                      className="h-7 px-3 rounded bg-[#ba1a1a] text-white font-label-sm text-xs font-bold shadow-xs hover:bg-[#93000a]"
                    >
                      Yes, Cascade Delete
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* 6. Interactive Quick Edit / Add Book Form Card */}
      <section
        id="book-edit-form-card"
        className="bg-white rounded-2xl p-5 shadow-md border border-[#dec0b7]/50 space-y-3 mb-6"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#dfe2ec]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#ffdbcf] flex items-center justify-center text-[#9f3c16]">
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
            </span>
            <div>
              <h3 className="font-title-lg text-sm sm:text-base text-[#181c23] font-semibold leading-tight">
                {isNewMode ? 'Add New Catalog Volume' : `Quick Edit: ${editingBook?.title || 'Title'}`}
              </h3>
              <p className="font-body-sm text-[11px] text-[#57423b] font-mono">
                MongoDB _id: {editingBook?.id ? `65e3ab9f82d1c01${editingBook.id}` : 'Draft New Document'}
              </p>
            </div>
          </div>
          {(editingBook || isNewMode) && (
            <button
              type="button"
              onClick={() => {
                setEditingBook(null);
                setIsNewMode(false);
              }}
              className="text-[#8a726a] hover:text-[#181c23] p-1"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSaveForm} className="space-y-3 pt-1">
          <div>
            <label className="font-label-sm text-[#57423b] text-[10px] uppercase block mb-1">Book Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. The Shadow of the Wind"
              className="w-full h-10 px-3 rounded-lg bg-[#f1f3fd] text-xs text-[#181c23] border border-[#dfe2ec] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#9f3c16]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-label-sm text-[#57423b] text-[10px] uppercase block mb-1">Author</label>
              <input
                type="text"
                value={formAuthor}
                onChange={(e) => setFormAuthor(e.target.value)}
                placeholder="Author name"
                className="w-full h-10 px-3 rounded-lg bg-[#f1f3fd] text-xs text-[#181c23] border border-[#dfe2ec] focus:outline-none focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="font-label-sm text-[#57423b] text-[10px] uppercase block mb-1">ISBN-13</label>
              <input
                type="text"
                value={formIsbn}
                onChange={(e) => setFormIsbn(e.target.value)}
                placeholder="978-..."
                className="w-full h-10 px-3 rounded-lg bg-[#f1f3fd] text-xs text-[#181c23] font-mono border border-[#dfe2ec] focus:outline-none focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-label-sm text-[#57423b] text-[10px] uppercase block mb-1">Genre</label>
              <select
                value={formGenre}
                onChange={(e) => setFormGenre(e.target.value)}
                className="w-full h-10 px-2 rounded-lg bg-[#f1f3fd] text-xs text-[#181c23] border border-[#dfe2ec] focus:outline-none focus:bg-white"
              >
                <option>Contemporary Fiction</option>
                <option>Historical Fantasy</option>
                <option>Speculative Fiction</option>
                <option>Sci-Fi</option>
                <option>Non-Fiction / Philosophy</option>
                <option>Poetry & Art</option>
                <option>Essays</option>
              </select>
            </div>
            <div>
              <label className="font-label-sm text-[#57423b] text-[10px] uppercase block mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formPrice}
                onChange={(e) => setFormPrice(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg bg-[#f1f3fd] text-xs text-[#181c23] border border-[#dfe2ec] focus:outline-none focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="font-label-sm text-[#57423b] text-[10px] uppercase block mb-1">Stock Qty</label>
              <input
                type="number"
                value={formStock}
                onChange={(e) => setFormStock(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg bg-[#f1f3fd] text-xs text-[#181c23] border border-[#dfe2ec] focus:outline-none focus:bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-label-sm text-[#57423b] text-[10px] uppercase block mb-1">Cover Image URL</label>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded shrink-0 overflow-hidden bg-[#ebeef7] border border-[#dfe2ec]">
                <img
                  src={formCoverImage || books[0].coverImage}
                  alt="Thumbnail preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <input
                type="text"
                value={formCoverImage}
                onChange={(e) => setFormCoverImage(e.target.value)}
                placeholder="https://assets.booknest.press/covers/..."
                className="flex-1 h-10 px-3 rounded-lg bg-[#f1f3fd] text-[11px] font-mono text-[#181c23] border border-[#dfe2ec] focus:outline-none focus:bg-white"
              />
              <button
                type="button"
                onClick={() => showToast('Asset URL set to verified BookNest CDN link', 'info')}
                className="h-10 px-3 rounded-lg bg-[#ebeef7] hover:bg-[#dfe2ec] text-[#181c23] font-label-md text-xs font-semibold shrink-0"
              >
                Upload
              </button>
            </div>
          </div>

          <div>
            <label className="font-label-sm text-[#57423b] text-[10px] uppercase block mb-1">
              Rich Synopsis (Markdown Supported)
            </label>
            <textarea
              rows={3}
              value={formSynopsis}
              onChange={(e) => setFormSynopsis(e.target.value)}
              placeholder="Provide the bibliographic overview, reader resonance, and curated themes..."
              className="w-full p-2.5 rounded-lg bg-[#f1f3fd] text-xs text-[#181c23] border border-[#dfe2ec] focus:outline-none focus:bg-white resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#dfe2ec]">
            {editingBook && (
              <button
                type="button"
                onClick={() => setDeleteConfirmationId(editingBook.id)}
                className="h-9 px-3 rounded-lg bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white font-label-md text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                <span>Delete Title</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => {
                  setEditingBook(null);
                  setIsNewMode(false);
                }}
                className="h-9 px-3 rounded-lg bg-[#ebeef7] hover:bg-[#dfe2ec] text-[#181c23] font-label-md text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-4 rounded-lg bg-[#9f3c16] hover:bg-[#bf542c] text-white font-label-md text-xs font-semibold shadow-xs flex items-center gap-1 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>{isNewMode ? 'Create Document' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* 7. Pagination and Database Sync Footer */}
      <footer className="pt-2 pb-4 space-y-3">
        <div className="flex items-center justify-between px-1 text-xs text-[#57423b]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#904d00] animate-ping"></span>
            <span className="font-mono text-[10px]">Database sync: 3 mins ago</span>
            <span>•</span>
            <span className="font-mono text-[10px]">collection: 'books'</span>
          </div>

          <div className="flex items-center gap-1 text-[#9f3c16] font-semibold text-xs">
            <span className="material-symbols-outlined text-[15px]">refresh</span>
            <button
              type="button"
              onClick={() => showToast('Force sync: MongoDB cluster cache updated', 'success')}
              className="hover:underline"
            >
              Force Sync
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
