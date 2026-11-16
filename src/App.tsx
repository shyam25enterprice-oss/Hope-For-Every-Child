import {useCallback, useEffect, useState} from 'react';
import {AboutPage} from './components/AboutPage';
import {AdminDashboard} from './components/AdminDashboard';
import {ChildrenPage} from './components/ChildrenPage';
import {ContactPage} from './components/ContactPage';
import {DonatePage} from './components/DonatePage';
import {Footer, type PolicyDocType} from './components/Footer';
import {HomePage} from './components/HomePage';
import {type ActivePage, Navbar} from './components/Navbar';
import {PolicyModal} from './components/PolicyModal';
import {TransparencyPage} from './components/TransparencyPage';
import {VolunteerPage} from './components/VolunteerPage';
import type {DonationCategoryId, PublicBootstrapPayload} from './types';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [preselectedCampaignId, setPreselectedCampaignId] = useState<string | undefined>(undefined);
  const [policyDoc, setPolicyDoc] = useState<PolicyDocType | null>(null);
  const [data, setData] = useState<PublicBootstrapPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBootstrap = useCallback(async () => {
    try {
      const res = await fetch('/api/bootstrap');
      if (!res.ok) {
        throw new Error('Unable to load organization data.');
      }
      const json = (await res.json()) as PublicBootstrapPayload;
      setData(json);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error loading website.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBootstrap();
  }, [fetchBootstrap]);

  const handleDonateForCampaign = (campaignId: string) => {
    setPreselectedCampaignId(campaignId);
    setActivePage('donate');
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleSupportCategory = (category: DonationCategoryId) => {
    const match = data?.campaigns.find((c) => c.category === category);
    setPreselectedCampaignId(match?.id);
    setActivePage('donate');
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <p className="font-display text-lg font-bold text-slate-900">Hope For Every Child</p>
        <p className="text-sm text-slate-500 mt-1">Loading verified programs and ledger...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <p className="font-display text-xl font-bold text-slate-900">
          Unable to reach server
        </p>
        <p className="text-sm text-slate-600 max-w-md">{error}</p>
        <button
          type="button"
          onClick={fetchBootstrap}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar
        activePage={activePage}
        organizationName={data.siteContent.organizationName}
        onNavigate={(page) => {
          if (page !== 'donate') {
            setPreselectedCampaignId(undefined);
          }
          setActivePage(page);
        }}
      />

      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage
            data={data}
            onNavigate={setActivePage}
            onDonateForCampaign={handleDonateForCampaign}
          />
        )}
        {activePage === 'about' && <AboutPage data={data} onNavigate={setActivePage} />}
        {activePage === 'donate' && (
          <DonatePage
            data={data}
            preselectedCampaignId={preselectedCampaignId}
            onDonationComplete={fetchBootstrap}
          />
        )}
        {activePage === 'children' && (
          <ChildrenPage data={data} onSupportCategory={handleSupportCategory} />
        )}
        {activePage === 'impact' && (
          <TransparencyPage data={data} onNavigate={setActivePage} />
        )}
        {activePage === 'volunteer' && <VolunteerPage />}
        {activePage === 'contact' && <ContactPage siteContent={data.siteContent} />}
        {activePage === 'admin' && <AdminDashboard onDataMutated={fetchBootstrap} />}
      </main>

      <Footer
        siteContent={data.siteContent}
        onNavigate={setActivePage}
        onOpenPolicy={setPolicyDoc}
      />

      <PolicyModal
        doc={policyDoc}
        siteContent={data.siteContent}
        onClose={() => setPolicyDoc(null)}
      />
    </div>
  );
}
