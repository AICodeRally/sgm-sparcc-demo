'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { FrameworkCardList } from '@/components/governance/knowledge-base';
import type { FrameworkCard } from '@/lib/contracts/spm-knowledge-base.contract';

// Import card data (all expansion phases)
import migratedCardsData from '@/lib/data/synthetic/spm-kb-cards-migrated.json';
import newPillarCardsData from '@/lib/data/synthetic/spm-kb-cards-new-pillars.json';
import expansionCardsData from '@/lib/data/synthetic/spm-kb-cards-expansion.json';
import expansion2CardsData from '@/lib/data/synthetic/spm-kb-cards-expansion-2.json';
import expansion3CardsData from '@/lib/data/synthetic/spm-kb-cards-expansion-3.json';
import expansion4CardsData from '@/lib/data/synthetic/spm-kb-cards-expansion-4.json';
import expansion6CardsData from '@/lib/data/synthetic/spm-kb-cards-expansion-6.json';
import sampleCardsData from '@/lib/data/synthetic/spm-kb-sample-cards.json';

export default function KnowledgeBasePage() {
  const [allCards, setAllCards] = useState<FrameworkCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Combine all cards from all expansion phases (926 total)
    const combined = [
      ...(sampleCardsData.sampleCards as unknown as FrameworkCard[]),
      ...((migratedCardsData as unknown as { cards: FrameworkCard[] }).cards || []),
      ...((newPillarCardsData as unknown as { cards: FrameworkCard[] }).cards || []),
      ...((expansionCardsData as unknown as { cards: FrameworkCard[] }).cards || []),
      ...((expansion2CardsData as unknown as { cards: FrameworkCard[] }).cards || []),
      ...((expansion3CardsData as unknown as { cards: FrameworkCard[] }).cards || []),
      ...((expansion4CardsData as unknown as { cards: FrameworkCard[] }).cards || []),
      ...((expansion6CardsData as unknown as { cards: FrameworkCard[] }).cards || []),
    ];

    // Deduplicate by id
    const uniqueCards = combined.reduce((acc, card) => {
      if (!acc.find(c => c.id === card.id)) {
        acc.push(card);
      }
      return acc;
    }, [] as FrameworkCard[]);

    setAllCards(uniqueCards);
    setLoading(false);
  }, []);

  const handleTermClick = (term: string) => {
    // Find card by keyword and scroll to it
    const card = allCards.find(c =>
      c.keyword.toLowerCase() === term.toLowerCase() ||
      c.aliases?.some(a => a.toLowerCase() === term.toLowerCase())
    );
    if (card) {
      const element = document.getElementById(`card-${card.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        element.classList.add('ring-2', 'ring-[color:var(--color-primary)]');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-[color:var(--color-primary)]');
        }, 2000);
      }
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center sparcc-hero-bg">
        <div className="text-[color:var(--color-muted)]">Loading Knowledge Base...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen sparcc-hero-bg">
      {/* Header */}
      <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] px-8 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href="/governance-framework"
              className="p-2 hover:bg-[color:var(--color-surface-alt)] rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-[color:var(--color-muted)]" />
            </Link>
            <div>
              <div className="text-sm font-mono text-[color:var(--color-primary)]">SPM-KB-001</div>
              <h1 className="text-2xl font-bold bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] bg-clip-text text-transparent">
                SPM Definitive Knowledge Base
              </h1>
              <p className="text-sm text-[color:var(--color-muted)]">
                The comprehensive Sales Performance Management reference — {allCards.length} Framework Cards across 8+ pillars
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <FrameworkCardList
          cards={allCards}
          onTermClick={handleTermClick}
        />
      </div>
    </div>
  );
}
