import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { StatCard } from '../../components/common/StatCard.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import {
  Layers,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  BookOpen,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

export const InstructorDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/instructor/dashboard');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Failed to load instructor dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-8">
        <div className="h-10 bg-slate-200 rounded w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 mb-2">
            <Layers className="w-3.5 h-3.5" />
            Instructor Studio
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Instructor Performance Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor course enrollment numbers, completion ratios, and gross revenue.
          </p>
        </div>

        <Link
          to="/instructor/courses/create"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          Create New Course
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Courses"
          value={stats?.totalCourses || 0}
          subtitle={`${stats?.publishedCourses || 0} published`}
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Total Students"
          value={stats?.totalEnrollments || 0}
          subtitle="Enrolled learners"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Completion Rate"
          value={`${stats?.completionRate || 0}%`}
          subtitle="Finished requirements"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Gross Revenue"
          value={`$${stats?.totalRevenue || 0}`}
          subtitle="Verified payments"
          icon={DollarSign}
          color="amber"
        />
      </div>

      {/* Recent Student Enrollments Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Student Enrollments</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live progress updates calculated from student lesson completion records.
            </p>
          </div>
          <Link
            to="/instructor/students"
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            View All Students →
          </Link>
        </div>

        {stats?.recentEnrollments && stats.recentEnrollments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 rounded-xl">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentEnrollments.map((enr: any) => (
                  <tr key={enr._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {enr.studentId?.name || 'Student'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {enr.courseId?.title || 'Course'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${enr.progressPercentage || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                          {enr.progressPercentage || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          enr.isCompleted
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {enr.isCompleted ? 'Completed' : 'Learning'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {new Date(enr.enrollmentDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No enrollments recorded yet"
            description="When students enroll in your courses, their learning progress will appear here in real time."
          />
        )}
      </div>
    </div>
  );
};
