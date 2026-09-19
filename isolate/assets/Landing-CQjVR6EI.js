import { j as jsxRuntimeExports, L as Link, Z as Zap, B as Badge, a as Button, A as ArrowRight, P as Play, S as Sparkles, T as TrendingUp, b as Brain, R as Repeat, C as CalendarDays, c as ChartColumn, d as Card, e as CardContent, U as Users, G as Globe, f as Shield, g as Separator } from './index-CFd9FS6K.js';

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Content Engine",
    description: "Generate platform-optimized posts, captions, hooks, threads, and content ideas tailored to your brand voice."
  },
  {
    icon: TrendingUp,
    title: "Trend Radar",
    description: "Discover what's trending across platforms and identify content opportunities before they peak."
  },
  {
    icon: Brain,
    title: "Content Intelligence",
    description: "Analyze competitors, research topics, and get AI-powered recommendations on what to post and when."
  },
  {
    icon: Repeat,
    title: "Smart Repurposing",
    description: "Transform one piece of content into platform-native formats. Adapts tone, length, and structure automatically."
  },
  {
    icon: CalendarDays,
    title: "Content Calendar",
    description: "Plan, schedule, and visualize your content pipeline with an intuitive drag-and-drop calendar."
  },
  {
    icon: ChartColumn,
    title: "Real Analytics",
    description: "Track content performance with actual data. See generations, saves, edits, and activity over time."
  }
];
const STEPS = [
  { num: "01", label: "Discover", description: "Find trending topics and opportunities" },
  { num: "02", label: "Create", description: "Generate platform-optimized content" },
  { num: "03", label: "Schedule", description: "Plan your publishing calendar" },
  { num: "04", label: "Analyze", description: "Track performance and iterate" }
];
const FAQ = [
  {
    q: "Is NoirOps free during beta?",
    a: "Yes. All beta users have full access to every feature. No credit card required."
  },
  {
    q: "Which platforms do you support?",
    a: "Instagram, Twitter/X, LinkedIn, TikTok, YouTube, and Facebook. We're adding more."
  },
  {
    q: "Do I need an API key for AI features?",
    a: "No. NoirOps handles the AI infrastructure. You just provide the topic and preferences."
  },
  {
    q: "Can I import existing content?",
    a: "You can paste existing content for repurposing, analysis, and improvement suggestions."
  }
];
function Landing() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex h-14 max-w-6xl items-center justify-between px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2 font-semibold text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-5 w-5 text-primary" }),
        "NoirOps",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[9px] px-1.5 py-0 h-4", children: "Beta" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "hidden md:flex items-center gap-6 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#features", className: "hover:text-foreground transition-colors", children: "Features" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#how-it-works", className: "hover:text-foreground transition-colors", children: "How It Works" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#faq", className: "hover:text-foreground transition-colors", children: "FAQ" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", children: "Sign In" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "gap-1", children: [
          "Get Started ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5" })
        ] }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-6 py-24 md:py-32 text-center relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "mb-6 text-xs", children: "AI-Powered Content Intelligence" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] max-w-3xl mx-auto", children: [
          "Know what to post.",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "Create it instantly." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed", children: "NoirOps investigates what's happening online, identifies opportunities, generates platform-optimized content, and helps you grow — all in one place." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3 mt-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "lg", className: "gap-2 px-6", children: [
            "Start Creating ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#features", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "lg", className: "gap-2 px-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4" }),
            " See How It Works"
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-xs text-muted-foreground/60", children: "Free during beta · No credit card required" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "features", className: "border-t border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-6 py-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl md:text-3xl font-bold tracking-tight", children: "Everything you need to grow" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground max-w-lg mx-auto", children: "From discovery to creation to analytics — NoirOps is your complete content operating system." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-4", children: FEATURES.map((feature) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          className: "border-border/50 hover:border-border transition-colors group",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(feature.icon, { className: "h-5 w-5 text-primary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-2", children: feature.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: feature.description })
          ] })
        },
        feature.title
      )) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "how-it-works", className: "border-t border-border/50 bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-6 py-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl md:text-3xl font-bold tracking-tight", children: "The NoirOps loop" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground max-w-lg mx-auto", children: "A continuous cycle that compounds your content growth." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-6", children: STEPS.map((step, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-bold text-primary/20 mb-2", children: step.num }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-1", children: step.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: step.description }),
        i < STEPS.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block absolute right-0 top-1/2" })
      ] }, step.num)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "border-t border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-6 py-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center mb-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl md:text-3xl font-bold tracking-tight", children: "Built for creators who take content seriously" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-3 gap-6", children: [
        {
          icon: Users,
          title: "For Creators",
          text: "Stop staring at a blank screen. Get AI-powered content ideas and drafts that actually match your voice."
        },
        {
          icon: Globe,
          title: "For Entrepreneurs",
          text: "Build authority without spending hours on content. Research competitors, find trends, and execute faster."
        },
        {
          icon: Shield,
          title: "Your Data Stays Yours",
          text: "We don't sell your content or data. During beta, everything is free and private. Period."
        }
      ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(item.icon, { className: "h-8 w-8 text-primary mx-auto mb-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-2", children: item.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: item.text })
      ] }) }, item.title)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "faq", className: "border-t border-border/50 bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl px-6 py-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center mb-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl md:text-3xl font-bold tracking-tight", children: "Frequently asked questions" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: FAQ.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-2", children: item.q }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: item.a })
      ] }) }, item.q)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "border-t border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-6 py-20 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl md:text-3xl font-bold tracking-tight", children: "Start creating smarter content today" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground max-w-md mx-auto", children: "Join the beta and get full access to NoirOps — completely free." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "lg", className: "mt-8 gap-2 px-8", children: [
        "Get Started Free ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-6 py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row items-start justify-between gap-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-semibold text-sm mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-5 w-5 text-primary" }),
            "NoirOps"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground max-w-xs leading-relaxed", children: "AI-powered content intelligence platform for creators and entrepreneurs. Discover, create, and grow." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold mb-3", children: "Product" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", className: "block text-xs text-muted-foreground hover:text-foreground transition-colors", children: "Get Started" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#features", className: "block text-xs text-muted-foreground hover:text-foreground transition-colors", children: "Features" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#faq", className: "block text-xs text-muted-foreground hover:text-foreground transition-colors", children: "FAQ" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold mb-3", children: "Company" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/about", className: "block text-xs text-muted-foreground hover:text-foreground transition-colors", children: "About" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/contact", className: "block text-xs text-muted-foreground hover:text-foreground transition-colors", children: "Contact" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold mb-3", children: "Legal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/privacy", className: "block text-xs text-muted-foreground hover:text-foreground transition-colors", children: "Privacy Policy" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/terms", className: "block text-xs text-muted-foreground hover:text-foreground transition-colors", children: "Terms of Service" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-6" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " NoirOps. All rights reserved."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Built with AI · Powered by creators" })
      ] })
    ] }) })
  ] });
}

export { Landing as default };
