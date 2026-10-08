function SiteFooter() {
  return (
    <footer className="w-full border-t border-slate-200/70 bg-white pb-8 pt-14 dark:border-white/10 dark:bg-[#0d0914]" id="contact">
      <div className="site-container grid grid-cols-1 gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-start">
        <div>
          <div className="flex items-center gap-2">
            <img alt="GraceAI Logo" className="h-10 w-auto object-contain dark:brightness-0 dark:invert" src="/logo.png" />
          </div>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">
            A private, non-judgemental digital companion helping Namibians take steadier steps
            toward emotional wellbeing.
          </p>
        </div>
        <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-8 gap-y-4 md:justify-self-end">
          <a
            className="text-sm font-semibold text-slate-500 transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-white"
            href="/privacy-policy"
          >
            Privacy
          </a>
          <a
            className="text-sm font-semibold text-slate-500 transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-white"
            href="/terms-of-service"
          >
            Terms
          </a>
          <a
            className="text-sm font-semibold text-primary transition-colors hover:text-primary-container dark:text-white"
            href="/crisis-support"
          >
            Crisis Support
          </a>
          <a
            className="text-sm font-semibold text-slate-500 transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-white"
            href="mailto:mercysomges@gmail.com"
          >
            Contact
          </a>
        </nav>
      </div>
      <div className="site-container mt-12 flex flex-col gap-3 border-t border-slate-100 pt-7 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
        <p>© 2026 GraceAI. All rights reserved.</p>
        <p>
          Thoughtfully developed by{" "}
          <a
            className="font-semibold text-slate-500 transition-colors hover:text-primary dark:hover:text-white"
            href="https://www.aisod.tech/"
            rel="noopener noreferrer"
            target="_blank"
          >
            AISOD
          </a>
        </p>
      </div>
    </footer>
  );
}

export default SiteFooter;
