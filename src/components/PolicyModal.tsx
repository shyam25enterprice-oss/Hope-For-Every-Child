import {X} from 'lucide-react';
import type {SiteContent} from '../types';
import type {PolicyDocType} from './Footer';

interface PolicyModalProps {
  doc: PolicyDocType | null;
  siteContent: SiteContent;
  onClose: () => void;
}

export function PolicyModal({doc, siteContent, onClose}: PolicyModalProps) {
  if (!doc) {
    return null;
  }

  const titles: Record<PolicyDocType, string> = {
    privacy: 'Privacy Policy',
    refund: 'Donation Refund & Cancellation Policy',
    terms: 'Terms & Conditions',
    safeguarding: 'Child Safeguarding & Identity Protection Policy',
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between gap-4">
          <h2 id="policy-modal-title" className="font-display text-xl font-bold text-slate-900">
            {titles[doc]}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg cursor-pointer"
            aria-label="Close policy dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto text-sm text-slate-700 leading-relaxed space-y-4">
          {doc === 'privacy' && (
            <>
              <p>
                <strong>{siteContent.organizationName}</strong> respects the privacy of every donor,
                volunteer, and visitor. Personal information collected during donations (name,
                email, phone number, and optional PAN) is used strictly to verify payments, issue
                official receipts, and comply with statutory charitable accounting rules.
              </p>
              <p>
                We never sell, rent, or trade donor or volunteer contact records to third parties.
                Public donation transparency listings display only the donor&apos;s chosen display
                name, receipt reference, and amount—never donor email addresses, phone numbers, or
                PAN numbers.
              </p>
              <p>
                To request correction or deletion of personal contact records (subject to statutory
                audit retention laws), write to {siteContent.contactEmail}.
              </p>
            </>
          )}

          {doc === 'refund' && (
            <>
              <p>
                Charitable donations made to <strong>{siteContent.organizationName}</strong> are
                allocated promptly toward children&apos;s education, meals, clothing, medical aid,
                and shelter programs.
              </p>
              <p>
                If a donation was processed erroneously due to a duplicate charge, technical error,
                or an incorrect amount entered by mistake, please contact us within{' '}
                <strong>7 calendar days</strong> of the transaction with your receipt number (
                <span className="font-mono">HFEC-...</span>) at {siteContent.contactEmail}.
              </p>
              <p>
                Verified refund requests are reviewed by the Finance Administrator and, once
                approved, returned to the original payment source within 7–10 business days, and the
                receipt status is updated transparently in our ledger.
              </p>
            </>
          )}

          {doc === 'terms' && (
            <>
              <p>
                By accessing or contributing through {siteContent.organizationName}, you confirm that
                funds donated belong to you lawfully and are provided voluntarily for charitable
                child welfare purposes.
              </p>
              <p>
                All program descriptions, child profiles, and financial summaries are maintained by
                authorized administrators. While donors may select a preferred category (Education,
                Food, Clothes, Medical, or Shelter), urgent child medical or care emergencies may
                require reallocating unspent reserves across core child welfare needs, reflected
                openly in our published financial reports.
              </p>
            </>
          )}

          {doc === 'safeguarding' && (
            <>
              <p>
                Protecting the safety, privacy, and dignity of orphan and underprivileged children is
                our highest duty.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  No child&apos;s full legal name, residential street address, school name, or
                  sensitive medical history is ever published on this website.
                </li>
                <li>
                  Public profiles in &ldquo;Our Children&rdquo; use anonymized Care IDs, first-name
                  aliases, and representational classroom or care program photographs.
                </li>
                <li>
                  Volunteers must undergo identity verification and coordinate through supervised
                  staff before visiting any partner learning or residential care center.
                </li>
              </ul>
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
