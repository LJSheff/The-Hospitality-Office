import { NextResponse } from "next/server";
export async function POST(){const r=NextResponse.json({ok:true});r.cookies.set({name:"tho_admin",value:"",path:"/",maxAge:0});return r;}
