import { useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";

export type ApiFetchOptions = RequestInit & {
  accessToken?: string | null;
};

type ApiErrorShape = { error?: string; message?: string; issues?: unknown };

/**
 * Low-level API fetcher that attaches credentials and bearer token, parses JSON, and throws on non-2xx.
 */
export async function apiFetch<T = any>(
  input: RequestInfo | URL,
  opts: ApiFetchOptions = {}
): Promise<T> {
  const headers = new Headers(opts.headers ?? {});
  headers.set("Accept", "application/json");
  if (!headers.has("Content-Type") && opts.body) {
    headers.set("Content-Type", "application/json");
  }
  if (opts.accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${opts.accessToken}`);
  }

  const res = await fetch(input, {
    ...opts,
    credentials: opts.credentials ?? "include",
    headers,
  }).catch((err) => {
    throw new Error(err?.message || "Network error");
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await res.json().catch(() => ({} as any)) : await res.text().catch(() => "");

  if (!res.ok) {
    const data = (payload as ApiErrorShape) || {};
    const msg = data.message || data.error || `Request failed (${res.status})`;
    const error = new Error(msg);
    (error as any).status = res.status;
    (error as any).body = payload;
    throw error;
  }

  return payload as T;
}

/**
 * React hook that returns a typed apiFetch bound to current session token from AuthProvider.
 */
export function useApiFetch() {
  const { session } = useAuth();
  const accessToken = session?.access_token;

  return useCallback(
    async <T = any>(input: RequestInfo | URL, opts: RequestInit = {}) => {
      return apiFetch<T>(input, { ...opts, accessToken });
    },
    [accessToken]
  );
}
