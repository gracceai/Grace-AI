import SiteHeader from "../components/SiteHeader";

function CrisisSupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-24 sm:pt-28 pb-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto relative overflow-hidden rounded-[32px] border border-primary/20 bg-gradient-to-br from-primary/10 via-white to-secondary-container/40 p-8 sm:p-12 shadow-2xl">
          <div className="absolute -top-16 -right-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary text-white shadow-xl mb-6 animate-bounce-subtle">
              <span className="material-symbols-outlined text-5xl">construction</span>
            </div>
            <h1 className="font-h1 text-[34px] sm:text-[52px] leading-tight text-primary mb-3">
              Crisis Support
            </h1>
            <p className="text-lg sm:text-xl text-on-surface-variant mb-8">
              This page is under construction.
            </p>

            <div className="max-w-3xl mx-auto rounded-3xl border border-primary/20 bg-white/80 backdrop-blur-sm p-5 sm:p-6">
              <div className="flex items-center justify-center gap-4 sm:gap-6 mb-5">
                <div className="flex flex-col items-center animate-pulse">
                  <span className="material-symbols-outlined text-4xl text-amber-500">engineering</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Team</span>
                </div>
                <div className="flex flex-col items-center animate-bounce">
                  <span className="material-symbols-outlined text-4xl text-primary">build</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Building</span>
                </div>
                <div className="flex flex-col items-center animate-pulse">
                  <span className="material-symbols-outlined text-4xl text-amber-500">traffic</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Safety</span>
                </div>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-amber-400 via-primary to-secondary animate-pulse" />
              </div>

              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-5">
                {["Emergency handoff flow", "Local helpline routing", "Safety response steps"].map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CrisisSupportPage;
