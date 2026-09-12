import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { docSources, type DocSource } from "@/config/docs";

const projectRoot = process.cwd();

// Folders inside a docs source that are not pages: translated copies (served later, not yet) and
// the images the pages reference, which the sync copies to public/docs-assets/<section>/.
export const skippedFolders = new Set(["es", "ja", "ko", "zh-CN", "zh-TW", "Images"]);

function resolveContentDir(source: DocSource): string {
  return path.join(projectRoot, source.contentDir);
}

// A slug is the path of the .md file inside its source, without the extension: "GettingStarted",
// or "Settings/Audio" for a page one folder down. Relative links between pages then resolve in
// the browser exactly as they do in the repository.
export function getSlugsForSource(source: DocSource): string[] {
  const root = resolveContentDir(source);
  if (!fs.existsSync(root)) return [];

  const slugs: string[] = [];
  const walk = (dir: string, prefix: string) => {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!skippedFolders.has(entry.name)) walk(path.join(dir, entry.name), `${prefix}${entry.name}/`);
      } else if (entry.name.endsWith(".md")) {
        slugs.push(`${prefix}${entry.name.replace(/\.md$/, "")}`);
      }
    }
  };
  walk(root, "");
  return slugs;
}

export function getAllDocSlugs(): { sectionId: string; slug: string }[] {
  return docSources.flatMap((source) =>
    getSlugsForSource(source).map((slug) => ({ sectionId: source.id, slug }))
  );
}

export interface DocMeta {
  title: string;
  description: string;
  order: number;
  sectionId: string;
  slug: string;
}

export interface Doc extends DocMeta {
  content: string;
}

// Front matter wins; otherwise the page's own H1; otherwise the file name.
export function titleOf(data: Record<string, unknown>, body: string, slug: string): string {
  if (typeof data.title === "string" && data.title) return data.title;
  const heading = body.match(/^#\s+(.+)$/m);
  if (heading) return heading[1].trim();
  return slug === "index" ? "Home" : slug.split("/").pop() ?? slug;
}

export function getDocBySlug(sectionId: string, slug: string): Doc | null {
  const source = docSources.find((s) => s.id === sectionId);
  if (!source) return null;

  // No escaping the source folder through the slug.
  if (slug.split("/").some((part) => part === "" || part === "." || part === "..")) return null;

  const filePath = path.join(resolveContentDir(source), `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  return {
    title: titleOf(data, content, slug),
    description: data.description ?? "",
    order: typeof data.order === "number" ? data.order : 0,
    sectionId,
    slug,
    content,
  };
}

export interface NavDoc {
  slug: string;
  title: string;
  order: number;
  /** The folder the page sits in, or empty for the section root. Sidebars group on it. */
  group: string;
}

export interface NavSection {
  id: string;
  label: string;
  order: number;
  docs: NavDoc[];
}

// The order a section's index page links its pages in is the order the author meant them to be
// read in. A page with an explicit front-matter order keeps it; the rest follow the index, and
// anything the index does not mention comes last, alphabetically.
function indexOrder(source: DocSource): Map<string, number> {
  const order = new Map<string, number>();
  const index = getDocBySlug(source.id, "index");
  if (!index) return order;
  const link = /\]\(([^)#\s]+)\.md(?:#[^)]*)?\)/g;
  let match: RegExpExecArray | null;
  while ((match = link.exec(index.content)) !== null) {
    const slug = match[1].replace(/^\.\//, "");
    if (!slug.startsWith("http") && !order.has(slug)) order.set(slug, order.size + 1);
  }
  return order;
}

export function getNavStructure(): NavSection[] {
  return docSources
    .map((source) => {
      const slugs = getSlugsForSource(source);
      const listed = indexOrder(source);
      const docs: NavDoc[] = slugs
        .map((slug) => {
          const doc = getDocBySlug(source.id, slug);
          const group = slug.includes("/") ? slug.slice(0, slug.lastIndexOf("/")) : "";
          const order = doc && doc.order !== 0 ? doc.order : listed.get(slug) ?? Number.MAX_SAFE_INTEGER;
          return { slug, title: doc ? doc.title : slug, order, group };
        })
        .sort((a, b) => {
          if (a.slug === "index") return -1;
          if (b.slug === "index") return 1;
          // Root pages first, then each folder's pages together.
          if (a.group !== b.group) return a.group.localeCompare(b.group);
          return a.order - b.order || a.title.localeCompare(b.title);
        });

      return { id: source.id, label: source.label, order: source.order, docs };
    })
    .sort((a, b) => a.order - b.order);
}
