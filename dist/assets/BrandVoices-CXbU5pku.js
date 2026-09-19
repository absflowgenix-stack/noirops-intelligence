import { u as useAuth, z as useQuery, D as api, J as useMutation, r as reactExports, j as jsxRuntimeExports, a as Button, X as Plus, d as Card, e as CardContent, an as Megaphone, B as Badge, al as Check, ao as Pencil, W as Trash2, x as toast } from './index-DPL8dQnx.js';
import { I as Input } from './input-CKg58hNp.js';
import { T as Textarea } from './textarea-DSa_GFOI.js';
import { L as Label } from './label-CBk1bkZ5.js';
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from './dialog-D4VmidN4.js';
import './index-BTqswTaL.js';

const EMPTY_FORM = {
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
  exampleContent: ""
};
function BrandVoices() {
  const { user } = useAuth();
  const userId = user?._id ?? "";
  const voices = useQuery(
    api.brandVoices.list,
    userId ? { userId } : "skip"
  );
  const createVoice = useMutation(api.brandVoices.create);
  const updateVoice = useMutation(api.brandVoices.update);
  const deleteVoice = useMutation(api.brandVoices.remove);
  const logEvent = useMutation(api.analytics.logEvent);
  const [showDialog, setShowDialog] = reactExports.useState(false);
  const [editingId, setEditingId] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY_FORM);
  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowDialog(true);
  };
  const openEdit = (voice) => {
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
      exampleContent: voice.exampleContent || ""
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
      description: form.description.trim() || void 0,
      industry: form.industry.trim() || void 0,
      targetAudience: form.targetAudience.trim() || void 0,
      tone: form.tone.trim() || void 0,
      personality: form.personality.trim() || void 0,
      coreValues: form.coreValues ? form.coreValues.split(",").map((v) => v.trim()).filter(Boolean) : void 0,
      productsServices: form.productsServices.trim() || void 0,
      preferredVocabulary: form.preferredVocabulary ? form.preferredVocabulary.split(",").map((v) => v.trim()).filter(Boolean) : void 0,
      wordsToAvoid: form.wordsToAvoid ? form.wordsToAvoid.split(",").map((v) => v.trim()).filter(Boolean) : void 0,
      exampleContent: form.exampleContent.trim() || void 0,
      isDefault: editingId ? false : (voices?.length ?? 0) === 0
    };
    try {
      if (editingId) {
        await updateVoice({ id: editingId, ...data });
        toast.success("Brand voice updated");
      } else {
        await createVoice(data);
        toast.success("Brand voice created");
        logEvent({
          userId,
          eventType: "feature_used",
          metadata: { feature: "brand_voice" }
        });
      }
      setShowDialog(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    }
  };
  const handleDelete = async (id) => {
    try {
      await deleteVoice({ id });
      toast.success("Brand voice deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };
  const handleSetDefault = async (id) => {
    try {
      await updateVoice({ id, isDefault: true });
      toast.success("Default brand voice updated");
    } catch {
      toast.error("Failed to update default");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-5xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Brand Voices" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Define your brand's personality to get better AI-generated content." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openCreate, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " New Brand Voice"
      ] })
    ] }),
    !voices ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: [1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/50 animate-pulse", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-6 h-32" }) }, i)) }) : voices.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "text-center py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Megaphone, { className: "h-10 w-10 text-muted-foreground/30 mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No brand voices yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/60 mt-1", children: "Create a brand voice to help the AI generate content that matches your style." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "mt-4 gap-1", onClick: openCreate, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }),
        " Create Brand Voice"
      ] })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: voices.map((voice) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: voice.name }),
          voice.isDefault && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-[10px]", children: "Default" })
        ] }),
        voice.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-2", children: voice.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          voice.industry && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px]", children: voice.industry }),
          voice.tone && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px]", children: voice.tone }),
          voice.targetAudience && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px]", children: voice.targetAudience }),
          voice.coreValues && voice.coreValues.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-[10px]", children: [
            voice.coreValues.length,
            " values"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
        !voice.isDefault && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "ghost",
            size: "icon",
            className: "h-8 w-8",
            onClick: () => handleSetDefault(voice._id),
            title: "Set as default",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "ghost",
            size: "icon",
            className: "h-8 w-8",
            onClick: () => openEdit(voice),
            title: "Edit",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "ghost",
            size: "icon",
            className: "h-8 w-8 text-destructive",
            onClick: () => handleDelete(voice._id),
            title: "Delete",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
          }
        )
      ] })
    ] }) }) }, voice._id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showDialog, onOpenChange: setShowDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[85vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingId ? "Edit Brand Voice" : "Create Brand Voice" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "e.g., Professional Tech Brand",
              value: form.name,
              onChange: (e) => setForm({ ...form, name: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              placeholder: "Brief description of this brand voice...",
              value: form.description,
              onChange: (e) => setForm({ ...form, description: e.target.value }),
              rows: 2
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Industry" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g., Technology, Health",
                value: form.industry,
                onChange: (e) => setForm({ ...form, industry: e.target.value })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Target Audience" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g., Young professionals",
                value: form.targetAudience,
                onChange: (e) => setForm({ ...form, targetAudience: e.target.value })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g., Professional, Friendly",
                value: form.tone,
                onChange: (e) => setForm({ ...form, tone: e.target.value })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Personality" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g., Innovative, Bold",
                value: form.personality,
                onChange: (e) => setForm({ ...form, personality: e.target.value })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Core Values (comma-separated)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "e.g., Innovation, Transparency, Quality",
              value: form.coreValues,
              onChange: (e) => setForm({ ...form, coreValues: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Products / Services" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "e.g., SaaS platform for content creators",
              value: form.productsServices,
              onChange: (e) => setForm({ ...form, productsServices: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Preferred Vocabulary (comma-separated)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "e.g., creator, build, grow",
              value: form.preferredVocabulary,
              onChange: (e) => setForm({ ...form, preferredVocabulary: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Words to Avoid (comma-separated)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "e.g., cheap, easy, guaranteed",
              value: form.wordsToAvoid,
              onChange: (e) => setForm({ ...form, wordsToAvoid: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Example Content" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              placeholder: "Paste example content that represents your brand voice...",
              value: form.exampleContent,
              onChange: (e) => setForm({ ...form, exampleContent: e.target.value }),
              rows: 4
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSave, children: editingId ? "Update" : "Create" })
      ] })
    ] }) })
  ] });
}

export { BrandVoices as default };
