import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { HangulConstellation } from "@/components/HangulConstellation";

const FEATURES = [
  { title: "AI Teacher", desc: "A tutor that explains grammar, corrects pronunciation, and adapts to you — available 24/7.", icon: "🧠" },
  { title: "TOPIK Center", desc: "Full-length TOPIK I & II mock exams with a real timer and instant, detailed grading.", icon: "📝" },
  { title: "Video + PDF Lessons", desc: "Structured lessons you can watch, read, and revisit — downloadable for offline study.", icon: "🎬" },
  { title: "Daily AI Study Plans", desc: "A plan generated for you every morning based on your level and last week's progress.", icon: "📅" },
  { title: "Speaking Practice", desc: "Practice speaking Korean out loud and get feedback on pronunciation, not just grammar.", icon: "🎙️" },
  { title: "Progress & Achievements", desc: "Streaks, certificates, and monthly reports that make growth visible.", icon: "🏆" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-aurora-mesh animate-drift" aria-hidden />
        <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span className="font-display text-xl font-bold">Ode<span className="gradient-text">Korean</span></span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary">Log in</Link>
            <Link href="/register" className="btn-primary">Start learning</Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pb-24 pt-16 text-center">
          <span className="mb-6 rounded-full border border-line bg-white/70 px-4 py-1.5 text-sm text-graphite/70 backdrop-blur">
            Built in Uzbekistan, for the world 🇺🇿 → 🇰🇷
          </span>
          <h1 className="max-w-3xl font-display text-5xl font-bold leading-[1.05] sm:text-7xl">
            Learn Korean with an
            <br />
            <span className="gradient-text">AI teacher who never sleeps.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-graphite/70">
            Lessons, TOPIK prep, speaking practice, and a real study plan —
            adapted to you every single day.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="btn-primary text-lg">Start free</Link>
            <Link href="#features" className="btn-secondary text-lg">See how it works</Link>
          </div>

          <div className="mt-20 w-full">
            <HangulConstellation />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">
          Everything you need to reach TOPIK fluency
        </h2>
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="animate-rise">
              <div className="mb-4 text-3xl">{f.icon}</div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-graphite/70">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="rounded-xl3 bg-gradient-to-br from-aurora-blue via-aurora-indigo to-aurora-vermilion p-12 text-center text-white shadow-glow">
          <h3 className="font-display text-3xl font-bold">시작할 준비 되셨나요?</h3>
          <p className="mt-2 text-white/80">Ready to start? Your first lesson is free.</p>
          <Link href="/register" className="mt-8 inline-flex rounded-full bg-white px-8 py-3 font-semibold text-graphite">
            Create free account
          </Link>
        </div>
      </section>

      <footer className="border-t border-line py-8 text-center text-sm text-graphite/50">
        © {new Date().getFullYear()} OdeKorean. Built for the President Tech Award.
      </footer>
    </main>
  );
}
