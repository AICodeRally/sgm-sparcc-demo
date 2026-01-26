'use client';

import { useState, useEffect } from 'react';

interface Alert {
  id: string;
  type: 'anomaly' | 'threshold' | 'drift';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface OpsOrbProps {
  endpoint?: string;
}

export function OpsOrb({ endpoint = '/api/ai/ops/alerts' }: OpsOrbProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch(endpoint);
        const data = await res.json();
        setAlerts(data.alerts ?? []);
      } catch {
        // Handle error silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlerts();
  }, [endpoint]);

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    }
  };

  if (isLoading) {
    return <div className="p-4 text-gray-500 text-sm">Loading alerts...</div>;
  }

  return (
    <div className="p-4 space-y-3">
      {alerts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No active alerts</p>
      ) : (
        alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-sm">{alert.title}</h4>
                <p className="text-xs mt-1 opacity-80">{alert.description}</p>
              </div>
              <span className="text-xs uppercase font-semibold">{alert.severity}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
