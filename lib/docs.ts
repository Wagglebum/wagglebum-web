import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { docSources, type DocSource } from "@/config/docs";

const projectRoot = process.cwd();

function resolveContentDir(source: DocSource): string {
  return path.join(projectRoot, source.contentDir);
}

function getSlugsForSource(source: DocSource): string[] {
  const dir = resolveContentDir(source);
  if (!fs.existsSync(dir)) return [];
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""));
  } catch {
    return [];
  }
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

export function getDocBySlug(sectionId: string, slug: string): Doc | null {
  const source = docSources.find((s) => s.id === sectionId);
  if (!source) return null;

  const filePath = path.join(resolveContentDir(source), `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  return {
    title: data.title ?? slug,
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
}

export interface NavSection {
  id: string;
  label: string;
  order: number;
  docs: NavDoc[];
}

export function getNavStructure(): NavSection[] {
  return docSources
    .map((source) => {
      const slugs = getSlugsForSource(source);
      const docs: NavDoc[] = slugs
        .map((slug) => {
          const doc = getDocBySlug(source.id, slug);
          return doc
            ? { slug, title: doc.title, order: doc.order }
            : { slug, title: slug, order: 0 };
        })
        .sort((a, b) => a.order - b.order);

      return { id: source.id, label: source.label, order: source.order, docs };
    })
    .sort((a, b) => a.order - b.order);
}
