"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Input";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { CourseIconThumb } from "@/components/courses/CourseIconThumb";
import { AnimatedSuccess } from "@/components/ui/icons/AnimatedSuccess";
import { AnimatedStar } from "@/components/ui/icons/AnimatedStar";
import { useTiltSpotlight } from "@/hooks/useTiltSpotlight";
import { tutoringBookingSchema } from "@/lib/validation";
import { z } from "zod";

export type TutorData = {
  id: string;
  name: string;
  subject: string;
  bio: string;
  qualification: string;
  experienceYears: number;
  rating: number;
  avatarColor: string;
  boards: string[];
};

const grades = ["1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade", "6th Grade", "7th Grade", "8th Grade", "9th Grade", "10th Grade", "11th Grade", "12th Grade"];
const slots = ["Weekday Mornings", "Weekday Evenings", "Weekend Mornings", "Weekend Evenings"];

type BookingForm = z.infer<typeof tutoringBookingSchema>;

export function TutoringExplorer({ tutors, isLoggedIn }: { tutors: TutorData[]; isLoggedIn: boolean }) {
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [activeTutor, setActiveTutor] = useState<TutorData | null>(null);
  const subjects = ["All", ...Array.from(new Set(tutors.map((t) => t.subject)))];
  const filtered = subjectFilter === "All" ? tutors : tutors.filter((t) => t.subject === subjectFilter);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap justify-center gap-2"
      >
        {subjects.map((s) => (
          <button
            key={s}
            onClick={() => setSubjectFilter(s)}
            className={`relative cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              subjectFilter === s ? "text-white" : "text-foreground/80 hover:text-foreground"
            }`}
          >
            {subjectFilter === s ? (
              <motion.span
                layoutId="tutor-filter-pill"
                className="absolute inset-0 -z-10 rounded-full brand-gradient-bg shadow-[var(--shadow-soft)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            ) : (
              <span className="absolute inset-0 -z-10 rounded-full bg-surface-2 transition-colors duration-200 hover:bg-surface-2/80" />
            )}
            {s}
          </button>
        ))}
      </motion.div>

      <motion.div layout className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((tutor, i) => (
            <TutorCard key={tutor.id} tutor={tutor} index={i} onBook={() => setActiveTutor(tutor)} />
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {activeTutor && (
          <BookingModal tutor={activeTutor} isLoggedIn={isLoggedIn} onClose={() => setActiveTutor(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function TutorCard({ tutor, index, onBook }: { tutor: TutorData; index: number; onBook: () => void }) {
  const { rotateX, rotateY, spotlightBg, onMouseMove, onMouseLeave } = useTiltSpotlight();

  const initials = tutor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1200 }}
    >
      <motion.div
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ rotateX, rotateY }}
        className="group relative h-full"
      >
        <Card className="relative flex h-full flex-col overflow-hidden p-6 transition-shadow duration-300 group-hover:shadow-[var(--shadow-lift)] group-hover:-translate-y-1">
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: spotlightBg }}
          />

          <div className="relative z-10 flex items-center gap-4">
            <div className="relative shrink-0">
              <CourseIconThumb category={tutor.subject} title={tutor.subject} variant="round" className="h-19 w-19" />
              <span
                className="absolute -bottom-1 -right-1 flex h-6.5 w-6.5 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-surface"
                style={{ background: tutor.avatarColor }}
              >
                {initials}
              </span>
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{tutor.name}</p>
              <p className="flex items-center gap-1 text-xs font-medium text-brand-500">
                <ContentIcon keyword={tutor.subject} className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                {tutor.subject} specialist
              </p>
            </div>
          </div>

          <p className="relative z-10 mt-4 flex-1 text-sm text-muted">{tutor.bio}</p>
          <div className="relative z-10 mt-4 flex items-center justify-between text-xs text-muted">
            <span>{tutor.qualification}</span>
            <span className="flex items-center gap-1">
              <AnimatedStar className="h-5 w-5 transition-transform duration-300 group-hover:scale-125" /> {tutor.rating.toFixed(1)}
            </span>
          </div>
          <div className="relative z-10 mt-3 flex flex-wrap gap-1.5">
            {tutor.boards.map((b) => (
              <span
                key={b}
                className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium transition-transform duration-200 group-hover:-translate-y-0.5"
              >
                {b}
              </span>
            ))}
          </div>
          <Button className="relative z-10 mt-5 w-full" size="sm" onClick={onBook}>
            Book a free class
          </Button>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function BookingModal({
  tutor,
  isLoggedIn,
  onClose,
}: {
  tutor: TutorData;
  isLoggedIn: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingForm>({
    resolver: zodResolver(tutoringBookingSchema),
    defaultValues: { tutorId: tutor.id, subject: tutor.subject },
  });

  async function onSubmit(data: BookingForm) {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setServerError(null);
    const res = await fetch("/api/tutoring/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setServerError(json.error ?? "Something went wrong");
      return;
    }
    setDone(true);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="glass-panel w-full max-w-md rounded-2xl p-7"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Book a class with {tutor.name}</h3>
            <p className="mt-1 text-sm text-muted">{tutor.subject} · {tutor.qualification}</p>
          </div>
          <button onClick={onClose} className="group cursor-pointer rounded-full p-1.5 transition-colors hover:bg-surface-2">
            <X className="h-5.5 w-5.5 transition-transform duration-300 group-hover:rotate-90" />
          </button>
        </div>

        {done ? (
          <div className="mt-8 flex flex-col items-center gap-3 py-4 text-center">
            <AnimatedSuccess once className="h-12.5 w-12.5" />
            <p className="font-medium">Request sent!</p>
            <p className="text-sm text-muted">
              {tutor.name} will reach out to confirm your first free class.
            </p>
            <Button size="sm" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
            <input type="hidden" {...register("tutorId")} />
            <Select label="Grade" placeholder="Select grade" options={grades.map((g) => ({ label: g, value: g }))} {...register("grade")} error={errors.grade?.message} />
            <Select
              label="Board"
              placeholder="Select board"
              options={tutor.boards.map((b) => ({ label: b, value: b }))}
              {...register("board")}
              error={errors.board?.message}
            />
            <Select label="Preferred slot" placeholder="Select a slot" options={slots.map((s) => ({ label: s, value: s }))} {...register("preferredSlot")} error={errors.preferredSlot?.message} />
            <Textarea label="Notes (optional)" placeholder="Anything specific you'd like to cover?" rows={3} {...register("notes")} />
            {serverError && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{serverError}</p>}
            <Button type="submit" className="w-full">
              {isLoggedIn ? "Confirm request" : "Log in to book"}
            </Button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
