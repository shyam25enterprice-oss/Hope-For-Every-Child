import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import dotenv from 'dotenv';
import express, {type NextFunction, type Request, type Response} from 'express';
import type {
  Campaign,
  ChildProfile,
  ContactMessage,
  DonationCategoryId,
  DonationRecord,
  ExpenseRecord,
  FinancialReport,
  PublicBootstrapPayload,
  SiteContent,
  VolunteerRecord,
} from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'hope_store.json');
const PORT = Number(process.env.PORT || 3000);

interface AdminCredentials {
  name: string;
  email: string;
  salt: string;
  passwordHash: string;
  createdAt: string;
}

interface PendingOrder {
  orderId: string;
  amount: number;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  panNumber?: string;
  category: DonationCategoryId;
  campaignId: string;
  campaignTitle: string;
  paymentMode: 'live-razorpay' | 'direct-upi';
  createdAt: string;
}

interface StoreData {
  admin: AdminCredentials | null;
  sessionSecret: string;
  siteContent: SiteContent;
  campaigns: Campaign[];
  children: ChildProfile[];
  donations: DonationRecord[];
  expenses: ExpenseRecord[];
  financialReports: FinancialReport[];
  volunteers: VolunteerRecord[];
  contactMessages: ContactMessage[];
  pendingOrders: PendingOrder[];
}

const CATEGORY_LABELS: Record<DonationCategoryId, string> = {
  education: 'Education Donation',
  food: 'Food Donation',
  clothes: 'Clothes Donation',
  medical: 'Medical Help',
  shelter: 'Shelter & Basic Needs',
};

