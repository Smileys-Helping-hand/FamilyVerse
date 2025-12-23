import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateJoinCode(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'; // Excluded O and 0 for clarity
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
