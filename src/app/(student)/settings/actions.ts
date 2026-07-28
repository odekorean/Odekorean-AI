"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const fullName = formData.get("full_name") as string;
  const currentLevel = formData.get("current_level") as string;

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, current_level: currentLevel, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const newPassword = formData.get("password") as string;
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
