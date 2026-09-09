"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Booking = {
  id: string; name: string; email: string; phone: string; event_type: string;
  event_date: string | null; guests: number; location: string; notes: string; status: string;
};

const phoneLink = (phone: string) => {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return cleaned.startsWith("0") ? `+44${cleaned.slice(1)}` : cleaned;
};

export default function Admin() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/admin/login");
      const { data, error: bookingsError } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
      if (bookingsError) setError("This signed-in account is not yet authorised to view enquiries. Add this user to the admin_users table in Supabase, then sign out and back in.");
      else setRows(data || []);
      setLoading(false);
    })();
  }, [router]);

  async function update(id: string, status: string) {
    const { error: updateError } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (updateError) setError("The status could not be updated. Please check the admin user setup in Supabase.");
    else {
      const next = rows.map((row) => row.id === id ? { ...row, status } : row);
      setRows(next);
      setSelected(next.find((row) => row.id === id) || null);
    }
  }

  async function remove(booking: Booking) {
    if (!window.confirm(`Delete the enquiry from ${booking.name}? This cannot be undone.`)) return;
    const { error: deleteError } = await supabase.from("bookings").delete().eq("id", booking.id);
    if (deleteError) setError("The enquiry could not be deleted. Please check the admin user setup in Supabase.");
    else { setRows((current) => current.filter((row) => row.id !== booking.id)); setSelected(null); }
  }

  async function out() { await supabase.auth.signOut(); router.push("/admin/login"); }

  return <main className="admin"><header><a className="brand" href="/"><b>THO</b><span>The Hospitality<br />Office</span></a><button onClick={out}>Sign out</button></header><section><p className="eyebrow">BOOKING DASHBOARD</p><h1>Enquiries</h1>{loading ? <div className="empty">Loading enquiries…</div> : error ? <div className="adminNotice">{error}</div> : !rows.length ? <div className="empty">No enquiries yet.</div> : <><div className="tablewrap"><table><thead><tr><th>Customer</th><th>Event</th><th>Details</th><th>Status</th><th></th></tr></thead><tbody>{rows.map((booking) => <tr key={booking.id}><td><b>{booking.name}</b><br />{booking.email}<br />{booking.phone}</td><td>{booking.event_type}<br />{booking.event_date || "Date to confirm"}</td><td>{booking.guests} guests<br />{booking.location}</td><td><span className={`statusPill ${booking.status}`}>{booking.status.replace("_", " ")}</span></td><td><button className="viewButton" onClick={() => setSelected(booking)}>View job →</button></td></tr>)}</tbody></table></div>{selected && <aside className="jobPanel" aria-label={`Enquiry from ${selected.name}`}><div className="jobPanelTop"><div><p className="eyebrow">CUSTOMER ENQUIRY</p><h2>{selected.name}</h2></div><button className="closeButton" onClick={() => setSelected(null)} aria-label="Close enquiry details">×</button></div><div className="jobDetails"><div><span>Service</span><b>{selected.event_type}</b></div><div><span>Date</span><b>{selected.event_date || "To be confirmed"}</b></div><div><span>Guests / shifts</span><b>{selected.guests}</b></div><div><span>Location</span><b>{selected.location}</b></div></div><div className="jobMessage"><span>Customer notes</span><p>{selected.notes || "No additional notes provided."}</p></div><div className="quickActions"><a className="actionButton" href={`tel:${phoneLink(selected.phone)}`}>Call customer</a><a className="actionButton" href={`sms:${phoneLink(selected.phone)}`}>Text customer</a><a className="actionButton" href={`mailto:${selected.email}`}>Email customer</a></div><label className="statusControl">Job status<select value={selected.status} onChange={(event) => update(selected.id, event.target.value)}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="no_show">No show</option></select></label><button className="deleteButton" onClick={() => remove(selected)}>Delete enquiry</button></aside>}</>}</section></main>;
}
