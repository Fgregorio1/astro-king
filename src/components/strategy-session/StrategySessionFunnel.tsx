import { useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, Check, HardHat, Users, Home, FileText, Search, Ban } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { KingKongLogoLink } from "./KingKongLogoLink";

/** One horizontal system for nav, progress, and every step */
const SHELL_X = "mx-auto w-full max-w-3xl px-4 sm:px-5";

/** Space below the nav bar before the progress strip */
const GAP_NAV_TO_PROGRESS = "mt-7 sm:mt-9";

/** Vertical padding inside the main step area (same all steps) */
const STEP_MAIN_PY = "pt-8 pb-12 sm:pt-10 sm:pb-14";

/** Consistent stack gap inside steps */
const STEP_STACK_GAP = "gap-6 sm:gap-7";

const DOT_COUNT = 12;
const DOT = "h-[14px] w-[14px] shrink-0 rounded-full sm:h-[16px] sm:w-[16px]";
const LINE = "mx-[2px] h-[2px] min-w-[4px] flex-1 bg-[#D3D3D3] sm:mx-1";

function ProgressStrip({ filled }: { filled: number }) {
  const n = Math.max(0, Math.min(filled, DOT_COUNT));
  return (
    <div
      className="mx-auto flex w-full max-w-[min(100%,21rem)] items-center sm:max-w-[23rem]"
      data-filled={n}
      role="presentation"
    >
      {Array.from({ length: DOT_COUNT }, (_, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center",
            i < DOT_COUNT - 1 ? "min-w-0 flex-1" : "",
          )}
        >
          <span
            className={cn(
              DOT,
              i < n ? "bg-[#FF5E00]" : "bg-[#D3D3D3]",
            )}
            aria-hidden={true}
          />
          {i < DOT_COUNT - 1 ? (
            <span className={LINE} aria-hidden={true} />
          ) : null}
        </div>
      ))}
    </div>
  );
}

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GoogleAdsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.87 18.99L10.36 6.01c.77-1.33 2.45-1.79 3.78-1.02 1.33.77 1.79 2.45 1.02 3.78L7.67 21.75c-.77 1.33-2.45 1.79-3.78 1.02-1.33-.77-1.79-2.45-1.02-3.78z" fill="#FABB05"/>
    <path d="M21.13 18.99L13.64 6.01c-.77-1.33-2.45-1.79-3.78-1.02-1.33.77-1.79 2.45-1.02 3.78l7.49 12.98c.77 1.33 2.45 1.79 3.78 1.02 1.33-.77 1.79-2.45 1.02-3.78z" fill="#4285F4"/>
    <path d="M6.5 22.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" fill="#34A853"/>
  </svg>
);

const NextdoorIcon = ({ className }: { className?: string }) => (
  <img src="/assets/images/nextdoor.png" alt="Nextdoor" className={cn("object-cover rounded-full", className)} />
);

const waysToGetClients = [
  { id: "contratista", pt: "Contratista", es: "Contratista", icon: <HardHat className="h-9 w-9 text-amber-500" strokeWidth={1.5} /> },
  { id: "indicacao", pt: "Indicação", es: "Recomendación", icon: <Users className="h-9 w-9 text-indigo-500" strokeWidth={1.5} /> },
  { id: "facebook", pt: "Facebook ads", es: "Facebook ads", icon: <FacebookIcon className="h-9 w-9" /> },
  { id: "google", pt: "Google Ads", es: "Google Ads", icon: <GoogleAdsIcon className="h-9 w-9" /> },
  { id: "nextdoor", pt: "Nextdoor Ads", es: "Nextdoor Ads", icon: <NextdoorIcon className="h-9 w-9" /> },
  { id: "door_hangers", pt: "Door Hangers", es: "Door Hangers", icon: <FileText className="h-9 w-9 text-orange-400" strokeWidth={1.5} /> },
  { id: "seo", pt: "SEO", es: "SEO", icon: <GoogleIcon className="h-9 w-9" /> },
  { id: "nenhum", pt: "Nenhum", es: "Ninguno", icon: <Ban className="h-9 w-9 text-red-500" strokeWidth={1.5} /> },
];

