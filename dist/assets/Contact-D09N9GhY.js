import { r as reactExports, j as jsxRuntimeExports, L as Link, Z as Zap, a as Button, A as ArrowRight, d as Card, e as CardContent, w as CircleCheckBig, o as Mail, x as toast } from './index-DPL8dQnx.js';
import { I as Input } from './input-CKg58hNp.js';
import { T as Textarea } from './textarea-DSa_GFOI.js';
import { L as Label } from './label-CBk1bkZ5.js';
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from './select-DGbgp2VJ.js';
import './index-f7nyhw1e.js';
import './index-BTqswTaL.js';

function Contact() {
  const [submitted, setSubmitted] = reactExports.useState(false);
  const [name, setName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [category, setCategory] = reactExports.useState("");
  const [message, setMessage] = reactExports.useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitted(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex h-14 max-w-6xl items-center justify-between px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2 font-semibold text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-5 w-5 text-primary" }),
        "NoirOps"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", children: "Sign In" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "gap-1", children: [
          "Get Started ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5" })
        ] }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-2xl px-6 py-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl md:text-4xl font-bold tracking-tight mb-4", children: "Get in touch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Have a question, suggestion, or want to collaborate? We'd love to hear from you." })
      ] }),
      submitted ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "text-center py-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-12 w-12 text-emerald-500 mx-auto mb-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Message sent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "We'll get back to you as soon as possible." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "mt-6", onClick: () => {
          setSubmitted(false);
          setName("");
          setEmail("");
          setCategory("");
          setMessage("");
        }, children: "Send another message" })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Your name",
                value: name,
                onChange: (e) => setName(e.target.value),
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "email",
                placeholder: "you@example.com",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                required: true
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: category, onValueChange: setCategory, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select a category" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "general", children: "General Inquiry" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "support", children: "Support" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "partnership", children: "Partnership" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "feedback", children: "Feedback" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "press", children: "Press / Media" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Message *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              placeholder: "How can we help?",
              value: message,
              onChange: (e) => setMessage(e.target.value),
              rows: 5,
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", className: "w-full gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4" }),
          " Send Message"
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "You can also reach us at",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "mailto:hello@noiroops.com", className: "text-primary hover:underline", children: "hello@noiroops.com" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t border-border/50 mt-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-6 py-8 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-semibold text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-5 w-5 text-primary" }),
        "NoirOps"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/about", className: "hover:text-foreground transition-colors", children: "About" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/privacy", className: "hover:text-foreground transition-colors", children: "Privacy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/terms", className: "hover:text-foreground transition-colors", children: "Terms" })
      ] })
    ] }) })
  ] });
}

export { Contact as default };
