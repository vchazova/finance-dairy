"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  AppLayout,
  Badge,
  Button,
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyState,
  PageContent,
  PageHeader,
  Skeleton,
} from "@/components/ui";
import type { WorkspaceListItem } from "@/types/workspaces";
import type { WorkspaceInviteListItem } from "@/data/invitedMembers/invitedMembers.repo";
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

  const invitesSummaryQuery = useQuery({
    queryKey: ["workspace-invites-summary", userId],
    queryFn: async () => {
      return apiFetch<PendingInvitePreview[]>(`/api/invites?status=pending`);
    },
    enabled: Boolean(userId),
  });

  const pendingInvites = invitesSummaryQuery.data ?? [];
  const showInvitesCard = pendingInvites.length > 0;
  const [processingInviteId, setProcessingInviteId] = useState<string | null>(null);

  const inviteActionMutation = useMutation({
    mutationFn: async ({ inviteId, action }: { inviteId: string; action: "accept" | "decline" }) => {
      await apiFetch(`/api/invites/${inviteId}`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
    },
    onMutate: ({ inviteId }) => {
      setProcessingInviteId(inviteId);
    },
    onSettled: async () => {
      setProcessingInviteId(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["workspace-invites-summary", userId] }),
        queryClient.invalidateQueries({ queryKey: workspaceQueryKey }),
      ]);
    },
  });
  const handleInviteAction = (inviteId: string, action: "accept" | "decline") => {
    inviteActionMutation.mutate({ inviteId, action });
  };

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
          <PageContent className="max-w-6xl w-full space-y-6 py-0">
            <section>
              <h2 className="sr-only">Workspaces</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {workspaces.map((workspace) => (
                  <WorkspaceCardItem key={workspace.id} workspace={workspace} />
                ))}
              </div>
            </section>

            {showInvitesCard && (
              <section className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-[hsl(var(--fg))]">
                      Pending invitations
                    </h2>
                    <p className="text-sm text-[hsl(var(--fg-muted))]">
                      Invites sent to your email that you can accept or decline.
                    </p>
                  </div>
                  <Badge variant="warning" className="text-xs">
                    {pendingInvites.length}
                  </Badge>
                </div>
                <PendingInvitesTable
                  invites={pendingInvites}
                  onAction={handleInviteAction}
                  processingInviteId={processingInviteId}
                />
              </section>
            )}
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
  const description = workspace.description?.trim();
  const createdAtFormatted = formatWorkspaceCreatedAt(workspace.createdAt);
  const router = useRouter();
  const isOwner = workspace.role === "owner";
  const workspacePath = workspace.slug?.trim() || workspace.id;
  const workspaceHref = `/${workspacePath}`;
  const settingsHref = `${workspaceHref}?mode=settings`;
  return (
    <Link
      href={workspaceHref}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]"
    >
      <Card className="h-full transition duration-150 group-hover:-translate-y-0.5 group-hover:shadow-lg">
        <div className="flex h-full flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[hsl(var(--fg))]">
                {workspace.name}
              </h3>
              {description && (
                <p className="text-sm text-[hsl(var(--fg-muted))] py-2 line-clamp-2">
                  {description}
                </p>
              )}
              {createdAtFormatted && (
                <p className="text-xs text-[hsl(var(--fg-muted))]">
                  created at {createdAtFormatted}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="primary" className="capitalize">
                {workspace.role}
              </Badge>
              {isOwner ? (
                <button
                  type="button"
                  aria-label="Workspace settings"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(var(--border))] text-lg leading-none text-[hsl(var(--fg))] transition hover:bg-[hsl(var(--card))]"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    router.push(settingsHref);
                  }}
                >
                  <Settings className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Workspace settings</span>
                </button>
              ) : null}
            </div>
          </div>
          <div className="mt-auto text-sm font-medium text-[hsl(var(--color-primary))]">
            Open workspace {"\u2192"}
          </div>
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

function formatWorkspaceCreatedAt(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

type PendingInvitePreview = WorkspaceInviteListItem & {
  workspaceName: string;
  workspaceSlug: string;
};

function PendingInvitesTable({
  invites,
  onAction,
  processingInviteId,
}: {
  invites: PendingInvitePreview[];
  onAction: (inviteId: string, action: "accept" | "decline") => void;
  processingInviteId: string | null;
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-[hsl(var(--border))]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell header>Invitee</TableCell>
            <TableCell header>Workspace</TableCell>
            <TableCell header className="w-28">
              Role
            </TableCell>
            <TableCell header className="w-40">
              Invited
            </TableCell>
            <TableCell header className="w-44 text-center">
              Actions
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invites.map((invite) => {
            const isProcessing = processingInviteId === invite.id;
            return (
              <TableRow key={invite.id}>
                <TableCell>
                  <div className="text-sm font-medium text-[hsl(var(--fg))]">
                    {invite.inviteeEmail}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-[hsl(var(--fg))]">
                    {invite.workspaceName}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="neutral" className="text-xs capitalize">
                    {invite.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-[hsl(var(--fg-muted))]">
                  {formatInviteDate(invite.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => onAction(invite.id, "accept")}
                      disabled={isProcessing}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onAction(invite.id, "decline")}
                      disabled={isProcessing}
                    >
                      Decline
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function formatInviteDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
