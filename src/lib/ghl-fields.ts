/**
 * GHL custom field ID map, pulled from
 *   GET /locations/{locationId}/customFields?model=contact
 * on 2026-04-21 for location j1wNIuBJfRKDasWsa4x2.
 *
 * Re-pull and update these IDs if you rename, delete, or recreate any
 * custom field in GHL. Field IDs are stable across renames so the only
 * time you need to edit this is when a field is deleted + recreated.
 */
export const GHL_FIELD_IDS = {
  // Quiz answers
  business_type: "4l0kbIXOsmYK5BKqIkUm",
  revenue_range: "viU2K6YPmyF9cwgE8Eg2",
  team_size: "r10CSV548yvEL9AOnqck",
  ways_to_get_clients: "X2DdC6KLJBOfg0K7BtfZ",
  biggest_challenge: "2Fjp6PC5BonpE160SyYx",
  investment_readiness: "KnSzpEZAYA6pIdSPCZnf",
  time_in_business: "NN0cqv3INhAodZYidqSe",
  call_timeline: "aDL1RM4ECX2JrHtBWqzJ",
  commitment_confirmed: "w1ORHTpqtdAZbzqNZAfa",

  // Computed
  quiz_score: "IYIVikkG65LtAzKLUPQD",
  lead_tier: "VtDLj5ocQGzIfdXuqRa3",

  // Contact details captured in quiz
  company_name_quiz: "6Bo9mS2s7L7hCbJLZHdn",
  websitequiz: "M3OrEgOy3hEvvGNEJXvm",

  // Tracking (client-captured)
  utm_source: "v2fo1VuvI7oh3Cf4wBsS",
  utm_medium: "OL6zVMLdNasda2CPhKOS",
  utm_campaign: "OaFZC7t0au0iBTjOJ9O7",
  utm_content: "Ha5bwWCgKN03m4IQkKuQ",
  utm_term: "hOdXFx15eGog13638CY2",
  utm_id: "KWKU7NEZVA4kpRAFkY9t",
  gbraid: "NhTcjlB3eexPPYEewrpw",
  wbraid: "zxpOrwJmPq4498nWEu1A",
  fbclid: "rZLW0ITAmGJMJD4AznmW",
  fbp: "RhAaEmI50bKqhqbwItxA",
  fbc: "IvSJkM9OGKK8HEUGTWNZ",
  landing_page: "NQXXyd0OSerzT5Ou6hej",
  referrer: "3bEd108qvZ8yK0Qpz02b",

  // Server-side injected
  ip_address: "LYxBwqrnHRbGF6lJmZxY",
  user_agent: "bWEVFkWtaUYhb1lrbA4P",
} as const;

/**
 * CHECKBOX/RADIO fields in GHL — when you send string values, they must match
 * the picklistOptions exactly (case + accents + dashes). These are the fields
 * that have constrained option lists:
 *
 *  - business_type   RADIO
 *  - revenue_range   RADIO
 *  - team_size       RADIO
 *  - time_in_business RADIO
 *  - investment_readiness RADIO
 *  - call_timeline   RADIO
 *  - commitment_confirmed RADIO
 *  - lead_tier       RADIO  (values: hot | qualified | warm | cold | not_ready)
 *  - ways_to_get_clients CHECKBOX (array of strings)
 *  - biggest_challenge   CHECKBOX (array of strings)
 */
