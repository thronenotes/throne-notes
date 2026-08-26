export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://thronenotes.com";

export function api(path: string) {
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}