export default function StrategySessionFunnel({ lang = "pt" }: { lang?: "pt" | "es" }) {
  const [step, setStep] = useState(0);
  const [selectedWays, setSelectedWays] = useState<string[]>([]);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const nameId = useId();

  const emailInputRef = useRef<HTMLInputElement>(null);
  const emailId = useId();
  const [emailError, setEmailError] = useState("");

  const websiteInputRef = useRef<HTMLInputElement>(null);
  const websiteId = useId();

  const isEs = lang === "es";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const { pathname, search, hash } = window.location;
    if (hash) {
      window.history.replaceState(null, "", pathname + search);
    }
  }, []);

  useEffect(() => {
    if (step === 1) {
      nameInputRef.current?.focus();
    } else if (step === 2) {
      emailInputRef.current?.focus();
    } else if (step === 7) {
      websiteInputRef.current?.focus();
    }
  }, [step]);

  const filled = step;

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  function onNameSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = nameInputRef.current?.value.trim();
    if (!name) return;
    try {
      sessionStorage.setItem("quiz_firstName", name);
    } catch {
      /* ignore */
    }
    setStep(2);
  }

  function onEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailError("");
    const email = emailInputRef.current?.value.trim() || "";
    
    const emailSchema = z.string().email();

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setEmailError(isEs ? "Por favor, introduce un correo electrónico válido." : "Por favor, insira um email válido.");
      return;
    }

    try {
      sessionStorage.setItem("quiz_email", email);
    } catch {
      /* ignore */
    }
    // Advance to next step (step 3) when ready
    setStep(3);
  }

  function handleBusinessTypeSelect(type: string) {
    try {
      sessionStorage.setItem("quiz_businessType", type);
    } catch {
      /* ignore */
    }
    setStep(4);
  }

  function handleTimeInBusinessSelect(time: string) {
    try {
      sessionStorage.setItem("quiz_timeInBusiness", time);
    } catch {
      /* ignore */
    }
    setStep(5);
  }

  function toggleWay(id: string) {
    if (id === "nenhum") {
      if (selectedWays.includes("nenhum")) {
        setSelectedWays([]);
      } else {
        setSelectedWays(["nenhum"]);
      }
      return;
    }

    let newWays = selectedWays.filter(w => w !== "nenhum");

    if (newWays.includes(id)) {
      newWays = newWays.filter(w => w !== id);
    } else {
      newWays.push(id);
    }
    setSelectedWays(newWays);
  }

  function onWaysSubmit() {
    if (selectedWays.length === 0) return;
    try {
      sessionStorage.setItem("quiz_waysToGetClients", selectedWays.join(", "));
    } catch {
      /* ignore */
    }
    setStep(6);
  }

  function handleTeamSizeSelect(size: string) {
    try {
      sessionStorage.setItem("quiz_teamSize", size);
    } catch {
      /* ignore */
    }
    setStep(7);
  }

  function onWebsiteSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const website = websiteInputRef.current?.value.trim();
    if (!website) return;
    try {
      sessionStorage.setItem("quiz_website", website);
    } catch {
      /* ignore */
    }
    setStep(8);
  }

  function handleRevenueSelect(revenue: string) {
    try {
      sessionStorage.setItem("quiz_revenue", revenue);
    } catch {
      /* ignore */
    }
    setStep(9);
  }

  function toggleChallenge(id: string) {
    setSelectedChallenges(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }

  function onChallengesSubmit() {
    if (selectedChallenges.length === 0) return;
    try {
      sessionStorage.setItem("quiz_biggestChallenges", selectedChallenges.join(", "));
    } catch {
      /* ignore */
    }
    setStep(10);
  }

  function handleInvestmentReadinessSelect(readiness: string) {
    try {
      sessionStorage.setItem("quiz_investmentReadiness", readiness);
    } catch {
      /* ignore */
    }
    setStep(11);
  }

  function handlePinkyPromiseSelect(promise: string) {
    try {
      sessionStorage.setItem("quiz_pinkyPromise", promise);
    } catch {
      /* ignore */
    }
    setStep(12);
  }

  const businessTypes = [
    {
      icon: "🔧",
      pt: "HVAC / Hidráulica / Elétrica",
      es: "HVAC / Plomería / Electricidad"
    },
    {
      icon: "🌿",
      pt: "Jardinagem / Paisagismo",
      es: "Jardinería / Paisajismo"
    },
    {
      icon: "✨",
      pt: "Limpeza / Higienização",
      es: "Limpieza / Higienización"
    },
    {
      icon: "🏗️",
      pt: "Construção / Reformas",
      es: "Construcción / Remodelación"
    },
    {
      icon: "🏡",
      pt: "Outro Serviço Residencial",
      es: "Otro Servicio Residencial"
    }
  ];

  const timeInBusiness = [
    {
      icon: "⏳",
      pt: "Menos de 6 meses",
      es: "Menos de 6 meses"
    },
    {
      icon: "🗓️",
      pt: "6 meses – 1 ano",
      es: "6 meses – 1 año"
    },
    {
      icon: "🚀",
      pt: "1 – 3 anos",
      es: "1 – 3 años"
    },
    {
      icon: "🏆",
      pt: "3 anos ou mais",
      es: "3 años o más"
    }
  ];

  const teamSizeOptions = [
    {
      icon: "👤",
      pt: "Só eu",
      es: "Solo yo"
    },
    {
      icon: "👥",
      pt: "2 – 4 pessoas",
      es: "2 – 4 personas"
    },
    {
      icon: "🏢",
      pt: "5 – 10 pessoas",
      es: "5 – 10 personas"
    },
    {
      icon: "🚀",
      pt: "10+ pessoas",
      es: "10+ personas"
    }
  ];

  const revenueOptions = [
    {
      icon: "🪙",
      pt: "Menos de $8.000",
      es: "Menos de $8.000"
    },
    {
      icon: "💵",
      pt: "$8.000 – $15.000",
      es: "$8.000 – $15.000"
    },
    {
      icon: "💸",
      pt: "$15.000 – $50.000",
      es: "$15.000 – $50.000"
    },
    {
      icon: "💰",
      pt: "$50.000 – $150.000",
      es: "$50.000 – $150.000"
    },
    {
      icon: "🏦",
      pt: "Mais de $150.000",
      es: "Más de $150.000"
    }
  ];

  const biggestChallenges = [
    {
      id: "clientes",
      pt: "Não tenho clientes suficientes de forma consistente",
      es: "No tengo suficientes clientes de forma consistente"
    },
    {
      id: "lucro",
      pt: "Trabalho muito mas não estou lucrando o suficiente",
      es: "Trabajo mucho pero no estoy ganando lo suficiente"
    },
    {
      id: "funcionarios",
      pt: "Não consigo contratar ou manter bons funcionários",
      es: "No puedo contratar o retener buenos empleados"
    },
    {
      id: "marketing",
      pt: "Não sei como me divulgar ou fazer marketing",
      es: "No sé cómo promocionarme o hacer marketing"
    },
    {
      id: "sozinho",
      pt: "Estou fazendo tudo sozinho e me sinto travado",
      es: "Estoy haciendo todo solo y me siento estancado"
    }
  ];

  const investmentReadinessOptions = [
    {
      icon: "✅",
      pt: "Sim — estou pronto para investir se o plano fizer sentido",
      es: "Sí — estoy listo para invertir si el plan tiene sentido"
    },
    {
      icon: "🤔",
      pt: "Precisaria entender o retorno primeiro, mas estou aberto",
      es: "Necesitaría entender el retorno primero, pero estoy abierto"
    },
    {
      icon: "❌",
      pt: "Agora não, não tenho orçamento para isso",
      es: "Ahora no, no tengo presupuesto para eso"
    }
  ];

  const pinkyPromiseOptions = [
    {
      icon: "🙅‍♂️",
      pt: "Não",
      es: "No"
    },
    {
      icon: "👌",
      pt: "Sim",
      es: "Sí"
    }
  ];

  const firstName = typeof window !== "undefined" ? sessionStorage.getItem("quiz_firstName") || "" : "";

  return (
    <div className="relative flex min-h-screen flex-col bg-white font-sans text-black">
      {/* Nav: logo only; shadow ends here — dots are NOT inside nav */}
      <nav
        className={cn(
          "relative shrink-0 bg-white",
          "border-b border-gray-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]",
        )}
        aria-label={isEs ? "Principal" : "Principal"}
      >
        {step > 0 ? (
          <button
            type="button"
            className={cn(
              "absolute left-4 sm:left-6 top-1/2 -translate-y-1/2",
              "z-[60] flex items-center justify-center bg-transparent text-[#888888]",
              "hover:text-zinc-700 transition-colors",
            )}
            aria-label={isEs ? "Volver" : "Voltar"}
            onClick={goBack}
          >
            <ChevronLeft className="h-8 w-8 md:h-10 md:w-10" strokeWidth={2.5} />
          </button>
        ) : null}
        <div
          className={cn(
            SHELL_X,
            "flex justify-center py-4 sm:py-5",
          )}
        >
          <KingKongLogoLink className="w-[8rem] md:w-[10rem]" />
        </div>
      </nav>

      {/* Progress: outside nav, same horizontal shell + gap from nav */}
      <div className={cn(SHELL_X, GAP_NAV_TO_PROGRESS, "shrink-0")}>
        <div className="flex w-full justify-center">
          <ProgressStrip filled={filled} />
        </div>
      </div>

      {/* All steps share this main region: identical margins & vertical rhythm */}
      <main
        className={cn(
          SHELL_X,
          "flex min-h-0 flex-1 flex-col items-center",
          STEP_MAIN_PY,
        )}
      >
        {step === 0 ? (
          <div
            className={cn(
              "flex w-full max-w-2xl flex-col items-center text-center",
              STEP_STACK_GAP,
            )}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl">👋</span>
              <p className="text-xs font-medium uppercase tracking-wide text-[#888888] sm:text-sm">
                {isEs ? "SIRVIENDO A CLIENTES EN: 🇪🇸" : "ATENDENDO CLIENTES EM: 🇧🇷"}
              </p>
            </div>

            <h1 className="font-heading text-[clamp(2.25rem,5.5vw,4rem)] font-black uppercase leading-[0.95] tracking-tight text-black">
              {isEs 
                ? "SESIÓN DE MAPA DE CRECIMIENTO Y ESCALA DE 30 MINUTOS GRATIS"
                : "SESSÃO DE MAPA DE CRECIMENTO E ESCALA DE 30 MINUTOS GRATUITA"}
            </h1>

            <p className="max-w-[40rem] text-lg leading-relaxed text-[#888888] sm:text-xl">
              {isEs
                ? "Reclama tu llamada 100% gratuita y sin compromiso de 30 minutos para el mapa de crecimiento y escala (valor de US$ 1.000). Esto es estrictamente para personas que tienen hambre de crecimiento. Si ese eres tú, ¡vamos a llevar tu negocio a la luna! 🚀 🌕"
                : "Garanta sua chamada 100% gratuita e sem compromisso de 30 minutos para o mapa de crescimento e escala (valor de US$ 1.000). Isso é estritamente para quem tem fome de crescimento. Se é o seu caso, vamos levar o seu negócio à lua! 🚀 🌕"}
            </p>

            <Button
              type="button"
              className={cn(
                "group/funnel-cta relative h-auto gap-2 overflow-hidden rounded-lg border-0 bg-[#FF5E00] px-10 py-4 text-lg font-black uppercase tracking-widest text-white shadow-sm",
                "hover:bg-[#e55500] md:gap-3 md:px-12 md:py-5 md:text-xl",
              )}
              onClick={() => setStep(1)}
            >
              <div className="pointer-events-none absolute inset-0 h-full w-full -translate-x-[150%] skew-x-[-25deg] bg-gradient-to-r from-transparent via-white/70 to-transparent group-hover/funnel-cta:animate-[shine_0.5s_ease-in-out]" />
              <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                {isEs ? "Comenzar" : "Começar"}
                <svg
                  className="h-7 w-7 shrink-0 animate-[arrowSlide_1.5s_infinite_ease-in-out] sm:h-8 sm:w-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  aria-hidden={true}
                >
                  <path d="M4 12h16" />
                  <path d="m13 5 7 7-7 7" />
                </svg>
              </span>
            </Button>

            <div className="flex flex-col items-center gap-2">
              <div className="flex text-[#FFD700]">
                {[0, 1, 2, 3, 4].map((k) => (
                  <svg
                    key={k}
                    className="size-6 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden={true}
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-[#888888]">
                <span className="font-bold text-black">4,8</span> {isEs ? "estrellas entre" : "estrelas entre"}{" "}
                <span className="font-bold text-black">7.441</span>{" "}
                {isEs ? "evaluaciones" : "avaliações"}
              </p>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div
            className={cn(
              "flex w-full max-w-md flex-col self-center",
              STEP_STACK_GAP,
            )}
          >
            <form
              className={cn("flex flex-col", STEP_STACK_GAP)}
              onSubmit={onNameSubmit}
            >
              <h1 className="text-center text-[1.35rem] font-bold leading-snug text-black sm:text-2xl md:text-[1.65rem] md:leading-snug">
                {isEs
                  ? "Muy bien, seremos rápidos y directos (promesa de dedito). Pero antes de empezar — no queremos ser maleducados… Entonces, ¿cuál es tu nombre?"
                  : "Tudo bem, seremos rápidos e diretos (promesa de dedinho). Mas antes de começarmos — não queremos ser indelicados… Então, qual é o seu nome?"}
              </h1>

              <div className="flex flex-col gap-3">
                <label className="sr-only" htmlFor={nameId}>
                  {isEs ? "Tu primer nombre" : "Seu primeiro nome"}
                </label>
                <input
                  ref={nameInputRef}
                  id={nameId}
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  maxLength={80}
                  placeholder={isEs ? "Escribe tu primer nombre" : "Digite seu primeiro nome"}
                  className="w-full rounded border border-[#9CA8B8] bg-white px-4 py-3.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-[#7C8A9E] focus:outline-none focus:ring-2 focus:ring-zinc-300/60"
                />
                <Button
                  type="submit"
                  formNoValidate
                  className={cn(
                    "group/quiz-cta h-auto w-full gap-2 rounded-lg border-0 bg-zinc-200 py-3.5 text-base font-semibold text-zinc-500 shadow-none",
                    "hover:bg-zinc-300/80 hover:text-zinc-600 flex items-center justify-center",
                  )}
                >
                  {isEs ? "Continuar" : "Continuar"}
                  <svg
                    className="h-6 w-6 shrink-0 animate-[arrowSlide_1.5s_infinite_ease-in-out] sm:h-7 sm:w-7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden={true}
                  >
                    <path d="M4 12h16" />
                    <path d="m13 5 7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </form>
          </div>
        ) : null}

        {step === 2 ? (
          <div
            className={cn(
              "flex w-full max-w-md flex-col self-center",
              STEP_STACK_GAP,
            )}
          >
            <form
              className={cn("flex flex-col", STEP_STACK_GAP)}
              onSubmit={onEmailSubmit}
              noValidate
            >
              <h1 className="text-center text-[1.35rem] font-bold leading-snug text-black sm:text-2xl md:text-[1.65rem] md:leading-snug">
                {isEs
                  ? "¡Genial! ¿Cuál es tu correo electrónico?"
                  : "Ótimo! qual seu email?"}
              </h1>

              <div className="flex flex-col gap-3">
                <label className="sr-only" htmlFor={emailId}>
                  {isEs ? "Tu correo electrónico" : "Seu email"}
                </label>
                <input
                  ref={emailInputRef}
                  id={emailId}
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={120}
                  placeholder={isEs ? "Escribe tu correo electrónico" : "Digite seu email"}
                  className={cn(
                    "w-full rounded border bg-white px-4 py-3.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300/60",
                    emailError ? "border-red-500 focus:border-red-500" : "border-[#9CA8B8] focus:border-[#7C8A9E]"
                  )}
                  onChange={() => {
                    if (emailError) setEmailError("");
                  }}
                />
                {emailError && (
                  <p className="text-sm text-red-500 font-medium">
                    {emailError}
                  </p>
                )}
                <Button
                  type="submit"
                  formNoValidate
                  className={cn(
                    "group/quiz-cta h-auto w-full gap-2 rounded-lg border-0 bg-zinc-200 py-3.5 text-base font-semibold text-zinc-500 shadow-none",
                    "hover:bg-zinc-300/80 hover:text-zinc-600 flex items-center justify-center",
                  )}
                >
                  {isEs ? "Continuar" : "Continuar"}
                  <svg
                    className="h-6 w-6 shrink-0 animate-[arrowSlide_1.5s_infinite_ease-in-out] sm:h-7 sm:w-7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden={true}
                  >
                    <path d="M4 12h16" />
                    <path d="m13 5 7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </form>
          </div>
        ) : null}

        {step === 3 ? (
          <div
            className={cn(
              "flex w-full max-w-2xl flex-col self-center",
              STEP_STACK_GAP,
            )}
          >
            <div className={cn("flex flex-col text-center", STEP_STACK_GAP)}>
              <h1 className="text-center text-[1.35rem] font-bold leading-snug text-black sm:text-2xl md:text-[1.65rem] md:leading-snug">
                {isEs ? "¿Cuál es tu tipo de negocio?" : "Qual é o seu tipo de negócio?"}
              </h1>
              
              <p className="text-base text-zinc-500 sm:text-lg">
                {isEs
                  ? "Te preguntamos esto primero para ver si haríamos un buen equipo. Y en segundo lugar, para identificar cuáles son las mejores estrategias de crecimiento dentro de tu presupuesto."
                  : "Estamos perguntando isso primeiro para ver se seríamos uma boa combinação. E em segundo lugar, para identificar quais são as melhores estratégias de crescimento dentro do seu orçamento."}
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {businessTypes.map((item) => {
                  const label = isEs ? item.es : item.pt;
                  return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleBusinessTypeSelect(label)}
                    className={cn(
                      "group flex w-full items-center gap-3 sm:gap-4 rounded-full border border-[#E5E7EB] bg-white px-4 py-3.5 sm:px-5 sm:py-4 text-left shadow-sm transition-all",
                      "hover:border-[#FF5E00] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#FF5E00]/60"
                    )}
                  >
                    <div className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full border-2 border-zinc-200 bg-zinc-100 transition-colors group-hover:border-[#FF5E00] group-hover:bg-white" />
                    <span className="text-[15px] font-medium text-zinc-700 sm:text-base truncate">
                      <span className="mr-2 text-lg">{item.icon}</span>
                      {label}
                    </span>
                  </button>
                )})}
              </div>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div
            className={cn(
              "flex w-full max-w-2xl flex-col self-center",
              STEP_STACK_GAP,
            )}
          >
            <div className={cn("flex flex-col text-center", STEP_STACK_GAP)}>
              <h1 className="text-center text-[1.35rem] font-bold leading-snug text-black sm:text-2xl md:text-[1.65rem] md:leading-snug">
                {isEs ? "¿Cuánto tiempo llevas en el negocio?" : "Quanto tempo você está no negócio?"}
              </h1>
              
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {timeInBusiness.map((item) => {
                  const label = isEs ? item.es : item.pt;
                  return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleTimeInBusinessSelect(label)}
                    className={cn(
                      "group flex w-full items-center gap-3 sm:gap-4 rounded-full border border-[#E5E7EB] bg-white px-4 py-3.5 sm:px-5 sm:py-4 text-left shadow-sm transition-all",
                      "hover:border-[#FF5E00] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#FF5E00]/60"
                    )}
                  >
                    <div className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full border-2 border-zinc-200 bg-zinc-100 transition-colors group-hover:border-[#FF5E00] group-hover:bg-white" />
                    <span className="text-[15px] font-medium text-zinc-700 sm:text-base truncate">
                      <span className="mr-2 text-lg">{item.icon}</span>
                      {label}
                    </span>
                  </button>
                )})}
              </div>
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div
            className={cn(
              "flex w-full max-w-3xl flex-col self-center",
              STEP_STACK_GAP,
            )}
          >
            <div className={cn("flex flex-col text-center", STEP_STACK_GAP)}>
              <h1 className="text-center text-[1.35rem] font-bold leading-snug text-black sm:text-2xl md:text-[1.65rem] md:leading-snug">
                {isEs 
                  ? "¡Genial! ¿Cuáles son tus principales canales de adquisición de clientes?" 
                  : "Ótimo! Quais são seus principais canais de aquisição de clientes?"}
              </h1>
              
              <p className="text-sm text-zinc-500 sm:text-base">
                {isEs
                  ? "(Selecciona más de uno si corresponde)"
                  : "(Selecione mais de um se aplicável)"}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-8 sm:gap-y-10">
                {waysToGetClients.map((way) => {
                  const isSelected = selectedWays.includes(way.id);
                  return (
                    <button
                      key={way.id}
                      type="button"
                      onClick={() => toggleWay(way.id)}
                      className="group flex flex-col items-center gap-3 focus:outline-none"
                    >
                      <div className={cn(
                        "relative flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-200",
                        isSelected ? "ring-2 ring-[#CFF127] ring-offset-2" : "group-hover:-translate-y-1 group-hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)]"
                      )}>
                        {way.icon}
                        {isSelected && (
                          <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#CFF127] text-black shadow-sm">
                            <Check className="h-4 w-4" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <span className="text-center text-sm font-medium text-zinc-600 sm:text-base">
                        {isEs ? way.es : way.pt}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-10 flex justify-center">
                <Button
                  type="button"
                  onClick={onWaysSubmit}
                  disabled={selectedWays.length === 0}
                  className={cn(
                    "h-auto w-full max-w-[16rem] gap-2 rounded-lg border-0 bg-[#CFF127] py-4 text-lg font-bold text-black shadow-md transition-all",
                    "hover:bg-[#b8d922] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                  )}
                >
                  {isEs ? "Continuar" : "Continuar"}
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16m-7-7 7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {step === 6 ? (
          <div
            className={cn(
              "flex w-full max-w-2xl flex-col self-center",
              STEP_STACK_GAP,
            )}
          >
            <div className={cn("flex flex-col text-center", STEP_STACK_GAP)}>
              <h1 className="text-center text-[1.35rem] font-bold leading-snug text-black sm:text-2xl md:text-[1.65rem] md:leading-snug">
                {isEs ? "¿Cuál es el tamaño de tu equipo?" : "Qual é o tamanho da sua equipe?"}
              </h1>
              
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {teamSizeOptions.map((item) => {
                  const label = isEs ? item.es : item.pt;
                  return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleTeamSizeSelect(label)}
                    className={cn(
                      "group flex w-full items-center gap-3 sm:gap-4 rounded-full border border-[#E5E7EB] bg-white px-4 py-3.5 sm:px-5 sm:py-4 text-left shadow-sm transition-all",
                      "hover:border-[#FF5E00] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#FF5E00]/60"
                    )}
                  >
                    <div className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full border-2 border-zinc-200 bg-zinc-100 transition-colors group-hover:border-[#FF5E00] group-hover:bg-white" />
                    <span className="text-[15px] font-medium text-zinc-700 sm:text-base truncate">
                      <span className="mr-2 text-lg">{item.icon}</span>
                      {label}
                    </span>
                  </button>
                )})}
              </div>
            </div>
          </div>
        ) : null}

        {step === 7 ? (
          <div
            className={cn(
              "flex w-full max-w-md flex-col self-center",
              STEP_STACK_GAP,
            )}
          >
            <form
              className={cn("flex flex-col", STEP_STACK_GAP)}
              onSubmit={onWebsiteSubmit}
            >
              <h1 className="text-center text-[1.35rem] font-bold leading-snug text-black sm:text-2xl md:text-[1.65rem] md:leading-snug">
                {isEs
                  ? "¿Cuál es el sitio web de tu empresa?"
                  : "Qual é o site da sua empresa?"}
              </h1>

              <div className="flex flex-col gap-3">
                <label className="sr-only" htmlFor={websiteId}>
                  {isEs ? "Sitio web" : "Site"}
                </label>
                <input
                  ref={websiteInputRef}
                  id={websiteId}
                  name="website"
                  type="url"
                  autoComplete="url"
                  maxLength={200}
                  placeholder={isEs ? "https://ejemplo.com" : "https://exemplo.com.br"}
                  className="w-full rounded border border-[#9CA8B8] bg-white px-4 py-3.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-[#7C8A9E] focus:outline-none focus:ring-2 focus:ring-zinc-300/60"
                />
                <Button
                  type="submit"
                  formNoValidate
                  className={cn(
                    "group/quiz-cta h-auto w-full gap-2 rounded-lg border-0 bg-zinc-200 py-3.5 text-base font-semibold text-zinc-500 shadow-none",
                    "hover:bg-zinc-300/80 hover:text-zinc-600 flex items-center justify-center",
                  )}
                >
                  {isEs ? "Continuar" : "Continuar"}
                  <svg
                    className="h-6 w-6 shrink-0 animate-[arrowSlide_1.5s_infinite_ease-in-out] sm:h-7 sm:w-7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden={true}
                  >
                    <path d="M4 12h16" />
                    <path d="m13 5 7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </form>
          </div>
        ) : null}

        {step === 8 ? (
          <div
            className={cn(
              "flex w-full max-w-2xl flex-col self-center",
              STEP_STACK_GAP,
            )}
          >
            <div className={cn("flex flex-col text-center", STEP_STACK_GAP)}>
              <h1 className="text-center text-[1.35rem] font-bold leading-snug text-black sm:text-2xl md:text-[1.65rem] md:leading-snug">
                {isEs ? "¿Cuánto factura tu empresa MENSUALMENTE en la actualidad?" : "Quanto sua empresa fatura MENSALMENTE atualmente?"}
              </h1>
              
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {revenueOptions.map((item) => {
                  const label = isEs ? item.es : item.pt;
                  return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleRevenueSelect(label)}
                    className={cn(
                      "group flex w-full items-center gap-3 sm:gap-4 rounded-full border border-[#E5E7EB] bg-white px-4 py-3.5 sm:px-5 sm:py-4 text-left shadow-sm transition-all",
                      "hover:border-[#FF5E00] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#FF5E00]/60"
                    )}
                  >
                    <div className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full border-2 border-zinc-200 bg-zinc-100 transition-colors group-hover:border-[#FF5E00] group-hover:bg-white" />
                    <span className="text-[15px] font-medium text-zinc-700 sm:text-base truncate">
                      <span className="mr-2 text-lg">{item.icon}</span>
                      {label}
                    </span>
                  </button>
                )})}
              </div>
            </div>
          </div>
        ) : null}

        {step === 9 ? (
          <div
            className={cn(
              "flex w-full max-w-2xl flex-col self-center",
              STEP_STACK_GAP,
            )}
          >
            <div className={cn("flex flex-col text-center", STEP_STACK_GAP)}>
              <h1 className="text-center text-[1.35rem] font-bold leading-snug text-black sm:text-2xl md:text-[1.65rem] md:leading-snug">
                {isEs 
                  ? "Siendo sincero... ¿Cuáles son tus mayores dificultades?" 
                  : "Sendo sincero... Quais são suas maiores dificuldades?"}
              </h1>
              
              <p className="text-sm text-zinc-500 sm:text-base">
                {isEs
                  ? "(Marca más de una si corresponde)"
                  : "(Marque mais de uma se for aplicável)"}
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:gap-4 text-left">
                {biggestChallenges.map((item) => {
                  const label = isEs ? item.es : item.pt;
                  const isSelected = selectedChallenges.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleChallenge(item.id)}
                      className={cn(
                        "group flex w-full items-center gap-3 sm:gap-4 rounded-xl border border-[#E5E7EB] bg-white px-4 py-4 sm:px-5 sm:py-5 text-left shadow-sm transition-all",
                        isSelected ? "border-[#FF5E00] ring-1 ring-[#FF5E00]" : "hover:border-[#FF5E00] hover:shadow-md"
                      )}
                    >
                      <div className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition-colors",
                        isSelected ? "border-[#FF5E00] bg-[#FF5E00]" : "border-zinc-300 bg-zinc-50 group-hover:border-[#FF5E00]"
                      )}>
                        {isSelected && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
                      </div>
                      <span className="text-[15px] font-medium text-zinc-700 sm:text-base">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-center">
                <Button
                  type="button"
                  onClick={onChallengesSubmit}
                  disabled={selectedChallenges.length === 0}
                  className={cn(
                    "h-auto w-full max-w-[16rem] gap-2 rounded-lg border-0 bg-[#CFF127] py-4 text-lg font-bold text-black shadow-md transition-all",
                    "hover:bg-[#b8d922] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                  )}
                >
                  {isEs ? "Continuar" : "Continuar"}
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16m-7-7 7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {step === 10 ? (
          <div
            className={cn(
              "flex w-full max-w-2xl flex-col self-center",
              STEP_STACK_GAP,
            )}
          >
            <div className={cn("flex flex-col text-center", STEP_STACK_GAP)}>
              <h1 className="text-center text-[1.35rem] font-bold leading-snug text-black sm:text-2xl md:text-[1.65rem] md:leading-snug">
                {isEs 
                  ? "¿Cómo te sientes acerca de INVERTIR en un plan de marketing y proceso comercial ahora?" 
                  : "Como você se sente sobre INVESTIR em um plano de marketing e processo comercial agora?"}
              </h1>
              
              <div className="mt-4 flex flex-col gap-3 sm:gap-4 text-left">
                {investmentReadinessOptions.map((item) => {
                  const label = isEs ? item.es : item.pt;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleInvestmentReadinessSelect(label)}
                      className={cn(
                        "group flex w-full items-center gap-3 sm:gap-4 rounded-full border border-[#E5E7EB] bg-white px-4 py-3.5 sm:px-5 sm:py-4 text-left shadow-sm transition-all",
                        "hover:border-[#FF5E00] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#FF5E00]/60"
                      )}
                    >
                      <div className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full border-2 border-zinc-200 bg-zinc-100 transition-colors group-hover:border-[#FF5E00] group-hover:bg-white" />
                      <span className="text-[15px] font-medium text-zinc-700 sm:text-base truncate">
                        <span className="mr-2 text-lg">{item.icon}</span>
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {step === 11 ? (
          <div
            className={cn(
              "flex w-full max-w-3xl flex-col self-center",
              STEP_STACK_GAP,
            )}
          >
            <div className={cn("flex flex-col text-center", STEP_STACK_GAP)}>
              <p className="text-sm font-medium text-zinc-500 sm:text-base">
                {isEs
                  ? `Ok ${firstName} lo lograste – última pregunta...`
                  : `Ok ${firstName} você conseguiu – última pergunta...`}
              </p>

              <h1 className="text-center text-[1.35rem] font-bold leading-snug text-black sm:text-2xl md:text-[1.65rem] md:leading-snug">
                {isEs 
                  ? "¿Prometes por el dedito que si calificas para una llamada, te presentarás a la hora seleccionada?" 
                  : "Você promete de dedinho que, se for qualificado para uma ligação, comparecerá no horário selecionado?"}
              </h1>

              <div className="mt-8 flex justify-center gap-4 sm:gap-6">
                {pinkyPromiseOptions.map((item) => {
                  const label = isEs ? item.es : item.pt;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handlePinkyPromiseSelect(label)}
                      className={cn(
                        "group flex h-32 w-28 flex-col items-center justify-center gap-3 rounded-xl bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-200 focus:outline-none",
                        "hover:-translate-y-1 hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] sm:h-36 sm:w-32"
                      )}
                    >
                      <span className="text-3xl sm:text-4xl transition-transform group-hover:scale-110">{item.icon}</span>
                      <span className="text-sm font-medium text-zinc-600 sm:text-base">
                        {label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
