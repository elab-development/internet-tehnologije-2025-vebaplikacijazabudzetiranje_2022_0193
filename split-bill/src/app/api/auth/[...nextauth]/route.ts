import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

/**
 * NextAuth.js konfiguracija
 * Koristi Credentials provider za email/password autentifikaciju
 * JWT strategija za session management
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email', 
          placeholder: 'user@example.com' 
        },
        password: { 
          label: 'Password', 
          type: 'password' 
        },
      },
      
      async authorize(credentials) {
        // Validacija input-a
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        // Pronađi korisnika u bazi
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Proveri da li korisnik postoji
        if (!user) {
          throw new Error('Invalid email or password');
        }

        // Proveri da li je email verifikovan
        if (!user.emailVerified) {
          throw new Error('Please verify your email before logging in');
        }

        // Proveri lozinku
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        // Vrati korisničke podatke (biće dodati u JWT token)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
        };
      },
    }),
  ],

  // Koristi JWT umesto database sessions
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dana
  },

  // Callbacks za manipulaciju JWT tokena i sesije
  callbacks: {
    /**
     * JWT callback - poziva se kada se kreira ili ažurira token
     * Dodajemo custom polja (role, id) u token
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatarUrl = user.avatarUrl;
      }
      return token;
    },

    /**
     * Session callback - poziva se kada getServerSession() ili useSession() traže sesiju
     * Dodajemo podatke iz tokena u session objekat
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.avatarUrl = token.avatarUrl as string | null;
      }
      return session;
    },
  },

  // Custom stranice
  pages: {
    signIn: '/login',      // Custom login stranica
    error: '/login',       // Error redirect
  },

  // Debug mode u development-u
  debug: process.env.NODE_ENV === 'development',
};

// Export GET i POST handlers za Next.js App Router
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };