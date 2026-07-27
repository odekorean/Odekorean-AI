"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      router.push("/login?verify=1");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-aurora-mesh px-6">
      <div className="w-full max-w-md rounded-xl3 bg-white p-8 shadow-softLg">
        <Link href="/" className="font-display text-lg font-bold">
          Ode<span className="gradient-text">Korean</span>
        </Link>
        <h1 className="mt-6 font-display text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-graphite/60">Your first lesson is on us.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium">Full name</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-aurora-indigo"
              placeholder="Dilnoza Sobirova"
            />
          </div>
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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-aurora-indigo"
              placeholder="At least 8 characters"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-graphite/60">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-aurora-indigo">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
