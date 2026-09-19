import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Zap, ArrowRight, Target, Users, Lightbulb } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-sm">
            <Zap className="h-5 w-5 text-primary" />
            NoirOps
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="gap-1">Get Started <ArrowRight className="h-3.5 w-3.5" /></Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">About NoirOps</h1>
        
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p className="text-lg">
            NoirOps is an AI-powered content intelligence platform built for creators, 
            entrepreneurs, and content teams who want to grow strategically — not randomly.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">Why we built this</h2>
          <p>
            Most creators juggle 5–10 separate tools: one for trend research, another for 
            content creation, a third for scheduling, and yet another for analytics. NoirOps 
            combines all of these into a single, intelligent system that actually understands 
            your content strategy.
          </p>
          <p>
            We built NoirOps because we believe content creation should be a system, not 
            a scramble. You should be able to discover what's trending, research the context, 
            generate platform-optimized content, schedule it, and analyze performance — 
            all from one place.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">Who it's for</h2>
          <div className="grid md:grid-cols-3 gap-4 py-4">
            {[
              { icon: Target, title: "Content Creators", text: "Find your next post idea, generate it, and track what works." },
              { icon: Users, title: "Entrepreneurs", text: "Build authority and promote your business without burning hours." },
              { icon: Lightbulb, title: "Small Teams", text: "Get agency-level content strategy without the agency budget." },
            ].map((item) => (
              <Card key={item.title} className="border-border/50">
                <CardContent className="p-4 text-center">
                  <item.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <h2 className="text-xl font-semibold text-foreground pt-4">Our vision</h2>
          <p>
            NoirOps aims to become the central nervous system for content strategy. 
            Not just an AI caption generator, but a platform that investigates what's 
            happening online, identifies opportunities, and helps you execute on them — 
            so you can focus on what matters most: building and growing.
          </p>
          <p>
            We're in beta, and we're building this in public. Every feature is free during 
            this phase. We're not collecting payment information. We're focused entirely 
            on making NoirOps genuinely useful.
          </p>
        </div>

        <Separator className="my-12" />

        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Ready to get started?</h2>
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              Try NoirOps Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>

      <footer className="border-t border-border/50 mt-20">
        <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Zap className="h-5 w-5 text-primary" />
            NoirOps
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
