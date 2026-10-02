import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookCard } from '../components/BookCard';
import { useBooks } from '../context/BookContext';
import { BookFormat } from '../types';

export const CatalogPage: React.FC = () => {
  const { books } = useBooks();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL query params
  const initialQuery = searchParams.get('q') || '';
  const initialGenre = searchParams.get('genre') || 'all';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [quickFilter, setQuickFilter] = useState<'all' | 'instock' | 'sale' | 'under20'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre !== 'all' ? initialGenre : 'all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [priceBracket, setPriceBracket] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('featured');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const genresList = [
    'Fiction',
    'Contemporary',
    'Historical Fantasy',
    'Speculative Fiction',
    'Sci-Fi',
    'Non-Fiction',
    'Essays',
    'Poetry',
    'Philosophy',
  ];

  // Filter & Search Logic
  const filteredBooks = useMemo(() => {
    return books
      .filter((b) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q) ||
            b.isbn.toLowerCase().includes(q) ||
            b.genre.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // Quick pills
        if (quickFilter === 'instock' && b.stock <= 0) return false;
        if (quickFilter === 'sale' && (!b.originalPrice || b.originalPrice <= b.price)) return false;
        if (quickFilter === 'under20' && b.price >= 20) return false;

        // Genre filter
        if (selectedGenre !== 'all') {
          if (!b.genre.toLowerCase().includes(selectedGenre.toLowerCase())) return false;
        }

        // Format filter
        if (selectedFormat !== 'all') {
          if (!b.format.toLowerCase().includes(selectedFormat.toLowerCase())) return false;
        }

        // Price bracket
        if (priceBracket === 'under15' && b.price >= 15) return false;
        if (priceBracket === '15to25' && (b.price < 15 || b.price > 25)) return false;
        if (priceBracket === '25to35' && (b.price < 25 || b.price > 35)) return false;
        if (priceBracket === 'above35' && b.price <= 35) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'price-asc') return a.price - b.price;
        if (sortOption === 'price-desc') return b.price - a.price;
        if (sortOption === 'rating') return b.rating - a.rating;
        if (sortOption === 'pub-date') return b.publicationYear - a.publicationYear;
        return 0; // featured default
      });
  }, [books, searchQuery, quickFilter, selectedGenre, selectedFormat, priceBracket, sortOption]);

  // Active filters count for badge
  const activeFiltersCount =
    (selectedGenre !== 'all' ? 1 : 0) +
    (selectedFormat !== 'all' ? 1 : 0) +
    (priceBracket !== 'all' ? 1 : 0);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / itemsPerPage));
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetAllFilters = () => {
    setSelectedGenre('all');
    setSelectedFormat('all');
    setPriceBracket('all');
    setQuickFilter('all');
    setSearchQuery('');
    setSearchParams({});
    setCurrentPage(1);
    setFilterModalOpen(false);
  };

  return (
    <div className="flex flex-col w-full pb-20">
      {/* 1. Sticky Query & Utility Bar */}
      <div className="sticky top-16 z-30 bg-[#f9f9ff]/95 backdrop-blur-md px-3 sm:px-6 py-2.5 shadow-xs border-b border-[#dec0b7]/30">
        <div className="max-w-5xl mx-auto flex flex-col gap-2.5">
          {/* Search Bar with instant feedback & clear button */}
          <div className="relative w-full">
            <div className="relative flex items-center bg-[#f1f3fd] rounded-xl px-3.5 py-2 focus-within:bg-white focus-within:shadow-sm focus-within:ring-1 focus-within:ring-[#9f3c16] transition-all border border-[#dfe2ec]">
              <span className="material-symbols-outlined text-[#8a726a] text-[20px] mr-2">search</span>
              <input
                type="text"
                placeholder="Search by Title, Author, or ISBN-13..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-transparent font-body-md text-xs sm:text-sm text-[#181c23] placeholder:text-[#8a726a] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[#57423b] hover:text-[#9f3c16] p-1"
                  aria-label="Clear search"
                >
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                </button>
              )}
            </div>
          </div>

          {/* Controls Row: Deep Filter Modal Trigger & Quick Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {/* Deep Filter Modal Trigger */}
            <button
              type="button"
              onClick={() => setFilterModalOpen(true)}
              className="shrink-0 flex items-center gap-1.5 bg-[#ffdbcf] text-[#390c00] hover:bg-[#ffdbcf]/80 px-3.5 py-1.5 rounded-full font-label-md text-xs active:scale-95 transition-all font-semibold shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-[#9f3c16] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Quick Pills */}
            <button
              type="button"
              onClick={() => {
                setQuickFilter('all');
                setCurrentPage(1);
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-full font-label-md text-xs transition-all active:scale-95 ${
                quickFilter === 'all'
                  ? 'bg-[#9f3c16] text-white shadow-xs font-semibold'
                  : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => {
                setQuickFilter('instock');
                setCurrentPage(1);
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-full font-label-md text-xs transition-all active:scale-95 ${
                quickFilter === 'instock'
                  ? 'bg-[#9f3c16] text-white shadow-xs font-semibold'
                  : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
              }`}
            >
              In Stock Only
            </button>
            <button
              type="button"
              onClick={() => {
                setQuickFilter('sale');
                setCurrentPage(1);
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-full font-label-md text-xs transition-all active:scale-95 ${
                quickFilter === 'sale'
                  ? 'bg-[#9f3c16] text-white shadow-xs font-semibold'
                  : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
              }`}
            >
              On Sale
            </button>
            <button
              type="button"
              onClick={() => {
                setQuickFilter('under20');
                setCurrentPage(1);
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-full font-label-md text-xs transition-all active:scale-95 ${
                quickFilter === 'under20'
                  ? 'bg-[#9f3c16] text-white shadow-xs font-semibold'
                  : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
              }`}
            >
              Under $20
            </button>
          </div>

          {/* Active Filter Strip & Sorting Bar */}
          <div className="flex items-center justify-between pt-0.5 text-xs text-[#57423b]">
            <div className="flex items-center gap-1.5 overflow-hidden flex-1">
              <span className="font-body-sm text-[11px] text-[#8a726a]">Active:</span>
              {selectedGenre !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-[#ebeef7] text-[#9f3c16] font-label-sm text-[11px] px-2 py-0.5 rounded-full">
                  {selectedGenre}
                  <button onClick={() => setSelectedGenre('all')} aria-label="Clear genre">
                    <span className="material-symbols-outlined text-[12px]">close</span>
                  </button>
                </span>
              )}
              {selectedFormat !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-[#ebeef7] text-[#9f3c16] font-label-sm text-[11px] px-2 py-0.5 rounded-full">
                  {selectedFormat}
                  <button onClick={() => setSelectedFormat('all')} aria-label="Clear format">
                    <span className="material-symbols-outlined text-[12px]">close</span>
                  </button>
                </span>
              )}
              {priceBracket !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-[#ebeef7] text-[#9f3c16] font-label-sm text-[11px] px-2 py-0.5 rounded-full">
                  {priceBracket}
                  <button onClick={() => setPriceBracket('all')} aria-label="Clear price bracket">
                    <span className="material-symbols-outlined text-[12px]">close</span>
                  </button>
                </span>
              )}
              {activeFiltersCount === 0 && selectedGenre === 'all' && (
                <span className="text-[11px] text-[#8a726a]">None (Showing complete catalog)</span>
              )}
            </div>

            {/* Sorting Dropdown */}
            <div className="relative inline-block shrink-0">
              <select
                aria-label="Sort books by"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="appearance-none bg-[#f1f3fd] text-[#181c23] font-label-sm text-xs pl-2.5 pr-7 py-1.5 rounded-lg focus:outline-none cursor-pointer border border-[#dfe2ec]"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="pub-date">Publication Date</option>
              </select>
              <span className="material-symbols-outlined text-[16px] pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[#57423b]">
                arrow_drop_down
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Book Card Grid Section */}
      <section className="max-w-5xl mx-auto w-full px-3 sm:px-6 py-5">
        {paginatedBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
            {paginatedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-[48px] text-[#8a726a] mb-2">auto_stories</span>
            <h3 className="font-headline-sm text-lg text-[#181c23]">No titles match your inquiries</h3>
            <p className="font-body-md text-xs text-[#57423b] mt-1 max-w-sm">
              We couldn't locate any volumes under this specific criteria. Try resetting your search or filter tags.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="mt-4 px-4 py-2 bg-[#9f3c16] text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-[#bf542c] transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>

      {/* 3. Pagination Controls */}
      <section className="max-w-5xl mx-auto w-full px-4 sm:px-6 pt-2 pb-8 flex flex-col items-center gap-2">
        <span className="font-body-sm text-xs text-[#57423b]">
          Showing{' '}
          <strong className="text-[#181c23] font-semibold">
            {filteredBooks.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–
            {Math.min(currentPage * itemsPerPage, filteredBooks.length)}
          </strong>{' '}
          of <strong>{filteredBooks.length}</strong> titles
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5 bg-[#f1f3fd] p-1 rounded-full shadow-inner border border-[#dfe2ec]">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#57423b] hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Previous page"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-full font-label-md text-xs font-bold flex items-center justify-center transition-all ${
                    currentPage === pageNum
                      ? 'bg-[#9f3c16] text-white shadow-xs'
                      : 'text-[#57423b] hover:bg-white'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#57423b] hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Next page"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        )}
      </section>

      {/* 4. Filter Slide-over Sheet / Modal */}
      {filterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-[#181c23]/60 backdrop-blur-sm"
            onClick={() => setFilterModalOpen(false)}
          />

          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl max-w-lg w-full p-5 shadow-2xl z-10 border border-[#dec0b7]/40 max-h-[85vh] flex flex-col animate-fade-in">
            <div className="w-12 h-1 bg-[#dfe2ec] rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-[#dfe2ec]">
              <h2 className="font-headline-sm text-lg text-[#181c23]">Filter Catalog</h2>
              <button
                type="button"
                onClick={() => setFilterModalOpen(false)}
                className="text-[#57423b] hover:text-[#181c23] p-1"
                aria-label="Close filters"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <div className="overflow-y-auto flex flex-col gap-4 py-4 pr-1">
              {/* Genres Group */}
              <div>
                <span className="font-label-md text-xs text-[#57423b] block mb-2 uppercase tracking-wider font-semibold">
                  Genres
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedGenre('all')}
                    className={`px-3 py-1.5 rounded-full font-label-sm text-xs transition-colors ${
                      selectedGenre === 'all'
                        ? 'bg-[#9f3c16] text-white font-semibold'
                        : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
                    }`}
                  >
                    All Genres
                  </button>
                  {genresList.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGenre(selectedGenre === g ? 'all' : g)}
                      className={`px-3 py-1.5 rounded-full font-label-sm text-xs transition-colors ${
                        selectedGenre.toLowerCase() === g.toLowerCase()
                          ? 'bg-[#9f3c16] text-white font-semibold'
                          : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <span className="font-label-md text-xs text-[#57423b] block mb-2 uppercase tracking-wider font-semibold">
                  Price Bracket
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPriceBracket(priceBracket === 'under15' ? 'all' : 'under15')}
                    className={`py-2 px-3 rounded-lg text-xs text-left font-medium transition-colors border ${
                      priceBracket === 'under15'
                        ? 'bg-[#ffdcc3] border-[#904d00] text-[#2f1500] font-semibold'
                        : 'bg-[#f1f3fd] border-[#dfe2ec] text-[#181c23]'
                    }`}
                  >
                    Under $15
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceBracket(priceBracket === '15to25' ? 'all' : '15to25')}
                    className={`py-2 px-3 rounded-lg text-xs text-left font-medium transition-colors border ${
                      priceBracket === '15to25'
                        ? 'bg-[#ffdcc3] border-[#904d00] text-[#2f1500] font-semibold'
                        : 'bg-[#f1f3fd] border-[#dfe2ec] text-[#181c23]'
                    }`}
                  >
                    $15 to $25
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceBracket(priceBracket === '25to35' ? 'all' : '25to35')}
                    className={`py-2 px-3 rounded-lg text-xs text-left font-medium transition-colors border ${
                      priceBracket === '25to35'
                        ? 'bg-[#ffdcc3] border-[#904d00] text-[#2f1500] font-semibold'
                        : 'bg-[#f1f3fd] border-[#dfe2ec] text-[#181c23]'
                    }`}
                  >
                    $25 to $35
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceBracket(priceBracket === 'above35' ? 'all' : 'above35')}
                    className={`py-2 px-3 rounded-lg text-xs text-left font-medium transition-colors border ${
                      priceBracket === 'above35'
                        ? 'bg-[#ffdcc3] border-[#904d00] text-[#2f1500] font-semibold'
                        : 'bg-[#f1f3fd] border-[#dfe2ec] text-[#181c23]'
                    }`}
                  >
                    $35 & Above
                  </button>
                </div>
              </div>

              {/* Binding / Format */}
              <div>
                <span className="font-label-md text-xs text-[#57423b] block mb-2 uppercase tracking-wider font-semibold">
                  Format
                </span>
                <div className="flex flex-wrap gap-2">
                  {['all', 'Hardcover', 'Paperback', 'Collector Edition'].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setSelectedFormat(fmt)}
                      className={`px-3 py-1.5 rounded-full font-label-sm text-xs transition-colors ${
                        selectedFormat.toLowerCase() === fmt.toLowerCase()
                          ? 'bg-[#9f3c16] text-white font-semibold'
                          : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
                      }`}
                    >
                      {fmt === 'all' ? 'All Formats' : fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-3 border-t border-[#dfe2ec] flex items-center gap-2 mt-auto">
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex-1 py-2.5 rounded-xl bg-[#ebeef7] hover:bg-[#dfe2ec] text-[#181c23] font-label-md text-xs font-semibold text-center transition-colors"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setFilterModalOpen(false)}
                className="flex-[2] py-2.5 rounded-xl bg-[#9f3c16] hover:bg-[#bf542c] text-white font-label-md text-xs font-semibold text-center shadow-md transition-all active:scale-98"
              >
                Show {filteredBooks.length} Titles
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
