import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugPrice(slug: string): number {
  const len = slug.replace(/[^a-z0-9]/g, '').length;
  if (len <= 1) return 5000;
  if (len === 2) return 3500;
  if (len === 3) return 3000;
  if (len === 4) return 1500;
  if (len === 5) return 500;
  if (len === 6) return 150;
  return 0;
}
