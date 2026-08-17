import Link from "next/link";
import { Crown, Feather, Moon, Calculator, Sparkles, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "About — Throne Notes",
  description: "The story behind Throne Notes and the mission to turn revelations into movements.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-throne-bg text-throne-text">
      <header className="border-b border-throne-border bg-throne-surface/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-throne-text-muted hover:text-throne-gold transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <Crown className="w-5 h-5 text-throne-gold" />
          </Link>
          <div className="h-6 w-px bg-throne-border" />
          <h1 className="text-sm font-heading text-throne-text tracking-wider">ABOUT</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <Crown className="w-12 h-12 text-throne-gold mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-heading text-throne-text mb-4">
            Your revelations become books.<br />
            <span className="text-throne-gold">Your books become movements.</span>
          </h2>
        </div>

        <div className="space-y-12">
          <section>
            <h3 className="text-lg font-heading text-throne-text mb-3">The Vision</h3>
            <p className="text-sm text-throne-text-muted leading-relaxed">
              Throne Notes was built for the dreamer who wakes up with a download and has nowhere to store it.
              For the writer who receives revelation chapter by chapter. For the believer who knows their
              birth date carries a code, their name carries a vibration, and their dreams carry intelligence.
            </p>
            <p className="text-sm text-throne-text-muted leading-relaxed mt-4">
              This is not a note app. It is a <strong className="text-throne-text">Kingdom Operating System</strong> —
              a prophetic command center where you write with revelation, capture dreams with discernment,
              and calculate your kingdom blueprint.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-heading text-throne-text mb-3">What You Can Do</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Feather, title: "Scribe Studio", desc: "Write books chapter-by-chapter with revelation linking and scripture sidebar." },
                { icon: Moon, title: "Dream Vault", desc: "Journal dreams, visions, and revelations with prophetic tags and spiritual state tracking." },
                { icon: Calculator, title: "Blueprint Engine", desc: "Calculate Life Path, Expression, Soul Urge, and daily personal numbers." },
                { icon: Sparkles, title: "The Oracle", desc: "Speak your dream. Receive your Kingdom intelligence briefing through prophetic AI." },
              ].map((tool) => (
                <div key={tool.title} className="p-4 rounded-xl border border-throne-border bg-throne-surface/30">
                  <tool.icon className="w-5 h-5 text-throne-gold mb-2" />
                  <div className="text-sm font-medium text-throne-text mb-1">{tool.title}</div>
                  <div className="text-xs text-throne-text-muted leading-relaxed">{tool.desc}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-heading text-throne-text mb-3">Built By</h3>
            <p className="text-sm text-throne-text-muted leading-relaxed">
              Throne Notes is a project by <strong className="text-throne-text">Nwankwo Moses Ezechukwu</strong> —
              a kingdom builder, prophetic voice, and technologist committed to equipping believers with
              tools that match the intelligence of the Spirit.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-throne-border py-8 mt-16">
        <div className="max-w-3xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-throne-gold" />
            <span className="text-xs text-throne-text-muted">Throne Notes</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-throne-text-muted">
            <Link href="/terms" className="hover:text-throne-gold transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-throne-gold transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}