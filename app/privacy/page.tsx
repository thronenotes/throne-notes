import Link from "next/link";
import { Crown, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Throne Notes",
  description: "How Throne Notes collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-throne-bg text-throne-text">
      <header className="border-b border-throne-border bg-throne-surface/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-throne-text-muted hover:text-throne-gold transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <Crown className="w-5 h-5 text-throne-gold" />
          </Link>
          <div className="h-6 w-px bg-throne-border" />
          <h1 className="text-sm font-heading text-throne-text tracking-wider">PRIVACY POLICY</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-heading text-throne-text mb-8">Privacy Policy</h2>
        <p className="text-xs text-throne-text-muted mb-8">Last updated: August 2026</p>

        <div className="space-y-8 text-sm text-throne-text-muted leading-relaxed">
          <section>
            <h3 className="text-base font-heading text-throne-text mb-2">1. Information We Collect</h3>
            <p>
              We collect the information you provide directly: your name, email address, birth date,
              and any content you create (journal entries, books, chapters). We also collect usage data
              to improve the platform.
            </p>
          </section>

          <section>
            <h3 className="text-base font-heading text-throne-text mb-2">2. How We Use Your Data</h3>
            <p>
              Your data is used to provide and improve Throne Notes services, authenticate your account,
              send transactional emails (verification, password resets), and power AI features like
              dream interpretation. We do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h3 className="text-base font-heading text-throne-text mb-2">3. Data Storage</h3>
            <p>
              Your data is stored securely on Neon PostgreSQL databases and protected with industry-standard
              encryption. Passwords are hashed before storage. We use Vercel for hosting and Resend for email delivery.
            </p>
          </section>

          <section>
            <h3 className="text-base font-heading text-throne-text mb-2">4. AI and Third-Party Services</h3>
            <p>
              Dream interpretations and other AI features may send your content to OpenAI's API.
              We do not store your content on OpenAI's servers beyond the session. You retain full
              ownership of all original content.
            </p>
          </section>

          <section>
            <h3 className="text-base font-heading text-throne-text mb-2">5. Cookies</h3>
            <p>
              We use essential cookies to maintain your session and authentication state.
              We do not use tracking cookies for advertising purposes.
            </p>
          </section>

          <section>
            <h3 className="text-base font-heading text-throne-text mb-2">6. Your Rights</h3>
            <p>
              You have the right to access, update, or delete your personal data at any time.
              To delete your account and all associated data, contact us at the email below.
            </p>
          </section>

          <section>
            <h3 className="text-base font-heading text-throne-text mb-2">7. Contact</h3>
            <p>
              For privacy-related questions or data deletion requests, email{" "}
              <a href="mailto:hello@thronenotes.com" className="text-throne-gold hover:underline">
                hello@thronenotes.com
              </a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-throne-border py-8">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-throne-gold" />
            <span className="text-xs text-throne-text-muted">Throne Notes</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-throne-text-muted">
            <Link href="/about" className="hover:text-throne-gold transition-colors">About</Link>
            <Link href="/terms" className="hover:text-throne-gold transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}