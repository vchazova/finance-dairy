import { notFound } from "next/navigation";

export default async function WorkspaceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  // TODO: fetch workspace by slug or id and render transactions
  // Keeping the stub to validate navigation from the grid.
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Детали пространства</h1>
      <p className="text-[hsl(var(--fg-muted))]">
        Страница в разработке. Идентификатор: {params.slug}
      </p>
    </div>
  );
}
