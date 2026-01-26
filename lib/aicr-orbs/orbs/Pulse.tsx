'use client';

import { useState, useEffect } from 'react';

interface Recommendation {
  id: string;
  type: 'recommendation' | 'learning' | 'action';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dismissed: boolean;
}

interface PulseOrbProps {
  endpoint?: string;
}

export function PulseOrb({ endpoint = '/api/ai/pulse/recommendations' }: PulseOrbProps) {
  const [items, setItems] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(endpoint);
        const data = await res.json();
        setItems(data.recommendations ?? []);
      } catch {
        // Handle error silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, [endpoint]);

  const handleDismiss = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  if (isLoading) {
    return <div className="p-4 text-gray-500 text-sm">Loading recommendations...</div>;
  }

  return (
    <div className="p-4 space-y-3">
      {items.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No recommendations right now</p>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-100 dark:border-purple-800"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-sm text-gray-900 dark:text-white">{item.title}</h4>
                <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
              <button
                onClick={() => handleDismiss(item.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
