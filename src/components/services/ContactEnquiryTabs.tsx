"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CreditCard, MessageCircle, Star, UserRound } from "lucide-react";
import { TestingEnquiryForm } from "@/components/services/testing/TestingEnquiryForm";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { ContentIcon } from "@/components/ui/ContentIcon";

const tabs = [
  { id: "enquiry", label: "Enquiry", icon: MessageCircle },
  { id: "register", label: "Register", icon: UserRound },
  { id: "payment", label: "EMI Plan", icon: CreditCard },
  { id: "feedback", label: "Feedback", icon: Star },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ContactEnquiryTabs() {
  const [activeTab, setActiveTab] = useState<TabId>("enquiry");
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
            {activeTab === "enquiry" && (
              <TestingEnquiryForm
                service="General Inquiry"
                heading="Send us a message"
                needsQuestion="What can we help with?"
                goalsPrefix="Interested in"
                submitLabel="Send message"
                messagePlaceholder="Tell us a little more about your question or idea…"
                needs={[
                  { label: "Courses", color: "#2563eb" },
                  { label: "Internships", color: "#7c3aed" },
                  { label: "Web / app project", color: "#059669" },
                  { label: "Digital marketing", color: "#d97706" },
                  { label: "AI solutions", color: "#e11d48" },
                  { label: "Mentoring", color: "#2563eb" },
                  { label: "Something else", color: "#7c3aed" },
                ]}
              />
            )}
            {activeTab === "payment" && (
              <TestingEnquiryForm
                service="Course Payment Options"
                heading="Ask about payment options"
                needsQuestion="What would you like to know?"
                goalsPrefix="Payment question"
                submitLabel="Ask about payment options"
                messagePlaceholder="Which course are you interested in, and what would you like to know?"
                needs={[
                  { label: "EMI options", color: "#2563eb" },
                  { label: "Course fees", color: "#7c3aed" },
                  { label: "Payment methods", color: "#059669" },
                  { label: "Offers", color: "#d97706" },
                ]}
              />
            )}
            {activeTab === "feedback" && (
              <TestingEnquiryForm
                service="Student Feedback"
                heading="Share your feedback"
                needsQuestion="What is your feedback about?"
                goalsPrefix="Feedback on"
                submitLabel="Send feedback"
                messagePlaceholder="Tell us about your experience with MyLoginn…"
                needs={[
                  { label: "Courses", color: "#2563eb" },
                  { label: "Mentors", color: "#7c3aed" },
                  { label: "Platform", color: "#059669" },
                  { label: "Support", color: "#d97706" },
                  { label: "Other", color: "#e11d48" },
                ]}
              />
            )}
            {activeTab === "register" && (
              <div className="relative flex min-h-[22rem] flex-col items-center justify-center overflow-hidden rounded-2xl border border-border-soft bg-surface p-6 text-center shadow-[0_12px_32px_-16px_rgba(15,23,42,0.25)] sm:p-8">
                <span aria-hidden className="absolute inset-x-0 top-0 flex h-1">
                  {["#2563eb", "#7c3aed", "#059669", "#d97706", "#e11d48"].map((c) => <i key={c} className="flex-1" style={{ background: c }} />)}
                </span>
                <span className="grid h-20 w-20 place-items-center rounded-full bg-story-mist"><ContentIcon keyword="student" className="h-14 w-14" /></span>
                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-story-royal">Join MyLoginn</p>
                <h3 className="mt-2 text-xl font-semibold text-story-navy">Create your MyLoginn account</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted">Set up your profile and choose whether you&apos;re joining as a student or mentor.</p>
                <div className="mt-6"><ArrowLink href="/signup">Continue to registration</ArrowLink></div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
