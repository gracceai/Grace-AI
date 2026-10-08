import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import HeroStarfield from "../components/HeroStarfield";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import TypingChatCard from "../components/TypingChatCard";

const whatsappUrl = "https://wa.me/264836796445";
const specialistUrl =
  "mailto:mercysomges@gmail.com?subject=Talk%20to%20a%20Specialist%20-%20GraceAI";

const strengths = [
  {
    icon: "forum",
    title: "A space to talk",
    description:
      "Share what is on your mind with a calm companion designed to listen without judgement.",
  },
  {
    icon: "monitoring",
    title: "See your patterns",
    description:
      "Simple mood check-ins help you notice emotional shifts and build healthier routines.",
  },
  {
    icon: "auto_stories",
    title: "Reflect privately",
    description:
      "Capture thoughts in your personal journal and return to them whenever you are ready.",
  },
];

const privacyPoints = [
  {
    icon: "lock",
    title: "Privacy-minded",
    description: "Your personal wellness space is designed with confidentiality at its core.",
  },
  {
    icon: "visibility_off",
    title: "Judgement-free",
    description: "Open up at your own pace, without pressure or stigma.",
  },
  {
    icon: "schedule",
    title: "Here when needed",
    description: "Start a supportive conversation whenever the moment calls for one.",
  },
  {
    icon: "location_on",
    title: "Made for Namibia",
    description: "A culturally aware experience shaped around the people it serves.",
  },
];

