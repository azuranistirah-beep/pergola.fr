import { Container } from "@/components/ui/container";

export default function PergolasLoading() {
  return (
    <>
      <section className="bg-muted pt-32 pb-16 md:pt-40 md:pb-24">
        <Container>
          <div className="bg-border/60 h-3 w-24 animate-pulse rounded-full" />
          <div className="bg-border/70 mt-6 h-16 w-3/4 max-w-3xl animate-pulse rounded-2xl" />
          <div className="bg-border/60 mt-8 h-4 w-full max-w-xl animate-pulse rounded-full" />
        </Container>
      </section>
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border-border/60 overflow-hidden rounded-[var(--radius-lg)] border"
              >
                <div className="bg-muted aspect-[4/3] animate-pulse" />
                <div className="space-y-4 p-6">
                  <div className="bg-border/60 h-2 w-16 animate-pulse rounded-full" />
                  <div className="bg-border/70 h-5 w-3/4 animate-pulse rounded-lg" />
                  <div className="bg-border/60 h-3 w-full animate-pulse rounded-full" />
                  <div className="border-border/60 flex justify-between border-t pt-4">
                    <div className="bg-border/60 h-6 w-20 animate-pulse rounded-lg" />
                    <div className="bg-border/60 h-3 w-16 animate-pulse rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
