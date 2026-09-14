/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as brandVoices from "../brandVoices.js";
import type * as calendarEvents from "../calendarEvents.js";
import type * as content from "../content.js";
import type * as feedback from "../feedback.js";
import type * as http from "../http.js";
import type * as settings from "../settings.js";
import type * as users from "../users.js";
import type * as videoClipping from "../videoClipping.js";
import type * as videoClips from "../videoClips.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  analytics: typeof analytics;
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  brandVoices: typeof brandVoices;
  calendarEvents: typeof calendarEvents;
  content: typeof content;
  feedback: typeof feedback;
  http: typeof http;
  settings: typeof settings;
  users: typeof users;
  videoClipping: typeof videoClipping;
  videoClips: typeof videoClips;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
