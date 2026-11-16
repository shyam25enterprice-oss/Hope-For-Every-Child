import type {SiteContent} from '../types';
import type {ActivePage} from './Navbar';

export type PolicyDocType = 'privacy' | 'refund' | 'terms' | 'safeguarding';

interface FooterProps {
  siteContent: SiteContent;
  onNavigate: (page: ActivePage) => void;
  onOpenPolicy: (doc: PolicyDocType) => void;
}

export function Footer({siteContent, onNavigate, onOpenPolicy}: FooterProps) {
  const go = (page: ActivePage) => {
    onNavigate(page);
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  return (
    <footer className="bg-slate-50 border-t border-slate-200 text-slate-600 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-3">
            <p className="font-display text-lg font-bold text-slate-900">
              {siteContent.organizationName}
            </p>
            <p className="text-sm leading-relaxed text-slate-600">
              Committed to dignified education, daily nutrition, clothing, healthcare, and safe
              shelter for orphan and underprivileged children.
            </p>
            <div className="pt-1 text-xs text-slate-500 space-y-1">
              <p>Reg. ID: {siteContent.registrationNumber}</p>
              <p>Tax Status: {siteContent.section80GStatus}</p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">Programs & Pages</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button type="button" onClick={() => go('home')} className="hover:text-sky-700 cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('about')} className="hover:text-sky-700 cursor-pointer">
                  About Us
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('donate')} className="hover:text-sky-700 cursor-pointer">
                  Donate Now
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('children')} className="hover:text-sky-700 cursor-pointer">
                  Our Children
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('impact')} className="hover:text-sky-700 cursor-pointer">
                  Donation Transparency
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">Get Involved & Trust</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button type="button" onClick={() => go('volunteer')} className="hover:text-sky-700 cursor-pointer">
                  Become a Volunteer
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('contact')} className="hover:text-sky-700 cursor-pointer">
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy('safeguarding')}
                  className="hover:text-sky-700 cursor-pointer"
                >
                  Child Safeguarding Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => go('admin')}
                  className="text-sky-700 font-medium hover:text-sky-900 cursor-pointer"
                >
                  Admin Dashboard
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">
              Policies &amp; Contact
            </h3>
            <div className="space-y-2 text-sm">
              <p>{siteContent.contactEmail}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{siteContent.officeAddress}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-600">
              <button
                type="button"
                onClick={() => onOpenPolicy('privacy')}
                className="hover:text-sky-700 underline underline-offset-4 cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => onOpenPolicy('refund')}
                className="hover:text-sky-700 underline underline-offset-4 cursor-pointer"
              >
                Refund Policy
              </button>
              <button
                type="button"
                onClick={() => onOpenPolicy('terms')}
                className="hover:text-sky-700 underline underline-offset-4 cursor-pointer"
              >
                Terms
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} {siteContent.organizationName}. All public impact figures
            are computed directly from verified donation and expenditure records.
          </p>
          <div className="flex items-center gap-4">
            <a
              href={siteContent.socialLinks.instagram}
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900"
            >
              Instagram
            </a>
            <a
              href={siteContent.socialLinks.facebook}
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900"
            >
              Facebook
            </a>
            <a
              href={siteContent.socialLinks.twitter}
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900"
            >
              X / Twitter
            </a>
            <a
              href={siteContent.socialLinks.linkedin}
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
