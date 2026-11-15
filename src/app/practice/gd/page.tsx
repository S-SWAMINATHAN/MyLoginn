import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/ui/Section";
import { GdStart } from "@/components/practice/GdStart";
import { PracticeHero } from "@/components/practice/PracticeHero";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Group Discussion Practice — Live GD Rooms with AI Evaluation",
  absoluteTitle: true,
  description: "Create a group discussion room, share the code with friends and discuss live by voice. An AI judge evaluates the complete discussion and gives every participant a detailed report.",
  path: "/practice/gd",
  keywords: ["group discussion practice", "online GD rooms", "AI group discussion"],
});

export default async function GdPage() {
  const user = await getCurrentUser();
  return (
    <Container className="max-w-screen-2xl space-y-7 py-6 sm:py-10">
      <PracticeHero
        eyebrow="Group discussion room"
        title="Make your point. Make space for others."
        description="Practise a live group discussion with friends. Share a room code, prepare your points, and get feedback on communication, reasoning and teamwork."
        facts={[
          { value: "2–6", label: "people in a room" },
          { value: "Live", label: "browser voice chat" },
          { value: "Fair", label: "individual feedback" },
        ]}
      />
      <GdStart loggedIn={Boolean(user)} />
    </Container>
  );
}
