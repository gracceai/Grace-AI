import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { supabase } from "../lib/supabase";

function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
        navigate("/dashboard", { replace: true });
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

    if (password.length < 6) {
      setFeedback({
        message: "Password should be at least 6 characters.",
        type: "error",
      });
      return;
    }

    if (password !== confirmPassword) {
      setFeedback({
        message: "Passwords do not match.",
        type: "error",
      });
      return;
    }

    if (!supabase) {
      setFeedback({
        message: "Supabase environment variables are missing. Please check your .env file.",
        type: "error",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setFeedback({ message: error.message, type: "error" });
      setLoading(false);
      return;
    }

    setFeedback({
      message: "Account created. Please check your email to confirm and then log in.",
      type: "success",
    });
    setTimeout(() => {
      navigate("/login");
    }, 1000);
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
                Start your journey to a calmer, stronger mind.
              </h1>
              <p className="text-primary-fixed text-lg">
                Build resilience with a private, stigma-free emotional support companion made for
                Namibians.
              </p>
            </div>
            <div className="space-y-4 text-primary-fixed">
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined">verified_user</span>
                Anonymous and encrypted by default
              </p>
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined">psychology</span>
                Early emotional support whenever you need it
              </p>
            </div>
          </section>

          <section className="bg-white rounded-[36px] p-8 md:p-10 border border-slate-200 shadow-sm">
            <h2 className="font-h2 text-h2 text-primary mb-2">Create account</h2>
            <p className="text-on-surface-variant mb-8">
              Sign up and begin your GraceAI support journey.
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-sm font-semibold text-primary mb-2 block">Full name</span>
                <input
                  className="w-full rounded-xl border border-slate-300 focus:border-primary focus:ring-primary"
                  onChange={(event) => setFullName(event.target.value)}
                  required
                  type="text"
                  value={fullName}
                />
              </label>

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

              <label className="block">
                <span className="text-sm font-semibold text-primary mb-2 block">
                  Confirm password
                </span>
                <input
                  className="w-full rounded-xl border border-slate-300 focus:border-primary focus:ring-primary"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  type="password"
                  value={confirmPassword}
                />
              </label>

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
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="text-sm text-on-surface-variant mt-6">
              Already have an account?{" "}
              <Link className="text-primary font-semibold" to="/login">
                Login
              </Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

export default SignupPage;
