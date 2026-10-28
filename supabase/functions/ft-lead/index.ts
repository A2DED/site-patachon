// M. Patachon — réception des demandes de devis food truck (site m-patachon.fr)
// Crée un client (ft_clients) + un deal « prospect » (ft_deals) dans le CRM du dashboard.
// Déployée sur le projet Supabase « DASHBOARD RESTO » (verify_jwt = false : appel public depuis le site).
// Aucun devis n'est envoyé : la proposition chiffrée est préparée et validée à part.
import { createClient } from "jsr:@supabase/supabase-js@2";

const ORG_ID = "5c3d3d1d-c3cc-460f-bac0-c1832483015d"; // organisation « Patachon » du dashboard
const ALLOWED_ORIGINS = ["https://m-patachon.fr", "https://www.m-patachon.fr"];

const EVENT_TYPES = [
  "Repas d'entreprise / séminaire",
  "Anniversaire",
  "Baptême",
  "Mariage",
  "Lendemain de mariage",
  "Association / comité des fêtes",
  "Autre",
];
const PRO_TYPES = ["Repas d'entreprise / séminaire", "Association / comité des fêtes"];
const FORMULAS = ["Classique", "Gourmande", "Signature", "Je ne sais pas encore"];
const RECIPES = ["Bœuf bourguignon", "Végétarien", "Autre recette"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(?:(?:\+|00)33[\s.-]?(?:\(0\)[\s.-]?)?|0)[1-9](?:[\s.-]?\d{2}){4}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function cors(origin: string | null) {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Vary": "Origin",
  };
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json" },
  });
}

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function parisToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date());
}
function frDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return json({ error: "method" }, 405, origin);
  if (origin && !ALLOWED_ORIGINS.includes(origin)) return json({ error: "origin" }, 403, origin);

  let b: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 20000) return json({ error: "too_large" }, 413, origin);
    b = JSON.parse(raw);
  } catch {
    return json({ error: "bad_json" }, 400, origin);
  }

  // Pot de miel anti-spam : on répond OK sans rien enregistrer
  if (str(b._gotcha)) return json({ ok: true }, 200, origin);

  const d = {
    eventType: str(b.event_type, 80),
    date: str(b.event_date, 10),
    slot: str(b.service_slot, 10),
    start: str(b.start_time, 5),
    end: str(b.end_time, 5),
    street: str(b.street, 200),
    postcode: str(b.postcode, 10),
    city: str(b.city, 120),
    guests: Number(b.guests),
    formula: str(b.formula, 40),
    recipe: str(b.recipe, 40),
    recipeOther: str(b.recipe_other, 200),
    budget: str(b.budget, 200),
    name: str(b.name, 150),
    email: str(b.email, 200).toLowerCase(),
    phone: str(b.phone, 30),
    structure: str(b.structure, 200),
    siren: str(b.siren, 20).replace(/\s/g, ""),
    billingSame: b.billing_same !== false,
    billing: str(b.billing_address, 400),
    message: str(b.message, 4000),
  };

  const errors: string[] = [];
  if (!EVENT_TYPES.includes(d.eventType)) errors.push("event_type");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date) || d.date < parisToday()) errors.push("event_date");
  if (d.slot !== "midi" && d.slot !== "soir") errors.push("service_slot");
  if (d.start && !TIME_RE.test(d.start)) errors.push("start_time");
  if (d.end && !TIME_RE.test(d.end)) errors.push("end_time");
  if (!d.street) errors.push("street");
  if (!/^\d{5}$/.test(d.postcode)) errors.push("postcode");
  if (!d.city) errors.push("city");
  if (!Number.isInteger(d.guests) || d.guests < 1 || d.guests > 10000) errors.push("guests");
  if (d.formula && !FORMULAS.includes(d.formula)) errors.push("formula");
  if (d.recipe && !RECIPES.includes(d.recipe)) errors.push("recipe");
  if (!d.name) errors.push("name");
  if (!EMAIL_RE.test(d.email)) errors.push("email");
  if (!PHONE_RE.test(d.phone)) errors.push("phone");
  const isPro = PRO_TYPES.includes(d.eventType);
  if (isPro && !d.structure) errors.push("structure");
  if (d.siren && !/^\d{9}$/.test(d.siren)) errors.push("siren");
  if (errors.length) return json({ error: "invalid", fields: errors }, 422, origin);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const location = `${d.street}, ${d.postcode} ${d.city}`;
  const recipe = d.recipe === "Autre recette" && d.recipeOther ? `Autre recette : ${d.recipeOther}` : d.recipe;
  const billing = d.billingSame ? "Identique à l'adresse de l'événement" : d.billing;
  const clientName = isPro ? d.structure : d.name;

  // Client : on réutilise une fiche existante (même e-mail) sans la modifier, sinon on en crée une
  let clientId: string | null = null;
  const { data: existing } = await supabase
    .from("ft_clients")
    .select("id")
    .eq("org_id", ORG_ID)
    .ilike("email", d.email)
    .limit(1);
  if (existing && existing.length) {
    clientId = existing[0].id;
  } else {
    const { data: client, error } = await supabase
      .from("ft_clients")
      .insert({
        org_id: ORG_ID,
        name: clientName,
        client_type: isPro ? "entreprise" : "particulier",
        contact_name: d.name,
        email: d.email,
        phone: d.phone,
        city: d.city,
      })
      .select("id")
      .single();
    if (error) {
      console.error("ft_clients insert", error);
      return json({ error: "db" }, 500, origin);
    }
    clientId = client.id;
  }

  const notes = [
    `Lead food truck via formulaire site m-patachon.fr (${frDate(parisToday())}).`,
    `Type : ${d.eventType}`,
    `Service : ${d.slot === "midi" ? "Midi" : "Soir"}${d.start || d.end ? ` (${d.start || "?"} – ${d.end || "?"})` : ""}`,
    `Convives : ${d.guests}`,
    `Formule envisagée : ${d.formula || "—"}`,
    `Recette : ${recipe || "—"}`,
    `Budget indicatif : ${d.budget || "—"}`,
    isPro ? `Structure : ${d.structure}${d.siren ? ` — SIREN ${d.siren}` : ""}` : "",
    `Contact : ${d.name} — ${d.email} — ${d.phone}`,
    `Facturation : ${billing || "—"}`,
    d.message ? `Message : ${d.message}` : "",
  ].filter(Boolean).join("\n");

  const { error: dealErr } = await supabase.from("ft_deals").insert({
    org_id: ORG_ID,
    client_id: clientId,
    title: `${d.eventType} — ${clientName} (${d.guests} pers)`,
    status: "prospect",
    event_date: d.date,
    start_time: d.start || null,
    end_time: d.end || null,
    location,
    event_kind: "prive",
    contact_source: "site_web",
    event_type: d.eventType,
    service_slot: d.slot,
    guests: d.guests,
    formula: d.formula || null,
    recipe: recipe || null,
    budget: d.budget || null,
    siren: d.siren || null,
    billing_address: billing || null,
    message: d.message || null,
    notes,
  });
  if (dealErr) {
    console.error("ft_deals insert", dealErr);
    return json({ error: "db" }, 500, origin);
  }

  return json({ ok: true }, 200, origin);
});
