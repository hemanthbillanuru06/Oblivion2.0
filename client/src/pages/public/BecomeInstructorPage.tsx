import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { Layers, CheckCircle2, Sparkles, Send } from 'lucide-react';

export const BecomeInstructorPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/apply-instructor', { headline, bio, reason });
      if (res.data.success) {
        setSubmitted(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Join Our Teaching Faculty
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Teach What You Love. Inspire the World.
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
          Share your domain expertise, upload courses and educational resources, mentor students, and earn revenue.
        </p>
      </div>

      {submitted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-xl font-bold text-emerald-900">Application Submitted!</h3>
          <p className="text-sm text-emerald-700">
            Thank you for applying. Platform administrators review all instructor credentials within 24–48 hours. You will receive an in-app notification once approved.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Professional Headline / Specialization
            </label>
            <input
              type="text"
              required
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Senior Machine Learning Engineer at Anthropic"
              className="w-full bg-slate-50 text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Instructor Biography & Experience
            </label>
            <textarea
              required
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell our review committee about your background, projects, publications, or industry experience..."
              className="w-full bg-slate-50 text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              What courses or topics do you plan to teach?
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="List tentative topics, course outlines, or supplementary resources you wish to publish..."
              className="w-full bg-slate-50 text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Submitting Application...' : 'Submit Instructor Application'}
          </button>
        </form>
      )}
    </div>
  );
};
