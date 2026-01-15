/**
 * Client Configuration
 *
 * Manages the demo client name that appears throughout the application.
 * This allows users to customize the client name for demos and presentations.
 */

const CLIENT_NAME_KEY = 'sgm-demo-client-name';
const DEFAULT_CLIENT_NAME = 'Demo Client';

export interface ClientConfig {
  name: string;
  slug: string;
}

/**
 * Get the configured client name from localStorage
 */
export function getClientName(): string {
  if (typeof window === 'undefined') return DEFAULT_CLIENT_NAME;
  return localStorage.getItem(CLIENT_NAME_KEY) || DEFAULT_CLIENT_NAME;
}

/**
 * Set the client name in localStorage
 */
export function setClientName(name: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CLIENT_NAME_KEY, name.trim() || DEFAULT_CLIENT_NAME);
}

/**
 * Get client config with name and slug
 */
export function getClientConfig(): ClientConfig {
  const name = getClientName();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'demo-client';
  return { name, slug };
}

/**
 * Reset to default client name
 */
export function resetClientName(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CLIENT_NAME_KEY);
}

/**
 * Default client name constant for server-side rendering
 */
export const DEFAULT_CLIENT = DEFAULT_CLIENT_NAME;
