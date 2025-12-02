"use client";

export type ApiFetcher = <T = any>(input: RequestInfo | URL, opts?: RequestInit) => Promise<T>;
