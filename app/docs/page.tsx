import { redirect } from 'next/navigation';
import { getNavStructure } from '@/lib/docs';

export default function DocsIndexPage() {
  const sections = getNavStructure();
  const firstDoc = sections.find((s) => s.docs.length > 0)?.docs[0];
  const firstSection = sections.find((s) => s.docs.length > 0);

  if (firstDoc && firstSection) {
    redirect(`/docs/${firstSection.id}/${firstDoc.slug}`);
  }

  return (
    <div className="flex flex-col items-start gap-3 py-8">
      <p className="text-lg font-semibold text-ink">No documentation yet.</p>
      <p className="text-sm text-graphite">
        Documentation pages will appear here once content is added.
      </p>
    </div>
  );
}
