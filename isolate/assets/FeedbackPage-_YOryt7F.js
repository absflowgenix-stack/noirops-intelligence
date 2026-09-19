import { u as useAuth, J as useMutation, D as api, z as useQuery, r as reactExports, j as jsxRuntimeExports, d as Card, e as CardContent, w as CircleCheckBig, l as CardHeader, m as CardTitle, ar as Bug, v as Lightbulb, as as MessageSquare, at as Star, a as Button, au as Send, B as Badge, x as toast } from './index-CFd9FS6K.js';
import { T as Textarea } from './textarea-3HcsmmLW.js';
import { L as Label } from './label-9FxPhtYl.js';

const CATEGORIES = [
  { value: "bug", label: "Bug Report", icon: Bug, color: "text-red-500" },
  { value: "feature", label: "Feature Request", icon: Lightbulb, color: "text-amber-500" },
  { value: "general", label: "General Feedback", icon: MessageSquare, color: "text-blue-500" },
  { value: "experience", label: "Experience Rating", icon: Star, color: "text-purple-500" }
];
function FeedbackPage() {
  const { user } = useAuth();
  const userId = user?._id ?? "";
  const submitFeedback = useMutation(api.feedback.submit);
  const logEvent = useMutation(api.analytics.logEvent);
  const myFeedback = useQuery(
    api.feedback.listAll,
    userId ? { userId } : "skip"
  );
  const [category, setCategory] = reactExports.useState("general");
  const [message, setMessage] = reactExports.useState("");
  const [rating, setRating] = reactExports.useState(0);
  const [hoverRating, setHoverRating] = reactExports.useState(0);
  const [submitted, setSubmitted] = reactExports.useState(false);
  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please enter your feedback");
      return;
    }
    if (message.length > 2e3) {
      toast.error("Feedback must be 2000 characters or fewer");
      return;
    }
    try {
      await submitFeedback({
        userId: userId || void 0,
        category,
        message: message.trim(),
        rating: category === "experience" ? rating : void 0,
        page: window.location.pathname
      });
      if (userId) {
        logEvent({
          userId,
          eventType: "feedback",
          metadata: { category }
        });
      }
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setMessage("");
        setRating(0);
        setCategory("general");
      }, 3e3);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-3xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Feedback" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Help us improve NoirOps. Your feedback is invaluable during beta." })
    ] }),
    submitted ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "text-center py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-12 w-12 text-emerald-500 mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Thank you!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Your feedback has been submitted successfully." })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Submit Feedback" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2", children: CATEGORIES.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setCategory(cat.value),
              className: `
                      flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all
                      ${category === cat.value ? "border-primary bg-primary/5" : "border-border/50 hover:border-border hover:bg-muted/50"}
                    `,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(cat.icon, { className: `h-4 w-4 ${cat.color}` }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium", children: cat.label })
              ]
            },
            cat.value
          )) })
        ] }),
        category === "experience" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Your Rating" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onMouseEnter: () => setHoverRating(star),
                onMouseLeave: () => setHoverRating(0),
                onClick: () => setRating(star),
                className: "p-0.5",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Star,
                  {
                    className: `h-6 w-6 transition-colors ${star <= (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`
                  }
                )
              },
              star
            )),
            rating > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground ml-2 self-center", children: [
              rating,
              "/5"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Your Feedback *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              placeholder: category === "bug" ? "Describe the bug, including steps to reproduce..." : category === "feature" ? "Describe the feature you'd like to see..." : "Share your thoughts, suggestions, or any other feedback...",
              value: message,
              onChange: (e) => setMessage(e.target.value),
              rows: 6
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Be specific and constructive" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "span",
              {
                className: message.length > 2e3 ? "text-destructive" : "",
                children: [
                  message.length,
                  "/2000"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: handleSubmit,
            disabled: !message.trim() || message.length > 2e3,
            className: "gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }),
              " Submit Feedback"
            ]
          }
        )
      ] })
    ] }),
    myFeedback && myFeedback.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Your Previous Feedback" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: myFeedback.map((fb) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "rounded-md border border-border/50 p-3",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px]", children: CATEGORIES.find((c) => c.value === fb.category)?.label || fb.category }),
              fb.rating && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-amber-500", children: [
                "★".repeat(fb.rating),
                "☆".repeat(5 - fb.rating)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground ml-auto", children: new Date(fb._creationTime).toLocaleDateString() })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground whitespace-pre-wrap", children: fb.message })
          ]
        },
        fb._id
      )) }) })
    ] })
  ] });
}

export { FeedbackPage as default };
