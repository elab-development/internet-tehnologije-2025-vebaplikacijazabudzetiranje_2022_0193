# 💰 Expense Features & Debt Optimization

## Overview

Advanced expense management with flexible split methods and intelligent debt optimization to minimize transactions needed to settle all balances.

---

## Split Methods

Every expense can be split between group members in three different ways:

### 1️⃣ Equal Split (Default)

Divide expense equally among all participants.

**Use Cases:**
- Splitting dinner bill equally
- Shared accommodation costs
- Group entertainment expenses

**Example:**
```
Expense: $90 for dinner
Participants: Alice, Bob, Charlie
Split: $30 each
```

**Algorithm:**
```
amount_per_person = total_amount / number_of_participants
last_person_gets = total_amount - (amount_per_person * (number - 1))
```

---

### 2️⃣ Percentage Split

Each participant's share specified as a percentage.

**Use Cases:**
- Income-based splitting (different financial situations)
- Weighted contributions
- Fair split based on usage

**Example:**
```
Expense: $100 for hotel
Alice: 50% ($50)
Bob: 30% ($30)
Charlie: 20% ($20)
```

**Validation:**
- ✅ All percentages must sum to 100%
- ✅ Each percentage between 0-100
- ✅ All participants must have percentage defined

---

### 3️⃣ Exact Amount Split

Each participant specifies exact amount they owe.

**Use Cases:**
- Different consumption levels
- Itemized billing
- Custom splits

**Example:**
```
Expense: $100 for groceries
Alice: $40 (ate more)
Bob: $35
Charlie: $25
Total: $100 ✅
```

**Validation:**
- ✅ All amounts must sum to total expense
- ✅ Each amount >= 0
- ✅ All participants must have amount defined

---

## Debt Optimization Algorithm

After all expenses are recorded, SplitBill calculates the minimum number of transactions needed to settle all debts.

### How It Works

**Step 1: Calculate Net Balances**
```
For each user:
  balance = amount_paid - amount_owed

positive balance = owed money
negative balance = owes money
```

**Example:**
```
Alice paid $300, owes $100 → balance: +$200
Bob paid $50, owes $150 → balance: -$100
Charlie paid $150, owes $200 → balance: -$50
```

**Step 2: Match Creditors & Debtors**

Uses greedy algorithm to minimize transactions:
1. Sort creditors by balance (highest first)
2. Sort debtors by balance (highest first)
3. Match creditors with debtors
4. Record transaction for matched amount
5. Continue until all settled

**Example:**
```
Creditors:
  Alice: +$200
  Charlie: +$50

Debtors:
  Bob: -$100
  Remaining creditor: -$50

Transactions:
1. Bob → Alice: $100
2. Remaining → Alice: $50
```

**Result:** 2 transactions instead of 6 possible combinations

---

## Database Schema

### Expense Model

```prisma
model Expense {
  id          String          @id @default(cuid())
  groupId     String          @map("group_id")
  payerId     String          @map("payer_id")
  description String
  amount      Decimal         @db.Decimal(10, 2)
  category    ExpenseCategory
  date        DateTime
  splitMethod SplitMethod     @default(EQUAL)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  group  Group          @relation(fields: [groupId], references: [id])
  payer  User           @relation("ExpensePayer", fields: [payerId], references: [id])
  splits ExpenseSplit[]

  @@map("expenses")
}

enum SplitMethod {
  EQUAL       // Podjednako
  PERCENTAGE  // Po procentima
  EXACT       // Tačni iznosi
}
```

---

## API Endpoints

### Get Balances & Optimized Debts

```
GET /api/groups/{groupId}/balances
```

**Response:**
```json
{
  "balances": [
    {
      "userId": "alice-id",
      "userName": "Alice",
      "balance": 200.00
    },
    {
      "userId": "bob-id",
      "userName": "Bob",
      "balance": -100.00
    },
    {
      "userId": "charlie-id",
      "userName": "Charlie",
      "balance": -50.00
    }
  ],
  "optimizedDebts": [
    {
      "from": "bob-id",
      "fromName": "Bob",
      "to": "alice-id",
      "toName": "Alice",
      "amount": 100.00
    },
    {
      "from": "charlie-id",
      "fromName": "Charlie",
      "to": "alice-id",
      "toName": "Alice",
      "amount": 50.00
    }
  ],
  "summary": {
    "totalDebts": 3,
    "totalSettled": 2,
    "unsettledAmount": 150.00,
    "transactionsNeeded": 2
  }
}
```

