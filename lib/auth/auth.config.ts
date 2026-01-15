import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import {
  getAvailableModesForRole,
  getDefaultModeForRole,
} from './mode-permissions';

/**
 * NextAuth.js Configuration (Standalone - no @rally/auth dependency)
 *
 * Configured for multi-tenant SGM application with:
 * - Credentials (passkey) for demo
 * - Google OAuth (optional)
 * - GitHub OAuth (optional)
 * - Synthetic mode support for offline/demo operation
 */

// Build provider array dynamically
const providers: any[] = [
  CredentialsProvider({
    id: 'passkey',
    name: 'Email',
    credentials: {
      passkey: { label: 'Email', type: 'email' },
    },
    async authorize(credentials: any) {
      // Demo mode: accept any valid email
      const email = credentials?.passkey?.trim();
      if (email && email.includes('@')) {
        // Extract name from email
        const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
        return {
          id: `user-${email.replace(/[^a-z0-9]/gi, '-')}`,
          name: name || 'Demo User',
          email: email,
        };
      }
      return null;
    },
  }),
];

// Add Google if configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
  );
}

// Add GitHub if configured
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  );
}

export const authOptions: AuthOptions = {
  providers,

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },

  callbacks: {
    async signIn({ user }) {
      const bindingMode = process.env.BINDING_MODE || 'synthetic';

      // Skip database operations in synthetic mode
      if (bindingMode === 'synthetic') {
        return true;
      }

      // In database mode, check tenant status
      if (process.env.DATABASE_URL) {
        try {
          const { prisma } = require('@/lib/db/prisma');
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { tenant: true },
          });

          if (existingUser?.tenant?.status !== 'ACTIVE' && existingUser?.tenant) {
            console.error(`Tenant ${existingUser.tenant.slug} is not active`);
            return false;
          }
        } catch {
          // Database not available, allow sign-in
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      const bindingMode = process.env.BINDING_MODE || 'synthetic';

      // On initial sign-in
      if (user) {
        // In synthetic mode, add mock data
        if (bindingMode === 'synthetic') {
          token.userId = user.id || 'demo-user-001';
          token.role = 'ADMIN';
          token.tenantId = 'demo-tenant-001';
          token.tenantSlug = 'demo';
          token.tenantName = 'Demo Organization';
          token.tenantTier = 'DEMO';
        } else if (process.env.DATABASE_URL) {
          // Add tenant info from database
          try {
            const { prisma } = require('@/lib/db/prisma');
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email! },
              include: { tenant: true },
            });

            if (dbUser) {
              token.userId = dbUser.id;
              token.role = dbUser.role;
              token.tenantId = dbUser.tenantId;
              token.tenantSlug = dbUser.tenant.slug;
              token.tenantName = dbUser.tenant.name;
              token.tenantTier = dbUser.tenant.tier;
            }
          } catch {
            // Database not available, use defaults
            token.userId = user.id;
            token.role = 'USER';
            token.tenantSlug = 'demo';
            token.tenantName = 'Demo';
            token.tenantTier = 'DEMO';
          }
        }

        // Add operational mode context
        const role = (token.role as string) || 'USER';
        const availableModes = getAvailableModesForRole(role);
        const defaultMode = getDefaultModeForRole(role);
        token.availableModes = availableModes;
        token.defaultMode = defaultMode;
        token.currentMode = token.currentMode || defaultMode;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId as string;
        (session.user as any).role = token.role as string;
        (session.user as any).tenantId = token.tenantId as string;
        (session.user as any).tenantSlug = token.tenantSlug as string;
        (session.user as any).tenantName = token.tenantName as string;
        (session.user as any).tenantTier = token.tenantTier as string;
        (session.user as any).currentMode = token.currentMode ?? null;
        (session.user as any).availableModes = token.availableModes ?? [];
        (session.user as any).defaultMode = token.defaultMode ?? null;
      }

      return session;
    },
  },

  events: {
    async signIn({ user, isNewUser }) {
      const bindingMode = process.env.BINDING_MODE || 'synthetic';

      // Skip database operations in synthetic mode
      if (bindingMode === 'synthetic' || !process.env.DATABASE_URL) {
        return;
      }

      if (isNewUser) {
        console.log(`New user signed up: ${user.email}`);

        try {
          const { prisma } = require('@/lib/db/prisma');
          const emailDomain = user.email!.split('@')[1];
          let tenantSlug = 'demo';

          if (emailDomain === 'henryschein.com') {
            tenantSlug = 'henryschein';
          } else if (emailDomain.includes('bluehorizonsgroup')) {
            tenantSlug = 'bhg';
          }

          const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
          });

          if (tenant) {
            await prisma.user.update({
              where: { email: user.email! },
              data: {
                tenantId: tenant.id,
                role: emailDomain === 'demo.com' ? 'ADMIN' : 'USER',
              },
            });
          }
        } catch (error) {
          console.error('Failed to assign tenant:', error);
        }
      }
    },
  },

  debug: process.env.NODE_ENV === 'development',
};
