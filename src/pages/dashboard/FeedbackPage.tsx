import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Bug,
  Lightbulb,
  MessageSquare,
  Star,
  Send,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "bug", label: "Bug Report", icon: Bug, color: "text-red-500" },
  { value: "feature", label: "Feature Request", icon: Lightbulb, color: "text-amber-500" },
  { value: "general", label: "General Feedback", icon: MessageSquare, color: "text-blue-500" },
  { value: "experience", label: "Experience Rating", icon: Star, color: "text-purple-500" },
] as const;

export default function FeedbackPage() {
  const { user } = useAuth();
  const userId = user?._id ?? "";

  const submitFeedback = useMutation(api.feedback.submit);
  const logEvent = useMutation(api.analytics.logEvent);
  const myFeedback = useQuery(
    api.feedback.listAll,
    userId ? { userId } : "skip"
  );

  const [category, setCategory] = useState<string>("general");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please enter your feedback");
      return;
    }
    if (message.length > 2000) {
      toast.error("Feedback must be 2000 characters or fewer");
      return;
    }

    try {
      await submitFeedback({
        userId: userId || undefined,
        category: category as "bug" | "feature" | "general" | "experience",
        message: message.trim(),
        rating: category === "experience" ? rating : undefined,
        page: window.location.pathname,
      });
      if (userId) {
        logEvent({
          userId,
          eventType: "feedback",
          metadata: { category },
        });
      }
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setMessage("");
        setRating(0);
        setCategory("general");
      }, 3000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Feedback</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Help us improve NoirOps. Your feedback is invaluable during beta.
        </p>
      </div>

      {submitted ? (
        <Card className="border-border/50">
          <CardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold">Thank you!</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Your feedback has been submitted successfully.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Submit Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`
                      flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all
                      ${
                        category === cat.value
                          ? "border-primary bg-primary/5"
                          : "border-border/50 hover:border-border hover:bg-muted/50"
                      }
                    `}
                  >
                    <cat.icon className={`h-4 w-4 ${cat.color}`} />
                    <span className="text-xs font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {category === "experience" && (
              <div className="space-y-2">
                <Label>Your Rating</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-0.5"
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="text-sm text-muted-foreground ml-2 self-center">
                      {rating}/5
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Your Feedback *</Label>
              <Textarea
                placeholder={
                  category === "bug"
                    ? "Describe the bug, including steps to reproduce..."
                    : category === "feature"
                      ? "Describe the feature you'd like to see..."
                      : "Share your thoughts, suggestions, or any other feedback..."
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Be specific and constructive</span>
                <span
                  className={message.length > 2000 ? "text-destructive" : ""}
                >
                  {message.length}/2000
                </span>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!message.trim() || message.length > 2000}
              className="gap-2"
            >
              <Send className="h-4 w-4" /> Submit Feedback
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Previous Feedback */}
      {myFeedback && myFeedback.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Your Previous Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {myFeedback.map((fb) => (
                <div
                  key={fb._id}
                  className="rounded-md border border-border/50 p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px]">
                      {CATEGORIES.find((c) => c.value === fb.category)?.label ||
                        fb.category}
                    </Badge>
                    {fb.rating && (
                      <span className="text-[10px] text-amber-500">
                        {"★".repeat(fb.rating)}
                        {"☆".repeat(5 - fb.rating)}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {new Date(fb._creationTime).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {fb.message}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