---

## Usage Examples

### Equal Split

```typescript
import { calculateSplit } from '@/lib/calculations/split-expense';

const split = calculateSplit({
  totalAmount: 90,
  participantIds: ['alice', 'bob', 'charlie'],
  splitMethod: 'EQUAL',
});

console.log(split);
// Output: { alice: 30, bob: 30, charlie: 30 }
```

### Percentage Split

```typescript
const split = calculateSplit({
  totalAmount: 100,
  participantIds: ['alice', 'bob', 'charlie'],
  splitMethod: 'PERCENTAGE',
  splits: {
    alice: 50,
    bob: 30,
    charlie: 20,
  },
});

console.log(split);
// Output: { alice: 50, bob: 30, charlie: 20 }
```

### Exact Split

```typescript
const split = calculateSplit({
  totalAmount: 100,
  participantIds: ['alice', 'bob', 'charlie'],
  splitMethod: 'EXACT',
  splits: {
    alice: 40,
    bob: 35,
    charlie: 25,
  },
});

console.log(split);
// Output: { alice: 40, bob: 35, charlie: 25 }
```

### Validation

```typescript
import { validateSplit } from '@/lib/calculations/split-expense';

const validation = validateSplit({
  totalAmount: 100,
  participantIds: ['alice', 'bob'],
  splitMethod: 'PERCENTAGE',
  splits: { alice: 50, bob: 40 }, // Invalid: sum is 90, not 100
});

console.log(validation);
// Output: { valid: false, error: 'Percentages must sum to 100, got 90' }
```

### Get Optimized Debts

```typescript
import { getOptimizedDebts } from '@/lib/calculations/optimize-debts';

const { balances, optimizedDebts } = await getOptimizedDebts('group-123');

console.log('Current balances:');
balances.forEach((b) => {
  console.log(`${b.userName}: ${b.balance > 0 ? 'owed' : 'owes'} $${Math.abs(b.balance)}`);
});

console.log('Transactions to settle all debts:');
optimizedDebts.forEach((debt) => {
  console.log(`${debt.fromName} → ${debt.toName}: $${debt.amount}`);
});
```

---

## React Component Integration

### Display Balances

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Balance } from '@/lib/calculations/optimize-debts';

