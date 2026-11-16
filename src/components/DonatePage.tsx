import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Lock,
  Printer,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import QRCode from 'qrcode';
import {type FormEvent, useEffect, useState} from 'react';
import type {Campaign, DonationRecord, PublicBootstrapPayload} from '../types';
import {CATEGORY_META, formatDate, formatINR} from '../utils/format';
import {SafeImage} from './SafeImage';

interface DonatePageProps {
  data: PublicBootstrapPayload;
  preselectedCampaignId?: string;
  onDonationComplete: () => Promise<void>;
}

const PRESET_AMOUNTS = [100, 500, 1000, 2000];

interface CheckoutOrderState {
  orderId: string;
  amount: number;
  paymentMode: 'live-razorpay' | 'direct-upi';
  razorpayKeyId?: string;
  upiId: string;
  upiPayeeName: string;
  upiDeepLink: string;
  verificationToken: string;
}

export function DonatePage({data, preselectedCampaignId, onDonationComplete}: DonatePageProps) {
  const activeCampaigns = data.campaigns;
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    preselectedCampaignId || activeCampaigns[0]?.id || ''
  );
  const [amount, setAmount] = useState<number>(500);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [panNumber, setPanNumber] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // UPI Payment Checkout Modal State
  const [checkoutOrder, setCheckoutOrder] = useState<CheckoutOrderState | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string>('');

  // Completed Receipt State
  const [receipt, setReceipt] = useState<DonationRecord | null>(null);

  // Receipt Lookup State
  const [lookupQuery, setLookupQuery] = useState<string>('');
  const [lookupResult, setLookupResult] = useState<Partial<DonationRecord> | null>(null);
  const [lookupError, setLookupError] = useState<string>('');

  useEffect(() => {
    if (preselectedCampaignId) {
      setSelectedCampaignId(preselectedCampaignId);
    }
  }, [preselectedCampaignId]);

  useEffect(() => {
    let cancelled = false;
    if (!checkoutOrder?.upiDeepLink) {
      setQrDataUrl('');
      return;
    }
    QRCode.toDataURL(checkoutOrder.upiDeepLink, {
      width: 240,
      margin: 2,
      color: {dark: '#0f172a', light: '#ffffff'},
    })
      .then((url) => {
        if (!cancelled) {
          setQrDataUrl(url);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrDataUrl('');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [checkoutOrder]);

  const selectedCampaign: Campaign | undefined =
    activeCampaigns.find((c) => c.id === selectedCampaignId) || activeCampaigns[0];

  const effectiveAmount = isCustom ? Number(customInput || 0) : amount;

  const handleSelectPreset = (val: number) => {
    setIsCustom(false);
    setAmount(val);
    setErrorMsg('');
  };

  const handleCopyUpi = async (upiId: string) => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    } catch {
      setCopiedUpi(false);
    }
  };

  const handleStartPayment = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setModalError('');

    if (!Number.isFinite(effectiveAmount) || effectiveAmount < 100) {
      setErrorMsg('Minimum donation amount is ₹100.');
      return;
    }
    if (donorName.trim().length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!selectedCampaign) {
      setErrorMsg('Please select a donation category.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          amount: effectiveAmount,
          donorName: donorName.trim(),
          donorEmail: donorEmail.trim(),
          donorPhone: '',
          panNumber: panNumber.trim(),
          campaignId: selectedCampaign.id,
        }),
      });
      const json = (await res.json()) as CheckoutOrderState & {error?: string};
      if (!res.ok) {
        throw new Error(json.error || 'Could not start payment checkout.');
      }

      if (json.paymentMode === 'live-razorpay' && json.razorpayKeyId) {
        const win = window as unknown as {
          Razorpay?: new (opts: Record<string, unknown>) => {open: () => void};
        };
        if (win.Razorpay) {
          const rz = new win.Razorpay({
            key: json.razorpayKeyId,
            amount: json.amount * 100,
            currency: 'INR',
            name: data.siteContent.organizationName,
            description: selectedCampaign.title,
            order_id: json.orderId,
            prefill: {
              name: donorName.trim(),
              email: donorEmail.trim(),
            },
            handler: async (resp: {
              razorpay_payment_id: string;
              razorpay_signature: string;
            }) => {
              await completeVerification(
                json.orderId,
                json.verificationToken,
                '',
                resp.razorpay_payment_id,
                resp.razorpay_signature
              );
            },
          });
          rz.open();
          return;
        }
      }

      setUtrNumber('');
      setCheckoutOrder(json);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to initiate donation.');
    } finally {
      setSubmitting(false);
    }
  };

  const completeVerification = async (
    orderId: string,
    verificationToken: string,
    utr: string,
    razorpayPaymentId?: string,
    razorpaySignature?: string
  ) => {
    setVerifying(true);
    setModalError('');
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          orderId,
          verificationToken,
          paymentMethod: 'UPI',
          utrNumber: utr.trim(),
          razorpayPaymentId,
          razorpaySignature,
        }),
      });
      const json = (await res.json()) as {donation?: DonationRecord; error?: string};
      if (!res.ok || !json.donation) {
        throw new Error(json.error || 'Payment verification failed.');
      }
      setCheckoutOrder(null);
      setReceipt(json.donation);
      await onDonationComplete();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Payment verification error.');
    } finally {
      setVerifying(false);
    }
  };

  const handleConfirmUpiSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!checkoutOrder) {
      return;
    }
    const cleanUtr = utrNumber.trim();
    if (!/^[a-zA-Z0-9_-]{6,32}$/.test(cleanUtr)) {
      setModalError(
        'Please enter the 6–32 character UPI Reference / UTR Number from your payment app.'
      );
      return;
    }
    await completeVerification(checkoutOrder.orderId, checkoutOrder.verificationToken, cleanUtr);
  };

  const handleDownloadReceipt = (rec: DonationRecord) => {
    const content = [
      `${data.siteContent.organizationName} — DONATION RECEIPT`,
      `========================================================`,
      `Receipt Number : ${rec.receiptNumber}`,
      `Date           : ${formatDate(rec.createdAt)}`,
      `Status         : ${
        rec.status === 'verified' ? 'VERIFIED' : 'PENDING UPI SETTLEMENT CHECK'
      }`,
      `Donor Name     : ${rec.donorName}`,
      `Donor Email    : ${rec.donorEmail}`,
      rec.panNumber ? `PAN            : ${rec.panNumber}` : null,
      `Cause          : ${rec.campaignTitle}`,
      `Amount Donated : ${formatINR(rec.amount)}`,
      `Payment Method : ${rec.paymentMethod}`,
      rec.upiVpa ? `Paid To UPI ID : ${rec.upiVpa}` : null,
      `UTR / Ref ID   : ${rec.paymentId}`,
      `Order ID       : ${rec.orderId}`,
      `--------------------------------------------------------`,
      `Trust Reg. No. : ${data.siteContent.registrationNumber}`,
      `80G Status     : ${data.siteContent.section80GStatus}`,
      `Contact Email  : ${data.siteContent.contactEmail}`,
    ]
      .filter(Boolean)
      .join('\n');

    const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${rec.receiptNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLookupReceipt = async (e: FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setLookupResult(null);
    if (!lookupQuery.trim()) {
      return;
    }
    try {
      const res = await fetch(
        `/api/donations/receipt/${encodeURIComponent(lookupQuery.trim())}`
      );
      const json = (await res.json()) as Partial<DonationRecord> & {error?: string};
      if (!res.ok) {
        throw new Error(json.error || 'Receipt not found.');
      }
      setLookupResult(json);
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Receipt lookup failed.');
    }
  };

  return (
    <div className="bg-slate-50/60 min-h-screen py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {receipt ? (
          <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-xs">
            <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <div
                  className={`inline-flex items-center gap-2 text-sm font-semibold mb-2 ${
                    receipt.status === 'verified' ? 'text-emerald-700' : 'text-sky-700'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {receipt.status === 'verified'
                      ? 'Donation Verified & Recorded'
                      : 'UPI Receipt Issued (Pending Bank UTR Match)'}
                  </span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                  Official Donation Receipt
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Thank you, {receipt.donorName}. Your kindness brings warmth and hope for{' '}
                  {receipt.campaignTitle}.
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-500">Receipt No.</p>
                <p className="font-mono text-sm font-semibold text-slate-900">
                  {receipt.receiptNumber}
                </p>
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3.5 bg-slate-50 rounded-xl">
                <dt className="text-xs text-slate-500">Donation Amount</dt>
                <dd className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-0.5">
                  {formatINR(receipt.amount)}
                </dd>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl">
                <dt className="text-xs text-slate-500">Program Allocated</dt>
                <dd className="font-semibold text-slate-900 mt-1">{receipt.campaignTitle}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Donor Name</dt>
                <dd className="font-medium text-slate-900 mt-0.5">{receipt.donorName}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Date</dt>
                <dd className="font-medium text-slate-900 mt-0.5">{formatDate(receipt.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Email</dt>
                <dd className="font-medium text-slate-900 mt-0.5">{receipt.donorEmail}</dd>
              </div>
              {receipt.upiVpa && (
                <div>
                  <dt className="text-xs text-slate-500">Paid To UPI ID</dt>
                  <dd className="font-mono text-xs font-semibold text-sky-700 mt-1">
                    {receipt.upiVpa}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-slate-500">Payment Method</dt>
                <dd className="font-medium text-slate-900 mt-0.5">{receipt.paymentMethod}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">UTR / Transaction Reference</dt>
                <dd className="font-mono text-xs text-slate-800 mt-1">{receipt.paymentId}</dd>
              </div>
            </dl>

            <div className="mt-6 pt-5 border-t border-slate-200 text-xs text-slate-500 space-y-1">
              <p>
                Issued by: <strong className="text-slate-800">{data.siteContent.organizationName}</strong>
              </p>
              <p>Registration: {data.siteContent.registrationNumber}</p>
              <p>Tax Exemption Info: {data.siteContent.section80GStatus}</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
              <button
                type="button"
                onClick={() => handleDownloadReceipt(receipt)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </button>
              <button
                type="button"
                onClick={() => {
                  setReceipt(null);
                  setDonorName('');
                  setDonorEmail('');
                  setPanNumber('');
                }}
                className="px-5 py-2.5 text-sm font-semibold text-orange-700 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer ml-auto"
              >
                Make Another Donation
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Donation Form */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold text-sky-700 mb-1">
                  Direct UPI &amp; Verified Contribution
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                  Make a Donation
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Contributions start at ₹100. Pay directly to{' '}
                  <span className="font-mono font-semibold text-slate-900">
                    {data.siteContent.upiId}
                  </span>{' '}
                  via any UPI app and receive an instant receipt.
                </p>
              </div>

              <form onSubmit={handleStartPayment} className="space-y-6">
                {/* Step 1: Select Cause */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2.5">
                    1. Select Cause / Category
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeCampaigns.map((camp) => {
                      const active = camp.id === selectedCampaign?.id;
                      const meta = CATEGORY_META[camp.category];
                      return (
                        <button
                          key={camp.id}
                          type="button"
                          onClick={() => setSelectedCampaignId(camp.id)}
                          className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                            active
                              ? 'border-sky-600 bg-sky-50/70'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <p className="text-xs font-semibold text-sky-700">{meta.shortLabel}</p>
                          <p className="text-sm font-semibold text-slate-900 mt-0.5 truncate">
                            {camp.title}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Select Amount */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2.5">
                    2. Choose Amount (INR)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {PRESET_AMOUNTS.map((val) => {
                      const selected = !isCustom && amount === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleSelectPreset(val)}
                          className={`py-3 px-3 rounded-xl border text-sm font-bold tabular-nums transition-colors cursor-pointer ${
                            selected
                              ? 'bg-orange-600 text-white border-orange-600'
                              : 'bg-white text-slate-800 border-slate-200 hover:border-orange-300'
                          }`}
                        >
                          {formatINR(val)}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setIsCustom(true)}
                      className={`py-3 px-3 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
                        isCustom
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-orange-300'
                      }`}
                    >
                      Custom
                    </button>
                  </div>

                  {isCustom && (
                    <div className="mt-3">
                      <label htmlFor="custom-amount" className="sr-only">
                        Custom Donation Amount in Rupees
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-slate-500 text-sm">
                          ₹
                        </span>
                        <input
                          id="custom-amount"
                          type="number"
                          min={100}
                          max={10000000}
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          placeholder="Enter amount (min ₹100)"
                          className="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-sky-600"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 3: Donor Details (No public mobile required) */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <p className="text-sm font-semibold text-slate-900">3. Donor Details</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="donor-name" className="block text-xs font-medium text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        id="donor-name"
                        type="text"
                        required
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="e.g. Rajesh Sharma"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
                      />
                    </div>
                    <div>
                      <label htmlFor="donor-email" className="block text-xs font-medium text-slate-700 mb-1">
                        Email Address (for Receipt) *
                      </label>
                      <input
                        id="donor-email"
                        type="email"
                        required
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="donor-pan" className="block text-xs font-medium text-slate-700 mb-1">
                      PAN Number (Optional, for 80G tax receipt)
                    </label>
                    <input
                      id="donor-pan"
                      type="text"
                      maxLength={10}
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800"
                  >
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 text-base font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-60 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {submitting
                    ? 'Preparing UPI Payment...'
                    : `Pay ${formatINR(effectiveAmount || 0)} via UPI`}
                </button>
              </form>
            </div>

            {/* Right Column: Emotional Child Appeal + Program Summary + Receipt Verification */}
            <div className="lg:col-span-5 space-y-6">
              {/* Emotional Appeal Card */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="aspect-[4/3] w-full bg-slate-100 relative">
                  <SafeImage
                    src="/src/assets/images/emotional_child_appeal_1794826061713.jpg"
                    alt="Child waiting for books, meals, and care support"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent p-5">
                    <p className="text-xs font-semibold text-orange-200">
                      Every Rupee Reaches a Child in Need
                    </p>
                    <p className="text-sm font-medium text-white mt-0.5">
                      Don&apos;t let a child wait in tears—your small help brings warm meals,
                      books, and a smile.
                    </p>
                  </div>
                </div>
                {selectedCampaign && (
                  <div className="p-5 space-y-3">
                    <p className="text-xs font-semibold text-sky-700">
                      Selected: {selectedCampaign.title}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {selectedCampaign.description}
                    </p>
                    <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-xs font-medium text-sky-900">
                      {selectedCampaign.unitImpactLabel}
                    </div>
                  </div>
                )}
              </div>

              {/* Direct UPI Info Box */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-700">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified UPI Recipient</span>
                </div>
                <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {data.siteContent.upiId}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyUpi(data.siteContent.upiId)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-sky-700 bg-white border border-slate-200 rounded-lg hover:bg-sky-50 cursor-pointer"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedUpi ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Receipt Verification Tool */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h2 className="font-display text-base font-bold text-slate-900">
                  Verify a Donation Receipt
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Enter your receipt ID (e.g. HFEC-2026-0001-XXXX) to verify its status.
                </p>
                <form onSubmit={handleLookupReceipt} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    placeholder="HFEC-2026-..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Verify
                  </button>
                </form>

                {lookupError && <p className="mt-2.5 text-xs text-red-700">{lookupError}</p>}

                {lookupResult && (
                  <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <p className="font-mono font-semibold text-slate-900">
                      {lookupResult.receiptNumber} · {lookupResult.status?.toUpperCase()}
                    </p>
                    <p className="text-slate-700">
                      Donor: {lookupResult.donorName} · {formatINR(lookupResult.amount || 0)}
                    </p>
                    <p className="text-slate-500">
                      {lookupResult.campaignTitle} ·{' '}
                      {lookupResult.createdAt ? formatDate(lookupResult.createdAt) : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Direct UPI QR & UTR Payment Modal */}
      {checkoutOrder && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-modal-title"
        >
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl my-8">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <p className="text-xs font-semibold text-sky-700">
                  {checkoutOrder.upiPayeeName}
                </p>
                <h2 id="checkout-modal-title" className="font-display text-lg font-bold text-slate-900">
                  Scan &amp; Pay {formatINR(checkoutOrder.amount)} via UPI
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutOrder(null)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg cursor-pointer"
                aria-label="Cancel payment"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex flex-col items-center justify-center bg-white p-3 rounded-xl border border-slate-200">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`UPI QR Code for ${checkoutOrder.upiId}`}
                    className="w-40 h-40 object-contain"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center text-xs text-slate-500">
                    Generating QR...
                  </div>
                )}
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Scan with GPay, PhonePe, Paytm, FamPay
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-slate-500">Payable Amount</p>
                  <p className="font-display text-2xl font-bold text-slate-900 tabular-nums">
                    {formatINR(checkoutOrder.amount)}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 mb-1">Official UPI ID</p>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg truncate">
                      {checkoutOrder.upiId}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyUpi(checkoutOrder.upiId)}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-sky-700 hover:bg-sky-50 cursor-pointer shrink-0"
                      aria-label="Copy UPI ID"
                    >
                      {copiedUpi ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <a
                  href={checkoutOrder.upiDeepLink}
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors"
                >
                  Open UPI App
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <form onSubmit={handleConfirmUpiSubmit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="utr-input"
                  className="block text-xs font-semibold text-slate-900 mb-1"
                >
                  Enter UPI Transaction ID / 12-Digit UTR Number *
                </label>
                <input
                  id="utr-input"
                  type="text"
                  required
                  minLength={6}
                  maxLength={32}
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. 432198765432"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  After sending {formatINR(checkoutOrder.amount)} to{' '}
                  <strong className="font-mono text-slate-700">{checkoutOrder.upiId}</strong>, paste
                  your UTR / UPI Ref ID above to issue your receipt.
                </p>
              </div>

              {modalError && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800"
                >
                  {modalError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutOrder(null)}
                  className="flex-1 py-2.5 px-4 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying}
                  className="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-60 rounded-xl cursor-pointer"
                >
                  {verifying ? 'Generating Receipt...' : 'Submit UTR & Get Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
