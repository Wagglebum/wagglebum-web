// Re-export SearchResult so existing imports from this path keep working.
export type { SearchResult } from '@/lib/search';

import { NextResponse } from 'next/server';
import { buildSearchIndex } from '@/lib/search';

// No request params — returns the full index as a static JSON file.
// Fuse.js fuzzy filtering runs client-side in SearchBar.tsx.
export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json(buildSearchIndex());
}
