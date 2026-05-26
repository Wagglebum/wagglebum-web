import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { docSources } from '@/config/docs';
import content from '@/data/content.json';

export interface SearchResult {
  id: string;
  title: string;
  type: 'doc' | 'plugin' | 'game' | 'page';
  excerpt: string;
  url: string;
}

function extractTitle(markdown: string, fallback: string): string {
  const match = markdown.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : fallback;
}

function extractExcerpt(markdown: string, maxLen = 140): string {
  const line = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#{1,6}\s+.+$/gm, '')
    .replace(/---+/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .split('\n')
    .map(l => l.trim())
    .find(l => l.length > 20) ?? '';
  return line.length > maxLen ? line.slice(0, maxLen) + '…' : line;
}

export function buildSearchIndex(): SearchResult[] {
  const items: SearchResult[] = [];

  for (const source of docSources) {
    const dir = path.join(process.cwd(), source.contentDir);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.md'))) {
      const slug = file.replace(/\.md$/, '');
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      const { data, content: body } = matter(raw);
      items.push({
        id: `doc-${source.id}-${slug}`,
        title: data.title ?? extractTitle(body, slug),
        type: 'doc',
        excerpt: extractExcerpt(body),
        url: `/docs/${source.id}/${slug}`,
      });
    }
  }

  for (const plugin of content.plugins) {
    items.push({
      id: `plugin-${plugin.slug}`,
      title: plugin.title,
      type: 'plugin',
      excerpt: plugin.body,
      url: plugin.href,
    });
  }

  for (const game of content.games) {
    if (!game.title) continue;
    items.push({
      id: `game-${game.slug}`,
      title: game.title,
      type: 'game',
      excerpt: game.description ?? '',
      url: game.href ?? `/games/${game.slug}`,
    });
  }

  items.push(
    { id: 'page-about',   title: 'About',   type: 'page', excerpt: 'Learn about Wagglebum — who we are and what we make.', url: '/about' },
    { id: 'page-support', title: 'Support', type: 'page', excerpt: 'Get help with WagSave or any Wagglebum product.',        url: '/support' },
  );

  return items;
}
