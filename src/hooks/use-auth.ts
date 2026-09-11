import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";

export function useAuth() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();

  // `currentUser` only has anything to return when there is a session, so skip
  // it while signed out. Convex's `useQuery` rethrows server errors during
  // render, so calling it unconditionally meant one failing call could take
  // down public and signed-out routes (e.g. /auth, /dashboard's sign-in
  // prompt) instead of letting them render.
  const user = useQuery(api.users.currentUser, isAuthenticated ? {} : "skip");

  const { signIn, signOut } = useAuthActions();

  // Derive isLoading directly from the dependencies instead of managing separate state
  const isLoading = isAuthLoading || (isAuthenticated && user === undefined);

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn,
    signOut,
  };
}
