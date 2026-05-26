function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

export function VimeoEmbed({ url, title = 'Video' }: { url: string; title?: string }) {
  const id = extractVimeoId(url);
  if (!id) return null;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[16px] shadow-xl">
      <iframe
        src={`https://player.vimeo.com/video/${id}`}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
