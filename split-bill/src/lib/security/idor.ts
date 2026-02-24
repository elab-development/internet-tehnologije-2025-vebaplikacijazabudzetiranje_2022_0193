import { prisma } from '@/lib/db';

/**
 * IDOR (Insecure Direct Object Reference) Protection
 * Validacija da korisnik ima pristup resursu
 */

/**
 * Provera da li korisnik ima pristup grupi
 */
export async function validateGroupAccess(
  userId: string,
  groupId: string
): Promise<boolean> {
  const membership = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId,
      isPending: false,
    },
  });

  return !!membership;
}

/**
 * Provera da li je korisnik vlasnik grupe
 */
export async function validateGroupOwnership(
  userId: string,
  groupId: string
): Promise<boolean> {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { ownerId: true },
  });

  return group?.ownerId === userId;
}

/**
 * Provera da li korisnik ima pristup trošku
 * (mora biti član grupe u kojoj je trošak)
 */
export async function validateExpenseAccess(
  userId: string,
  expenseId: string
): Promise<boolean> {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    select: { groupId: true },
  });

  if (!expense) return false;

  return validateGroupAccess(userId, expense.groupId);
}

/**
 * Provera da li korisnik može menjati trošak
 * (mora biti kreator troška ili vlasnik grupe)
 */
export async function validateExpenseModification(
  userId: string,
  expenseId: string
): Promise<boolean> {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      group: {
        select: { ownerId: true },
      },
    },
  });

  if (!expense) return false;

  // Korisnik je kreator troška ili vlasnik grupe
  return expense.payerId === userId || expense.group.ownerId === userId;
}

/**
 * Provera da li korisnik može videti profil drugog korisnika
 * (moraju biti u istoj grupi)
 */
export async function validateUserProfileAccess(
  requesterId: string,
  targetUserId: string
): Promise<boolean> {
  // Korisnik može videti svoj profil
  if (requesterId === targetUserId) return true;

  // Proveri da li dele neku grupu
  const sharedGroup = await prisma.groupMember.findFirst({
    where: {
      userId: requesterId,
      isPending: false,
      group: {
        members: {
          some: {
            userId: targetUserId,
            isPending: false,
          },
        },
      },
    },
  });

  return !!sharedGroup;
}

/**
 * Generic resource ownership validation
 */
export async function validateResourceOwnership<T extends { id: string }>(
  model: any,
  resourceId: string,
  userId: string,
  ownerField: string = 'userId'
): Promise<boolean> {
  const resource = await model.findUnique({
    where: { id: resourceId },
    select: { [ownerField]: true },
  });

  if (!resource) return false;

  return resource[ownerField] === userId;
}
