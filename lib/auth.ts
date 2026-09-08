import { cookies } from "next/headers";
import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { admins } from "@/db/schema";

const COOKIE = "tho_admin";
const encoder = new TextEncoder();
const b64 = (data: Uint8Array | string) => Buffer.from(data).toString("base64url");
const bytes = (value: string) => Uint8Array.from(Buffer.from(value, "base64url"));
const secret = () => { if (!env.AUTH_SESSION_SECRET) throw new Error("Admin login is not configured."); return env.AUTH_SESSION_SECRET; };
async function hmac(value: string) { const key = await crypto.subtle.importKey("raw", encoder.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]); return b64(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)))); }
export async function hashPassword(password: string, salt = b64(crypto.getRandomValues(new Uint8Array(16)))) { const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]); const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: bytes(salt), iterations: 210000, hash: "SHA-256" }, key, 256); return { salt, hash: b64(new Uint8Array(bits)) }; }
export async function createSession(id: string) { const payload = b64(JSON.stringify({ id, exp: Date.now() + 7 * 86400000 })); return `${payload}.${await hmac(payload)}`; }
export async function currentAdmin() { const token = (await cookies()).get(COOKIE)?.value; if (!token) return null; const [payload, signature] = token.split("."); if (!payload || !signature || signature !== await hmac(payload)) return null; try { const { id, exp } = JSON.parse(Buffer.from(payload, "base64url").toString()); if (!id || exp < Date.now()) return null; const [admin] = await getDb().select().from(admins).where(eq(admins.id, id)).limit(1); return admin ?? null; } catch { return null; } }
export const adminCookie = (value: string) => ({ name: COOKIE, value, httpOnly: true, secure: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 7 });
export async function isOwnerSetupAvailable(token: string) { if (!env.ADMIN_SETUP_TOKEN || token !== env.ADMIN_SETUP_TOKEN) return false; const all = await getDb().select({ id: admins.id }).from(admins).limit(1); return all.length === 0; }
