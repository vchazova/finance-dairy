import { cookies, headers } from "next/headers";
import WorkspaceClientPage from "./page.client";

type DictOption = { id: string; label: string };

async function fetchJson<T>(path: string): Promise<T> {
  const headerStore = await headers();
  const cookieStore = await cookies();

  const host = headerStore.get("host") || "";
  const proto = headerStore.get("x-forwarded-proto") || "http";
  const origin = (process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`).replace(/\/$/, "");
  const url = `${origin}${path}`;

  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  const res = await fetch(url, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    cache: "no-store",
  });
  if (!res.ok) return [] as unknown as T;
  return (await res.json()) as T;
}

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ workspace_id: string }>;
}) {
  const { workspace_id } = await params;

  const [categories, paymentTypes, currencies] = await Promise.all([
    fetchJson<any[]>(`/api/dictionaries/categories?workspaceId=${workspace_id}`),
    fetchJson<any[]>(`/api/dictionaries/payment_types?workspaceId=${workspace_id}`),
    fetchJson<any[]>(`/api/dictionaries/currencies`),
  ]);

  const mapOptions = (list: any[]): DictOption[] =>
    list.map((item) => ({
      id: String(item.id),
      label: item.name ?? item.code ?? String(item.id),
    }));

  return (
    <WorkspaceClientPage
      workspaceId={workspace_id}
      initialCategories={mapOptions(categories)}
      initialPaymentTypes={mapOptions(paymentTypes)}
      initialCurrencies={mapOptions(currencies)}
    />
  );
}
