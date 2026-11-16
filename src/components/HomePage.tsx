import {ArrowRight, ShieldCheck} from 'lucide-react';
import {motion} from 'motion/react';
import type {PublicBootstrapPayload} from '../types';
import {CATEGORY_META, formatINR} from '../utils/format';
import type {ActivePage} from './Navbar';
import {SafeImage} from './SafeImage';

interface HomePageProps {
  data: PublicBootstrapPayload;
  onNavigate: (page: ActivePage) => void;
  onDonateForCampaign: (campaignId: string) => void;
}

export function HomePage({data, onNavigate, onDonateForCampaign}: HomePageProps) {
  const {siteContent, campaigns, transparency} = data;

  return (
    <div>
      {/* Hero Section: Asymmetric 2-column split with full-height photo */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <motion.div
              initial={{opacity: 0, y: 12}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.35, ease: [0.16, 1, 0.3, 1]}}
              className="lg:col-span-6 flex flex-col justify-center py-2"
            >
              <p className="text-xs font-semibold tracking-wider text-sky-700 mb-4">
                {siteContent.organizationName} · Direct Child Care &amp; Open Ledger
              </p>

              <h1
                className="font-display text-4xl sm:text-5xl lg:text-[3.35rem] font-bold tracking-tight text-slate-900 leading-[1.12]"
                style={{textWrap: 'balance'}}
              >
                {siteContent.heroHeading}
              </h1>

              <p className="mt-5 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl">
                {siteContent.heroSubtitle}
              </p>

              <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                {siteContent.missionStatement}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('donate')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors cursor-pointer shadow-xs whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2"
                >
                  Donate Now
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('volunteer')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
                >
                  Become a Volunteer
                </button>
              </div>

              <div className="mt-7 pt-6 border-t border-slate-100 flex items-center gap-2.5 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0" />
                <span>
                  100% live financial transparency · Instant verified receipt from ₹100
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{opacity: 0, scale: 0.99}}
              animate={{opacity: 1, scale: 1}}
              transition={{duration: 0.4, ease: [0.16, 1, 0.3, 1]}}
              className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-slate-200 min-h-[320px] lg:min-h-[460px]"
            >
              <SafeImage
                src="/src/assets/images/hero_children_learning_1794825179461.jpg"
                alt="Smiling children reading storybooks together in a sunlit classroom"
                className="w-full h-full lg:h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent p-6">
                <p className="text-xs font-medium text-sky-200">
                  Classroom &amp; Care Support
                </p>
                <p className="text-sm sm:text-base font-medium text-white mt-1">
                  Providing books, nutritious meals, healthcare, and safe shelter with dignity.
                </p>
              </div>
            </motion.div>
          </div>

          {/* 4-Column Live Transparency Strip below Hero */}
          <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Donations Received</p>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                {formatINR(transparency.totalDonationsReceived)}
              </p>
              <p className="mt-1 text-xs text-slate-500">Verified contributions</p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">Total Amount Spent</p>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                {formatINR(transparency.totalAmountSpent)}
              </p>
              <p className="mt-1 text-xs text-slate-500">Recorded program expenses</p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">Children Supported</p>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-bold text-sky-700 tabular-nums">
                {transparency.childrenHelpedCount}
              </p>
              <p className="mt-1 text-xs text-slate-500">Active care profiles</p>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Verified Donors</p>
                <p className="mt-1 font-display text-2xl sm:text-3xl font-bold text-orange-600 tabular-nums">
                  {transparency.totalDonationCount}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('impact')}
                className="mt-1 text-left text-xs font-semibold text-sky-700 hover:text-sky-900 underline underline-offset-4 cursor-pointer"
              >
                Inspect full transparency ledger
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Categories Section */}
      <section className="bg-slate-50/70 py-16 lg:py-20 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-sky-700 mb-2">
                Direct Support Programs
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900"
                style={{textWrap: 'balance'}}
              >
                Choose where your kindness helps most
              </h2>
              <p className="mt-3 text-base text-slate-600">
                Every contribution starts at just ₹100 and is tracked openly by program category.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('donate')}
              className="text-sm font-semibold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              Open Donate Form
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign, index) => {
              const meta = CATEGORY_META[campaign.category];
              const pct =
                campaign.targetAmount > 0
                  ? Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100))
                  : 0;
              return (
                <article
                  key={campaign.id}
                  className={`bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5 ${
                    index === 0 ? 'md:col-span-2 lg:col-span-1' : ''
                  }`}
                >
                  <div>
                    <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                      <SafeImage
                        src={campaign.imageUrl}
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        <span className={`font-semibold ${meta.accentText}`}>{meta.shortLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{campaign.donorCount} donors</span>
                      </div>

                      <h3 className="font-display text-xl font-bold text-slate-900">
                        {campaign.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                        {campaign.summary}
                      </p>
                      <p className="mt-3 text-xs font-medium text-sky-800 bg-sky-50/80 border border-sky-100 rounded-lg px-3 py-2">
                        {campaign.unitImpactLabel}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 tabular-nums">
                      <span>Raised: {formatINR(campaign.raisedAmount)}</span>
                      <span>Goal: {formatINR(campaign.targetAmount)}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                      <div
                        className="h-full bg-sky-600 rounded-full transition-all duration-300"
                        style={{width: `${pct}%`}}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => onDonateForCampaign(campaign.id)}
                      className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors cursor-pointer"
                    >
                      Donate to {meta.shortLabel}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Emotional Appeal Section: A child waiting for care before donation */}
      <section className="bg-white py-14 lg:py-16 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-sky-50/60 border border-sky-100 rounded-2xl p-6 sm:p-10">
            <div className="lg:col-span-5 rounded-xl overflow-hidden border border-slate-200 aspect-[4/3]">
              <SafeImage
                src="/src/assets/images/emotional_child_appeal_1794826061713.jpg"
                alt="Young child sitting quietly with a worn notebook hoping for school supplies and care"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="lg:col-span-7 space-y-4">
              <p className="text-xs font-semibold text-orange-700">
                Why Your Help Cannot Wait
              </p>
              <h2
                className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900"
                style={{textWrap: 'balance'}}
              >
                Every small donation turns silent tears into a confident smile
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                Many children arrive at our care centers feeling alone, hungry, and worried about
                whether they will ever return to school. Even ₹100 towards meals, warm clothes, or
                notebooks gives a child immediate relief and reassurance that someone cares.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('donate')}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors cursor-pointer"
                >
                  Donate Now via UPI
                  <ArrowRight className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-600">
                  Direct UPI: <strong className="font-mono text-slate-900">{siteContent.upiId}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About & Child Safeguarding Split */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-slate-200 aspect-[16/10]">
              <SafeImage
                src="/src/assets/images/about_care_home_1794825181699.jpg"
                alt="Safe children's care home courtyard with children reading and playing"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div>
                <p className="text-xs font-semibold text-sky-700 mb-2">
                  Our Mission &amp; Accountability
                </p>
                <h2
                  className="font-display text-3xl font-bold tracking-tight text-slate-900"
                  style={{textWrap: 'balance'}}
                >
                  Built on child dignity, real impact, and open books
                </h2>
                <p className="mt-3 text-base text-slate-600 leading-relaxed">
                  {siteContent.visionStatement}
                </p>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    01. Zero Fabricated Statistics
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    We never display inflated numbers or synthetic testimonials. Every figure on our
                    website updates directly from verified donations and logged expenses.
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    02. Child Identity Protection
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Children&apos;s legal names, home addresses, and personal medical records are never
                    exposed publicly. Care profiles use anonymized aliases and representational photos.
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    03. Instant Official Receipts
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Every online donation generates a uniquely numbered, printable donation receipt
                    immediately after payment verification.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  About Our Organization
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('children')}
                  className="px-5 py-2.5 text-sm font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors cursor-pointer"
                >
                  Meet Our Children Safely
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
