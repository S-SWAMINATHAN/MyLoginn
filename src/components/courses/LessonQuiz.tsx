"use client";

import { useState } from "react";

type Props = {
  quiz: { question: string; options: { id: string; text: string }[]; answer: string; explanation: string };
};

export function LessonQuiz({ quiz }: Props) {
  const [selected, setSelected] = useState("");
  const [checked, setChecked] = useState(false);
  const isCorrect = selected === quiz.answer;

  return <section className="mt-8 rounded-2xl border border-brand-200 bg-brand-50/50 p-5 dark:bg-brand-900/10" aria-labelledby="lesson-quiz-title">
    <h2 id="lesson-quiz-title" className="text-lg font-bold">Suggested quiz</h2>
    <fieldset className="mt-3 space-y-2">
      <legend className="mb-3 text-sm font-medium leading-6">{quiz.question}</legend>
      {quiz.options.map((option) => <label key={option.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${selected === option.id ? "border-brand-400 bg-white dark:bg-slate-900" : "border-border-soft bg-surface"}`}>
        <input type="radio" name="lesson-quiz" value={option.id} checked={selected === option.id} onChange={() => { setSelected(option.id); setChecked(false); }} className="mt-0.5 accent-brand-600" />
        <span><strong className="mr-2">{option.id}</strong>{option.text}</span>
      </label>)}
    </fieldset>
    <button type="button" onClick={() => setChecked(true)} disabled={!selected} className="mt-4 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Check answer</button>
    {checked && <p role="status" className={`mt-3 text-sm leading-6 ${isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-amber-800 dark:text-amber-200"}`}><strong>{isCorrect ? "Correct." : "Not quite."}</strong> {quiz.explanation}</p>}
  </section>;
}
