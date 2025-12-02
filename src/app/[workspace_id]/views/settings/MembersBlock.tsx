"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  IconButton,
  Input,
  Modal,
  Select,
  Skeleton,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHeader,
  TableRow,
  TextArea,
  ToastContainer,
} from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { useApiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/queryKeys";
import type { InviteStatus } from "@/entities/invitedMembers";
import {
  MemberRole as MemberRoleEnum,
  type MemberRole,
} from "@/entities/workspaceMembers";
import type { ToastProps } from "@/components/ui/toast/Toast";
type WorkspaceMemberListItem = {
  id: string;
  userId: string;
  userEmail: string;
  role: MemberRole;
};

type WorkspaceInviteListItem = {
  id: string;
  inviteeEmail: string;
  role: MemberRole;
  status: InviteStatus;
  createdAt: string;
  message: string | null;
};

const ROLE_LABELS: Record<MemberRole, string> = {
  owner: "Owner",
  member: "Member",
  viewer: "Viewer",
};

const ROLE_BADGES: Record<MemberRole, "primary" | "neutral" | "warning"> = {
  owner: "primary",
  member: "neutral",
  viewer: "warning",
};

const SKELETON_ROWS = 3;
const INVITE_SKELETON_ROWS = 3;
const DEFAULT_INVITE_ROLE: MemberRole = "member";

type WorkspaceMembersBlockProps = {
  workspaceId: string;
  workspaceSlug: string;
  onEditMember?: (member: WorkspaceMemberListItem) => void;
  onRemoveMember?: (member: WorkspaceMemberListItem) => void;
};

function formatUserId(userId: string) {
  if (!userId) return "Unknown user";
  return userId.length > 14
    ? `${userId.slice(0, 10)}...${userId.slice(-4)}`
    : userId;
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function WorkspaceMembersBlock({
  workspaceId,
  workspaceSlug,
  onEditMember,
  onRemoveMember,
}: WorkspaceMembersBlockProps) {
  const { session } = useAuth();
  const apiFetch = useApiFetch();
  const queryClient = useQueryClient();

  const membersQuery = useQuery({
    queryKey: queryKeys.workspaceMembers(workspaceSlug),
    queryFn: async () => {
      const rows = await apiFetch<WorkspaceMemberListItem[]>(
        `/api/workspaces/${workspaceId}/members`
      );
      return rows;
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const members = membersQuery.data ?? [];
  const isLoading = membersQuery.isPending;
  const isRefetching = membersQuery.isRefetching;
  const errorMessage = (membersQuery.error as Error | null)?.message ?? null;
  const currentUserRole: MemberRole | null = useMemo(() => {
    const id = session?.user?.id;
    if (!id) return null;
    const entry = members.find((member) => member.userId === id);
    return entry?.role ?? null;
  }, [members, session?.user?.id]);
  const canManageInvites = currentUserRole === "owner";

  const invitesQuery = useQuery({
    queryKey: queryKeys.workspaceInvites(workspaceSlug),
    queryFn: async () => {
      return apiFetch<WorkspaceInviteListItem[]>(
        `/api/workspaces/${workspaceId}/invites?status=pending`
      );
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const pendingInvites = invitesQuery.data ?? [];
  const invitesLoading = invitesQuery.isPending;
  const invitesRefetching = invitesQuery.isRefetching;
  const invitesError = (invitesQuery.error as Error | null)?.message ?? null;

  const inviteRoleOptions = useMemo(
    () =>
      MemberRoleEnum.map((role) => ({
        value: role,
        label: ROLE_LABELS[role],
      })),
    []
  );
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>(DEFAULT_INVITE_ROLE);
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteFormError, setInviteFormError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const pushToast = useCallback((toast: ToastProps) => {
    const id = `${Date.now()}-${Math.random()}`;
    const nextToast = { ...toast, id };
    setToasts((prev) => [...prev, nextToast]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);
  const resetInviteFields = () => {
    setInviteEmail("");
    setInviteMessage("");
    setInviteRole(DEFAULT_INVITE_ROLE);
  };

  const handleInviteModalClose = () => {
    setInviteModalOpen(false);
    setInviteFormError(null);
    resetInviteFields();
  };

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const trimmedEmail = inviteEmail.trim();
      const payload = {
        email: trimmedEmail,
        role: inviteRole,
        message: inviteMessage.trim() ? inviteMessage.trim() : undefined,
      };
      await apiFetch(`/api/workspaces/${workspaceId}/invites`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return trimmedEmail;
    },
    onSuccess: (email) => {
      handleInviteModalClose();
      pushToast({
        title: "Invitation sent",
        description: `Invite email sent to ${email}`,
        variant: "success",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaceInvites(workspaceSlug),
      });
    },
    onError: (error: Error) => {
      setInviteFormError(error.message ?? "Failed to send invite");
    },
  });
  const revokeInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      await apiFetch(`/api/workspaces/${workspaceId}/invites?inviteId=${inviteId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      pushToast({ title: "Invite revoked", variant: "success" });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaceInvites(workspaceSlug) });
    },
    onError: (error: Error) => {
      pushToast({
        title: "Failed to revoke invite",
        description: error?.message,
        variant: "danger",
      });
    },
  });

  const inviteButtonDisabled = !inviteEmail.trim() || inviteMutation.isPending;

  const handleInviteSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inviteEmail.trim()) return;
    inviteMutation.mutate();
  };

  return (
    <>
      <ToastContainer toasts={toasts} />
      <div className="space-y-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1 text-sm text-[hsl(var(--fg-muted))]">
            <p>Current members with access to this workspace.</p>
          </div>
          <div className="flex items-center gap-2">
            {isRefetching && (
              <Spinner size="sm" aria-label="Refreshing members" />
            )}
            <Button size="sm" onClick={() => setInviteModalOpen(true)}>
              Invite member
            </Button>
          </div>
        </div>

      {errorMessage && (
        <Alert
          variant="danger"
          title="Failed to load members"
          description={errorMessage}
          action={
            <Button
              size="sm"
              variant="ghost"
              onClick={() => membersQuery.refetch()}
            >
              Retry
            </Button>
          }
        />
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableCell header>Email</TableCell>
            <TableCell header className="w-40">
              Role
            </TableCell>
            <TableCell header className="w-28 text-center">
              Actions
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: SKELETON_ROWS }).map((_, index) => (
              <TableRow key={`sk-${index}`}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-9 w-9 rounded-full" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : members.length > 0 ? (
            members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={member.userEmail ?? member.userId}
                      size="sm"
                    />
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-[hsl(var(--fg))]">
                        {member.userEmail ?? formatUserId(member.userId)}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={ROLE_BADGES[member.role]}>
                    {ROLE_LABELS[member.role]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <IconButton
                      size="sm"
                      aria-label="Edit member"
                      onClick={() => onEditMember?.(member)}
                    >
                      <Pencil className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      size="sm"
                      variant="danger"
                      aria-label="Remove member"
                      disabled={member.role === "owner"}
                      onClick={() => {
                        if (member.role === "owner") return;
                        onRemoveMember?.(member);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3}>
                <TableEmptyState
                  title="No members yet"
                  description="Connect your account or invite teammates once management tools are ready."
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="space-y-3 rounded-2xl border border-dashed border-[hsl(var(--border))] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-[hsl(var(--fg))]">
              Pending invitations
            </p>
            <p className="text-xs text-[hsl(var(--fg-muted))]">
              People who have been invited but have not accepted yet.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {invitesRefetching && (
              <Spinner size="sm" aria-label="Refreshing invites" />
            )}
            <Badge variant="neutral">{pendingInvites.length}</Badge>
          </div>
        </div>

        {invitesError && (
          <Alert
            variant="danger"
            title="Failed to load invites"
            description={invitesError}
            action={
              <Button
                size="sm"
                variant="ghost"
                onClick={() => invitesQuery.refetch()}
              >
                Retry
              </Button>
            }
          />
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableCell header>Email</TableCell>
              <TableCell header className="w-40">
                Role
              </TableCell>
              <TableCell header className="w-40">
                Invited
              </TableCell>
              <TableCell header className="w-28 text-center">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitesLoading ? (
              Array.from({ length: INVITE_SKELETON_ROWS }).map((_, index) => (
                <TableRow key={`invite-sk-${index}`}>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Skeleton className="h-9 w-9 rounded-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : pendingInvites.length > 0 ? (
              pendingInvites.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-[hsl(var(--fg))]">
                        {invite.inviteeEmail}
                      </div>
                      <div className="text-xs uppercase tracking-wide text-[hsl(var(--fg-muted))]">
                        {invite.status}
                        {invite.message ? ` · ${invite.message}` : ""}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ROLE_BADGES[invite.role]}>
                      {ROLE_LABELS[invite.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-[hsl(var(--fg-muted))]">
                    {formatDateLabel(invite.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {canManageInvites ? (
                        <IconButton
                          size="sm"
                          variant="danger"
                          disabled={revokeInviteMutation.isPending}
                          aria-label="Revoke invite"
                          onClick={() => revokeInviteMutation.mutate(invite.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      ) : (
                        <span className="text-xs text-[hsl(var(--fg-muted))]">Owner only</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4}>
                  <TableEmptyState
                    title="No pending invites"
                    description="As soon as you invite someone, they will appear here until they accept."
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      </div>

      <Modal
        open={inviteModalOpen}
        onClose={handleInviteModalClose}
        title="Invite member"
        footer={
          <div className="flex flex-1 flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col text-xs">
              {inviteFormError && (
                <span className="text-[hsl(var(--color-danger))]">
                  {inviteFormError}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                type="button"
                onClick={handleInviteModalClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="workspace-invite-form"
                disabled={inviteButtonDisabled}
              >
                {inviteMutation.isPending && (
                  <Spinner size="sm" className="mr-2" />
                )}
                Send invite
              </Button>
            </div>
          </div>
        }
      >
        <form
          id="workspace-invite-form"
          onSubmit={handleInviteSubmit}
          className="space-y-4"
        >
          <Input
            label="Invitee email"
            type="email"
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            placeholder="teammate@example.com"
            autoComplete="email"
            required
          />
          <Select
            label="Role"
            value={inviteRole}
            onChange={(val) =>
              setInviteRole(isMemberRole(val) ? val : DEFAULT_INVITE_ROLE)
            }
            options={inviteRoleOptions}
          />
          <TextArea
            label="Message (optional)"
            placeholder="Add a short note for the invitee"
            value={inviteMessage}
            onChange={(event) => setInviteMessage(event.target.value)}
            rows={3}
            maxLength={500}
          />
        </form>
      </Modal>
    </>
  );
}
function isMemberRole(value: string): value is MemberRole {
  return (MemberRoleEnum as readonly string[]).includes(value as MemberRole);
}
