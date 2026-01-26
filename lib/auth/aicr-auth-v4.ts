/**
 * @aicr/auth v4 - Inlined for deployment
 *
 * Self-contained auth configuration for NextAuth v4
 * Originally from @aicr/auth package, inlined to remove external dependency.
 */

// ============================================================================
// Types
// ============================================================================

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'USER'
  | 'VIEWER'
  | 'GUEST';

export type TenantTier =
  | 'FREE'
  | 'STARTER'
  | 'PRO'
  | 'ENTERPRISE'
  | 'DEMO';

export enum OperationalMode {
  DESIGN = 'DESIGN',
  OPERATE = 'OPERATE',
  DISPUTE = 'DISPUTE',
  OVERSEE = 'OVERSEE',
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: UserRole;
  tenantId: string | null;
  tenantSlug: string | null;
  tenantName: string | null;
  tenantTier: TenantTier | null;
  currentMode: OperationalMode | null;
  availableModes: OperationalMode[];
  defaultMode: OperationalMode | null;
}

export type BindingMode = 'synthetic' | 'database' | 'mapped';

export interface AuthConfig {
  bindingMode: BindingMode;
  basePath?: string;
  pages?: {
    signIn?: string;
    signOut?: string;
    error?: string;
    verifyRequest?: string;
    newUser?: string;
  };
  session?: {
    maxAge?: number;
    updateAge?: number;
  };
  providers?: {
    credentials?: boolean;
    google?: { clientId: string; clientSecret: string };
    github?: { clientId: string; clientSecret: string };
  };
  synthetic?: {
    defaultRole?: UserRole;
    defaultTenantId?: string;
    defaultTenantSlug?: string;
    defaultTenantName?: string;
    defaultTenantTier?: TenantTier;
  };
  callbacks?: {
    onSignIn?: (user: AuthUser) => Promise<boolean>;
    onCreateUser?: (user: AuthUser) => Promise<void>;
  };
}

// ============================================================================
// Mode Permissions
// ============================================================================

interface ModeConfig {
  allowedRoles: UserRole[];
}

const MODE_CONFIGS: Record<OperationalMode, ModeConfig> = {
  [OperationalMode.DESIGN]: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  },
  [OperationalMode.OPERATE]: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'VIEWER'],
  },
  [OperationalMode.DISPUTE]: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER'],
  },
  [OperationalMode.OVERSEE]: {
    allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
  },
};

export function canAccessMode(
  role: UserRole | string | undefined,
  mode: OperationalMode
): boolean {
  if (!role) return false;
  const config = MODE_CONFIGS[mode];
  return config.allowedRoles.includes(role as UserRole);
}

export function getAvailableModesForRole(
  role: UserRole | string | undefined
): OperationalMode[] {
  if (!role) return [];
  return Object.values(OperationalMode).filter((mode) =>
    canAccessMode(role, mode)
  );
}

export function getDefaultModeForRole(
  role: UserRole | string | undefined
): OperationalMode | null {
  if (!role) return null;
  if (role === 'GUEST') return null;
  return OperationalMode.OPERATE;
}

// ============================================================================
// Synthetic User Helper
// ============================================================================

function createSyntheticUser(
  email: string,
  config: AuthConfig
): Partial<AuthUser> {
  const name = email
    .split('@')[0]
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const role = config.synthetic?.defaultRole || 'ADMIN';
  const availableModes = getAvailableModesForRole(role);
  const defaultMode = getDefaultModeForRole(role);

  return {
    id: `user-${email.replace(/[^a-z0-9]/gi, '-')}`,
    email,
    name,
    role,
    tenantId: config.synthetic?.defaultTenantId || 'demo-tenant-001',
    tenantSlug: config.synthetic?.defaultTenantSlug || 'demo',
    tenantName: config.synthetic?.defaultTenantName || 'Demo Organization',
    tenantTier: config.synthetic?.defaultTenantTier || 'DEMO',
    currentMode: defaultMode,
    availableModes,
    defaultMode,
  };
}

// ============================================================================
// Auth Options Factory
// ============================================================================

export interface CreateAuthOptionsV4 {
  config: AuthConfig;
  CredentialsProvider: any;
  GoogleProvider?: any;
  GitHubProvider?: any;
  findUserByEmail?: (email: string) => Promise<any | null>;
  comparePassword?: (password: string, hash: string) => Promise<boolean>;
}

