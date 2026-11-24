import { base44 } from "@/api/base44Client";

// A stored clip keeps its index at the end of the file, so a plain <video>
// can show no frame until nearly all of it has arrived. Pulling the bytes in
// once and playing from memory is what makes the first frame instant.
const signed = new Map();
const blobs = new Map();
const pending = new Map();

async function signedUrl(file_uri) {
  if (signed.has(file_uri)) return signed.get(file_uri);
  const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
    file_uri,
    expires_in: 3600,
  });
  signed.set(file_uri, signed_url);
  return signed_url;
}

export function warmClip(file_uri) {
  if (!file_uri) return Promise.resolve(null);
  if (blobs.has(file_uri)) return Promise.resolve(blobs.get(file_uri));
  if (pending.has(file_uri)) return pending.get(file_uri);

  const job = (async () => {
    const url = await signedUrl(file_uri);
    const response = await fetch(url);
    if (!response.ok) throw new Error("clip fetch failed");
    const objectUrl = URL.createObjectURL(await response.blob());
    blobs.set(file_uri, objectUrl);
    return objectUrl;
  })().finally(() => pending.delete(file_uri));

  pending.set(file_uri, job);
  return job;
}