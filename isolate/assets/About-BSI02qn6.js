import { j as jsxRuntimeExports, L as Link, Z as Zap, a as Button, A as ArrowRight, t as Target, U as Users, v as Lightbulb, d as Card, e as CardContent, g as Separator } from './index-CFd9FS6K.js';

function About() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex h-14 max-w-6xl items-center justify-between px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2 font-semibold text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-5 w-5 text-primary" }),
        "NoirOps"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", children: "Sign In" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "gap-1", children: [
          "Get Started ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5" })
        ] }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-3xl px-6 py-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl md:text-4xl font-bold tracking-tight mb-6", children: "About NoirOps" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 text-muted-foreground leading-relaxed", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg", children: "NoirOps is an AI-powered content intelligence platform built for creators, entrepreneurs, and content teams who want to grow strategically — not randomly." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-foreground pt-4", children: "Why we built this" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Most creators juggle 5–10 separate tools: one for trend research, another for content creation, a third for scheduling, and yet another for analytics. NoirOps combines all of these into a single, intelligent system that actually understands your content strategy." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We built NoirOps because we believe content creation should be a system, not a scramble. You should be able to discover what's trending, research the context, generate platform-optimized content, schedule it, and analyze performance — all from one place." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-foreground pt-4", children: "Who it's for" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-3 gap-4 py-4", children: [
          { icon: Target, title: "Content Creators", text: "Find your next post idea, generate it, and track what works." },
          { icon: Users, title: "Entrepreneurs", text: "Build authority and promote your business without burning hours." },
          { icon: Lightbulb, title: "Small Teams", text: "Get agency-level content strategy without the agency budget." }
        ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(item.icon, { className: "h-6 w-6 text-primary mx-auto mb-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-1", children: item.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: item.text })
        ] }) }, item.title)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-foreground pt-4", children: "Our vision" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "NoirOps aims to become the central nervous system for content strategy. Not just an AI caption generator, but a platform that investigates what's happening online, identifies opportunities, and helps you execute on them — so you can focus on what matters most: building and growing." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We're in beta, and we're building this in public. Every feature is free during this phase. We're not collecting payment information. We're focused entirely on making NoirOps genuinely useful." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-12" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold mb-4", children: "Ready to get started?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "lg", className: "gap-2", children: [
          "Try NoirOps Free ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t border-border/50 mt-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-6 py-8 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-semibold text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-5 w-5 text-primary" }),
        "NoirOps"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/privacy", className: "hover:text-foreground transition-colors", children: "Privacy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/terms", className: "hover:text-foreground transition-colors", children: "Terms" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/contact", className: "hover:text-foreground transition-colors", children: "Contact" })
      ] })
    ] }) })
  ] });
}

export { About as default };
