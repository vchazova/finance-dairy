"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  IconButton,
  Skeleton,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { useApiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/queryKeys";
import type { MemberRole } from "@/entities/workspaceMembers";

type WorkspaceMemberListItem = {
  id: string;
  userId: string;
  userEmail: string;
  role: MemberRole;
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

type WorkspaceMembersBlockProps = {
  workspaceId: string;
  workspaceSlug: string;
  onEditMember?: (member: WorkspaceMemberListItem) => void;
  onRemoveMember?: (member: WorkspaceMemberListItem) => void;
};

type PendingInvite = {
  id: string;
  email: string;
  role: MemberRole;
  invitedAt: string;
};

function formatUserId(userId: string) {
  if (!userId) return "Unknown user";
  return userId.length > 14
    ? `${userId.slice(0, 10)}...${userId.slice(-4)}`
    : userId;
}

export function WorkspaceMembersBlock({
  workspaceId,
  workspaceSlug,
  onEditMember,
  onRemoveMember,
}: WorkspaceMembersBlockProps) {
  const { session } = useAuth();
  const apiFetch = useApiFetch();

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
  const pendingInvites: PendingInvite[] = [];

  return (
    <div className="space-y-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1 text-sm text-[hsl(var(--fg-muted))]">
          <p>Current members with access to this workspace.</p>
        </div>
        <div className="flex items-center gap-2">
          {isRefetching && (
            <Spinner size="sm" aria-label="Refreshing members" />
          )}
          <Button
            size="sm"
            disabled
            className="bg-[hsl(var(--border))]/40 text-[hsl(var(--fg-muted))]"
          >
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
            <p className="text-sm font-medium text-[hsl(var(--fg))]">Pending invitations</p>
            <p className="text-xs text-[hsl(var(--fg-muted))]">People who have been invited but have not accepted yet.</p>
          </div>
          <Badge variant="neutral">{pendingInvites.length}</Badge>
        </div>

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
            {pendingInvites.length > 0 ? (
              pendingInvites.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell>{invite.email}</TableCell>
                  <TableCell>
                    <Badge variant={ROLE_BADGES[invite.role]}>{ROLE_LABELS[invite.role]}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-[hsl(var(--fg-muted))]">{invite.invitedAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <IconButton size="sm" variant="danger" disabled aria-label="Revoke invite (coming soon)">
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
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
  );
}
