import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { IEnrollment, ICourse } from '../../types/index.js';
import { StatCard } from '../../components/common/StatCard.js';
import { ProgressBar } from '../../components/common/ProgressBar.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  Play,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<IEnrollment[]>([]);
  const [certificatesCount, setCertificatesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [enrollRes, certsRes] = await Promise.all([
          api.get('/enrollments/me'),
          api.get('/certificates/me'),
        ]);

        if (enrollRes.data.success) {
          setEnrollments(enrollRes.data.enrollments || []);
        }
        if (certsRes.data.success) {
          setCertificatesCount(certsRes.data.certificates?.length || 0);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalEnrolled = enrollments.length;
  const completedCourses = enrollments.filter((e) => e.isCompleted || e.progressPercentage >= 100);
  const inProgressCourses = enrollments.filter((e) => !e.isCompleted && e.progressPercentage < 100);

  const avgProgress =
    totalEnrolled > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progressPercentage, 0) / totalEnrolled)
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Student Workspace
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-blue-100 text-sm">
            {inProgressCourses.length > 0
              ? `You have ${inProgressCourses.length} active course${inProgressCourses.length > 1 ? 's' : ''} in progress. Keep up the great momentum!`
              : 'Explore new courses or revisit your completed learning milestones.'}
          </p>
        </div>

        <div className="z-10 flex gap-3">
          <Link
            to="/courses"
            className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm rounded-xl shadow-md transition-all shrink-0"
          >
            Explore Courses
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Enrolled Courses"
          value={totalEnrolled}
          subtitle="Lifetime enrolled"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="In Progress"
          value={inProgressCourses.length}
          subtitle="Currently active"
          icon={Clock}
          color="indigo"
        />
        <StatCard
          title="Completed"
          value={completedCourses.length}
          subtitle="100% finished"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Certificates Earned"
          value={certificatesCount}
          subtitle="Verified credentials"
          icon={Award}
          color="amber"
        />
      </div>

      {/* Continue Learning Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Continue Learning
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Pick up exactly where you left off.
            </p>
          </div>
          <Link
            to="/student/my-courses"
            className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All ({totalEnrolled}) →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-2 bg-slate-100 rounded w-full" />
                <div className="h-8 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.slice(0, 6).map((enrollment) => {
              const course = enrollment.courseId;
              if (!course) return null;
              return (
                <div
                  key={enrollment._id}
                  className="bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-600 uppercase tracking-wider">
                        {course.category}
                      </span>
                      <span className="text-slate-400">
                        {enrollment.completedLessonsCount} / {enrollment.totalLessonsCount} lessons
                      </span>
                    </div>

                    <Link to={`/learning/${course._id}`}>
                      <h3 className="font-bold text-base text-slate-900 hover:text-blue-600 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                    </Link>

                    {enrollment.lastAccessedLesson && (
                      <p className="text-xs text-slate-500 line-clamp-1">
                        Up next: <span className="text-slate-700 font-medium">{enrollment.lastAccessedLesson.title}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                    <ProgressBar
                      percentage={enrollment.progressPercentage}
                      completedLessons={enrollment.completedLessonsCount}
                      totalLessons={enrollment.totalLessonsCount}
                      size="sm"
                    />

                    <Link
                      to={`/learning/${course._id}`}
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      {enrollment.progressPercentage >= 100 ? 'Review Course' : 'Resume Learning'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No enrollments yet"
            description="You haven't enrolled in any courses yet. Explore our curated catalog of free and master programs."
            actionText="Browse Courses"
            actionLink="/courses"
          />
        )}
      </div>
    </div>
  );
};
