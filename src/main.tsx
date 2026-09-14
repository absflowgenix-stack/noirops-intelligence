import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/Layout";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import React, { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation, Outlet } from "react-router";
import "./index.css";

// Lazy load route components for better code splitting
const Landing = lazy(() => import("./pages/Landing.tsx"));
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const AboutPage = lazy(() => import("./pages/About.tsx"));
const ContactPage = lazy(() => import("./pages/Contact.tsx"));
const PrivacyPage = lazy(() => import("./pages/Privacy.tsx"));
const TermsPage = lazy(() => import("./pages/Terms.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const DashboardHome = lazy(() => import("./pages/dashboard/Home.tsx"));
const CreateContent = lazy(() => import("./pages/dashboard/CreateContent.tsx"));
const ContentHistory = lazy(() => import("./pages/dashboard/ContentHistory.tsx"));
const CalendarPage = lazy(() => import("./pages/dashboard/Calendar.tsx"));
const AnalyticsPage = lazy(() => import("./pages/dashboard/Analytics.tsx"));
const BrandVoicesPage = lazy(() => import("./pages/dashboard/BrandVoices.tsx"));
const FeedbackPage = lazy(() => import("./pages/dashboard/FeedbackPage.tsx"));
const VideoClipsPage = lazy(() => import("./pages/dashboard/VideoClips.tsx"));

// Simple loading fallback for route transitions
function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

/** Silent error boundary — if VlyToolbar crashes it renders nothing instead of
 *  crashing the whole app (e.g. hook errors in WebContainer environment). */
class ToolbarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn("[VlyToolbar] Caught error, toolbar disabled:", err.message);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/** Hard guard so runtime errors never leave the preview as a blank page. */
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: "", stack: "" };
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error.message || "Unknown runtime error",
      stack: error.stack || "",
    };
  }
  componentDidCatch(err: Error) {
    console.error("[WebContainer preview] Root crash:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-lg text-center">
            <p className="text-sm font-semibold">Preview runtime error</p>
            <p className="mt-2 text-xs text-muted-foreground break-words">
              {this.state.message}
            </p>
            {this.state.stack && (
              <pre className="mt-3 text-left text-[10px] leading-4 text-muted-foreground/80 max-h-40 overflow-auto rounded border border-border/60 p-2">
                {this.state.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// The build-time VITE_CONVEX_URL baked into published builds points at a Convex
// deployment that has never received a successful functions push (pushes from
// this sandbox are locked to the dev deployment by CONVEX_DEPLOY_KEY, and that
// production deployment was left empty when the first publish-time push failed
// on an invalid schema index). Every auth/query call against it fails with a
// masked "Server Error". This project's complete, working backend (schema,
// functions, auth keys, AI key) lives on polite-tortoise-103 — verified
// end-to-end through the public API — so the client always talks to it, in
// preview and in the published app. If the publish pipeline is ever fixed to
// push functions to the production deployment, replace this constant with
// `import.meta.env.VITE_CONVEX_URL` again.
const CONVEX_URL = "https://polite-tortoise-103.convex.cloud";

const convex = new ConvexReactClient(CONVEX_URL);


function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

function DashboardWrapper() {
  return (
    <RequireAuth>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </RequireAuth>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <ToolbarErrorBoundary>
        <VlyToolbar />
      </ToolbarErrorBoundary>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route
                path="/auth"
                element={<AuthPage redirectAfterAuth="/dashboard" />}
              />
              <Route path="/dashboard" element={<DashboardWrapper />}>
                <Route index element={<DashboardHome />} />
                <Route path="create" element={<CreateContent />} />
                <Route path="history" element={<ContentHistory />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="brand-voices" element={<BrandVoicesPage />} />
                <Route path="clips" element={<VideoClipsPage />} />
                <Route path="feedback" element={<FeedbackPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </ConvexAuthProvider>
    </RootErrorBoundary>
  </StrictMode>,
);
