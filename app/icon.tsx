export const size = { width: 32, height: 32 };
export const contentType = "image/svg+xml";

export default function Icon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#0A0A0F"/><path d="M8 24h16M10 20h12M7 14l3-6 3 4 3-5 3 5 3-4 3 6H7z" stroke="#D4AF37" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="16" cy="10" r="2" fill="#D4AF37"/></svg>`;

  return new Response(svg, {
    headers: { "content-type": "image/svg+xml" },
  });
}