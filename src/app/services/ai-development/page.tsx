import { createPageMetadata } from "@/lib/seo";
import { ServiceLanding } from "@/components/services/ServiceLanding";

export const metadata = createPageMetadata({
  title: "AI Development & AI Agent Development Services",
  description:
    "MyLoginn builds generative AI features, AI agents and workflow automation, and integrates them into your existing software. India-based team serving businesses worldwide.",
  path: "/services/ai-development",
  keywords: [
    "AI development company India", "AI agent development", "generative AI development",
    "agentic AI", "AI automation", "AI integration", "AI chatbot development",
  ],
});

const faqs = [
  { question: "What is an AI agent?", answer: "An AI agent is software that uses a language model to understand a goal, decide on steps, and use tools such as your database, email, CRM or APIs to complete tasks, usually with human review for important actions." },
  { question: "Can you add AI to our existing software?", answer: "Yes. Common integrations include chat assistants, document and data extraction, search over your own content, and automation of repetitive workflows. We review your current system first to scope what is practical." },
  { question: "Do you build chatbots and customer support assistants?", answer: "Yes. Assistants can answer from your own documents, collect enquiries and hand over to a person. The scope, channels and escalation rules are agreed up front." },
  { question: "How do you handle data privacy?", answer: "We design around the minimum data needed, keep API keys and secrets server-side, and agree what data is sent to any third-party model provider before building. Specific compliance needs are discussed during discovery." },
  { question: "How much does AI development cost?", answer: "It depends on scope: a focused assistant or automation costs far less than a multi-system agent platform. We provide an estimate after understanding your workflow, data and integrations, and we do not quote fixed prices without that." },
  { question: "Do you sign NDAs and who owns the code?", answer: "We are happy to sign an NDA before discussing your idea. Ownership of the delivered work and any data is set out in the project agreement before work starts." },
  { question: "Do you work with clients outside India?", answer: "Yes. MyLoginn is based in India and works with international clients remotely." },
];

export default function AiDevelopmentPage() {
  return (
    <ServiceLanding
      path="/services/ai-development"
      eyebrow="AI development"
      h1="AI development and AI agent development for real business workflows"
      intro="MyLoginn designs and builds generative AI features, AI agents and automation that fit into the software and processes your team already uses."
      schemaName="AI Development and AI Agent Development"
      serviceType="AI software development"
      leadService="AI Development"
      areas={[
        { title: "LLM applications and RAG", text: "Large language model features that answer from your own documents and data using retrieval-augmented generation (RAG), with sources you can check." },
        { title: "Generative AI features", text: "Content, summarisation, question answering over your own documents, and assistants embedded in your product." },
        { title: "AI agents and multi-agent orchestration", text: "Agents that use tools and APIs to complete multi-step tasks, and several cooperating agents for larger workflows, with approval points where a person should stay in control." },
        { title: "CRM, ERP and API integration", text: "Connect AI features to the CRM, ERP, databases and internal tools you already run." },
        { title: "AI workflow automation", text: "Automate repetitive work such as enquiry triage, data entry, reporting and follow-ups across the tools you already use." },
        { title: "Chatbots and support assistants", text: "Website and messaging assistants that answer from approved content and hand over to your team when needed." },
        { title: "AI integration into existing software", text: "Add AI capabilities to a current web, mobile or internal application without rebuilding it." },
        { title: "Testing and monitoring of AI features", text: "Evaluation of answers, guardrails and usage monitoring so AI features stay reliable after launch." },
      ]}
      tools={["OpenAI API", "LLM APIs", "RAG", "Python", "Next.js", "Node.js", "PostgreSQL", "REST APIs", "Retrieval over your documents"]}
      steps={["Understand the workflow and success criteria", "Check data, integrations and risks", "Build a focused first version and test it with real examples", "Release, monitor and improve"]}
      faqs={faqs}
      related={[
        { href: "/services/app-web-development", label: "Web, mobile and software development" },
        { href: "/services/testing-automation", label: "Software testing and automation" },
        { href: "/courses/gen-ai-get-ready-for-future", label: "Generative AI course" },
        { href: "/contact", label: "Contact MyLoginn" },
      ]}
    />
  );
}
