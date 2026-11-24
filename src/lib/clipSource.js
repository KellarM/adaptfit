import { base44 } from "@/api/base44Client";

// Resolve access only. The video element must stream the URL directly so it
// can request the MP4 index and first frames without downloading the whole file.
const signed = new Map();
const pending = new Map();

export function getClipSource(file_uri) {
  const cached = signed.get(file_uri);
  if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.url);
  if (pending.has(file_uri)) return pending.get(file_uri);

  const job = base44.integrations.Core.CreateFileSignedUrl({
    file_uri,
    expires_in: 3600,
  }).then(({ signed_url }) => {
    signed.set(file_uri, { url: signed_url, expiresAt: Date.now() + 3500_000 });
    return signed_url;
  }).finally(() => pending.delete(file_uri));

  pending.set(file_uri, job);
  return job;
}