"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(params.get("redirect") ?? "/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md rounded-xl3 bg-white p-8 shadow-softLg">
      <Link href="/" className="font-display text-lg font-bold">
        Ode<span className="gradient-text">Korean</span>
      </Link>
      <h1 className="mt-6 font-display text-2xl font-bold">Welcome back</h1>
      <p className="mt-1 text-sm text-graphite/60">Continue your Korean learning journey.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-aurora-indigo"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-aurora-indigo"
            placeholder="••••••••"
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in…" : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-graphite/60">
        No account?{" "}
        <Link href="/register" className="font-semibold text-aurora-indigo">
          Sign up free
        </Link>
      </p>
    </div>
  );
}
