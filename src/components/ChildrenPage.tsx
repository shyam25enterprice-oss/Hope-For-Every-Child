import {Lock, ShieldCheck} from 'lucide-react';
import type {DonationCategoryId, PublicBootstrapPayload} from '../types';
import {CATEGORY_META} from '../utils/format';
import {SafeImage} from './SafeImage';

interface ChildrenPageProps {
  data: PublicBootstrapPayload;
  onSupportCategory: (category: DonationCategoryId) => void;
}

export function ChildrenPage({data, onSupportCategory}: ChildrenPageProps) {
  const {children} = data;

  return (
    <div className="bg-slate-50/50 min-h-screen py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold text-sky-700 mb-2">
            Our Children · Education &amp; Care Profiles
          </p>
          <h1
            className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900"
            style={{textWrap: 'balance'}}
          >
            Stories of resilience, learning, and everyday care
          </h1>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Meet the young learners supported through our education, nutrition, clothing, medical,
            and shelter programs.
          </p>
        </div>

        {/* Child Safeguarding & Privacy Banner */}
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 sm:p-6 flex items-start gap-4">
          <div className="p-2.5 bg-white border border-sky-200 rounded-xl text-sky-700 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="font-display text-sm font-bold text-slate-900">
              Child Privacy &amp; Safeguarding Commitment
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              To protect every child&apos;s safety and dignity, legal surnames, exact residential
              addresses, school names, and private medical files are never published. Profiles below
              use anonymized Care IDs, first-name aliases, and representational program photography.
            </p>
          </div>
        </div>

        {children.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <p className="font-display text-lg font-semibold text-slate-900">
              No public child care profiles listed right now
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Care profiles can be published securely by an authorized Trust Administrator.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {children.map((child) => {
              const meta = CATEGORY_META[child.focusCategory];
              return (
                <article
                  key={child.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[16/10] w-full bg-slate-100 relative overflow-hidden">
                      <SafeImage
                        src={child.photoUrl}
                        alt={`Representational care program photograph for ${child.aliasName}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono font-semibold text-slate-700">
                          {child.careCode}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Age {child.age}</span>
                        <span aria-hidden="true">·</span>
                        <span>{child.gradeLevel}</span>
                        <span aria-hidden="true">·</span>
                        <span className={`font-semibold ${meta.accentText}`}>{meta.shortLabel}</span>
                      </div>

                      <div>
                        <h2 className="font-display text-xl font-bold text-slate-900">
                          {child.aliasName}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                          Interests: {child.interests}
                        </p>
                      </div>

                      <p className="text-sm text-slate-700 leading-relaxed">
                        {child.storySummary}
                      </p>

                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-900 mb-2">
                          Current Educational &amp; Basic Needs
                        </p>
                        <ul className="space-y-1.5">
                          {child.currentNeeds.map((need, idx) => (
                            <li
                              key={idx}
                              className="text-xs sm:text-sm text-slate-600 flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                              <span>{need}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Identity safeguarded</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSupportCategory(child.focusCategory)}
                      className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Support {meta.shortLabel}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
