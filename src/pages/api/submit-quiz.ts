import type { APIRoute } from "astro";
// cloudflare:workers is the new way to access runtime env in Astro 6 with
// the Cloudflare adapter. It's provided by the adapter at runtime and
// shimmed to an empty object in `astro dev` (we fall back to import.meta.env).
// eslint-disable-next-line import/no-unresolved
import { env as cfEnv } from "cloudflare:workers";

import { GHL_FIELD_IDS } from "../../lib/ghl-fields";
import { normalizeValue } from "../../lib/ghl-value-map";

/**
 * Quiz submission proxy → GoHighLevel v2 Contacts Upsert API.
 *
 * Runs on the Cloudflare Workers runtime (V8 isolate).
 * Uses only Web-standard APIs (fetch, Headers, Request, Response, URL).
 *
 * Why v2 Contacts Upsert and not /forms/submit?
 * GHL's public /forms/submit endpoint is Cloudflare-WAF-protected and
 * 403s all non-browser traffic (server-to-server calls and browser
 * cross-origin fetches both fail). The v2 REST API at
 * services.leadconnectorhq.com is the supported server-side path,
 * authenticated with a private integration token (pit-...).
 *
 * Secrets (GHL_LOCATION_ID, GHL_API_KEY, DEBUG) live in:
 *   - .env (local dev, read by Vite at build time via import.meta.env)
 *   - Cloudflare dashboard → Workers & Pages → (worker) → Settings →
 *     Variables and Secrets (production, read at runtime via
 *     context.locals.runtime.env)
 *
 * Never exposes raw GHL responses, IDs, credentials, or stack traces to
 * the client.
 */

export const prerender = false;

const GHL_UPSERT_ENDPOINT = "https://services.leadconnectorhq.com/contacts/upsert";
const GHL_API_VERSION = "2021-07-28";

interface QuizPayload {
  lead_id?: string;
  event_id?: string;
  full_name: string;
  email: string;
  phone: string;
  company?: string;
  website?: string;

  business_type?: string;
  revenue_range?: string;
  team_size?: string;
  ways_to_get_clients?: string;
  biggest_challenge?: string;
  investment_readiness?: string;
  time_in_business?: string;
  call_timeline?: string;
  commitment_confirmed?: string;

  quiz_score: string;
  lead_tier: string;

  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  utm_id?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  fb_browser_id?: string;
  fb_click_id?: string;
  landing_page?: string;
  referrer?: string;
}

interface ApiResponse {
  success: boolean;
  error?: string;
}

interface CustomFieldEntry {
  id: string;
  value: string | string[];
}

type TrackingFieldIds = {
  lead_id?: string;
  event_id?: string;
  gclid_id?: string;
};

type FieldResolverCache = {
  key: string;
  expiresAt: number;
  ids: TrackingFieldIds;
};

let trackingFieldCache: FieldResolverCache | null = null;

function json(body: ApiResponse, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function readEnv(): {
  GHL_LOCATION_ID?: string;
  GHL_API_KEY?: string;
  DEBUG?: string;
} {
  const runtimeEnv = (cfEnv ?? {}) as Record<string, string | undefined>;
  const viteEnv: Record<string, string | undefined> =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env as unknown as Record<string, string | undefined>)
      : {};

  return {
    GHL_LOCATION_ID: runtimeEnv.GHL_LOCATION_ID ?? viteEnv.GHL_LOCATION_ID,
    GHL_API_KEY: runtimeEnv.GHL_API_KEY ?? viteEnv.GHL_API_KEY,
    DEBUG: runtimeEnv.DEBUG ?? viteEnv.DEBUG,
  };
}

