import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function toPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}
