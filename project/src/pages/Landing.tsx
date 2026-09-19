import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Zap,
  ArrowRight,
  Sparkles,
  BarChart3,
  CalendarDays,
  Repeat,
  Brain,
  Search,
  TrendingUp,
  Play,
  CheckCircle,
  Globe,
  Shield,
  Clock,
  Users,
} from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Content Engine",
    description:
      "Generate platform-optimized posts, captions, hooks, threads, and content ideas tailored to your brand voice.",
  },
  {
    icon: TrendingUp,
    title: "Trend Radar",
    description:
      "Discover what's trending across platforms and identify content opportunities before they peak.",
  },
  {
    icon: Brain,
    title: "Content Intelligence",
    description:
      "Analyze competitors, research topics, and get AI-powered recommendations on what to post and when.",
  },
  {
    icon: Repeat,
    title: "Smart Repurposing",
    description:
      "Transform one piece of content into platform-native formats. Adapts tone, length, and structure automatically.",
  },
  {
    icon: CalendarDays,
    title: "Content Calendar",
    description:
      "Plan, schedule, and visualize your content pipeline with an intuitive drag-and-drop calendar.",
  },
  {
    icon: BarChart3,
    title: "Real Analytics",
    description:
      "Track content performance with actual data. See generations, saves, edits, and activity over time.",
  },
];

const STEPS = [
  { num: "01", label: "Discover", description: "Find trending topics and opportunities" },
  { num: "02", label: "Create", description: "Generate platform-optimized content" },
  { num: "03", label: "Schedule", description: "Plan your publishing calendar" },
  { num: "04", label: "Analyze", description: "Track performance and iterate" },
];

const FAQ = [
  {
    q: "Is NoirOps free during beta?",
    a: "Yes. All beta users have full access to every feature. No credit card required.",
  },
  {
    q: "Which platforms do you support?",
    a: "Instagram, Twitter/X, LinkedIn, TikTok, YouTube, and Facebook. We're adding more.",
  },
  {
    q: "Do I need an API key for AI features?",
    a: "No. NoirOps handles the AI infrastructure. You just provide the topic and preferences.",
  },
  {
    q: "Can I import existing content?",
    a: "You can paste existing content for repurposing, analysis, and improvement suggestions.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-sm">
            <Zap className="h-5 w-5 text-primary" />
            NoirOps
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
              Beta
            </Badge>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="gap-1">
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32 text-center relative">
          <Badge variant="secondary" className="mb-6 text-xs">
            AI-Powered Content Intelligence
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] max-w-3xl mx-auto">
            Know what to post.{" "}
            <span className="text-primary">Create it instantly.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            NoirOps investigates what's happening online, identifies opportunities,
            generates platform-optimized content, and helps you grow — all in one place.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <Link to="/auth">
              <Button size="lg" className="gap-2 px-6">
                Start Creating <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="gap-2 px-6">
                <Play className="h-4 w-4" /> See How It Works
              </Button>
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground/60">
            Free during beta · No credit card required
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Everything you need to grow
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              From discovery to creation to analytics — NoirOps is your complete content operating system.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature) => (
              <Card
                key={feature.title}
                className="border-border/50 hover:border-border transition-colors group"
              >
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              The NoirOps loop
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              A continuous cycle that compounds your content growth.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="text-center">
                <div className="text-3xl font-bold text-primary/20 mb-2">
                  {step.num}
                </div>
                <h3 className="font-semibold text-sm mb-1">{step.label}</h3>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Trust */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Built for creators who take content seriously
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: "For Creators",
                text: "Stop staring at a blank screen. Get AI-powered content ideas and drafts that actually match your voice.",
              },
              {
                icon: Globe,
                title: "For Entrepreneurs",
                text: "Build authority without spending hours on content. Research competitors, find trends, and execute faster.",
              },
              {
                icon: Shield,
                title: "Your Data Stays Yours",
                text: "We don't sell your content or data. During beta, everything is free and private. Period.",
              },
            ].map((item) => (
              <Card key={item.title} className="border-border/50">
                <CardContent className="p-6 text-center">
                  <item.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-sm mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Frequently asked questions
            </h2>
          </div>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <Card key={item.q} className="border-border/50">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-sm mb-2">{item.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Start creating smarter content today
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            Join the beta and get full access to NoirOps — completely free.
          </p>
          <Link to="/auth">
            <Button size="lg" className="mt-8 gap-2 px-8">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 font-semibold text-sm mb-3">
                <Zap className="h-5 w-5 text-primary" />
                NoirOps
              </div>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                AI-powered content intelligence platform for creators and
                entrepreneurs. Discover, create, and grow.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h4 className="text-xs font-semibold mb-3">Product</h4>
                <div className="space-y-2">
                  <Link to="/auth" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Get Started
                  </Link>
                  <a href="#features" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </a>
                  <a href="#faq" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                    FAQ
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold mb-3">Company</h4>
                <div className="space-y-2">
                  <Link to="/about" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                    About
                  </Link>
                  <Link to="/contact" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold mb-3">Legal</h4>
                <div className="space-y-2">
                  <Link to="/privacy" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                  <Link to="/terms" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <Separator className="my-6" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-muted-foreground">
              © {new Date().getFullYear()} NoirOps. All rights reserved.
            </p>
            <p className="text-[10px] text-muted-foreground">
              Built with AI · Powered by creators
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
