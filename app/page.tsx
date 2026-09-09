"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const services = [
  { number: "01", title: "Team lunches", description: "Fresh, flexible food that makes a working day feel considered — from relaxed lunches to client meetings." },
  { number: "02", title: "Weddings", description: "Thoughtful wedding food, planned around your day, your guests and the way you want to celebrate." },
  { number: "03", title: "Private cooking classes", description: "Hands-on cooking experiences for one-to-one sessions or small groups of up to 12 people." },
  { number: "04", title: "Freelance & agency chef cover", description: "Reliable chef cover for care homes, restaurants, pubs and bistros across North Yorkshire — without agency fees." },
  { number: "05", title: "Events & celebrations", description: "Generous food and thoughtful hosting for parties, gatherings and special occasions." },
  { number: "06", title: "Tailored hospitality", description: "A bespoke food experience shaped around your people, space and occasion." },
];

const galleryPhotos = [
  { src: "/images/IMG_6490.jpeg", alt: "A plated dish prepared by The Hospitality Office", className: "portrait" },
  { src: "/images/IMG_7205.jpeg", alt: "A warmly dressed dining room", className: "wide" },
  { src: "/images/IMG_7207.jpeg", alt: "A table set for guests", className: "wide" },
  { src: "/images/IMG_7209.jpeg", alt: "An intimate dining table", className: "portrait" },
  { src: "/images/IMG_7210.jpeg", alt: "Kitchen preparation area", className: "portrait" },
  { src: "/images/IMG_7212.jpeg", alt: "Dining room detail", className: "portrait" },
  { src: "/images/IMG_7215.jpeg", alt: "Restaurant interior lighting", className: "portrait" },
];

const blank = { name: "", email: "", phone: "", service: "", eventDate: "", guests: "", location: "", details: "", website: "" };

export default function Home() {
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const isClass = form.service === "Private cooking classes";
  const isChefCover = form.service === "Freelance & agency chef cover";

  const selectService = (service: string) => {
    setForm((current) => ({ ...current, service }));
    document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const change = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [event.target.name]: event.target.value });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (form.website) return;
    setSaving(true); setMessage("");
    const { error } = await supabase.from("bookings").insert({
      name: form.name, email: form.email, phone: form.phone, event_type: form.service,
      event_date: form.eventDate || null, guests: Number(form.guests), location: form.location, notes: form.details,
    });
    setSaving(false);
    if (error) setMessage("Something went wrong. Please try again.");
    else { setForm(blank); setMessage("Thank you — we’ve received your enquiry and will get back to you as soon as possible."); }
  }

  const groupLabel = isClass ? "Number of people attending (maximum 12)" : isChefCover ? "How many chef shifts need covering?" : "Approximate guest numbers";
  const detailsLabel = isChefCover ? "Tell us about the kitchen, dates, shift times and cover needed" : isClass ? "Tell us what you’d like to learn, dietary needs and preferred format" : "Tell us a little more about your plans, menu ideas or dietary requirements";

  return <main>
    <header><a className="brand" href="#top"><b>THO</b><span>The Hospitality<br />Office</span></a><nav><a href="#services">Services</a><a href="#booking">Enquire</a><a href="/admin/login">Admin</a></nav></header>
    <section id="top" className="hero"><div><p className="eyebrow">CATERING · EVENTS · HOSPITALITY</p><h1>Food that brings <i>people</i> together.</h1><p className="lead">Thoughtful, generous food for working days, celebrations, weddings and hands-on cooking experiences.</p><a className="button" href="#booking">Plan your gathering →</a></div><div className="heroImage" role="img" aria-label="A warmly dressed dining room" /></section>
    <section className="intro"><p className="eyebrow">THE HOSPITALITY OFFICE</p><h2>From the first coffee to the last bite, we make hosting feel easy.</h2><p>Beautiful food, thoughtful details and the kind of hospitality your guests remember.</p></section>
    <section id="services" className="services"><p className="eyebrow">HOW WE CAN HELP</p><h2>Made for every kind of gathering.</h2><div className="cards">{services.map((service) => <article key={service.title}><span>{service.number}</span><h3>{service.title}</h3><p>{service.description}</p><button className="serviceButton" onClick={() => selectService(service.title)}>Enquire about this service →</button></article>)}</div></section>
    <section className="chefNote"><p className="eyebrow">DIRECT CHEF COVER</p><h2>Reduce agency fees. Go straight to the source.</h2><p>For flexible, dependable kitchen support across North Yorkshire, book chef cover directly with The Hospitality Office.</p><button className="button" onClick={() => selectService("Freelance & agency chef cover")}>Request chef cover →</button></section>
    <section className="gallery" aria-labelledby="gallery-title"><div className="galleryHeading"><p className="eyebrow">THE SPACE &amp; THE FOOD</p><h2 id="gallery-title">Made to be shared.</h2></div><div className="galleryGrid">{galleryPhotos.map((photo) => <img key={photo.src} className={photo.className} src={photo.src} alt={photo.alt} loading="lazy" />)}</div></section>
    <section id="booking" className="booking"><div><p className="eyebrow">LET’S MAKE A PLAN</p><h2>Tell us what you need.</h2><p>Share a few details and we’ll come back with the right next step.</p></div><form onSubmit={submit}><input className="trap" name="website" tabIndex={-1} value={form.website} onChange={change} /><div className="two"><label>Name<input required name="name" value={form.name} onChange={change} /></label><label>Email<input required type="email" name="email" value={form.email} onChange={change} /></label></div><div className="two"><label>Phone number<input required type="tel" name="phone" value={form.phone} onChange={change} /></label><label>Service<select required name="service" value={form.service} onChange={change}><option value="" disabled>Select a service</option>{services.map((service) => <option key={service.title}>{service.title}</option>)}</select></label></div><div className="two"><label>{isChefCover ? "First date cover is needed" : "Preferred date"}<input type="date" name="eventDate" value={form.eventDate} onChange={change} /></label><label>{groupLabel}<input required type="number" min="1" max={isClass ? "12" : "5000"} name="guests" value={form.guests} onChange={change} /></label></div><label>{isChefCover ? "Venue / kitchen location" : "Venue or location"}<input required name="location" value={form.location} onChange={change} /></label><label>{detailsLabel}<textarea required name="details" rows={5} maxLength={1500} value={form.details} onChange={change} /></label><button className="button" disabled={saving}>{saving ? "Sending…" : "Send enquiry →"}</button><p aria-live="polite" className="status">{message}</p></form></section>
    <footer><span>© {new Date().getFullYear()} The Hospitality Office</span><a href="https://www.instagram.com/thehospitalityoffice.co.uk/" target="_blank" rel="noreferrer">Instagram ↗</a></footer>
  </main>;
}
