import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { IEnrollment } from '../../types/index.js';
import { ProgressBar } from '../../components/common/ProgressBar.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { Play, CheckCircle2, Clock, BookOpen } from 'lucide-react';

export const MyCoursesPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<IEnrollment[]>([]);
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/enrollments/me');
        if (res.data.success) {
          setEnrollments(res.data.enrollments || []);
        }
      } catch (err) {
        console.error('Failed to load enrolled courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredEnrollments = enrollments.filter((e) => {
    if (filter === 'in-progress') return !e.isCompleted && e.progressPercentage < 100;
    if (filter === 'completed') return e.isCompleted || e.progressPercentage >= 100;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Enrolled Courses
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track real progress records across your enrolled programs.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({enrollments.length})
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'in-progress'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Progress ({enrollments.filter((e) => !e.isCompleted && e.progressPercentage < 100).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'completed'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({enrollments.filter((e) => e.isCompleted || e.progressPercentage >= 100).length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
              <div className="aspect-video bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredEnrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map((enrollment) => {
            const course = enrollment.courseId;
            if (!course) return null;
            const isFinished = enrollment.isCompleted || enrollment.progressPercentage >= 100;

            return (
              <div
                key={enrollment._id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    <img
                      src={
                        course.thumbnail ||
                        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'
                      }
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/95 backdrop-blur-sm text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                        {course.category}
                      </span>
                    </div>
                    {isFinished && (
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-base text-slate-900 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Instructor: <span className="text-slate-700 font-medium">{course.instructor?.name || 'Faculty'}</span>
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-4">
                  <ProgressBar
                    percentage={enrollment.progressPercentage}
                    completedLessons={enrollment.completedLessonsCount}
                    totalLessons={enrollment.totalLessonsCount}
                    size="sm"
                    color={isFinished ? 'emerald' : 'blue'}
                  />

                  <Link
                    to={`/learning/${course._id}`}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      isFinished
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {isFinished ? 'Review Lessons' : 'Continue Learning'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No courses found in this tab"
          description="You don't have any courses matching the selected filter."
          actionText="Explore Marketplace"
          actionLink="/courses"
        />
      )}
    </div>
  );
};
