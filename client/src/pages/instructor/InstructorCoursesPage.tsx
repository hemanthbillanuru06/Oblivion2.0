import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { ICourse } from '../../types/index.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { Plus, Edit, Eye, Users, Star, Layers, CheckCircle2, Clock } from 'lucide-react';

export const InstructorCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/instructor/courses');
        if (res.data.success) {
          setCourses(res.data.courses || []);
        }
      } catch (err) {
        console.error('Failed to load instructor courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Authored Courses
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage course curriculum, modules, lessons, and publishing states.
          </p>
        </div>

        <Link
          to="/instructor/courses/create"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          Create Course
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-all p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                    {course.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      course.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {course.status}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 line-clamp-2">
                  {course.title}
                </h3>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {course.totalEnrolled || 0} students
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {course.averageRating ? course.averageRating.toFixed(1) : '5.0'}
                  </span>
                  <span className="font-bold text-slate-900">
                    {course.isFree ? 'Free' : `$${course.price}`}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link
                  to={`/courses/${course.slug || course._id}`}
                  className="font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </Link>

                <Link
                  to={`/learning/${course._id}`}
                  className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Layers className="w-3.5 h-3.5" />
                  View Studio
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No courses created yet"
          description="Create your first course to begin building modules, lessons, quizzes, and resources."
          actionText="Create Course Now"
          actionLink="/instructor/courses/create"
        />
      )}
    </div>
  );
};
