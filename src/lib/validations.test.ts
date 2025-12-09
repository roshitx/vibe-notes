import { describe, expect } from "vitest";
import { test } from "@fast-check/vitest";
import fc from "fast-check";
import {
  validateEmail,
  validatePassword,
  validateCredentials,
} from "./validations";

/**
 * **Feature: vibe-notes, Property 1: Input Validation Rejects Invalid Credentials**
 * **Validates: Requirements 1.3, 1.4**
 *
 * For any email string that does not match a valid email format, or for any
 * password string shorter than 6 characters, the validation function SHALL
 * return an error and prevent account creation.
 */
describe("Property 1: Input Validation Rejects Invalid Credentials", () => {
  // Helper to check if a string is a valid email format
  const isValidEmailFormat = (email: string): boolean => {
    if (!email || typeof email !== "string") return false;
    const trimmed = email.trim();
    if (trimmed.length === 0) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
  };

  // Generator for invalid emails (strings that don't match email format)
  const invalidEmailArbitrary = fc
    .string()
    .filter((s) => !isValidEmailFormat(s));

  // Generator for short passwords (0-5 characters)
  const shortPasswordArbitrary = fc.string({ minLength: 0, maxLength: 5 });

  // Generator for valid passwords (6+ characters)
  const validPasswordArbitrary = fc.string({ minLength: 6, maxLength: 100 });

  // Generator for valid emails
  const validEmailArbitrary = fc.emailAddress();

  test.prop([invalidEmailArbitrary], { numRuns: 100 })(
    "invalid emails are rejected by validateEmail",
    (email) => {
      const result = validateEmail(email);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    }
  );

  test.prop([shortPasswordArbitrary], { numRuns: 100 })(
    "short passwords (< 6 chars) are rejected by validatePassword",
    (password) => {
      const result = validatePassword(password);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    }
  );

  test.prop([invalidEmailArbitrary, validPasswordArbitrary], { numRuns: 100 })(
    "invalid email with valid password is rejected by validateCredentials",
    (email, password) => {
      const result = validateCredentials(email, password);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    }
  );

  test.prop([validEmailArbitrary, shortPasswordArbitrary], { numRuns: 100 })(
    "valid email with short password is rejected by validateCredentials",
    (email, password) => {
      const result = validateCredentials(email, password);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    }
  );

  test.prop([invalidEmailArbitrary, shortPasswordArbitrary], { numRuns: 100 })(
    "invalid email with short password is rejected by validateCredentials",
    (email, password) => {
      const result = validateCredentials(email, password);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    }
  );

  // Positive test: valid credentials should pass
  test.prop([validEmailArbitrary, validPasswordArbitrary], { numRuns: 100 })(
    "valid email and valid password are accepted by validateCredentials",
    (email, password) => {
      const result = validateCredentials(email, password);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    }
  );
});
