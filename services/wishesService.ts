import { GuestWish } from "../types";

// Tempel URL Web App dari Google Apps Script di sini.
// Contoh: "https://script.google.com/macros/s/AKfyc.../exec"
export const WISHES_API_URL =
  "https://script.google.com/macros/s/AKfycbz0_wdH5b0_CNKi0dOE9kTQqyv-cK3vM9gvk2B_yb3GrV5342fXHoxGMorIsjU309LyKQ/exec";

export async function fetchWishes(): Promise<GuestWish[]> {
  if (!WISHES_API_URL) return [];
  const res = await fetch(WISHES_API_URL, { method: "GET" });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const data = await res.json();
  const list: GuestWish[] = Array.isArray(data?.wishes) ? data.wishes : [];
  return list.sort((a, b) => b.timestamp - a.timestamp);
}

export async function addWish(input: {
  name: string;
  message: string;
}): Promise<GuestWish> {
  if (!WISHES_API_URL) throw new Error("WISHES_API_URL belum diisi");
  const res = await fetch(WISHES_API_URL, {
    method: "POST",
    // text/plain dipakai supaya tidak memicu CORS preflight (Apps Script tidak handle OPTIONS)
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ name: input.name, message: input.message }),
  });
  if (!res.ok) throw new Error(`Submit failed: ${res.status}`);
  const data = await res.json();
  if (!data?.ok || !data?.wish) {
    throw new Error(data?.error || "Submit gagal");
  }
  return data.wish as GuestWish;
}
