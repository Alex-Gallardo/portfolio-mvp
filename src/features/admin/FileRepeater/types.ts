export interface FileItem {
  id: string; // key local (uuid) para React
  label: string;
  storagePath: string; // "" mientras no se sube
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}
