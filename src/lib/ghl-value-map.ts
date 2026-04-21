/**
 * Normalizes quiz-side values (PT labels, ES labels, or internal IDs) to
 * the canonical picklistOptions configured on GHL custom fields.
 *
 * If a value can't be mapped (typo, new option, etc.) we return `null` so
 * the caller can skip that field instead of having GHL reject the whole
 * submission for an invalid enum value.
 */

type Rule = { match: Array<RegExp | string>; out: string };

function norm(v: string): string {
  return v.trim().toLowerCase();
}

function apply(value: string | undefined | null, rules: Rule[]): string | null {
  if (!value) return null;
  const v = norm(value);
  for (const r of rules) {
    for (const m of r.match) {
      if (typeof m === "string") {
        if (norm(m) === v) return r.out;
      } else if (m.test(value)) {
        return r.out;
      }
    }
  }
  return null;
}

function applyEach(values: string[], rules: Rule[]): string[] {
  const out: string[] = [];
  for (const v of values) {
    const m = apply(v, rules);
    if (m && !out.includes(m)) out.push(m);
  }
  return out;
}

// ─── business_type ────────────────────────────────────────────────────────
const BIZ_RULES: Rule[] = [
  { match: [/hvac|encan|plomer|hidr/i], out: "HVAC / Encanamento / Elétrica" },
  { match: [/jardin|paisaj|lawn/i], out: "Jardinagem / Manutenção de Jardins" },
  { match: [/limp|higien|clean/i], out: "Limpeza / Higienização" },
  { match: [/constru|reform|remodel|telhad|roof/i], out: "Construção / Reforma / Telhados" },
  { match: [/outro|otro|other/i], out: "Outro Serviço Residencial" },
];

// ─── revenue_range (quiz matches GHL exactly, normalize anyway) ───────────
const REV_RULES: Rule[] = [
  { match: [/menos\s+de\s*\$?\s*8/i], out: "Menos de $8.000" },
  { match: [/\$?\s*8[.,]?000\s*[–-]\s*\$?\s*15/i], out: "$8.000 – $15.000" },
  { match: [/\$?\s*15[.,]?000\s*[–-]\s*\$?\s*50/i], out: "$15.000 – $50.000" },
  { match: [/\$?\s*50[.,]?000\s*[–-]\s*\$?\s*150/i], out: "$50.000 – $150.000" },
  { match: [/(mais|m[aá]s)\s+de\s*\$?\s*150/i], out: "Mais de $150.000" },
];

// ─── team_size ────────────────────────────────────────────────────────────
const TEAM_RULES: Rule[] = [
  { match: [/s[oó]\s+eu|solo\s+yo/i], out: "Só eu" },
  { match: [/2\s*[–-]\s*4/], out: "2 – 4 pessoas" },
  { match: [/5\s*[–-]\s*10/], out: "5 – 10 pessoas" },
  { match: [/10\+/], out: "10+ pessoas" },
];

// ─── time_in_business ─────────────────────────────────────────────────────
const TIB_RULES: Rule[] = [
  { match: [/menos\s+de\s+6/i], out: "Menos de 6 meses" },
  { match: [/6\s+meses\s*[–-]\s*1/i], out: "6 meses – 1 ano" },
  { match: [/^1\s*[–-]\s*3|^\s*1\s*[–-]\s*3/], out: "1 – 3 anos" },
  { match: [/3\s+anos?\s+ou\s+mais|3\s+a[ñn]os\s+o\s+m[aá]s/i], out: "3 anos ou mais" },
];

// ─── investment_readiness ─────────────────────────────────────────────────
const INV_RULES: Rule[] = [
  { match: [/^(sim|s[ií])\b.*pronto|listo\s+para\s+invertir/i], out: "Sim — estou pronto para investir se o plano fizer sentido" },
  { match: [/precisaria|necesitar[ií]a/i], out: "Precisaria entender o retorno primeiro, mas estou aberto" },
  { match: [/agora\s+n[aã]o|ahora\s+no|sin\s+presupuesto|or[çc]amento/i], out: "Agora não, não tenho orçamento para isso" },
];

