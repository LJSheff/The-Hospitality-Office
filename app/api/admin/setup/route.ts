import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { admins } from "@/db/schema";
import { adminCookie, createSession, hashPassword, isOwnerSetupAvailable } from "@/lib/auth";
const schema=z.object({token:z.string().min(20).max(200),email:z.string().email().max(120),password:z.string().min(10).max(200)});
export async function POST(request:Request){ try { const {token,email,password}=schema.parse(await request.json()); if(!await isOwnerSetupAvailable(token)) return NextResponse.json({error:"This setup link is no longer available."},{status:403}); const id=crypto.randomUUID(), secure=await hashPassword(password); await getDb().insert(admins).values({id,email:email.toLowerCase(),passwordHash:secure.hash,passwordSalt:secure.salt}); const response=NextResponse.json({ok:true}); response.cookies.set(adminCookie(await createSession(id))); return response; } catch { return NextResponse.json({error:"Could not create the admin account."},{status:400}); } }
