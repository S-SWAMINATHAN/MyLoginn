"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GraduationCap, MessageCircle, Rocket, Star } from "lucide-react";
import { TestingEnquiryForm } from "@/components/services/testing/TestingEnquiryForm";

const tabs = [
  { id: "project", label: "Project", icon: Rocket },
  { id: "enquiry", label: "Question", icon: MessageCircle },
  { id: "payment", label: "Learn", icon: GraduationCap },
  { id: "feedback", label: "Feedback", icon: Star },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ContactEnquiryTabs() {
  const [activeTab, setActiveTab] = useState<TabId>("project");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex !== null) {
      event.preventDefault();
      setActiveTab(tabs[nextIndex].id);
      tabRefs.current[nextIndex]?.focus();
    }
  }

  return (
    <>
      <div role="tablist" aria-label="Contact options" className="relative mb-5 grid grid-cols-4 rounded-full border border-border-soft bg-story-mist p-1">
        {tabs.map(({ id, label, icon: Icon }, index) => {
          const selected = activeTab === id;
          return (
            <button
              key={id}
              ref={(element) => { tabRefs.current[index] = element; }}
              type="button"
              role="tab"
              id={`contact-tab-${id}`}
              aria-selected={selected}
              aria-controls="contact-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTab(id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={`relative flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-full px-1.5 py-2 text-[11px] font-semibold transition-colors sm:text-xs ${selected ? "text-white" : "text-muted hover:text-story-royal"}`}
            >
              {selected && <motion.span layoutId="contact-tab" className="absolute inset-0 rounded-full bg-story-royal shadow-[0_8px_18px_-10px_rgba(31,86,214,0.8)]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <Icon aria-hidden="true" className="relative h-3.5 w-3.5 shrink-0" />
              <span className="relative truncate">{label}</span>
            </button>
          );
        })}
      </div>

      <div id="contact-panel" role="tabpanel" aria-labelledby={`contact-tab-${activeTab}`} className="min-w-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
            {activeTab === "project" && (
              <TestingEnquiryForm
                service="Project Enquiry"
                heading="Tell us about your project"
                needsQuestion="What do you want to build?"
                goalsPrefix="Project type"
                submitLabel="Start a project"
                messagePlaceholder="Your business, what you want to build, and any timing or budget you have in mind…"
                needs={[
                  { label: "Website / web platform", color: "#2563eb" },
                  { label: "Mobile app", color: "#7c3aed" },
                  { label: "Desktop application", color: "#0891b2" },
                  { label: "AI agent / automation", color: "#059669" },
                  { label: "Digital marketing", color: "#d97706" },
                  { label: "Something else", color: "#e11d48" },
                ]}
              />
            )}
            {activeTab === "enquiry" && (
              <TestingEnquiryForm
                service="General Inquiry"
                heading="Ask us a question"
                needsQuestion="What is your question about?"
                goalsPrefix="Interested in"
                submitLabel="Send message"
                messagePlaceholder="Tell us a little more about your question…"
                needs={[
                  { label: "Our services", color: "#2563eb" },
                  { label: "An existing project", color: "#059669" },
                  { label: "Partnerships", color: "#7c3aed" },
                  { label: "Careers", color: "#d97706" },
                  { label: "Something else", color: "#e11d48" },
                ]}
              />
            )}
            {activeTab === "payment" && (
              <TestingEnquiryForm
                service="Course Payment Options"
                heading="Questions about MyLoginn Learn"
                needsQuestion="What would you like to know?"
                goalsPrefix="Payment question"
                submitLabel="Ask about payment options"
                messagePlaceholder="Which course are you interested in, and what would you like to know?"
                needs={[
                  { label: "Courses", color: "#0891b2" },
                  { label: "EMI options", color: "#2563eb" },
                  { label: "Course fees", color: "#7c3aed" },
                  { label: "Payment methods", color: "#059669" },
                  { label: "Offers", color: "#d97706" },
                ]}
              />
            )}
            {activeTab === "feedback" && (
              <TestingEnquiryForm
                service="Feedback"
                heading="Share your feedback"
                needsQuestion="What is your feedback about?"
                goalsPrefix="Feedback on"
                submitLabel="Send feedback"
                messagePlaceholder="Tell us about your experience with MyLoginn…"
                needs={[
                  { label: "A project we delivered", color: "#2563eb" },
                  { label: "Support", color: "#d97706" },
                  { label: "Website", color: "#059669" },
                  { label: "MyLoginn Learn", color: "#7c3aed" },
                  { label: "Other", color: "#e11d48" },
                ]}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
