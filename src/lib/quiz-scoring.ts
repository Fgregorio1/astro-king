/**
 * Quiz scoring + lead tier computation.
 * Language-agnostic: accepts PT or ES labels for single-select steps,
 * and IDs for multi-select steps.
 */

export type LeadTier = "hot" | "qualified" | "warm" | "cold" | "not_ready";

export interface ScoreInputs {
  businessType?: string;
  revenue?: string;
  teamSize?: string;
  investmentReadiness?: string;
  commitmentConfirmed?: string;
  callTimeline?: string;
  timeInBusiness?: string;
}

/**
 * Match PT or ES label by a stable snippet. Case insensitive.
 * Empty/unknown → returns 0.
 */
function match(value: string | undefined, rules: Array<[RegExp, number]>): number {
  if (!value) return 0;
  const v = value.trim();
  for (const [pattern, points] of rules) {
    if (pattern.test(v)) return points;
  }
  return 0;
}

const RE = {
  // business_type: any specific trade = 10, "outro/otro" = 5
  bizOther: /(outro|otro)\s+servi/i,
  bizAny: /(hvac|plomer|hidr|jardin|limpeza|limpieza|constru|outro|otro)/i,

  // revenue
  rev150Plus: /(mais\s+de|m[aá]s\s+de)\s*\$?\s*150/i,
  rev50to150: /\$?\s*50[.,]?000\s*[–-]\s*\$?\s*150/i,
  rev15to50: /\$?\s*15[.,]?000\s*[–-]\s*\$?\s*50/i,
  rev8to15: /\$?\s*8[.,]?000\s*[–-]\s*\$?\s*15/i,
  revLess8: /(menos\s+de)\s*\$?\s*8/i,

  // team
  team10Plus: /10\+/,
  team5to10: /5\s*[–-]\s*10/,
  team2to4: /2\s*[–-]\s*4/,
  teamSolo: /(s[oó]\s+eu|solo\s+yo)/i,

  // investment readiness
  invReady: /^(sim|s[ií])\b/i,
  invOpen: /(precisaria|necesitar[ií]a|entender)/i,
  invNotNow: /(agora\s+n[aã]o|ahora\s+no|sin\s+presupuesto|orçamento)/i,

  // commitment (pinky promise)
  commitYes: /^(sim|s[ií])\b/i,
  commitNo: /^(n[aã]o|no)\b/i,

  // call timeline (future-proofing; quiz doesn't ask this yet)
  timelineNow: /(agora\s+mesmo|ahora\s+mismo|right\s+now|imediat)/i,
  timeline30: /(pr[oó]ximos?\s+30|next\s+30)/i,
  timeline60to90: /(60\s*(a|to)\s*90|entre\s+60)/i,
  timelineExploring: /(explorando|exploring)/i,

  // time in business
  tibOver3: /(3\s+anos?\s+ou\s+mais|3\s+a[ñn]os\s+o\s+m[aá]s)/i,
  tib1to3: /1\s*[–-]\s*3/,
  tib6to12: /(6\s+meses\s*[–-]\s*1)/i,
  tibUnder6: /(menos\s+de\s+6)/i,
};

export function scoreQuiz(inputs: ScoreInputs): number {
  let score = 0;

  // business_type: specific trade = 10, other = 5, unknown = 0
  if (inputs.businessType) {
    if (RE.bizOther.test(inputs.businessType)) score += 5;
    else if (RE.bizAny.test(inputs.businessType)) score += 10;
  }

  score += match(inputs.revenue, [
    [RE.rev150Plus, 20],
    [RE.rev50to150, 15],
    [RE.rev15to50, 10],
    [RE.rev8to15, 5],
    [RE.revLess8, 0],
  ]);

  score += match(inputs.teamSize, [
    [RE.team10Plus, 15],
    [RE.team5to10, 12],
    [RE.team2to4, 8],
    [RE.teamSolo, 5],
  ]);

  // investment readiness — test order matters (notNow before ready)
  score += match(inputs.investmentReadiness, [
    [RE.invNotNow, 0],
    [RE.invOpen, 10],
    [RE.invReady, 20],
  ]);

  // commitment confirmed (pinky promise: Sim / Sí = 15, Não / No = 0)
  score += match(inputs.commitmentConfirmed, [
    [RE.commitNo, 0],
    [RE.commitYes, 15],
  ]);

  score += match(inputs.callTimeline, [
    [RE.timelineNow, 10],
    [RE.timeline30, 7],
    [RE.timeline60to90, 3],
    [RE.timelineExploring, 0],
  ]);

  score += match(inputs.timeInBusiness, [
    [RE.tibOver3, 10],
    [RE.tib1to3, 7],
    [RE.tib6to12, 4],
    [RE.tibUnder6, 0],
  ]);

  return score;
}

export function tierFromScore(score: number): LeadTier {
  if (score >= 80) return "hot";
  if (score >= 60) return "qualified";
  if (score >= 40) return "warm";
  if (score >= 20) return "cold";
  return "not_ready";
}
