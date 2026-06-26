// Edge Function: send-lead-notification
// Triggered by Supabase Database Webhook on INSERT to public.leads
// Fetches lead + property details and sends an email via Resend.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const NOTIFY_EMAIL = Deno.env.get("NOTIFY_EMAIL") ?? "nevesagiv@outlook.com";
const FROM_ADDRESS = "Neve Sagiv Leads <leads@notify.send.neve-sagiv.co.il>";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function he(field: unknown): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object" && field !== null && "he" in field) {
    return (field as { he?: string }).he ?? "";
  }
  return "";
}

function buildPropertyBlock(p: Record<string, unknown> | null): string {
  if (!p) return "<p><em>ליד כללי (לא משויך לנכס ספציפי)</em></p>";
  const type = he(p.property_type);
  const city = he(p.city);
  const street = (p.street as string | null) ?? "";
  const fullAddress = (p.full_address as string | null) ?? "—";
  const trusteeName = (p.trustee_name as string | null) ?? "—";
  const trusteePhone = (p.trustee_phone as string | null) ?? "—";
  const headline = `${type} ב${city}${street ? `, רחוב ${street}` : ""}`;
  return `
    <p style="margin:0 0 6px 0;"><strong>נכס מבוקש:</strong> ${headline}</p>
    <p style="margin:0 0 6px 0;"><strong>כתובת מלאה (פנימי):</strong> ${fullAddress}</p>
    <p style="margin:0;"><strong>עו"ד / כונס:</strong> ${trusteeName}, ${trusteePhone}</p>
  `;
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const lead = payload.record;
    if (!lead?.id) {
      return new Response(JSON.stringify({ error: "Missing lead.record" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let propertyHtml = "<p><em>ליד כללי (לא משויך לנכס ספציפי)</em></p>";
    if (lead.property_id) {
      const { data: property } = await supabase
        .from("properties")
        .select("city, street, property_type, full_address, trustee_name, trustee_phone")
        .eq("id", lead.property_id)
        .single();
      propertyHtml = buildPropertyBlock(property);
    }

    const html = `
      <div dir="rtl" style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#222;">
        <h2 style="color:#1e3a5f;margin:0 0 16px 0;">🎯 ליד חדש מהאתר</h2>
        <div style="background:#f5f7fa;padding:16px;border-radius:8px;margin-bottom:16px;">
          <p style="margin:0 0 6px 0;"><strong>שם:</strong> ${lead.full_name ?? "—"}</p>
          <p style="margin:0 0 6px 0;"><strong>טלפון:</strong> <a href="tel:${lead.phone ?? ""}" style="color:#1e3a5f;">${lead.phone ?? "—"}</a></p>
          ${lead.email ? `<p style="margin:0 0 6px 0;"><strong>מייל:</strong> <a href="mailto:${lead.email}">${lead.email}</a></p>` : ""}
          ${lead.message ? `<p style="margin:0;"><strong>הערה:</strong><br>${lead.message}</p>` : ""}
        </div>
        <div style="background:#fff8e1;padding:16px;border-radius:8px;border-right:3px solid #d4a017;">
          ${propertyHtml}
        </div>
        <p style="color:#888;font-size:12px;margin-top:24px;">
          נשלח אוטומטית מ-neve-sagiv.co.il · ${new Date(lead.created_at).toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" })}
        </p>
      </div>
    `;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [NOTIFY_EMAIL],
        subject: `🎯 ליד חדש: ${lead.full_name ?? "ליד"}`,
        html,
        reply_to: lead.email || undefined,
      }),
    });
    const emailResult = await emailRes.json();

    await supabase.from("email_log").insert({
      lead_id: lead.id,
      status: emailRes.ok ? "sent" : "failed",
      sent_at: emailRes.ok ? new Date().toISOString() : null,
      error: emailRes.ok ? null : JSON.stringify(emailResult),
    });

    return new Response(JSON.stringify({ ok: emailRes.ok, result: emailResult }), {
      status: emailRes.ok ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
