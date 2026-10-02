"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, CreditCard, MessageCircle, Star, UserRound } from "lucide-react";
import { LeadForm } from "@/components/services/LeadForm";

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
      <div role="tablist" aria-label="Contact options" className="mb-5 grid grid-cols-4 rounded-xl border border-[#dedcf6] bg-[#f4f2ff] p-1">
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
              aria-controls={`contact-panel-${id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTab(id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={`flex min-h-10 min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1.5 py-2 text-[10px] font-semibold transition sm:flex-row sm:gap-1.5 sm:px-2 sm:text-xs ${selected ? "bg-[#2164f5] text-white shadow-[0_3px_10px_rgba(33,100,245,.2)]" : "text-[#56627d] hover:bg-white/80 hover:text-[#2164f5]"}`}
            >
              <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`contact-panel-${activeTab}`}
        aria-labelledby={`contact-tab-${activeTab}`}
        tabIndex={0}
        className="min-w-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3569df]"
      >
        {activeTab === "enquiry" && <LeadForm service="General Inquiry" variant="contact" />}
        {activeTab === "payment" && <LeadForm service="Course Payment Options" variant="contact" contactMode="payment" />}
        {activeTab === "feedback" && <LeadForm service="Student Feedback" variant="contact" contactMode="feedback" />}
        {activeTab === "register" && (
          <div className="flex min-h-[22rem] flex-col items-start justify-center rounded-xl border border-[#e8ecf3] bg-[#f9fbff] p-5 sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#3569df]">Join MyLoginn</p>
            <h3 className="mt-2 text-xl font-semibold text-[#23304a]">Create your MyLoginn account</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#697692]">Set up your profile and choose whether you&apos;re joining as a student or mentor.</p>
            <Link href="/signup" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#2164f5] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(33,100,245,.2)] transition hover:bg-[#1453dc]">
              Continue to registration<ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}