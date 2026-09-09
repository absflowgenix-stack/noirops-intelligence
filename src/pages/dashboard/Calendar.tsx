import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-yellow-500",
  scheduled: "bg-blue-500",
  published: "bg-emerald-500",
  failed: "bg-red-500",
};

const STATUS_TEXT_COLORS: Record<string, string> = {
  draft: "text-yellow-500",
  scheduled: "text-blue-500",
  published: "text-emerald-500",
  failed: "text-red-500",
};

export default function Calendar() {
  const { user } = useAuth();
  const userId = user?._id ?? "";

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPlatform, setNewPlatform] = useState("");
  const [newStatus, setNewStatus] = useState<"draft" | "scheduled" | "published" | "failed">("draft");

  const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd");
  const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd");

  const events = useQuery(
    api.calendarEvents.list,
    userId ? { userId, startDate, endDate } : "skip"
  ) as Doc<"calendarEvents">[] | undefined;
  const createEvent = useMutation(api.calendarEvents.create);
  const updateEvent = useMutation(api.calendarEvents.update);
  const deleteEvent = useMutation(api.calendarEvents.remove);
  const logEvent = useMutation(api.analytics.logEvent);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    const days = [];
    let day = start;
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const eventsByDate = useMemo(() => {
    if (!events) return {};
    const map: Record<string, Doc<"calendarEvents">[]> = {};
    for (const event of events) {
      if (!map[event.date]) map[event.date] = [];
      map[event.date].push(event);
    }
    return map;
  }, [events]);

  const selectedDayEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];

  const handleAddEvent = async () => {
    if (!newTitle.trim() || !selectedDate || !userId) return;
    try {
      await createEvent({
        userId,
        title: newTitle,
        date: selectedDate,
        platform: newPlatform || undefined,
        status: newStatus,
      });
      logEvent({
        userId,
        eventType: "calendar_item",
        metadata: { date: selectedDate },
      });
      toast.success("Event created");
      setShowAddDialog(false);
      setNewTitle("");
      setNewPlatform("");
      setNewStatus("draft");
    } catch {
      toast.error("Failed to create event");
    }
  };

  const handleStatusChange = async (
    eventId: string,
    newStatus: "draft" | "scheduled" | "published" | "failed"
  ) => {
    try {
      await updateEvent({ id: eventId as any, status: newStatus });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent({ id: eventId as any });
      toast.success("Event deleted");
    } catch {
      toast.error("Failed to delete event");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Calendar</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Plan and track your content schedule.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setSelectedDate(format(new Date(), "yyyy-MM-dd"));
            setShowAddDialog(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add Event
        </Button>
      </div>

      {/* Calendar header */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
        </CardHeader>
        <CardContent>
          {/* Day names */}
          <div className="grid grid-cols-7 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>
          {/* Calendar grid */}
          <div className="grid grid-cols-7 border-t border-l border-border/50">
            {calendarDays.map((day, i) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const dayEvents = eventsByDate[dateStr] || [];
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDate === dateStr;
              const today = isToday(day);

              return (
                <div
                  key={i}
                  className={`
                    min-h-[80px] md:min-h-[100px] p-1.5 border-r border-b border-border/50 cursor-pointer
                    transition-colors hover:bg-muted/50
                    ${!isCurrentMonth ? "opacity-40" : ""}
                    ${isSelected ? "bg-primary/5 ring-1 ring-primary/20" : ""}
                  `}
                  onClick={() => setSelectedDate(dateStr)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`
                        text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
                        ${today ? "bg-primary text-primary-foreground" : "text-muted-foreground"}
                      `}
                    >
                      {format(day, "d")}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[9px] text-muted-foreground">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event._id}
                        className="flex items-center gap-1 text-[10px] leading-tight"
                      >
                        <div
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${STATUS_COLORS[event.status]}`}
                        />
                        <span className="truncate text-muted-foreground">
                          {event.title}
                        </span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[9px] text-muted-foreground">
                        +{dayEvents.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected day panel */}
      {selectedDate && (
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {format(new Date(selectedDate + "T12:00:00"), "EEEE, MMMM d, yyyy")}
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="h-3 w-3" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-6">
                <CalendarDays className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No events scheduled
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-2"
                  onClick={() => setShowAddDialog(true)}
                >
                  Add an event
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDayEvents.map((event) => (
                  <div
                    key={event._id}
                    className="flex items-center justify-between rounded-md border border-border/50 p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-2 w-2 rounded-full shrink-0 ${STATUS_COLORS[event.status]}`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {event.title}
                        </p>
                        {event.platform && (
                          <Badge
                            variant="outline"
                            className="text-[10px] mt-0.5"
                          >
                            {event.platform}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Select
                        value={event.status}
                        onValueChange={(v) =>
                          handleStatusChange(event._id, v as any)
                        }
                      >
                        <SelectTrigger className="h-7 w-[110px] text-[10px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDeleteEvent(event._id)}
                      >
                        <span className="text-xs">✕</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Event Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Calendar Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Title *</label>
              <Input
                placeholder="e.g., Publish Instagram post"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Platform</label>
              <Select value={newPlatform} onValueChange={setNewPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Any platform" />
                </SelectTrigger>
                <SelectContent>
                  {["Instagram", "Twitter", "LinkedIn", "TikTok", "YouTube", "Facebook"].map(
                    (p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Status</label>
              <Select
                value={newStatus}
                onValueChange={(v) => setNewStatus(v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Date:{" "}
              {selectedDate
                ? format(new Date(selectedDate + "T12:00:00"), "MMMM d, yyyy")
                : "Not selected"}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddEvent} disabled={!newTitle.trim()}>
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}