export function createAuthOptionsV4(options: CreateAuthOptionsV4): Record<string, any> {
  const {
    config,
    CredentialsProvider,
    GoogleProvider,
    GitHubProvider,
    findUserByEmail,
    comparePassword,
  } = options;
  const isSynthetic = config.bindingMode === 'synthetic';

  const providers: any[] = [];

  // Credentials provider
  if (config.providers?.credentials !== false && CredentialsProvider) {
    providers.push(
      CredentialsProvider({
        id: 'credentials',
        name: 'Email',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials: Record<string, string> | undefined) {
          const email = credentials?.email?.trim()?.toLowerCase();
          const password = credentials?.password;

          if (!email || !email.includes('@')) {
            return null;
          }

          if (isSynthetic) {
            return createSyntheticUser(email, config);
          }

          if (findUserByEmail) {
            const dbUser = await findUserByEmail(email);
            if (!dbUser || dbUser.isActive === false) {
              return null;
            }

            if (password && dbUser.password && comparePassword) {
              const isValid = await comparePassword(password, dbUser.password);
              if (!isValid) return null;
            } else if (!isSynthetic && dbUser.password) {
              return null;
            }

            const role = (dbUser.role as UserRole) || 'USER';
            const availableModes = getAvailableModesForRole(role);
            const defaultMode = getDefaultModeForRole(role);

            return {
              id: dbUser.id,
              email: dbUser.email,
              name: dbUser.name,
              role,
              tenantId: dbUser.tenant?.id || null,
              tenantSlug: dbUser.tenant?.slug || null,
              tenantName: dbUser.tenant?.name || null,
              tenantTier: dbUser.tenant?.tier || null,
              currentMode: defaultMode,
              availableModes,
              defaultMode,
            };
          }

          return null;
        },
      })
    );
  }

  // Google provider
  if (config.providers?.google && GoogleProvider) {
    providers.push(
      GoogleProvider({
        clientId: config.providers.google.clientId,
        clientSecret: config.providers.google.clientSecret,
        authorization: {
          params: { access_type: 'offline', prompt: 'consent' },
        },
      })
    );
  }

  // GitHub provider
  if (config.providers?.github && GitHubProvider) {
    providers.push(
      GitHubProvider({
        clientId: config.providers.github.clientId,
        clientSecret: config.providers.github.clientSecret,
      })
    );
  }

  return {
    providers,

    session: {
      strategy: 'jwt',
      maxAge: config.session?.maxAge || 30 * 24 * 60 * 60,
    },

    pages: {
      signIn: config.pages?.signIn || '/auth/signin',
      signOut: config.pages?.signOut || '/auth/signout',
      error: config.pages?.error || '/auth/error',
      verifyRequest: config.pages?.verifyRequest || '/auth/verify',
      newUser: config.pages?.newUser || '/auth/new-user',
    },

    callbacks: {
      async signIn({ user }: { user: any }) {
        if (config.callbacks?.onSignIn) {
          return config.callbacks.onSignIn(user as AuthUser);
        }
        return true;
      },

      async jwt({ token, user }: { token: any; user?: any }) {
        if (user) {
          if (isSynthetic && user.email) {
            const syntheticUser = createSyntheticUser(user.email, config);
            token.userId = syntheticUser.id;
            token.role = syntheticUser.role;
            token.tenantId = syntheticUser.tenantId;
            token.tenantSlug = syntheticUser.tenantSlug;
            token.tenantName = syntheticUser.tenantName;
            token.tenantTier = syntheticUser.tenantTier;
            token.availableModes = syntheticUser.availableModes;
            token.defaultMode = syntheticUser.defaultMode;
            token.currentMode = syntheticUser.currentMode;
          } else {
            token.userId = user.id;
            token.role = user.role || 'USER';
            token.tenantId = user.tenantId;
            token.tenantSlug = user.tenantSlug;
            token.tenantName = user.tenantName;
            token.tenantTier = user.tenantTier;
            token.availableModes = user.availableModes || [];
            token.defaultMode = user.defaultMode;
            token.currentMode = user.currentMode;
          }
        }
        return token;
      },

      async session({ session, token }: { session: any; token: any }) {
        if (session.user) {
          session.user.id = token.userId;
          session.user.role = token.role;
          session.user.tenantId = token.tenantId;
          session.user.tenantSlug = token.tenantSlug;
          session.user.tenantName = token.tenantName;
          session.user.tenantTier = token.tenantTier;
          session.user.currentMode = token.currentMode ?? null;
          session.user.availableModes = token.availableModes ?? [];
          session.user.defaultMode = token.defaultMode ?? null;
        }
        return session;
      },
    },

    events: {
      async signIn({ user, isNewUser }: { user: any; isNewUser?: boolean }) {
        if (isNewUser && config.callbacks?.onCreateUser) {
          await config.callbacks.onCreateUser(user as AuthUser);
        }
      },
    },

    debug: process.env.NODE_ENV === 'development',
  };
}
