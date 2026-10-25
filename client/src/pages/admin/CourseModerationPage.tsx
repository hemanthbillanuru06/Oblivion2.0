import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { ICourse } from '../../types/index.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { Check, X, Eye, BookOpen, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CourseModerationPage: React.FC = () => {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses?limit=50&sort=newest');
      if (res.data.success) {
        setCourses(res.data.courses || []);
      }
    } catch (err) {
      console.error('Failed to load courses for moderation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleModerate = async (courseId: string, action: 'approve' | 'reject') => {
    try {
      const res = await api.post(`/admin/courses/${courseId}/moderate`, { action });
      if (res.data.success) {
        fetchCourses();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Moderation failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Course Moderation & Publishing Review
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review curriculum quality, learning objectives, and enforce marketplace publishing standards.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {courses.map((course) => (
              <div key={course._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                      {course.category}
                    </span>
                    <span className="text-xs text-slate-400">• {course.difficulty}</span>
                    <span className="text-xs font-bold text-slate-700">
                      {course.isFree ? 'Free' : `$${course.price}`}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{course.title}</h3>
                  <p className="text-xs text-slate-500">
                    Instructor: <span className="font-semibold text-slate-700">{course.instructor?.name}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to={`/courses/${course.slug || course._id}`}
                    target="_blank"
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect
                  </Link>

                  <button
                    onClick={() => handleModerate(course._id, 'approve')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>

                  <button
                    onClick={() => handleModerate(course._id, 'reject')}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState title="No courses to moderate" description="All submitted courses have been reviewed." />
      )}
    </div>
  );
};
