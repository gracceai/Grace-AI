import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AuthRoute from "./components/AuthRoute";
import { supabase } from "./lib/supabase";

const AISupportChatPage = lazy(() => import("./pages/AISupportChatPage"));
const GraceChatPage = lazy(() => import("./pages/GraceChatPage"));
const CrisisSupportPage = lazy(() => import("./pages/CrisisSupportPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const JournalPage = lazy(() => import("./pages/JournalPage"));
const LandingPage = lazy(() => import("./pages/PremiumLandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const QRLaunchPage = lazy(() => import("./pages/QRLaunchPage"));
const QuickMoodCheckinPage = lazy(() => import("./pages/QuickMoodCheckinPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const StigmaSupportPage = lazy(() => import("./pages/StigmaSupportPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));
const ViewJournalEntryPage = lazy(() => import("./pages/ViewJournalEntryPage"));

function RootEntryPage() {
  const hasAppDestination = Boolean(import.meta.env.VITE_GRACEAI_APP_URL?.trim());
  return hasAppDestination ? <QRLaunchPage /> : <LandingPage />;
}

function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background dark:bg-slate-950">
      <div
        aria-live="polite"
        className="flex items-center gap-3 text-sm font-semibold text-primary dark:text-white"
        role="status"
      >
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary dark:border-white/20 dark:border-t-white" />
        Loading GraceAI…
      </div>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      if (!supabase) {
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setSession(data.session ?? null);
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
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
        <Route element={<RootEntryPage />} path="/" />
      <Route element={<GraceChatPage />} path="/chat" />
      <Route element={<QRLaunchPage />} path="/launch" />
      <Route
        element={
          <AuthRoute mode="guest" session={session}>
            <LoginPage />
          </AuthRoute>
        }
        path="/login"
      />
      <Route
        element={
          <AuthRoute mode="guest" session={session}>
            <ForgotPasswordPage />
          </AuthRoute>
        }
        path="/forgot-password"
      />
      <Route element={<ResetPasswordPage session={session} />} path="/reset-password" />
      <Route element={<PrivacyPolicyPage />} path="/privacy-policy" />
      <Route element={<TermsOfServicePage />} path="/terms-of-service" />
      <Route element={<CrisisSupportPage />} path="/crisis-support" />
      <Route
        element={
          <AuthRoute mode="guest" session={session}>
            <SignupPage />
          </AuthRoute>
        }
        path="/signup"
      />
      <Route
        element={
          <AuthRoute mode="private" session={session}>
            <DashboardPage session={session} />
          </AuthRoute>
        }
        path="/dashboard"
      />
      <Route
        element={
          <AuthRoute mode="private" session={session}>
            <JournalPage session={session} />
          </AuthRoute>
        }
        path="/dashboard/journal"
      />
      <Route
        element={
          <AuthRoute mode="private" session={session}>
            <ViewJournalEntryPage session={session} />
          </AuthRoute>
        }
        path="/dashboard/journal/:id"
      />
      <Route
        element={
          <AuthRoute mode="private" session={session}>
            <QuickMoodCheckinPage session={session} />
          </AuthRoute>
        }
        path="/dashboard/quick-mood-checkin"
      />
      <Route
        element={<AISupportChatPage session={session} />}
        path="/dashboard/ai-support-chat"
      />
      <Route
        element={
          <AuthRoute mode="private" session={session}>
            <StigmaSupportPage session={session} />
          </AuthRoute>
        }
        path="/dashboard/stigma-support"
      />
      <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
