import { cookies, headers } from "next/headers";
import WorkspaceSettingsClient from "./page.client";
import {
  normalizeCategoryRow,
  normalizePaymentTypeRow,
  normalizeCurrencyRow,
  type NormalizedCategory,
  type NormalizedPaymentType,
  type NormalizedCurrency,
} from "@/entities/dictionaries/normalize";

type FetchResult<T> = T | [];

async function fetchJson<T>(path: string): Promise<FetchResult<T>> {
  const headerStore = await headers();
  const cookieStore = await cookies();

  const host = headerStore.get("host") || "";
  const proto = headerStore.get("x-forwarded-proto") || "http";
  const origin = (
    process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`
  ).replace(/\/$/, "");
  const url = `${origin}${path}`;

  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  try {
    const res = await fetch(url, {
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      cache: "no-store",
    });
    if (!res.ok) return [] as unknown as FetchResult<T>;
    return (await res.json()) as T;
  } catch {
    return [] as unknown as FetchResult<T>;
  }
}

function safeNormalize<T>(list: any[], fn: (item: any) => T): T[] {
  const result: T[] = [];
  for (const item of list || []) {
    try {
      result.push(fn(item));
    } catch {
      // skip invalid rows
    }
  }
  return result;
}

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspace_id: string }>;
}) {
  const { workspace_id } = await params;

  const [categories, paymentTypes, currencies] = await Promise.all([
    fetchJson<any[]>(
      `/api/dictionaries/categories?workspaceId=${workspace_id}`
    ),
    fetchJson<any[]>(
      `/api/dictionaries/payment_types?workspaceId=${workspace_id}`
    ),
    fetchJson<any[]>(`/api/dictionaries/currencies`),
  ]);

  const initialCategories = safeNormalize<NormalizedCategory>(
    categories as any[],
    normalizeCategoryRow
  );
  const initialPaymentTypes = safeNormalize<NormalizedPaymentType>(
    paymentTypes as any[],
    normalizePaymentTypeRow
  );
  const initialCurrencies = safeNormalize<NormalizedCurrency>(
    currencies as any[],
    normalizeCurrencyRow
  );

  return (
    <WorkspaceSettingsClient
      workspaceId={workspace_id}
      initialCategories={initialCategories}
      initialPaymentTypes={initialPaymentTypes}
      initialCurrencies={initialCurrencies}
    />
  );
}
