import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { UserRole } from '@prisma/client';

/**
 * Server-side helper za dobijanje trenutne sesije
 * Koristi se u Server Components i API routes
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

/**
 * Provera da li je korisnik autentifikovan
 */
export async function isAuthenticated() {
  const session = await getServerSession(authOptions);
  return !!session?.user;
}

/**
 * Provera da li korisnik ima određenu rolu
 */
export async function hasRole(role: UserRole) {
  const user = await getCurrentUser();
  return user?.role === role;
}

/**
 * Provera da li korisnik ima jednu od više rola
 */
export async function hasAnyRole(roles: UserRole[]) {
  const user = await getCurrentUser();
  return user ? roles.includes(user.role) : false;
}

/**
 * Provera da li je korisnik admin
 */
export async function isAdmin() {
  return hasRole(UserRole.ADMIN);
}

/**
 * Provera da li je korisnik editor ili admin
 */
export async function canCreateGroups() {
  return hasAnyRole([UserRole.ADMIN, UserRole.EDITOR]);
}