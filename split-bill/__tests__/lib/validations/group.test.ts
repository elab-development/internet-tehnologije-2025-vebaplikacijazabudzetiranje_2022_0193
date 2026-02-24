import { describe, it, expect } from '@jest/globals';
import { createGroupSchema, updateGroupSchema } from '@/lib/validations/group';

describe('Group Validation Schemas', () => {
  describe('createGroupSchema', () => {
    it('should validate correct group data', () => {
      const validData = {
        name: 'Test Group',
        description: 'Test description',
      };

      const result = createGroupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject name shorter than 2 characters', () => {
      const invalidData = {
        name: 'T',
      };

      const result = createGroupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject name longer than 100 characters', () => {
      const invalidData = {
        name: 'a'.repeat(101),
      };

      const result = createGroupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept null description', () => {
      const validData = {
        name: 'Test Group',
        description: null,
      };

      const result = createGroupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should trim group name', () => {
      const data = {
        name: '  Test Group  ',
      };

      const result = createGroupSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test Group');
      }
    });
  });

  describe('updateGroupSchema', () => {
    it('should validate partial updates', () => {
      const validData = {
        name: 'Updated Name',
      };

      const result = updateGroupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow archiving', () => {
      const validData = {
        isArchived: true,
      };

      const result = updateGroupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
