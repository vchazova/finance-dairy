import WorkspaceClientPage from "./page.client";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ workspace_id: string }>;
}) {
  const { workspace_id } = await params;
  return <WorkspaceClientPage workspaceId={workspace_id} />;
}
