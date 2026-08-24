"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { FAQItem } from "@/lib/faq-data";

interface AccordionItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  id: string;
}

function AccordionItem({ item, isOpen, onToggle, id }: AccordionItemProps) {
  const contentId = `faq-content-${id}`;
  const buttonId = `faq-button-${id}`;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-colors hover:border-white/20">
      <button
        id={buttonId}
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={onToggle}
        className="flex items-center justify-between w-full p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:bg-white/10"
      >
        <span className="text-[1.05rem] font-bold text-white pr-4">{item.question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex-shrink-0 text-[#8B7FE8]"
        >
          <ChevronDown size={20} />
        </motion.span>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={contentId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="p-6 pt-0 text-[#C4C4D4] leading-relaxed">
              <p>{item.answer}</p>
              {item.link && (
                <div className="mt-4">
                  <Link 
                    href={item.link.href}
                    className="text-[#8B7FE8] hover:text-white underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                  >
                    {item.link.text}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          id={String(index)}
          item={item}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? null : index)}
        />
      ))}
    </div>
  );
}
