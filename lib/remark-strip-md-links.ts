import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

export function remarkStripMdLinks() {
  return (tree: Root) => {
    visit(tree, 'link', (node) => {
      // Transform relative .md links: "Foo.md" → "Foo", "Foo.md#bar" → "Foo#bar"
      node.url = node.url.replace(/\.md(#|$)/, '$1');
    });
  };
}
