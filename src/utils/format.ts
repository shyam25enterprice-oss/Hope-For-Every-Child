import type {DonationCategoryId} from '../types';

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return isoString;
  }
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export const CATEGORY_META: Record<
  DonationCategoryId,
  {label: string; shortLabel: string; accentText: string; accentBg: string}
> = {
  education: {
    label: 'Education Donation',
    shortLabel: 'Education',
    accentText: 'text-sky-700',
    accentBg: 'bg-sky-50',
  },
  food: {
    label: 'Food Donation',
    shortLabel: 'Food & Nutrition',
    accentText: 'text-orange-700',
    accentBg: 'bg-orange-50',
  },
  clothes: {
    label: 'Clothes Donation',
    shortLabel: 'Clothing',
    accentText: 'text-sky-700',
    accentBg: 'bg-sky-50',
  },
  medical: {
    label: 'Medical Help',
    shortLabel: 'Medical Care',
    accentText: 'text-orange-700',
    accentBg: 'bg-orange-50',
  },
  shelter: {
    label: 'Shelter and Basic Needs',
    shortLabel: 'Shelter & Care',
    accentText: 'text-sky-700',
    accentBg: 'bg-sky-50',
  },
};