export function GroupBalances({ groupId }: { groupId: string }) {
  const [balances, setBalances] = useState<Balance[]>([]);

  useEffect(() => {
    fetch(`/api/groups/${groupId}/balances`)
      .then((r) => r.json())
      .then((data) => setBalances(data.balances));
  }, [groupId]);

  return (
    <div className="space-y-2">
      {balances.map((b) => (
        <div key={b.userId} className="flex justify-between p-3 bg-gray-50 rounded">
          <span>{b.userName}</span>
          <span className={b.balance > 0 ? 'text-green-600' : 'text-red-600'}>
            {b.balance > 0 ? '+' : ''}${Math.abs(b.balance).toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}
```

### Show Settlement Instructions

```typescript
'use client';

import { OptimizedDebt } from '@/lib/calculations/optimize-debts';

export function SettlementPlan({ debts }: { debts: OptimizedDebt[] }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">How to settle all debts:</h3>
      {debts.map((debt, i) => (
        <div key={i} className="p-3 bg-blue-50 border border-blue-200 rounded">
          <p>
            <strong>{debt.fromName}</strong> pays{' '}
            <strong>${debt.amount.toFixed(2)}</strong> to{' '}
            <strong>{debt.toName}</strong>
          </p>
        </div>
      ))}
    </div>
  );
}
```

---

## Error Handling

### Common Validation Errors

```typescript
// Percentages don't sum to 100
calculateSplit({
  totalAmount: 100,
  participantIds: ['a', 'b'],
  splitMethod: 'PERCENTAGE',
  splits: { a: 50, b: 40 }, // Error: sum is 90
});
// Error: Percentages must sum to 100, got 90

// Amounts don't sum to total
calculateSplit({
  totalAmount: 100,
  participantIds: ['a', 'b'],
  splitMethod: 'EXACT',
  splits: { a: 40, b: 50 }, // Error: sum is 90
});
// Error: Amounts must sum to 100, got 90

// Missing participant split
validateSplit({
  totalAmount: 100,
  participantIds: ['a', 'b', 'c'],
  splitMethod: 'PERCENTAGE',
  splits: { a: 50, b: 50 }, // Error: c not defined
});
// Error: Missing split for participant: c

// Negative amount
calculateSplit({
  totalAmount: -100,
  participantIds: ['a'],
  splitMethod: 'EQUAL',
});
// Error: Amount must be greater than 0
```

---

## Performance Considerations

### Optimization Algorithm Complexity

- **Time:** O(n log n) where n = number of users
  - Sorting: O(n log n)
  - Matching: O(n)
- **Space:** O(n) for storing balances and debts

### Caching Strategy

- **Balances:** NOT cached (always fresh)
- **Optimized debts:** Recalculated on each request
- **API Response:** No-cache headers

### Scalability

- Efficient for groups up to 1000+ members
- Database queries optimized with Prisma
- Minimal memory footprint

---

## Examples & Scenarios

### Scenario 1: Weekend Trip

**Expenses:**
1. Alice paid $300 for accommodation (3 people equally) → Each owes $100
2. Bob paid $90 for food (3 people equally) → Each owes $30
3. Charlie paid $60 for activities (3 people equally) → Each owes $20

**Balances:**
- Alice: +$200 (paid $300, owes $100)
- Bob: +$60 (paid $90, owes $30)
- Charlie: +$40 (paid $60, owes $20)

**Settlement:**
1. Alice receives $200 (total owed)
2. Bob receives $60 (total owed)
3. Charlie receives $40 (total owed)
- **Only 3 transactions needed** instead of 9 possible combinations

### Scenario 2: Unequal Contributions

**Expense:** $200 for groceries
- Alice: 50% (high income)
- Bob: 30% (medium income)
- Charlie: 20% (lower income)

**Splits:**
- Alice: $100
- Bob: $60
- Charlie: $40

### Scenario 3: Itemized Bill

**Expense:** $150 restaurant bill
- Alice had steak: $40
- Bob had chicken: $35
- Charlie had pasta: $25
- Tip: $50 (split equally, each adds $16.67)

**Total splits:**
- Alice: $56.67
- Bob: $51.67
- Charlie: $41.67

---

## Migration Guide

When updating from previous version:

1. Run migration: `npx prisma migrate dev --name add_split_method`
2. Existing expenses default to `EQUAL` split
3. No data loss - existing splits remain unchanged
4. New expenses can use any split method

---

## Future Enhancements

- [ ] Custom split with item-level tracking
- [ ] Recurring expenses
- [ ] Expense templates
- [ ] Split with tax/tip handling
- [ ] Expense disputes/corrections
- [ ] Multi-currency expense splitting
- [ ] Bulk settlement recording
- [ ] Expense history/audit log
- [ ] SMS/push notifications for settlements
- [ ] Integration with payment platforms (Venmo, PayPal)

---

## API Reference Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/groups/{id}/balances` | GET | Get current balances and optimized debts |
| `/api/expenses` | POST | Create expense with split method |
| `/api/expenses/{id}` | GET | Get expense details with splits |
| `/api/expenses/{id}` | PATCH | Update expense |
| `/api/expenses/{id}` | DELETE | Delete expense (recalculates balances) |

---

## Resources

- [Expense splitting algorithms](https://en.wikipedia.org/wiki/Traveler%27s_dilemma)
- [Greedy algorithm optimization](https://en.wikipedia.org/wiki/Greedy_algorithm)
- [Debt settlement complexity](https://en.wikipedia.org/wiki/Partition_problem)
