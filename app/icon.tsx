export const size = { width: 32, height: 32 };
export const contentType = "image/svg+xml";

export default function Icon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="6" fill="#0A0A0F" />
      <path
        d="M8 24h16M10 20h12M7 14l3-6 3 4 3-5 3 5 3-4 3 6H7z"
        stroke="#D4AF37"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="16" cy="10" r="2" fill="#D4AF37" />
    </svg>
  );
}