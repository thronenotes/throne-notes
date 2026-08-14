"use client";

import { useState } from "react";
import Link from "next/link";
import { Crown, Loader2, Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-throne-bg text-throne-text flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Crown className="w-10 h-10 text-throne-gold mx-auto mb-4" />
          <h1 className="text-2xl font-heading text-throne-text mb-2">Forgot Your Seal?</h1>
          <p className="text-sm text-throne-text-muted">Enter your email and we will send you a password reset dispatch.</p>
        </div>

        {sent ? (
          <div className="p-5 rounded-xl border border-throne-gold/30 bg-throne-gold/5 text-center">
            <Mail className="w-8 h-8 text-throne-gold mx-auto mb-3" />
            <p className="text-sm text-throne-text mb-1">If an account exists for <span className="text-throne-gold">{email}</span>, you will receive a reset link shortly.</p>
            <Link href="/login" className="text-xs text-throne-gold hover:text-throne-goldLight transition-colors inline-flex items-center gap-1 mt-3">
              <ArrowLeft className="w-3 h-3" /> Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-throne-text-muted uppercase tracking-wider font-heading block mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-lg bg-throne-surface border border-throne-border text-throne-text text-sm focus:outline-none focus:border-throne-gold transition-colors" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg bg-throne-bronze text-throne-text text-sm font-bold hover:bg-throne-bronzeDark disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
            </button>
            <Link href="/login" className="block text-center text-xs text-throne-text-muted hover:text-throne-gold transition-colors mt-4">
              Remember your password? Sign in
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}