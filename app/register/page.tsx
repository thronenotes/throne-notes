"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Crown, Loader2, Mail, User, Lock, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(email, password, fullName);
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-throne-bg text-throne-text flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-throne-gold/10 border border-throne-gold/30 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-throne-gold" />
          </div>
          <h2 className="text-2xl font-heading text-throne-text mb-3">Verify Your Seal</h2>
          <p className="text-sm text-throne-text-muted mb-2">
            We sent a verification dispatch to
          </p>
          <p className="text-sm text-throne-gold font-medium mb-8">{email}</p>
          <div className="p-4 rounded-xl border border-throne-gold/20 bg-throne-gold/5 mb-6">
            <p className="text-xs text-throne-text-muted leading-relaxed">
              Click the link inside the email to activate your throne. If you do not see it, check your spam or promotions folder.
            </p>
          </div>
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-throne-gold hover:text-throne-goldLight transition-colors">
            Proceed to Sign In <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-throne-bg text-throne-text flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-full bg-throne-gold/10 border border-throne-gold/20 flex items-center justify-center mx-auto mb-5">
            <Crown className="w-7 h-7 text-throne-gold" />
          </div>
          <h1 className="text-2xl font-heading text-throne-text mb-2">Claim Your Throne</h1>
          <p className="text-sm text-throne-text-muted">Create your Kingdom Operating System account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-throne-crimson/10 border border-throne-crimson/30 text-throne-crimson text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-throne-crimson shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="text-[11px] text-throne-text-muted uppercase tracking-wider font-heading block mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-throne-text-muted/50" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Nwankwo Moses Ezechukwu"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-throne-surface border border-throne-border text-throne-text text-sm focus:outline-none focus:border-throne-gold transition-colors placeholder:text-throne-text-muted/30"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-throne-text-muted uppercase tracking-wider font-heading block mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-throne-text-muted/50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="king@thronenotes.com"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-throne-surface border border-throne-border text-throne-text text-sm focus:outline-none focus:border-throne-gold transition-colors placeholder:text-throne-text-muted/30"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-throne-text-muted uppercase tracking-wider font-heading block mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-throne-text-muted/50" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-throne-surface border border-throne-border text-throne-text text-sm focus:outline-none focus:border-throne-gold transition-colors placeholder:text-throne-text-muted/30"
              />
            </div>
            <p className="text-[10px] text-throne-text-muted mt-1.5 ml-1">Minimum 6 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-throne-gold text-throne-bg text-sm font-bold hover:bg-throne-goldLight disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-throne-text-muted mt-8">
          Already have a throne?{" "}
          <Link href="/login" className="text-throne-gold hover:text-throne-goldLight transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}