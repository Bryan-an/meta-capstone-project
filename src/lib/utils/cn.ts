import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names or class name arrays into a single string,
 * resolving conflicting Tailwind CSS classes intelligently.
 *
 * @remarks
 * This utility uses `clsx` to handle conditional classes and arrays, and
 * `tailwind-merge` to merge Tailwind classes, ensuring the last conflicting
 * utility class takes precedence.
 *
 * @param inputs - An array of class names, conditional class objects, or arrays.
 * @returns A string of merged and optimized class names.
 * @see https://github.com/dcastil/tailwind-merge
 * @see https://github.com/lukeed/clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
