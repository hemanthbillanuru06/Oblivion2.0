import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { IUser } from '../../types/index.js';
import { Search, ShieldAlert, CheckCircle2, UserX, UserCheck, Shield } from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search.trim()) params.q = search.trim();
      if (selectedRole !== 'All') params.role = selectedRole;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const res = await api.get('/admin/users', { params });
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, selectedRole, selectedStatus]);

  const handleToggleStatus = async (user: IUser) => {
    const newStatus = user.accountStatus === 'active' ? 'suspended' : 'active';
    const confirmMsg = `Are you sure you want to ${newStatus === 'active' ? 'reactivate' : 'suspend'} ${user.name}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await api.put(`/admin/users/${user._id || user.id}/status`, {
        status: newStatus,
      });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => ((u._id || u.id) === (user._id || user.id) ? { ...u, accountStatus: newStatus } : u))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleChangeRole = async (user: IUser, newRole: string) => {
    try {
      const res = await api.put(`/admin/users/${user._id || user.id}/role`, {
        role: newRole,
      });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => ((u._id || u.id) === (user._id || user.id) ? { ...u, role: newRole as any } : u))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          User & Role Governance
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Inspect registered accounts, assign administrative roles, and enforce account suspensions.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 text-sm pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Roles</option>
            <option value="student">Students</option>
            <option value="instructor">Instructors</option>
            <option value="admin">Administrators</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">
              <tr>
                <th className="py-3.5 px-6">User</th>
                <th className="py-3.5 px-6">Assigned Role</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isSuspended = u.accountStatus === 'suspended';
                return (
                  <tr key={u._id || u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.profileImage ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=2563eb&color=fff`
                          }
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u, e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 capitalize"
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                          isSuspended
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {u.accountStatus}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                          isSuspended
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                        }`}
                      >
                        {isSuspended ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            Reactivate
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            Suspend
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
