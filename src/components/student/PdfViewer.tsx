export function PdfViewer({ url, title }: { url: string; title: string }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl3 border border-line bg-white shadow-soft">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="text-sm font-medium">{title}</p>
        <a href={url} download className="text-sm font-semibold text-aurora-indigo">
          Download PDF
        </a>
      </div>
      {/* Native browser PDF rendering keeps this dependency-free and fast. */}
      <iframe src={url} className="h-[70vh] w-full" title={title} />
    </div>
  );
}
