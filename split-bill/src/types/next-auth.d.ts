import { UserRole } from '@prisma/client';
import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

/**
 * TypeScript type extensions za NextAuth.js
 * Dodajemo custom polja u User, Session i JWT tipove
 */

declare module 'next-auth' {
  /**
   * Proširenje User interface-a
   * Dodaje role i avatarUrl u user objekat
   */
  interface User extends DefaultUser {
    role: UserRole;
    avatarUrl?: string | null;
  }

  /**
   * Proširenje Session interface-a
   * Dodaje id, role i avatarUrl u session.user
   */
  interface Session {
    user: {
      id: string;
      role: UserRole;
      avatarUrl?: string | null;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  /**
   * Proširenje JWT interface-a
   * Dodaje custom polja u JWT token
   */
  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole;
    avatarUrl?: string | null;
  }
}