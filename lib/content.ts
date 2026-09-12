import content from '@/data/content.json';

// The plugin entries in data/content.json, typed once so a page reading them does not depend on
// what TypeScript infers from whichever entries happen to be present (an empty buyLinks array
// infers as never[], for example).
export interface BuyLink {
  store: string;
  href: string;
}

export interface PluginTag {
  label: string;
  tone: string;
}

export interface Plugin {
  slug: string;
  title: string;
  body: string;
  tags: PluginTag[];
  price: string;
  buyLinks: BuyLink[];
  externalLink: string;
  free: boolean;
  featured: boolean;
  new: boolean;
  cta: string;
  href: string;
  icon: string;
  logo: string;
  /** A wide product image for the top of the product page, or empty until there is one. */
  hero: string;
  vimeoUrl: string;
}

export const plugins = content.plugins as Plugin[];

export function pluginBySlug(slug: string): Plugin {
  const plugin = plugins.find(p => p.slug === slug);
  if (!plugin) throw new Error(`No plugin '${slug}' in data/content.json`);
  return plugin;
}
