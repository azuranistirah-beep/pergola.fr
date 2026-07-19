import { ArrowRight, Bell } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";

interface Props {
  eyebrow: string;
  title: string;
  intro: string;
  gradient: string;
  bullets: string[];
  launchDate: string;
}

export function ComingSoon({
  eyebrow,
  title,
  intro,
  gradient,
  bullets,
  launchDate,
}: Props) {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ background: gradient }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-black/30"
      />
      <Container className="relative flex min-h-[92vh] flex-col justify-center py-32 text-white">
        <div className="max-w-2xl">
          <Eyebrow className="text-accent">{eyebrow}</Eyebrow>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] md:text-7xl">
            {title}
          </h1>
          <p className="mt-8 max-w-xl text-lg text-white/80">{intro}</p>

          <ul className="mt-10 space-y-3 text-sm">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-3 text-white/85">
                <span className="bg-accent inline-block size-1.5 rounded-full" />
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-12 flex flex-col gap-4 border-t border-white/15 pt-8">
            <div className="text-xs uppercase tracking-[0.25em] text-white/50">
              Lancement prévu — {launchDate}
            </div>
            <form className="flex flex-col gap-3 sm:flex-row">
              <div className="border-accent/60 flex flex-1 items-center gap-3 border-b py-3">
                <Bell className="text-accent size-4" />
                <input
                  type="email"
                  required
                  placeholder="Votre email pour être prévenu·e"
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                />
              </div>
              <Button
                variant="accent"
                size="lg"
                type="submit"
                className="w-full sm:w-auto"
              >
                M&apos;avertir <ArrowRight />
              </Button>
            </form>
          </div>

          <Link
            href="/pergolas"
            className="text-accent mt-10 inline-block text-sm font-medium underline underline-offset-4"
          >
            En attendant, découvrez nos pergolas →
          </Link>
        </div>
      </Container>
    </div>
  );
}
