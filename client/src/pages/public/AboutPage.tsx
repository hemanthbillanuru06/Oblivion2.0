import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Award, ShieldCheck, Users, Sparkles, BookOpen } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          About Oblivion Academy
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          We are building the world's most accessible, transparent, and rigorous marketplace for modern computing and software engineering skills.
        </p>
      </div>

      {/* Mission Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Open Access</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Free educational notes, exercises, and foundational courses accessible to students everywhere, regardless of geography or background.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Verifiable Rigor</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Progress is not a decorative claim. Every certificate is backed by persistent database lesson records and graded assessments.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Practitioner Led</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Courses are authored by staff engineers, researchers, and consultants with proven track records in real-world production environments.
          </p>
        </div>
      </div>
    </div>
  );
};
