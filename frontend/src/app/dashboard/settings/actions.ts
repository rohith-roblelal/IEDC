"use server";
import { revalidatePath } from "next/cache";

export async function revalidateSettings() {
  // Revalidate the entire layout so settings are fetched fresh
  revalidatePath("/", "layout");
}
