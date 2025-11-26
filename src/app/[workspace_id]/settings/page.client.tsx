"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { useAuth } from "@/providers/AuthProvider";
import { useApiFetch } from "@/lib/api/client";
import {
  normalizeCategoryRow,
  normalizePaymentTypeRow,
  normalizeCurrencyRow,
  type NormalizedCategory,
  type NormalizedPaymentType,
  type NormalizedCurrency,
} from "@/entities/dictionaries/normalize";

type Status = { loading: boolean; error: string | null };
type CategoryDraft = { name: string; icon: string; color: string };
type PaymentTypeDraft = {
  name: string;
  icon: string;
  defaultCurrencyId: string;
};
type CurrencyDraft = { code: string; name: string; symbol: string };

export default function WorkspaceSettingsClient({
  workspaceId,
  initialCategories = [],
  initialPaymentTypes = [],
  initialCurrencies = [],
}: {
  workspaceId: string;
  initialCategories?: NormalizedCategory[];
  initialPaymentTypes?: NormalizedPaymentType[];
  initialCurrencies?: NormalizedCurrency[];
}) {
  const { session } = useAuth();
  const apiFetch = useApiFetch();
  const workspaceIdNum = useMemo(() => Number(workspaceId), [workspaceId]);

  const [categories, setCategories] =
    useState<NormalizedCategory[]>(initialCategories);
  const [paymentTypes, setPaymentTypes] =
    useState<NormalizedPaymentType[]>(initialPaymentTypes);
  const [currencies, setCurrencies] =
    useState<NormalizedCurrency[]>(initialCurrencies);

  const [categoryStatus, setCategoryStatus] = useState<Status>({
    loading: false,
    error: null,
  });
  const [paymentTypeStatus, setPaymentTypeStatus] = useState<Status>({
    loading: false,
    error: null,
  });
  const [currencyStatus, setCurrencyStatus] = useState<Status>({
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (initialCategories.length === 0) void reloadCategories();
    if (initialPaymentTypes.length === 0) void reloadPaymentTypes();
    if (initialCurrencies.length === 0) void reloadCurrencies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function reloadCategories() {
    if (!workspaceIdNum || Number.isNaN(workspaceIdNum)) return;
    setCategoryStatus({ loading: true, error: null });
    try {
      const rows = await apiFetch<any[]>(
        `/api/dictionaries/categories?workspaceId=${workspaceId}`
      );
      setCategories(rows.map((row) => normalizeCategoryRow(row)));
      setCategoryStatus({ loading: false, error: null });
    } catch (e: any) {
      setCategoryStatus({
        loading: false,
        error: e?.message || "Не удалось загрузить категории",
      });
    }
  }

  async function reloadPaymentTypes() {
    if (!workspaceIdNum || Number.isNaN(workspaceIdNum)) return;
    setPaymentTypeStatus({ loading: true, error: null });
    try {
      const rows = await apiFetch<any[]>(
        `/api/dictionaries/payment_types?workspaceId=${workspaceId}`
      );
      setPaymentTypes(rows.map((row) => normalizePaymentTypeRow(row)));
      setPaymentTypeStatus({ loading: false, error: null });
    } catch (e: any) {
      setPaymentTypeStatus({
        loading: false,
        error: e?.message || "Не удалось загрузить типы платежей",
      });
    }
  }

  async function reloadCurrencies() {
    setCurrencyStatus({ loading: true, error: null });
    try {
      const rows = await apiFetch<any[]>(`/api/dictionaries/currencies`);
      setCurrencies(rows.map((row) => normalizeCurrencyRow(row)));
      setCurrencyStatus({ loading: false, error: null });
    } catch (e: any) {
      setCurrencyStatus({
        loading: false,
        error: e?.message || "Не удалось загрузить валюты",
      });
    }
  }

  return (
    <div className="min-h-dvh bg-[hsl(var(--bg))] text-[hsl(var(--fg))]">
      <Header user={session} />
      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[hsl(var(--fg-muted))]">
                Workspace settings
              </p>
              <h1 className="text-2xl font-semibold leading-tight">
                Справочники
              </h1>
              <p className="text-sm text-[hsl(var(--fg-muted))]">
                Управляйте категориями, типами платежей и валютами для рабочего
                пространства.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/${workspaceId}`}
                className="h-9 rounded-xl border border-[hsl(var(--border))] px-3 text-sm hover:bg-[hsl(var(--bg))]"
              >
                Назад
              </Link>
              <span className="rounded-full border border-[hsl(var(--border))] px-3 py-1 text-xs text-[hsl(var(--fg-muted))]">
                Workspace #{workspaceId}
              </span>
            </div>
          </div>
        </div>

        <CategoriesBlock
          workspaceId={workspaceId}
          data={categories}
          status={categoryStatus}
          onReload={reloadCategories}
          apiFetch={apiFetch}
        />

        <PaymentTypesBlock
          workspaceId={workspaceId}
          data={paymentTypes}
          status={paymentTypeStatus}
          currencies={currencies}
          currencyStatus={currencyStatus}
          onReload={reloadPaymentTypes}
          onReloadCurrencies={reloadCurrencies}
          apiFetch={apiFetch}
        />

        <CurrenciesBlock
          data={currencies}
          status={currencyStatus}
          onReload={reloadCurrencies}
          apiFetch={apiFetch}
        />
      </main>
    </div>
  );
}

function SectionShell({
  title,
  description,
  count,
  status,
  onReload,
  children,
}: {
  title: string;
  description: string;
  count: number;
  status: Status;
  onReload: () => void | Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-[hsl(var(--fg-muted))]">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onReload()}
            disabled={status.loading}
            className="h-9 rounded-xl border border-[hsl(var(--border))] px-3 text-sm hover:bg-[hsl(var(--card))] disabled:opacity-60"
          >
            {status.loading ? "Обновляем..." : "Обновить"}
          </button>
          <span className="rounded-full bg-[hsl(var(--card))] px-3 py-1 text-xs text-[hsl(var(--fg-muted))]">
            {count} шт.
          </span>
        </div>
      </div>
      <div className="mt-5">{children}</div>
      {status.error && (
        <p className="mt-3 text-sm text-red-600">{status.error}</p>
      )}
    </section>
  );
}

function CategoriesBlock({
  workspaceId,
  data,
  status,
  onReload,
  apiFetch,
}: {
  workspaceId: string;
  data: NormalizedCategory[];
  status: Status;
  onReload: () => Promise<void>;
  apiFetch: ReturnType<typeof useApiFetch>;
}) {
  const [draft, setDraft] = useState<CategoryDraft>({
    name: "",
    icon: "",
    color: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const reset = () => setDraft({ name: "", icon: "", color: "" });

  async function createCategory() {
    if (!draft.name.trim()) {
      setActionError("Название обязательно");
      return;
    }
    setActionError(null);
    setMutatingId("new");
    try {
      await apiFetch("/api/dictionaries/categories", {
        method: "POST",
        body: JSON.stringify({
          workspace_id: Number(workspaceId),
          name: draft.name.trim(),
          icon: draft.icon.trim() || null,
          color: draft.color.trim() || null,
        }),
      });
      reset();
      await onReload();
    } catch (e: any) {
      setActionError(e?.message || "Не удалось создать категорию");
    } finally {
      setMutatingId(null);
    }
  }

  async function updateCategory(id: string, input: CategoryDraft) {
    if (!input.name.trim()) {
      setActionError("Название обязательно");
      return;
    }
    setActionError(null);
    setMutatingId(id);
    try {
      await apiFetch(`/api/dictionaries/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: input.name.trim(),
          icon: input.icon.trim() || null,
          color: input.color.trim() || null,
        }),
      });
      setEditId(null);
      await onReload();
    } catch (e: any) {
      setActionError(e?.message || "Не удалось обновить категорию");
    } finally {
      setMutatingId(null);
    }
  }

  async function removeCategory(id: string) {
    const row = data.find((c) => c.id === id);
    if (!row) return;
    const ok = window.confirm(`Удалить категорию "${row.name}"?`);
    if (!ok) return;
    setActionError(null);
    setMutatingId(id);
    try {
      await apiFetch(`/api/dictionaries/categories/${id}`, {
        method: "DELETE",
      });
      await onReload();
    } catch (e: any) {
      setActionError(e?.message || "Не удалось удалить категорию");
    } finally {
      setMutatingId(null);
    }
  }

  return (
    <SectionShell
      title="Категории"
      description="Используются в транзакциях для группировки расходов и доходов."
      count={data.length}
      status={status}
      onReload={onReload}
    >
      <div className="grid gap-5 lg:grid-cols-[320px,1fr]">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <h3 className="text-sm font-semibold">Добавить категорию</h3>
          <div className="mt-3 space-y-3">
            <LabeledInput
              label="Название"
              placeholder="Продукты, Путешествия..."
              value={draft.name}
              onChange={(v) => setDraft((p) => ({ ...p, name: v }))}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <LabeledInput
                label="Иконка"
                placeholder="emoji или icon name"
                value={draft.icon}
                onChange={(v) => setDraft((p) => ({ ...p, icon: v }))}
              />
              <LabeledInput
                label="Цвет"
                placeholder="#5b8def"
                value={draft.color}
                onChange={(v) => setDraft((p) => ({ ...p, color: v }))}
              />
            </div>
            {actionError && (
              <p className="text-sm text-red-600">{actionError}</p>
            )}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={reset}
                className="h-9 rounded-xl border border-[hsl(var(--border))] px-3 text-sm hover:bg-[hsl(var(--bg))]"
              >
                Сбросить
              </button>
              <button
                type="button"
                onClick={createCategory}
                disabled={mutatingId === "new"}
                className="h-9 rounded-xl bg-[hsl(var(--color-primary))] px-3 text-sm text-white disabled:opacity-60"
              >
                {mutatingId === "new" ? "Сохраняем..." : "Добавить"}
              </button>
            </div>
          </div>
        </div>

        <DictionaryTable
          columns={["Название", "Иконка", "Цвет"]}
          loading={status.loading}
          emptyText="Категории пока не созданы."
          rows={data.map((row) => {
            const isEditing = editId === row.id;
            return (
              <DictionaryRow
                key={row.id}
                cells={[
                  isEditing ? (
                    <InlineInput
                      value={draft.name}
                      onChange={(v) => setDraft((p) => ({ ...p, name: v }))}
                    />
                  ) : (
                    <span className="font-medium">{row.name}</span>
                  ),
                  isEditing ? (
                    <InlineInput
                      value={draft.icon}
                      onChange={(v) => setDraft((p) => ({ ...p, icon: v }))}
                    />
                  ) : (
                    row.icon || "—"
                  ),
                  isEditing ? (
                    <InlineInput
                      value={draft.color}
                      onChange={(v) => setDraft((p) => ({ ...p, color: v }))}
                    />
                  ) : (
                    row.color || "—"
                  ),
                ]}
                actions={
                  isEditing ? (
                    <>
                      <ActionButton
                        onClick={() => setEditId(null)}
                        text="Отмена"
                        variant="ghost"
                      />
                      <ActionButton
                        onClick={() => updateCategory(row.id, draft)}
                        text={
                          mutatingId === row.id ? "Сохраняем..." : "Сохранить"
                        }
                        disabled={mutatingId === row.id}
                        variant="primary"
                      />
                    </>
                  ) : (
                    <>
                      <ActionButton
                        onClick={() => {
                          setEditId(row.id);
                          setDraft({
                            name: row.name,
                            icon: row.icon || "",
                            color: row.color || "",
                          });
                        }}
                        text="Изменить"
                      />
                      <ActionButton
                        onClick={() => removeCategory(row.id)}
                        text={mutatingId === row.id ? "..." : "Удалить"}
                        disabled={mutatingId === row.id}
                        variant="danger"
                      />
                    </>
                  )
                }
              />
            );
          })}
        />
      </div>
    </SectionShell>
  );
}

