import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-6 text-slate-700">
      <h1 className="text-3xl font-extrabold text-slate-900">Terms of Service</h1>
      <p className="text-sm text-slate-500">Effective Date: October 2026</p>
      <div className="space-y-4 text-sm leading-relaxed border-t border-slate-200 pt-6">
        <h2 className="text-lg font-bold text-slate-900">1. Educational Marketplace Usage</h2>
        <p>By using the Oblivion platform, students and instructors agree to maintain academic integrity, adhere to copyright regulations, and respect community standards.</p>
        <h2 className="text-lg font-bold text-slate-900">2. Certificates and Entitlements</h2>
        <p>Certificates of completion are issued strictly upon genuine completion of required curriculum modules and satisfaction of any required passing assessment criteria.</p>
        <h2 className="text-lg font-bold text-slate-900">3. Instructor Publishing Rights</h2>
        <p>Instructors retain copyright to their learning materials and grant Oblivion a non-exclusive license to distribute and display submitted course content to enrolled students.</p>
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-6 text-slate-700">
      <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
      <p className="text-sm text-slate-500">Effective Date: October 2026</p>
      <div className="space-y-4 text-sm leading-relaxed border-t border-slate-200 pt-6">
        <h2 className="text-lg font-bold text-slate-900">1. Data Collection & Security</h2>
        <p>Oblivion secures student passwords via irreversible bcrypt hashes, encrypts all communication over TLS, and maintains isolated role-based permission boundaries.</p>
        <h2 className="text-lg font-bold text-slate-900">2. Learning Analytics & Progress Records</h2>
        <p>We store persistent lesson progress records solely to power your personalized student dashboard, resume learning position, and authenticate completion certificates.</p>
      </div>
    </div>
  );
};
