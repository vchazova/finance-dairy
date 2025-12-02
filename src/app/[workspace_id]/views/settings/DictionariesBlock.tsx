"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useApiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/queryKeys";
import {
  normalizeCategoryRow,
  normalizeCurrencyRow,
  normalizePaymentTypeRow,
  type NormalizedCategory,
  type NormalizedCurrency,
  type NormalizedPaymentType,
} from "@/entities/dictionaries/normalize";
import type { SectionStatus } from "@/components/settings/DictionaryUI";
import { CategoriesSection } from "./sections/CategoriesSection";
import { PaymentTypesSection } from "./sections/PaymentTypesSection";
import { CurrenciesSection } from "./sections/CurrenciesSection";

const THIRTY_MINUTES_MS = 30 * 60 * 1000;
const SECTION_SPACING = "space-y-4 sm:space-y-5";

export type WorkspaceDictionariesBlockProps = {
  workspaceId: string;
  workspaceSlug: string;
  initialCategories?: NormalizedCategory[];
  initialPaymentTypes?: NormalizedPaymentType[];
  initialCurrencies?: NormalizedCurrency[];
};

export function WorkspaceDictionariesBlock({
  workspaceId,
  workspaceSlug,
  initialCategories = [],
  initialPaymentTypes = [],
  initialCurrencies = [],
}: WorkspaceDictionariesBlockProps) {
  const { session } = useAuth();
  const apiFetch = useApiFetch();
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories(workspaceSlug),
    queryFn: async () => {
      const rows = await apiFetch<any[]>(
        `/api/dictionaries/categories?workspaceId=${workspaceId}`
      );
      return rows.map((row) => normalizeCategoryRow(row));
    },
    initialData: initialCategories.length ? initialCategories : undefined,
    enabled: !!session?.user?.id,
    staleTime: THIRTY_MINUTES_MS,
  });

  const paymentTypesQuery = useQuery({
    queryKey: queryKeys.paymentTypes(workspaceSlug),
    queryFn: async () => {
      const rows = await apiFetch<any[]>(
        `/api/dictionaries/payment_types?workspaceId=${workspaceId}`
      );
      return rows.map((row) => normalizePaymentTypeRow(row));
    },
    initialData: initialPaymentTypes.length ? initialPaymentTypes : undefined,
    enabled: !!session?.user?.id,
    staleTime: THIRTY_MINUTES_MS,
  });

  const currenciesQuery = useQuery({
    queryKey: queryKeys.currencies,
    queryFn: async () => {
      const rows = await apiFetch<any[]>(`/api/dictionaries/currencies`);
      return rows.map((row) => normalizeCurrencyRow(row));
    },
    initialData: initialCurrencies.length ? initialCurrencies : undefined,
    enabled: !!session?.user?.id,
    staleTime: THIRTY_MINUTES_MS,
  });

  const categoryStatus: SectionStatus = {
    loading: categoriesQuery.isPending || categoriesQuery.isRefetching,
    error: (categoriesQuery.error as Error | null)?.message ?? null,
  };
  const paymentStatus: SectionStatus = {
    loading: paymentTypesQuery.isPending || paymentTypesQuery.isRefetching,
    error: (paymentTypesQuery.error as Error | null)?.message ?? null,
  };
  const currencyStatus: SectionStatus = {
    loading: currenciesQuery.isPending || currenciesQuery.isRefetching,
    error: (currenciesQuery.error as Error | null)?.message ?? null,
  };

  const reloadCategories = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories(workspaceSlug),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.categoryOptions(workspaceSlug),
      }),
    ]);
  };

  const reloadPaymentTypes = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.paymentTypes(workspaceSlug),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.paymentTypeOptions(workspaceSlug),
      }),
    ]);
  };

  const reloadCurrencies = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.currencies }),
      queryClient.invalidateQueries({ queryKey: queryKeys.currencyOptions }),
    ]);
  };

  return (
    <div className={SECTION_SPACING}>
      <CategoriesSection
        workspaceId={workspaceId}
        workspaceSlug={workspaceSlug}
        data={categoriesQuery.data ?? []}
        status={categoryStatus}
        onReload={reloadCategories}
        apiFetch={apiFetch}
      />

      <PaymentTypesSection
        workspaceId={workspaceId}
        data={paymentTypesQuery.data ?? []}
        status={paymentStatus}
        currencies={currenciesQuery.data ?? []}
        currencyStatus={currencyStatus}
        onReload={reloadPaymentTypes}
        onReloadCurrencies={reloadCurrencies}
        apiFetch={apiFetch}
      />

      <CurrenciesSection
        data={currenciesQuery.data ?? []}
        status={currencyStatus}
        onReload={reloadCurrencies}
        apiFetch={apiFetch}
      />
    </div>
  );
}
