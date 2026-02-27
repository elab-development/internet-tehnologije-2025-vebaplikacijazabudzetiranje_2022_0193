import { describe, it, expect } from '@jest/globals';
import {
  sanitizeInput,
  sanitizeHtml,
  sanitizeObject,
  sanitizeEmail,
  sanitizeUrl,
} from '@/lib/security/sanitize';

describe('Sanitization Functions', () => {
  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const dirty = '<script>alert("XSS")</script>Hello';
      const clean = sanitizeInput(dirty);

      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('</script>');
    });

    it('should escape special characters', () => {
      const dirty = 'Test < and > and & and "quotes"';
      const clean = sanitizeInput(dirty);

      expect(clean).toContain('&lt;');
      expect(clean).toContain('&gt;');
      expect(clean).toContain('&amp;');
      expect(clean).toContain('&quot;');
    });

    it('should trim whitespace', () => {
      const dirty = '  test  ';
      const clean = sanitizeInput(dirty);

      expect(clean).toBe('test');
    });

    it('should handle empty strings', () => {
      const clean = sanitizeInput('');
      expect(clean).toBe('');
    });

    it('should handle non-string input', () => {
      const clean = sanitizeInput(123 as any);
      expect(clean).toBe('');
    });
  });

  describe('sanitizeHtml', () => {
    it('should remove all HTML tags', () => {
      const dirty = '<p>Hello <strong>World</strong></p>';
      const clean = sanitizeHtml(dirty);

      expect(clean).not.toContain('<p>');
      expect(clean).not.toContain('<strong>');
    });

    it('should keep text content', () => {
      const dirty = '<p>Hello World</p>';
      const clean = sanitizeHtml(dirty);

      expect(clean).toContain('Hello World');
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize all string properties', () => {
      const dirty = {
        name: '<script>alert("XSS")</script>',
        description: 'Normal text',
      };

      const clean = sanitizeObject(dirty);

      expect(clean.name).not.toContain('<script>');
      expect(clean.description).toBe('Normal text');
    });

    it('should handle nested objects', () => {
      const dirty = {
        user: {
          name: '<b>Test</b>',
        },
      };

      const clean = sanitizeObject(dirty);

      expect(clean.user.name).not.toContain('<b>');
    });

    it('should handle arrays', () => {
      const dirty = {
        tags: ['<script>bad</script>', 'good'],
      };

      const clean = sanitizeObject(dirty);

      expect(clean.tags[0]).not.toContain('<script>');
      expect(clean.tags[1]).toBe('good');
    });

    it('should preserve non-string values', () => {
      const dirty = {
        count: 42,
        active: true,
        data: null,
      };

      const clean = sanitizeObject(dirty);

      expect(clean.count).toBe(42);
      expect(clean.active).toBe(true);
      expect(clean.data).toBe(null);
    });
  });

  describe('sanitizeEmail', () => {
    it('should validate and sanitize valid email', () => {
      const email = '  TEST@EXAMPLE.COM  ';
      const clean = sanitizeEmail(email);

      expect(clean).toBe('test@example.com');
    });

    it('should throw error for invalid email', () => {
      expect(() => sanitizeEmail('invalid-email')).toThrow('Invalid email format');
    });

    it('should throw error for email with HTML', () => {
      expect(() => sanitizeEmail('<script>@example.com')).toThrow();
    });
  });

  describe('sanitizeUrl', () => {
    it('should validate and sanitize valid URL', () => {
      const url = 'https://example.com/path';
      const clean = sanitizeUrl(url);

      expect(clean).toBe('https://example.com/path');
    });

    it('should throw error for invalid protocol', () => {
      expect(() => sanitizeUrl('javascript:alert(1)')).toThrow();
    });

    it('should throw error for invalid URL format', () => {
      expect(() => sanitizeUrl('not-a-url')).toThrow('Invalid URL format');
    });

    it('should allow http and https', () => {
      expect(() => sanitizeUrl('http://example.com')).not.toThrow();
      expect(() => sanitizeUrl('https://example.com')).not.toThrow();
    });
  });
});
