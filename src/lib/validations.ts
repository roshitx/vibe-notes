/**
 * Input validation functions for Vibe Notes
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates email format using a standard email regex pattern
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email is required" };
  }

  const trimmed = email.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: "Email is required" };
  }

  // Standard email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: "Invalid email format" };
  }

  return { valid: true };
}

/**
 * Validates password meets minimum length requirement (>= 6 characters)
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters" };
  }

  return { valid: true };
}

/**
 * Validates both email and password for authentication
 */
export function validateCredentials(
  email: string,
  password: string
): ValidationResult {
  const emailResult = validateEmail(email);
  if (!emailResult.valid) {
    return emailResult;
  }

  const passwordResult = validatePassword(password);
  if (!passwordResult.valid) {
    return passwordResult;
  }

  return { valid: true };
}
