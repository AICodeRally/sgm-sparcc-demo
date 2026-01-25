# TODOs - January 25, 2026

## Pending

### Test AI/RAG Endpoint with Correct Pillar Data
- [ ] Verify `/api/ai/kb` endpoint returns cards with updated pillar assignments
- [ ] Test search queries return correct pillar metadata
- [ ] Confirm RAG export (`spm-kb-rag-export.json`) is being used by AI queries
- [ ] Test pillar-specific queries (e.g., "What technology platforms are used?")

## Completed This Session

- [x] Pillar-first KB navigation for faster load times
- [x] Consolidated 14 pillars → 8 core pillars
- [x] Audited 929 cards for correct pillar assignment
- [x] Fixed 19 misclassified cards (Data Quality + Integration → TECHNOLOGY_PLATFORMS)
- [x] Regenerated RAG export with correct pillar metadata
- [x] Added `scripts/generate-rag-export.js` for future regeneration
