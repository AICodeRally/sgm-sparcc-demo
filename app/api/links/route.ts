import { NextResponse } from 'next/server';
import { DOCUMENT_LINKS, DOCUMENT_NODES, LINK_TYPE_INFO, GRAPH_STATS } from '@/lib/data/synthetic/document-links.data';

export async function GET() {
  return NextResponse.json({
    links: DOCUMENT_LINKS,
    nodes: DOCUMENT_NODES,
    linkTypes: LINK_TYPE_INFO,
    stats: GRAPH_STATS,
  });
}