function PaymentTypesBlock({
  workspaceId,
  data,
  status,
  currencies,
  currencyStatus,
  onReload,
  onReloadCurrencies,
  apiFetch,
}: {
  workspaceId: string;
  data: NormalizedPaymentType[];
  status: Status;
  currencies: NormalizedCurrency[];
  currencyStatus: Status;
  onReload: () => Promise<void>;
  onReloadCurrencies: () => Promise<void>;
  apiFetch: ReturnType<typeof useApiFetch>;
}) {
  const [draft, setDraft] = useState<PaymentTypeDraft>({
    name: "",
    icon: "",
    defaultCurrencyId: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const reset = () => setDraft({ name: "", icon: "", defaultCurrencyId: "" });

  async function createPaymentType() {
    if (!draft.name.trim()) {
      setActionError("Название обязательно");
      return;
    }
    setActionError(null);
    setMutatingId("new");
    try {
      await apiFetch("/api/dictionaries/payment_types", {
        method: "POST",
        body: JSON.stringify({
          workspace_id: Number(workspaceId),
          name: draft.name.trim(),
          icon: draft.icon.trim() || null,
          default_currency_id: draft.defaultCurrencyId
            ? Number(draft.defaultCurrencyId)
            : null,
        }),
      });
      reset();
      await onReload();
    } catch (e: any) {
      setActionError(e?.message || "Не удалось создать тип платежа");
    } finally {
      setMutatingId(null);
    }
  }

  async function updatePaymentType(id: string, input: PaymentTypeDraft) {
    if (!input.name.trim()) {
      setActionError("Название обязательно");
      return;
    }
    setActionError(null);
    setMutatingId(id);
    try {
      await apiFetch(`/api/dictionaries/payment_types/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: input.name.trim(),
          icon: input.icon.trim() || null,
          default_currency_id: input.defaultCurrencyId
            ? Number(input.defaultCurrencyId)
            : null,
        }),
      });
      setEditId(null);
      await onReload();
    } catch (e: any) {
      setActionError(e?.message || "Не удалось обновить тип платежа");
    } finally {
      setMutatingId(null);
    }
  }

  async function removePaymentType(id: string) {
    const row = data.find((c) => c.id === id);
    if (!row) return;
    const ok = window.confirm(`Удалить тип платежа "${row.name}"?`);
    if (!ok) return;
    setActionError(null);
    setMutatingId(id);
    try {
      await apiFetch(`/api/dictionaries/payment_types/${id}`, {
        method: "DELETE",
      });
      await onReload();
    } catch (e: any) {
      setActionError(e?.message || "Не удалось удалить тип платежа");
    } finally {
      setMutatingId(null);
    }
  }

  return (
    <SectionShell
      title="Типы платежей"
      description="Карты, наличные, счета — все способы оплаты вашего пространства."
      count={data.length}
      status={status}
      onReload={onReload}
    >
      <div className="grid gap-5 lg:grid-cols-[320px,1fr]">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Добавить тип</h3>
            <button
              type="button"
              onClick={() => onReloadCurrencies()}
              disabled={currencyStatus.loading}
              className="text-xs text-[hsl(var(--fg-muted))] underline-offset-4 hover:underline disabled:opacity-60"
            >
              {currencyStatus.loading ? "Обновляем..." : "Обновить валюты"}
            </button>
          </div>
          <div className="mt-3 space-y-3">
            <LabeledInput
              label="Название"
              placeholder="Карта, Наличные..."
              value={draft.name}
              onChange={(v) => setDraft((p) => ({ ...p, name: v }))}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <LabeledInput
                label="Иконка"
                placeholder="emoji или icon name"
                value={draft.icon}
                onChange={(v) => setDraft((p) => ({ ...p, icon: v }))}
              />
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-[hsl(var(--fg-muted))]">
                  Валюта по умолчанию
                </label>
                <select
                  value={draft.defaultCurrencyId}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      defaultCurrencyId: e.target.value,
                    }))
                  }
                  className="block w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm"
                >
                  <option value="">Не выбрана</option>
                  {currencies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {actionError && (
              <p className="text-sm text-red-600">{actionError}</p>
            )}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={reset}
                className="h-9 rounded-xl border border-[hsl(var(--border))] px-3 text-sm hover:bg-[hsl(var(--bg))]"
              >
                Сбросить
              </button>
              <button
                type="button"
                onClick={createPaymentType}
                disabled={mutatingId === "new"}
                className="h-9 rounded-xl bg-[hsl(var(--color-primary))] px-3 text-sm text-white disabled:opacity-60"
              >
                {mutatingId === "new" ? "Сохраняем..." : "Добавить"}
              </button>
            </div>
          </div>
        </div>

        <DictionaryTable
          columns={["Название", "Иконка", "Валюта по умолчанию"]}
          loading={status.loading}
          emptyText="Нет типов платежей."
          rows={data.map((row) => {
            const isEditing = editId === row.id;
            const currentCurrency = row.defaultCurrencyId
              ? currencies.find((c) => c.id === row.defaultCurrencyId)?.code ||
                row.defaultCurrencyId
              : "—";
            return (
              <DictionaryRow
                key={row.id}
                cells={[
                  isEditing ? (
                    <InlineInput
                      value={draft.name}
                      onChange={(v) => setDraft((p) => ({ ...p, name: v }))}
                    />
                  ) : (
                    <span className="font-medium">{row.name}</span>
                  ),
                  isEditing ? (
                    <InlineInput
                      value={draft.icon}
                      onChange={(v) => setDraft((p) => ({ ...p, icon: v }))}
                    />
                  ) : (
                    row.icon || "—"
                  ),
                  isEditing ? (
                    <select
                      value={draft.defaultCurrencyId}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          defaultCurrencyId: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-2 py-1 text-sm"
                    >
                      <option value="">Не выбрана</option>
                      {currencies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} — {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    currentCurrency
                  ),
                ]}
                actions={
                  isEditing ? (
                    <>
                      <ActionButton
                        onClick={() => setEditId(null)}
                        text="Отмена"
                        variant="ghost"
                      />
                      <ActionButton
                        onClick={() => updatePaymentType(row.id, draft)}
                        text={
                          mutatingId === row.id ? "Сохраняем..." : "Сохранить"
                        }
                        disabled={mutatingId === row.id}
                        variant="primary"
                      />
                    </>
                  ) : (
                    <>
                      <ActionButton
                        onClick={() => {
                          setEditId(row.id);
                          setDraft({
                            name: row.name,
                            icon: row.icon || "",
                            defaultCurrencyId: row.defaultCurrencyId || "",
                          });
                        }}
                        text="Изменить"
                      />
                      <ActionButton
                        onClick={() => removePaymentType(row.id)}
                        text={mutatingId === row.id ? "..." : "Удалить"}
                        disabled={mutatingId === row.id}
                        variant="danger"
                      />
                    </>
                  )
                }
              />
            );
          })}
        />
      </div>
    </SectionShell>
  );
}

function CurrenciesBlock({
  data,
  status,
  onReload,
  apiFetch,
}: {
  data: NormalizedCurrency[];
  status: Status;
  onReload: () => Promise<void>;
  apiFetch: ReturnType<typeof useApiFetch>;
}) {
  const [draft, setDraft] = useState<CurrencyDraft>({
    code: "",
    name: "",
    symbol: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const reset = () => setDraft({ code: "", name: "", symbol: "" });

  async function createCurrency() {
    if (!draft.code.trim() || !draft.name.trim() || !draft.symbol.trim()) {
      setActionError("Код, название и символ обязательны");
      return;
    }
    setActionError(null);
    setMutatingId("new");
    try {
      await apiFetch("/api/dictionaries/currencies", {
        method: "POST",
        body: JSON.stringify({
          code: draft.code.trim().toUpperCase(),
          name: draft.name.trim(),
          symbol: draft.symbol.trim(),
        }),
      });
      reset();
      await onReload();
    } catch (e: any) {
      setActionError(e?.message || "Не удалось создать валюту");
    } finally {
      setMutatingId(null);
    }
  }

  async function updateCurrency(id: string, input: CurrencyDraft) {
    if (!input.code.trim() || !input.name.trim() || !input.symbol.trim()) {
      setActionError("Все поля обязательны");
      return;
    }
    setActionError(null);
    setMutatingId(id);
    try {
      await apiFetch(`/api/dictionaries/currencies/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          code: input.code.trim().toUpperCase(),
          name: input.name.trim(),
          symbol: input.symbol.trim(),
        }),
      });
      setEditId(null);
      await onReload();
    } catch (e: any) {
      setActionError(e?.message || "Не удалось обновить валюту");
    } finally {
      setMutatingId(null);
    }
  }

  async function removeCurrency(id: string) {
    const row = data.find((c) => c.id === id);
    if (!row) return;
    const ok = window.confirm(`Удалить валюту "${row.code}"?`);
    if (!ok) return;
    setActionError(null);
    setMutatingId(id);
    try {
      await apiFetch(`/api/dictionaries/currencies/${id}`, {
        method: "DELETE",
      });
      await onReload();
    } catch (e: any) {
      setActionError(e?.message || "Не удалось удалить валюту");
    } finally {
      setMutatingId(null);
    }
  }

  return (
    <SectionShell
      title="Валюты"
      description="Глобальный справочник, используемый во всех рабочих пространствах."
      count={data.length}
      status={status}
      onReload={onReload}
    >
      <div className="grid gap-5 lg:grid-cols-[320px,1fr]">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <h3 className="text-sm font-semibold">Добавить валюту</h3>
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <LabeledInput
                label="Код"
                placeholder="USD"
                value={draft.code}
                onChange={(v) => setDraft((p) => ({ ...p, code: v }))}
              />
              <LabeledInput
                label="Символ"
                placeholder="$"
                value={draft.symbol}
                onChange={(v) => setDraft((p) => ({ ...p, symbol: v }))}
              />
            </div>
            <LabeledInput
              label="Название"
              placeholder="Доллар США"
              value={draft.name}
              onChange={(v) => setDraft((p) => ({ ...p, name: v }))}
            />
            {actionError && (
              <p className="text-sm text-red-600">{actionError}</p>
            )}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={reset}
                className="h-9 rounded-xl border border-[hsl(var(--border))] px-3 text-sm hover:bg-[hsl(var(--bg))]"
              >
                Сбросить
              </button>
              <button
                type="button"
                onClick={createCurrency}
                disabled={mutatingId === "new"}
                className="h-9 rounded-xl bg-[hsl(var(--color-primary))] px-3 text-sm text-white disabled:opacity-60"
              >
                {mutatingId === "new" ? "Сохраняем..." : "Добавить"}
              </button>
            </div>
          </div>
        </div>

        <DictionaryTable
          columns={["Код", "Название", "Символ"]}
          loading={status.loading}
          emptyText="Валюты не найдены."
          rows={data.map((row) => {
            const isEditing = editId === row.id;
            return (
              <DictionaryRow
                key={row.id}
                cells={[
                  isEditing ? (
                    <InlineInput
                      value={draft.code}
                      onChange={(v) => setDraft((p) => ({ ...p, code: v }))}
                    />
                  ) : (
                    <span className="font-medium">{row.code}</span>
                  ),
                  isEditing ? (
                    <InlineInput
                      value={draft.name}
                      onChange={(v) => setDraft((p) => ({ ...p, name: v }))}
                    />
                  ) : (
                    row.name
                  ),
                  isEditing ? (
                    <InlineInput
                      value={draft.symbol}
                      onChange={(v) => setDraft((p) => ({ ...p, symbol: v }))}
                    />
                  ) : (
                    row.symbol
                  ),
                ]}
                actions={
                  isEditing ? (
                    <>
                      <ActionButton
                        onClick={() => setEditId(null)}
                        text="Отмена"
                        variant="ghost"
                      />
                      <ActionButton
                        onClick={() => updateCurrency(row.id, draft)}
                        text={
                          mutatingId === row.id ? "Сохраняем..." : "Сохранить"
                        }
                        disabled={mutatingId === row.id}
                        variant="primary"
                      />
                    </>
                  ) : (
                    <>
                      <ActionButton
                        onClick={() => {
                          setEditId(row.id);
                          setDraft({
                            code: row.code,
                            name: row.name,
                            symbol: row.symbol,
                          });
                        }}
                        text="Изменить"
                      />
                      <ActionButton
                        onClick={() => removeCurrency(row.id)}
                        text={mutatingId === row.id ? "..." : "Удалить"}
                        disabled={mutatingId === row.id}
                        variant="danger"
                      />
                    </>
                  )
                }
              />
            );
          })}
        />
      </div>
    </SectionShell>
  );
}