function createInitialStore(): StoreData {
  const now = new Date().toISOString();
  return {
    admin: null,
    sessionSecret:
      process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16
        ? process.env.SESSION_SECRET
        : crypto.randomBytes(32).toString('hex'),
    siteContent: {
      organizationName: 'Hope For Every Child',
      heroHeading: 'Every Child Deserves a Better Future.',
      heroSubtitle: 'Your small donation can bring a big smile.',
      missionStatement:
        'Hope For Every Child exists to stand beside orphan and underprivileged children with steady, dignified care—ensuring continuous schooling, daily nutritious meals, seasonal clothing, timely medical treatment, and a safe place to grow.',
      visionStatement:
        'A compassionate community where no child is held back by lack of food, shelter, healthcare, or education, and every rupee entrusted to their care is accounted for openly.',
      goals: [
        'Keep every supported child enrolled in school with textbooks, stationery, and mentorship.',
        'Provide balanced daily meals and clean drinking water across partner care centers.',
        'Ensure routine pediatric checkups, vaccinations, and emergency medical assistance.',
        'Maintain safe, hygienic residential care and seasonal clothing support.',
        'Publish every verified donation and expense openly without inflated figures.',
      ],
      registrationNumber: 'Update Trust / Society Reg. No. in Admin Settings',
      section80GStatus: 'Update 80G / 12A Tax Exemption Details in Admin Settings',
      upiId: 'kiniko-shyam@fam',
      upiPayeeName: 'Hope For Every Child',
      contactEmail: 'contact@hopeforeverychild.org',
      contactPhone: '+91 00000 00000 (Update in Admin Settings)',
      officeAddress: 'Configure Verified Organization Office Address in Admin Settings',
      socialLinks: {
        instagram: 'https://instagram.com',
        facebook: 'https://facebook.com',
        twitter: 'https://x.com',
        linkedin: 'https://linkedin.com',
      },
      updatedAt: now,
    },
    campaigns: [
      {
        id: 'camp-education',
        category: 'education',
        title: 'Education Donation',
        summary: 'School tuition, textbooks, uniforms, and after-school learning support.',
        description:
          'Covers annual school fees, notebooks, writing kits, uniforms, and guided homework mentorship so orphan children stay confident in the classroom.',
        targetAmount: 150000,
        imageUrl: '/src/assets/images/category_education_1794825180483.jpg',
        active: true,
        unitImpactLabel: '₹500 supports monthly school supplies for 1 child',
        createdAt: now,
      },
      {
        id: 'camp-food',
        category: 'food',
        title: 'Food Donation',
        summary: 'Fresh, hot, balanced daily meals and clean nutrition kits.',
        description:
          'Provides wholesome mid-day and evening meals—grains, lentils, fresh vegetables, milk, and seasonal fruit—prepared hygienically for growing children.',
        targetAmount: 120000,
        imageUrl: '/src/assets/images/category_nutrition_food_1794825179928.jpg',
        active: true,
        unitImpactLabel: '₹100 provides warm nutritious meals for 1 child for a day',
        createdAt: now,
      },
      {
        id: 'camp-clothes',
        category: 'clothes',
        title: 'Clothes Donation',
        summary: 'Clean everyday wear, school uniforms, winter sweaters, and footwear.',
        description:
          'Equips children with well-fitted daily clothing, durable shoes, rainwear, and warm winter layers so they feel comfortable and dignified year-round.',
        targetAmount: 80000,
        imageUrl: '/src/assets/images/hero_children_learning_1794825179461.jpg',
        active: true,
        unitImpactLabel: '₹1,000 provides a complete seasonal clothing & footwear kit',
        createdAt: now,
      },
      {
        id: 'camp-medical',
        category: 'medical',
        title: 'Medical Help',
        summary: 'Routine health checkups, essential medicines, vision care, and emergency aid.',
        description:
          'Funds regular pediatric screenings, dental and eye checkups, prescribed medicines, and urgent clinical care through qualified doctors.',
        targetAmount: 150000,
        imageUrl: '/src/assets/images/category_medical_care_1794825180689.jpg',
        active: true,
        unitImpactLabel: '₹2,000 covers a full pediatric checkup & essential medicines',
        createdAt: now,
      },
      {
        id: 'camp-shelter',
        category: 'shelter',
        title: 'Shelter and Basic Needs',
        summary: 'Safe bedding, clean hygiene kits, electricity, and nurturing care homes.',
        description:
          'Supports safe residential dormitories, clean beds and mosquito nets, soaps and hygiene essentials, and trained residential caretakers.',
        targetAmount: 200000,
        imageUrl: '/src/assets/images/about_care_home_1794825181699.jpg',
        active: true,
        unitImpactLabel: '₹1,500 supports safe bedding & monthly hygiene essentials',
        createdAt: now,
      },
    ],
    children: [
      {
        id: 'child-101',
        careCode: 'HF-CH-101',
        aliasName: 'Aarav (Alias)',
        age: 9,
        gradeLevel: 'Grade 4',
        focusCategory: 'education',
        interests: 'Drawing, science storybooks, and cricket',
        storySummary:
          'Aarav joined our care program after losing parental support. With consistent tutoring and a calm study environment, he now reads fluently and loves sketching nature scenes.',
        currentNeeds: ['Annual textbook set', 'Geometry & art kit', 'School shoes'],
        photoUrl: '/src/assets/images/category_education_1794825180483.jpg',
        isPublic: true,
        privacyNote:
          'Name anonymized and representational classroom photograph used under our Child Safeguarding Policy.',
        updatedAt: now,
      },
      {
        id: 'child-102',
        careCode: 'HF-CH-102',
        aliasName: 'Meera (Alias)',
        age: 11,
        gradeLevel: 'Grade 6',
        focusCategory: 'medical',
        interests: 'Mathematics, poetry, and helping younger children read',
        storySummary:
          'Meera arrived with recurring anemia and vision strain. Regular nutrition and prescription eyeglasses through our medical camp restored her energy and classroom focus.',
        currentNeeds: ['Bi-annual vision checkup', 'Iron-rich meal support', 'Mathematics workbook'],
        photoUrl: '/src/assets/images/category_medical_care_1794825180689.jpg',
        isPublic: true,
        privacyNote:
          'Personal identity, location, and school records remain strictly confidential.',
        updatedAt: now,
      },
      {
        id: 'child-103',
        careCode: 'HF-CH-103',
        aliasName: 'Kabir (Alias)',
        age: 7,
        gradeLevel: 'Grade 2',
        focusCategory: 'food',
        interests: 'Storytelling, building blocks, and gardening',
        storySummary:
          'Kabir thrives in our communal care dining and learning program. Daily warm meals and attentive caretakers have helped him gain healthy weight and cheerful confidence.',
        currentNeeds: ['Daily nutrition & milk support', 'Winter sweater set', 'Reading primers'],
        photoUrl: '/src/assets/images/category_nutrition_food_1794825179928.jpg',
        isPublic: true,
        privacyNote:
          'Name anonymized and representational program image displayed to protect child privacy.',
        updatedAt: now,
      },
      {
        id: 'child-104',
        careCode: 'HF-CH-104',
        aliasName: 'Ananya (Alias)',
        age: 13,
        gradeLevel: 'Grade 8',
        focusCategory: 'shelter',
        interests: 'Biology, music, and community library organization',
        storySummary:
          'Ananya lives in our partner residential shelter where she has a dedicated study desk, safe dormitory care, and mentorship as she prepares for high school.',
        currentNeeds: ['Residential care & bedding', 'Science lab kit', 'Uniform & winterwear'],
        photoUrl: '/src/assets/images/about_care_home_1794825181699.jpg',
        isPublic: true,
        privacyNote:
          'Care ID and alias protect full legal identity and residential address.',
        updatedAt: now,
      },
    ],
    // Strictly zero fake donations, zero fake expenses, zero fake reports, zero fake testimonials.
    donations: [],
    expenses: [],
    financialReports: [],
    volunteers: [],
    contactMessages: [],
    pendingOrders: [],
  };
}

function loadStore(): StoreData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {recursive: true});
  }
  if (!fs.existsSync(STORE_PATH)) {
    const initial = createInitialStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as StoreData;
    if (!parsed.siteContent.upiId) {
      parsed.siteContent.upiId = 'kiniko-shyam@fam';
    }
    if (!parsed.siteContent.upiPayeeName) {
      parsed.siteContent.upiPayeeName = parsed.siteContent.organizationName || 'Hope For Every Child';
    }
    return parsed;
  } catch {
    const fallback = createInitialStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
}

let store: StoreData = loadStore();

function saveStore(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {recursive: true});
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const computed = crypto.scryptSync(password, salt, 64);
  const storedBuf = Buffer.from(storedHash, 'hex');
  if (computed.length !== storedBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(computed, storedBuf);
}

