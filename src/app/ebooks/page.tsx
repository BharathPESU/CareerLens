'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  Download,
  Bookmark,
  BookmarkCheck,
  Filter,
  Star,
  Eye,
  ExternalLink,
  TrendingUp,
  History,
  X
} from 'lucide-react';
import {
  searchBooks,
  getPopularBooks,
  getRecommendations,
  POPULAR_GENRES,
  LANGUAGES,
  FORMATS,
  type Book,
  type SearchFilters
} from '@/lib/services/internet-archive-service';
import {
  searchGoogleBooks,
  getPopularGoogleBooks,
  getFreeEbooks,
  GOOGLE_BOOKS_CATEGORIES,
  GOOGLE_BOOKS_LANGUAGES,
  type GoogleBook,
  type GoogleBooksSearchFilters
} from '@/lib/services/google-books-service';
import {
  getBookmarkedBooks,
  addBookmark,
  removeBookmark,
  isBookmarked as checkIsBookmarked,
  getSearchHistory,
  addToSearchHistory
} from '@/lib/services/bookmark-service';

export default function EBooksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [googleBooks, setGoogleBooks] = useState<GoogleBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [bookmarkedBooks, setBookmarkedBooks] = useState<Book[]>([]);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'bookmarks' | 'trending' | 'google'>('search');
  const [bookSource, setBookSource] = useState<'archive' | 'google' | 'both'>('both');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [popular, googlePopular, history] = await Promise.all([
        getPopularBooks(),
        getPopularGoogleBooks(),
        Promise.resolve(getSearchHistory())
      ]);

      setBooks(popular);
      setGoogleBooks(googlePopular);
      setSearchHistory(history);
      setBookmarkedBooks(getBookmarkedBooks());

      if (history.length > 0) {
        const recs = await getRecommendations(history);
        setRecommendations(recs);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setActiveTab('search');

    try {
      addToSearchHistory(searchQuery);
      setSearchHistory(getSearchHistory());

      if (bookSource === 'archive' || bookSource === 'both') {
        const { books: results, total } = await searchBooks(searchQuery, filters, currentPage);
        setBooks(results);
        setTotalResults(total);
      }

      if (bookSource === 'google' || bookSource === 'both') {
        const { books: googleResults, totalItems } = await getFreeEbooks(searchQuery, (currentPage - 1) * 20);
        setGoogleBooks(googleResults);
        if (bookSource === 'google') {
          setTotalResults(totalItems);
        }
      }
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = (book: Book) => {
    if (checkIsBookmarked(book.id)) {
      removeBookmark(book.id);
    } else {
      addBookmark(book);
    }
    setBookmarkedBooks(getBookmarkedBooks());
  };

  const displayBooks = activeTab === 'bookmarks' ? bookmarkedBooks : books;

  return (
    <div className="min-h-screen relative overflow-hidden p-4 md:p-8">
      {/* Animated Mesh Wave Background */}
      <div className="fixed inset-0 bg-background -z-10">
        <div className="mesh-wave-bg absolute inset-0" />
      </div>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <BookOpen className="w-12 h-12 text-neon-cyan drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-emerald bg-clip-text text-transparent text-glow-cyan">
              eBooks Library
            </h1>
          </div>
          <p className="text-white/65 text-lg">
            Search millions of free books from Internet Archive & Google Books
          </p>
        </motion.div>

        {/* Source Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex justify-center gap-2"
        >
          <button
            onClick={() => setBookSource('both')}
            className={`px-4 py-2 rounded-2xl font-semibold transition-all duration-300 ${bookSource === 'both'
              ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white shadow-neon-cyan/20 shadow-lg border border-neon-cyan/30'
              : 'bg-white/[0.08] border border-white/[0.16] text-white/65 hover:bg-white/[0.12] hover:text-white hover:border-white/20'
              }`}
          >
            All Sources
          </button>
          <button
            onClick={() => setBookSource('archive')}
            className={`px-4 py-2 rounded-2xl font-semibold transition-all duration-300 ${bookSource === 'archive'
              ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white shadow-neon-cyan/20 shadow-lg border border-neon-cyan/30'
              : 'bg-white/[0.08] border border-white/[0.16] text-white/65 hover:bg-white/[0.12] hover:text-white hover:border-white/20'
              }`}
          >
            Internet Archive
          </button>
          <button
            onClick={() => setBookSource('google')}
            className={`px-4 py-2 rounded-2xl font-semibold transition-all duration-300 ${bookSource === 'google'
              ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white shadow-neon-cyan/20 shadow-lg border border-neon-cyan/30'
              : 'bg-white/[0.08] border border-white/[0.16] text-white/65 hover:bg-white/[0.12] hover:text-white hover:border-white/20'
              }`}
          >
            Google Books
          </button>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/65" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter book title, author, or keyword..."
                className="w-full pl-12 pr-4 py-4 bg-white/[0.08] border border-white/[0.16] rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20 backdrop-blur-xl transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-purple hover:shadow-neon-cyan/40 hover:shadow-lg disabled:opacity-50 rounded-2xl font-semibold transition-all duration-300"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${showFilters
                ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white shadow-neon-cyan/20 shadow-lg border border-neon-cyan/30'
                : 'bg-white/[0.08] border border-white/[0.16] text-white/65 hover:bg-white/[0.12] hover:border-white/20'
                }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && !searchQuery && (
            <div className="mt-2 flex flex-wrap gap-2">
              {searchHistory.slice(0, 5).map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(query);
                    setTimeout(handleSearch, 100);
                  }}
                  className="px-3 py-1 text-sm bg-white/[0.08] border border-white/[0.16] rounded-full text-white/65 hover:bg-white/[0.12] hover:text-white transition-all flex items-center gap-1"
                >
                  <History className="w-3 h-3" />
                  {query}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/[0.08] border border-white/[0.16] rounded-2xl p-6 space-y-4 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </h3>
                <button
                  onClick={() => {
                    setFilters({});
                    setShowFilters(false);
                  }}
                  className="text-sm text-neon-cyan hover:text-neon-purple transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Genre */}
                <div>
                  <label className="block text-sm text-white/65 mb-2 font-medium">Genre</label>
                  <select
                    value={filters.genre || ''}
                    onChange={(e) => setFilters({ ...filters, genre: e.target.value || undefined })}
                    className="w-full px-4 py-2 bg-white/[0.08] border border-white/[0.16] rounded-2xl text-white focus:outline-none focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20 backdrop-blur-xl transition-all"
                  >
                    <option value="">All Genres</option>
                    {POPULAR_GENRES.map((genre) => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm text-white/65 mb-2 font-medium">Language</label>
                  <select
                    value={filters.language || ''}
                    onChange={(e) => setFilters({ ...filters, language: e.target.value || undefined })}
                    className="w-full px-4 py-2 bg-white/[0.08] border border-white/[0.16] rounded-2xl text-white focus:outline-none focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20 backdrop-blur-xl transition-all"
                  >
                    <option value="">All Languages</option>
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                {/* Format */}
                <div>
                  <label className="block text-sm text-white/65 mb-2 font-medium">Format</label>
                  <select
                    value={filters.format || ''}
                    onChange={(e) => setFilters({ ...filters, format: e.target.value || undefined })}
                    className="w-full px-4 py-2 bg-white/[0.08] border border-white/[0.16] rounded-2xl text-white focus:outline-none focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20 backdrop-blur-xl transition-all"
                  >
                    <option value="">All Formats</option>
                    {FORMATS.map((format) => (
                      <option key={format} value={format}>{format}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-white/[0.16]">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 font-semibold transition-all duration-300 ${activeTab === 'search'
              ? 'text-neon-cyan border-b-2 border-neon-cyan drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]'
              : 'text-white/65 hover:text-white'
              }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            Search Results ({totalResults || books.length})
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-4 py-2 font-semibold transition-all duration-300 ${activeTab === 'bookmarks'
              ? 'text-neon-cyan border-b-2 border-neon-cyan drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]'
              : 'text-white/65 hover:text-white'
              }`}
          >
            <Bookmark className="w-4 h-4 inline mr-2" />
            Bookmarks ({bookmarkedBooks.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('trending');
              loadInitialData();
            }}
            className={`px-4 py-2 font-semibold transition-all duration-300 ${activeTab === 'trending'
              ? 'text-neon-cyan border-b-2 border-neon-cyan drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]'
              : 'text-white/65 hover:text-white'
              }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Trending
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        )}

        {/* Books Grid */}
        {!loading && (books.length > 0 || googleBooks.length > 0) && activeTab === 'search' && (
          <div className="space-y-8">
            {/* Internet Archive Books */}
            {(bookSource === 'archive' || bookSource === 'both') && books.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-neon-cyan drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
                  Internet Archive ({books.length})
                </h2>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {books.map((book, idx) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      isBookmarked={checkIsBookmarked(book.id)}
                      onBookmark={() => handleBookmark(book)}
                      delay={idx * 0.05}
                    />
                  ))}
                </motion.div>
              </div>
            )}

            {/* Google Books */}
            {(bookSource === 'google' || bookSource === 'both') && googleBooks.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-neon-purple drop-shadow-[0_0_8px_rgba(165,124,255,0.6)]" />
                  Google Books ({googleBooks.length})
                </h2>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {googleBooks.map((book, idx) => (
                    <GoogleBookCard
                      key={book.id}
                      book={book}
                      delay={idx * 0.05}
                    />
                  ))}
                </motion.div>
              </div>
            )}
          </div>
        )}

        {/* Bookmarks Tab */}
        {!loading && activeTab === 'bookmarks' && displayBooks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {displayBooks.map((book, idx) => (
              <BookCard
                key={book.id}
                book={book}
                isBookmarked={checkIsBookmarked(book.id)}
                onBookmark={() => handleBookmark(book)}
                delay={idx * 0.05}
              />
            ))}
          </motion.div>
        )}

        {/* Trending Tab */}
        {!loading && activeTab === 'trending' && books.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {books.map((book, idx) => (
              <BookCard
                key={book.id}
                book={book}
                isBookmarked={checkIsBookmarked(book.id)}
                onBookmark={() => handleBookmark(book)}
                delay={idx * 0.05}
              />
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && books.length === 0 && googleBooks.length === 0 && (
          <div className="text-center py-12 text-white/65">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">
              {activeTab === 'bookmarks'
                ? 'No bookmarked books yet. Start exploring!'
                : 'No books found. Try a different search.'}
            </p>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && activeTab === 'search' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Star className="w-6 h-6 text-neon-emerald drop-shadow-[0_0_8px_rgba(0,255,198,0.6)]" />
              Recommended for You
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recommendations.slice(0, 6).map((book) => (
                <div
                  key={book.id}
                  className="glass-card rounded-2xl p-3 hover:border-neon-cyan/50 transition-all cursor-pointer"
                  onClick={() => window.open(book.directLink, '_blank')}
                >
                  <img
                    src={book.thumbnail}
                    alt={book.title}
                    className="w-full h-32 object-cover rounded mb-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-book.png';
                    }}
                  />
                  <p className="text-sm text-white font-semibold line-clamp-2">
                    {book.title}
                  </p>
                  <p className="text-xs text-gray-400 line-clamp-1">
                    {book.author[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Book Card Component
function BookCard({
  book,
  isBookmarked,
  onBookmark,
  delay
}: {
  book: Book;
  isBookmarked: boolean;
  onBookmark: () => void;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card rounded-2xl overflow-hidden hover:border-neon-cyan/50 transition-all group"
    >
      {/* Book Cover */}
      <div className="relative h-64 bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10">
        <img
          src={book.thumbnail}
          alt={book.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-book.png';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <div className="flex gap-2">
            <a
              href={book.directLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-gradient-to-r from-neon-cyan to-neon-purple hover:shadow-neon-cyan/40 hover:shadow-lg rounded-2xl text-sm font-semibold flex items-center gap-1 transition-all"
            >
              <Eye className="w-4 h-4" />
              View
            </a>
            <a
              href={book.previewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-white/[0.15] hover:bg-white/[0.25] backdrop-blur-xl rounded-2xl text-sm font-semibold flex items-center gap-1 border border-white/[0.16] transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Preview
            </a>
          </div>
        </div>
        <button
          onClick={onBookmark}
          className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all hover:scale-110"
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-5 h-5 text-neon-emerald drop-shadow-[0_0_8px_rgba(0,255,198,0.8)]" />
          ) : (
            <Bookmark className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Book Info */}
      <div className="p-4 space-y-2">
        <h3 className="text-white font-bold line-clamp-2 text-lg">
          {book.title}
        </h3>
        <p className="text-neon-cyan text-sm line-clamp-1">
          {book.author.join(', ')}
        </p>
        <p className="text-white/65 text-sm line-clamp-2">
          {book.description}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-white/50 pt-2 border-t border-white/10">
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {book.downloads.toLocaleString()}
          </span>
          <span>{book.publishYear}</span>
          <span className="px-2 py-1 bg-neon-cyan/20 rounded text-neon-cyan">
            {book.format[0]}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// Google Book Card Component
function GoogleBookCard({
  book,
  delay
}: {
  book: GoogleBook;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card rounded-2xl overflow-hidden hover:border-neon-purple/50 transition-all group"
    >
      {/* Book Cover */}
      <div className="relative h-64 bg-gradient-to-br from-neon-purple/10 to-neon-emerald/10">
        <img
          src={book.thumbnail || '/placeholder-book.png'}
          alt={book.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-book.png';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <div className="flex gap-2">
            {book.previewLink && (
              <a
                href={book.previewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-gradient-to-r from-neon-purple to-neon-emerald hover:shadow-neon-purple/40 hover:shadow-lg rounded-2xl text-sm font-semibold flex items-center gap-1 transition-all"
              >
                <Eye className="w-4 h-4" />
                Preview
              </a>
            )}
            {book.infoLink && (
              <a
                href={book.infoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-white/[0.15] hover:bg-white/[0.25] backdrop-blur-xl rounded-2xl text-sm font-semibold flex items-center gap-1 border border-white/[0.16] transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Info
              </a>
            )}
          </div>
        </div>
        {book.isEbook && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
            FREE
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="p-4 space-y-2">
        <h3 className="text-white font-bold line-clamp-2 text-lg">
          {book.title}
        </h3>
        <p className="text-neon-purple text-sm line-clamp-1">
          {book.authors.join(', ')}
        </p>
        {book.description && (
          <p className="text-white/65 text-sm line-clamp-2">
            {book.description}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-white/50 pt-2 border-t border-white/10">
          {book.averageRating && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              {book.averageRating.toFixed(1)}
            </span>
          )}
          {book.pageCount && <span>{book.pageCount} pages</span>}
          {book.publishedDate && (
            <span>{new Date(book.publishedDate).getFullYear()}</span>
          )}
        </div>

        {book.categories && book.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {book.categories.slice(0, 2).map((cat, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-neon-purple/20 rounded text-xs text-neon-purple"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
