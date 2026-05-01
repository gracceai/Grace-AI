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
  { path: "/", label: "Home" },
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
  const isLandingPage = location.pathname === "/";
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
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

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
      <header className="bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md fixed top-0 w-full z-50 border-b border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between px-6 py-3 md:py-4 max-w-7xl mx-auto gap-4">
        <button className="flex items-center gap-2 shrink-0" onClick={() => navigate(currentUser ? "/dashboard" : "/")} type="button">
          <img
            alt="GraceAI Logo"
            className="h-14 md:h-16 lg:h-20 w-auto object-contain drop-shadow-[0_2px_4px_rgba(49,11,99,0.18)]"
            src="/logo.png"
          />
        </button>

        {!currentUser && (
          <nav className="hidden md:flex items-center gap-lg">
            {navItems.map((item) => (
              <button
                className={`${navButtonBase} ${
                  isLandingPage && activeSection === item.id
                    ? "text-purple-900 border-b-2 border-purple-900 pb-1"
                    : "text-slate-600 hover:text-purple-700 hover:bg-slate-100/50 px-1.5 py-1"
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
                className={`font-plus-jakarta text-xs lg:text-sm font-medium px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  location.pathname === item.path
                    ? "text-purple-900 bg-slate-100"
                    : "text-slate-700 hover:text-purple-700 hover:bg-slate-100/60"
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
                <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-xl p-4">
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
                className="text-slate-600 font-medium text-sm px-4 py-2 cursor-pointer active:scale-95 transform duration-150"
                onClick={() => navigate("/login")}
                type="button"
              >
                Login
              </button>
              <button
                className="bg-primary text-on-primary font-bold text-sm px-6 py-2.5 rounded-full shadow-lg hover:bg-primary-container transition-all active:scale-95 transform duration-150"
                onClick={() => navigate("/signup")}
                type="button"
              >
                Get Started
              </button>
            </>
          )}

          {/* Hamburger Menu Icon */}
          <button
            className="md:hidden flex items-center justify-center p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
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
          <div className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-slate-900 shadow-2xl flex flex-col transition-transform transform">
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
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      className={`text-left font-plus-jakarta text-sm font-medium px-4 py-3 rounded-lg transition-all ${
                        isLandingPage && activeSection === item.id
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
                      className={`text-left font-plus-jakarta text-sm font-medium px-4 py-3 rounded-lg transition-all ${
                        location.pathname === item.path
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
