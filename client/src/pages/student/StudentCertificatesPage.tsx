import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { ICertificate } from '../../types/index.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { Award, ShieldCheck, ExternalLink, Printer, Calendar } from 'lucide-react';

export const StudentCertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<ICertificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await api.get('/certificates/me');
        if (res.data.success) {
          setCertificates(res.data.certificates || []);
        }
      } catch (err) {
        console.error('Failed to load certificates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          My Earned Certificates
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Cryptographically authenticated credentials verifying your completed programs.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 animate-pulse space-y-4">
              <div className="h-6 bg-slate-200 rounded w-1/2" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert._id}
              className="bg-white rounded-3xl border-2 border-emerald-500/60 p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Verified Authenticity
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900">{cert.courseTitle}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Issued to <span className="font-semibold text-slate-800">{cert.studentName}</span>
                  </p>
                  <p className="text-xs text-slate-400">Instructor: {cert.instructorName}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-xs text-slate-600">
                  <span className="text-slate-400">ID: </span>
                  <span className="font-bold text-slate-900">{cert.certificateId}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(cert.issueDate).toLocaleDateString()}
                </span>

                <Link
                  to={`/certificates/verify/${cert.certificateId}`}
                  className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                >
                  Verify Publicly
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No certificates earned yet"
          description="Complete 100% of required lessons in any course to unlock your verified credential."
          actionText="View Enrolled Courses"
          actionLink="/student/my-courses"
        />
      )}
    </div>
  );
};
