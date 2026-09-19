import { j as jsxRuntimeExports, L as Link, Z as Zap, a as Button, y as ArrowLeft } from './index-DPL8dQnx.js';

function NotFound() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex flex-col bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex h-14 max-w-6xl items-center px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2 font-semibold text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-5 w-5 text-primary" }),
      "NoirOps"
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 flex items-center justify-center px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-6xl font-bold text-primary/20 mb-4", children: "404" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold mb-2", children: "Page Not Found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-6 max-w-sm", children: "The page you're looking for doesn't exist or has been moved." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
        " Back to Home"
      ] }) })
    ] }) })
  ] });
}

export { NotFound as default };
