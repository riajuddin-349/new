import { createHash } from "node:crypto";

function getConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) throw new Error("Cloudinary is not configured.");
  return { cloudName, apiKey, apiSecret };
}

function signature(params: Record<string, string>, apiSecret: string) {
  const serialized = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
}

export function getCloudinaryUploadConfig(folder: string, context: Record<string, string> = {}) {
  const { cloudName, apiKey, apiSecret } = getConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const contextValue = Object.entries(context)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${String(value).replace(/[|=]/g, " ")}`)
    .join("|");
  const params: Record<string, string> = { folder, timestamp };
  if (contextValue) params.context = contextValue;
  return {
    cloudName,
    apiKey,
    timestamp,
    folder,
    ...(contextValue ? { context: contextValue } : {}),
    signature: signature(params, apiSecret),
  };
}

export async function listImages(folder: string) {
  const { apiKey, apiSecret, cloudName } = getConfig();
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/search`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      expression: `resource_type:image AND folder:${folder}`,
      sort_by: [{ created_at: "desc" }],
      max_results: 500,
      with_field: ["context"],
    }),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "Cloudinary resource lookup failed.");
  return data.resources as Array<{ public_id: string; secure_url: string; created_at?: string; context?: { custom?: Record<string, string> } }>;
}

export async function listProjectMetadata() {
  const { apiKey, apiSecret, cloudName } = getConfig();
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/search`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      expression: "resource_type:raw AND folder:portfolio/projects/meta",
      sort_by: [{ created_at: "desc" }],
      max_results: 500,
    }),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "Cloudinary project metadata lookup failed.");
  return data.resources as Array<{ public_id: string; secure_url: string; created_at?: string }>;
}

export async function uploadProjectMetadata(slug: string, data: unknown) {
  const { cloudName, apiKey, apiSecret } = getConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = "portfolio/projects/meta";
  const publicId = `${slug}.json`;
  const params = { folder, public_id: publicId, timestamp };
  const sig = signature(params, apiSecret);
  const form = new FormData();
  form.append("file", new Blob([JSON.stringify(data)], { type: "application/json" }), `${slug}.json`);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("folder", folder);
  form.append("public_id", publicId);
  form.append("signature", sig);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
    method: "POST",
    body: form,
    cache: "no-store",
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result?.error?.message || "Project metadata upload failed.");
  return result;
}

export async function deleteRaw(publicId: string) {
  const { apiKey, apiSecret, cloudName } = getConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const sig = signature({ public_id: publicId, timestamp }, apiSecret);
  const body = new URLSearchParams({ public_id: publicId, timestamp, api_key: apiKey, signature: sig });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/destroy`, { method: "POST", body, cache: "no-store" });
  const data = await response.json();
  if (!response.ok || (data.result !== "ok" && data.result !== "not found")) throw new Error(data?.error?.message || "Cloudinary raw delete failed.");
  return data;
}

export async function deleteImage(publicId: string) {
  const { apiKey, apiSecret, cloudName } = getConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const sig = signature({ public_id: publicId, timestamp }, apiSecret);
  const body = new URLSearchParams({ public_id: publicId, timestamp, api_key: apiKey, signature: sig });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, { method: "POST", body, cache: "no-store" });
  const data = await response.json();
  if (!response.ok || (data.result !== "ok" && data.result !== "not found")) throw new Error(data?.error?.message || "Cloudinary delete failed.");
  return data;
}
