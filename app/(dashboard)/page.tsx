import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/landing/Section";
import { AppPreviewCard } from "@/components/landing/AppPreviewCard";
import { PlatformPreviewRow } from "@/components/landing/PlatformPreviewRow";
import {
  UsersRound,
  GraduationCap,
  BarChart3,
  ClipboardCheck,
  Users,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* 1. HERO */}
        <section className="pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
            <div className="order-2 flex flex-col gap-6 lg:order-1 lg:flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-[#3d4236] sm:text-4xl md:text-5xl">
                Confident English. Small Classes. Real Progress.
              </h1>
              <p className="max-w-lg text-base text-[#5a5f57] sm:text-lg">
                Live online classes with real teachers. Structured levels. Clear
                progress tracking.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg">
                  <Link href="/trial">Book a Free Trial</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link href="#how-it-works" className="gap-1.5">
                    See How Classes Work
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="order-1 lg:order-2 lg:w-[400px] xl:w-[440px]">
              <AppPreviewCard />
            </div>
          </div>
        </section>
      </div>

      {/* 2. PROBLEM */}
      <Section variant="alt">
        <h2 className="text-xl font-semibold text-[#3d4236] sm:text-2xl">
          Most students study English for years… and still don&apos;t speak
          confidently.
        </h2>
        <ul className="mt-4 flex flex-col gap-2 text-[#5a5f57] sm:mt-6 sm:gap-3">
          <li className="flex items-center gap-2">
            <span className="text-[#7daf41]">•</span>
            Too much grammar.
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#7daf41]">•</span>
            Not enough speaking.
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#7daf41]">•</span>
            No accountability.
          </li>
        </ul>
      </Section>

      {/* 3. WHY GECKO */}
      <Section>
        <h2 className="text-center text-xl font-semibold text-[#3d4236] sm:text-2xl">
          Why Gecko
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7daf41]/10">
              <UsersRound className="h-5 w-5 text-[#7daf41]" />
            </div>
            <h3 className="mt-4 font-medium text-[#3d4236]">Small, Live Classes</h3>
            <p className="mt-2 text-sm text-[#5a5f57]">
              8–12 students max. Everyone speaks.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7daf41]/10">
              <GraduationCap className="h-5 w-5 text-[#7daf41]" />
            </div>
            <h3 className="mt-4 font-medium text-[#3d4236]">Real Teachers</h3>
            <p className="mt-2 text-sm text-[#5a5f57]">
              Native-level teachers who guide real conversation.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7daf41]/10">
              <BarChart3 className="h-5 w-5 text-[#7daf41]" />
            </div>
            <h3 className="mt-4 font-medium text-[#3d4236]">Visible Progress</h3>
            <p className="mt-2 text-sm text-[#5a5f57]">
              Parents and students can see scores, activity, and improvement.
            </p>
          </div>
        </div>
      </Section>

      {/* 4. PLATFORM PREVIEW */}
      <Section variant="alt">
        <h2 className="text-center text-xl font-semibold text-[#3d4236] sm:text-2xl">
          See Progress. Not Just Attendance.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-[#5a5f57] sm:text-base">
          Every class includes quizzes and feedback so you know exactly how your
          child is improving.
        </p>
        <div className="mt-8">
          <PlatformPreviewRow />
        </div>
      </Section>

      {/* 5. TEACHERS */}
      <Section>
        <h2 className="text-center text-xl font-semibold text-[#3d4236] sm:text-2xl">
          Meet your teachers
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              name: "Sarah M.",
              credential: "Native English Speaker",
              quote: "I love helping kids gain confidence in speaking.",
              image: "/teachers/teacher-sarah.png",
            },
            {
              name: "James L.",
              credential: "CELTA certified",
              quote: "Small groups mean every student gets to talk.",
              image: "/teachers/teacher-james.png",
            },
            {
              name: "Emma K.",
              credential: "10+ years teaching",
              quote: "Progress tracking keeps everyone motivated.",
              image: "/teachers/teacher-emma.png",
            },
            {
              name: "David R.",
              credential: "Young learners specialist",
              quote: "Structured levels help students grow steadily.",
              image: "/teachers/teacher-david.png",
            },
          ].map((t, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium text-[#3d4236]">{t.name}</div>
                  <div className="text-xs text-[#5a5f57]">{t.credential}</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-[#5a5f57] italic">&ldquo;{t.quote}&rdquo;</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 6. HOW IT WORKS */}
      <Section variant="alt" id="how-it-works">
        <h2 className="text-center text-xl font-semibold text-[#3d4236] sm:text-2xl">
          How it works
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-6">
          <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7daf41]/10">
              <ClipboardCheck className="h-5 w-5 text-[#7daf41]" />
            </div>
            <div>
              <h3 className="font-medium text-[#3d4236]">Take a Level Check</h3>
              <p className="mt-1 text-sm text-[#5a5f57]">
                Quick assessment to place your child in the right class.
              </p>
            </div>
          </div>
          <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7daf41]/10">
              <Users className="h-5 w-5 text-[#7daf41]" />
            </div>
            <div>
              <h3 className="font-medium text-[#3d4236]">Join Small Live Classes</h3>
              <p className="mt-1 text-sm text-[#5a5f57]">
                8–12 students. Everyone participates. Real conversation.
              </p>
            </div>
          </div>
          <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7daf41]/10">
              <TrendingUp className="h-5 w-5 text-[#7daf41]" />
            </div>
            <div>
              <h3 className="font-medium text-[#3d4236]">Track Progress Weekly</h3>
              <p className="mt-1 text-sm text-[#5a5f57]">
                Quizzes, scores, and activity visible in your dashboard.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* 7. TESTIMONIALS */}
      <Section>
        <h2 className="text-center text-xl font-semibold text-[#3d4236] sm:text-2xl">
          What parents say
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Oyunaa",
              location: "Ulaanbaatar",
              quote:
                "My son finally speaks English without fear. The small classes make a huge difference.",
            },
            {
              name: "Bold",
              location: "Ulaanbaatar",
              quote:
                "We can see his quiz scores and improvement every week. No more guessing.",
            },
            {
              name: "Sarnai",
              location: "Darkhan",
              quote:
                "The teachers are patient and the progress tracking keeps us both motivated.",
            },
          ].map((t, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <p className="text-sm text-[#3d4236]">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7daf41]/10">
                  <Image
                    src="/gecko-logo.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="opacity-70"
                  />
                </div>
                <span className="text-sm font-medium text-[#3d4236]">
                  {t.name}
                  <span className="ml-1 font-normal text-[#5a5f57]">
                    · {t.location}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>

        {/* 8. FINAL CTA */}
        <Section variant="alt">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-[#3d4236] sm:text-2xl">
              Ready to help your child speak English confidently?
            </h2>
            <Button asChild size="lg" className="mt-6">
              <Link href="/trial">Book a Free Trial</Link>
            </Button>
          </div>
        </Section>
    </div>
  );
}
