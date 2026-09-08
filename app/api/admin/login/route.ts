import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { admins } from "@/db/schema";
import { adminCookie, createSession, hashPassword } from "@/lib/auth";
const schema=z.object({email:z.string().email().max(120),password:z.string().min(10).max(200)});
export async function POST(request:Request){ try { const {email,password}=schema.parse(await request.json()); const [admin]=await getDb().select().from(admins).where(eq(admins.email,email.toLowerCase())).limit(1); if(!admin) return NextResponse.json({error:"Email or password is incorrect."},{status:401}); const attempt=await hashPassword(password,admin.passwordSalt); if(attempt.hash!==admin.passwordHash) return NextResponse.json({error:"Email or password is incorrect."},{status:401}); const response=NextResponse.json({ok:true}); response.cookies.set(adminCookie(await createSession(admin.id))); return response; } catch { return NextResponse.json({error:"Email or password is incorrect."},{status:401}); } }
