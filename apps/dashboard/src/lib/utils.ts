import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function decodeIntentPayload(hash: string) {
  try {
    if (!hash || !hash.startsWith('#init=')) return null;
    const base64 = hash.replace('#init=', '');
    const jsonStr = decodeURIComponent(atob(base64));
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to decode intent payload", e);
    return null;
  }
}
