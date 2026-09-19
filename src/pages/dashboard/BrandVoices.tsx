import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  Megaphone,
} from "lucide-react";
import { toast } from "sonner";

interface BrandVoiceForm {
  name: string;
  description: string;
  industry: string;
  targetAudience: string;
  tone: string;
  personality: string;
  coreValues: string;
  productsServices: string;
  preferredVocabulary: string;
  wordsToAvoid: string;
  exampleContent: string;
}

interface BrandVoice {
  _id: string;
  _creationTime: number;
  userId: string;
  name: string;
  description?: string;
  industry?: string;
  targetAudience?: string;
  tone?: string;
  personality?: string;
  coreValues?: string[];
  productsServices?: string;
  preferredVocabulary?: string[];
  wordsToAvoid?: string[];
  exampleContent?: string;
  isDefault: boolean;
}

const EMPTY_FORM: BrandVoiceForm = {
  name: "",
  description: "",
  industry: "",
  targetAudience: "",
  tone: "",
  personality: "",
  coreValues: "",
  productsServices: "",
  preferredVocabulary: "",
  wordsToAvoid: "",
  exampleContent: "",
};

export default function BrandVoices() {
  const { user } = useAuth();
  const userId = user?._id ?? "";

  const voices = useQuery(
    api.brandVoices.list,
    userId ? { userId } : "skip"
  ) as BrandVoice[] | undefined;
  const createVoice = useMutation(api.brandVoices.create);
  const updateVoice = useMutation(api.brandVoices.update);
  const deleteVoice = useMutation(api.brandVoices.remove);
  const logEvent = useMutation(api.analytics.logEvent);

  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BrandVoiceForm>(EMPTY_FORM);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowDialog(true);
  };

  const openEdit = (voice: BrandVoice) => {
    setEditingId(voice._id);
    setForm({
      name: voice.name,
      description: voice.description || "",
      industry: voice.industry || "",
      targetAudience: voice.targetAudience || "",
      tone: voice.tone || "",
      personality: voice.personality || "",
      coreValues: (voice.coreValues || []).join(", "),
      productsServices: voice.productsServices || "",
      preferredVocabulary: (voice.preferredVocabulary || []).join(", "),
      wordsToAvoid: (voice.wordsToAvoid || []).join(", "),
      exampleContent: voice.exampleContent || "",
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    const data = {
      userId,
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      industry: form.industry.trim() || undefined,
      targetAudience: form.targetAudience.trim() || undefined,
      tone: form.tone.trim() || undefined,
      personality: form.personality.trim() || undefined,
      coreValues: form.coreValues
        ? form.coreValues.split(",").map((v) => v.trim()).filter(Boolean)
        : undefined,
      productsServices: form.productsServices.trim() || undefined,
      preferredVocabulary: form.preferredVocabulary
        ? form.preferredVocabulary.split(",").map((v) => v.trim()).filter(Boolean)
        : undefined,
      wordsToAvoid: form.wordsToAvoid
        ? form.wordsToAvoid.split(",").map((v) => v.trim()).filter(Boolean)
        : undefined,
      exampleContent: form.exampleContent.trim() || undefined,
      isDefault: editingId ? false : (voices?.length ?? 0) === 0,
    };

    try {
      if (editingId) {
        await updateVoice({ id: editingId as any, ...data });
        toast.success("Brand voice updated");
      } else {
        await createVoice(data);
        toast.success("Brand voice created");
        logEvent({
          userId,
          eventType: "feature_used",
          metadata: { feature: "brand_voice" },
        });
      }
      setShowDialog(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVoice({ id: id as any });
      toast.success("Brand voice deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await updateVoice({ id: id as any, isDefault: true });
      toast.success("Default brand voice updated");
    } catch {
      toast.error("Failed to update default");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Brand Voices</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Define your brand's personality to get better AI-generated content.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New Brand Voice
        </Button>
      </div>

      {!voices ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="border-border/50 animate-pulse">
              <CardContent className="p-6 h-32" />
            </Card>
          ))}
        </div>
      ) : voices.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="text-center py-12">
            <Megaphone className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No brand voices yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Create a brand voice to help the AI generate content that matches
              your style.
            </p>
            <Button size="sm" className="mt-4 gap-1" onClick={openCreate}>
              <Plus className="h-3 w-3" /> Create Brand Voice
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {voices.map((voice) => (
            <Card key={voice._id} className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{voice.name}</h3>
                      {voice.isDefault && (
                        <Badge className="text-[10px]">Default</Badge>
                      )}
                    </div>
                    {voice.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {voice.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {voice.industry && (
                        <Badge variant="secondary" className="text-[10px]">
                          {voice.industry}
                        </Badge>
                      )}
                      {voice.tone && (
                        <Badge variant="secondary" className="text-[10px]">
                          {voice.tone}
                        </Badge>
                      )}
                      {voice.targetAudience && (
                        <Badge variant="secondary" className="text-[10px]">
                          {voice.targetAudience}
                        </Badge>
                      )}
                      {voice.coreValues && voice.coreValues.length > 0 && (
                        <Badge variant="secondary" className="text-[10px]">
                          {voice.coreValues.length} values
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!voice.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleSetDefault(voice._id)}
                        title="Set as default"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(voice)}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(voice._id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Brand Voice" : "Create Brand Voice"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="e.g., Professional Tech Brand"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of this brand voice..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input
                  placeholder="e.g., Technology, Health"
                  value={form.industry}
                  onChange={(e) =>
                    setForm({ ...form, industry: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Input
                  placeholder="e.g., Young professionals"
                  value={form.targetAudience}
                  onChange={(e) =>
                    setForm({ ...form, targetAudience: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tone</Label>
                <Input
                  placeholder="e.g., Professional, Friendly"
                  value={form.tone}
                  onChange={(e) => setForm({ ...form, tone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Personality</Label>
                <Input
                  placeholder="e.g., Innovative, Bold"
                  value={form.personality}
                  onChange={(e) =>
                    setForm({ ...form, personality: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Core Values (comma-separated)</Label>
              <Input
                placeholder="e.g., Innovation, Transparency, Quality"
                value={form.coreValues}
                onChange={(e) =>
                  setForm({ ...form, coreValues: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Products / Services</Label>
              <Input
                placeholder="e.g., SaaS platform for content creators"
                value={form.productsServices}
                onChange={(e) =>
                  setForm({ ...form, productsServices: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Preferred Vocabulary (comma-separated)</Label>
              <Input
                placeholder="e.g., creator, build, grow"
                value={form.preferredVocabulary}
                onChange={(e) =>
                  setForm({ ...form, preferredVocabulary: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Words to Avoid (comma-separated)</Label>
              <Input
                placeholder="e.g., cheap, easy, guaranteed"
                value={form.wordsToAvoid}
                onChange={(e) =>
                  setForm({ ...form, wordsToAvoid: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Example Content</Label>
              <Textarea
                placeholder="Paste example content that represents your brand voice..."
                value={form.exampleContent}
                onChange={(e) =>
                  setForm({ ...form, exampleContent: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}