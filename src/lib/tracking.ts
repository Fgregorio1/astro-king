/**
 * Attribution tracking utility.
 * Captures UTM, ad click IDs (gclid/fbclid/etc.), fb cookies,
 * landing page & referrer on page load, then persists to
 * sessionStorage for the current session and localStorage for first-touch.
 *
 * Safe to import from any environment — all window/document access is guarded.
 */

export interface TrackingData {
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

const SESSION_KEY = "attribution";
const FIRST_TOUCH_KEY = "attribution_first_touch";

const UTM_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
] as const;

const CLICK_IDS = ["gclid", "gbraid", "wbraid", "fbclid"] as const;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function readCookie(name: string): string | undefined {
  if (!isBrowser()) return undefined;
  try {
    const match = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${name}=`));
    if (!match) return undefined;
    return decodeURIComponent(match.substring(name.length + 1));
  } catch {
    return undefined;
  }
}

function pickNonEmpty(obj: Record<string, string | undefined>): Partial<TrackingData> {
  const out: Partial<TrackingData> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v && v.length > 0) {
      (out as Record<string, string>)[k] = v;
    }
  }
  return out;
}

/**
 * Parse current page URL + cookies + browser signals into a TrackingData object.
 */
function collectCurrent(): Partial<TrackingData> {
  if (!isBrowser()) return {};

  const params = new URLSearchParams(window.location.search);

  const fromUrl: Record<string, string | undefined> = {};
  for (const key of UTM_PARAMS) {
    const v = params.get(key);
    if (v) fromUrl[key] = v;
  }
  for (const key of CLICK_IDS) {
    const v = params.get(key);
    if (v) fromUrl[key] = v;
  }

  const fbp = readCookie("_fbp");
  const fbc = readCookie("_fbc");

  return pickNonEmpty({
    ...fromUrl,
    fb_browser_id: fbp,
    fb_click_id: fbc,
    landing_page: window.location.href,
    referrer: document.referrer || undefined,
  });
}

/**
 * Initialize tracking. Should be called once per page load from a client <script>
 * early in the document lifecycle.
 */
export function initTracking(): void {
  if (!isBrowser()) return;
  try {
    const current = collectCurrent();

    // Session attribution: overwrite with latest signals from this page load
    // (so that mid-session navigations still keep the freshest UTMs).
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(current));
    } catch {
      /* ignore quota/private-mode errors */
    }

    // First-touch: only write if not set OR a new click id appeared in URL
    try {
      const raw = localStorage.getItem(FIRST_TOUCH_KEY);
      const hasNewClickId =
        !!current.gclid || !!current.gbraid || !!current.wbraid || !!current.fbclid;

      if (!raw || hasNewClickId) {
        const firstTouch: Partial<TrackingData> = pickNonEmpty({
          utm_source: current.utm_source,
          utm_medium: current.utm_medium,
          utm_campaign: current.utm_campaign,
          utm_content: current.utm_content,
          utm_term: current.utm_term,
          utm_id: current.utm_id,
          gclid: current.gclid,
          gbraid: current.gbraid,
          wbraid: current.wbraid,
          fbclid: current.fbclid,
          landing_page: current.landing_page,
          referrer: current.referrer,
        });
        if (Object.keys(firstTouch).length > 0) {
          localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(firstTouch));
        }
      }
    } catch {
      /* ignore */
    }
  } catch {
    /* never throw from tracking init */
  }
}

/**
 * Read the current-session attribution.
 * Falls back to first-touch localStorage if session is empty.
 * Never throws.
 */
export function getTracking(): Partial<TrackingData> {
  if (!isBrowser()) return {};
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<TrackingData>;
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {
    /* ignore */
  }

  try {
    const raw = localStorage.getItem(FIRST_TOUCH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<TrackingData>;
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {
    /* ignore */
  }

  return {};
}
