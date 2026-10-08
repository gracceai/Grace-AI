import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const navItems = [
  { id: "features", label: "Features" },
  { id: "corporate", label: "Corporate" },
  { id: "why-graceai", label: "Why GraceAI" },
  { id: "resources", label: "Resources" },
];

const dashboardNavItems = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/dashboard/stigma-support", label: "Stigma-Sensitive Health Support" },
  { path: "/dashboard/quick-mood-checkin", label: "Quick Mood Check-in" },
  { path: "/dashboard/journal", label: "Journal" },
  { path: "/dashboard/ai-support-chat", label: "AI Support Chat" },
];

const navButtonBase =
  "font-plus-jakarta text-sm font-medium tracking-tight rounded-lg transition-all duration-300";

function SiteHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isPastHero, setIsPastHero] = useState(false);
  const isLandingPage = location.pathname === "/";
  const isLandingGuest = isLandingPage && !currentUser;
  const showHeroOverlayNav = isLandingGuest && !isPastHero;
  const activeSection = location.hash ? location.hash.replace("#", "") : "features";

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      if (!supabase) {
        setCurrentUser(null);
        return;
      }

      const { data } = await supabase.auth.getSession();

      if (mounted) {
        setCurrentUser(data.session?.user ?? null);
      }
    };

    loadSession();

    if (!supabase) {
      return () => {
        mounted = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const preferredDark =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme = storedTheme === "dark" || (!storedTheme && preferredDark) ? "dark" : "light";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    setTheme(nextTheme);
  }, []);

  useEffect(() => {
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!isLandingGuest) {
      setIsPastHero(false);
      return undefined;
    }

    const updateScrollState = () => {
      const hero = document.getElementById("home");
      if (!hero) {
        setIsPastHero(false);
        return;
      }

      const headerOffset = 72;
      const heroEnd = hero.offsetTop + hero.offsetHeight - headerOffset;
      setIsPastHero(window.scrollY > heroEnd);
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [isLandingGuest]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  const scrollToSection = (sectionId) => {
    if (!isLandingPage) {
      navigate(`/#${sectionId}`);
      return;
    }

    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `/#${sectionId}`);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setIsProfileMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${showHeroOverlayNav
          ? "bg-transparent border-b border-white/10 shadow-none"
          : isLandingGuest
            ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none"
            : "bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none"
          }`}
      >
        <div className="flex items-center justify-between pl-2 pr-3 sm:pr-6 py-2.5 sm:py-3 md:py-4 gap-2 sm:gap-3 md:gap-4 max-w-[100vw]">
          <button className="flex items-center gap-2 shrink-0" onClick={() => navigate(currentUser ? "/dashboard/ai-support-chat" : "/")} type="button">
            <img
              alt="GraceAI Logo"
              className={`h-9 sm:h-11 md:h-14 lg:h-[4.5rem] w-auto object-contain transition-[filter] duration-300 ${showHeroOverlayNav
                ? "brightness-0 invert drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
                : "drop-shadow-[0_2px_4px_rgba(49,11,99,0.18)]"
                }`}
              src="/logo.png"
            />
          </button>

          {!currentUser && (
            <nav className="hidden md:flex items-center gap-lg">
              {navItems.map((item) => (
                <button
                  className={`${navButtonBase} ${isLandingPage && activeSection === item.id
                    ? showHeroOverlayNav
                      ? "text-white border-b-2 border-white pb-1"
                      : "text-purple-900 dark:text-white border-b-2 border-purple-900 dark:border-white pb-1"
                    : showHeroOverlayNav
                      ? "text-white/90 hover:text-white hover:bg-white/10 px-1.5 py-1"
                      : "text-slate-700 hover:text-purple-700 hover:bg-slate-100/50 px-1.5 py-1"
                    }`}
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}
          {currentUser && (
            <nav className="hidden md:flex items-center gap-md">
              {dashboardNavItems.map((item) => (
                <button
                  className={`font-plus-jakarta text-xs lg:text-sm font-medium px-2 py-1 rounded-lg transition-all cursor-pointer ${location.pathname === item.path
                    ? "text-purple-900 dark:text-white bg-slate-100 dark:bg-slate-800"
                    : "text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800"
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

          <div className="flex items-center gap-sm md:gap-md shrink-0">
            <button
              className={`rounded-full p-2 transition-colors ${showHeroOverlayNav
                ? "text-white/90 hover:bg-white/10"
                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
            </button>
            {currentUser ? (
              <div className="relative flex items-center gap-2">
                <button
                  className="rounded-full p-1 text-primary hover:bg-primary/10 transition-colors"
                  onClick={() => setIsProfileMenuOpen((open) => !open)}
                  title="Profile"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[36px]">account_circle</span>
                </button>

                {isProfileMenuOpen && (
                  <div className="hidden md:block absolute right-0 top-full mt-2 z-[60] w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-4">
                    <p className="text-xs text-slate-500">Signed in as</p>
                    <p className="text-sm font-semibold text-primary truncate mb-3">
                      {currentUser.user_metadata?.full_name || currentUser.email || "GraceAI User"}
                    </p>
                    <button
                      className="w-full text-sm font-semibold text-primary border border-primary/30 rounded-lg py-2 hover:bg-primary/5 transition-colors"
                      onClick={handleSignOut}
                      type="button"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  className={`hidden font-medium text-sm px-4 py-2 cursor-pointer active:scale-95 transform duration-150 ${showHeroOverlayNav ? "text-white hover:text-white/80" : "text-slate-700"
                    }`}
                  onClick={() => navigate("/login")}
                  type="button"
                >
                  Login
                </button>
                <button
                  className="hidden sm:inline-flex bg-primary text-on-primary font-bold text-sm px-6 py-2.5 rounded-full shadow-lg hover:bg-primary/90 transition-all active:scale-95 transform duration-150"
                  onClick={() => window.open("https://wa.me/264836796445", "_blank")}
                  type="button"
                >
                  Chat with GraceAI
                </button>
              </>
            )}

            {/* Hamburger Menu Icon */}
            <button
              className={`md:hidden flex items-center justify-center p-2 rounded-lg transition-colors ${showHeroOverlayNav ? "text-white hover:bg-white/10" : "text-slate-700 hover:bg-slate-100"
                }`}
              onClick={() => setIsMobileMenuOpen(true)}
              type="button"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined text-[28px]">menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-64 bg-white dark:bg-slate-900 shadow-2xl flex flex-col transition-transform transform">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold text-lg text-primary">Menu</span>
              <button
                className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex flex-col p-4 overflow-y-auto gap-2">
              {!currentUser && (
                <>
                  <button
                    className="hidden text-left font-plus-jakarta text-sm font-medium px-4 py-3 rounded-lg transition-all text-slate-700 hover:bg-slate-50"
                    onClick={() => {
                      navigate("/login");
                      setIsMobileMenuOpen(false);
                    }}
                    type="button"
                  >
                    Login
                  </button>
                  <button
                    className="text-left font-plus-jakarta text-sm font-semibold px-4 py-3 rounded-lg transition-all text-white bg-primary hover:bg-primary/90"
                    onClick={() => {
                      window.open("https://wa.me/264836796445", "_blank");
                      setIsMobileMenuOpen(false);
                    }}
                    type="button"
                  >
                    Message GRACEAI
                  </button>
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      className={`text-left font-plus-jakarta text-sm font-medium px-4 py-3 rounded-lg transition-all ${isLandingPage && activeSection === item.id
                        ? "text-purple-900 bg-purple-50"
                        : "text-slate-700 hover:bg-slate-50"
                        }`}
                      onClick={() => {
                        scrollToSection(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </>
              )}
              {currentUser && (
                <>
                  {dashboardNavItems.map((item) => (
                    <button
                      key={item.path}
                      className={`text-left font-plus-jakarta text-sm font-medium px-4 py-3 rounded-lg transition-all ${location.pathname === item.path
                        ? "text-purple-900 bg-purple-50"
                        : "text-slate-700 hover:bg-slate-50"
                        }`}
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                  <button
                    className="text-left font-plus-jakarta text-sm font-medium px-4 py-3 rounded-lg transition-all text-slate-700 hover:bg-slate-50"
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    type="button"
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SiteHeader;
