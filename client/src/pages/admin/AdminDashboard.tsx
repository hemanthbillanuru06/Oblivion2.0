import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { StatCard } from '../../components/common/StatCard.js';
import {
  ShieldCheck,
  Users,
  BookOpen,
  DollarSign,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
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

  const stats = data?.stats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Platform Administration
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Executive Admin Console
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global metrics, user governance, course moderation, and security audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/users"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/audit-logs"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            Audit Logs
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Platform Users"
          value={stats?.totalUsers || 0}
          subtitle={`${stats?.totalStudents || 0} students, ${stats?.totalInstructors || 0} instructors`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Published Courses"
          value={stats?.totalCourses || 0}
          subtitle={`${stats?.pendingCourses || 0} pending review`}
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Total Enrollments"
          value={stats?.totalEnrollments || 0}
          subtitle="Course registrations"
          icon={Layers}
          color="emerald"
        />
        <StatCard
          title="Platform Revenue"
          value={`$${stats?.totalRevenue || 0}`}
          subtitle="Gross transaction volume"
          icon={DollarSign}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Registrations */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Recent User Registrations</h3>
            <Link to="/admin/users" className="text-xs text-blue-600 font-semibold hover:underline">
              View All ({stats?.totalUsers}) →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.recentUsers?.map((u: any) => (
              <div key={u._id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      u.profileImage ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=2563eb&color=fff`
                    }
                    alt={u.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-xs text-slate-900">{u.name}</p>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                    {u.role}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      u.accountStatus === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Security & Administrative Audit Logs</h3>
            <Link to="/admin/audit-logs" className="text-xs text-blue-600 font-semibold hover:underline">
              Full Audit Trail →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.recentAuditLogs && data.recentAuditLogs.length > 0 ? (
              data.recentAuditLogs.map((log: any) => (
                <div key={log._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-800 text-[11px]">
                      {log.action}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Target: {log.targetType} ({log.targetId ? log.targetId.slice(-6) : 'N/A'})
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No recent audit log events recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
