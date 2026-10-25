import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { ICourse, ICategory } from '../../types/index.js';
import { CourseCard } from '../../components/course/CourseCard.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import {
  Search,
  Filter,
  ArrowUpDown,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const MarketplacePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState<ICourse[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 12,
  });

  // Filter states
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedPrice, setSelectedPrice] = useState(searchParams.get('price') || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get('difficulty') || 'All');
  const [selectedRating, setSelectedRating] = useState(searchParams.get('minRating') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/admin/categories');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch courses with active filters
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {
          page: page.toString(),
          limit: '12',
          sort: sortBy,
        };

        if (search.trim()) params.q = search.trim();
        if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
        if (selectedPrice && selectedPrice !== 'all') params.price = selectedPrice;
        if (selectedDifficulty && selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;
        if (selectedRating) params.minRating = selectedRating;

        const res = await api.get('/courses', { params });
        if (res.data.success) {
          setCourses(res.data.courses);
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [search, selectedCategory, selectedPrice, selectedDifficulty, selectedRating, sortBy, page]);

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedPrice('all');
    setSelectedDifficulty('All');
    setSelectedRating('');
    setSortBy('newest');
    setPage(1);
  };

  const hasActiveFilters =
    search !== '' ||
    selectedCategory !== 'All' ||
    selectedPrice !== 'all' ||
    selectedDifficulty !== 'All' ||
    selectedRating !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Course Marketplace
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Explore {pagination.total} verified courses taught by industry veterans.
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-semibold transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {hasActiveFilters && '(Active)'}
          </button>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="bg-white border border-slate-200 text-slate-800 text-sm font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
            >
              <option value="newest">Newest Additions</option>
              <option value="popular">Most Popular</option>
              <option value="highest-rated">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <Filter className="w-4 h-4 text-blue-600" />
                Filter Courses
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                Search
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Keywords..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-slate-50 text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-50 text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Pricing Filter */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                Price
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['all', 'free', 'paid'].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setSelectedPrice(p);
                      setPage(1);
                    }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold capitalize transition-all ${
                      selectedPrice === p
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                Difficulty Level
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => {
                  setSelectedDifficulty(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-50 text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="All">All Difficulty Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                Minimum Rating
              </label>
              <select
                value={selectedRating}
                onChange={(e) => {
                  setSelectedRating(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-50 text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5 Stars and Above</option>
                <option value="4.0">4.0 Stars and Above</option>
              </select>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="col-span-1 md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-4"
                >
                  <div className="aspect-video bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-8 bg-slate-100 rounded-xl mt-4" />
                </div>
              ))}
            </div>
          ) : courses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.pages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {[...Array(pagination.pages)].map((_, idx) => {
                    const pNum = idx + 1;
                    return (
                      <button
                        key={pNum}
                        onClick={() => setPage(pNum)}
                        className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${
                          page === pNum
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage((prev) => Math.min(pagination.pages, prev + 1))}
                    disabled={page === pagination.pages}
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title="No courses found"
              description="No courses match your current search and filter criteria. Try resetting your filters."
              actionText="Reset All Filters"
              onActionClick={clearAllFilters}
            />
          )}
        </div>
      </div>
    </div>
  );
};
