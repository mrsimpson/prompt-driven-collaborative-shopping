/**
 * Validation utilities for the ShareMyCart application
 */

/**
 * Validates an email address format
 * @param email The email address to validate
 * @returns True if the email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates that a string is not empty
 * @param value The string to validate
 * @returns True if the string is not empty, false otherwise
 */
export function isNotEmpty(value: string): boolean {
  return value !== undefined && value !== null && value.trim() !== "";
}

/**
 * Validates that a number is positive
 * @param value The number to validate
 * @returns True if the number is positive, false otherwise
 */
export function isPositive(value: number): boolean {
  return value > 0;
}

/**
 * Validates a shopping list name
 * @param name The list name to validate
 * @returns True if the name is valid, false otherwise
 */
export function isValidListName(name: string): boolean {
  return isNotEmpty(name) && name.length <= 100;
}

/**
 * Validates a username
 * @param username The username to validate
 * @returns True if the username is valid, false otherwise
 */
export function isValidUsername(username: string): boolean {
  return isNotEmpty(username) && username.length >= 3 && username.length <= 30;
}

/**
 * Validates a password
 * @param password The password to validate
 * @returns True if the password is valid, false otherwise
 */
export function isValidPassword(password: string): boolean {
  // At least 8 characters, with at least one uppercase letter, one lowercase letter, and one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Validates a quantity value for a list item
 * @param quantity The quantity to validate
 * @returns True if the quantity is valid, false otherwise
 */
export function isValidQuantity(quantity: number): boolean {
  return !isNaN(quantity) && quantity > 0;
}

/**
 * Validates a unit of measurement
 * @param unit The unit to validate
 * @returns True if the unit is valid, false otherwise
 */
export function isValidUnit(unit: string): boolean {
  return isNotEmpty(unit) && unit.length <= 20;
}
