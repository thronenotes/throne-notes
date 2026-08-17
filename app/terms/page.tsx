import Link from "next/link";
import { Crown, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Throne Notes",
  description: "Terms and conditions for using Throne Notes.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-throne-bg text-throne-text">
      <header className="border-b border-throne-border bg-throne-surface/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-throne-text-muted hover:text-throne-gold transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <Crown className="w-5 h-5 text-throne-gold" />
          </Link>
          <div className="h-6 w-px bg-throne-border" />
          <h1 className="text-sm font-heading text-throne-text tracking-wider">TERMS OF SERVICE</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-heading text-throne-text mb-8">Terms of Service</h2>
        <p className="text-xs text-throne-text-muted mb-8">Last updated: August 2026</p>

        <div className="space-y-8 text-sm text-throne-text-muted leading-relaxed">
          <section>
            <h3 className="text-base font-heading text-throne-text mb-2">1. Acceptance of Terms</h3>
            <p>
              By accessing or using Throne Notes, you agree to be bound by these Terms of Service.
              If you do not agree, you may not use the platform.
            </p>
          </section>

          <section>
            <h3 className="text-base font-heading text-throne-text mb-2">2. Description of Service</h3>
            <p>
              Throne Notes provides tools for prophetic journaling, dream interpretation, numerology
              calculations, and writing. Some features use third-party AI services. We do not guarantee
              the accuracy of AI-generated interpretations — they are spiritual insights, not professional advice.
            </p>
          </section>

          <section>
            <h3 className="text-base font-heading text-throne-text mb-2">3. User Accounts</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials.
              You must provide accurate information during registration. We reserve the right to suspend
              accounts that violate these terms.
            </p>
          </section>

          <section>
            <h3 className="text-base font-heading text-throne-text mb-2">4. Content Ownership</h3>
            <p>
              You retain full ownership of all content you create on Throne Notes — dreams, journal entries,
              books, and chapters. We do not claim any rights over your intellectual property.
            </p>
          </section>

          <section>
            <h3 className="text-base font-heading text-throne-text mb-2">5. Prohibited Conduct</h3>
            <p>
              You may not use Throne Notes for unlawful purposes, harassment, or to distribute harmful content.
              We reserve the right to remove content and terminate accounts that violate this policy.
            </p>
          </section>

          <section>
            <h3 className="text-base font-heading text-throne-text mb-2">6. Limitation of Liability</h3>
            <p>
              Throne Notes is provided "as is." We are not liable for any damages arising from your use
              of the platform, including but not limited to spiritual, emotional, or financial decisions
              made based on content generated within the app.
            </p>
          </section>

          <section>
            <h3 className="text-base font-heading text-throne-text mb-2">7. Changes to Terms</h3>
            <p>
              We may update these terms from time to time. Continued use of the platform after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h3 className="text-base font-heading text-throne-text mb-2">8. Contact</h3>
            <p>
              For questions about these terms, contact us at{" "}
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
            <Link href="/privacy" className="hover:text-throne-gold transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}