import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/landing/Section";
import { STUDENT_TRIAL_HREF } from "@/lib/routes";

export default function PricingStudentsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-[#3d4236] sm:text-4xl">
              Gecko Academy
            </h1>
            <p className="mt-6 text-base text-[#5a5f57] sm:text-lg">
              Monthly subscription including:
            </p>
            <ul className="mt-6 space-y-2 text-left sm:mx-auto sm:max-w-sm">
              <li className="flex items-center gap-2 text-[#5a5f57]">
                <span className="text-[#429ead]">•</span>
                Live classes
              </li>
              <li className="flex items-center gap-2 text-[#5a5f57]">
                <span className="text-[#429ead]">•</span>
                Learning platform
              </li>
              <li className="flex items-center gap-2 text-[#5a5f57]">
                <span className="text-[#429ead]">•</span>
                Homework
              </li>
              <li className="flex items-center gap-2 text-[#5a5f57]">
                <span className="text-[#429ead]">•</span>
                Lesson recordings
              </li>
            </ul>
            <Button
              asChild
              size="lg"
              className="mt-10 bg-[#429ead] hover:bg-[#388694] text-white"
            >
              <Link href={STUDENT_TRIAL_HREF}>Start Free Trial</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
