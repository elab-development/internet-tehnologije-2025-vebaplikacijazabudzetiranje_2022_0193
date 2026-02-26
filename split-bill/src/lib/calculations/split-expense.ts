import { SplitMethod } from '@prisma/client';

export interface SplitInput {
  totalAmount: number;
  participantIds: string[];
  splitMethod: SplitMethod;
  splits?: Record<string, number>; // For PERCENTAGE and EXACT methods
}

export interface SplitResult {
  [userId: string]: number;
}

/**
 * Calculate equal split
 * Divide amount equally among all participants
 */
function calculateEqualSplit(
  totalAmount: number,
  participantIds: string[]
): SplitResult {
  if (participantIds.length === 0) {
    return {};
  }

  const splitAmount = Math.round((totalAmount / participantIds.length) * 100) / 100;
  const remainder = totalAmount - splitAmount * (participantIds.length - 1);

  const result: SplitResult = {};

  participantIds.forEach((id, index) => {
    // Last participant gets remainder to avoid rounding errors
    result[id] = index === participantIds.length - 1 ? remainder : splitAmount;
  });

  return result;
}

/**
 * Calculate percentage-based split
 * Each participant's share is specified as a percentage
 */
function calculatePercentageSplit(
  totalAmount: number,
  splits: Record<string, number>
): SplitResult {
  const result: SplitResult = {};
  let allocated = 0;
  const entries = Object.entries(splits);

  entries.forEach(([userId, percentage], index) => {
    if (percentage < 0 || percentage > 100) {
      throw new Error(`Invalid percentage: ${percentage}`);
    }

    // Calculate share
    const share = Math.round((totalAmount * (percentage / 100)) * 100) / 100;

    // Last participant gets remainder to handle rounding
    if (index === entries.length - 1) {
      result[userId] = totalAmount - allocated;
    } else {
      result[userId] = share;
      allocated += share;
    }
  });

  // Verify percentages sum to 100
  const totalPercentage = Object.values(splits).reduce((sum, p) => sum + p, 0);
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error(`Percentages must sum to 100, got ${totalPercentage}`);
  }

  return result;
}

/**
 * Calculate exact amount split
 * Each participant specifies exact amount they owe
 */
function calculateExactSplit(
  totalAmount: number,
  splits: Record<string, number>
): SplitResult {
  const result: SplitResult = {};
  let totalSplits = 0;

  Object.entries(splits).forEach(([userId, amount]) => {
    if (amount < 0) {
      throw new Error(`Invalid amount: ${amount}`);
    }
    result[userId] = Math.round(amount * 100) / 100;
    totalSplits += amount;
  });

  // Verify amounts sum to total
  const difference = Math.abs(totalAmount - totalSplits);
  if (difference > 0.01) {
    throw new Error(
      `Split amounts must sum to total. Expected: ${totalAmount}, Got: ${totalSplits}`
    );
  }

  return result;
}

/**
 * Calculate expense splits based on method
 */
export function calculateSplit(input: SplitInput): SplitResult {
  const { totalAmount, participantIds, splitMethod, splits } = input;

  if (totalAmount <= 0) {
    throw new Error('Total amount must be greater than 0');
  }

  if (participantIds.length === 0) {
    throw new Error('At least one participant required');
  }

  switch (splitMethod) {
    case 'EQUAL':
      return calculateEqualSplit(totalAmount, participantIds);

    case 'PERCENTAGE':
      if (!splits) {
        throw new Error('Splits required for PERCENTAGE method');
      }
      return calculatePercentageSplit(totalAmount, splits);

    case 'EXACT':
      if (!splits) {
        throw new Error('Splits required for EXACT method');
      }
      return calculateExactSplit(totalAmount, splits);

    default:
      throw new Error(`Unknown split method: ${splitMethod}`);
  }
}

/**
 * Validate split configuration
 */
export function validateSplit(input: SplitInput): { valid: boolean; error?: string } {
  const { totalAmount, participantIds, splitMethod, splits } = input;

  // Check amount
  if (totalAmount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }

  // Check participants
  if (participantIds.length === 0) {
    return { valid: false, error: 'At least one participant required' };
  }

  // Check for duplicate participants
  if (new Set(participantIds).size !== participantIds.length) {
    return { valid: false, error: 'Duplicate participants' };
  }

  // Check method-specific requirements
  if (splitMethod === 'PERCENTAGE' || splitMethod === 'EXACT') {
    if (!splits) {
      return { valid: false, error: `Splits required for ${splitMethod} method` };
    }

    // Check if all participants have splits defined
    const splitsSet = new Set(Object.keys(splits));
    for (const id of participantIds) {
      if (!splitsSet.has(id)) {
        return { valid: false, error: `Missing split for participant: ${id}` };
      }
    }

    // Check for extra participants in splits
    for (const id of Object.keys(splits)) {
      if (!participantIds.includes(id)) {
        return { valid: false, error: `Extra participant in splits: ${id}` };
      }
    }

    if (splitMethod === 'PERCENTAGE') {
      const total = Object.values(splits).reduce((sum, p) => sum + p, 0);
      if (Math.abs(total - 100) > 0.01) {
        return { valid: false, error: `Percentages must sum to 100, got ${total}` };
      }
    }

    if (splitMethod === 'EXACT') {
      const total = Object.values(splits).reduce((sum, a) => sum + a, 0);
      if (Math.abs(total - totalAmount) > 0.01) {
        return {
          valid: false,
          error: `Amounts must sum to ${totalAmount}, got ${total}`,
        };
      }
    }
  }

  return { valid: true };
}
