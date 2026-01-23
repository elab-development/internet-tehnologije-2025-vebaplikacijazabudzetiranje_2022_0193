import { PrismaClient, UserRole, ExpenseCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ============================================
  // 1. KREIRANJE 3 TIPA KORISNIKA
  // ============================================
  console.log('👤 Creating users...');

  // ADMIN korisnik - puna kontrola
  const admin = await prisma.user.upsert({
    where: { email: 'admin@splitbill.com' },
    update: {},
    create: {
      email: 'admin@splitbill.com',
      passwordHash: await bcrypt.hash('Admin123!', 10),
      name: 'Admin User',
      emailVerified: true,
      role: UserRole.ADMIN,
      bio: 'System administrator with full access to all features.',
    },
  });
  console.log(`  ✅ Admin created: ${admin.email}`);

  // EDITOR korisnik - može kreirati grupe
  const editor = await prisma.user.upsert({
    where: { email: 'editor@splitbill.com' },
    update: {},
    create: {
      email: 'editor@splitbill.com',
      passwordHash: await bcrypt.hash('Editor123!', 10),
      name: 'Editor User',
      emailVerified: true,
      role: UserRole.EDITOR,
      bio: 'Content editor with group creation privileges.',
    },
  });
  console.log(`  ✅ Editor created: ${editor.email}`);

  // USER korisnik - obični korisnik
  const user1 = await prisma.user.upsert({
    where: { email: 'user@splitbill.com' },
    update: {},
    create: {
      email: 'user@splitbill.com',
      passwordHash: await bcrypt.hash('User123!', 10),
      name: 'Regular User',
      emailVerified: true,
      role: UserRole.USER,
      bio: 'Regular user with standard permissions.',
    },
  });
  console.log(`  ✅ User created: ${user1.email}`);

  // Dodatni obični korisnici za testiranje
  const user2 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      passwordHash: await bcrypt.hash('Alice123!', 10),
      name: 'Alice Johnson',
      emailVerified: true,
      role: UserRole.USER,
      bio: 'Love traveling and sharing expenses with friends!',
    },
  });
  console.log(`  ✅ User created: ${user2.email}`);

  const user3 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      passwordHash: await bcrypt.hash('Bob123!', 10),
      name: 'Bob Smith',
      emailVerified: true,
      role: UserRole.USER,
      bio: 'Roommate looking to split apartment costs fairly.',
    },
  });
  console.log(`  ✅ User created: ${user3.email}\n`);

  // ============================================
  // 2. KREIRANJE GRUPA
  // ============================================
  console.log('👥 Creating groups...');

  const group1 = await prisma.group.create({
    data: {
      name: 'Apartment Expenses',
      description: 'Shared costs for our apartment - rent, utilities, groceries',
      ownerId: admin.id,
      members: {
        create: [
          { userId: admin.id, isPending: false },
          { userId: user1.id, isPending: false },
          { userId: user2.id, isPending: false },
        ],
      },
    },
  });
  console.log(`  ✅ Group created: ${group1.name}`);

  const group2 = await prisma.group.create({
    data: {
      name: 'Paris Trip 2024',
      description: 'Vacation expenses for our trip to Paris',
      ownerId: editor.id,
      members: {
        create: [
          { userId: editor.id, isPending: false },
          { userId: user2.id, isPending: false },
          { userId: user3.id, isPending: false },
        ],
      },
    },
  });
  console.log(`  ✅ Group created: ${group2.name}`);

  const group3 = await prisma.group.create({
    data: {
      name: 'Weekend Getaway',
      description: 'Mountain cabin weekend with friends',
      ownerId: user1.id,
      members: {
        create: [
          { userId: user1.id, isPending: false },
          { userId: user3.id, isPending: false },
        ],
      },
    },
  });
  console.log(`  ✅ Group created: ${group3.name}\n`);

  // ============================================
  // 3. KREIRANJE TROŠKOVA SA PODELAMA
  // ============================================
  console.log('💰 Creating expenses...');

  // Trošak 1: Groceries (podjednako podeljeno)
  const expense1 = await prisma.expense.create({
    data: {
      groupId: group1.id,
      payerId: admin.id,
      description: 'Weekly groceries from supermarket',
      amount: 150.00,
      category: ExpenseCategory.FOOD,
      date: new Date('2024-01-15'),
      splits: {
        create: [
          { userId: admin.id, amount: 50.00 },
          { userId: user1.id, amount: 50.00 },
          { userId: user2.id, amount: 50.00 },
        ],
      },
    },
  });
  console.log(`  ✅ Expense created: ${expense1.description} (${expense1.amount} RSD)`);

  // Trošak 2: Electricity bill
  const expense2 = await prisma.expense.create({
    data: {
      groupId: group1.id,
      payerId: user1.id,
      description: 'Electricity bill - January',
      amount: 90.00,
      category: ExpenseCategory.BILLS,
      date: new Date('2024-01-20'),
      splits: {
        create: [
          { userId: admin.id, amount: 30.00 },
          { userId: user1.id, amount: 30.00 },
          { userId: user2.id, amount: 30.00 },
        ],
      },
    },
  });
  console.log(`  ✅ Expense created: ${expense2.description} (${expense2.amount} RSD)`);

  // Trošak 3: Paris hotel (različiti iznosi)
  const expense3 = await prisma.expense.create({
    data: {
      groupId: group2.id,
      payerId: editor.id,
      description: 'Hotel booking - 3 nights',
      amount: 450.00,
      category: ExpenseCategory.ACCOMMODATION,
      date: new Date('2024-02-01'),
      splits: {
        create: [
          { userId: editor.id, amount: 150.00 },
          { userId: user2.id, amount: 150.00 },
          { userId: user3.id, amount: 150.00 },
        ],
      },
    },
  });
  console.log(`  ✅ Expense created: ${expense3.description} (${expense3.amount} RSD)`);

  // Trošak 4: Train tickets
  const expense4 = await prisma.expense.create({
    data: {
      groupId: group2.id,
      payerId: user2.id,
      description: 'Train tickets to Paris',
      amount: 180.00,
      category: ExpenseCategory.TRANSPORT,
      date: new Date('2024-02-05'),
      splits: {
        create: [
          { userId: editor.id, amount: 60.00 },
          { userId: user2.id, amount: 60.00 },
          { userId: user3.id, amount: 60.00 },
        ],
      },
    },
  });
  console.log(`  ✅ Expense created: ${expense4.description} (${expense4.amount} RSD)`);

  // Trošak 5: Restaurant dinner
  const expense5 = await prisma.expense.create({
    data: {
      groupId: group2.id,
      payerId: user3.id,
      description: 'Dinner at Le Jules Verne',
      amount: 240.00,
      category: ExpenseCategory.ENTERTAINMENT,
      date: new Date('2024-02-10'),
      splits: {
        create: [
          { userId: editor.id, amount: 80.00 },
          { userId: user2.id, amount: 80.00 },
          { userId: user3.id, amount: 80.00 },
        ],
      },
    },
  });
  console.log(`  ✅ Expense created: ${expense5.description} (${expense5.amount} RSD)`);

  // Trošak 6: Cabin rental
  const expense6 = await prisma.expense.create({
    data: {
      groupId: group3.id,
      payerId: user1.id,
      description: 'Mountain cabin rental - weekend',
      amount: 200.00,
      category: ExpenseCategory.ACCOMMODATION,
      date: new Date('2024-03-01'),
      splits: {
        create: [
          { userId: user1.id, amount: 100.00 },
          { userId: user3.id, amount: 100.00 },
        ],
      },
    },
  });
  console.log(`  ✅ Expense created: ${expense6.description} (${expense6.amount} RSD)\n`);

  // ============================================
  // 4. KREIRANJE SETTLEMENTS (Poravnanja)
  // ============================================
  console.log('💸 Creating settlements...');

  const settlement1 = await prisma.settlement.create({
    data: {
      groupId: group1.id,
      fromUserId: user1.id,
      toUserId: admin.id,
      amount: 50.00,
      date: new Date('2024-01-25'),
      comment: 'Payment for groceries share',
    },
  });
  console.log(`  ✅ Settlement: ${user1.name} → ${admin.name} (${settlement1.amount} RSD)`);

  const settlement2 = await prisma.settlement.create({
    data: {
      groupId: group2.id,
      fromUserId: user3.id,
      toUserId: editor.id,
      amount: 150.00,
      date: new Date('2024-02-15'),
      comment: 'Hotel payment',
    },
  });
  console.log(`  ✅ Settlement: ${user3.name} → ${editor.name} (${settlement2.amount} RSD)\n`);

  // ============================================
  // 5. STATISTIKA
  // ============================================
  console.log('📊 Database seeding completed!\n');
  console.log('Summary:');
  console.log(`  👤 Users: 5 (1 ADMIN, 1 EDITOR, 3 USER)`);
  console.log(`  👥 Groups: 3`);
  console.log(`  💰 Expenses: 6`);
  console.log(`  🧮 Expense Splits: ${3 + 3 + 3 + 3 + 3 + 2}`);
  console.log(`  💸 Settlements: 2\n`);

  console.log('🔑 Login credentials:');
  console.log('  Admin:  admin@splitbill.com  / Admin123!');
  console.log('  Editor: editor@splitbill.com / Editor123!');
  console.log('  User:   user@splitbill.com   / User123!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });