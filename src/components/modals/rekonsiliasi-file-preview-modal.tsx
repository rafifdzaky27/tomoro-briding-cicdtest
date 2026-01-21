type FilePreviewModalProps = {
  open: boolean;
  url: string | null;
  onClose: () => void;
};

export function FilePreviewModal({ open, url, onClose }: FilePreviewModalProps) {
  if (!open || !url) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative h-[80vh] w-[90vw] max-w-5xl rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
          <div className="text-sm font-semibold text-slate-800">
            Preview File
          </div>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Buka di tab baru
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
            >
              <span className="sr-only">Tutup</span>
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="h-[calc(80vh-40px)]">
          <iframe
            src={url}
            className="h-full w-full rounded-b-xl"
            allow="autoplay"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Ubah berbagai format link Google Drive menjadi link /preview
 * supaya bisa di-embed di iframe.
 */
export function toDrivePreviewUrl(url: string): string {
  try {
    if (!url.includes("drive.google.com")) return url;

    // https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    const fileMatch = url.match(/\/file\/d\/([^/]+)/);
    if (fileMatch?.[1]) {
      return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
    }

    // https://drive.google.com/open?id=FILE_ID atau ?id=FILE_ID
    const idMatch = url.match(/[?&]id=([^&]+)/);
    if (idMatch?.[1]) {
      return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
    }

    return url;
  } catch {
    return url;
  }
}