function PremiumLandingPage() {
  const location = useLocation();

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `/#${sectionId}`);
  };

  useEffect(() => {
    const sectionId = location.hash.replace("#", "");
    if (!sectionId) return undefined;

    const timer = window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [location.hash]);

  return (
    <div className="bg-[#fbfaff] text-slate-950 dark:bg-[#090610] dark:text-white">
      <SiteHeader />

      <main>
        <section
          className="hero-gradient relative flex min-h-[760px] items-center overflow-hidden pb-16 pt-40 sm:min-h-[820px] sm:pt-44 lg:min-h-screen lg:pb-20 lg:pt-36"
          id="home"
        >
          <HeroStarfield />
          <div className="absolute inset-0 z-[2] bg-[radial-gradient(circle_at_72%_48%,rgba(169,206,199,0.13),transparent_28%),radial-gradient(circle_at_20%_20%,rgba(214,186,255,0.12),transparent_30%)]" />

          <div className="site-container relative z-10 grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" />
                Support that meets you where you are
              </div>
              <h1 className="max-w-[720px] font-plus-jakarta text-[38px] font-bold leading-[1.06] tracking-[-0.045em] text-white sm:text-5xl lg:text-[64px]">
                A calmer mind starts with a safe place to talk.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-200 sm:text-lg">
                GraceAI is a private, culturally aware wellness companion helping Namibians
                reflect, understand their emotions, and take the next steady step.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  className="hero-primary-button min-w-[190px] shadow-black/20"
                  href={whatsappUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Start a conversation
                  <span className="material-symbols-outlined text-[19px]">arrow_outward</span>
                </a>
                <button
                  className="secondary-button min-w-[160px] border-white/20 bg-white/10 text-white backdrop-blur-md hover:border-white/30 hover:bg-white/15"
                  onClick={() => scrollToSection("features")}
                  type="button"
                >
                  Explore GraceAI
                  <span className="material-symbols-outlined text-[19px]">south</span>
                </button>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-white/65">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-emerald-300">
                    verified_user
                  </span>
                  Private by design
                </span>
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-emerald-300">
                    favorite
                  </span>
                  Built with empathy
                </span>
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-emerald-300">
                    public
                  </span>
                  Made for Namibia
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[660px] lg:mx-0 lg:ml-auto">
              <div className="absolute -inset-8 rounded-[48px] bg-primary-fixed/10 blur-3xl" />
              <TypingChatCard />
            </div>
          </div>
        </section>

        <section className="relative -mt-px border-b border-slate-200/70 bg-white dark:border-white/10 dark:bg-[#0d0914]" id="why-graceai">
          <div className="site-container grid divide-y divide-slate-200/70 py-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-white/10">
            {[
              ["24/7", "A steady place to begin"],
              ["Private", "Your space, your pace"],
              ["Local", "Built with Namibia in mind"],
            ].map(([value, label]) => (
              <div className="px-5 py-7 text-center" key={value}>
                <p className="font-plus-jakarta text-2xl font-bold tracking-tight text-primary dark:text-primary-fixed">
                  {value}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-24 sm:py-28" id="features">
          <div className="site-container">
            <div className="mx-auto max-w-3xl text-center">
              <span className="section-kicker">A gentler way forward</span>
              <h2 className="section-title">Small tools for meaningful emotional progress.</h2>
              <p className="section-copy mx-auto mt-5 max-w-2xl">
                GraceAI brings conversation, reflection, and awareness into one thoughtful space
                that feels simple from the first visit.
              </p>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {strengths.map((item, index) => (
                <article
                  className="premium-card premium-card-hover group relative overflow-hidden p-7 sm:p-8"
                  key={item.title}
                >
                  <div className="absolute right-0 top-0 h-32 w-32 translate-x-12 -translate-y-12 rounded-full bg-primary-fixed/40 blur-2xl transition group-hover:scale-125 dark:bg-primary/20" />
                  <div className="relative">
                    <div className="mb-8 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                      </div>
                      <span className="font-plus-jakarta text-xs font-bold text-slate-300 dark:text-slate-400">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="font-plus-jakarta text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-3 leading-7 text-slate-600 dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden bg-[#f1ecf8] py-24 dark:bg-[#120b1e]" id="corporate">
          <div className="site-container grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="relative">
              <div className="absolute -left-6 -top-6 h-28 w-28 rounded-full border border-primary/15" />
              <div className="relative overflow-hidden rounded-[28px] bg-slate-200 shadow-lift">
                <img
                  alt="Namibian colleagues collaborating at work"
                  className="aspect-[4/4.5] w-full object-cover object-center sm:aspect-[4/3] lg:aspect-[4/4.5]"
                  loading="lazy"
                  src="/corporate.jpg"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-6 pt-20 text-white">
                  <p className="font-plus-jakarta text-lg font-bold">Wellbeing belongs at work, too.</p>
                  <p className="mt-1 text-sm text-white/70">Support healthier teams with confidence.</p>
                </div>
              </div>
            </div>

            <div>
              <span className="section-kicker">For organizations</span>
              <h2 className="section-title max-w-xl">Build a workplace where people can thrive.</h2>
              <p className="section-copy mt-5 max-w-xl">
                Give your team access to confidential, always-available emotional support while
                encouraging a healthier culture around mental wellbeing.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  ["insights", "Understand wellbeing trends"],
                  ["groups", "Support every team member"],
                  ["shield_person", "Respect individual privacy"],
                  ["neurology", "Encourage healthy habits"],
                ].map(([icon, label]) => (
                  <div className="flex items-center gap-3 rounded-2xl bg-white/75 p-4 dark:bg-white/5" key={label}>
                    <span className="material-symbols-outlined text-[21px] text-secondary dark:text-emerald-300">
                      {icon}
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <a className="primary-button mt-8" href={specialistUrl}>
                Discuss workplace support
                <span className="material-symbols-outlined text-[19px]">arrow_forward</span>
              </a>
            </div>
          </div>
        </section>

        <section className="bg-[#0e1726] py-24 text-white sm:py-28" id="resources">
          <div className="site-container">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                  Trust comes first
                </span>
                <h2 className="font-plus-jakarta text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-4xl lg:text-[46px]">
                  A safe-feeling space, thoughtfully designed.
                </h2>
              </div>
              <p className="max-w-xl text-base leading-8 text-slate-300 lg:ml-auto lg:text-lg">
                Mental wellness is personal. GraceAI keeps the experience calm, respectful, and
                centred on your choices at every step.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {privacyPoints.map((point) => (
                <article
                  className="rounded-[22px] border border-white/10 bg-white/[0.045] p-6 transition hover:border-white/20 hover:bg-white/[0.07]"
                  key={point.title}
                >
                  <span className="material-symbols-outlined text-[25px] text-emerald-200">
                    {point.icon}
                  </span>
                  <h3 className="mt-6 font-plus-jakarta font-bold">{point.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{point.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-24 sm:py-28">
          <div className="absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-fixed/60 blur-3xl dark:bg-primary/15" />
          <div className="site-container relative text-center">
            <span className="section-kicker">Take one small step</span>
            <h2 className="section-title mx-auto max-w-3xl">
              You do not have to carry everything alone.
            </h2>
            <p className="section-copy mx-auto mt-5 max-w-2xl">
              Begin with a simple conversation, or connect with a specialist when you need human
              support.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <a className="primary-button min-w-[190px]" href={whatsappUrl} rel="noreferrer" target="_blank">
                Chat with GraceAI
                <span className="material-symbols-outlined text-[19px]">arrow_outward</span>
              </a>
              <a className="secondary-button min-w-[190px]" href={specialistUrl}>
                Talk to a specialist
              </a>
            </div>
            <p className="mt-5 text-xs text-slate-500 dark:text-slate-400">
              GraceAI is a wellness support tool and does not replace professional medical care.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default PremiumLandingPage;
