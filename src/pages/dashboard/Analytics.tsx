import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  FileText,
  Sparkles,
  Save,
  FileEdit,
  CalendarDays,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface UserStats {
  totalEvents: number;
  last7Days: number;
  last30Days: number;
  byType: Record<string, number>;
  dailyActivity: { date: string; count: number }[];
  generations: number;
  saves: number;
  edits: number;
  calendarItems: number;
}

interface ActivityEvent {
  _id: string;
  _creationTime: number;
  eventType: string;
  metadata?: unknown;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            {loading ? (
              <div className="h-7 w-12 mt-1 rounded bg-muted animate-pulse" />
            ) : (
              <p className="text-2xl font-bold mt-0.5">{value}</p>
            )}
          </div>
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const { user } = useAuth();
  const userId = user?._id ?? "";

  const stats = useQuery(
    api.analytics.getUserStats,
    userId ? { userId } : "skip"
  ) as UserStats | undefined;
  const contentStats = useQuery(
    api.content.stats,
    userId ? { userId } : "skip"
  ) as {
    total: number;
    drafts: number;
    scheduled: number;
    published: number;
    failed: number;
    last30Days: number;
    platforms: Record<string, number>;
  } | undefined;
  const recentActivity = useQuery(
    api.analytics.getRecentActivity,
    userId ? { userId, limit: 20 } : "skip"
  ) as ActivityEvent[] | undefined;

  const chartData: { date: string; count: number }[] =
    stats?.dailyActivity || [];

  const eventTypeLabels: Record<string, string> = {
    generation: "Content Generated",
    save: "Content Saved",
    edit: "Content Edited",
    calendar_item: "Calendar Event",
    feedback: "Feedback",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track your content activity and usage patterns.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Events"
          value={stats?.totalEvents ?? 0}
          icon={BarChart3}
          color="bg-primary/10 text-primary"
          loading={!stats}
        />
        <StatCard
          label="Generations"
          value={stats?.generations ?? 0}
          icon={Sparkles}
          color="bg-purple-500/10 text-purple-500"
          loading={!stats}
        />
        <StatCard
          label="Saves"
          value={stats?.saves ?? 0}
          icon={Save}
          color="bg-emerald-500/10 text-emerald-500"
          loading={!stats}
        />
        <StatCard
          label="Last 7 Days"
          value={stats?.last7Days ?? 0}
          icon={TrendingUp}
          color="bg-blue-500/10 text-blue-500"
          loading={!stats}
        />
      </div>

      {/* Activity Chart */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Daily Activity (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!stats ? (
            <div className="h-[200px] flex items-center justify-center">
              <div className="animate-pulse text-sm text-muted-foreground">
                Loading chart...
              </div>
            </div>
          ) : chartData.every((d) => d.count === 0) ? (
            <div className="text-center py-12">
              <BarChart3 className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No activity yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Start creating content to see your activity here
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Content Breakdown */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Content Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!contentStats ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 rounded bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  {
                    label: "Drafts",
                    count: contentStats.drafts,
                    color: "bg-yellow-500",
                  },
                  {
                    label: "Scheduled",
                    count: contentStats.scheduled,
                    color: "bg-blue-500",
                  },
                  {
                    label: "Published",
                    count: contentStats.published,
                    color: "bg-emerald-500",
                  },
                  {
                    label: "Failed",
                    count: contentStats.failed,
                    color: "bg-red-500",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${item.color}`} />
                    <span className="text-sm text-muted-foreground flex-1">
                      {item.label}
                    </span>
                    <span className="text-sm font-medium">{item.count}</span>
                    {contentStats.total > 0 && (
                      <span className="text-[10px] text-muted-foreground w-10 text-right">
                        {Math.round((item.count / contentStats.total) * 100)}%
                      </span>
                    )}
                  </div>
                ))}
                {contentStats.total === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No content created yet
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Type Breakdown */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Activity by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!stats ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 rounded bg-muted animate-pulse" />
                ))}
              </div>
            ) : Object.keys(stats.byType).length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No activity data</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.byType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary/60" />
                      <span className="text-sm text-muted-foreground flex-1">
                        {eventTypeLabels[type] || type.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {recentActivity && recentActivity.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivity.map((event) => (
                <div
                  key={event._id}
                  className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                    <span className="text-xs font-medium">
                      {eventTypeLabels[event.eventType] ||
                        event.eventType.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(event._creationTime).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}