import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import {
  createAuthOptionsV4,
  type AuthConfig,
  getAvailableModesForRole,
  getDefaultModeForRole,
} from './aicr-auth-v4';

/**
 * NextAuth.js Configuration using @aicr/auth v4
 *
 * Configured for multi-tenant SGM application with:
 * - Synthetic binding mode for demo
 * - Operational mode integration (DESIGN, OPERATE, DISPUTE, OVERSEE)
 */

const authConfig: AuthConfig = {
  bindingMode: 'synthetic',
  providers: {
    credentials: true,
  },
  synthetic: {
    defaultRole: 'ADMIN',
    defaultTenantId: 'tenant-rcm-summit',
    defaultTenantSlug: 'rcm-summit',
    defaultTenantName: 'RCM Summit Demo',
    defaultTenantTier: 'DEMO',
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

// Create base auth options using @aicr/auth v4
const baseAuthOptions = createAuthOptionsV4({
  config: authConfig,
  CredentialsProvider,
}) as AuthOptions;

// Extend with operational mode support
export const authOptions: AuthOptions = {
  ...baseAuthOptions,
  callbacks: {
    ...baseAuthOptions.callbacks,
    async jwt({ token, user }) {
      // First, apply base auth handling
      const baseResult = baseAuthOptions.callbacks?.jwt
        ? await baseAuthOptions.callbacks.jwt({ token, user } as any)
        : token;

      // Add operational mode context
      const role = (baseResult.role as string) || 'USER';
      const availableModes = getAvailableModesForRole(role);
      const defaultMode = getDefaultModeForRole(role);

      return {
        ...baseResult,
        availableModes,
        defaultMode,
        currentMode: baseResult.currentMode || defaultMode,
      };
    },
    async session({ session, token }) {
      // First, apply base session handling
      const baseResult = baseAuthOptions.callbacks?.session
        ? await baseAuthOptions.callbacks.session({ session, token } as any)
        : session;

      // Add operational mode context to session
      if (baseResult.user) {
        (baseResult.user as any).currentMode = token.currentMode ?? null;
        (baseResult.user as any).availableModes = token.availableModes ?? [];
        (baseResult.user as any).defaultMode = token.defaultMode ?? null;
      }

      return baseResult;
    },
  },
};
