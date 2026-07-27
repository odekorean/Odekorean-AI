import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DarkModeToggle } from "@/components/student/DarkModeToggle";
import { updateProfile, updatePassword, signOut } from "@/app/(student)/settings/actions";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl font-bold">Settings</h1>

      <Card className="mt-8">
        <h2 className="font-display text-lg font-semibold">Profile</h2>
        <form action={updateProfile} className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium">Full name</label>
            <input
              name="full_name"
              defaultValue={profile?.full_name ?? ""}
              className="mt-1 w-full rounded-xl border border-line px-4 py-3"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input disabled value={user?.email ?? ""} className="mt-1 w-full rounded-xl border border-line bg-mist px-4 py-3 text-graphite/50" />
          </div>
          <div>
            <label className="text-sm font-medium">Current level</label>
            <select name="current_level" defaultValue={profile?.current_level ?? "beginner"} className="mt-1 w-full rounded-xl border border-line px-4 py-3">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <Button type="submit">Save profile</Button>
        </form>
      </Card>

      <Card className="mt-6">
        <h2 className="font-display text-lg font-semibold">Password</h2>
        <form action={updatePassword} className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium">New password</label>
            <input
              type="password"
              name="password"
              minLength={8}
              required
              className="mt-1 w-full rounded-xl border border-line px-4 py-3"
              placeholder="At least 8 characters"
            />
          </div>
          <Button type="submit" variant="secondary">Update password</Button>
        </form>
      </Card>

      <Card className="mt-6">
        <h2 className="font-display text-lg font-semibold">Appearance</h2>
        <p className="mt-1 text-sm text-graphite/60">Choose how OdeKorean looks on your device.</p>
        <div className="mt-4">
          <DarkModeToggle />
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="font-display text-lg font-semibold">Notifications</h2>
        <div className="mt-4 space-y-3">
          {["Daily study reminder", "Weekly progress report", "New lesson alerts"].map((label) => (
            <label key={label} className="flex items-center justify-between rounded-xl border border-line px-4 py-3 text-sm">
              {label}
              <input type="checkbox" defaultChecked className="h-5 w-5" />
            </label>
          ))}
        </div>
        <p className="mt-3 text-xs text-graphite/40">
          Wire these to a `notification_preferences` table + a scheduled email/push job in Phase 2.
        </p>
      </Card>

      <form action={signOut} className="mt-8">
        <button className="text-sm font-semibold text-danger">Sign out</button>
      </form>
    </main>
  );
}
