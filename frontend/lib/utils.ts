import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind class merge helper (shadcn / Radix conventions). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
