import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import TypingChatCard from "../components/TypingChatCard";
import HeroStarfield from "../components/HeroStarfield";

const markLogo = "/favicon.png";
const specialistContact = "mailto:mercysomges@gmail.com?subject=Talk%20to%20a%20Specialist%20-%20GraceAI";

function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `/#${sectionId}`);
    }
  };

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const sectionId = location.hash.replace("#", "");

    const timer = window.setTimeout(() => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);

    return () => window.clearTimeout(timer);
  }, [location.hash]);

  return (
    <>
      <SiteHeader />

      <main>
        <section
          className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient"
          id="home"
        >
          <HeroStarfield />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-12 relative z-10 pt-24 sm:pt-28 pb-12 md:pb-16">
            <div className="space-y-6 md:space-y-8">
              <h1 className="font-h1 text-[32px] sm:text-[42px] md:text-[56px] lg:text-[64px] leading-[1.08] text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)]">
                Empowering Mental Resilience for Every Namibian
              </h1>
              <p className="font-body-lg text-base sm:text-lg text-slate-100/95 max-w-lg drop-shadow-[0_1px_10px_rgba(0,0,0,0.45)]">
                GraceAI is your wise companion, providing steady, non-judgmental mental health
                support through culturally-nuanced AI and secure digital tools.
              </p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 pt-2">
                <button
                  className="w-full sm:w-auto bg-primary text-on-primary font-bold px-8 py-4 rounded-xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                  onClick={() => window.open("https://wa.me/264836796445", "_blank")}
                >
                  Chat with GraceAI
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                <button
                  className="w-full sm:w-auto border-2 border-white/80 text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all"
                  onClick={() => scrollToSection("features")}
                >
                  View Features
                </button>
              </div>
            </div>
            <div className="relative w-full max-w-[780px] mx-auto md:mx-0 md:ml-auto">
              <TypingChatCard />
            </div>
          </div>
        </section>

        <section className="py-xxl bg-surface-container-low" id="why-graceai">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-xl">
              <h2 className="font-h2 text-h2 text-primary dark:text-white mb-md">Bridging the Mental Health Gap</h2>
              <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto">
                In Namibia, access to mental health professionals can be limited. GraceAI provides
                an immediate, reliable first step toward emotional wellness.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              <div className="bg-white p-xl rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:scale-105 hover:bg-primary/5 hover:border-primary/20 transition-all duration-300 cursor-default">
                <span className="text-h1 font-h1 text-primary dark:text-white mb-xs">24/7</span>
                <p className="font-body-sm text-on-surface-variant font-medium">
                  Always Available Support
                </p>
              </div>
              <div className="bg-white p-xl rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:scale-105 hover:bg-primary/5 hover:border-primary/20 transition-all duration-300 cursor-default">
                <span className="text-h1 font-h1 text-primary dark:text-white mb-xs">100%</span>
                <p className="font-body-sm text-on-surface-variant font-medium">
                  Private &amp; Local Hosting
                </p>
              </div>
              <div className="bg-white p-xl rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:scale-105 hover:bg-primary/5 hover:border-primary/20 transition-all duration-300 cursor-default">
                <span className="text-h1 font-h1 text-primary dark:text-white mb-xs">0s</span>
                <p className="font-body-sm text-on-surface-variant font-medium">
                  Waiting Time for Crisis Aid
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-xxl bg-white" id="features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-xl gap-md">
              <div className="max-w-xl">
                <span className="text-primary dark:text-white font-bold tracking-widest text-xs uppercase mb-2 block">
                  Our Tools
                </span>
                <h2 className="font-h2 text-h2 text-primary dark:text-white">Comprehensive Care at Your Fingertips</h2>
              </div>
              <div className="hidden md:block">
                <img
                  alt="GraceAI Icon"
                  className="h-12 w-12 rounded-full object-cover"
                  src={markLogo}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              <div className="group p-xl rounded-[32px] bg-secondary-container/30 border border-secondary-container hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-lg shadow-sm">
                  <span className="material-symbols-outlined text-secondary text-[32px]">
                    chat_bubble
                  </span>
                </div>
                <h3 className="font-h3 text-h3 text-primary dark:text-white mb-md">Empathetic AI Chat</h3>
                <p className="font-body-md text-on-surface-variant mb-xl">
                  A companion that listens without judgment, trained on empathetic communication to
                  help you process feelings in real-time.
                </p>
                <div className="h-2 w-12 bg-secondary rounded-full" />
              </div>

              <div className="group p-xl rounded-[32px] bg-tertiary-container/10 border border-tertiary-container/20 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-lg shadow-sm">
                  <span className="material-symbols-outlined text-on-tertiary-fixed-variant text-[32px]">
                    dashboard
                  </span>
                </div>
                <h3 className="font-h3 text-h3 text-primary dark:text-white mb-md">Wellness Dashboard</h3>
                <p className="font-body-md text-on-surface-variant mb-xl">
                  Track your emotional trajectory with smooth Bézier curves and visual mood
                  indicators designed for clarity and calm.
                </p>
                <div className="h-2 w-12 bg-on-tertiary-container rounded-full" />
              </div>

              <div className="group p-xl rounded-[32px] bg-primary-fixed/30 border border-primary-fixed hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-lg shadow-sm">
                  <span className="material-symbols-outlined text-primary dark:text-white text-[32px]">
                    auto_stories
                  </span>
                </div>
                <h3 className="font-h3 text-h3 text-primary dark:text-white mb-md">Private Journal</h3>
                <p className="font-body-md text-on-surface-variant mb-xl">
                  A secure, encrypted space for your thoughts. Guided prompts help you navigate
                  grief, anxiety, and daily stress.
                </p>
                <div className="h-2 w-12 bg-primary rounded-full" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-xxl bg-surface-container-highest/30 overflow-hidden" id="corporate">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-xxl items-center">
            <div className="order-2 md:order-1">
              <div className="relative">
                <img
                  alt="Corporate Team"
                  className="rounded-[40px] shadow-2xl relative z-10"
                  src="/corporate.jpg"
                />
                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary-container rounded-[40px] -z-0 opacity-20" />
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-secondary-container rounded-full -z-0 opacity-40" />
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-lg">
              <span className="text-secondary dark:text-emerald-300 font-bold tracking-widest text-xs uppercase">
                For Organizations
              </span>
              <h2 className="font-h2 text-[36px] leading-tight text-primary dark:text-white">
                GraceAI for Corporate Resilience
              </h2>
              <p className="font-body-lg text-on-surface-variant">
                Foster a healthier work environment in Namibia. Provide your team with 24/7
                confidential mental health support that understands our unique professional
                landscape.
              </p>
              <ul className="space-y-md">
                <li className="flex items-start gap-md">
                  <span className="material-symbols-outlined text-secondary mt-1">check_circle</span>
                  <div>
                    <h4 className="font-bold text-primary dark:text-white">Anonymized Workforce Analytics</h4>
                    <p className="text-body-sm text-on-surface-variant">
                      Identify burnout trends without compromising individual privacy.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-md">
                  <span className="material-symbols-outlined text-secondary mt-1">check_circle</span>
                  <div>
                    <h4 className="font-bold text-primary dark:text-white">Stress Management Workshops</h4>
                    <p className="text-body-sm text-on-surface-variant">
                      AI-driven sessions tailored to your specific industry challenges.
                    </p>
                  </div>
                </li>
              </ul>
              <button
                className="bg-primary text-on-primary font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-primary-container transition-all active:scale-95"
                onClick={() => scrollToSection("resources")}
              >
                Learn More About Corporate
              </button>
            </div>
          </div>
        </section>

        <section className="py-xxl bg-tertiary text-on-tertiary" id="resources">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center mb-xxl">
              <div className="inline-block p-4 bg-on-tertiary/10 rounded-full mb-md">
                <span
                  className="material-symbols-outlined text-[48px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  shield
                </span>
              </div>
              <h2 className="font-h1 text-h1 mb-md">Your Data, Your Sovereignty</h2>
              <p className="font-body-lg text-on-tertiary-container">
                GraceAI is built with a &quot;Privacy First&quot; architecture. We ensure your most
                personal thoughts remain yours alone through enterprise-grade security.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
              <div className="p-lg bg-on-tertiary/5 border border-on-tertiary/10 rounded-2xl">
                <span className="material-symbols-outlined text-on-tertiary-container mb-md">
                  location_on
                </span>
                <h4 className="font-bold mb-xs">Namibian Hosted</h4>
                <p className="text-body-sm text-on-tertiary-container">
                  All data stays within Namibian borders, compliant with local regulations.
                </p>
              </div>
              <div className="p-lg bg-on-tertiary/5 border border-on-tertiary/10 rounded-2xl">
                <span className="material-symbols-outlined text-on-tertiary-container mb-md">
                  lock
                </span>
                <h4 className="font-bold mb-xs">End-to-End Encryption</h4>
                <p className="text-body-sm text-on-tertiary-container">
                  Your journals and chats are encrypted before they even leave your device.
                </p>
              </div>
              <div className="p-lg bg-on-tertiary/5 border border-on-tertiary/10 rounded-2xl">
                <span className="material-symbols-outlined text-on-tertiary-container mb-md">
                  person_off
                </span>
                <h4 className="font-bold mb-xs">Anonymous by Default</h4>
                <p className="text-body-sm text-on-tertiary-container">
                  No personally identifiable information is required to start your journey.
                </p>
              </div>
              <div className="p-lg bg-on-tertiary/5 border border-on-tertiary/10 rounded-2xl">
                <span className="material-symbols-outlined text-on-tertiary-container mb-md">
                  verified
                </span>
                <h4 className="font-bold mb-xs">Clinically Informed</h4>
                <p className="text-body-sm text-on-tertiary-container">
                  Developed in collaboration with local medical professionals.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-xxl relative overflow-hidden">
          <div className="absolute inset-0 bg-primary opacity-5" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <h2 className="font-h1 text-[32px] sm:text-[40px] md:text-[52px] leading-tight text-primary dark:text-white mb-lg">
              Take the First Step Toward a Calmer Mind
            </h2>
            <p className="font-body-lg text-on-surface-variant mb-xl">
              Join thousands of Namibians who are building emotional strength every day with
              GraceAI.
            </p>
            <div className="flex flex-col sm:flex-row gap-md justify-center" id="cta">
              <button
                className="bg-primary text-on-primary font-bold px-12 py-5 rounded-full text-lg shadow-2xl hover:scale-105 transition-all"
                onClick={() => window.open("https://wa.me/264836796445", "_blank")}
              >
                Chat with GraceAI
              </button>
              <a
                className="bg-white border-2 border-primary text-primary dark:text-white font-bold px-12 py-5 rounded-full text-lg hover:bg-primary/5 transition-all"
                href={specialistContact}
                onClick={() => scrollToSection("contact")}
              >
                Talk to a Specialist
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

export default LandingPage;
