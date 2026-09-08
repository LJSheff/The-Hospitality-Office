import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { currentAdmin } from "@/lib/auth";
import { getDb } from "@/db";
import { bookings } from "@/db/schema";
import BookingTable from "./table";
export const dynamic="force-dynamic";
export default async function Admin(){const admin=await currentAdmin();if(!admin)redirect("/admin/login");const rows=await getDb().select().from(bookings).orderBy(desc(bookings.createdAt));return <main className="admin"><header><a className="brand" href="/"><b>THO</b><span>The Hospitality<br/>Office</span></a><form action="/api/admin/logout" method="post"><button>Sign out</button></form></header><section><p className="eyebrow">BOOKING DASHBOARD</p><h1>Enquiries</h1><p>{rows.length} total booking{rows.length===1?"":"s"} · Signed in as {admin.email}</p><BookingTable bookings={rows}/></section></main>}
