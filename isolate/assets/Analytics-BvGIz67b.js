import { u as useAuth, z as useQuery, D as api, j as jsxRuntimeExports, c as ChartColumn, S as Sparkles, O as Save, T as TrendingUp, d as Card, l as CardHeader, m as CardTitle, e as CardContent, H as Clock } from './index-CFd9FS6K.js';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  loading
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: label }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-12 mt-1 rounded bg-muted animate-pulse" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold mt-0.5", children: value })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-9 w-9 rounded-lg flex items-center justify-center ${color}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) })
  ] }) }) });
}
function Analytics() {
  const { user } = useAuth();
  const userId = user?._id ?? "";
  const stats = useQuery(
    api.analytics.getUserStats,
    userId ? { userId } : "skip"
  );
  const contentStats = useQuery(
    api.content.stats,
    userId ? { userId } : "skip"
  );
  const recentActivity = useQuery(
    api.analytics.getRecentActivity,
    userId ? { userId, limit: 20 } : "skip"
  );
  const chartData = stats?.dailyActivity || [];
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);
  const eventTypeLabels = {
    generation: "Content Generated",
    save: "Content Saved",
    edit: "Content Edited",
    calendar_item: "Calendar Event",
    feedback: "Feedback"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-6xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Analytics" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Track your content activity and usage patterns." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          label: "Total Events",
          value: stats?.totalEvents ?? 0,
          icon: ChartColumn,
          color: "bg-primary/10 text-primary",
          loading: !stats
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          label: "Generations",
          value: stats?.generations ?? 0,
          icon: Sparkles,
          color: "bg-purple-500/10 text-purple-500",
          loading: !stats
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          label: "Saves",
          value: stats?.saves ?? 0,
          icon: Save,
          color: "bg-emerald-500/10 text-emerald-500",
          loading: !stats
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          label: "Last 7 Days",
          value: stats?.last7Days ?? 0,
          icon: TrendingUp,
          color: "bg-blue-500/10 text-blue-500",
          loading: !stats
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Daily Activity (Last 7 Days)" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: !stats ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-[200px] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-pulse text-sm text-muted-foreground", children: "Loading chart..." }) }) : chartData.every((d) => d.count === 0) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-8 w-8 text-muted-foreground/30 mx-auto mb-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No activity yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/60 mt-1", children: "Start creating content to see your activity here" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end gap-1.5 h-[200px] pt-2", children: chartData.map((d) => {
        const barHeight = d.count === 0 ? 3 : Math.max(4, Math.round(d.count / maxCount * 120));
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex-1 flex flex-col items-center justify-end gap-1 min-w-0 h-full",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-muted-foreground tabular-nums", children: d.count }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "w-full max-w-[34px] rounded-t-[4px] bg-primary/70 hover:bg-primary transition-colors cursor-pointer",
                  style: { height: `${barHeight}px` },
                  title: `${d.date}: ${d.count} events`
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground pb-1", children: d.date.slice(5) })
            ]
          },
          d.date
        );
      }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Content Breakdown" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: !contentStats ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 rounded bg-muted animate-pulse" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          [
            {
              label: "Drafts",
              count: contentStats.drafts,
              color: "bg-yellow-500"
            },
            {
              label: "Scheduled",
              count: contentStats.scheduled,
              color: "bg-blue-500"
            },
            {
              label: "Published",
              count: contentStats.published,
              color: "bg-emerald-500"
            },
            {
              label: "Failed",
              count: contentStats.failed,
              color: "bg-red-500"
            }
          ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-2 w-2 rounded-full ${item.color}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground flex-1", children: item.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: item.count }),
            contentStats.total > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground w-10 text-right", children: [
              Math.round(item.count / contentStats.total * 100),
              "%"
            ] })
          ] }, item.label)),
          contentStats.total === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center py-4", children: "No content created yet" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Activity by Type" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: !stats ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 rounded bg-muted animate-pulse" }, i)) }) : Object.keys(stats.byType).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-8 w-8 text-muted-foreground/30 mx-auto mb-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No activity data" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: Object.entries(stats.byType).sort(([, a], [, b]) => b - a).map(([type, count]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-2 rounded-full bg-primary/60" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground flex-1", children: eventTypeLabels[type] || type.replace(/_/g, " ") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: count })
        ] }, type)) }) })
      ] })
    ] }),
    recentActivity && recentActivity.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Recent Activity" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: recentActivity.map((event) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex items-center justify-between rounded-md border border-border/50 px-3 py-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-primary/60" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium", children: eventTypeLabels[event.eventType] || event.eventType.replace(/_/g, " ") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: new Date(event._creationTime).toLocaleDateString() })
          ]
        },
        event._id
      )) }) })
    ] })
  ] });
}

export { Analytics as default };
