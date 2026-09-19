import { u as useAuth, I as useAction, D as api, J as useMutation, r as reactExports, j as jsxRuntimeExports, S as Sparkles, v as Lightbulb, C as CalendarDays, R as Repeat, d as Card, l as CardHeader, m as CardTitle, e as CardContent, a as Button, p as LoaderCircle, V as Video, K as RefreshCw, N as Copy, O as Save, B as Badge, x as toast } from './index-CFd9FS6K.js';
import { I as Input } from './input-BZ9Z1zrO.js';
import { T as Textarea } from './textarea-3HcsmmLW.js';
import { L as Label } from './label-9FxPhtYl.js';
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from './select-CXMO6mO6.js';
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from './tabs-g8H7D-Vf.js';
import './index-dpUk1xYW.js';
import './index-ZHJi3Sdm.js';

const PLATFORMS = [
  "Instagram",
  "Twitter",
  "LinkedIn",
  "TikTok",
  "YouTube",
  "Facebook"
];
const TONES = [
  "Professional",
  "Casual",
  "Witty",
  "Inspirational",
  "Educational",
  "Conversational",
  "Bold",
  "Friendly"
];
const CONTENT_TYPES = [
  "Social Post",
  "Caption",
  "Hook",
  "Thread",
  "Content Idea",
  "Promotional",
  "Educational",
  "Engagement"
];
function CreateContent() {
  const { user } = useAuth();
  const generateContent = useAction(api.ai.generateContent);
  const generateMultipleIdeas = useAction(api.ai.generateMultipleIdeas);
  const generateCalendar = useAction(api.ai.generateCalendar);
  const analyzeContent = useAction(api.ai.analyzeContent);
  const repurposeContent = useAction(api.ai.repurposeContent);
  const saveContent = useMutation(api.content.create);
  const logEvent = useMutation(api.analytics.logEvent);
  const [activeTab, setActiveTab] = reactExports.useState("generate");
  const [loading, setLoading] = reactExports.useState(false);
  const [result, setResult] = reactExports.useState("");
  const [ideasCount, setIdeasCount] = reactExports.useState(5);
  const [topic, setTopic] = reactExports.useState("");
  const [platform, setPlatform] = reactExports.useState("");
  const [tone, setTone] = reactExports.useState("");
  const [audience, setAudience] = reactExports.useState("");
  const [goal, setGoal] = reactExports.useState("");
  const [contentType, setContentType] = reactExports.useState("");
  const [context, setContext] = reactExports.useState("");
  const [analyzeText, setAnalyzeText] = reactExports.useState("");
  const [repurposeText, setRepurposeText] = reactExports.useState("");
  const [repurposePlatform, setRepurposePlatform] = reactExports.useState("");
  const [calendarDays, setCalendarDays] = reactExports.useState(7);
  const userId = user?._id ?? "";
  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const res = await generateContent({
        topic,
        platform: platform || void 0,
        tone: tone || void 0,
        audience: audience || void 0,
        goal: goal || void 0,
        contentType: contentType || void 0,
        additionalContext: context || void 0
      });
      setResult(res.content);
      if (userId) {
        logEvent({
          userId,
          eventType: "generation",
          metadata: { type: "content", platform: platform || "general" }
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };
  const handleGenerateIdeas = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const res = await generateMultipleIdeas({
        topic,
        platform: platform || void 0,
        count: ideasCount,
        audience: audience || void 0,
        tone: tone || void 0
      });
      setResult(res.ideas);
      if (userId) {
        logEvent({
          userId,
          eventType: "generation",
          metadata: { type: "ideas", platform: platform || "general" }
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };
  const handleGenerateCalendar = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const res = await generateCalendar({
        topic,
        platform: platform || void 0,
        days: calendarDays,
        audience: audience || void 0,
        tone: tone || void 0
      });
      setResult(res.calendar);
      if (userId) {
        logEvent({
          userId,
          eventType: "generation",
          metadata: { type: "calendar", days: calendarDays }
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };
  const handleAnalyze = async () => {
    if (!analyzeText.trim()) {
      toast.error("Please enter content to analyze");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const res = await analyzeContent({
        content: analyzeText,
        platform: platform || void 0,
        goal: goal || void 0
      });
      setResult(res.analysis);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };
  const handleRepurpose = async () => {
    if (!repurposeText.trim() || !repurposePlatform) {
      toast.error("Please enter content and select a target platform");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const res = await repurposeContent({
        content: repurposeText,
        targetPlatform: repurposePlatform,
        audience: audience || void 0,
        tone: tone || void 0
      });
      setResult(res.content);
      if (userId) {
        logEvent({
          userId,
          eventType: "generation",
          metadata: { type: "repurpose", target: repurposePlatform }
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Repurpose failed");
    } finally {
      setLoading(false);
    }
  };
  const handleSave = async () => {
    if (!result.trim() || !userId) return;
    try {
      await saveContent({
        userId,
        title: topic || "Generated Content",
        body: result,
        platform: platform || void 0,
        contentType: contentType || void 0,
        tone: tone || void 0,
        audience: audience || void 0,
        goal: goal || void 0,
        status: "draft"
      });
      logEvent({
        userId,
        eventType: "save",
        metadata: { from: activeTab }
      });
      toast.success("Content saved as draft");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-5xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Create Content" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Use AI to generate, analyze, and repurpose content across platforms." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "generate", className: "gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5" }),
          " Generate"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "ideas", className: "gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-3.5 w-3.5" }),
          " Ideas"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "calendar", className: "gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-3.5 w-3.5" }),
          " Calendar"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "repurpose", className: "gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Repeat, { className: "h-3.5 w-3.5" }),
          " Repurpose"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "generate", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Content Parameters" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Topic *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g., Productivity tips for solopreneurs",
                value: topic,
                onChange: (e) => setTopic(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Platform" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: platform, onValueChange: setPlatform, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Any platform" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PLATFORMS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tone" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: tone, onValueChange: setTone, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Any tone" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TONES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Content Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: contentType, onValueChange: setContentType, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Any type" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CONTENT_TYPES.map((ct) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: ct, children: ct }, ct)) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Target Audience" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "e.g., Young professionals, 25-35",
                  value: audience,
                  onChange: (e) => setAudience(e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Goal" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "e.g., Drive engagement, educate",
                  value: goal,
                  onChange: (e) => setGoal(e.target.value)
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Additional Context" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                placeholder: "Any specific instructions or context for the AI...",
                value: context,
                onChange: (e) => setContext(e.target.value),
                rows: 3
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: handleGenerate,
              disabled: loading || !topic.trim(),
              className: "gap-2",
              children: [
                loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
                "Generate Content"
              ]
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "ideas", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Content Ideas" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Topic *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g., Sustainable fashion, AI tools, Fitness",
                value: topic,
                onChange: (e) => setTopic(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Platform" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: platform, onValueChange: setPlatform, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Any platform" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PLATFORMS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tone" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: tone, onValueChange: setTone, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Any tone" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TONES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number of Ideas" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: String(ideasCount),
                  onValueChange: (v) => setIdeasCount(Number(v)),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: [3, 5, 7, 10].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(n), children: [
                      n,
                      " ideas"
                    ] }, n)) })
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Audience" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g., Tech entrepreneurs, Fitness enthusiasts",
                value: audience,
                onChange: (e) => setAudience(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: handleGenerateIdeas,
              disabled: loading || !topic.trim(),
              className: "gap-2",
              children: [
                loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-4 w-4" }),
                "Generate Ideas"
              ]
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "calendar", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Content Calendar" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Topic / Theme *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g., Launch week for new product",
                value: topic,
                onChange: (e) => setTopic(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Platform" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: platform, onValueChange: setPlatform, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Any platform" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PLATFORMS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Duration" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: String(calendarDays),
                  onValueChange: (v) => setCalendarDays(Number(v)),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: [3, 5, 7, 14, 30].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(n), children: [
                      n,
                      " days"
                    ] }, n)) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Audience" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "e.g., Small business owners",
                  value: audience,
                  onChange: (e) => setAudience(e.target.value)
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: handleGenerateCalendar,
              disabled: loading || !topic.trim(),
              className: "gap-2",
              children: [
                loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-4 w-4" }),
                "Generate Calendar"
              ]
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "repurpose", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Repurpose Content" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Original Content *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  placeholder: "Paste your content here to repurpose it for another platform...",
                  value: repurposeText,
                  onChange: (e) => setRepurposeText(e.target.value),
                  rows: 5
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Target Platform *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: repurposePlatform,
                    onValueChange: setRepurposePlatform,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select platform" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PLATFORMS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p)) })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Audience" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    placeholder: "e.g., Marketing professionals",
                    value: audience,
                    onChange: (e) => setAudience(e.target.value)
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                onClick: handleRepurpose,
                disabled: loading || !repurposeText.trim() || !repurposePlatform,
                className: "gap-2",
                children: [
                  loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Repeat, { className: "h-4 w-4" }),
                  "Repurpose Content"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Analyze Content" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Content to Analyze *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  placeholder: "Paste content to get AI feedback...",
                  value: analyzeText,
                  onChange: (e) => setAnalyzeText(e.target.value),
                  rows: 4
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                onClick: handleAnalyze,
                disabled: loading || !analyzeText.trim(),
                className: "gap-2",
                variant: "outline",
                children: [
                  loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "h-4 w-4" }),
                  "Analyze"
                ]
              }
            )
          ] })
        ] })
      ] })
    ] }),
    result && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Result" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => setResult(""),
              className: "gap-1",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3 w-3" }),
                " Clear"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handleCopy, className: "gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3 w-3" }),
            " Copy"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handleSave, className: "gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-3 w-3" }),
            " Save Draft"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap text-sm leading-relaxed rounded-md bg-muted/50 p-4 border border-border/50", children: result }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-3 flex-wrap", children: [
          platform && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: platform }),
          tone && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: tone }),
          contentType && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: contentType })
        ] })
      ] })
    ] })
  ] });
}

export { CreateContent as default };
