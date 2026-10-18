import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { GdRoom } from "@/components/practice/GdRoom";
import { Card } from "@/components/practice/ui";
import { isRoomCode, normalizeRoomCode } from "@/lib/practice/gd/config";

export const metadata = { title: "Group Discussion Room", robots: { index: false } };

type Props = { params: Promise<{ code: string }> };

export default async function GdRoomPage({ params }: Props) {
  const raw = decodeURIComponent((await params).code);
  const code = normalizeRoomCode(raw);
  if (code !== raw && isRoomCode(code)) redirect(`/practice/gd/${code}`);
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/practice/gd/${code}`)}`);

  const room = isRoomCode(code) ? await prisma.gdRoom.findUnique({ where: { code }, select: { id: true, status: true } }) : null;
  const message = (text: string) => (
    <Container className="max-w-xl py-12">
      <Card className="text-center">
        <p className="text-sm leading-6">{text}</p>
        <Button className="mt-4" href="/practice/gd">Create or join a room</Button>
      </Card>
    </Container>
  );
  if (!room) return message("No discussion found with that room code. Check the code and try again.");
  if (room.status === "DONE") {
    const mine = await prisma.practiceSession.findFirst({ where: { gdRoomId: room.id, userId: user.id }, select: { id: true } });
    if (mine) redirect(`/practice/reports/${mine.id}`);
    return message("This discussion has ended.");
  }

  return (
    <Container className="max-w-5xl py-6 sm:py-8">
      <h1 className="sr-only">Group discussion {code}</h1>
      <GdRoom code={code} me={{ id: user.id, name: user.name }} />
    </Container>
  );
}
