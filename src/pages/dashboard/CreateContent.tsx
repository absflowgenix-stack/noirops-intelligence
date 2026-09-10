import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Lightbulb,
  CalendarDays,
  Repeat,
  Video,
  Loader2,
  Copy,
  Save,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const PLATFORMS = [
  "Instagram",
  "Twitter",
  "LinkedIn",
  "TikTok",
  "YouTube",
  "Facebook",
];

const TONES = [
  "Professional",
  "Casual",
  "Witty",
  "Inspirational",
  "Educational",
  "Conversational",
  "Bold",
  "Friendly",
];

const CONTENT_TYPES = [
  "Social Post",
  "Caption",
  "Hook",
  "Thread",
  "Content Idea",
  "Promotional",
  "Educational",
  "Engagement",
];

export default function CreateContent() {
  const { user } = useAuth();
  const generateContent = useAction(api.ai.generateContent);
  const generateMultipleIdeas = useAction(api.ai.generateMultipleIdeas);
  const generateCalendar = useAction(api.ai.generateCalendar);
  const analyzeContent = useAction(api.ai.analyzeContent);
  const repurposeContent = useAction(api.ai.repurposeContent);
  const saveContent = useMutation(api.content.create);
  const logEvent = useMutation(api.analytics.logEvent);

  const [activeTab, setActiveTab] = useState("generate");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [ideasCount, setIdeasCount] = useState(5);

  // Form state
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("");
  const [tone, setTone] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [contentType, setContentType] = useState("");
  const [context, setContext] = useState("");
  const [analyzeText, setAnalyzeText] = useState("");
  const [repurposeText, setRepurposeText] = useState("");
  const [repurposePlatform, setRepurposePlatform] = useState("");
  const [calendarDays, setCalendarDays] = useState(7);

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
        platform: platform || undefined,
        tone: tone || undefined,
        audience: audience || undefined,
        goal: goal || undefined,
        contentType: contentType || undefined,
        additionalContext: context || undefined,
      });
      setResult(res.content);
      if (userId) {
        logEvent({
          userId,
          eventType: "generation",
          metadata: { type: "content", platform: platform || "general" },
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
        platform: platform || undefined,
        count: ideasCount,
        audience: audience || undefined,
        tone: tone || undefined,
      });
      setResult(res.ideas);
      if (userId) {
        logEvent({
          userId,
          eventType: "generation",
          metadata: { type: "ideas", platform: platform || "general" },
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
        platform: platform || undefined,
        days: calendarDays,
        audience: audience || undefined,
        tone: tone || undefined,
      });
      setResult(res.calendar);
      if (userId) {
        logEvent({
          userId,
          eventType: "generation",
          metadata: { type: "calendar", days: calendarDays },
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
        platform: platform || undefined,
        goal: goal || undefined,
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
        audience: audience || undefined,
        tone: tone || undefined,
      });
      setResult(res.content);
      if (userId) {
        logEvent({
          userId,
          eventType: "generation",
          metadata: { type: "repurpose", target: repurposePlatform },
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
        platform: platform || undefined,
        contentType: contentType || undefined,
        tone: tone || undefined,
        audience: audience || undefined,
        goal: goal || undefined,
        status: "draft",
      });
      logEvent({
        userId,
        eventType: "save",
        metadata: { from: activeTab },
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

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Content</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Use AI to generate, analyze, and repurpose content across platforms.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate" className="gap-1">
            <Sparkles className="h-3.5 w-3.5" /> Generate
          </TabsTrigger>
          <TabsTrigger value="ideas" className="gap-1">
            <Lightbulb className="h-3.5 w-3.5" /> Ideas
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-1">
            <CalendarDays className="h-3.5 w-3.5" /> Calendar
          </TabsTrigger>
          <TabsTrigger value="repurpose" className="gap-1">
            <Repeat className="h-3.5 w-3.5" /> Repurpose
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Content Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Topic *</Label>
                <Input
                  placeholder="e.g., Productivity tips for solopreneurs"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map((ct) => (
                        <SelectItem key={ct} value={ct}>
                          {ct}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Input
                    placeholder="e.g., Young professionals, 25-35"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Goal</Label>
                  <Input
                    placeholder="e.g., Drive engagement, educate"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Additional Context</Label>
                <Textarea
                  placeholder="Any specific instructions or context for the AI..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={loading || !topic.trim()}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate Content
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ideas Tab */}
        <TabsContent value="ideas" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Content Ideas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Topic *</Label>
                <Input
                  placeholder="e.g., Sustainable fashion, AI tools, Fitness"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Ideas</Label>
                  <Select
                    value={String(ideasCount)}
                    onValueChange={(v) => setIdeasCount(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 5, 7, 10].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} ideas
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Audience</Label>
                <Input
                  placeholder="e.g., Tech entrepreneurs, Fitness enthusiasts"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                />
              </div>
              <Button
                onClick={handleGenerateIdeas}
                disabled={loading || !topic.trim()}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lightbulb className="h-4 w-4" />
                )}
                Generate Ideas
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Content Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Topic / Theme *</Label>
                <Input
                  placeholder="e.g., Launch week for new product"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select
                    value={String(calendarDays)}
                    onValueChange={(v) => setCalendarDays(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 5, 7, 14, 30].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} days
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Audience</Label>
                  <Input
                    placeholder="e.g., Small business owners"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleGenerateCalendar}
                disabled={loading || !topic.trim()}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CalendarDays className="h-4 w-4" />
                )}
                Generate Calendar
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Repurpose Tab */}
        <TabsContent value="repurpose" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Repurpose Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Original Content *</Label>
                <Textarea
                  placeholder="Paste your content here to repurpose it for another platform..."
                  value={repurposeText}
                  onChange={(e) => setRepurposeText(e.target.value)}
                  rows={5}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Platform *</Label>
                  <Select
                    value={repurposePlatform}
                    onValueChange={setRepurposePlatform}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Audience</Label>
                  <Input
                    placeholder="e.g., Marketing professionals"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleRepurpose}
                disabled={loading || !repurposeText.trim() || !repurposePlatform}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Repeat className="h-4 w-4" />
                )}
                Repurpose Content
              </Button>
            </CardContent>
          </Card>

          {/* Analyze content */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Analyze Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Content to Analyze *</Label>
                <Textarea
                  placeholder="Paste content to get AI feedback..."
                  value={analyzeText}
                  onChange={(e) => setAnalyzeText(e.target.value)}
                  rows={4}
                />
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={loading || !analyzeText.trim()}
                className="gap-2"
                variant="outline"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Video className="h-4 w-4" />
                )}
                Analyze
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Result */}
      {result && (
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Result</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResult("")}
                className="gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Clear
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1">
                <Copy className="h-3 w-3" /> Copy
              </Button>
              <Button size="sm" onClick={handleSave} className="gap-1">
                <Save className="h-3 w-3" /> Save Draft
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm leading-relaxed rounded-md bg-muted/50 p-4 border border-border/50">
              {result}
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {platform && <Badge variant="secondary">{platform}</Badge>}
              {tone && <Badge variant="secondary">{tone}</Badge>}
              {contentType && <Badge variant="secondary">{contentType}</Badge>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}