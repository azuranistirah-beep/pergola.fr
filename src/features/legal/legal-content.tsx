import * as React from "react";
import { Container } from "@/components/ui/container";

export function LegalContent({ children }: { children: React.ReactNode }) {
  return (
    <section className="py-16 md:py-24">
      <Container className="max-w-3xl">
        <div className="prose-legal space-y-8 text-secondary text-[15px] leading-relaxed">
          {children}
        </div>
      </Container>
    </section>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-primary mb-3 font-serif text-2xl">{title}</h2>
      {children}
    </div>
  );
}
