import type { Metadata } from "next";
import "@/styles/globals.css";
import { AuthProvider } from "@/lib/auth-context";

const crownIcon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%230A0A0F'/%3E%3Cpath d='M8 24h16M10 20h12M7 14l3-6 3 4 3-5 3 5 3-4 3 6H7z' stroke='%23D4AF37' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3Ccircle cx='16' cy='10' r='2' fill='%23D4AF37'/%3E%3C/svg%3E";

export const metadata: Metadata = {
  title: "Throne Notes — Kingdom Operating System",
  description:
    "Prophetic journaling, dream interpretation, numerology blueprint engine, and scribe studio. Your revelations become books. Your books become movements.",
  icons: {
    icon: crownIcon,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="min-h-screen antialiased"
        style={{ backgroundColor: "#0A0A0F", color: "#F5F0E6" }}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}