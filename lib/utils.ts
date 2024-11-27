import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Concatena classes CSS condicionalmente.
 * 
 * @param inputs - Classes CSS a serem concatenadas.
 * @returns Uma string com as classes concatenadas.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Concatena classes CSS condicionalmente.
 * 
 * @param inputs - Classes CSS a serem concatenadas.
 * @param condition - Condição para aplicar a classe.
 * @returns Uma string com as classes concatenadas.
 */
export function cnConditional(condition: boolean, ...inputs: ClassValue[]) {
  return condition ? cn(...inputs) : ''
}
