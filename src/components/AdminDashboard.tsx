import {
  BookOpen,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  HeartHandshake,
  Lock,
  LogOut,
  Mail,
  Plus,
  Settings,
  Trash2,
  Users,
} from 'lucide-react';
import {type FormEvent, useCallback, useEffect, useState} from 'react';
import type {
  Campaign,
  ChildProfile,
  ContactMessage,
  DonationCategoryId,
  DonationRecord,
  ExpenseRecord,
  FinancialReport,
  SiteContent,
  VolunteerRecord,
} from '../types';
import {CATEGORY_META, formatDate, formatINR} from '../utils/format';

interface AdminDashboardProps {
  onDataMutated: () => Promise<void>;
}

interface AdminOverviewData {
  siteContent: SiteContent;
  campaigns: Campaign[];
  children: ChildProfile[];
  donations: DonationRecord[];
  expenses: ExpenseRecord[];
  financialReports: FinancialReport[];
  volunteers: VolunteerRecord[];
  contactMessages: ContactMessage[];
}

type AdminTab =
  | 'donations'
  | 'campaigns'
  | 'finance'
  | 'children'
  | 'volunteers'
  | 'content';

const TOKEN_STORAGE_KEY = 'hope_admin_bearer_token';

export function AdminDashboard({onDataMutated}: AdminDashboardProps) {
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [token, setToken] = useState<string>(() => sessionStorage.getItem(TOKEN_STORAGE_KEY) || '');

  // Auth form fields
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Dashboard data
  const [tab, setTab] = useState<AdminTab>('donations');
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [actionBanner, setActionBanner] = useState('');
  const [actionError, setActionError] = useState('');

  // Filters
  const [donationSearch, setDonationSearch] = useState('');

  // Offline donation form
  const [offName, setOffName] = useState('');
  const [offEmail, setOffEmail] = useState('');
  const [offPhone, setOffPhone] = useState('');
  const [offAmount, setOffAmount] = useState('1000');
  const [offCampaignId, setOffCampaignId] = useState('');
  const [offNotes, setOffNotes] = useState('');

  // New campaign form
  const [campTitle, setCampTitle] = useState('');
  const [campCategory, setCampCategory] = useState<DonationCategoryId>('education');
  const [campTarget, setCampTarget] = useState('100000');
  const [campSummary, setCampSummary] = useState('');
  const [campImpact, setCampImpact] = useState('');

  // New expense form
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState<DonationCategoryId>('education');
  const [expVendor, setExpVendor] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expRef, setExpRef] = useState('');

  // New financial report form
  const [repPeriod, setRepPeriod] = useState('');
  const [repDate, setRepDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [repReceived, setRepReceived] = useState('');
  const [repSpent, setRepSpent] = useState('');
  const [repChildren, setRepChildren] = useState('4');
  const [repPreparer, setRepPreparer] = useState('Trust Finance Committee');
  const [repNotes, setRepNotes] = useState('');

  // New child profile form
  const [childAlias, setChildAlias] = useState('');
  const [childAge, setChildAge] = useState('9');
  const [childGrade, setChildGrade] = useState('Grade 4');
  const [childCategory, setChildCategory] = useState<DonationCategoryId>('education');
  const [childInterests, setChildInterests] = useState('');
  const [childNeeds, setChildNeeds] = useState('School books, Uniform');
  const [childStory, setChildStory] = useState('');

  // Site Content editor state
  const [contentForm, setContentForm] = useState<SiteContent | null>(null);
  const [goalsText, setGoalsText] = useState('');

  const authHeaders = useCallback(
    (extra: Record<string, string> = {}): Record<string, string> => {
      const headers: Record<string, string> = {...extra};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      return headers;
    },
    [token]
  );

  const loadOverview = useCallback(
    async (overrideToken?: string) => {
      const activeToken = overrideToken ?? token;
      const res = await fetch('/api/admin/overview', {
        headers: activeToken ? {Authorization: `Bearer ${activeToken}`} : {},
      });
      if (!res.ok) {
        if (res.status === 401) {
          setAuthenticated(false);
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
          setToken('');
        }
        return;
      }
      const data = (await res.json()) as AdminOverviewData;
      setOverview(data);
      setContentForm(data.siteContent);
      setGoalsText(data.siteContent.goals.join('\n'));
      if (!offCampaignId && data.campaigns[0]) {
        setOffCampaignId(data.campaigns[0].id);
      }
    },
    [token, offCampaignId]
  );

  const checkStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch('/api/admin/status', {
        headers: authHeaders(),
      });
      const json = (await res.json()) as {
        initialized: boolean;
        authenticated: boolean;
        adminName?: string;
        adminEmail?: string;
      };
      setInitialized(json.initialized);
      setAuthenticated(json.authenticated);
      setAdminName(json.adminName || '');
      setAdminEmail(json.adminEmail || '');
      if (json.authenticated) {
        await loadOverview();
      }
    } finally {
      setLoadingStatus(false);
    }
  }, [authHeaders, loadOverview]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSubmitting(true);
    try {
      const endpoint = initialized ? '/api/admin/login' : '/api/admin/setup';
      const body = initialized
        ? {email: authEmail.trim(), password: authPassword}
        : {name: authName.trim(), email: authEmail.trim(), password: authPassword};

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as {
        token?: string;
        adminName?: string;
        adminEmail?: string;
        error?: string;
      };
      if (!res.ok || !json.token) {
        throw new Error(json.error || 'Authentication failed.');
      }
      sessionStorage.setItem(TOKEN_STORAGE_KEY, json.token);
      setToken(json.token);
      setInitialized(true);
      setAuthenticated(true);
      setAdminName(json.adminName || '');
      setAdminEmail(json.adminEmail || '');
      setAuthPassword('');
      await loadOverview(json.token);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', {method: 'POST'});
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken('');
    setAuthenticated(false);
    setOverview(null);
  };

  const notify = (msg: string) => {
    setActionError('');
    setActionBanner(msg);
    setTimeout(() => setActionBanner(''), 4000);
  };

  const handleRecordOfflineDonation = async (e: FormEvent) => {
    e.preventDefault();
    setActionError('');
    const res = await fetch('/api/admin/donations', {
      method: 'POST',
      headers: authHeaders({'Content-Type': 'application/json'}),
      body: JSON.stringify({
        donorName: offName,
        donorEmail: offEmail,
        donorPhone: offPhone,
        amount: Number(offAmount),
        campaignId: offCampaignId,
        notes: offNotes,
      }),
    });
    const json = (await res.json()) as {error?: string};
    if (!res.ok) {
      setActionError(json.error || 'Failed to record donation.');
      return;
    }
    setOffName('');
    setOffEmail('');
    setOffPhone('');
    setOffNotes('');
    await loadOverview();
    await onDataMutated();
    notify('Offline donation recorded and receipt generated.');
  };

  const handleDonationStatus = async (id: string, status: 'verified' | 'pending' | 'refunded') => {
    const res = await fetch(`/api/admin/donations/${id}`, {
      method: 'PATCH',
      headers: authHeaders({'Content-Type': 'application/json'}),
      body: JSON.stringify({status}),
    });
    if (res.ok) {
      await loadOverview();
      await onDataMutated();
      notify(`Donation status updated to ${status}.`);
    }
  };

  const handleExportDonationsCSV = () => {
    if (!overview) {
      return;
    }
    const headers = ['Receipt', 'Date', 'Donor', 'Email', 'Phone', 'Campaign', 'Amount', 'Method', 'Status'];
    const rows = overview.donations.map((d) => [
      d.receiptNumber,
      d.createdAt.slice(0, 10),
      `"${d.donorName.replace(/"/g, '""')}"`,
      d.donorEmail,
      d.donorPhone,
      `"${d.campaignTitle.replace(/"/g, '""')}"`,
      String(d.amount),
      d.paymentMethod,
      d.status,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `donations-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateCampaign = async (e: FormEvent) => {
    e.preventDefault();
    setActionError('');
    const res = await fetch('/api/admin/campaigns', {
      method: 'POST',
      headers: authHeaders({'Content-Type': 'application/json'}),
      body: JSON.stringify({
        title: campTitle,
        category: campCategory,
        targetAmount: Number(campTarget),
        summary: campSummary,
        description: campSummary,
        unitImpactLabel: campImpact,
      }),
    });
    const json = (await res.json()) as {error?: string};
    if (!res.ok) {
      setActionError(json.error || 'Could not create campaign.');
      return;
    }
    setCampTitle('');
    setCampSummary('');
    setCampImpact('');
    await loadOverview();
    await onDataMutated();
    notify('Campaign created and published.');
  };

  const handleToggleCampaign = async (camp: Campaign) => {
    const res = await fetch(`/api/admin/campaigns/${camp.id}`, {
      method: 'PATCH',
      headers: authHeaders({'Content-Type': 'application/json'}),
      body: JSON.stringify({active: !camp.active}),
    });
    if (res.ok) {
      await loadOverview();
      await onDataMutated();
      notify(`Campaign "${camp.title}" ${camp.active ? 'paused' : 'activated'}.`);
    }
  };

  const handleAddExpense = async (e: FormEvent) => {
    e.preventDefault();
    setActionError('');
    const res = await fetch('/api/admin/expenses', {
      method: 'POST',
      headers: authHeaders({'Content-Type': 'application/json'}),
      body: JSON.stringify({
        title: expTitle,
        category: expCategory,
        vendorOrBeneficiary: expVendor,
        amount: Number(expAmount),
        date: expDate,
        referenceNumber: expRef,
      }),
    });
    const json = (await res.json()) as {error?: string};
    if (!res.ok) {
      setActionError(json.error || 'Could not log expense.');
      return;
    }
    setExpTitle('');
    setExpVendor('');
    setExpAmount('');
    setExpRef('');
    await loadOverview();
    await onDataMutated();
    notify('Expense recorded on public Transparency Ledger.');
  };

  const handleDeleteExpense = async (id: string) => {
    const res = await fetch(`/api/admin/expenses/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.ok) {
      await loadOverview();
      await onDataMutated();
      notify('Expense entry removed.');
    }
  };

  const handlePublishReport = async (e: FormEvent) => {
    e.preventDefault();
    setActionError('');
    const res = await fetch('/api/admin/reports', {
      method: 'POST',
      headers: authHeaders({'Content-Type': 'application/json'}),
      body: JSON.stringify({
        periodLabel: repPeriod,
        publishedDate: repDate,
        totalReceivedInPeriod: Number(repReceived || 0),
        totalSpentInPeriod: Number(repSpent || 0),
        childrenSupportedCount: Number(repChildren || 0),
        auditorOrPreparer: repPreparer,
        summaryNotes: repNotes,
      }),
    });
    const json = (await res.json()) as {error?: string};
    if (!res.ok) {
      setActionError(json.error || 'Could not publish report.');
      return;
    }
    setRepPeriod('');
    setRepReceived('');
    setRepSpent('');
    setRepNotes('');
    await loadOverview();
    await onDataMutated();
    notify('Financial report published.');
  };

  const handleAddChild = async (e: FormEvent) => {
    e.preventDefault();
    setActionError('');
    const res = await fetch('/api/admin/children', {
      method: 'POST',
      headers: authHeaders({'Content-Type': 'application/json'}),
      body: JSON.stringify({
        aliasName: childAlias,
        age: Number(childAge),
        gradeLevel: childGrade,
        focusCategory: childCategory,
        interests: childInterests,
        currentNeeds: childNeeds
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        storySummary: childStory,
      }),
    });
    const json = (await res.json()) as {error?: string};
    if (!res.ok) {
      setActionError(json.error || 'Could not add profile.');
      return;
    }
    setChildAlias('');
    setChildInterests('');
    setChildStory('');
    await loadOverview();
    await onDataMutated();
    notify('Anonymized child care profile added.');
  };

  const handleToggleChildVisibility = async (child: ChildProfile) => {
    const res = await fetch(`/api/admin/children/${child.id}`, {
      method: 'PATCH',
      headers: authHeaders({'Content-Type': 'application/json'}),
      body: JSON.stringify({isPublic: !child.isPublic}),
    });
    if (res.ok) {
      await loadOverview();
      await onDataMutated();
    }
  };

  const handleDeleteChild = async (id: string) => {
    const res = await fetch(`/api/admin/children/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.ok) {
      await loadOverview();
      await onDataMutated();
    }
  };

  const handleVolunteerStatus = async (id: string, status: 'pending' | 'approved' | 'active') => {
    const res = await fetch(`/api/admin/volunteers/${id}`, {
      method: 'PATCH',
      headers: authHeaders({'Content-Type': 'application/json'}),
      body: JSON.stringify({status}),
    });
    if (res.ok) {
      await loadOverview();
      await onDataMutated();
      notify(`Volunteer marked as ${status}.`);
    }
  };

  const handleContactStatus = async (id: string, status: 'unread' | 'responded' | 'archived') => {
    const res = await fetch(`/api/admin/contact/${id}`, {
      method: 'PATCH',
      headers: authHeaders({'Content-Type': 'application/json'}),
      body: JSON.stringify({status}),
    });
    if (res.ok) {
      await loadOverview();
    }
  };

  const handleSaveContent = async (e: FormEvent) => {
    e.preventDefault();
    if (!contentForm) {
      return;
    }
    setActionError('');
    const payload: SiteContent = {
      ...contentForm,
      goals: goalsText
        .split('\n')
        .map((g) => g.trim())
        .filter(Boolean),
    };
    const res = await fetch('/api/admin/content', {
      method: 'PUT',
      headers: authHeaders({'Content-Type': 'application/json'}),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setActionError('Failed to save website content.');
      return;
    }
    await loadOverview();
    await onDataMutated();
    notify('Website content and organization details updated.');
  };

  if (loadingStatus) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-slate-600">
        Checking secure admin session...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="bg-slate-50 min-h-[75vh] py-16 px-4">
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-8">
          <div className="flex items-center gap-2.5 text-sky-700 mb-3">
            <Lock className="w-5 h-5" />
            <span className="text-xs font-semibold">Trust Governance Portal</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            {initialized ? 'Admin Sign In' : 'Initialize Admin Account'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
            {initialized
              ? 'Sign in with your administrator credentials to manage donations, campaigns, expenses, children profiles, and website content.'
              : 'First-time setup: Create your organization administrator credentials to secure the dashboard.'}
          </p>

          <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
            {!initialized && (
              <div>
                <label htmlFor="adm-name" className="block text-xs font-medium text-slate-700 mb-1">
                  Administrator Full Name
                </label>
                <input
                  id="adm-name"
                  type="text"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="e.g. Trust Managing Trustee"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>
            )}

            <div>
              <label htmlFor="adm-email" className="block text-xs font-medium text-slate-700 mb-1">
                Administrator Email
              </label>
              <input
                id="adm-email"
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="admin@hopeforeverychild.org"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div>
              <label htmlFor="adm-pass" className="block text-xs font-medium text-slate-700 mb-1">
                Password {initialized ? '' : '(minimum 8 characters)'}
              </label>
              <input
                id="adm-pass"
                type="password"
                required
                minLength={8}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            {authError && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800"
              >
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full py-3 px-5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 rounded-xl transition-colors cursor-pointer"
            >
              {authSubmitting
                ? 'Authenticating...'
                : initialized
                  ? 'Sign In to Dashboard'
                  : 'Create Admin Account & Enter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredDonations = (overview?.donations || []).filter((d) => {
    if (!donationSearch.trim()) {
      return true;
    }
    const q = donationSearch.toLowerCase();
    return (
      d.donorName.toLowerCase().includes(q) ||
      d.receiptNumber.toLowerCase().includes(q) ||
      d.campaignTitle.toLowerCase().includes(q)
    );
  });

  const navTabs: Array<{id: AdminTab; label: string; icon: typeof HeartHandshake}> = [
    {id: 'donations', label: 'Donations', icon: HeartHandshake},
    {id: 'campaigns', label: 'Campaigns', icon: BookOpen},
    {id: 'finance', label: 'Expenses & Reports', icon: FileSpreadsheet},
    {id: 'children', label: 'Our Children', icon: Users},
    {id: 'volunteers', label: 'Volunteers & Inbox', icon: Mail},
    {id: 'content', label: 'Website Content', icon: Settings},
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Admin Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold text-sky-700">Admin Management Console</p>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Hope For Every Child — Governance
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Signed in as {adminName} ({adminEmail})
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {actionBanner && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionBanner}</span>
          </div>
        )}
        {actionError && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
            {actionError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sidebar */}
          <aside className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-3 space-y-1">
            {navTabs.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-sky-50 text-sky-800 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Main Workspace */}
          <main className="lg:col-span-9 space-y-6">
            {tab === 'donations' && overview && (
              <>
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div>
                      <h2 className="font-display text-lg font-bold text-slate-900">
                        All Donations ({overview.donations.length})
                      </h2>
                      <p className="text-xs text-slate-500">
                        Verify receipts, inspect donor records, or export CSV.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="text"
                        value={donationSearch}
                        onChange={(e) => setDonationSearch(e.target.value)}
                        placeholder="Search donor or receipt..."
                        className="px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-600"
                      />
                      <button
                        type="button"
                        onClick={handleExportDonationsCSV}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export CSV
                      </button>
                    </div>
                  </div>

                  {filteredDonations.length === 0 ? (
                    <p className="text-sm text-slate-500 py-6 text-center">
                      No donations recorded yet. Online donations or offline bank transfers added
                      below will appear here.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                          <tr>
                            <th className="py-2.5 px-3">Receipt</th>
                            <th className="py-2.5 px-3">Donor</th>
                            <th className="py-2.5 px-3">Campaign</th>
                            <th className="py-2.5 px-3 text-right">Amount</th>
                            <th className="py-2.5 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredDonations.map((d) => (
                            <tr key={d.id}>
                              <td className="py-3 px-3 font-mono text-xs text-slate-700 whitespace-nowrap">
                                {d.receiptNumber}
                                <div className="text-[11px] text-slate-400">
                                  {formatDate(d.createdAt)}
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-semibold text-slate-900">{d.donorName}</div>
                                <div className="text-xs text-slate-500">{d.donorEmail}</div>
                                {d.utrNumber && (
                                  <div className="text-[11px] font-mono text-sky-700 mt-0.5">
                                    UTR: {d.utrNumber} {d.upiVpa ? `→ ${d.upiVpa}` : ''}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-3 text-slate-700">{d.campaignTitle}</td>
                              <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums">
                                {formatINR(d.amount)}
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <select
                                    value={d.status}
                                    onChange={(e) =>
                                      handleDonationStatus(
                                        d.id,
                                        e.target.value as 'verified' | 'pending' | 'refunded'
                                      )
                                    }
                                    className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs bg-white"
                                  >
                                    <option value="verified">verified</option>
                                    <option value="pending">pending</option>
                                    <option value="refunded">refunded</option>
                                  </select>
                                  {d.status === 'pending' && (
                                    <button
                                      type="button"
                                      onClick={() => handleDonationStatus(d.id, 'verified')}
                                      className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                                    >
                                      Verify UTR
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Record Offline / Bank Donation */}
                <form
                  onSubmit={handleRecordOfflineDonation}
                  className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
                >
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Record Verified Bank / Cheque / Offline Donation
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Donor Full Name *"
                      value={offName}
                      onChange={(e) => setOffName(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Donor Email"
                      value={offEmail}
                      onChange={(e) => setOffEmail(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={offPhone}
                      onChange={(e) => setOffPhone(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="Amount (INR) *"
                      value={offAmount}
                      onChange={(e) => setOffAmount(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono"
                    />
                    <select
                      value={offCampaignId}
                      onChange={(e) => setOffCampaignId(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white"
                    >
                      {overview.campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="UTR / Cheque Ref Note"
                      value={offNotes}
                      onChange={(e) => setOffNotes(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Record Donation &amp; Generate Receipt
                  </button>
                </form>
              </>
            )}

            {tab === 'campaigns' && overview && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Active &amp; Paused Campaigns
                  </h2>
                  <div className="divide-y divide-slate-100">
                    {overview.campaigns.map((camp) => (
                      <div
                        key={camp.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-xs font-semibold text-sky-700">
                            {CATEGORY_META[camp.category].label} · Goal{' '}
                            {formatINR(camp.targetAmount)}
                          </p>
                          <p className="font-display text-base font-bold text-slate-900">
                            {camp.title}
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">{camp.summary}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleCampaign(camp)}
                          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl cursor-pointer shrink-0 ${
                            camp.active
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {camp.active ? 'Active (Click to Pause)' : 'Paused (Click to Activate)'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <form
                  onSubmit={handleCreateCampaign}
                  className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
                >
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Launch New Campaign
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Campaign Title *"
                      value={campTitle}
                      onChange={(e) => setCampTitle(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                    <select
                      value={campCategory}
                      onChange={(e) => setCampCategory(e.target.value as DonationCategoryId)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white"
                    >
                      <option value="education">Education</option>
                      <option value="food">Food</option>
                      <option value="clothes">Clothes</option>
                      <option value="medical">Medical</option>
                      <option value="shelter">Shelter</option>
                    </select>
                    <input
                      type="number"
                      required
                      min={100}
                      placeholder="Target Amount (INR)"
                      value={campTarget}
                      onChange={(e) => setCampTarget(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Summary description"
                    value={campSummary}
                    onChange={(e) => setCampSummary(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Unit impact label (e.g. ₹500 funds 10 warm meals)"
                    value={campImpact}
                    onChange={(e) => setCampImpact(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Create Campaign
                  </button>
                </form>
              </div>
            )}

            {tab === 'finance' && overview && (
              <div className="space-y-6">
                {/* Log Expense */}
                <form
                  onSubmit={handleAddExpense}
                  className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
                >
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Log Verified Program Expenditure
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Expense Purpose / Title *"
                      value={expTitle}
                      onChange={(e) => setExpTitle(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Vendor / School / Clinic *"
                      value={expVendor}
                      onChange={(e) => setExpVendor(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                    <select
                      value={expCategory}
                      onChange={(e) => setExpCategory(e.target.value as DonationCategoryId)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white"
                    >
                      <option value="education">Education</option>
                      <option value="food">Food</option>
                      <option value="clothes">Clothes</option>
                      <option value="medical">Medical</option>
                      <option value="shelter">Shelter</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="Amount (INR) *"
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono"
                    />
                    <input
                      type="date"
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Voucher / Bill Ref No."
                      value={expRef}
                      onChange={(e) => setExpRef(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Expense to Public Ledger
                  </button>
                </form>

                {/* Existing Expenses */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                  <h3 className="font-display text-base font-bold text-slate-900 mb-3">
                    Logged Expenses ({overview.expenses.length})
                  </h3>
                  {overview.expenses.length === 0 ? (
                    <p className="text-sm text-slate-500">No expenses logged yet.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 text-sm">
                      {overview.expenses.map((exp) => (
                        <div key={exp.id} className="py-3 flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-900">{exp.title}</p>
                            <p className="text-xs text-slate-500">
                              {exp.date} · {CATEGORY_META[exp.category].shortLabel} ·{' '}
                              {exp.vendorOrBeneficiary} ({exp.referenceNumber})
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-semibold tabular-nums">
                              {formatINR(exp.amount)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                              aria-label="Delete expense"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Publish Financial Report */}
                <form
                  onSubmit={handlePublishReport}
                  className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
                >
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Publish Official Financial Report
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Period (e.g. Q3 2026 Report) *"
                      value={repPeriod}
                      onChange={(e) => setRepPeriod(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                    <input
                      type="date"
                      value={repDate}
                      onChange={(e) => setRepDate(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Prepared / Audited By"
                      value={repPreparer}
                      onChange={(e) => setRepPreparer(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="Total Received (INR)"
                      value={repReceived}
                      onChange={(e) => setRepReceived(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono"
                    />
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="Total Spent (INR)"
                      value={repSpent}
                      onChange={(e) => setRepSpent(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono"
                    />
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="Children Supported Count"
                      value={repChildren}
                      onChange={(e) => setRepChildren(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono"
                    />
                  </div>
                  <textarea
                    rows={3}
                    required
                    placeholder="Summary notes & audit highlights *"
                    value={repNotes}
                    onChange={(e) => setRepNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Publish Financial Report
                  </button>
                </form>
              </div>
            )}

            {tab === 'children' && overview && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Managed Care Profiles (Privacy Safeguarded)
                  </h2>
                  <div className="divide-y divide-slate-100">
                    {overview.children.map((ch) => (
                      <div
                        key={ch.id}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-xs font-mono text-slate-500">
                            {ch.careCode} · Age {ch.age} · {ch.gradeLevel}
                          </p>
                          <p className="font-semibold text-slate-900">{ch.aliasName}</p>
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                            {ch.storySummary}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleChildVisibility(ch)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-xl cursor-pointer ${
                              ch.isPublic
                                ? 'bg-sky-50 text-sky-800 border border-sky-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {ch.isPublic ? 'Public' : 'Hidden'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteChild(ch.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                            aria-label="Delete profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <form
                  onSubmit={handleAddChild}
                  className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
                >
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Add Anonymized Child Care Profile
                  </h3>
                  <p className="text-xs text-slate-500">
                    Use only first-name aliases and non-identifying details to uphold child
                    safeguarding standards.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="First-Name Alias *"
                      value={childAlias}
                      onChange={(e) => setChildAlias(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                    <input
                      type="number"
                      required
                      min={1}
                      max={18}
                      placeholder="Age"
                      value={childAge}
                      onChange={(e) => setChildAge(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Grade Level"
                      value={childGrade}
                      onChange={(e) => setChildGrade(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                    <select
                      value={childCategory}
                      onChange={(e) => setChildCategory(e.target.value as DonationCategoryId)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white"
                    >
                      <option value="education">Education</option>
                      <option value="food">Food</option>
                      <option value="clothes">Clothes</option>
                      <option value="medical">Medical</option>
                      <option value="shelter">Shelter</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Interests (e.g. Reading, Painting)"
                      value={childInterests}
                      onChange={(e) => setChildInterests(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Current Needs (comma separated)"
                      value={childNeeds}
                      onChange={(e) => setChildNeeds(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                  <textarea
                    rows={3}
                    required
                    placeholder="Anonymized story & educational progress *"
                    value={childStory}
                    onChange={(e) => setChildStory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Care Profile
                  </button>
                </form>
              </div>
            )}

            {tab === 'volunteers' && overview && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                  <h2 className="font-display text-lg font-bold text-slate-900 mb-4">
                    Volunteer Registrations ({overview.volunteers.length})
                  </h2>
                  {overview.volunteers.length === 0 ? (
                    <p className="text-sm text-slate-500">No volunteer registrations yet.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 text-sm">
                      {overview.volunteers.map((v) => (
                        <div
                          key={v.id}
                          className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">
                              {v.name}{' '}
                              <span className="font-mono text-xs text-slate-500">
                                ({v.referenceCode})
                              </span>
                            </p>
                            <p className="text-xs text-slate-600">
                              {v.city} · {v.email} · {v.phone}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {v.interestArea} ({v.availability})
                            </p>
                          </div>
                          <select
                            value={v.status}
                            onChange={(e) =>
                              handleVolunteerStatus(
                                v.id,
                                e.target.value as 'pending' | 'approved' | 'active'
                              )
                            }
                            className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white self-start sm:self-auto"
                          >
                            <option value="pending">pending</option>
                            <option value="approved">approved</option>
                            <option value="active">active</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                  <h2 className="font-display text-lg font-bold text-slate-900 mb-4">
                    Contact Us Inbox ({overview.contactMessages.length})
                  </h2>
                  {overview.contactMessages.length === 0 ? (
                    <p className="text-sm text-slate-500">No contact inquiries yet.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 text-sm">
                      {overview.contactMessages.map((msg) => (
                        <div key={msg.id} className="py-4 space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {msg.subject} — {msg.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {msg.email} {msg.phone ? `· ${msg.phone}` : ''} ·{' '}
                                {formatDate(msg.createdAt)}
                              </p>
                            </div>
                            <select
                              value={msg.status}
                              onChange={(e) =>
                                handleContactStatus(
                                  msg.id,
                                  e.target.value as 'unread' | 'responded' | 'archived'
                                )
                              }
                              className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white self-start"
                            >
                              <option value="unread">unread</option>
                              <option value="responded">responded</option>
                              <option value="archived">archived</option>
                            </select>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-xl">
                            {msg.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'content' && contentForm && (
              <form
                onSubmit={handleSaveContent}
                className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5"
              >
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Website Content &amp; Real Organization Details
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Update your NGO&apos;s verified registration number, 80G tax details, contact
                    info, and homepage messaging.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={contentForm.organizationName}
                      onChange={(e) =>
                        setContentForm({...contentForm, organizationName: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Hero Heading
                    </label>
                    <input
                      type="text"
                      value={contentForm.heroHeading}
                      onChange={(e) =>
                        setContentForm({...contentForm, heroHeading: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Hero Subtitle
                  </label>
                  <input
                    type="text"
                    value={contentForm.heroSubtitle}
                    onChange={(e) =>
                      setContentForm({...contentForm, heroSubtitle: e.target.value})
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Mission Statement
                  </label>
                  <textarea
                    rows={3}
                    value={contentForm.missionStatement}
                    onChange={(e) =>
                      setContentForm({...contentForm, missionStatement: e.target.value})
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Vision Statement
                  </label>
                  <textarea
                    rows={2}
                    value={contentForm.visionStatement}
                    onChange={(e) =>
                      setContentForm({...contentForm, visionStatement: e.target.value})
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Core Goals (one per line)
                  </label>
                  <textarea
                    rows={4}
                    value={goalsText}
                    onChange={(e) => setGoalsText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Trust / NGO Registration Number
                    </label>
                    <input
                      type="text"
                      value={contentForm.registrationNumber}
                      onChange={(e) =>
                        setContentForm({...contentForm, registrationNumber: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      80G / 12A Tax Status
                    </label>
                    <input
                      type="text"
                      value={contentForm.section80GStatus}
                      onChange={(e) =>
                        setContentForm({...contentForm, section80GStatus: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Official Contact Email
                    </label>
                    <input
                      type="email"
                      value={contentForm.contactEmail}
                      onChange={(e) =>
                        setContentForm({...contentForm, contactEmail: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Official Donation UPI ID
                    </label>
                    <input
                      type="text"
                      value={contentForm.upiId}
                      onChange={(e) =>
                        setContentForm({...contentForm, upiId: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      UPI Payee Display Name
                    </label>
                    <input
                      type="text"
                      value={contentForm.upiPayeeName}
                      onChange={(e) =>
                        setContentForm({...contentForm, upiPayeeName: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Internal Admin Phone (Hidden from Public)
                    </label>
                    <input
                      type="text"
                      value={contentForm.contactPhone}
                      onChange={(e) =>
                        setContentForm({...contentForm, contactPhone: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Verified Office Address
                  </label>
                  <input
                    type="text"
                    value={contentForm.officeAddress}
                    onChange={(e) =>
                      setContentForm({...contentForm, officeAddress: e.target.value})
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl cursor-pointer"
                >
                  Save Website Content &amp; Organization Details
                </button>
              </form>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
