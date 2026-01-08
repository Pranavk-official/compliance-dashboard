import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPercent = (val: number) => {
  return Math.round(val * 100) + '%';
};

export const getStatusBadge = (percent: number) => {
  if (percent >= 1) return 'bg-green-100 text-green-700 border-green-300';
  if (percent >= 0.75) return 'bg-blue-100 text-blue-700 border-blue-300';
  if (percent >= 0.5) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
  return 'bg-red-100 text-red-700 border-red-300';
};

export const getStatusColor = (percent: number) => {
  if (percent >= 1) return 'text-green-600';
  if (percent >= 0.75) return 'text-blue-600';
  if (percent >= 0.5) return 'text-yellow-600';
  return 'text-red-600';
};

export const formatValue = (value: number, raw?: string | number) => {
  if (raw !== undefined && raw !== null && raw !== '') {
    if (typeof raw === 'number' && Math.abs(raw - value) < 0.001) {
      return formatPercent(raw);
    }
    return String(raw);
  }
  return formatPercent(value);
};
