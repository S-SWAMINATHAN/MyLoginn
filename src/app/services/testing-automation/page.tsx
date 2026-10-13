import { createPageMetadata } from "@/lib/seo";
import { regionalKeywords } from "@/lib/localSeo";
import { TestingLanding } from "@/components/services/testing/TestingLanding";

export const metadata = createPageMetadata({
  title: "Software Testing & Test Automation Services",
  description:
    "Manual and automated QA for web applications, including API testing and Playwright test automation, from the India-based MyLoginn team.",
  path: "/services/testing-automation",
  keywords: [
    ...regionalKeywords(["software testing company"]),
    "software testing services", "automation testing company", "QA automation services",
    "Playwright automation", "API testing", "regression testing",
  ],
});

const faqs = [
  { question: "What types of testing do you provide?", answer: "Manual functional testing, regression testing, API testing, and automated browser tests for web applications. Mobile testing scope depends on the app and devices involved." },
  { question: "Which automation tools do you use?", answer: "We commonly use Playwright for browser automation and Postman or code-based suites for API testing. The tool is chosen to fit your stack and team." },
  { question: "Can automated tests run in CI/CD?", answer: "Yes. Tests can be wired into your pipeline so they run on every change and report failures clearly." },
  { question: "Can you test an application you did not build?", answer: "Yes. Share the application, access and key user flows, and we will propose a test scope." },
  { question: "Do you also offer testing training?", answer: "MyLoginn runs technology courses through its learning platform. See the courses page for what is currently available." },
];

export default function TestingAutomationPage() {
  return (
    <TestingLanding
      path="/services/testing-automation"
      eyebrow="Testing and QA"
      h1="Software testing and test automation services"
      intro="MyLoginn helps teams release with confidence through manual QA, API testing and automated regression suites for web applications."
      schemaName="Software Testing and Test Automation"
      serviceType="Software quality assurance"
      leadService="Software Testing & Automation"
      areas={[
        { title: "Manual functional testing", text: "Test cases built from your requirements, with clear defect reports and retesting." },
        { title: "Automation testing", text: "Browser-based automated tests for critical user journeys, written to be maintainable." },
        { title: "API testing", text: "Verify endpoints, authentication, error handling and data contracts independently of the UI." },
        { title: "Regression testing", text: "Repeatable suites that catch breakage each time you release." },
        { title: "CI/CD test integration", text: "Run tests automatically in your build pipeline with readable results." },
        { title: "Testing AI features", text: "Evaluate answer quality and edge cases for chatbots and AI-assisted workflows." },
      ]}
      tools={["Playwright", "Selenium", "Postman", "Python", "TypeScript", "GitHub Actions"]}
      steps={["Review the application and key user flows", "Agree test scope and priorities", "Design and run tests; report defects", "Automate stable flows and hand over results"]}
      faqs={faqs}
      related={[
        { href: "/services/app-web-development", label: "Web, mobile and software development" },
        { href: "/services/ai-development", label: "AI development and agents" },
        { href: "/courses", label: "Technology courses" },
        { href: "/contact", label: "Contact MyLoginn" },
      ]}
    />
  );
}
