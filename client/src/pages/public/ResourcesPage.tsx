import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { IResource, ICategory } from '../../types/index.js';
import { ResourceCard } from '../../components/resource/ResourceCard.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { Search, Filter, BookOpen } from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [resources, setResources] = useState<IResource[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/admin/categories');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = { limit: '24' };
        if (search.trim()) params.q = search.trim();
        if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
        if (selectedType && selectedType !== 'All') params.fileType = selectedType;

        const res = await api.get('/resources', { params });
        if (res.data.success) {
          setResources(res.data.resources);
        }
      } catch (err) {
        console.error('Failed to load resources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [search, selectedCategory, selectedType]);

  const fileTypes = [
    { label: 'All Types', value: 'All' },
    { label: 'PDF Notes', value: 'pdf' },
    { label: 'Slide Decks', value: 'presentation' },
    { label: 'Code Starters', value: 'code' },
    { label: 'Exercises', value: 'exercise' },
    { label: 'E-Books', value: 'ebook' },
    { label: 'Study Guides', value: 'notes' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
          <BookOpen className="w-3.5 h-3.5" />
          Open Access Knowledge Repository
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Educational Resources Library
        </h1>
        <p className="text-sm text-slate-500">
          Download supplementary notes, code templates, cheat sheets, and practice sets.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes, templates, cheat sheets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 text-sm pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Type Select */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            {fileTypes.map((ft) => (
              <option key={ft.value} value={ft.value}>
                {ft.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resource Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse space-y-3">
              <div className="w-10 h-10 bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-8 bg-slate-100 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource) => (
            <ResourceCard key={resource._id} resource={resource} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No resources found"
          description="Try broadening your keywords or clearing category and file type filters."
          actionText="Clear Filters"
          onActionClick={() => {
            setSearch('');
            setSelectedCategory('All');
            setSelectedType('All');
          }}
        />
      )}
    </div>
  );
};
