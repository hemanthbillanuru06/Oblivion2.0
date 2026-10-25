import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  GraduationCap,
  BookOpen,
  Search,
  User,
  LogOut,
  LayoutDashboard,
  Award,
  Layers,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isInstructor, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                Oblivion<span className="text-blue-600">.</span>
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 -mt-1">
                Course Marketplace
              </span>
            </div>
          </Link>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search courses, skills, resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white text-sm text-slate-900 pl-10 pr-4 py-2 rounded-full border border-transparent focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </form>

          {/* Public Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/courses" className="hover:text-blue-600 transition-colors">
              Explore Courses
            </Link>
            <Link to="/resources" className="hover:text-blue-600 transition-colors">
              Resources Library
            </Link>
            <Link to="/certificates/verify" className="hover:text-blue-600 transition-colors flex items-center gap-1.5 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verify Certificate
            </Link>
            {!isInstructor && !isAdmin && (
              <Link to="/become-instructor" className="hover:text-blue-600 transition-colors text-slate-500">
                Become an Instructor
              </Link>
            )}
          </nav>

          {/* Right Action / Auth Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  <img
                    src={
                      user.profileImage ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`
                    }
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-300"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-900 leading-tight">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] font-medium uppercase text-blue-600 capitalize">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    {/* Role-Specific Dashboards */}
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        Admin Dashboard
                      </Link>
                    )}

                    {isInstructor && (
                      <Link
                        to="/instructor/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                      >
                        <Layers className="w-4 h-4 text-indigo-600" />
                        Instructor Studio
                      </Link>
                    )}

                    <Link
                      to="/student/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-600" />
                      Student Dashboard
                    </Link>

                    <Link
                      to="/student/my-courses"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                    >
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      My Learning
                    </Link>

                    <Link
                      to="/student/certificates"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                    >
                      <Award className="w-4 h-4 text-amber-500" />
                      My Certificates
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      Account Settings
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-3.5 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-sm shadow-blue-500/20 hover:shadow transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 text-sm pl-9 pr-3 py-2 rounded-lg"
              />
            </div>
          </form>

          <Link
            to="/courses"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 font-medium py-1.5"
          >
            Explore Courses
          </Link>
          <Link
            to="/resources"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 font-medium py-1.5"
          >
            Educational Resources
          </Link>
          <Link
            to="/certificates/verify"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 font-medium py-1.5"
          >
            Verify Certificate
          </Link>

          {isAuthenticated && user ? (
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <Link
                to="/student/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-blue-600 font-medium py-1"
              >
                Student Dashboard
              </Link>
              {isInstructor && (
                <Link
                  to="/instructor/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-indigo-600 font-medium py-1"
                >
                  Instructor Studio
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-purple-600 font-medium py-1"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="block text-red-600 font-medium py-1 text-left w-full"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-slate-700 font-semibold border border-slate-200 rounded-lg"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
