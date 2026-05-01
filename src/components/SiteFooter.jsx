function SiteFooter() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white pt-12 pb-8" id="contact">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-md">
          <div className="flex items-center gap-2">
            <img alt="GraceAI Logo" className="h-12 md:h-14 w-auto object-contain" src="/logo.png" />
          </div>
          <p className="font-plus-jakarta text-sm leading-relaxed text-slate-500 max-w-sm">
            © 2026 GraceAI. Empowering mental resilience across Namibia. Your steady,
            non-judgmental digital companion.
          </p>
        </div>
        <div className="flex flex-wrap md:justify-end gap-x-xl gap-y-md">
          <a
            className="font-plus-jakarta text-sm font-semibold text-slate-500 hover:text-purple-700 transition-colors cursor-pointer"
            href="/#resources"
          >
            Privacy Policy
          </a>
          <a
            className="font-plus-jakarta text-sm font-semibold text-slate-500 hover:text-purple-700 transition-colors cursor-pointer"
            href="/#resources"
          >
            Terms of Service
          </a>
          <a
            className="font-plus-jakarta text-sm font-semibold text-purple-900 transition-colors cursor-pointer"
            href="tel:+264836796445"
          >
            Crisis Support
          </a>
          <a
            className="font-plus-jakarta text-sm font-semibold text-slate-500 hover:text-purple-700 transition-colors cursor-pointer"
            href="mailto:mercysomges@gmail.com"
          >
            Contact Us
          </a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-md">
        <p className="text-xs text-slate-400">Made with ❤️ for Namibia</p>
      </div>
    </footer>
  );
}

export default SiteFooter;
