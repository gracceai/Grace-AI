import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import HeroStarfield from "../components/HeroStarfield";

const DEFAULT_DELAY = 2200;

function getDestination() {
  const configuredUrl = import.meta.env.VITE_GRACEAI_APP_URL?.trim();
  if (!configuredUrl) return null;

  try {
    const destination = new URL(configuredUrl);
    const allowedProtocol = destination.protocol === "https:" || destination.protocol === "http:";
    const createsLoop = destination.origin === window.location.origin;
    return allowedProtocol && !createsLoop ? destination.toString() : null;
  } catch {
    return null;
  }
}

function QRLaunchPage() {
  const navigate = useNavigate();
  const destination = useMemo(getDestination, []);
  const reducedMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const delay = reducedMotion ? 600 : DEFAULT_DELAY;

  useEffect(() => {
    if (!destination) return undefined;
    const timer = window.setTimeout(() => window.location.replace(destination), delay);
    return () => window.clearTimeout(timer);
  }, [delay, destination]);

  const openGraceAI = () => {
    if (destination) window.location.replace(destination);
  };

  return (
    <main className="hero-gradient relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 text-white">
      <HeroStarfield />
      <div className="absolute inset-0 z-[2] bg-[radial-gradient(circle_at_50%_45%,rgba(120,78,180,0.16),transparent_36%)]" />

      <section className="relative z-10 w-full max-w-md overflow-hidden rounded-[30px] border border-white/15 bg-[#0d0a18]/80 p-6 text-center shadow-[0_32px_100px_-24px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:p-8">
        <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/10 bg-white/10 shadow-lg shadow-black/20">
          <img alt="" className="h-12 w-12 rounded-full" src="/favicon.png" />
        </div>

        <p className="mt-6 font-plus-jakarta text-xs font-bold uppercase tracking-[0.2em] text-primary-fixed">
          GraceAI
        </p>

        {destination ? (
          <>
            <h1 className="mt-3 font-plus-jakarta text-3xl font-bold tracking-[-0.04em] sm:text-[34px]">
              Opening your safe space.
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-slate-300">
              You&apos;re being securely connected to the GraceAI companion.
            </p>

            <div className="mt-8 overflow-hidden rounded-full bg-white/10">
              <div
                className="qr-redirect-progress h-1 rounded-full bg-gradient-to-r from-primary-fixed via-white to-emerald-300"
                style={{ "--redirect-duration": `${delay}ms` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
              Connecting…
            </div>

            <button className="hero-primary-button mt-7 w-full" onClick={openGraceAI} type="button">
              Open GraceAI now
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <button
              className="mt-4 text-xs font-semibold text-slate-400 transition hover:text-white"
              onClick={() => navigate("/")}
              type="button"
            >
              Stay on the website
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              GraceAI launch
            </div>
            <h1 className="mt-5 font-plus-jakarta text-3xl font-bold tracking-[-0.04em] sm:text-[34px]">
              Meet GraceAI.
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-slate-300">
              Your private, culturally aware wellness companion is ready to listen. Try the
              GraceAI experience now—no account is required to begin.
            </p>

            <button
              className="hero-primary-button mt-8 w-full"
              onClick={() => navigate("/chat")}
              type="button"
            >
              Try GraceAI now
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <button
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 text-sm font-bold text-white transition hover:bg-white/10"
              onClick={() => navigate("/")}
              type="button"
            >
              Explore the website
            </button>
          </>
        )}

        <p className="mt-7 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          Private, supportive, and made for Namibia
        </p>
      </section>
    </main>
  );
}

export default QRLaunchPage;
