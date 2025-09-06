import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Type guard to check if an error is a Next.js redirect error.
 * This is the official way to handle this as of Next.js 13.4.
 * @param error - The error object to check.
 * @returns True if the error is a redirect error.
 */
interface NextJSError extends Error {
  digest?: string;
}

export function isNextRedirectError(error: NextJSError): boolean {
  if (typeof error !== "object" || error === null || !("digest" in error)) {
    return false;
  }
  const digest = error.digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}
