import * as React from "react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="bg-muted pt-32 pb-16 md:pt-40 md:pb-24">
      <Container>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-tight md:text-7xl">
          {title}
        </h1>
        {intro && (
          <p className="text-secondary mt-8 max-w-2xl text-base">{intro}</p>
        )}
        {children}
      </Container>
    </section>
  );
}
