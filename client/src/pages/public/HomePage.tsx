import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { ICourse, IResource } from '../../types/index.js';
import { CourseCard } from '../../components/course/CourseCard.js';
import { ResourceCard } from '../../components/resource/ResourceCard.js';
import {
  Search,
  Sparkles,
  ArrowRight,
  BookOpen,
  Users,
  Award,
  ShieldCheck,
  CheckCircle2,
  Code,
  Cpu,
  BarChart2,
  Lock,
  Cloud,
  Layout,
  Star,
  GraduationCap,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredCourses, setFeaturedCourses] = useState<ICourse[]>([]);
  const [freeResources, setFreeResources] = useState<IResource[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalResources: 0,
    totalEnrollments: 0,
    satisfactionRate: 98,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, coursesRes, resourcesRes] = await Promise.all([
          api.get('/stats'),
          api.get('/courses?limit=4&sort=popular'),
          api.get('/resources?limit=4&sort=popular'),
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
        if (coursesRes.data.success) {
          setFeaturedCourses(coursesRes.data.courses);
        }
        if (resourcesRes.data.success) {
          setFreeResources(resourcesRes.data.resources);
        }
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/courses');
    }
  };

  const categories = [
    { name: 'Web Development', icon: Code, desc: 'React, Node.js, TypeScript, Next.js', count: '12+ Courses' },
    { name: 'AI & Machine Learning', icon: Cpu, desc: 'LLMs, PyTorch, Transformers, Vision', count: '8+ Courses' },
    { name: 'Data Science', icon: BarChart2, desc: 'Python, Pandas, SQL, Visualization', count: '6+ Courses' },
    { name: 'Cybersecurity', icon: Lock, desc: 'Ethical Hacking, OWASP, Defense', count: '5+ Courses' },
    { name: 'Cloud Computing', icon: Cloud, desc: 'AWS, Docker, Kubernetes, CI/CD', count: '7+ Courses' },
    { name: 'Design & UX', icon: Layout, desc: 'Figma, Design Systems, UX Research', count: '6+ Courses' },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-blue-50/70 via-white to-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-blue-400/10 via-indigo-400/10 to-purple-400/10 blur-3xl -z-10 rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/70 border border-blue-200/80 text-blue-700 text-xs font-bold mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Verified Educational Marketplace & Resource Hub
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Learn New Skills.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Unlock Your Potential.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover peer-reviewed courses, downloadable notes, code architectures, and verified credentials crafted by industry leaders.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleHeroSearch}
            className="mt-10 max-w-2xl mx-auto relative flex items-center bg-white p-2 rounded-2xl shadow-xl shadow-blue-500/5 border border-slate-200"
          >
            <Search className="w-5 h-5 text-slate-400 ml-3" />
            <input
              type="text"
              placeholder="What do you want to learn today? (e.g. React 19, PyTorch, OWASP)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition-all shrink-0"
            >
              Explore
            </button>
          </form>

          {/* Quick CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/courses"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              Explore Courses
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/resources"
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold rounded-xl border border-slate-200 shadow-sm transition-all"
            >
              Free Resources Library
            </Link>
          </div>

          {/* Real Platform Stats (DB-Driven) */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-200/60">
            <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
              <span className="text-3xl font-black text-slate-900">{stats.totalCourses}+</span>
              <p className="text-xs font-medium text-slate-500 mt-1">Published Courses</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
              <span className="text-3xl font-black text-slate-900">{stats.totalResources}+</span>
              <p className="text-xs font-medium text-slate-500 mt-1">Learning Resources</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
              <span className="text-3xl font-black text-slate-900">{stats.totalEnrollments}+</span>
              <p className="text-xs font-medium text-slate-500 mt-1">Course Enrollments</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
              <span className="text-3xl font-black text-slate-900">{stats.satisfactionRate}%</span>
              <p className="text-xs font-medium text-slate-500 mt-1">Positive Reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Top Academic Categories
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Explore in-demand tech specializations and foundational roadmaps.
            </p>
          </div>
          <Link
            to="/courses"
            className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-4 md:mt-0"
          >
            All Categories →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={idx}
                to={`/courses?category=${encodeURIComponent(cat.name)}`}
                className="group p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{cat.desc}</p>
                  <span className="inline-block mt-3 text-[11px] font-semibold text-blue-600">
                    {cat.count}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Courses Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Highest Rated
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Courses
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Top curated programs designed to take you from foundational basics to mastery.
            </p>
          </div>
          <Link
            to="/courses"
            className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-4 md:mt-0"
          >
            Browse Marketplace →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCourses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      </section>

      {/* Free Educational Resources Highlight */}
      <section className="bg-slate-50 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                100% Free Downloads
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                Curated Educational Resources
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Supplementary study notes, cheat sheets, code starters, and practice problem sets.
              </p>
            </div>
            <Link
              to="/resources"
              className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-4 md:mt-0"
            >
              View Full Library ({stats.totalResources} Items) →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {freeResources.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How Oblivion Works
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            A frictionless learning ecosystem engineered for maximum student retention and career impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center relative group hover:border-blue-400 transition-colors shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 font-black text-xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              1
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Explore & Enroll</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Browse hundreds of free and premium courses across modern software disciplines. Enroll with one click or seamless checkout.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center relative group hover:border-blue-400 transition-colors shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 font-black text-xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              2
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Learn at Your Pace</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Watch video lectures, read supplementary guides, complete interactive quizzes, and track your verified progress down to the minute.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center relative group hover:border-blue-400 transition-colors shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 font-black text-xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              3
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Earn Verified Credentials</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Pass course requirements to earn tamper-proof, publicly verifiable completion certificates shareable on LinkedIn and portfolios.
            </p>
          </div>
        </div>
      </section>

      {/* Verified Certificate Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Cryptographically Verifiable Credentials
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Prove Your Skills with Public Verification
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Every certificate issued through Oblivion includes a permanent verification ID. Employers and clients can instantly verify credential validity without signing in.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/certificates/verify"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg transition-all"
              >
                Try Certificate Verification
              </Link>
              <Link
                to="/certificates/verify/CERT-DEMO-2026-EMMA99"
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-all"
              >
                View Live Demo Certificate
              </Link>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-full max-w-sm text-left shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-blue-400" />
                <span className="font-bold text-sm tracking-wide">Oblivion Academy</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-400 uppercase">Awarded To</p>
            <p className="font-extrabold text-base text-white">Emma Watson</p>
            <p className="text-xs text-blue-200 mt-2 font-medium">Modern Full-Stack Mastery: React 19 & Node</p>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
              <span>ID: CERT-DEMO-2026-EMMA99</span>
              <span>100% Completed</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
