import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const landingLinks = [
  { id: "features", label: "Features" },
  { id: "corporate", label: "Corporate" },
  { id: "why-graceai", label: "Why GraceAI" },
  { id: "resources", label: "Resources" },
];

const appLinks = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/dashboard/stigma-support", label: "Health Support" },
  { path: "/dashboard/quick-mood-checkin", label: "Mood Check-in" },
  { path: "/dashboard/journal", label: "Journal" },
  { path: "/dashboard/ai-support-chat", label: "AI Support" },
];

function SiteHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(
    location.hash ? location.hash.slice(1) : ""
  );
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  const onLanding = location.pathname === "/";
  const overHero = onLanding && !user && !scrolled;
  const mobileBreakpoint = user ? "xl:hidden" : "lg:hidden";

  useEffect(() => {
    let mounted = true;
    if (!supabase) return () => {};

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setUser(data.session?.user ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = saved === "dark" || (!saved && prefersDark) ? "dark" : "light";
    document.documentElement.classList.toggle("dark", next === "dark");
    setTheme(next);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
    if (location.hash) setActiveSection(location.hash.slice(1));
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!onLanding || user) {
      setScrolled(false);
      return undefined;
    }
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [onLanding, user]);

  useEffect(() => {
    if (!onLanding) return undefined;
    const sections = landingLinks
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.1, 0.3] }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [onLanding]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const openSection = (id) => {
    if (!onLanding) {
      navigate(`/#${id}`);
      return;
    }
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `/#${id}`);
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setProfileOpen(false);
    navigate("/");
  };

  const tryGraceAI = () => {
    const appUrl = import.meta.env.VITE_GRACEAI_APP_URL?.trim();
    if (appUrl) {
      window.location.assign(appUrl);
      return;
    }
    navigate("/dashboard/ai-support-chat");
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition duration-300 ${
          overHero
            ? "border-white/10 bg-[#0b0712]/45 text-white backdrop-blur-lg"
            : "border-slate-200/70 bg-white/90 text-slate-900 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#0d0914]/90 dark:text-white"
        }`}
      >
        <div className="site-container flex h-[76px] items-center justify-between gap-3 sm:h-[84px]">
          <button
            aria-label="GraceAI home"
            className="flex shrink-0 items-center gap-2.5"
            onClick={() => navigate(user ? "/dashboard/ai-support-chat" : "/")}
            type="button"
          >
            <img alt="" className="h-10 w-10 rounded-full shadow-md sm:h-11 sm:w-11" src="/favicon.png" />
            <span
              className={`font-plus-jakarta text-xl font-bold tracking-[-0.04em] sm:text-[22px] ${
                overHero ? "text-white" : "text-primary dark:text-white"
              }`}
            >
              GraceAI
            </span>
          </button>

          {!user && (
            <nav aria-label="Main navigation" className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 lg:flex">
              {landingLinks.map((item) => (
                <button
                  className={`rounded-full px-4 py-2 font-plus-jakarta text-sm font-semibold transition ${
                    activeSection === item.id
                      ? overHero
                        ? "bg-white/15 text-white"
                        : "bg-primary/10 text-primary dark:bg-white/10 dark:text-white"
                      : overHero
                        ? "text-white/80 hover:bg-white/10 hover:text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-primary dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                  key={item.id}
                  onClick={() => openSection(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}

          {user && (
            <nav aria-label="Dashboard navigation" className="hidden items-center gap-1 xl:flex">
              {appLinks.map((item) => (
                <button
                  className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                    location.pathname === item.path
                      ? "bg-primary/10 text-primary dark:bg-white/10 dark:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-primary dark:text-slate-300 dark:hover:bg-white/10"
                  }`}
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className={`rounded-full p-2 transition ${overHero ? "text-white/90 hover:bg-white/10" : "text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"}`}
              onClick={toggleTheme}
              type="button"
            >
              <span className="material-symbols-outlined text-[23px]">
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
            </button>

            {user ? (
              <div className="relative hidden xl:block">
                <button
                  aria-expanded={profileOpen}
                  aria-label="Open profile menu"
                  className="rounded-full p-1 text-primary transition hover:bg-primary/10 dark:text-white"
                  onClick={() => setProfileOpen((open) => !open)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[34px]">account_circle</span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-xl dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-xs text-slate-500">Signed in as</p>
                    <p className="mb-3 truncate text-sm font-semibold text-primary dark:text-white">
                      {user.user_metadata?.full_name || user.email || "GraceAI User"}
                    </p>
                    <button className="secondary-button w-full" onClick={signOut} type="button">
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  className={`hidden px-3 py-2 text-sm font-semibold transition lg:inline-flex ${overHero ? "text-white hover:text-white/75" : "text-slate-700 dark:text-slate-200"}`}
                  onClick={() => navigate("/login")}
                  type="button"
                >
                  Login
                </button>
                <button
                  className={`hidden min-h-11 items-center rounded-full px-5 text-sm font-bold shadow-lg transition lg:inline-flex ${
                    overHero ? "hero-primary-button" : "bg-primary text-white hover:bg-primary-container"
                  }`}
                  onClick={tryGraceAI}
                  type="button"
                >
                  Try GraceAI
                </button>
              </>
            )}

            <button
              aria-expanded={menuOpen}
              aria-label="Open menu"
              className={`flex items-center justify-center rounded-xl p-2 transition ${mobileBreakpoint} ${
                overHero
                  ? "text-white hover:bg-white/10"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
              }`}
              onClick={() => setMenuOpen(true)}
              type="button"
            >
              <span className="material-symbols-outlined text-[27px]">menu</span>
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className={`fixed inset-0 z-[100] ${mobileBreakpoint}`}>
          <button
            aria-label="Close menu"
            className="absolute inset-0 h-full w-full bg-slate-950/55 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            type="button"
          />
          <aside className="absolute inset-y-0 right-0 flex w-full max-w-[340px] flex-col bg-white shadow-2xl dark:bg-[#0d0914]">
            <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-white/10">
              <span className="font-plus-jakarta text-lg font-bold text-primary dark:text-white">Menu</span>
              <button
                aria-label="Close menu"
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
                onClick={() => setMenuOpen(false)}
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
              {(user ? appLinks : landingLinks).map((item) => {
                const selected = user
                  ? location.pathname === item.path
                  : activeSection === item.id;
                return (
                  <button
                    className={`rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                      selected
                        ? "bg-primary/10 text-primary dark:bg-white/10 dark:text-white"
                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5"
                    }`}
                    key={user ? item.path : item.id}
                    onClick={() => {
                      if (user) navigate(item.path);
                      else openSection(item.id);
                      setMenuOpen(false);
                    }}
                    type="button"
                  >
                    {item.label}
                  </button>
                );
              })}
              {!user && (
                <>
                  <button
                    className="mt-2 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
                    onClick={() => navigate("/login")}
                    type="button"
                  >
                    Login
                  </button>
                  <button className="primary-button mt-1" onClick={tryGraceAI} type="button">
                    Try GraceAI
                  </button>
                </>
              )}
              {user && (
                <button
                  className="mt-auto rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/30"
                  onClick={signOut}
                  type="button"
                >
                  Sign out
                </button>
              )}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}

export default SiteHeader;
