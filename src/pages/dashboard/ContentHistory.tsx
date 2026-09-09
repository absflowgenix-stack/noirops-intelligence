import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Copy,
  Trash2,
  RefreshCw,
  FileEdit,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  published: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
};

function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function ContentHistory() {
  const { user } = useAuth();
  const userId = user?._id ?? "";

  const content = useQuery(
    api.content.list,
    userId ? { userId, limit: 100 } : "skip"
  );
  const deleteContent = useMutation(api.content.remove);
  const duplicateContent = useMutation(api.content.duplicate);
  const updateContent = useMutation(api.content.update);
  const logEvent = useMutation(api.analytics.logEvent);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [viewItem, setViewItem] = useState<Doc<"content"> | null>(null);
  const [editingBody, setEditingBody] = useState("");

  const filtered = useMemo(() => {
    if (!content) return [];
    return content.filter((item) => {
      const matchesSearch =
        !search ||
        item.body.toLowerCase().includes(search.toLowerCase()) ||
        (item.title && item.title.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchesPlatform =
        platformFilter === "all" ||
        (item.platform || "").toLowerCase() === platformFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesPlatform;
    });
  }, [content, search, statusFilter, platformFilter]);

  const platforms = useMemo(() => {
    if (!content) return [];
    const set = new Set(content.map((c) => c.platform).filter(Boolean));
    return Array.from(set) as string[];
  }, [content]);

  const handleDelete = async (id: string) => {
    try {
      await deleteContent({ id: id as any });
      toast.success("Content deleted");
      setViewItem(null);
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateContent({ id: id as any });
      toast.success("Content duplicated");
    } catch {
      toast.error("Failed to duplicate");
    }
  };

  const handleSaveEdit = async () => {
    if (!viewItem) return;
    try {
      await updateContent({
        id: viewItem._id,
        body: editingBody,
      });
      if (userId) {
        logEvent({
          userId,
          eventType: "edit",
          metadata: { contentId: viewItem._id },
        });
      }
      toast.success("Content updated");
      setViewItem({ ...viewItem, body: editingBody });
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Content History</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Browse, search, and manage your generated content.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {platforms.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content list */}
      {!content ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="border-border/50 animate-pulse">
              <CardContent className="p-4 h-20" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Sparkles className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {search || statusFilter !== "all" || platformFilter !== "all"
              ? "No content matches your filters"
              : "No content yet. Start creating!"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <Card
              key={item._id}
              className="border-border/50 hover:border-border transition-colors cursor-pointer"
              onClick={() => {
                setViewItem(item);
                setEditingBody(item.body);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium truncate">
                        {item.title || "Untitled"}
                      </h3>
                      {item.platform && (
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {item.platform}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-[10px] shrink-0 ${STATUS_COLORS[item.status]}`}
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.body}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(item._creationTime)}
                      </span>
                      {item.contentType && <span>{item.contentType}</span>}
                      {item.tone && <span>{item.tone}</span>}
                    </div>
                  </div>
                  <div
                    className="flex gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        navigator.clipboard.writeText(item.body);
                        toast.success("Copied");
                      }}
                      title="Copy"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDuplicate(item._id)}
                      title="Duplicate"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleDelete(item._id)}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View/Edit Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewItem?.title || "Untitled Content"}</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {viewItem.platform && (
                  <Badge variant="secondary">{viewItem.platform}</Badge>
                )}
                <Badge
                  variant="outline"
                  className={STATUS_COLORS[viewItem.status]}
                >
                  {viewItem.status}
                </Badge>
                {viewItem.contentType && (
                  <Badge variant="secondary">{viewItem.contentType}</Badge>
                )}
                {viewItem.tone && (
                  <Badge variant="secondary">{viewItem.tone}</Badge>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Content
                </label>
                <textarea
                  value={editingBody}
                  onChange={(e) => setEditingBody(e.target.value)}
                  className="w-full min-h-[200px] rounded-md border border-border bg-muted/50 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-y"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (viewItem) {
                  navigator.clipboard.writeText(viewItem.body);
                  toast.success("Copied to clipboard");
                }
              }}
              className="gap-1"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (viewItem) handleDuplicate(viewItem._id);
              }}
              className="gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Duplicate
            </Button>
            {editingBody !== viewItem?.body && (
              <Button onClick={handleSaveEdit} className="gap-1">
                <FileEdit className="h-3.5 w-3.5" /> Save Changes
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={() => {
                if (viewItem) handleDelete(viewItem._id);
              }}
              className="gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
