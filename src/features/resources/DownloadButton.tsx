"use client";

import { useDownloadModalStore } from "@/stores/useDownloadModalStore";

interface DownloadButtonProps {
  resourceSlug: string;
  resourceTitle?: string;
  fileId?: string;
  label?: string;
  className?: string;
}

export function DownloadButton({
  resourceSlug,
  resourceTitle,
  fileId,
  label = "Descargar gratis",
  className,
}: DownloadButtonProps) {
  const open = useDownloadModalStore((s) => s.open);
  return (
    <button
      type="button"
      className={className}
      onClick={() => open({ resourceSlug, resourceTitle, fileId })}
    >
      {label}
    </button>
  );
}
