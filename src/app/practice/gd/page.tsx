import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/ui/Section";
import { PageTitle } from "@/components/logiquest/ui";
import { GdStart } from "@/components/practice/GdStart";

export const metadata = {
  title: "Group Discussion Practice — Live GD Rooms with AI Evaluation",
  description: "Create a group discussion room, share the code with friends and discuss live by voice. An AI judge evaluates the complete discussion and gives every participant a detailed report.",
};

export default async function GdPage() {
  const user = await getCurrentUser();
  return (
    <Container className="max-w-7xl space-y-6 py-6 sm:py-10">
      <PageTitle eyebrow="Group Discussion" title="Practise GDs the way companies run them." sub="2-6 participants, a topic, a timer and a silent AI judge that evaluates everyone on the whole discussion — communication, logic, teamwork, leadership and more." />
      <GdStart loggedIn={Boolean(user)} />
    </Container>
  );
}
