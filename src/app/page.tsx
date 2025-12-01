"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  AppLayout,
  Badge,
  Button,
  Card,
  PageContent,
  PageHeader,
  Skeleton,
} from "@/components/ui";
import type { WorkspaceListItem } from "@/types/workspaces";
import { useAuth } from "@/providers/AuthProvider";
import { useApiFetch } from "@/lib/api/client";
import CreateWorkspaceDialog from "@/components/workspaces/CreateWorkspaceDialog";
import Header from "@/components/layout/Header";

export default function HomePage() {
  const { session } = useAuth();
  const apiFetch = useApiFetch();
  const queryClient = useQueryClient();

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const userId = session?.user?.id ?? null;
  const workspaceQueryKey = useMemo(
    () => ["workspaces", userId] as const,
    [userId]
  );

  const workspaceQuery = useQuery({
    queryKey: workspaceQueryKey,
    queryFn: async () => {
      const data = await apiFetch<WorkspaceListItem[]>("/api/workspaces");
      return data ?? [];
    },
    enabled: Boolean(userId),
  });

  const workspaces = workspaceQuery.data ?? [];
  const showSkeleton = Boolean(userId) && workspaceQuery.isLoading;
  const hasWorkspaces = workspaces.length > 0;
  const errorMessage = workspaceQuery.error
    ? workspaceQuery.error instanceof Error
      ? workspaceQuery.error.message
      : "Failed to load workspaces"
    : null;
  const showEmptyState = !showSkeleton && !errorMessage && !hasWorkspaces;

  return (
    <>
      <AppLayout header={<Header user={session} />}>
        {hasWorkspaces ? (
          <PageHeader
            className="mb-6"
            title="Your workspaces"
            description="Pick a workspace to continue or create a new one for your family."
            actions={
              <Button onClick={() => setCreateModalOpen(true)}>
                New workspace
              </Button>
            }
          />
        ) : null}

        {showSkeleton ? (
          <PageContent className="max-w-6xl w-full py-0">
            <WorkspaceGridSkeleton />
          </PageContent>
        ) : errorMessage ? (
          <PageContent className="max-w-6xl w-full py-0">
            <Alert
              variant="danger"
              title="Unable to load workspaces"
              description={errorMessage}
              action={
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    void workspaceQuery.refetch();
                  }}
                >
                  Try again
                </Button>
              }
            />
          </PageContent>
        ) : showEmptyState ? (
          <div className="flex flex-1 items-start justify-center px-6 py-12">
            <Card className="w-full max-w-md text-center" padding="lg">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-[hsl(var(--fg))]">
                    No workspaces yet
                  </h2>
                  <p className="text-sm text-[hsl(var(--fg-muted))]">
                    Start tracking your family budget by creating your first
                    workspace.
                  </p>
                </div>
                <Button onClick={() => setCreateModalOpen(true)}>
                  Create workspace
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <PageContent className="max-w-6xl w-full py-0">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((workspace) => (
                <WorkspaceCardItem key={workspace.id} workspace={workspace} />
              ))}
            </div>
          </PageContent>
        )}
      </AppLayout>

      <CreateWorkspaceDialog
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreated={() => {
          void queryClient.invalidateQueries({ queryKey: workspaceQueryKey });
        }}
      />
    </>
  );
}


function WorkspaceCardItem({ workspace }: { workspace: WorkspaceListItem }) {
  return (
    <Link
      href={`/${workspace.id}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]"
    >
      <Card className="h-full gap-3 transition duration-150 group-hover:-translate-y-0.5 group-hover:shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-[hsl(var(--fg))]">
              {workspace.name}
            </h3>
            <p className="text-sm text-[hsl(var(--fg-muted))]">
              Continue tracking budgets and members.
            </p>
          </div>
          <Badge variant="primary" className="capitalize">
            {workspace.role}
          </Badge>
        </div>
        <div className="text-sm font-medium text-[hsl(var(--color-primary))]">
          Open workspace {"\u2192"}
        </div>
      </Card>
    </Link>
  );
}

function WorkspaceGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="gap-3" padding="lg">
          <div className="space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </Card>
      ))}
    </div>
  );
}
