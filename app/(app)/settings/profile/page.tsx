'use client';

import { useSession } from 'next-auth/react';
import { SetPageTitle } from '@/components/SetPageTitle';
import { PersonIcon, EnvelopeClosedIcon, IdCardIcon } from '@radix-ui/react-icons';

export default function ProfilePage() {
  const { data: session } = useSession();

  const user = {
    name: session?.user?.name || 'Guest',
    email: session?.user?.email || '',
    role: (session?.user as any)?.role || 'User',
    image: session?.user?.image,
  };

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <>
      <SetPageTitle title="Profile" description="View and manage your profile information" />
      <div className="min-h-screen sparcc-hero-bg">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[color:var(--color-foreground)]">Profile</h1>
            <p className="text-[color:var(--color-muted)] mt-1">Your account information</p>
          </div>

          {/* Profile Card */}
          <div className="bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] overflow-hidden">
            {/* Header with gradient */}
            <div
              className="h-24"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, var(--sparcc-gradient-start), var(--sparcc-gradient-mid2), var(--sparcc-gradient-end))',
              }}
            />

            {/* Avatar */}
            <div className="relative px-6">
              <div className="-mt-12 mb-4">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-24 h-24 rounded-full border-4 border-[color:var(--color-surface)] shadow-lg"
                  />
                ) : (
                  <div
                    className="w-24 h-24 rounded-full border-4 border-[color:var(--color-surface)] shadow-lg flex items-center justify-center text-white text-2xl font-bold"
                    style={{
                      backgroundImage:
                        'linear-gradient(135deg, var(--sparcc-gradient-start), var(--sparcc-gradient-mid2), var(--sparcc-gradient-end))',
                    }}
                  >
                    {initials}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">{user.name}</h2>
                <p className="text-[color:var(--color-muted)]">{user.role}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-[color:var(--color-surface-alt)] rounded-lg">
                  <PersonIcon className="w-5 h-5 text-[color:var(--color-muted)]" />
                  <div>
                    <p className="text-xs text-[color:var(--color-muted)]">Full Name</p>
                    <p className="text-[color:var(--color-foreground)]">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-[color:var(--color-surface-alt)] rounded-lg">
                  <EnvelopeClosedIcon className="w-5 h-5 text-[color:var(--color-muted)]" />
                  <div>
                    <p className="text-xs text-[color:var(--color-muted)]">Email Address</p>
                    <p className="text-[color:var(--color-foreground)]">{user.email || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-[color:var(--color-surface-alt)] rounded-lg">
                  <IdCardIcon className="w-5 h-5 text-[color:var(--color-muted)]" />
                  <div>
                    <p className="text-xs text-[color:var(--color-muted)]">Role</p>
                    <p className="text-[color:var(--color-foreground)]">{user.role}</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[color:var(--color-muted)] text-center pt-4 border-t border-[color:var(--color-border)]">
                Profile information is managed through your authentication provider
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
