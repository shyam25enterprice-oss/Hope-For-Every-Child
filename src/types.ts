export type DonationCategoryId =
  | 'education'
  | 'food'
  | 'clothes'
  | 'medical'
  | 'shelter';

export interface Campaign {
  id: string;
  category: DonationCategoryId;
  title: string;
  summary: string;
  description: string;
  targetAmount: number;
  imageUrl: string;
  active: boolean;
  unitImpactLabel: string;
  createdAt: string;
}

export interface DonationRecord {
  id: string;
  receiptNumber: string;
  orderId: string;
  paymentId: string;
  paymentMode: 'live-razorpay' | 'direct-upi' | 'sandbox-verified';
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'Offline-Recorded';
  upiVpa?: string;
  utrNumber?: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  panNumber?: string;
  amount: number;
  category: DonationCategoryId;
  campaignId: string;
  campaignTitle: string;
  status: 'verified' | 'pending' | 'refunded';
  notes?: string;
  createdAt: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  category: DonationCategoryId;
  title: string;
  vendorOrBeneficiary: string;
  amount: number;
  referenceNumber: string;
  notes?: string;
  createdAt: string;
}

export interface FinancialReport {
  id: string;
  periodLabel: string;
  publishedDate: string;
  totalReceivedInPeriod: number;
  totalSpentInPeriod: number;
  childrenSupportedCount: number;
  summaryNotes: string;
  auditorOrPreparer: string;
  createdAt: string;
}

export interface ChildProfile {
  id: string;
  careCode: string;
  aliasName: string;
  age: number;
  gradeLevel: string;
  focusCategory: DonationCategoryId;
  interests: string;
  storySummary: string;
  currentNeeds: string[];
  photoUrl: string;
  isPublic: boolean;
  privacyNote: string;
  updatedAt: string;
}

export interface VolunteerRecord {
  id: string;
  referenceCode: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  interestArea: string;
  availability: string;
  message?: string;
  status: 'pending' | 'approved' | 'active';
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'responded' | 'archived';
  createdAt: string;
}

export interface SiteContent {
  organizationName: string;
  heroHeading: string;
  heroSubtitle: string;
  missionStatement: string;
  visionStatement: string;
  goals: string[];
  registrationNumber: string;
  section80GStatus: string;
  upiId: string;
  upiPayeeName: string;
  contactEmail: string;
  contactPhone: string;
  officeAddress: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    twitter: string;
    linkedin: string;
  };
  updatedAt: string;
}

export interface PublicTransparencySummary {
  totalDonationsReceived: number;
  totalDonationCount: number;
  pendingVerificationAmount: number;
  pendingVerificationCount: number;
  totalAmountSpent: number;
  availableBalance: number;
  childrenHelpedCount: number;
  verifiedVolunteersCount: number;
  categoryBreakdown: Array<{
    category: DonationCategoryId;
    label: string;
    received: number;
    spent: number;
  }>;
  recentVerifiedDonations: Array<{
    id: string;
    receiptNumber: string;
    donorDisplayName: string;
    amount: number;
    category: DonationCategoryId;
    campaignTitle: string;
    createdAt: string;
  }>;
  expenses: ExpenseRecord[];
  reports: FinancialReport[];
}

export interface PublicBootstrapPayload {
  siteContent: SiteContent;
  campaigns: Array<Campaign & { raisedAmount: number; donorCount: number }>;
  children: ChildProfile[];
  transparency: PublicTransparencySummary;
  paymentGatewayMode: 'live-razorpay' | 'direct-upi';
  razorpayKeyId?: string;
}
