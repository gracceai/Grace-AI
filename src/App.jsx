import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AuthRoute from "./components/AuthRoute";
import { supabase } from "./lib/supabase";
import AISupportChatPage from "./pages/AISupportChatPage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import QuickMoodCheckinPage from "./pages/QuickMoodCheckinPage";
import SignupPage from "./pages/SignupPage";
import StigmaSupportPage from "./pages/StigmaSupportPage";
import JournalPage from "./pages/JournalPage";
import ViewJournalEntryPage from "./pages/ViewJournalEntryPage";
import CustomCursor from "./components/CustomCursor";

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
      <CustomCursor />
      <Routes>
        <Route element={<LandingPage />} path="/" />
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
        element={
          <AuthRoute mode="private" session={session}>
            <AISupportChatPage session={session} />
          </AuthRoute>
        }
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
    </>
  );
}

export default App;
