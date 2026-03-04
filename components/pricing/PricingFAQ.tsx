"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface PricingFAQProps {
  items: FAQItem[];
  className?: string;
}

export function PricingFAQ({ items, className }: PricingFAQProps) {
  return (
    <Accordion type="single" collapsible className={className}>
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
