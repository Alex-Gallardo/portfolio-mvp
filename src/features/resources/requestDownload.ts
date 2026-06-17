export interface DownloadPayload {
  resourceSlug: string;
  fileId?: string;
  email?: string;
  name?: string;
  consent?: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  website?: string; // honeypot
}

export interface DownloadResponse {
  signedUrl: string;
  fileName: string;
  leadId: string | null;
}

export async function requestDownload(payload: DownloadPayload): Promise<DownloadResponse> {
  const res = await fetch("/api/recursos/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as DownloadResponse & { error?: string };
  if (!res.ok) {
    throw new Error(data?.error ?? "No se pudo iniciar la descarga");
  }
  return data;
}
