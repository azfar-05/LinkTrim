export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10">
      <div className="h-10 w-64 animate-pulse rounded bg-muted" />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-lg border bg-muted"
          />
        ))}
      </div>

      <div className="h-64 animate-pulse rounded-lg border bg-muted" />
    </main>
  );
}