import SiteHeader from "../components/SiteHeader";

function CrisisSupportPage() {
  return (
    <div className="min-h-screen bg-background dark:bg-slate-950">
      <SiteHeader />
      <main className="px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-5xl">
          <section className="relative overflow-hidden rounded-[28px] bg-[#2b0b35] px-6 py-10 text-white shadow-lift sm:px-10 sm:py-14">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-red-400/20 blur-3xl" />
            <div className="relative max-w-3xl">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em]">
                <span className="material-symbols-outlined text-[18px]">health_and_safety</span>
                Immediate support
              </span>
              <h1 className="font-plus-jakarta text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
                You deserve help right now.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
                If you may hurt yourself or someone else, or you are in immediate danger, contact
                local emergency services or go to the nearest hospital now. GraceAI is not an
                emergency service.
              </p>
            </div>
          </section>

          <section className="mt-6 grid gap-5 md:grid-cols-3">
            {[
              ["call", "Contact emergency help", "Call your local emergency service or ask someone nearby to call for you."],
              ["local_hospital", "Go somewhere safe", "Move to the nearest hospital, clinic, police station, or another public place."],
              ["group", "Stay with someone", "Tell a trusted person what is happening and ask them to remain with you."],
            ].map(([icon, title, copy], index) => (
              <article className="premium-card p-6" key={title}>
                <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300">
                  <span className="material-symbols-outlined text-[22px]">{icon}</span>
                </span>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Step {index + 1}
                </p>
                <h2 className="mt-2 font-plus-jakarta text-lg font-bold text-slate-900 dark:text-white">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{copy}</p>
              </article>
            ))}
          </section>

          <section className="premium-card mt-6 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h2 className="font-plus-jakarta text-xl font-bold text-slate-900 dark:text-white">
                Need non-emergency support?
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Contact a GraceAI specialist for follow-up support. Do not use email or WhatsApp
                when there is immediate danger.
              </p>
            </div>
            <a
              className="primary-button shrink-0"
              href="mailto:mercysomges@gmail.com?subject=GraceAI%20Support"
            >
              Contact a specialist
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
          </section>
          </div>
      </main>
    </div>
  );
}

export default CrisisSupportPage;
