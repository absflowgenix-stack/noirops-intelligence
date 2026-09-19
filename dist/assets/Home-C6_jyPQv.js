import { j as jsxRuntimeExports, h as cn, u as useAuth, z as useQuery, D as api, F as FileText, E as FilePen, T as TrendingUp, C as CalendarDays, d as Card, l as CardHeader, m as CardTitle, e as CardContent, S as Sparkles, v as Lightbulb, R as Repeat, V as Video, c as ChartColumn, L as Link, a as Button, A as ArrowRight, B as Badge, H as Clock } from './index-CFd9FS6K.js';

function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "skeleton",
      className: cn("bg-accent animate-pulse rounded-md", className),
      ...props
    }
  );
}

const QUICK_ACTIONS = [
  { label: "Create Post", icon: Sparkles, href: "/dashboard/create", color: "text-primary" },
  { label: "Generate Ideas", icon: Lightbulb, href: "/dashboard/create?type=ideas", color: "text-amber-500" },
  { label: "Content Plan", icon: CalendarDays, href: "/dashboard/create?type=calendar", color: "text-emerald-500" },
  { label: "Repurpose Content", icon: Repeat, href: "/dashboard/create?type=repurpose", color: "text-blue-500" },
  { label: "Analyze Video", icon: Video, href: "/dashboard/create?type=analyze", color: "text-purple-500" },
  { label: "Intelligence Center", icon: ChartColumn, href: "/dashboard/analytics", color: "text-rose-500" }
];
function StatCard({
  label,
  value,
  icon: Icon,
  loading
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: label }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-7 w-12 mt-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold mt-0.5", children: value })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 text-primary" }) })
  ] }) }) });
}
function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 6e4);
  const hours = Math.floor(diff / 36e5);
  const days = Math.floor(diff / 864e5);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
const STATUS_COLORS = {
  draft: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  published: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20"
};
function DashboardHome() {
  const { user } = useAuth();
  const userId = user?._id ?? "";
  const stats = useQuery(
    api.content.stats,
    userId ? { userId } : "skip"
  );
  const recentContent = useQuery(
    api.content.list,
    userId ? { userId, limit: 5 } : "skip"
  );
  const recentActivity = useQuery(
    api.analytics.getRecentActivity,
    userId ? { userId, limit: 8 } : "skip"
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-6xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold tracking-tight", children: [
        "Good ",
        (/* @__PURE__ */ new Date()).getHours() < 12 ? "morning" : (/* @__PURE__ */ new Date()).getHours() < 18 ? "afternoon" : "evening",
        user?.name ? `, ${user.name}` : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Here's what's happening with your content today." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          label: "Total Content",
          value: stats?.total ?? 0,
          icon: FileText,
          loading: !stats
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          label: "Drafts",
          value: stats?.drafts ?? 0,
          icon: FilePen,
          loading: !stats
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          label: "Published",
          value: stats?.published ?? 0,
          icon: TrendingUp,
          loading: !stats
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          label: "This Month",
          value: stats?.last30Days ?? 0,
          icon: CalendarDays,
          loading: !stats
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Quick Actions" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3", children: QUICK_ACTIONS.map((action) => /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: action.href, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2 rounded-lg border border-border/50 p-3 text-center hover:bg-muted/50 transition-colors cursor-pointer group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          action.icon,
          {
            className: `h-5 w-5 ${action.color} group-hover:scale-110 transition-transform`
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors", children: action.label })
      ] }) }, action.href)) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Recent Content" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard/history", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", className: "gap-1 text-xs h-7", children: [
            "View all ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3 w-3" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: !recentContent ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, i)) }) : recentContent.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-8 w-8 text-muted-foreground/40 mx-auto mb-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No content yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/60 mt-1", children: "Create your first piece of content to get started" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard/create", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "mt-3 gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" }),
            " Create Content"
          ] }) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: recentContent.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/dashboard/history",
            className: "flex items-center justify-between rounded-md border border-border/50 p-3 hover:bg-muted/50 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium truncate", children: item.title || "Untitled" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground truncate", children: [
                  item.body.slice(0, 80),
                  item.body.length > 80 ? "..." : ""
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 ml-3 shrink-0", children: [
                item.platform && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px]", children: item.platform }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Badge,
                  {
                    variant: "outline",
                    className: `text-[10px] ${STATUS_COLORS[item.status]}`,
                    children: item.status
                  }
                )
              ] })
            ]
          },
          item._id
        )) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Recent Activity" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: !recentActivity ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }, i)) }) : recentActivity.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-8 w-8 text-muted-foreground/40 mx-auto mb-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No activity yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/60 mt-1", children: "Your content activity will appear here" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: recentActivity.map((event) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-3 rounded-md border border-border/50 p-3",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-2 rounded-full bg-primary/60 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium", children: event.eventType.replace(/_/g, " ") }),
                typeof event.metadata === "object" && event.metadata !== null ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground truncate", children: event.metadata.detail || "" }) : null
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground shrink-0", children: formatRelativeTime(event._creationTime) })
            ]
          },
          event._id
        )) }) })
      ] })
    ] })
  ] });
}

export { DashboardHome as default };
