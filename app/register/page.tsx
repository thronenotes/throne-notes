"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Crown, Loader2, Mail } from "lucide-react";

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
          <Crown className="w-10 h-10 text-throne-gold mx-auto mb-4" />
          <div className="p-4 rounded-xl border border-throne-gold/30 bg-throne-gold/5 mb-6">
            <Mail className="w-8 h-8 text-throne-gold mx-auto mb-3" />
            <h2 className="text-lg font-heading text-throne-text mb-2">Check Your Email</h2>
            <p className="text-sm text-throne-text-muted">We sent a verification seal to <span className="text-throne-gold">{email}</span>. Click the link inside to activate your throne.</p>
          </div>
          <Link href="/login" className="text-sm text-throne-gold hover:text-throne-goldLight transition-colors">Go to Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-throne-bg text-throne-text flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Crown className="w-10 h-10 text-throne-gold mx-auto mb-4" />
          <h1 className="text-2xl font-heading text-throne-text mb-2">Claim Your Throne</h1>
          <p className="text-sm text-throne-text-muted">Create your Kingdom Operating System account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-throne-crimson/10 border border-throne-crimson/30 text-throne-crimson text-xs">
              {error}
            </div>
          )}
          <div>
            <label className="text-xs text-throne-text-muted uppercase tracking-wider font-heading block mb-2">Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-lg bg-throne-surface border border-throne-border text-throne-text text-sm focus:outline-none focus:border-throne-gold transition-colors" />
          </div>
          <div>
            <label className="text-xs text-throne-text-muted uppercase tracking-wider font-heading block mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-lg bg-throne-surface border border-throne-border text-throne-text text-sm focus:outline-none focus:border-throne-gold transition-colors" />
          </div>
          <div>
            <label className="text-xs text-throne-text-muted uppercase tracking-wider font-heading block mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full px-3 py-2.5 rounded-lg bg-throne-surface border border-throne-border text-throne-text text-sm focus:outline-none focus:border-throne-gold transition-colors" />
            <p className="text-[10px] text-throne-text-muted mt-1">Minimum 6 characters</p>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg bg-throne-gold text-throne-bg text-sm font-bold hover:bg-throne-goldLight disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-throne-text-muted mt-6">
          Already have a throne? <Link href="/login" className="text-throne-gold hover:text-throne-goldLight transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}