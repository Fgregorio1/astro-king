import { useEffect, useId, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
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

const DOT_COUNT = 9;
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

export default function StrategySessionFunnel({ lang = "pt" }: { lang?: "pt" | "es" }) {
  const [step, setStep] = useState(0);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const nameId = useId();

  const emailInputRef = useRef<HTMLInputElement>(null);
  const emailId = useId();
  const [emailError, setEmailError] = useState("");

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
      </main>
    </div>
  );
}
