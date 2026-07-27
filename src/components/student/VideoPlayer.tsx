export function VideoPlayer({ youtubeId, videoUrl }: { youtubeId?: string | null; videoUrl?: string | null }) {
  if (youtubeId) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl3 bg-black shadow-soft">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title="Lesson video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  if (videoUrl) {
    return (
      <video controls className="aspect-video w-full rounded-xl3 bg-black shadow-soft">
        <source src={videoUrl} />
      </video>
    );
  }
  return null;
}

// Extracts a YouTube video ID from any common URL shape.
// Used by the admin lesson form when pasting a URL.
export function extractYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}
