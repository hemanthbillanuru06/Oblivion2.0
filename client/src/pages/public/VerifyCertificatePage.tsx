import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { ShieldCheck, ShieldAlert, Search, Award, GraduationCap, CheckCircle2, Printer } from 'lucide-react';

export const VerifyCertificatePage: React.FC = () => {
  const { certificateId } = useParams<{ certificateId?: string }>();
  const navigate = useNavigate();

  const [inputCertId, setInputCertId] = useState(certificateId || '');
  const [certData, setCertData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const verifyCertificate = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError('');
    setCertData(null);

    try {
      const res = await api.get(`/certificates/verify/${encodeURIComponent(id.trim())}`);
      if (res.data.success && res.data.valid) {
        setCertData(res.data.certificate);
      } else {
        setError('This certificate ID is invalid or has been revoked.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Certificate verification failed. Record not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certificateId) {
      setInputCertId(certificateId);
      verifyCertificate(certificateId);
    }
  }, [certificateId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCertId.trim()) {
      navigate(`/certificates/verify/${encodeURIComponent(inputCertId.trim())}`);
      verifyCertificate(inputCertId.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Public Credential Verification Registry
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Verify Oblivion Certificates
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Enter a unique credential identifier to verify the authenticity and completion records of any student.
        </p>
      </div>

      {/* Verification Lookup Input */}
      <form
        onSubmit={handleSearch}
        className="max-w-xl mx-auto flex items-center bg-white p-2 rounded-2xl border border-slate-200 shadow-md"
      >
        <Search className="w-5 h-5 text-slate-400 ml-3" />
        <input
          type="text"
          placeholder="Enter Certificate ID (e.g. CERT-DEMO-2026-EMMA99)..."
          value={inputCertId}
          onChange={(e) => setInputCertId(e.target.value)}
          className="w-full px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all shrink-0 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Verify'}
        </button>
      </form>

      {/* Verification Result Card */}
      {certData && (
        <div className="bg-white rounded-3xl border-2 border-emerald-500/80 shadow-2xl overflow-hidden p-8 sm:p-12 relative animate-in fade-in duration-300">
          {/* Decorative Corner Ribbon */}
          <div className="absolute top-6 right-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Verified Authenticity
            </span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-extrabold text-xl text-slate-900">Oblivion Academy</h2>
              <p className="text-xs text-slate-400">Official Certificate of Course Completion</p>
            </div>
          </div>

          <div className="border-t border-b border-slate-100 py-8 my-6 text-center space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">This certifies that</p>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900">{certData.studentName}</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              has successfully fulfilled all curriculum and assessment requirements for
            </p>
            <h4 className="text-xl sm:text-2xl font-extrabold text-blue-600 max-w-2xl mx-auto">
              {certData.courseTitle}
            </h4>
            <div className="inline-block px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-lg mt-2">
              Grade Distinction: {certData.grade || 'Honors'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-500">
            <div>
              <p className="text-slate-400 font-semibold uppercase">Certificate ID</p>
              <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">{certData.certificateId}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase">Lead Instructor</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{certData.instructorName}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase">Date of Issue</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">
                {new Date(certData.issueDate).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-xl mx-auto bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-2">
          <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-rose-900">Certificate Not Found</h3>
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      )}
    </div>
  );
};
