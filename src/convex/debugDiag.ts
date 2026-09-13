// TEMPORARY diagnostic module — delete after diagnosing the auth:signIn failure.
//
// Production deployments mask thrown error messages ("Server Error"), but this
// module catches failures internally and PERSISTS the real error text into the
// existing analyticsEvents table (eventType: "debug_diag", metadata: results),
// so it can be read back with a plain query (the CLI prints query results
// reliably; action results were swallowed in this runtime).

import { SignJWT, importPKCS8 } from "jose";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";

// Read back diagnostics written by debugDiag:runDiag.
export const latest = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_user_type", (q) => q.eq("userId", "debug-diag").eq("eventType", "debug_diag"))
      .order("desc")
      .take(5);
    return rows.map((r) => ({
      _id: r._id,
      _creationTime: r._creationTime,
      results: r.metadata,
    }));
  },
});

export const runDiag = action({
  args: {},
  handler: async (ctx) => {
    const out: Record<string, string> = {};

    // 1. Does JWT_PRIVATE_KEY import cleanly as a PKCS8 RSA key?
    try {
      const key = await importPKCS8(process.env.JWT_PRIVATE_KEY ?? "", "RS256");
      out.importKey = "ok";
      // 2. Can we sign exactly the way generateToken does?
      try {
        const token = await new SignJWT({ sub: "diag" })
          .setProtectedHeader({ alg: "RS256" })
          .setIssuedAt()
          .setIssuer(process.env.CONVEX_SITE_URL ?? "(missing CONVEX_SITE_URL)")
          .setAudience("convex")
          .setExpirationTime("1h")
          .sign(key);
        out.signToken = `ok (${token.length} chars)`;
      } catch (e) {
        out.signToken = `FAIL: ${(e as Error).message}`;
      }
    } catch (e) {
      out.importKey = `FAIL: ${(e as Error).message}`;
    }

    // 3. Does the real auth:signIn work when invoked server-side?
    try {
      const res = await ctx.runAction(api.auth.signIn, {
        provider: "anonymous",
        params: {},
      });
      out.authSignIn = `ok: ${JSON.stringify(res).slice(0, 300)}`;
    } catch (e) {
      out.authSignIn = `FAIL: ${(e as Error).message}`;
    }

    // 4. Quick sanity checks on related env.
    out.envConvexSiteUrl = process.env.CONVEX_SITE_URL ?? "(missing)";
    out.envJwksPresent = process.env.JWKS ? "yes" : "no";

    await ctx.runMutation(api.debugDiag.record, { results: out });
    return out;
  },
});

export const record = mutation({
  args: { results: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.insert("analyticsEvents", {
      userId: "debug-diag",
      eventType: "debug_diag",
      metadata: args.results,
    });
  },
});
