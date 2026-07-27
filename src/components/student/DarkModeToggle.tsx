"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("odekorean-theme");
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("odekorean-theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-medium hover:bg-mist"
    >
      {dark ? <Moon size={16} /> : <Sun size={16} />}
      {dark ? "Dark mode on" : "Light mode on"}
    </button>
  );
}
