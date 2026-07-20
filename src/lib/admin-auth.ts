import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "pergola_admin";

const password = process.env.ADMIN_PASSWORD;

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const c = store.get(COOKIE_NAME);
  return Boolean(password && c?.value === password);
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function loginAdmin(input: string): Promise<boolean> {
  if (!password || input !== password) return false;
  const store = await cookies();
  store.set(COOKIE_NAME, password, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return true;
}

export async function logoutAdmin() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
