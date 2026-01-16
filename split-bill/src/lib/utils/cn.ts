import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility funkcija za spajanje Tailwind CSS klasa
 * Koristi clsx za conditional classes i twMerge za rešavanje konflikata
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}