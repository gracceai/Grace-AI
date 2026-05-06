import { useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { supabase } from "../lib/supabase";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showResetPopup, setShowResetPopup] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback({ type: "", message: "" });

    if (!supabase) {
      setFeedback({
        type: "error",
        message: "Supabase is not configured. Please check environment variables.",
      });
      return;
    }

    setSendingCode(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: false,
      },
    });
    setSendingCode(false);

    if (error) {
      setFeedback({ type: "error", message: error.message });
      return;
    }

    setFeedback({ type: "success", message: "Verification code sent to your email." });
    setShowResetPopup(true);
  };

  const handleVerificationReset = async (event) => {
    event.preventDefault();
    setFeedback({ type: "", message: "" });

    if (!supabase) {
      setFeedback({ type: "error", message: "Supabase is not configured." });
      return;
    }
    if (!verificationCode.trim()) {
      setFeedback({ type: "error", message: "Please enter the verification code." });
      return;
    }
    if (newPassword.length < 6) {
      setFeedback({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", message: "Passwords do not match." });
      return;
    }

    setVerifying(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: verificationCode.trim(),
      type: "email",
    });
    if (verifyError) {
      setVerifying(false);
      setFeedback({ type: "error", message: verifyError.message });
      return;
    }

    const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
    if (passwordError) {
      setVerifying(false);
      setFeedback({ type: "error", message: passwordError.message });
      return;
    }

    setVerifying(false);
    setFeedback({ type: "success", message: "Password changed successfully. You are now logged in." });
    setShowResetPopup(false);
  };

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
              <h1 className="font-h2 text-h3 text-primary mb-2">Let&apos;s get you back in</h1>
              <p className="font-body-md text-on-surface-variant max-w-[320px] mx-auto">
                Enter your email and we&apos;ll send you a link to reset your password
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="font-label-caps text-label-caps text-outline px-1" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="block w-full px-4 py-4 bg-surface-container-low border-0 rounded-xl focus:ring-2 focus:ring-primary-container focus:bg-white transition-all duration-300 text-on-surface placeholder:text-outline/60"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              {feedback.message && (
                <p className={`text-sm ${feedback.type === "error" ? "text-red-600" : "text-emerald-700"}`}>
                  {feedback.message}
                </p>
              )}

              <button
                className="w-full bg-primary-container text-on-secondary py-4 rounded-xl font-body-lg font-bold hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-lg shadow-primary-container/30 flex items-center justify-center gap-2 disabled:opacity-70"
                type="submit"
                disabled={sendingCode}
              >
                {sendingCode ? "Sending..." : "Send Verification Code"}
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

      {showResetPopup && (
        <div className="fixed inset-0 z-[120] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 sm:p-8">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h3 className="font-h2 text-h3 text-primary">Verify Code and Set New Password</h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  Enter the code sent to <span className="font-semibold">{email}</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowResetPopup(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleVerificationReset}>
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-white dark:bg-slate-800"
                placeholder="Verification code"
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value)}
                required
              />
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-white dark:bg-slate-800"
                placeholder="New password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-white dark:bg-slate-800"
                placeholder="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-70"
                disabled={verifying}
              >
                {verifying ? "Verifying..." : "Verify and Save Password"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ForgotPasswordPage;
