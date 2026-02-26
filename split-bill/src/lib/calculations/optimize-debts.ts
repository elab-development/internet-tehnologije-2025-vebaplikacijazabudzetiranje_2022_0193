import { prisma } from '@/lib/db';

export interface Balance {
  userId: string;
  userName: string;
  balance: number; // positive = owed to them, negative = they owe
}

export interface OptimizedDebt {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

/**
 * Calculate net balance for each user in a group
 * Includes expenses and settlements
 */
async function calculateBalances(groupId: string): Promise<Balance[]> {
  // Get all expenses with splits
  const expenses = await prisma.expense.findMany({
    where: { groupId },
    include: {
      payer: { select: { id: true, name: true } },
      splits: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
  });

  // Get all settlements
  const settlements = await prisma.settlement.findMany({
    where: { groupId },
    include: {
      fromUser: { select: { id: true, name: true } },
      toUser: { select: { id: true, name: true } },
    },
  });

  // Calculate balances
  const balanceMap = new Map<string, { name: string; balance: number }>();

  // Process expenses
  expenses.forEach((expense) => {
    // Payer gets positive balance (they paid more than they spent)
    const payerId = expense.payerId;
    const current = balanceMap.get(payerId) || { name: expense.payer.name, balance: 0 };
    current.balance += Number(expense.amount);
    balanceMap.set(payerId, current);

    // Each split participant gets negative balance (they owe)
    expense.splits.forEach((split) => {
      const userId = split.userId;
      const current = balanceMap.get(userId) || { name: split.user.name, balance: 0 };
      current.balance -= Number(split.amount);
      balanceMap.set(userId, current);
    });
  });

  // Process settlements
  settlements.forEach((settlement) => {
    const amount = Number(settlement.amount);

    // From user paid (negative adjustment - reduces their debt)
    const fromCurrent = balanceMap.get(settlement.fromUserId) || {
      name: settlement.fromUser.name,
      balance: 0,
    };
    fromCurrent.balance -= amount;
    balanceMap.set(settlement.fromUserId, fromCurrent);

    // To user received (positive adjustment - reduces what they are owed)
    const toCurrent = balanceMap.get(settlement.toUserId) || {
      name: settlement.toUser.name,
      balance: 0,
    };
    toCurrent.balance -= amount;
    balanceMap.set(settlement.toUserId, toCurrent);
  });

  // Convert to array and filter out zero balances
  return Array.from(balanceMap.entries())
    .map(([userId, data]) => ({
      userId,
      userName: data.name,
      balance: Math.round(data.balance * 100) / 100, // Round to 2 decimals
    }))
    .filter((b) => Math.abs(b.balance) > 0.01); // Filter out near-zero balances
}

/**
 * Optimize debts using greedy algorithm
 * Minimizes number of transactions needed
 * Algorithm: Match creditors with debtors in descending order
 */
export function optimizeDebts(balances: Balance[]): OptimizedDebt[] {
  const debts: OptimizedDebt[] = [];

  // Separate creditors (positive balance) and debtors (negative balance)
  const creditors = balances
    .filter((b) => b.balance > 0.01)
    .sort((a, b) => b.balance - a.balance);

  const debtors = balances
    .filter((b) => b.balance < -0.01)
    .map((b) => ({ ...b, balance: Math.abs(b.balance) }))
    .sort((a, b) => b.balance - a.balance);

  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    // Match the smaller amount
    const amount = Math.min(creditor.balance, debtor.balance);

    debts.push({
      from: debtor.userId,
      fromName: debtor.userName,
      to: creditor.userId,
      toName: creditor.userName,
      amount: Math.round(amount * 100) / 100,
    });

    // Reduce both balances
    creditor.balance -= amount;
    debtor.balance -= amount;

    // Move to next creditor or debtor if satisfied
    if (creditor.balance < 0.01) i++;
    if (debtor.balance < 0.01) j++;
  }

  return debts;
}

/**
 * Get optimized debts for a group
 * Calculates balances and then optimizes them
 */
export async function getOptimizedDebts(groupId: string): Promise<{
  balances: Balance[];
  optimizedDebts: OptimizedDebt[];
}> {
  const balances = await calculateBalances(groupId);
  const optimizedDebts = optimizeDebts(balances);

  return { balances, optimizedDebts };
}

/**
 * Get summary statistics for a group
 */
export async function getBalanceSummary(groupId: string): Promise<{
  totalDebts: number;
  totalSettled: number;
  unsettledAmount: number;
  transactionsNeeded: number;
}> {
  const { balances, optimizedDebts } = await getOptimizedDebts(groupId);

  const unsettledAmount = balances
    .filter((b) => Math.abs(b.balance) > 0.01)
    .reduce((sum, b) => sum + Math.abs(b.balance), 0);

  return {
    totalDebts: balances.length,
    totalSettled: optimizedDebts.length,
    unsettledAmount: Math.round(unsettledAmount * 100) / 100,
    transactionsNeeded: optimizedDebts.length,
  };
}
