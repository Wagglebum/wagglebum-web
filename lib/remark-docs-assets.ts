import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

// Images in the docs are written relative to the page - "Images/x.png" from a root page,
// "../Images/x.png" from one a folder down. The sync copies each section's Images folder to
// public/docs-assets/<section>/Images, so this resolves the relative path against the page's
// folder and points it there. Absolute and external URLs are left alone.
export function remarkDocsAssets({ section, slug }: { section: string; slug: string }) {
  const folder = slug.includes('/') ? slug.slice(0, slug.lastIndexOf('/')).split('/') : [];

  return (tree: Root) => {
    visit(tree, 'image', (node) => {
      if (/^(?:[a-z]+:)?\/\//i.test(node.url) || node.url.startsWith('/')) return;

      const parts = [...folder];
      for (const part of node.url.split('/')) {
        if (part === '..') parts.pop();
        else if (part !== '.' && part !== '') parts.push(part);
      }
      node.url = `/docs-assets/${section}/${parts.join('/')}`;
    });
  };
}
