import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { currentAdmin } from "@/lib/auth";
import { getDb } from "@/db";
import { bookings } from "@/db/schema";
const schema=z.object({status:z.enum(["pending","confirmed","completed","cancelled","no_show"])});
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){ if(!await currentAdmin()) return NextResponse.json({error:"Unauthorised"},{status:401}); try{const {id}=await params;const {status}=schema.parse(await request.json());await getDb().update(bookings).set({status}).where(eq(bookings.id,id));return NextResponse.json({ok:true});}catch{return NextResponse.json({error:"Could not update booking."},{status:400});}}