function signSessionToken(email: string): string {
  const exp = Date.now() + 1000 * 60 * 60 * 12; // 12 hours
  const payload = Buffer.from(JSON.stringify({email, exp})).toString('base64url');
  const sig = crypto
    .createHmac('sha256', store.sessionSecret)
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string | undefined): {email: string} | null {
  if (!token || !store.admin) {
    return null;
  }
  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }
  const [payload, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', store.sessionSecret)
    .update(payload)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      email: string;
      exp: number;
    };
    if (!parsed.exp || parsed.exp < Date.now()) {
      return null;
    }
    if (parsed.email !== store.admin.email) {
      return null;
    }
    return {email: parsed.email};
  } catch {
    return null;
  }
}

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie;
  const cookies: Record<string, string> = {};
  if (!header) {
    return cookies;
  }
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx > -1) {
      const key = part.slice(0, idx).trim();
      const val = decodeURIComponent(part.slice(idx + 1).trim());
      cookies[key] = val;
    }
  }
  return cookies;
}

function extractAdminToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookies = parseCookies(req);
  return cookies.hope_admin_session;
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = extractAdminToken(req);
  const verified = verifySessionToken(token);
  if (!verified) {
    res.status(401).json({error: 'Unauthorized admin session. Please sign in.'});
    return;
  }
  next();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[^\d]/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

function sanitizeText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().slice(0, maxLen);
}

function isLiveRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const seq = String(store.donations.length + 1).padStart(4, '0');
  const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `HFEC-${year}-${seq}-${suffix}`;
}

