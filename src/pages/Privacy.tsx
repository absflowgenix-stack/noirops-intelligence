import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
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
        <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Introduction</h2>
            <p>
              NoirOps ("we," "our," or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you use our platform.
            </p>
            <p>
              By using NoirOps, you agree to the collection and use of information 
              in accordance with this policy. If you do not agree, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Information We Collect</h2>
            <p>We collect information you provide directly:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Account information (email address, name)</li>
              <li>Content you create, generate, or store on the platform</li>
              <li>Brand voice configurations</li>
              <li>Calendar events and scheduling data</li>
              <li>Feedback and support messages</li>
              <li>Analytics events related to your platform usage</li>
            </ul>
            <p className="mt-3">
              We also collect certain information automatically, including usage data, 
              device information, and cookies necessary for the service to function.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide and maintain the NoirOps service</li>
              <li>Generate AI-powered content based on your inputs and brand voice</li>
              <li>Track your content activity and provide analytics</li>
              <li>Improve and develop new features</li>
              <li>Communicate with you about the service</li>
              <li>Ensure the security and integrity of the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. AI-Generated Content</h2>
            <p>
              When you use NoirOps' AI features, your inputs (topics, brand voice, preferences) 
              are sent to our AI service providers for processing. Your generated content is stored 
              in your account and is not shared with other users. We do not use your content to 
              train AI models.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Data Sharing</h2>
            <p>We do not sell your personal information. We may share information with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Service providers who assist in operating the platform (hosting, AI services)</li>
              <li>When required by law or to protect our rights</li>
              <li>With your explicit consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data. However, 
              no method of transmission over the Internet is 100% secure, and we cannot 
              guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Export your content</li>
              <li>Opt out of non-essential data collection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. When you delete 
              your account, we will remove your personal data within 30 days, except where 
              required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">9. Cookies</h2>
            <p>
              NoirOps uses essential cookies to maintain your session and authenticate your 
              account. We do not use third-party tracking cookies or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">10. Children's Privacy</h2>
            <p>
              NoirOps is not intended for users under the age of 16. We do not knowingly 
              collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you 
              of any material changes by posting the new policy on this page and updating 
              the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">12. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@noiroops.com" className="text-primary hover:underline">
                privacy@noiroops.com
              </a>
              {" "}or through our{" "}
              <Link to="/contact" className="text-primary hover:underline">contact page</Link>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border/50 mt-20">
        <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Zap className="h-5 w-5 text-primary" />
            NoirOps
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
