import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <span className="text-7xl font-black text-slate-200">404</span>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-500 mt-2 max-w-sm">
        The page you are looking for doesn't exist or has been relocated.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
      >
        <Home className="w-4 h-4" />
        Return to Home
      </Link>
    </div>
  );
};

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
        Access Restricted
      </h1>
      <p className="text-sm text-slate-500 mt-2 max-w-md">
        You do not have the required role permissions to access this administrative area.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Safety
      </Link>
    </div>
  );
};
