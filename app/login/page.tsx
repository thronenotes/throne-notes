"use client";

import { Suspense } from "react";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Crown, Loader2, Mail, AlertTriangle, CheckCircle } from "lucide-react";

function LoginForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const verified = searchParams.get("verified") === "1";
  const tokenError = searchParams.get("error") === "invalid_token";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResendMsg("");
    try {
      await login(email, password);
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) { setError("Enter your email first"); return; }
    setResending(true);
    setResendMsg("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setResendMsg(data.message || "Sent.");
    } catch {
      setResendMsg("Failed to resend.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-throne-bg text-throne-text flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Crown className="w-10 h-10 text-throne-gold mx-auto mb-4" />
          <h1 className="text-2xl font-heading text-throne-text mb-2">Enter the Throne</h1>
          <p className="text-sm text-throne-text-muted">Sign in to your Kingdom Operating System</p>
        </div>

        {verified && (
          <div className="mb-4 p-3 rounded-lg bg-throne-emerald/10 border border-throne-emerald/30 text-throne-emerald text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Email verified. You may now sign in.
          </div>
        )}
        {tokenError && (
          <div className="mb-4 p-3 rounded-lg bg-throne-crimson/10 border border-throne-crimson/30 text-throne-crimson text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Verification link invalid or expired.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-throne-crimson/10 border border-throne-crimson/30 text-throne-crimson text-xs">
              {error}
            </div>
          )}
          {resendMsg && (
            <div className="p-3 rounded-lg bg-throne-indigo/10 border border-throne-indigo/30 text-throne-indigo text-xs flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> {resendMsg}
            </div>
          )}

          <div>
            <label className="text-xs text-throne-text-muted uppercase tracking-wider font-heading block mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-lg bg-throne-surface border border-throne-border text-throne-text text-sm focus:outline-none focus:border-throne-gold transition-colors" />
          </div>
          <div>
            <label className="text-xs text-throne-text-muted uppercase tracking-wider font-heading block mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-lg bg-throne-surface border border-throne-border text-throne-text text-sm focus:outline-none focus:border-throne-gold transition-colors" />
          </div>

          <div className="flex items-center justify-between">
            <button type="button" onClick={handleResend} disabled={resending}
              className="text-[11px] text-throne-text-muted hover:text-throne-gold transition-colors disabled:opacity-50">
              {resending ? "Sending..." : "Resend verification email"}
            </button>
            <Link href="/forgot-password" className="text-[11px] text-throne-text-muted hover:text-throne-gold transition-colors">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg bg-throne-gold text-throne-bg text-sm font-bold hover:bg-throne-goldLight disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-throne-text-muted mt-6">
          No account? <Link href="/register" className="text-throne-gold hover:text-throne-goldLight transition-colors">Claim your throne</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-throne-bg text-throne-text flex items-center justify-center">
        <Crown className="w-10 h-10 text-throne-gold animate-pulse" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}