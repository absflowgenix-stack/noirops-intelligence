import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Zap, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-sm">
            <Zap className="h-5 w-5 text-primary" />
            NoirOps
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-primary/20 mb-4">404</h1>
          <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
