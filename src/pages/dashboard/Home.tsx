import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles,
  FileText,
  Lightbulb,
  CalendarDays,
  Repeat,
  BarChart3,
  Video,
  ArrowRight,
  TrendingUp,
  Clock,
  FileEdit,
} from "lucide-react";
import { Link } from "react-router";

const QUICK_ACTIONS = [
  { label: "Create Post", icon: Sparkles, href: "/dashboard/create", color: "text-primary" },
  { label: "Generate Ideas", icon: Lightbulb, href: "/dashboard/create?type=ideas", color: "text-amber-500" },
  { label: "Content Plan", icon: CalendarDays, href: "/dashboard/create?type=calendar", color: "text-emerald-500" },
  { label: "Repurpose Content", icon: Repeat, href: "/dashboard/create?type=repurpose", color: "text-blue-500" },
  { label: "Analyze Video", icon: Video, href: "/dashboard/create?type=analyze", color: "text-purple-500" },
  { label: "Intelligence Center", icon: BarChart3, href: "/dashboard/analytics", color: "text-rose-500" },
];

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  loading?: boolean;
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            {loading ? (
              <Skeleton className="h-7 w-12 mt-1" />
            ) : (
              <p className="text-2xl font-bold mt-0.5">{value}</p>
            )}
          </div>
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatRelativeTime(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  published: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
};

interface ContentStats {
  total: number;
  drafts: number;
  scheduled: number;
  published: number;
  failed: number;
  last30Days: number;
  platforms: Record<string, number>;
}

interface ActivityEvent {
  _id: string;
  _creationTime: number;
  eventType: string;
  metadata?: unknown;
}

export default function DashboardHome() {
  const { user } = useAuth();
  const userId = user?._id ?? "";

  const stats = useQuery(
    api.content.stats,
    userId ? { userId } : "skip"
  ) as ContentStats | undefined;
  const recentContent = useQuery(
    api.content.list,
    userId ? { userId, limit: 5 } : "skip"
  ) as Doc<"content">[] | undefined;
  const recentActivity = useQuery(
    api.analytics.getRecentActivity,
    userId ? { userId, limit: 8 } : "skip"
  ) as ActivityEvent[] | undefined;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}
          {user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here's what's happening with your content today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Content"
          value={stats?.total ?? 0}
          icon={FileText}
          loading={!stats}
        />
        <StatCard
          label="Drafts"
          value={stats?.drafts ?? 0}
          icon={FileEdit}
          loading={!stats}
        />
        <StatCard
          label="Published"
          value={stats?.published ?? 0}
          icon={TrendingUp}
          loading={!stats}
        />
        <StatCard
          label="This Month"
          value={stats?.last30Days ?? 0}
          icon={CalendarDays}
          loading={!stats}
        />
      </div>

      {/* Quick Actions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link key={action.href} to={action.href}>
                <div className="flex flex-col items-center gap-2 rounded-lg border border-border/50 p-3 text-center hover:bg-muted/50 transition-colors cursor-pointer group">
                  <action.icon
                    className={`h-5 w-5 ${action.color} group-hover:scale-110 transition-transform`}
                  />
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {action.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Content */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Recent Content</CardTitle>
            <Link to="/dashboard/history">
              <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!recentContent ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentContent.length === 0 ? (
              <div className="text-center py-8">
                <Sparkles className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No content yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Create your first piece of content to get started
                </p>
                <Link to="/dashboard/create">
                  <Button size="sm" className="mt-3 gap-1">
                    <Sparkles className="h-3 w-3" /> Create Content
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentContent.map((item) => (
                  <Link
                    key={item._id}
                    to="/dashboard/history"
                    className="flex items-center justify-between rounded-md border border-border/50 p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {item.title || "Untitled"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.body.slice(0, 80)}
                        {item.body.length > 80 ? "..." : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      {item.platform && (
                        <Badge variant="outline" className="text-[10px]">
                          {item.platform}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${STATUS_COLORS[item.status]}`}
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {!recentActivity ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No activity yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Your content activity will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((event) => (
                  <div
                    key={event._id}
                    className="flex items-center gap-3 rounded-md border border-border/50 p-3"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary/60 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium">
                        {event.eventType.replace(/_/g, " ")}
                      </p>
                      {typeof event.metadata === "object" &&
                      event.metadata !== null ? (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {(event.metadata as Record<string, string>).detail ||
                            ""}
                        </p>
                      ) : null}
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatRelativeTime(event._creationTime)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}