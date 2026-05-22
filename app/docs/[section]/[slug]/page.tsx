import { notFound } from 'next/navigation';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import { getAllDocSlugs, getDocBySlug } from '@/lib/docs';
import { MdxContent } from './MdxContent';

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
  return { title: doc.title };
}

export default async function DocPage({ params }: Props) {
  const doc = getDocBySlug(params.section, params.slug);
  if (!doc) notFound();

  const mdxSource = await serialize(doc.content, {
    mdxOptions: { remarkPlugins: [remarkGfm] },
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <MdxContent source={mdxSource} />
    </main>
  );
}
