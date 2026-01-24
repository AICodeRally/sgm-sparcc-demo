export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.SENTRY_DSN) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = await import(/* webpackIgnore: true */ '@sentry/nextjs' as string) as {
      init: (options: { dsn: string | undefined; tracesSampleRate: number; environment: string | undefined }) => void;
    };
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV,
    });
  }
}
