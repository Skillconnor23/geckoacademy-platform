import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/landing/Section";
import { STUDENT_TRIAL_HREF } from "@/lib/routes";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Section>
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#3d4236] sm:text-4xl">
            Contact us
          </h1>
          <p className="mt-4 text-base text-[#5a5f57]">
            Get in touch for demos, pricing, or questions.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Button asChild size="lg" className="bg-[#7daf41] hover:bg-[#6b9a39] text-white">
              <Link href="/trial">Book a Demo</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="bg-[#429ead] hover:bg-[#388694] text-white">
              <Link href={STUDENT_TRIAL_HREF}>Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
