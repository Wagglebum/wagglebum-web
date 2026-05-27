import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { remarkStripMdLinks } from '@/lib/remark-strip-md-links';
import { getAllDocSlugs, getDocBySlug } from '@/lib/docs';

// Only render paths returned by generateStaticParams; all others are 404.
export const dynamicParams = false;

interface Props {
  params: { section: string; slug: string };
}

export async function generateStaticParams() {
  return getAllDocSlugs().map(({ sectionId, slug }) => ({
    section: sectionId,
    slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const doc = getDocBySlug(params.section, params.slug);
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.description || undefined,
  };
}

export default async function DocPage({ params }: Props) {
  const doc = getDocBySlug(params.section, params.slug);
  if (!doc) notFound();

  return (
    <article className="prose prose-wag max-w-none">
      <MDXRemote
        source={doc.content}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm, remarkStripMdLinks] } }}
      />
    </article>
  );
}
