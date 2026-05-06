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
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary text-white shadow-xl mb-6">
              <span className="material-symbols-outlined text-5xl">health_and_safety</span>
            </div>
            <h1 className="font-h1 text-[34px] sm:text-[52px] leading-tight text-primary mb-3">
              Crisis Support
            </h1>
            <p className="text-lg sm:text-xl text-on-surface-variant mb-8">
              Coming soon.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white p-4">
                <p className="font-semibold text-primary">24/7 Access</p>
                <p className="text-sm text-on-surface-variant">Dedicated crisis pathways</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white p-4">
                <p className="font-semibold text-primary">Local Guidance</p>
                <p className="text-sm text-on-surface-variant">Namibia-first support options</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white p-4">
                <p className="font-semibold text-primary">Safer Escalation</p>
                <p className="text-sm text-on-surface-variant">Fast referral routes</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CrisisSupportPage;
