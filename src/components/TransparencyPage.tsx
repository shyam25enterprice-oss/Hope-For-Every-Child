import {Download, FileSpreadsheet, ShieldCheck} from 'lucide-react';
import type {PublicBootstrapPayload} from '../types';
import {CATEGORY_META, formatDate, formatINR} from '../utils/format';
import type {ActivePage} from './Navbar';

interface TransparencyPageProps {
  data: PublicBootstrapPayload;
  onNavigate: (page: ActivePage) => void;
}

export function TransparencyPage({data, onNavigate}: TransparencyPageProps) {
  const {transparency} = data;

  const handleExportLedgerCSV = () => {
    const headers = ['Date', 'Category', 'Title', 'Payee / Beneficiary', 'Reference', 'Amount (INR)'];
    const rows = transparency.expenses.map((exp) => [
      exp.date,
      CATEGORY_META[exp.category].label,
      `"${exp.title.replace(/"/g, '""')}"`,
      `"${exp.vendorOrBeneficiary.replace(/"/g, '""')}"`,
      exp.referenceNumber,
      String(exp.amount),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hope-for-every-child-expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-50/50 min-h-screen py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold text-sky-700 mb-2">
              Donation Transparency &amp; Public Ledger
            </p>
            <h1
              className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900"
              style={{textWrap: 'balance'}}
            >
              Every rupee received and spent, accounted for openly
            </h1>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Every figure below is computed directly from verified online/bank donations and logged
              expenditures. We never display estimated or fabricated numbers.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('donate')}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Make a Verified Donation
          </button>
        </div>

        {/* 4 Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <p className="text-xs font-medium text-slate-500">Total Donations Received</p>
            <p className="mt-2 font-display text-3xl font-bold text-slate-900 tabular-nums">
              {formatINR(transparency.totalDonationsReceived)}
            </p>
            <p className="mt-1.5 text-xs text-slate-500 tabular-nums">
              Across {transparency.totalDonationCount} verified donation(s)
              {transparency.pendingVerificationCount > 0 && (
                <span className="block text-sky-700 mt-0.5">
                  + {formatINR(transparency.pendingVerificationAmount)} ({transparency.pendingVerificationCount} pending UPI UTR check)
                </span>
              )}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <p className="text-xs font-medium text-slate-500">Total Amount Spent</p>
            <p className="mt-2 font-display text-3xl font-bold text-slate-900 tabular-nums">
              {formatINR(transparency.totalAmountSpent)}
            </p>
            <p className="mt-1.5 text-xs text-slate-500 tabular-nums">
              Across {transparency.expenses.length} logged expense(s)
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <p className="text-xs font-medium text-slate-500">Available Care Balance</p>
            <p className="mt-2 font-display text-3xl font-bold text-sky-700 tabular-nums">
              {formatINR(transparency.availableBalance)}
            </p>
            <p className="mt-1.5 text-xs text-slate-500">Reserved for active child programs</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <p className="text-xs font-medium text-slate-500">Children Helped</p>
            <p className="mt-2 font-display text-3xl font-bold text-orange-600 tabular-nums">
              {transparency.childrenHelpedCount}
            </p>
            <p className="mt-1.5 text-xs text-slate-500">
              Verified profiles &amp; published reports
            </p>
          </div>
        </div>

        {/* Category-wise Allocation Breakdown */}
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Program-Wise Fund Allocation
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Live breakdown of verified donations received vs. recorded disbursements by category.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700">
              <ShieldCheck className="w-4 h-4" />
              <span>Real-time server ledger</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="py-3.5 px-6">Program Category</th>
                  <th className="py-3.5 px-6 text-right">Received</th>
                  <th className="py-3.5 px-6 text-right">Spent</th>
                  <th className="py-3.5 px-6 text-right">Net Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transparency.categoryBreakdown.map((row) => {
                  const net = Math.max(0, row.received - row.spent);
                  return (
                    <tr key={row.category} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-6 font-medium text-slate-900">{row.label}</td>
                      <td className="py-3.5 px-6 text-right font-mono tabular-nums text-slate-800">
                        {formatINR(row.received)}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono tabular-nums text-slate-800">
                        {formatINR(row.spent)}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono tabular-nums font-semibold text-sky-700">
                        {formatINR(net)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Itemized Expenditure Ledger */}
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Itemized Expenditure Ledger
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Individual expenses recorded by the Trust Finance team with invoice/voucher references.
              </p>
            </div>
            {transparency.expenses.length > 0 && (
              <button
                type="button"
                onClick={handleExportLedgerCSV}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                Download Ledger CSV
              </button>
            )}
          </div>

          {transparency.expenses.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-600">
              No expenditure entries have been logged yet. Once program disbursements are recorded
              by the Admin, every voucher and amount will appear here automatically.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="py-3 px-6">Date</th>
                    <th className="py-3 px-6">Category</th>
                    <th className="py-3 px-6">Purpose / Description</th>
                    <th className="py-3 px-6">Vendor / Beneficiary</th>
                    <th className="py-3 px-6">Ref. No.</th>
                    <th className="py-3 px-6 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transparency.expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-6 whitespace-nowrap text-slate-600 font-mono text-xs">
                        {formatDate(exp.date)}
                      </td>
                      <td className="py-3.5 px-6 text-xs font-semibold text-sky-700">
                        {CATEGORY_META[exp.category].shortLabel}
                      </td>
                      <td className="py-3.5 px-6 text-slate-900 font-medium">{exp.title}</td>
                      <td className="py-3.5 px-6 text-slate-600">{exp.vendorOrBeneficiary}</td>
                      <td className="py-3.5 px-6 font-mono text-xs text-slate-500">
                        {exp.referenceNumber}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {formatINR(exp.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Financial Reports & Recent Verified Donations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-sky-700" />
              <h2 className="font-display text-lg font-bold text-slate-900">
                Regular Financial Reports
              </h2>
            </div>

            {transparency.reports.length === 0 ? (
              <p className="text-sm text-slate-600 py-4">
                No periodic financial reports published yet. Monthly and quarterly summaries
                published by the Trust Finance Committee will be listed here.
              </p>
            ) : (
              <div className="space-y-4">
                {transparency.reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-sm font-bold text-slate-900">
                        {rep.periodLabel}
                      </h3>
                      <span className="text-xs text-slate-500">
                        Published {formatDate(rep.publishedDate)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{rep.summaryNotes}</p>
                    <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-4 text-xs font-mono tabular-nums text-slate-700">
                      <span>Received: {formatINR(rep.totalReceivedInPeriod)}</span>
                      <span>Spent: {formatINR(rep.totalSpentInPeriod)}</span>
                      <span>Children: {rep.childrenSupportedCount}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Prepared / Audited by: {rep.auditorOrPreparer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Recent Verified Donations
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Live feed of verified receipts issued by Hope For Every Child.
              </p>
            </div>

            {transparency.recentVerifiedDonations.length === 0 ? (
              <div className="py-6 text-sm text-slate-600 space-y-3">
                <p>
                  No verified donations have been recorded yet. Be the first supporter to initiate
                  a transparent contribution.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('donate')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl cursor-pointer"
                >
                  Donate Now (Starts at ₹100)
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {transparency.recentVerifiedDonations.map((don) => (
                  <div key={don.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{don.donorDisplayName}</p>
                      <p className="text-xs text-slate-500">
                        {don.campaignTitle} · {formatDate(don.createdAt)} ·{' '}
                        <span className="font-mono">{don.receiptNumber}</span>
                      </p>
                    </div>
                    <p className="font-mono text-sm font-bold text-sky-700 tabular-nums shrink-0">
                      {formatINR(don.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
