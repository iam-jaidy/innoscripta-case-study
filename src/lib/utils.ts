import { clsx, type ClassValue } from 'clsx';
import { formatDistanceToNowStrict, isFuture } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return 'Recent';
  }

  if (isFuture(date)) {
    return 'Just now';
  }

  return formatDistanceToNowStrict(date, { addSuffix: true });
};

export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
