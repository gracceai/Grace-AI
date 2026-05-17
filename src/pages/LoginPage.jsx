import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { supabase } from "../lib/supabase";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  useEffect(() => {
    let mounted = true;

    const verifySession = async () => {
      if (!supabase) {
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (mounted && data.session?.user) {
        navigate("/dashboard/ai-support-chat", { replace: true });
      }
    };

    verifySession();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback({ message: "", type: "" });

    if (!supabase) {
      setFeedback({
        message: "Supabase environment variables are missing. Please check your .env file.",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setFeedback({ message: error.message, type: "error" });
        setLoading(false);
        return;
      }
    } catch (requestError) {
      setFeedback({
        message:
          "Could not reach Supabase. Check that VITE_SUPABASE_URL points to a live project (https://YOUR-REF.supabase.co), then rebuild and redeploy.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    setFeedback({ message: "Login successful. Redirecting...", type: "success" });
    setTimeout(() => {
      navigate("/dashboard/ai-support-chat");
    }, 800);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-stretch">
          <section className="hidden lg:flex bg-primary text-white rounded-[36px] p-10 flex-col justify-between shadow-xl">
            <div>
              <p className="uppercase tracking-[0.2em] text-xs text-primary-fixed mb-4">GraceAI</p>
              <h1 className="font-h1 text-[42px] leading-tight mb-5">
                Welcome back to your steady digital companion.
              </h1>
              <p className="text-primary-fixed text-lg">
                Continue your emotional wellness journey with secure, private, and culturally
                relevant support.
              </p>
            </div>
            <div className="space-y-4 text-primary-fixed">
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined">shield</span>
                Namibian-hosted privacy-first architecture
              </p>
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined">forum</span>
                Empathetic AI support available 24/7
              </p>
            </div>
          </section>

          <section className="bg-white rounded-[36px] p-8 md:p-10 border border-slate-200 shadow-sm">
            <h2 className="font-h2 text-h2 text-primary mb-2">Login</h2>
            <p className="text-on-surface-variant mb-8">
              Sign in to continue your journey with GraceAI.
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-sm font-semibold text-primary mb-2 block">Email address</span>
                <input
                  className="w-full rounded-xl border border-slate-300 focus:border-primary focus:ring-primary"
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  value={email}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-primary mb-2 block">Password</span>
                <input
                  className="w-full rounded-xl border border-slate-300 focus:border-primary focus:ring-primary"
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </label>
              <div className="text-right -mt-2">
                <Link className="text-sm font-semibold text-primary hover:underline" to="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              {feedback.message && (
                <p
                  className={`text-sm ${
                    feedback.type === "error" ? "text-red-600" : "text-emerald-700"
                  }`}
                >
                  {feedback.message}
                </p>
              )}

              <button
                className="w-full bg-primary text-on-primary font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-primary-container transition-all disabled:opacity-60"
                disabled={loading}
                type="submit"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="text-sm text-on-surface-variant mt-6">
              New to GraceAI?{" "}
              <Link className="text-primary font-semibold" to="/signup">
                Create your account
              </Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