function DictionaryTable({
  columns,
  rows,
  loading,
  emptyText,
}: {
  columns: string[];
  rows: React.ReactNode[];
  loading: boolean;
  emptyText: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))]">
      <table className="w-full text-sm">
        <thead className="bg-[hsl(var(--card))]">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-2 text-left">
                {col}
              </th>
            ))}
            <th className="px-4 py-2 text-right">Действия</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr className="border-t border-[hsl(var(--border))]">
              <td className="px-4 py-3" colSpan={columns.length + 1}>
                Загрузка...
              </td>
            </tr>
          )}
          {!loading && rows.length === 0 && (
            <tr className="border-t border-[hsl(var(--border))]">
              <td
                className="px-4 py-3 text-[hsl(var(--fg-muted))]"
                colSpan={columns.length + 1}
              >
                {emptyText}
              </td>
            </tr>
          )}
          {!loading && rows}
        </tbody>
      </table>
    </div>
  );
}

function DictionaryRow({
  cells,
  actions,
}: {
  cells: React.ReactNode[];
  actions: React.ReactNode;
}) {
  return (
    <tr className="border-t border-[hsl(var(--border))]">
      {cells.map((cell, idx) => (
        <td key={idx} className="px-4 py-2 align-middle text-[hsl(var(--fg))]">
          {cell}
        </td>
      ))}
      <td className="px-4 py-2 text-right">
        <div className="flex justify-end gap-2 text-xs">{actions}</div>
      </td>
    </tr>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wide text-[hsl(var(--fg-muted))]">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]"
      />
    </div>
  );
}

function InlineInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-2 py-1 text-sm"
    />
  );
}

function ActionButton({
  text,
  onClick,
  variant = "ghost",
  disabled,
}: {
  text: string;
  onClick: () => void;
  variant?: "primary" | "danger" | "ghost";
  disabled?: boolean;
}) {
  const classes =
    variant === "primary"
      ? "bg-[hsl(var(--color-primary))] text-white"
      : variant === "danger"
      ? "border border-red-200 text-red-600 hover:bg-red-50"
      : "border border-[hsl(var(--border))]";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-3 py-1 ${classes} disabled:opacity-60`}
    >
      {text}
    </button>
  );
}