function isNonEmpty(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function addCF(
  out: CustomFieldEntry[],
  id: string,
  value: string | string[] | null | undefined,
): void {
  if (value == null) return;
  if (Array.isArray(value)) {
    if (value.length === 0) return;
    out.push({ id, value });
    return;
  }
  if (!isNonEmpty(value)) return;
  out.push({ id, value: value.trim() });
}

function splitFullName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

/**
 * Convert a CSV ("a,b,c" or "a, b, c") or empty string to array of trimmed non-empty tokens.
 */
function csvToArray(csv: string | undefined): string[] {
  if (!csv) return [];
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function resolveTrackingFieldIds(input: {
  locationId: string;
  apiKey: string;
  debug: boolean;
}): Promise<TrackingFieldIds> {
  const cacheKey = `${input.locationId}:${GHL_API_VERSION}`;
  if (
    trackingFieldCache &&
    trackingFieldCache.key === cacheKey &&
    trackingFieldCache.expiresAt > Date.now()
  ) {
    return trackingFieldCache.ids;
  }

  const endpoint = `https://services.leadconnectorhq.com/locations/${encodeURIComponent(
    input.locationId,
  )}/customFields?model=contact`;

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        Version: GHL_API_VERSION,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      if (input.debug) {
        const msg = await res.text().catch(() => "");
        console.warn(
          `[submit-quiz] customFields lookup failed status=${res.status} body=${msg.slice(0, 300)}`,
        );
      }
      return {};
    }

    const data = (await res.json()) as unknown;
    const maybeObj = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
    const rawList = Array.isArray(maybeObj.customFields)
      ? maybeObj.customFields
      : Array.isArray(maybeObj.fields)
        ? maybeObj.fields
        : [];

    const out: TrackingFieldIds = {};

    for (const item of rawList) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const id = typeof row.id === "string" ? row.id : undefined;
      const fieldKey = typeof row.fieldKey === "string" ? row.fieldKey : undefined;
      if (!id || !fieldKey) continue;
      if (fieldKey === "lead_id" || fieldKey === "track_lead_id") out.lead_id = id;
      if (fieldKey === "event_id" || fieldKey === "track_event_id") out.event_id = id;
      if (fieldKey === "gclid_id" || fieldKey === "track_gclid_id") out.gclid_id = id;
    }

    trackingFieldCache = {
      key: cacheKey,
      expiresAt: Date.now() + 10 * 60 * 1000,
      ids: out,
    };

    if (input.debug) {
      console.log("[submit-quiz] resolved tracking field IDs:", JSON.stringify(out));
    }

    return out;
  } catch (err) {
    if (input.debug) {
      console.warn("[submit-quiz] customFields lookup exception:", err);
    }
    return {};
  }
}

