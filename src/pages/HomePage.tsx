import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookCard } from '../components/BookCard';
import { useBooks } from '../context/BookContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Book } from '../types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { books } = useBooks();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const genres = [
    'All',
    'Literary Fiction',
    'Contemporary',
    'Historical Fantasy',
    'Sci-Fi',
    'Speculative Fiction',
    'Philosophy',
    'Poetry',
    'Essays',
  ];

  // Highlights for Curator's Spotlight (4 books)
  const spotlightBooks = books.slice(0, 4);

  // New releases rail
  const newReleases = books.filter((b) => b.badge === 'New Release').concat(books.slice(4, 8));

  // Autocomplete suggestions
  const autocompleteSuggestions = searchQuery.trim().length > 1
    ? books.filter(
        (b) =>
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.author.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  const handleCopyCoupon = () => {
    navigator.clipboard?.writeText('NEST15').catch(() => {});
    showToast('Promo code NEST15 copied to clipboard!', 'success', 'content_copy');
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.includes('@')) {
      showToast('Please provide a valid email address.', 'warning');
      return;
    }
    showToast('Welcome to the BookNest circle! Check your inbox for your 15% discount.', 'success', 'mark_email_read');
    setNewsletterEmail('');
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* 1. Dynamic Hero Editorial Banner */}
      <section className="relative w-full px-4 sm:px-6 pt-6 pb-8 bg-[#f1f3fd] overflow-hidden border-b border-[#dec0b7]/30">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#9f3c16]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdbcf] text-[#390c00] font-label-sm text-xs tracking-wide mb-3 shadow-xs">
            <span className="material-symbols-outlined text-[15px] text-[#9f3c16] fill-1">auto_stories</span>
            <span>Curated Spring Selection</span>
          </div>

          <h1 className="font-headline-lg-mobile sm:font-headline-lg text-[#181c23] tracking-tight mb-2 max-w-2xl leading-tight">
            Discover Stories That <span className="italic font-normal text-[#9f3c16]">Stay With You</span>
          </h1>

          <p className="font-body-md text-[#57423b] mb-6 max-w-xl leading-relaxed text-sm sm:text-base">
            Hand-bound archives, limited signed editions, and contemporary voices chosen by passionate resident bibliophiles.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/catalog')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#9f3c16] hover:bg-[#bf542c] text-white rounded-xl font-label-md text-sm shadow-md active:scale-95 transition-all font-semibold"
            >
              <span>Explore Catalog</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedGenre('Contemporary');
                navigate('/catalog');
              }}
              className="inline-flex items-center justify-center px-4 py-3 bg-white text-[#181c23] hover:bg-[#ebeef7] rounded-xl font-label-md text-sm border border-[#dfe2ec] shadow-sm active:scale-95 transition-all font-semibold"
            >
              Staff Picks
            </button>
          </div>
        </div>
      </section>

      {/* 2. Global Interactive Search with Live Autocomplete */}
      <section className="max-w-5xl mx-auto w-full px-4 sm:px-6 -mt-5 relative z-20">
        <div className="relative w-full rounded-2xl bg-white shadow-lg border border-[#dec0b7]/40">
          <div className="flex items-center px-4 py-3 gap-2.5">
            <span className="material-symbols-outlined text-[#8a726a] text-[22px]">search</span>
            <input
              type="text"
              placeholder="Search by title, author, or ISBN-13..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navigate(`/catalog?q=${encodeURIComponent(searchQuery)}`);
                }
              }}
              className="w-full bg-transparent font-body-md text-sm sm:text-base text-[#181c23] placeholder:text-[#8a726a] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#8a726a] hover:text-[#181c23] p-1"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                showToast('Listening for title or author dictation...', 'info', 'mic');
              }}
              className="text-[#8a726a] hover:text-[#9f3c16] transition-colors p-1"
              title="Voice search"
              aria-label="Voice search"
            >
              <span className="material-symbols-outlined text-[20px]">mic</span>
            </button>
          </div>

          {/* Autocomplete Dropdown Preview */}
          {autocompleteSuggestions.length > 0 && (
            <div className="border-t border-[#dfe2ec] p-2 bg-white rounded-b-2xl shadow-xl flex flex-col gap-1 animate-fade-in">
              <span className="font-label-sm text-[10px] text-[#8a726a] uppercase tracking-wider px-2 py-1">
                Suggested Works ({autocompleteSuggestions.length})
              </span>
              {autocompleteSuggestions.map((book) => (
                <div
                  key={book.id}
                  onClick={() => navigate(`/catalog?q=${encodeURIComponent(book.title)}`)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f1f3fd] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      referrerPolicy="no-referrer"
                      className="w-8 h-11 object-cover rounded shadow-xs"
                    />
                    <div>
                      <div className="font-semibold text-xs text-[#181c23] line-clamp-1">{book.title}</div>
                      <div className="text-[11px] text-[#57423b]">{book.author}</div>
                    </div>
                  </div>
                  <span className="font-label-sm text-[#9f3c16] font-bold text-xs">${book.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Browse by Theme Horizontal Genre Rails */}
      <section className="max-w-5xl mx-auto w-full mt-7 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-title-lg text-base sm:text-lg text-[#181c23]">Browse by Theme</h2>
          <Link to="/catalog" className="font-label-sm text-[#9f3c16] hover:underline tracking-wide">
            View All
          </Link>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {genres.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => {
                setSelectedGenre(genre);
                navigate(`/catalog?genre=${encodeURIComponent(genre)}`);
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-full font-label-md text-xs sm:text-sm transition-all active:scale-95 ${
                selectedGenre === genre
                  ? 'bg-[#9f3c16] text-white shadow-sm font-semibold'
                  : 'bg-[#ebeef7] text-[#57423b] hover:bg-[#dfe2ec]'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </section>

      {/* 4. Curator's Spotlight (2-across on mobile, 4-across on desktop) */}
      <section className="max-w-5xl mx-auto w-full mt-8 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#9f3c16] rounded-full"></span>
            <h2 className="font-headline-sm text-lg sm:text-xl text-[#181c23]">Curator's Spotlight</h2>
          </div>
          <span className="font-label-sm text-[#904d00] tracking-wider uppercase font-semibold text-xs">
            4 Highlights
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {spotlightBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* 5. Staff Pick Spotlight (Rich Editorial Layout) */}
      <section className="max-w-5xl mx-auto w-full mt-8 px-4 sm:px-6">
        <div className="p-5 sm:p-7 rounded-2xl bg-[#f1f3fd] shadow-sm border border-[#dec0b7]/40 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2 text-[#9f3c16]">
            <span className="material-symbols-outlined text-[20px]">format_quote</span>
            <span className="font-label-sm tracking-wider uppercase font-semibold text-xs">Staff Deep Dive</span>
          </div>

          <blockquote className="font-headline-sm text-base sm:text-xl text-[#181c23] leading-snug mb-4 italic max-w-3xl">
            "There is a time for any story, but Zevin reminds us why the games we play define the love we preserve."
          </blockquote>

          <div className="flex items-center justify-between pt-2 border-t border-[#dfe2ec]/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#ffdbcf] flex items-center justify-center text-[#390c00] font-title-md font-bold text-xs shadow-xs">
                EA
              </div>
              <div className="flex flex-col">
                <span className="font-title-md text-[#181c23] text-xs sm:text-sm leading-tight font-semibold">
                  Elena Almodovar
                </span>
                <span className="font-body-sm text-[#57423b] text-[11px]">Head of Fiction Curation</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                navigate(`/catalog?q=Tomorrow`);
              }}
              className="px-3 py-1.5 rounded-lg bg-white text-[#9f3c16] hover:bg-[#ebeef7] font-label-sm text-xs font-semibold shadow-xs border border-[#dfe2ec] transition-colors"
            >
              Read Review
            </button>
          </div>
        </div>
      </section>

      {/* 6. Fresh Off the Press Horizontal Rail */}
      <section className="max-w-5xl mx-auto w-full mt-8 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#904d00] rounded-full"></span>
            <h2 className="font-headline-sm text-lg sm:text-xl text-[#181c23]">Fresh Off the Press</h2>
          </div>
          <span className="font-label-sm text-[#57423b] text-xs">This Week</span>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {newReleases.map((book) => (
            <div
              key={book.id}
              className="shrink-0 w-36 sm:w-44 flex flex-col bg-white rounded-xl p-2.5 shadow-sm border border-[#dfe2ec]/70 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/catalog?q=${encodeURIComponent(book.title)}`)}
            >
              <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-[#ebeef7] mb-2">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1 left-1 bg-[#9f3c16] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                  NEW RELEASE
                </span>
              </div>
              <h4 className="font-title-md text-[#181c23] text-xs leading-tight truncate font-semibold">
                {book.title}
              </h4>
              <span className="font-body-sm text-[#57423b] text-[11px] truncate">{book.author}</span>
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#dfe2ec]/50">
                <span className="font-label-md text-[#9f3c16] font-bold text-xs">${book.price.toFixed(2)}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(book, 1);
                    showToast(`Added "${book.title}" to cart`, 'success', 'bookmark_add');
                  }}
                  className="text-[#8a726a] hover:text-[#9f3c16] p-0.5"
                  title="Bookmark and add to cart"
                  aria-label="Add to cart"
                >
                  <span className="material-symbols-outlined text-[17px]">bookmark_add</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Literary Newsletter & Discount Module */}
      <section className="max-w-5xl mx-auto w-full mt-10 px-4 sm:px-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#ffdcc3] text-[#2f1500] shadow-sm relative overflow-hidden border border-[#dec0b7]">
          <div className="flex items-center gap-1.5 mb-1 text-[#9f3c16]">
            <span className="material-symbols-outlined text-[20px]">local_cafe</span>
            <span className="font-label-sm uppercase font-bold tracking-wider text-xs">The BookNest Dispatch</span>
          </div>

          <h3 className="font-headline-sm text-xl sm:text-2xl text-[#2f1500] leading-tight mb-2">
            Read deeply. Save on your next parcel.
          </h3>
          <p className="font-body-sm text-[#6e3900] mb-4 leading-relaxed text-xs sm:text-sm max-w-xl">
            Subscribe for weekly author letters, limited printing pre-orders, and claim 15% off with the curator promo below.
          </p>

          {/* Coupon Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-[#181c23] rounded-lg mb-4 shadow-sm border border-[#dec0b7]/50">
            <span className="font-label-sm text-[#8a726a] uppercase text-[10px]">PROMO:</span>
            <span className="font-mono text-sm text-[#9f3c16] font-bold tracking-wider">NEST15</span>
            <button
              type="button"
              onClick={handleCopyCoupon}
              className="ml-1 text-[#8a726a] hover:text-[#9f3c16] flex items-center p-0.5"
              title="Copy coupon code"
              aria-label="Copy coupon code"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
            </button>
          </div>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-lg">
            <input
              type="email"
              placeholder="your.reading.nook@domain.com"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-white rounded-xl font-body-md text-sm text-[#181c23] placeholder:text-[#8a726a] focus:outline-none shadow-xs border border-[#dec0b7]"
              required
            />
            <button
              type="submit"
              className="py-2.5 px-5 bg-[#9f3c16] hover:bg-[#bf542c] text-white rounded-xl font-label-md text-xs sm:text-sm active:scale-95 transition-all shadow-md font-semibold shrink-0"
            >
              Join the Reading Circle
            </button>
          </form>
        </div>
      </section>

      {/* 8. Value Propositions & Trust Signals */}
      <section className="max-w-5xl mx-auto w-full mt-8 px-4 sm:px-6 grid grid-cols-2 gap-3 sm:gap-4">
        <div className="p-3.5 bg-[#f1f3fd] rounded-xl flex items-start gap-2.5 shadow-xs border border-[#dfe2ec]">
          <span className="material-symbols-outlined text-[#9f3c16] text-[22px] shrink-0 mt-0.5">verified</span>
          <div className="flex flex-col">
            <span className="font-title-md text-xs sm:text-sm text-[#181c23] font-semibold leading-tight">
              Guaranteed Print
            </span>
            <span className="font-body-sm text-[#57423b] text-[11px] sm:text-xs leading-snug mt-0.5">
              Acid-free paper & robust bookbindings.
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-[#f1f3fd] rounded-xl flex items-start gap-2.5 shadow-xs border border-[#dfe2ec]">
          <span className="material-symbols-outlined text-[#904d00] text-[22px] shrink-0 mt-0.5">local_shipping</span>
          <div className="flex flex-col">
            <span className="font-title-md text-xs sm:text-sm text-[#181c23] font-semibold leading-tight">
              Carbon Neutral
            </span>
            <span className="font-body-sm text-[#57423b] text-[11px] sm:text-xs leading-snug mt-0.5">
              Biodegradable unbleached boxes.
            </span>
          </div>
        </div>
      </section>

      {/* 9. Editorial Footer Links & REST API Indicator */}
      <footer className="max-w-5xl mx-auto w-full mt-12 px-4 sm:px-6 pt-6 pb-8 bg-white rounded-t-2xl shadow-sm border-t border-[#dfe2ec]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-lg text-[#9f3c16] tracking-tight">BookNest</span>
            <span className="font-label-sm text-[#57423b] text-xs">© 2025</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f1f3fd] text-[#181c23] font-label-sm text-[11px] border border-[#dfe2ec]">
            <span className="w-2 h-2 rounded-full bg-[#0051d5] animate-pulse"></span>
            <span>REST API • MongoDB Ready</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-body-sm text-xs text-[#57423b] mb-6">
          <Link to="/catalog" className="hover:text-[#9f3c16] transition-colors">Rare Archives</Link>
          <button onClick={() => showToast('Gift Cards available upon request with concierge', 'info')} className="text-left hover:text-[#9f3c16] transition-colors">Gift Cards</button>
          <button onClick={() => showToast('Community Club meets every Thursday', 'info')} className="text-left hover:text-[#9f3c16] transition-colors">Community Club</button>
          <button onClick={() => showToast('Flagship location: Brooklyn, NY', 'info')} className="text-left hover:text-[#9f3c16] transition-colors">Store Locator</button>
          <button onClick={() => showToast('Dispatched with end-to-end tracked courier', 'info')} className="text-left hover:text-[#9f3c16] transition-colors">Dispatch Policy</button>
          <button onClick={() => showToast('256-bit encrypted checkout & strict data privacy', 'info')} className="text-left hover:text-[#9f3c16] transition-colors">Privacy Notice</button>
        </div>

        <p className="font-body-sm text-[#8a726a] text-[11px] text-center leading-relaxed">
          Curated with precision for inquisitive minds. Inventory synchronously cached across nodes.
        </p>
      </footer>
    </div>
  );
};
