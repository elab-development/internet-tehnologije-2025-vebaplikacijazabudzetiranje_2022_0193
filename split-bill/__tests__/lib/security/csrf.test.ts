/**
 * @jest-environment node
 */
import { describe, it, expect } from '@jest/globals';
import { generateCsrfToken } from '@/lib/security/csrf';

describe('CSRF Protection', () => {
  describe('generateCsrfToken', () => {
    it('should generate a token', () => {
      const token = generateCsrfToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate unique tokens', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();

      expect(token1).not.toBe(token2);
    });

    it('should generate hex string', () => {
      const token = generateCsrfToken();

      expect(/^[0-9a-f]+$/.test(token)).toBe(true);
    });

    it('should generate token of expected length', () => {
      const token = generateCsrfToken();

      // 32 bytes = 64 hex characters
      expect(token.length).toBe(64);
    });
  });
});
