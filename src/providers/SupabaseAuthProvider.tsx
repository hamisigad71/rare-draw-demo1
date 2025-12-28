import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  setSupabaseAccessToken,
  supabase,
} from "@/integrations/supabase/client";
import { logger, toErrorMetadata } from "@/lib/logger";

const SYNC_INTERVAL_MS = 45_000;

interface SupabaseAuthProviderProps {
  children: ReactNode;
}

export function SupabaseAuthProvider({ children }: SupabaseAuthProviderProps) {
  const { isLoaded, isSignedIn, getAuthToken, userId, user } = useAuth();
  const lastTokenRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof window.setInterval> | null>(
    null
  );
  const syncLogger = useMemo(
    () => logger.withContext({ feature: "supabase-auth-sync" }),
    []
  );
  const [profileEnsuredFor, setProfileEnsuredFor] = useState<string | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    const applyToken = async (reason: string) => {
      if (cancelled || !isLoaded) {
        return;
      }

      if (!isSignedIn) {
        if (lastTokenRef.current !== null) {
          setSupabaseAccessToken(null);
          lastTokenRef.current = null;
          syncLogger.debug("Cleared Supabase auth token", { reason });
        }
        return;
      }

      try {
        const token = await getAuthToken();

        if (cancelled) {
          return;
        }

        if (!token) {
          if (lastTokenRef.current !== null) {
            setSupabaseAccessToken(null);
            lastTokenRef.current = null;
          }
          syncLogger.warn("Clerk did not return a token", { reason, userId });
          return;
        }

        if (token === lastTokenRef.current) {
          return;
        }

        setSupabaseAccessToken(token);
        lastTokenRef.current = token;
        syncLogger.debug("Updated Supabase auth token", { reason, userId });
      } catch (error) {
        syncLogger.error("Failed to synchronize Supabase auth token", {
          reason,
          userId,
          error: toErrorMetadata(error),
        });
      }
    };

    void applyToken("initial");

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isLoaded && isSignedIn) {
      intervalRef.current = window.setInterval(() => {
        void applyToken("refresh");
      }, SYNC_INTERVAL_MS);
    }

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [getAuthToken, isLoaded, isSignedIn, syncLogger, userId]);

  useEffect(() => {
    return () => {
      setSupabaseAccessToken(null);
      lastTokenRef.current = null;
      setProfileEnsuredFor(null);
    };
  }, []);

  useEffect(() => {
    if (!isSignedIn) {
      setProfileEnsuredFor(null);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) {
      return;
    }

    if (profileEnsuredFor === userId) {
      return;
    }

    const ensureProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          syncLogger.error("Failed to check Supabase profile", {
            userId,
            error: toErrorMetadata(error),
          });
          return;
        }

        if (data) {
          setProfileEnsuredFor(userId);
          return;
        }

        const email =
          user?.primaryEmailAddress?.emailAddress ||
          user?.emailAddresses?.[0]?.emailAddress ||
          null;

        const username =
          user?.username ||
          user?.firstName ||
          (email ? email.split("@")[0] : null) ||
          `user_${userId.slice(0, 8)}`;

        const { error: insertError } = await supabase.from("profiles").insert({
          id: userId,
          username,
          email,
          avatar_url: user?.imageUrl ?? null,
        });

        if (insertError) {
          syncLogger.error("Failed to create Supabase profile", {
            userId,
            error: toErrorMetadata(insertError),
          });
          return;
        }

        setProfileEnsuredFor(userId);
        syncLogger.info("Created Supabase profile for Clerk user", { userId });
      } catch (error) {
        syncLogger.error("Unexpected error ensuring profile", {
          userId,
          error: toErrorMetadata(error),
        });
      }
    };

    void ensureProfile();
  }, [isLoaded, isSignedIn, profileEnsuredFor, syncLogger, user, userId]);

  return <>{children}</>;
}
