import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { ProgressBar } from '../../components/common/ProgressBar.js';
import { Users, Mail, Calendar, CheckCircle2 } from 'lucide-react';

export const StudentManagementPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/instructor/students');
        if (res.data.success) {
          setStudents(res.data.students || []);
        }
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Student Progress Roster
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor individual student engagement, completion milestones, and lesson progress.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : students.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">
                <tr>
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6">Course</th>
                  <th className="py-3.5 px-6">Lessons Completed</th>
                  <th className="py-3.5 px-6">Progress %</th>
                  <th className="py-3.5 px-6">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            st.studentId?.profileImage ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(st.studentId?.name || 'Student')}&background=2563eb&color=fff`
                          }
                          alt={st.studentId?.name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{st.studentId?.name}</p>
                          <p className="text-xs text-slate-400">{st.studentId?.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-medium text-slate-800">
                      {st.courseId?.title}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600 font-semibold">
                      {st.completedLessonsCount} / {st.totalLessonsCount}
                    </td>

                    <td className="py-4 px-6">
                      <div className="w-36">
                        <ProgressBar
                          percentage={st.progressPercentage}
                          size="sm"
                          showLabel={true}
                          color={st.isCompleted ? 'emerald' : 'blue'}
                        />
                      </div>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-400">
                      {new Date(st.lastAccessedAt || st.enrollmentDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No enrolled students yet"
          description="When students join your courses, you will be able to inspect their completion records here."
        />
      )}
    </div>
  );
};
