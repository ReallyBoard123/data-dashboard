import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format duration in seconds to a human-readable string
 */
export function formatDuration(seconds: number, locale: string): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (locale === 'de') {
    if (hours > 0) {
      return `${hours} Std ${minutes} Min`;
    } else if (minutes > 0) {
      return `${minutes} Min ${remainingSeconds} Sek`;
    } else {
      return `${remainingSeconds} Sek`;
    }
  } else {
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }
}
