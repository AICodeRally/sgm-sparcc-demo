'use client';

import { PulseFeed } from '@/components/pulse/PulseFeed';

export default function PulsePage() {
  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[color:var(--color-foreground)] mb-2">
            Pulse
          </h1>
          <p className="text-[color:var(--color-muted)]">
            Real-time governance insights and recommended actions from your Chiefs
          </p>
        </div>

        <PulseFeed autoRefresh={true} refreshInterval={60000} />
      </div>
    </div>
  );
}