// ─── commitment_confirmed (pinky promise: Sim/Sí → yes, Não/No → no) ──────
const COMMIT_RULES: Rule[] = [
  { match: [/^(sim|s[ií])$/i, /^(sim|s[ií])\b/i, /100%/], out: "100% — eu apareço e estou pronto para crescer" },
  { match: [/^(n[aã]o|no)$/i, /ainda\s+n[aã]o|todav[ií]a\s+no/i], out: "Ainda não tenho certeza" },
];

// ─── call_timeline (future-proof; quiz doesn't ask this yet) ──────────────
const CALL_RULES: Rule[] = [
  { match: [/agora\s+mesmo|ahora\s+mismo|right\s+now/i], out: "Agora mesmo — estou pronto para começar" },
  { match: [/pr[oó]ximos?\s+30|next\s+30/i], out: "Nos próximos 30 dias" },
  { match: [/60\s*(a|to)\s*90|entre\s+60/i], out: "Em 60 a 90 dias" },
  { match: [/explorando|exploring/i], out: "Ainda estou explorando as opções" },
];

// ─── lead_tier (values: hot | qualified | warm | cold | not_ready) ────────
const TIER_RULES: Rule[] = [
  { match: [/^hot$/i], out: "hot" },
  { match: [/^qualified$/i], out: "qualified" },
  { match: [/^warm$/i], out: "warm" },
  { match: [/^cold$/i], out: "cold" },
  { match: [/^not_?ready$/i], out: "not_ready" },
];

// ─── ways_to_get_clients (CHECKBOX) — quiz uses IDs; also accept labels ───
const WAYS_RULES: Rule[] = [
  { match: ["contratista", /contratista/i], out: "Contratista" },
  { match: ["indicacao", /indica[cç][aã]o|recomend/i], out: "Indicação" },
  { match: ["facebook", /facebook/i], out: "Facebook ads" },
  { match: ["google", /google\s*ads/i], out: "Google Ads" },
  { match: ["nextdoor", /nextdoor/i], out: "Nextdoor Ads" },
  { match: ["door_hangers", /door\s*hangers?|panfleto/i], out: "Door Hangers" },
  { match: ["seo", /seo/i], out: "SEO" },
  { match: ["nenhum", /nenhum|ninguno|none/i], out: "Nenhum" },
];

// ─── biggest_challenge (CHECKBOX) — quiz uses IDs; also accept labels ─────
const CHALLENGE_RULES: Rule[] = [
  { match: ["clientes", /clientes\s+suficientes|suficientes\s+clientes/i], out: "Não tenho clientes suficientes de forma consistente" },
  { match: ["lucro", /lucrando|ganando|trabajo\s+mucho/i], out: "Trabalho muito mas não estou lucrando o suficiente" },
  { match: ["funcionarios", /funcion[aá]rios?|empleados|retener/i], out: "Não consigo contratar ou manter bons funcionários" },
  { match: ["marketing", /divulgar|promocion|marketing/i], out: "Não sei como me divulgar ou fazer marketing" },
  { match: ["sozinho", /sozinho|solo\s+y\s+me\s+siento|estancado|travado/i], out: "Estou fazendo tudo sozinho e me sinto travado" },
];

// ─── Public API ───────────────────────────────────────────────────────────
export const normalizeValue = {
  business_type: (v?: string) => apply(v, BIZ_RULES),
  revenue_range: (v?: string) => apply(v, REV_RULES),
  team_size: (v?: string) => apply(v, TEAM_RULES),
  time_in_business: (v?: string) => apply(v, TIB_RULES),
  investment_readiness: (v?: string) => apply(v, INV_RULES),
  commitment_confirmed: (v?: string) => apply(v, COMMIT_RULES),
  call_timeline: (v?: string) => apply(v, CALL_RULES),
  lead_tier: (v?: string) => apply(v, TIER_RULES),
  ways_to_get_clients: (list: string[]) => applyEach(list, WAYS_RULES),
  biggest_challenge: (list: string[]) => applyEach(list, CHALLENGE_RULES),
};
