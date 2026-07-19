import { Container } from "@/components/ui/container";

export default function PDPLoading() {
  return (
    <Container className="pt-32 pb-24 md:pt-40">
      <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col-reverse gap-4 md:flex-row">
          <div className="flex flex-row gap-3 md:flex-col">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-muted aspect-square w-20 shrink-0 animate-pulse rounded-2xl"
              />
            ))}
          </div>
          <div className="bg-muted aspect-[4/4] flex-1 animate-pulse rounded-[var(--radius-lg)]" />
        </div>
        <div className="space-y-6">
          <div className="bg-border/60 h-3 w-32 animate-pulse rounded-full" />
          <div className="bg-border/70 h-12 w-full animate-pulse rounded-2xl" />
          <div className="bg-border/60 h-4 w-full max-w-md animate-pulse rounded-full" />
          <div className="border-border/60 border-t border-b py-6">
            <div className="bg-border/60 h-3 w-40 animate-pulse rounded-full" />
            <div className="bg-border/70 mt-3 h-10 w-32 animate-pulse rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="bg-border/60 h-3 w-24 animate-pulse rounded-full" />
                <div className="bg-border/70 h-4 w-full animate-pulse rounded-full" />
              </div>
            ))}
          </div>
          <div className="bg-border/70 h-14 w-full animate-pulse rounded-full" />
          <div className="bg-border/60 h-14 w-full animate-pulse rounded-full" />
        </div>
      </div>
    </Container>
  );
}
