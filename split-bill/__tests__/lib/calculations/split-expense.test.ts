import { describe, it, expect } from '@jest/globals';
import { calculateSplit, validateSplit } from '@/lib/calculations/split-expense';
import { SplitMethod } from '@prisma/client';

describe('Expense Splitting', () => {
  describe('Equal Split', () => {
    it('should split amount equally among participants', () => {
      const result = calculateSplit({
        totalAmount: 90,
        participantIds: ['alice', 'bob', 'charlie'],
        splitMethod: 'EQUAL' as SplitMethod,
      });

      expect(result).toEqual({
        alice: 30,
        bob: 30,
        charlie: 30,
      });
    });

    it('should handle uneven splits with remainder', () => {
      const result = calculateSplit({
        totalAmount: 100,
        participantIds: ['alice', 'bob', 'charlie'],
        splitMethod: 'EQUAL' as SplitMethod,
      });

      const total = Object.values(result).reduce((sum, v) => sum + v, 0);
      expect(total).toBe(100);
      expect(Object.keys(result).length).toBe(3);
    });

    it('should handle single participant', () => {
      const result = calculateSplit({
        totalAmount: 50,
        participantIds: ['alice'],
        splitMethod: 'EQUAL' as SplitMethod,
      });

      expect(result).toEqual({
        alice: 50,
      });
    });
  });

  describe('Percentage Split', () => {
    it('should split by percentages', () => {
      const result = calculateSplit({
        totalAmount: 100,
        participantIds: ['alice', 'bob', 'charlie'],
        splitMethod: 'PERCENTAGE' as SplitMethod,
        splits: {
          alice: 50,
          bob: 30,
          charlie: 20,
        },
      });

      expect(result).toEqual({
        alice: 50,
        bob: 30,
        charlie: 20,
      });
    });

    it('should validate percentages sum to 100', () => {
      const validation = validateSplit({
        totalAmount: 100,
        participantIds: ['alice', 'bob'],
        splitMethod: 'PERCENTAGE' as SplitMethod,
        splits: {
          alice: 50,
          bob: 40, // Only 90%
        },
      });

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('sum to 100');
    });

    it('should reject invalid percentages', () => {
      expect(() => {
        calculateSplit({
          totalAmount: 100,
          participantIds: ['alice', 'bob'],
          splitMethod: 'PERCENTAGE' as SplitMethod,
          splits: {
            alice: 150, // Invalid percentage > 100
            bob: -50,
          },
        });
      }).toThrow();
    });
  });

  describe('Exact Amount Split', () => {
    it('should split exact amounts', () => {
      const result = calculateSplit({
        totalAmount: 100,
        participantIds: ['alice', 'bob', 'charlie'],
        splitMethod: 'EXACT' as SplitMethod,
        splits: {
          alice: 40,
          bob: 35,
          charlie: 25,
        },
      });

      expect(result).toEqual({
        alice: 40,
        bob: 35,
        charlie: 25,
      });
    });

    it('should validate amounts sum to total', () => {
      const validation = validateSplit({
        totalAmount: 100,
        participantIds: ['alice', 'bob'],
        splitMethod: 'EXACT' as SplitMethod,
        splits: {
          alice: 40,
          bob: 50, // Only 90
        },
      });

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('sum to');
    });

    it('should reject negative amounts', () => {
      expect(() => {
        calculateSplit({
          totalAmount: 100,
          participantIds: ['alice', 'bob'],
          splitMethod: 'EXACT' as SplitMethod,
          splits: {
            alice: 60,
            bob: -60, // Negative not allowed
          },
        });
      }).toThrow();
    });
  });

  describe('Validation', () => {
    it('should reject zero amount', () => {
      const validation = validateSplit({
        totalAmount: 0,
        participantIds: ['alice'],
        splitMethod: 'EQUAL' as SplitMethod,
      });

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('greater than 0');
    });

    it('should reject negative amount', () => {
      const validation = validateSplit({
        totalAmount: -100,
        participantIds: ['alice'],
        splitMethod: 'EQUAL' as SplitMethod,
      });

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('greater than 0');
    });

    it('should reject empty participants', () => {
      const validation = validateSplit({
        totalAmount: 100,
        participantIds: [],
        splitMethod: 'EQUAL' as SplitMethod,
      });

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('At least one');
    });

    it('should reject duplicate participants', () => {
      const validation = validateSplit({
        totalAmount: 100,
        participantIds: ['alice', 'alice', 'bob'],
        splitMethod: 'EQUAL' as SplitMethod,
      });

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('Duplicate');
    });

    it('should reject missing splits for PERCENTAGE', () => {
      const validation = validateSplit({
        totalAmount: 100,
        participantIds: ['alice', 'bob', 'charlie'],
        splitMethod: 'PERCENTAGE' as SplitMethod,
        splits: {
          alice: 50,
          bob: 50, // Missing charlie
        },
      });

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('Missing split');
    });

    it('should reject extra participants in splits', () => {
      const validation = validateSplit({
        totalAmount: 100,
        participantIds: ['alice', 'bob'],
        splitMethod: 'EXACT' as SplitMethod,
        splits: {
          alice: 50,
          bob: 50,
          charlie: 0, // Extra participant
        },
      });

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('Extra participant');
    });
  });

  describe('Rounding', () => {
    it('should handle rounding correctly with 3 people', () => {
      const result = calculateSplit({
        totalAmount: 10.00,
        participantIds: ['alice', 'bob', 'charlie'],
        splitMethod: 'EQUAL' as SplitMethod,
      });

      const total = Object.values(result).reduce((sum, v) => sum + v, 0);
      expect(total).toBeCloseTo(10.00, 2);
    });

    it('should handle decimal percentages', () => {
      const result = calculateSplit({
        totalAmount: 100,
        participantIds: ['alice', 'bob', 'charlie'],
        splitMethod: 'PERCENTAGE' as SplitMethod,
        splits: {
          alice: 33.33,
          bob: 33.33,
          charlie: 33.34,
        },
      });

      const total = Object.values(result).reduce((sum, v) => sum + v, 0);
      expect(total).toBeCloseTo(100, 2);
    });
  });
});
