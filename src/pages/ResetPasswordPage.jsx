import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { supabase } from "../lib/supabase";

function ResetPasswordPage({ session }) {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecoverySession, setIsRecoverySession] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const accessTokenFromHash = useMemo(() => {
    const hash = new URLSearchParams(window.location.hash.replace("#", ""));
    return hash.get("access_token");
  }, []);

  const refreshTokenFromHash = useMemo(() => {
    const hash = new URLSearchParams(window.location.hash.replace("#", ""));
    return hash.get("refresh_token");
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrapRecoverySession = async () => {
      if (!supabase) return;

      if (accessTokenFromHash && refreshTokenFromHash) {
        const { error } = await supabase.auth.setSession({
          access_token: accessTokenFromHash,
          refresh_token: refreshTokenFromHash,
        });
        if (error && active) {
          setFeedback({ type: "error", message: error.message });
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setIsRecoverySession(Boolean(data.session?.user));
    };

    bootstrapRecoverySession();
    return () => {
      active = false;
    };
  }, [accessTokenFromHash, refreshTokenFromHash]);

  if (!session && !accessTokenFromHash) {
    // Allow access only through a recovery link/session.
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback({ type: "", message: "" });

    if (!supabase) {
      setFeedback({ type: "error", message: "Supabase is not configured." });
      return;
    }

    if (password.length < 6) {
      setFeedback({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }

    if (password !== confirmPassword) {
      setFeedback({ type: "error", message: "Passwords do not match." });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setFeedback({ type: "error", message: error.message });
      return;
    }

    setFeedback({ type: "success", message: "Password updated. Redirecting to login..." });
    window.setTimeout(() => navigate("/login", { replace: true }), 1000);
  };

  if (!isRecoverySession && !accessTokenFromHash) {
    return <Navigate replace to="/forgot-password" />;
  }

  return (
    <div className="min-h-screen bg-background text-on-background">
      <SiteHeader />
      <main className="pt-24 pb-10 px-4 sm:px-6 min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover opacity-30"
            src="https://lh3.googleusercontent.com/aida/ADBb0ui10NbxTlZ2VXgcWwfUKsZ9b6TI1O1FAwk9agxck_Be4mRoaRtHkrDIqntusTPvCNdG8JXdXmk04sTGOd2jgIMUg8ZtPmXoooy5I66YC6eiFEFILGAXnSCdTg6y8gViCdnGxgWRH_YlyUJSoP64E_LclOU9Bcjq5HuzMvs1Rwpz_6sfpBByacrvUlADMx58SETN-jmi7AQDXFzqHmZ9_P0CzgErym6hU4rKFJoSEQ-Pgk2LY8O98tzn6k1OMy9LlZ1ghOvw-KJ0"
            alt="Background"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-white via-transparent to-primary-fixed/20" />
        </div>

        <div className="relative z-10 w-full max-w-[480px]">
          <div className="glass-card rounded-[2rem] p-6 sm:p-8 shadow-2xl shadow-primary-container/10 border border-white/50 bg-white/70 backdrop-blur-xl">
            <div className="text-center mb-8">
              <h1 className="font-h2 text-h3 text-primary mb-2">Create a new password</h1>
              <p className="font-body-md text-on-surface-variant max-w-[320px] mx-auto">
                Enter your new password below to complete account recovery.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="font-label-caps text-label-caps text-outline px-1" htmlFor="password">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="block w-full px-4 py-4 bg-surface-container-low border-0 rounded-xl focus:ring-2 focus:ring-primary-container focus:bg-white transition-all duration-300 text-on-surface"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-label-caps text-label-caps text-outline px-1" htmlFor="confirm-password">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  className="block w-full px-4 py-4 bg-surface-container-low border-0 rounded-xl focus:ring-2 focus:ring-primary-container focus:bg-white transition-all duration-300 text-on-surface"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>

              {feedback.message && (
                <p className={`text-sm ${feedback.type === "error" ? "text-red-600" : "text-emerald-700"}`}>
                  {feedback.message}
                </p>
              )}

              <button
                className="w-full bg-primary-container text-white py-4 rounded-xl font-body-lg font-bold hover:bg-primary hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary-container/30 flex items-center justify-center gap-2 disabled:opacity-70"
                type="submit"
                disabled={loading}
              >
                {loading ? "Saving..." : "Update Password"}
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link
                className="inline-flex items-center gap-2 font-body-md text-primary-container font-semibold hover:opacity-70 transition-opacity"
                to="/login"
              >
                <span className="material-symbols-outlined text-lg">keyboard_backspace</span>
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ResetPasswordPage;
