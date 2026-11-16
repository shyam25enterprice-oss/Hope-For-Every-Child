import {ShieldCheck} from 'lucide-react';
import type {PublicBootstrapPayload} from '../types';
import type {ActivePage} from './Navbar';
import {SafeImage} from './SafeImage';

interface AboutPageProps {
  data: PublicBootstrapPayload;
  onNavigate: (page: ActivePage) => void;
}

export function AboutPage({data, onNavigate}: AboutPageProps) {
  const {siteContent} = data;

  return (
    <div className="bg-white py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Header Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <p className="text-xs font-semibold text-sky-700">About Our Organization</p>
            <h1
              className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900"
              style={{textWrap: 'balance'}}
            >
              Standing beside orphan children with steady, transparent care
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              {siteContent.missionStatement}
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('donate')}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors cursor-pointer"
              >
                Support a Child
              </button>
              <button
                type="button"
                onClick={() => onNavigate('impact')}
                className="px-5 py-2.5 text-sm font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors cursor-pointer"
              >
                View Financial Transparency
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-slate-200 aspect-[16/10]">
            <SafeImage
              src="/src/assets/images/about_care_home_1794825181699.jpg"
              alt="Hope For Every Child residential care and learning environment"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Vision & Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-10 border-t border-slate-200">
          <div className="lg:col-span-5 bg-sky-50/70 border border-sky-100 rounded-2xl p-7">
            <p className="text-xs font-semibold text-sky-700 mb-2">Our Vision</p>
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-3">
              Every child deserves safety, schooling, and belonging
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {siteContent.visionStatement}
            </p>
          </div>

          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-7">
            <p className="text-xs font-semibold text-orange-700 mb-2">Our Core Goals</p>
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-5">
              How we translate donations into lasting care
            </h2>
            <ol className="space-y-4">
              {siteContent.goals.map((goal, idx) => (
                <li key={idx} className="flex items-start gap-3.5 text-sm sm:text-base text-slate-700">
                  <span className="font-mono text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-100 rounded-lg px-2 py-1 shrink-0 mt-0.5 tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="leading-relaxed">{goal}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Verified Organization Details */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-7 sm:p-8">
          <div className="flex items-center gap-2.5 mb-4">
            <ShieldCheck className="w-5 h-5 text-sky-700" />
            <h2 className="font-display text-xl font-bold text-slate-900">
              Organization Registration &amp; Governance Details
            </h2>
          </div>
          <p className="text-sm text-slate-600 mb-6 max-w-3xl">
            We publish only verified organization details managed directly by our Trust
            Administrators. No fabricated endorsements or placeholder claims are displayed.
          </p>

          <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <dt className="text-xs text-slate-500">Registered Name</dt>
              <dd className="font-semibold text-slate-900 mt-1">{siteContent.organizationName}</dd>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <dt className="text-xs text-slate-500">Registration Number</dt>
              <dd className="font-mono text-xs sm:text-sm font-medium text-slate-900 mt-1">
                {siteContent.registrationNumber}
              </dd>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <dt className="text-xs text-slate-500">Tax Exemption / 80G Status</dt>
              <dd className="font-medium text-slate-900 mt-1">{siteContent.section80GStatus}</dd>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <dt className="text-xs text-slate-500">Official Email</dt>
              <dd className="font-medium text-slate-900 mt-1">{siteContent.contactEmail}</dd>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <dt className="text-xs text-slate-500">Official Donation UPI ID</dt>
              <dd className="font-mono text-sm font-semibold text-sky-700 mt-1">
                {siteContent.upiId}
              </dd>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <dt className="text-xs text-slate-500">Office Address</dt>
              <dd className="font-medium text-slate-900 mt-1">{siteContent.officeAddress}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
