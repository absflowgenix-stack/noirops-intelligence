// One-shot probe: replicate the browser's PUBLIC API call (no deploy key) for
// auth:signIn, exactly like @convex-dev/auth's client does.
const deployment = "polite-tortoise-103";

async function main() {
  const res = await fetch(`https://${deployment}.convex.cloud/api/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: "auth:signIn",
      args: { provider: "anonymous", params: {} },
      format: "json",
    }),
  });
  const text = await res.text();
  console.log("status:", res.status);
  console.log("body:", text.slice(0, 600));
}

main().catch((e) => {
  console.error("PROBE ERROR:", e?.message ?? e);
  process.exit(1);
});
