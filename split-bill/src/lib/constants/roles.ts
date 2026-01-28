import { UserRole } from '@prisma/client';

/**
 * Role definitions i permissions
 */

export const ROLE_HIERARCHY = {
  [UserRole.ADMIN]: 3,
  [UserRole.EDITOR]: 2,
  [UserRole.USER]: 1,
} as const;

/**
 * Provera da li korisnik ima određenu rolu ili višu
 */
export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Route permissions - koje role mogu pristupiti kojim rutama
 */
export const ROUTE_PERMISSIONS = {
  // Admin-only routes
  '/admin': [UserRole.ADMIN],
  
  // Editor+ routes
  '/groups/create': [UserRole.ADMIN, UserRole.EDITOR],
  
  // Authenticated routes (sve role)
  '/dashboard': [UserRole.ADMIN, UserRole.EDITOR, UserRole.USER],
  '/groups': [UserRole.ADMIN, UserRole.EDITOR, UserRole.USER],
  '/profile': [UserRole.ADMIN, UserRole.EDITOR, UserRole.USER],
} as const;

/**
 * Provera da li korisnik može pristupiti određenoj ruti
 */
export function canAccessRoute(userRole: UserRole, route: string): boolean {
  // Pronađi matching permission
  for (const [path, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (route.startsWith(path)) {
      return allowedRoles.includes(userRole);
    }
  }
  
  // Ako ruta nije u permissions, dozvoli pristup (public route)
  return true;
}