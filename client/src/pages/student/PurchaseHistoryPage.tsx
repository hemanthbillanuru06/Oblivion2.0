import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { IPaymentTransaction } from '../../types/index.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { CreditCard, CheckCircle2, Calendar } from 'lucide-react';

export const PurchaseHistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<IPaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/payments/history');
        if (res.data.success) {
          setTransactions(res.data.transactions || []);
        }
      } catch (err) {
        console.error('Failed to load transaction history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Purchase & Billing History
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your course enrollment transactions and payment receipts.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : transactions.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <div key={tx._id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {tx.courseId?.title || 'Course Enrollment'}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Order: {tx.orderId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 justify-between sm:justify-end">
                  <div className="text-right">
                    <p className="font-black text-slate-900 text-base">
                      ${tx.amount} {tx.currency}
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 justify-end">
                      <Calendar className="w-3 h-3" />
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Paid
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No purchase records"
          description="You haven't made any paid course purchases yet. Free courses do not require payment transactions."
          actionText="Browse Marketplace"
          actionLink="/courses"
        />
      )}
    </div>
  );
};
