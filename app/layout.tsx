import type { Metadata } from "next";
import "@/styles/globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Throne Notes — Kingdom Operating System",
  description: "The First Prophetic Workspace Built for Kingdom Builders",
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