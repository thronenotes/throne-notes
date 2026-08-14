"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Crown, Loader2, CheckCircle, ArrowLeft } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) setError("Invalid or missing reset token.");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Minimum 6 characters."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-throne-bg text-throne-text flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <Crown className="w-10 h-10 text-throne-gold mx-auto mb-4" />
          <div className="p-5 rounded-xl border border-throne-emerald/30 bg-throne-emerald/5 mb-6">
            <CheckCircle className="w-8 h-8 text-throne-emerald mx-auto mb-3" />
            <h2 className="text-lg font-heading text-throne-text mb-2">Password Reset</h2>
            <p className="text-sm text-throne-text-muted">Your seal has been renewed. Sign in with your new password.</p>
          </div>
          <Link href="/login" className="text-sm text-throne-gold hover:text-throne-goldLight transition-colors inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-throne-bg text-throne-text flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Crown className="w-10 h-10 text-throne-gold mx-auto mb-4" />
          <h1 className="text-2xl font-heading text-throne-text mb-2">Reset Your Seal</h1>
          <p className="text-sm text-throne-text-muted">Create a new password for your throne.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-throne-crimson/10 border border-throne-crimson/30 text-throne-crimson text-xs">
              {error}
            </div>
          )}
          <div>
            <label className="text-xs text-throne-text-muted uppercase tracking-wider font-heading block mb-2">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2.5 rounded-lg bg-throne-surface border border-throne-border text-throne-text text-sm focus:outline-none focus:border-throne-gold transition-colors"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="text-xs text-throne-text-muted uppercase tracking-wider font-heading block mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2.5 rounded-lg bg-throne-surface border border-throne-border text-throne-text text-sm focus:outline-none focus:border-throne-gold transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !token}
            className="w-full py-2.5 rounded-lg bg-throne-bronze text-throne-text text-sm font-bold hover:bg-throne-bronzeDark disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset Password"}
          </button>
          <Link
            href="/login"
            className="block text-center text-xs text-throne-text-muted hover:text-throne-gold transition-colors mt-4"
          >
            <ArrowLeft className="w-3 h-3 inline mr-1" /> Back to Sign In
          </Link>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-throne-bg text-throne-text flex items-center justify-center">
        <Crown className="w-10 h-10 text-throne-gold animate-pulse" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}