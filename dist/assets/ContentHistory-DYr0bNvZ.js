import { u as useAuth, z as useQuery, D as api, J as useMutation, r as reactExports, j as jsxRuntimeExports, Q as Search, d as Card, e as CardContent, S as Sparkles, B as Badge, H as Clock, a as Button, N as Copy, x as toast, K as RefreshCw, W as Trash2, E as FilePen } from './index-DPL8dQnx.js';
import { I as Input } from './input-CKg58hNp.js';
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from './select-DGbgp2VJ.js';
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from './dialog-D4VmidN4.js';
import './index-f7nyhw1e.js';
import './index-BTqswTaL.js';

const STATUS_COLORS = {
  draft: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  published: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20"
};
function formatRelativeTime(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 6e4);
  const hours = Math.floor(diff / 36e5);
  const days = Math.floor(diff / 864e5);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
function ContentHistory() {
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
  const [search, setSearch] = reactExports.useState("");
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [platformFilter, setPlatformFilter] = reactExports.useState("all");
  const [viewItem, setViewItem] = reactExports.useState(null);
  const [editingBody, setEditingBody] = reactExports.useState("");
  const filtered = reactExports.useMemo(() => {
    if (!content) return [];
    return content.filter((item) => {
      const matchesSearch = !search || item.body.toLowerCase().includes(search.toLowerCase()) || item.title && item.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesPlatform = platformFilter === "all" || (item.platform || "").toLowerCase() === platformFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesPlatform;
    });
  }, [content, search, statusFilter, platformFilter]);
  const platforms = reactExports.useMemo(() => {
    if (!content) return [];
    const set = new Set(content.map((c) => c.platform).filter(Boolean));
    return Array.from(set);
  }, [content]);
  const handleDelete = async (id) => {
    try {
      await deleteContent({ id });
      toast.success("Content deleted");
      setViewItem(null);
    } catch {
      toast.error("Failed to delete");
    }
  };
  const handleDuplicate = async (id) => {
    try {
      await duplicateContent({ id });
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
        body: editingBody
      });
      if (userId) {
        logEvent({
          userId,
          eventType: "edit",
          metadata: { contentId: viewItem._id }
        });
      }
      toast.success("Content updated");
      setViewItem({ ...viewItem, body: editingBody });
    } catch {
      toast.error("Failed to update");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-5xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Content History" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Browse, search, and manage your generated content." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search content...",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            className: "pl-9"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[140px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All statuses" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Statuses" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "draft", children: "Draft" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "scheduled", children: "Scheduled" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "published", children: "Published" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "failed", children: "Failed" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: platformFilter, onValueChange: setPlatformFilter, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[140px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All platforms" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Platforms" }),
          platforms.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p))
        ] })
      ] })
    ] }),
    !content ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/50 animate-pulse", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4 h-20" }) }, i)) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-10 w-10 text-muted-foreground/30 mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: search || statusFilter !== "all" || platformFilter !== "all" ? "No content matches your filters" : "No content yet. Start creating!" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: filtered.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      {
        className: "border-border/50 hover:border-border transition-colors cursor-pointer",
        onClick: () => {
          setViewItem(item);
          setEditingBody(item.body);
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium truncate", children: item.title || "Untitled" }),
              item.platform && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] shrink-0", children: item.platform }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Badge,
                {
                  variant: "outline",
                  className: `text-[10px] shrink-0 ${STATUS_COLORS[item.status]}`,
                  children: item.status
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground line-clamp-2", children: item.body }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-2 text-[10px] text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
                formatRelativeTime(item._creationTime)
              ] }),
              item.contentType && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.contentType }),
              item.tone && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.tone })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex gap-1 shrink-0",
              onClick: (e) => e.stopPropagation(),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-7 w-7",
                    onClick: () => {
                      navigator.clipboard.writeText(item.body);
                      toast.success("Copied");
                    },
                    title: "Copy",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-7 w-7",
                    onClick: () => handleDuplicate(item._id),
                    title: "Duplicate",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-7 w-7 text-destructive",
                    onClick: () => handleDelete(item._id),
                    title: "Delete",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
                  }
                )
              ]
            }
          )
        ] }) })
      },
      item._id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewItem, onOpenChange: () => setViewItem(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[80vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: viewItem?.title || "Untitled Content" }) }),
      viewItem && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
          viewItem.platform && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: viewItem.platform }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: "outline",
              className: STATUS_COLORS[viewItem.status],
              children: viewItem.status
            }
          ),
          viewItem.contentType && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: viewItem.contentType }),
          viewItem.tone && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: viewItem.tone })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground", children: "Content" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: editingBody,
              onChange: (e) => setEditingBody(e.target.value),
              className: "w-full min-h-[200px] rounded-md border border-border bg-muted/50 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-y"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            onClick: () => {
              if (viewItem) {
                navigator.clipboard.writeText(viewItem.body);
                toast.success("Copied to clipboard");
              }
            },
            className: "gap-1",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5" }),
              " Copy"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            onClick: () => {
              if (viewItem) handleDuplicate(viewItem._id);
            },
            className: "gap-1",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
              " Duplicate"
            ]
          }
        ),
        editingBody !== viewItem?.body && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSaveEdit, className: "gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FilePen, { className: "h-3.5 w-3.5" }),
          " Save Changes"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "destructive",
            onClick: () => {
              if (viewItem) handleDelete(viewItem._id);
            },
            className: "gap-1",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
              " Delete"
            ]
          }
        )
      ] })
    ] }) })
  ] });
}

export { ContentHistory as default };