export const POST: APIRoute = async ({ request }) => {
  const env = readEnv();
  const debug =
    isNonEmpty(env.DEBUG) && env.DEBUG !== "false" && env.DEBUG !== "0";

  if (!env.GHL_LOCATION_ID || !env.GHL_API_KEY) {
    console.error("[submit-quiz] Missing GHL_LOCATION_ID or GHL_API_KEY");
    return json({ success: false, error: "Server not configured" }, 500);
  }

  let payload: QuizPayload;
  try {
    const body = (await request.json()) as unknown;
    if (!body || typeof body !== "object") {
      return json({ success: false, error: "Invalid request body" }, 400);
    }
    payload = body as QuizPayload;
  } catch {
    return json({ success: false, error: "Invalid JSON" }, 400);
  }

  for (const key of ["full_name", "email", "phone", "quiz_score", "lead_tier"] as const) {
    if (!isNonEmpty(payload[key])) {
      return json({ success: false, error: `Missing required field: ${key}` }, 400);
    }
  }

  const { firstName, lastName } = splitFullName(payload.full_name);

  const ip_address = request.headers.get("CF-Connecting-IP") ?? "";
  const user_agent = request.headers.get("User-Agent") ?? "";
  const resolvedTrackingIds = await resolveTrackingFieldIds({
    locationId: env.GHL_LOCATION_ID,
    apiKey: env.GHL_API_KEY,
    debug,
  });

  // ── Custom fields ───────────────────────────────────────────────────────
  const customFields: CustomFieldEntry[] = [];

  addCF(customFields, GHL_FIELD_IDS.business_type, normalizeValue.business_type(payload.business_type));
  addCF(customFields, GHL_FIELD_IDS.revenue_range, normalizeValue.revenue_range(payload.revenue_range));
  addCF(customFields, GHL_FIELD_IDS.team_size, normalizeValue.team_size(payload.team_size));
  addCF(customFields, GHL_FIELD_IDS.time_in_business, normalizeValue.time_in_business(payload.time_in_business));
  addCF(customFields, GHL_FIELD_IDS.investment_readiness, normalizeValue.investment_readiness(payload.investment_readiness));
  addCF(customFields, GHL_FIELD_IDS.commitment_confirmed, normalizeValue.commitment_confirmed(payload.commitment_confirmed));
  addCF(customFields, GHL_FIELD_IDS.call_timeline, normalizeValue.call_timeline(payload.call_timeline));

  addCF(
    customFields,
    GHL_FIELD_IDS.ways_to_get_clients,
    normalizeValue.ways_to_get_clients(csvToArray(payload.ways_to_get_clients)),
  );
  addCF(
    customFields,
    GHL_FIELD_IDS.biggest_challenge,
    normalizeValue.biggest_challenge(csvToArray(payload.biggest_challenge)),
  );

  addCF(customFields, GHL_FIELD_IDS.quiz_score, payload.quiz_score);
  addCF(customFields, GHL_FIELD_IDS.lead_tier, normalizeValue.lead_tier(payload.lead_tier));

  addCF(customFields, GHL_FIELD_IDS.company_name_quiz, payload.company);
  addCF(customFields, GHL_FIELD_IDS.websitequiz, payload.website);

  addCF(customFields, GHL_FIELD_IDS.utm_source, payload.utm_source);
  addCF(customFields, GHL_FIELD_IDS.utm_medium, payload.utm_medium);
  addCF(customFields, GHL_FIELD_IDS.utm_campaign, payload.utm_campaign);
  addCF(customFields, GHL_FIELD_IDS.utm_content, payload.utm_content);
  addCF(customFields, GHL_FIELD_IDS.utm_term, payload.utm_term);
  addCF(customFields, GHL_FIELD_IDS.utm_id, payload.utm_id);
  addCF(
    customFields,
    resolvedTrackingIds.lead_id ?? GHL_FIELD_IDS.track_lead_id,
    payload.lead_id,
  );
  addCF(
    customFields,
    resolvedTrackingIds.event_id ?? GHL_FIELD_IDS.track_event_id,
    payload.event_id,
  );
  addCF(
    customFields,
    resolvedTrackingIds.gclid_id ?? GHL_FIELD_IDS.track_gclid_id,
    payload.gclid,
  );
  addCF(customFields, GHL_FIELD_IDS.gbraid, payload.gbraid);
  addCF(customFields, GHL_FIELD_IDS.wbraid, payload.wbraid);
  addCF(customFields, GHL_FIELD_IDS.fbclid, payload.fbclid);
  addCF(customFields, GHL_FIELD_IDS.fbp, payload.fb_browser_id);
  addCF(customFields, GHL_FIELD_IDS.fbc, payload.fb_click_id);
  addCF(customFields, GHL_FIELD_IDS.landing_page, payload.landing_page);
  addCF(customFields, GHL_FIELD_IDS.referrer, payload.referrer);
  addCF(customFields, GHL_FIELD_IDS.ip_address, ip_address);
  addCF(customFields, GHL_FIELD_IDS.user_agent, user_agent);

  if (debug) {
    const trackedDebug = {
      payload_has_lead_id: isNonEmpty(payload.lead_id),
      payload_has_event_id: isNonEmpty(payload.event_id),
      payload_has_gclid: isNonEmpty(payload.gclid),
      mapped_field_ids: {
        lead_id: GHL_FIELD_IDS.track_lead_id,
        event_id: GHL_FIELD_IDS.track_event_id,
        gclid_id: GHL_FIELD_IDS.track_gclid_id,
      },
      mapped_values_preview: {
        lead_id: isNonEmpty(payload.lead_id) ? payload.lead_id.slice(0, 24) : null,
        event_id: isNonEmpty(payload.event_id) ? payload.event_id.slice(0, 24) : null,
        gclid_id: isNonEmpty(payload.gclid) ? payload.gclid.slice(0, 24) : null,
      },
    };
    console.log("[submit-quiz] tracking ids debug:", JSON.stringify(trackedDebug));
  }

  // ── Standard fields ─────────────────────────────────────────────────────
  // gclid isn't a custom field, but we can carry it in the contact `source`
  // string so it's visible on the record. We also write a human-friendly
  // source name so it's easy to spot in GHL contact list.
  const sourceParts = ["Strategy Session Quiz"];
  if (isNonEmpty(payload.utm_source)) sourceParts.push(`utm_source=${payload.utm_source.trim()}`);
  if (isNonEmpty(payload.gclid)) sourceParts.push(`gclid=${payload.gclid.trim()}`);
  const source = sourceParts.join(" | ");

  const tier = normalizeValue.lead_tier(payload.lead_tier) ?? payload.lead_tier;
  const tags: string[] = [`quiz:${tier}`, "strategy-session-quiz"];

  const ghlBody: Record<string, unknown> = {
    locationId: env.GHL_LOCATION_ID,
    email: payload.email.trim(),
    phone: payload.phone.trim(),
    firstName,
    lastName,
    name: payload.full_name.trim(),
    source,
    tags,
    customFields,
  };
  if (isNonEmpty(payload.company)) ghlBody.companyName = payload.company.trim();
  if (isNonEmpty(payload.website)) ghlBody.website = payload.website.trim();

  if (debug) {
    const preview = { ...ghlBody, locationId: "[redacted]" };
    console.log("[submit-quiz] → GHL upsert body:", JSON.stringify(preview));
  }

  try {
    const ghlRes = await fetch(GHL_UPSERT_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GHL_API_KEY}`,
        Version: GHL_API_VERSION,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(ghlBody),
    });

    if (!ghlRes.ok) {
      const errText = await ghlRes.text().catch(() => "");
      console.error(
        "[submit-quiz] GHL upsert failed. status=",
        ghlRes.status,
        "body=",
        errText.slice(0, 800),
      );
      return json({ success: false, error: "Submission failed" }, 502);
    }

    if (debug) {
      const preview = await ghlRes.clone().text().catch(() => "");
      console.log(
        "[submit-quiz] ← GHL status:",
        ghlRes.status,
        "body:",
        preview.slice(0, 500),
      );
    }

    return json({ success: true });
  } catch (err) {
    console.error("[submit-quiz] Unexpected error:", err);
    return json({ success: false, error: "Unexpected error" }, 500);
  }
};

export const GET: APIRoute = () =>
  json({ success: false, error: "Method not allowed" }, 405);
