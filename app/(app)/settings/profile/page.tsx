'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { SetPageTitle } from '@/components/SetPageTitle';
import { PersonIcon, EnvelopeClosedIcon, IdCardIcon, CheckIcon, Pencil1Icon } from '@radix-ui/react-icons';
import { ThemeSettings } from '@/components/settings';

const ROLES = ['Admin', 'Manager', 'Analyst', 'User', 'Viewer'];

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'User',
  });

  // Initialize form data from session
  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || 'Guest',
        email: session.user.email || '',
        role: (session.user as any)?.role || 'User',
      });
    }
  }, [session]);

  const initials = formData.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Update session with new data
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: formData.name,
          role: formData.role,
        },
      });

      // Store in localStorage for persistence across refreshes in demo mode
      localStorage.setItem('demo-user-profile', JSON.stringify(formData));

      setSaveMessage('Profile updated successfully!');
      setIsEditing(false);

      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to session values
    if (session?.user) {
      setFormData({
        name: session.user.name || 'Guest',
        email: session.user.email || '',
        role: (session.user as any)?.role || 'User',
      });
    }
    setIsEditing(false);
  };

  return (
    <>
      <SetPageTitle title="Profile" description="View and manage your profile information" />
      <div className="min-h-screen sparcc-hero-bg">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[color:var(--color-foreground)]">Profile</h1>
              <p className="text-[color:var(--color-muted)] mt-1">Your account information</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-alt)] transition-colors"
              >
                <Pencil1Icon className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Success/Error Message */}
          {saveMessage && (
            <div
              className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
                saveMessage.includes('success')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              <CheckIcon className="w-4 h-4" />
              {saveMessage}
            </div>
          )}

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
                <div
                  className="w-24 h-24 rounded-full border-4 border-[color:var(--color-surface)] shadow-lg flex items-center justify-center text-white text-2xl font-bold"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg, var(--sparcc-gradient-start), var(--sparcc-gradient-mid2), var(--sparcc-gradient-end))',
                  }}
                >
                  {initials}
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">{formData.name}</h2>
                <p className="text-[color:var(--color-muted)]">{formData.role}</p>
              </div>

              <div className="space-y-4">
                {/* Full Name Field */}
                <div className="flex items-center gap-3 p-4 bg-[color:var(--color-surface-alt)] rounded-lg">
                  <PersonIcon className="w-5 h-5 text-[color:var(--color-muted)]" />
                  <div className="flex-1">
                    <p className="text-xs text-[color:var(--color-muted)]">Full Name</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-[color:var(--color-border)] rounded-md bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--sparcc-gradient-start)]"
                      />
                    ) : (
                      <p className="text-[color:var(--color-foreground)]">{formData.name}</p>
                    )}
                  </div>
                </div>

                {/* Email Field (read-only) */}
                <div className="flex items-center gap-3 p-4 bg-[color:var(--color-surface-alt)] rounded-lg">
                  <EnvelopeClosedIcon className="w-5 h-5 text-[color:var(--color-muted)]" />
                  <div className="flex-1">
                    <p className="text-xs text-[color:var(--color-muted)]">Email Address</p>
                    <p className="text-[color:var(--color-foreground)]">{formData.email || 'Not provided'}</p>
                    {isEditing && (
                      <p className="text-xs text-[color:var(--color-muted)] mt-1">Email cannot be changed</p>
                    )}
                  </div>
                </div>

                {/* Role Field */}
                <div className="flex items-center gap-3 p-4 bg-[color:var(--color-surface-alt)] rounded-lg">
                  <IdCardIcon className="w-5 h-5 text-[color:var(--color-muted)]" />
                  <div className="flex-1">
                    <p className="text-xs text-[color:var(--color-muted)]">Role</p>
                    {isEditing ? (
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-[color:var(--color-border)] rounded-md bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--sparcc-gradient-start)]"
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-[color:var(--color-foreground)]">{formData.role}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4 border-t border-[color:var(--color-border)]">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    style={{
                      backgroundImage:
                        'linear-gradient(135deg, var(--sparcc-gradient-start), var(--sparcc-gradient-mid2), var(--sparcc-gradient-end))',
                    }}
                  >
                    <CheckIcon className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 py-2 text-[color:var(--color-foreground)] font-medium rounded-lg border border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-alt)] transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {!isEditing && (
                <p className="text-xs text-[color:var(--color-muted)] text-center pt-4 border-t border-[color:var(--color-border)]">
                  Click &quot;Edit Profile&quot; to update your information
                </p>
              )}
            </div>
          </div>

          {/* Appearance Section */}
          <div className="mt-8 bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] p-6">
            <h2 className="text-lg font-semibold text-[color:var(--color-foreground)] mb-4">
              Appearance
            </h2>
            <ThemeSettings />
          </div>
        </div>
      </div>
    </>
  );
}
