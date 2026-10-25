import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { ShieldCheck, Calendar, Clock, Terminal } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/admin/audit-logs');
        if (res.data.success) {
          setLogs(res.data.logs || []);
        }
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          System Security & Audit Trail
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Cryptographically recorded log of privileged administrative operations, role modifications, and moderation decisions.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">
                <tr>
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Action</th>
                  <th className="py-3.5 px-6">Actor</th>
                  <th className="py-3.5 px-6">Target Entity</th>
                  <th className="py-3.5 px-6">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 font-bold text-blue-600 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-4 px-6 text-slate-800">
                      {log.actorEmail || 'System'}
                      {log.actorRole && (
                        <span className="ml-1 text-[10px] text-slate-400 font-sans uppercase">
                          ({log.actorRole})
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      {log.targetType}
                      {log.targetId && (
                        <span className="text-slate-400 text-[11px] ml-1">
                          #{log.targetId.slice(-6)}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-[11px] max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            No audit log entries recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};