function computeBootstrapPayload(): PublicBootstrapPayload {
  const verifiedDonations = store.donations.filter((d) => d.status === 'verified');
  const pendingDonations = store.donations.filter((d) => d.status === 'pending');
  const totalDonationsReceived = verifiedDonations.reduce((acc, d) => acc + d.amount, 0);
  const pendingVerificationAmount = pendingDonations.reduce((acc, d) => acc + d.amount, 0);
  const totalAmountSpent = store.expenses.reduce((acc, e) => acc + e.amount, 0);

  const campaignsWithStats = store.campaigns
    .filter((c) => c.active)
    .map((campaign) => {
      const matching = verifiedDonations.filter(
        (d) => d.campaignId === campaign.id || d.category === campaign.category
      );
      const raisedAmount = matching.reduce((acc, d) => acc + d.amount, 0);
      return {
        ...campaign,
        raisedAmount,
        donorCount: matching.length,
      };
    });

  const categories: DonationCategoryId[] = ['education', 'food', 'clothes', 'medical', 'shelter'];
  const categoryBreakdown = categories.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    received: verifiedDonations
      .filter((d) => d.category === cat)
      .reduce((acc, d) => acc + d.amount, 0),
    spent: store.expenses
      .filter((e) => e.category === cat)
      .reduce((acc, e) => acc + e.amount, 0),
  }));

  const publicChildren = store.children.filter((c) => c.isPublic);
  const latestReportChildren =
    store.financialReports.length > 0
      ? Math.max(...store.financialReports.map((r) => r.childrenSupportedCount))
      : 0;
  const childrenHelpedCount = Math.max(publicChildren.length, latestReportChildren);

  const recentVerifiedDonations = verifiedDonations
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10)
    .map((d) => ({
      id: d.id,
      receiptNumber: d.receiptNumber,
      donorDisplayName: d.donorName,
      amount: d.amount,
      category: d.category,
      campaignTitle: d.campaignTitle,
      createdAt: d.createdAt,
    }));

  const paymentGatewayMode = isLiveRazorpayConfigured() ? 'live-razorpay' : 'direct-upi';

  return {
    siteContent: store.siteContent,
    campaigns: campaignsWithStats,
    children: publicChildren,
    transparency: {
      totalDonationsReceived,
      totalDonationCount: verifiedDonations.length,
      pendingVerificationAmount,
      pendingVerificationCount: pendingDonations.length,
      totalAmountSpent,
      availableBalance: Math.max(0, totalDonationsReceived - totalAmountSpent),
      childrenHelpedCount,
      verifiedVolunteersCount: store.volunteers.filter((v) => v.status !== 'pending').length,
      categoryBreakdown,
      recentVerifiedDonations,
      expenses: store.expenses.slice().sort((a, b) => b.date.localeCompare(a.date)),
      reports: store.financialReports
        .slice()
        .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate)),
    },
    paymentGatewayMode,
    razorpayKeyId: isLiveRazorpayConfigured() ? process.env.RAZORPAY_KEY_ID : undefined,
  };
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({limit: '1mb'}));

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ok: true, timestamp: new Date().toISOString()});
  });

  // Public bootstrap data
  app.get('/api/bootstrap', (_req: Request, res: Response) => {
    res.json(computeBootstrapPayload());
  });

  // Create donation order (supports live Razorpay or server-signed sandbox verification)
  app.post('/api/payments/create-order', async (req: Request, res: Response) => {
    try {
      const amount = Number(req.body?.amount);
      const donorName = sanitizeText(req.body?.donorName, 120);
      const donorEmail = sanitizeText(req.body?.donorEmail, 160);
      const donorPhone = sanitizeText(req.body?.donorPhone, 24);
      const panNumber = sanitizeText(req.body?.panNumber, 20).toUpperCase();
      const campaignId = sanitizeText(req.body?.campaignId, 80);

      if (!Number.isFinite(amount) || amount < 100 || amount > 10000000) {
        res.status(400).json({error: 'Donation amount must be at least ₹100.'});
        return;
      }
      if (donorName.length < 2) {
        res.status(400).json({error: 'Please enter the donor full name.'});
        return;
      }
      if (!isValidEmail(donorEmail)) {
        res.status(400).json({error: 'Please enter a valid email address for your receipt.'});
        return;
      }
      if (donorPhone && !isValidPhone(donorPhone)) {
        res.status(400).json({error: 'Please enter a valid 10–15 digit phone number or leave it blank.'});
        return;
      }

      const campaign = store.campaigns.find((c) => c.id === campaignId && c.active);
      if (!campaign) {
        res.status(400).json({error: 'Please select an active donation category.'});
        return;
      }

      const liveMode = isLiveRazorpayConfigured();
      let orderId = '';

      if (liveMode) {
        const keyId = process.env.RAZORPAY_KEY_ID!;
        const keySecret = process.env.RAZORPAY_KEY_SECRET!;
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const rzRes = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `hfec_${Date.now()}`,
            notes: {
              campaignId: campaign.id,
              donorEmail,
            },
          }),
        });
        if (!rzRes.ok) {
          const text = await rzRes.text();
          res.status(502).json({error: `Payment gateway error: ${text}`});
          return;
        }
        const rzOrder = (await rzRes.json()) as {id: string};
        orderId = rzOrder.id;
      } else {
        orderId = `HFEC${Date.now().toString().slice(-8)}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
      }

      const pendingOrder: PendingOrder = {
        orderId,
        amount: Math.round(amount),
        donorName,
        donorEmail,
        donorPhone: donorPhone || 'Hidden',
        panNumber: panNumber || undefined,
        category: campaign.category,
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        paymentMode: liveMode ? 'live-razorpay' : 'direct-upi',
        createdAt: new Date().toISOString(),
      };

      store.pendingOrders = store.pendingOrders.slice(-100);
      store.pendingOrders.push(pendingOrder);
      saveStore();

      const verificationToken = crypto
        .createHmac('sha256', store.sessionSecret)
        .update(`${orderId}|${pendingOrder.amount}|${donorEmail}`)
        .digest('hex');

      const upiId = store.siteContent.upiId || 'kiniko-shyam@fam';
      const upiPayeeName = store.siteContent.upiPayeeName || store.siteContent.organizationName;
      const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
        upiPayeeName
      )}&am=${pendingOrder.amount}&cu=INR&tn=${encodeURIComponent(`Donation ${orderId}`)}`;

      res.json({
        orderId,
        amount: pendingOrder.amount,
        currency: 'INR',
        paymentMode: pendingOrder.paymentMode,
        razorpayKeyId: liveMode ? process.env.RAZORPAY_KEY_ID : undefined,
        upiId,
        upiPayeeName,
        upiDeepLink,
        verificationToken,
      });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Unable to initiate payment order.',
      });
    }
  });

  // Verify donation payment and generate official receipt
  app.post('/api/payments/verify', (req: Request, res: Response) => {
    const orderId = sanitizeText(req.body?.orderId, 120);
    const paymentMethodRaw = sanitizeText(req.body?.paymentMethod, 32);
    const razorpayPaymentId = sanitizeText(req.body?.razorpayPaymentId, 120);
    const razorpaySignature = sanitizeText(req.body?.razorpaySignature, 200);
    const utrNumber = sanitizeText(req.body?.utrNumber, 64);
    const verificationToken = sanitizeText(req.body?.verificationToken, 200);

    const pendingIdx = store.pendingOrders.findIndex((o) => o.orderId === orderId);
    if (pendingIdx === -1) {
      res.status(404).json({error: 'Order session not found or already processed.'});
      return;
    }

    const pending = store.pendingOrders[pendingIdx];

    if (pending.paymentMode === 'live-razorpay') {
      const secret = process.env.RAZORPAY_KEY_SECRET || '';
      const expected = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${razorpayPaymentId}`)
        .digest('hex');
      if (!razorpayPaymentId || !razorpaySignature || expected !== razorpaySignature) {
        res.status(400).json({error: 'Payment signature verification failed.'});
        return;
      }
    } else {
      const expectedToken = crypto
        .createHmac('sha256', store.sessionSecret)
        .update(`${orderId}|${pending.amount}|${pending.donorEmail}`)
        .digest('hex');
      if (!verificationToken || verificationToken !== expectedToken) {
        res.status(400).json({error: 'Invalid payment verification token.'});
        return;
      }
      if (!utrNumber || !/^[a-zA-Z0-9_-]{6,32}$/.test(utrNumber)) {
        res.status(400).json({
          error: 'Please enter a valid 6–32 character UPI Transaction / UTR Reference ID after completing UPI payment.',
        });
        return;
      }
    }

    const validMethods = ['UPI', 'Card', 'NetBanking'] as const;
    const paymentMethod =
      pending.paymentMode === 'direct-upi'
        ? 'UPI'
        : validMethods.includes(paymentMethodRaw as (typeof validMethods)[number])
          ? (paymentMethodRaw as 'UPI' | 'Card' | 'NetBanking')
          : 'UPI';

    const receiptNumber = generateReceiptNumber();
    const donation: DonationRecord = {
      id: crypto.randomUUID(),
      receiptNumber,
      orderId,
      paymentId: pending.paymentMode === 'live-razorpay' ? razorpayPaymentId : utrNumber,
      paymentMode: pending.paymentMode,
      paymentMethod,
      upiVpa: pending.paymentMode === 'direct-upi' ? store.siteContent.upiId : undefined,
      utrNumber: pending.paymentMode === 'direct-upi' ? utrNumber : undefined,
      donorName: pending.donorName,
      donorEmail: pending.donorEmail,
      donorPhone: pending.donorPhone,
      panNumber: pending.panNumber,
      amount: pending.amount,
      category: pending.category,
      campaignId: pending.campaignId,
      campaignTitle: pending.campaignTitle,
      status: pending.paymentMode === 'live-razorpay' ? 'verified' : 'pending',
      createdAt: new Date().toISOString(),
    };

    store.pendingOrders.splice(pendingIdx, 1);
    store.donations.push(donation);
    saveStore();

    res.json({donation});
  });

  // Public receipt lookup by receipt number
  app.get('/api/donations/receipt/:receiptNumber', (req: Request, res: Response) => {
    const receiptNumber = sanitizeText(req.params.receiptNumber, 64);
    const found = store.donations.find(
      (d) => d.receiptNumber.toLowerCase() === receiptNumber.toLowerCase()
    );
    if (!found) {
      res.status(404).json({error: 'Receipt number not found.'});
      return;
    }
    res.json({
      receiptNumber: found.receiptNumber,
      donorName: found.donorName,
      amount: found.amount,
      category: found.category,
      campaignTitle: found.campaignTitle,
      paymentMethod: found.paymentMethod,
      paymentMode: found.paymentMode,
      status: found.status,
      createdAt: found.createdAt,
    });
  });

  // Volunteer registration
  app.post('/api/volunteers', (req: Request, res: Response) => {
    const name = sanitizeText(req.body?.name, 120);
    const email = sanitizeText(req.body?.email, 160);
    const phone = sanitizeText(req.body?.phone, 24);
    const city = sanitizeText(req.body?.city, 80);
    const interestArea = sanitizeText(req.body?.interestArea, 100) || 'General Care & Education';
    const availability = sanitizeText(req.body?.availability, 80) || 'Weekends';
    const message = sanitizeText(req.body?.message, 600);

    if (name.length < 2) {
      res.status(400).json({error: 'Please enter your full name.'});
      return;
    }
    if (!isValidEmail(email)) {
      res.status(400).json({error: 'Please enter a valid email address.'});
      return;
    }
    if (!isValidPhone(phone)) {
      res.status(400).json({error: 'Please enter a valid phone number.'});
      return;
    }
    if (city.length < 2) {
      res.status(400).json({error: 'Please enter your city.'});
      return;
    }

    const volunteer: VolunteerRecord = {
      id: crypto.randomUUID(),
      referenceCode: `VOL-${new Date().getFullYear()}-${String(store.volunteers.length + 1).padStart(4, '0')}`,
      name,
      email,
      phone,
      city,
      interestArea,
      availability,
      message: message || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    store.volunteers.push(volunteer);
    saveStore();

    res.status(201).json({volunteer});
  });

  // Contact form submission
  app.post('/api/contact', (req: Request, res: Response) => {
    const name = sanitizeText(req.body?.name, 120);
    const email = sanitizeText(req.body?.email, 160);
    const phone = sanitizeText(req.body?.phone, 24);
    const subject = sanitizeText(req.body?.subject, 160) || 'General Inquiry';
    const message = sanitizeText(req.body?.message, 1500);

    if (name.length < 2) {
      res.status(400).json({error: 'Please enter your name.'});
      return;
    }
    if (!isValidEmail(email)) {
      res.status(400).json({error: 'Please enter a valid email address.'});
      return;
    }
    if (message.length < 5) {
      res.status(400).json({error: 'Please enter a message (at least 5 characters).'});
      return;
    }

    const contact: ContactMessage = {
      id: crypto.randomUUID(),
      name,
      email,
      phone,
      subject,
      message,
      status: 'unread',
      createdAt: new Date().toISOString(),
    };

    store.contactMessages.push(contact);
    saveStore();

    res.status(201).json({ok: true, id: contact.id});
  });

  // Admin auth status
  app.get('/api/admin/status', (req: Request, res: Response) => {
    const token = extractAdminToken(req);
    const session = verifySessionToken(token);
    res.json({
      initialized: Boolean(store.admin),
      authenticated: Boolean(session),
      adminName: session && store.admin ? store.admin.name : undefined,
      adminEmail: session && store.admin ? store.admin.email : undefined,
    });
  });

  // First-time Admin setup (only works when no admin exists yet)
  app.post('/api/admin/setup', (req: Request, res: Response) => {
    if (store.admin) {
      res.status(409).json({error: 'Admin account is already initialized. Please sign in.'});
      return;
    }
    const name = sanitizeText(req.body?.name, 100);
    const email = sanitizeText(req.body?.email, 160).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (name.length < 2) {
      res.status(400).json({error: 'Please enter the administrator name.'});
      return;
    }
    if (!isValidEmail(email)) {
      res.status(400).json({error: 'Please enter a valid administrator email.'});
      return;
    }
    if (password.length < 8) {
      res.status(400).json({error: 'Password must be at least 8 characters long.'});
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);

    store.admin = {
      name,
      email,
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    saveStore();

    const token = signSessionToken(email);
    res.setHeader(
      'Set-Cookie',
      `hope_admin_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200`
    );
    res.status(201).json({
      token,
      adminName: name,
      adminEmail: email,
    });
  });

  // Admin login
  app.post('/api/admin/login', (req: Request, res: Response) => {
    if (!store.admin) {
      res.status(400).json({error: 'No admin account exists yet. Please complete initial setup.'});
      return;
    }
    const email = sanitizeText(req.body?.email, 160).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (email !== store.admin.email || !verifyPassword(password, store.admin.salt, store.admin.passwordHash)) {
      res.status(401).json({error: 'Invalid email or password.'});
      return;
    }

    const token = signSessionToken(store.admin.email);
    res.setHeader(
      'Set-Cookie',
      `hope_admin_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200`
    );
    res.json({
      token,
      adminName: store.admin.name,
      adminEmail: store.admin.email,
    });
  });

  app.post('/api/admin/logout', (_req: Request, res: Response) => {
    res.setHeader('Set-Cookie', 'hope_admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
    res.json({ok: true});
  });

  // Protected Admin overview
  app.get('/api/admin/overview', requireAdmin, (_req: Request, res: Response) => {
    res.json({
      siteContent: store.siteContent,
      campaigns: store.campaigns,
      children: store.children,
      donations: store.donations.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      expenses: store.expenses.slice().sort((a, b) => b.date.localeCompare(a.date)),
      financialReports: store.financialReports
        .slice()
        .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate)),
      volunteers: store.volunteers.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      contactMessages: store.contactMessages
        .slice()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    });
  });

  // Admin: Record offline/bank donation
  app.post('/api/admin/donations', requireAdmin, (req: Request, res: Response) => {
    const donorName = sanitizeText(req.body?.donorName, 120);
    const donorEmail = sanitizeText(req.body?.donorEmail, 160);
    const donorPhone = sanitizeText(req.body?.donorPhone, 24) || 'Not provided';
    const amount = Number(req.body?.amount);
    const campaignId = sanitizeText(req.body?.campaignId, 80);
    const notes = sanitizeText(req.body?.notes, 400);

    if (donorName.length < 2 || !Number.isFinite(amount) || amount < 1) {
      res.status(400).json({error: 'Valid donor name and positive amount are required.'});
      return;
    }
    const campaign = store.campaigns.find((c) => c.id === campaignId) || store.campaigns[0];
    const donation: DonationRecord = {
      id: crypto.randomUUID(),
      receiptNumber: generateReceiptNumber(),
      orderId: `offline_${crypto.randomBytes(4).toString('hex')}`,
      paymentId: `bank_${crypto.randomBytes(5).toString('hex')}`,
      paymentMode: 'sandbox-verified',
      paymentMethod: 'Offline-Recorded',
      donorName,
      donorEmail: isValidEmail(donorEmail) ? donorEmail : 'offline-donor@recorded.local',
      donorPhone,
      amount: Math.round(amount),
      category: campaign.category,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      status: 'verified',
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };
    store.donations.push(donation);
    saveStore();
    res.status(201).json({donation});
  });

  // Admin: Update donation status
  app.patch('/api/admin/donations/:id', requireAdmin, (req: Request, res: Response) => {
    const item = store.donations.find((d) => d.id === req.params.id);
    if (!item) {
      res.status(404).json({error: 'Donation record not found.'});
      return;
    }
    const status = req.body?.status;
    if (status === 'verified' || status === 'pending' || status === 'refunded') {
      item.status = status;
    }
    if (typeof req.body?.notes === 'string') {
      item.notes = sanitizeText(req.body.notes, 400);
    }
    saveStore();
    res.json({donation: item});
  });

  // Admin: Manage campaigns
  app.post('/api/admin/campaigns', requireAdmin, (req: Request, res: Response) => {
    const title = sanitizeText(req.body?.title, 120);
    const summary = sanitizeText(req.body?.summary, 220);
    const description = sanitizeText(req.body?.description, 800);
    const targetAmount = Number(req.body?.targetAmount);
    const category = req.body?.category as DonationCategoryId;
    const unitImpactLabel = sanitizeText(req.body?.unitImpactLabel, 140);
    const imageUrl = sanitizeText(req.body?.imageUrl, 300);

    if (!title || !CATEGORY_LABELS[category] || !Number.isFinite(targetAmount) || targetAmount < 100) {
      res.status(400).json({error: 'Valid campaign title, category, and target amount required.'});
      return;
    }

    const campaign: Campaign = {
      id: `camp-${crypto.randomBytes(4).toString('hex')}`,
      category,
      title,
      summary: summary || description.slice(0, 140),
      description: description || summary,
      targetAmount: Math.round(targetAmount),
      imageUrl: imageUrl || '/src/assets/images/category_education_1794825180483.jpg',
      active: true,
      unitImpactLabel: unitImpactLabel || 'Every contribution directly funds child care',
      createdAt: new Date().toISOString(),
    };

    store.campaigns.push(campaign);
    saveStore();
    res.status(201).json({campaign});
  });

  app.patch('/api/admin/campaigns/:id', requireAdmin, (req: Request, res: Response) => {
    const campaign = store.campaigns.find((c) => c.id === req.params.id);
    if (!campaign) {
      res.status(404).json({error: 'Campaign not found.'});
      return;
    }
    if (typeof req.body?.title === 'string' && req.body.title.trim()) {
      campaign.title = sanitizeText(req.body.title, 120);
    }
    if (typeof req.body?.summary === 'string') {
      campaign.summary = sanitizeText(req.body.summary, 220);
    }
    if (typeof req.body?.description === 'string') {
      campaign.description = sanitizeText(req.body.description, 800);
    }
    if (typeof req.body?.unitImpactLabel === 'string') {
      campaign.unitImpactLabel = sanitizeText(req.body.unitImpactLabel, 140);
    }
    if (req.body?.targetAmount !== undefined && Number(req.body.targetAmount) >= 100) {
      campaign.targetAmount = Math.round(Number(req.body.targetAmount));
    }
    if (typeof req.body?.active === 'boolean') {
      campaign.active = req.body.active;
    }
    saveStore();
    res.json({campaign});
  });

  app.delete('/api/admin/campaigns/:id', requireAdmin, (req: Request, res: Response) => {
    const idx = store.campaigns.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({error: 'Campaign not found.'});
      return;
    }
    store.campaigns.splice(idx, 1);
    saveStore();
    res.json({ok: true});
  });

  // Admin: Manage expenses
  app.post('/api/admin/expenses', requireAdmin, (req: Request, res: Response) => {
    const title = sanitizeText(req.body?.title, 160);
    const vendorOrBeneficiary = sanitizeText(req.body?.vendorOrBeneficiary, 160);
    const referenceNumber = sanitizeText(req.body?.referenceNumber, 80);
    const date = sanitizeText(req.body?.date, 20) || new Date().toISOString().slice(0, 10);
    const category = req.body?.category as DonationCategoryId;
    const amount = Number(req.body?.amount);
    const notes = sanitizeText(req.body?.notes, 400);

    if (!title || !vendorOrBeneficiary || !CATEGORY_LABELS[category] || !Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({error: 'Please provide expense title, payee, category, and positive amount.'});
      return;
    }

    const expense: ExpenseRecord = {
      id: crypto.randomUUID(),
      date,
      category,
      title,
      vendorOrBeneficiary,
      amount: Math.round(amount),
      referenceNumber: referenceNumber || `EXP-${Date.now().toString().slice(-6)}`,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };

    store.expenses.push(expense);
    saveStore();
    res.status(201).json({expense});
  });

  app.delete('/api/admin/expenses/:id', requireAdmin, (req: Request, res: Response) => {
    const idx = store.expenses.findIndex((e) => e.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({error: 'Expense record not found.'});
      return;
    }
    store.expenses.splice(idx, 1);
    saveStore();
    res.json({ok: true});
  });

  // Admin: Manage financial reports
  app.post('/api/admin/reports', requireAdmin, (req: Request, res: Response) => {
    const periodLabel = sanitizeText(req.body?.periodLabel, 100);
    const publishedDate = sanitizeText(req.body?.publishedDate, 20) || new Date().toISOString().slice(0, 10);
    const totalReceivedInPeriod = Number(req.body?.totalReceivedInPeriod);
    const totalSpentInPeriod = Number(req.body?.totalSpentInPeriod);
    const childrenSupportedCount = Number(req.body?.childrenSupportedCount);
    const summaryNotes = sanitizeText(req.body?.summaryNotes, 1000);
    const auditorOrPreparer = sanitizeText(req.body?.auditorOrPreparer, 120);

    if (
      !periodLabel ||
      !summaryNotes ||
      !Number.isFinite(totalReceivedInPeriod) ||
      !Number.isFinite(totalSpentInPeriod) ||
      !Number.isFinite(childrenSupportedCount)
    ) {
      res.status(400).json({error: 'Complete all financial report fields accurately.'});
      return;
    }

    const report: FinancialReport = {
      id: crypto.randomUUID(),
      periodLabel,
      publishedDate,
      totalReceivedInPeriod: Math.max(0, Math.round(totalReceivedInPeriod)),
      totalSpentInPeriod: Math.max(0, Math.round(totalSpentInPeriod)),
      childrenSupportedCount: Math.max(0, Math.round(childrenSupportedCount)),
      summaryNotes,
      auditorOrPreparer: auditorOrPreparer || 'Trust Finance Committee',
      createdAt: new Date().toISOString(),
    };

    store.financialReports.push(report);
    saveStore();
    res.status(201).json({report});
  });

  app.delete('/api/admin/reports/:id', requireAdmin, (req: Request, res: Response) => {
    const idx = store.financialReports.findIndex((r) => r.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({error: 'Report not found.'});
      return;
    }
    store.financialReports.splice(idx, 1);
    saveStore();
    res.json({ok: true});
  });

  // Admin: Manage children care profiles
  app.post('/api/admin/children', requireAdmin, (req: Request, res: Response) => {
    const aliasName = sanitizeText(req.body?.aliasName, 80);
    const age = Number(req.body?.age);
    const gradeLevel = sanitizeText(req.body?.gradeLevel, 60);
    const focusCategory = req.body?.focusCategory as DonationCategoryId;
    const interests = sanitizeText(req.body?.interests, 180);
    const storySummary = sanitizeText(req.body?.storySummary, 700);
    const currentNeedsRaw = Array.isArray(req.body?.currentNeeds)
      ? req.body.currentNeeds.map((n: unknown) => sanitizeText(n, 80)).filter(Boolean)
      : [];
    const photoUrl = sanitizeText(req.body?.photoUrl, 300);

    if (!aliasName || !Number.isFinite(age) || age < 1 || age > 18 || !storySummary || !CATEGORY_LABELS[focusCategory]) {
      res.status(400).json({error: 'Valid alias name, age (1-18), focus category, and story summary are required.'});
      return;
    }

    const child: ChildProfile = {
      id: `child-${crypto.randomBytes(4).toString('hex')}`,
      careCode: `HF-CH-${100 + store.children.length + 1}`,
      aliasName,
      age: Math.round(age),
      gradeLevel: gradeLevel || 'Primary Care',
      focusCategory,
      interests: interests || 'Reading and outdoor games',
      storySummary,
      currentNeeds: currentNeedsRaw.length > 0 ? currentNeedsRaw : ['Education & nutrition support'],
      photoUrl: photoUrl || '/src/assets/images/category_education_1794825180483.jpg',
      isPublic: true,
      privacyNote: 'Anonymized care profile with representational photography to safeguard child privacy.',
      updatedAt: new Date().toISOString(),
    };

    store.children.push(child);
    saveStore();
    res.status(201).json({child});
  });

  app.patch('/api/admin/children/:id', requireAdmin, (req: Request, res: Response) => {
    const child = store.children.find((c) => c.id === req.params.id);
    if (!child) {
      res.status(404).json({error: 'Child profile not found.'});
      return;
    }
    if (typeof req.body?.aliasName === 'string' && req.body.aliasName.trim()) {
      child.aliasName = sanitizeText(req.body.aliasName, 80);
    }
    if (typeof req.body?.storySummary === 'string' && req.body.storySummary.trim()) {
      child.storySummary = sanitizeText(req.body.storySummary, 700);
    }
    if (typeof req.body?.gradeLevel === 'string') {
      child.gradeLevel = sanitizeText(req.body.gradeLevel, 60);
    }
    if (typeof req.body?.isPublic === 'boolean') {
      child.isPublic = req.body.isPublic;
    }
    if (Array.isArray(req.body?.currentNeeds)) {
      child.currentNeeds = req.body.currentNeeds
        .map((n: unknown) => sanitizeText(n, 80))
        .filter(Boolean);
    }
    child.updatedAt = new Date().toISOString();
    saveStore();
    res.json({child});
  });

  app.delete('/api/admin/children/:id', requireAdmin, (req: Request, res: Response) => {
    const idx = store.children.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({error: 'Child profile not found.'});
      return;
    }
    store.children.splice(idx, 1);
    saveStore();
    res.json({ok: true});
  });

  // Admin: Manage volunteers
  app.patch('/api/admin/volunteers/:id', requireAdmin, (req: Request, res: Response) => {
    const vol = store.volunteers.find((v) => v.id === req.params.id);
    if (!vol) {
      res.status(404).json({error: 'Volunteer not found.'});
      return;
    }
    const status = req.body?.status;
    if (status === 'pending' || status === 'approved' || status === 'active') {
      vol.status = status;
    }
    saveStore();
    res.json({volunteer: vol});
  });

  // Admin: Manage contact messages
  app.patch('/api/admin/contact/:id', requireAdmin, (req: Request, res: Response) => {
    const msg = store.contactMessages.find((m) => m.id === req.params.id);
    if (!msg) {
      res.status(404).json({error: 'Message not found.'});
      return;
    }
    const status = req.body?.status;
    if (status === 'unread' || status === 'responded' || status === 'archived') {
      msg.status = status;
    }
    saveStore();
    res.json({message: msg});
  });

  // Admin: Update website content & real organization details
  app.put('/api/admin/content', requireAdmin, (req: Request, res: Response) => {
    const body = req.body || {};
    const current = store.siteContent;
    store.siteContent = {
      organizationName: sanitizeText(body.organizationName, 100) || current.organizationName,
      heroHeading: sanitizeText(body.heroHeading, 160) || current.heroHeading,
      heroSubtitle: sanitizeText(body.heroSubtitle, 240) || current.heroSubtitle,
      missionStatement: sanitizeText(body.missionStatement, 800) || current.missionStatement,
      visionStatement: sanitizeText(body.visionStatement, 800) || current.visionStatement,
      goals: Array.isArray(body.goals)
        ? body.goals.map((g: unknown) => sanitizeText(g, 240)).filter(Boolean)
        : current.goals,
      registrationNumber: sanitizeText(body.registrationNumber, 160) || current.registrationNumber,
      section80GStatus: sanitizeText(body.section80GStatus, 160) || current.section80GStatus,
      upiId: sanitizeText(body.upiId, 100) || current.upiId,
      upiPayeeName: sanitizeText(body.upiPayeeName, 120) || current.upiPayeeName,
      contactEmail: sanitizeText(body.contactEmail, 160) || current.contactEmail,
      contactPhone: sanitizeText(body.contactPhone, 80) || current.contactPhone,
      officeAddress: sanitizeText(body.officeAddress, 300) || current.officeAddress,
      socialLinks: {
        instagram: sanitizeText(body.socialLinks?.instagram, 200) || current.socialLinks.instagram,
        facebook: sanitizeText(body.socialLinks?.facebook, 200) || current.socialLinks.facebook,
        twitter: sanitizeText(body.socialLinks?.twitter, 200) || current.socialLinks.twitter,
        linkedin: sanitizeText(body.socialLinks?.linkedin, 200) || current.socialLinks.linkedin,
      },
      updatedAt: new Date().toISOString(),
    };
    saveStore();
    res.json({siteContent: store.siteContent});
  });

  // Serve frontend (Vite dev middleware in development, static dist in production)
  if (process.env.NODE_ENV !== 'production') {
    const {createServer: createViteServer} = await import('vite');
    const vite = await createViteServer({
      server: {middlewareMode: true},
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hope For Every Child server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
