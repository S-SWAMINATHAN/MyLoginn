"use client";

import { useEffect, useState } from "react";
import type { LessonQuizQuestion } from "@/lib/freeCourseTutorial";

type Props = { quiz: LessonQuizQuestion[] };

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function shuffleQuiz(questions: LessonQuizQuestion[]) {
  return shuffle(questions).map((question) => ({ ...question, options: shuffle(question.options) }));
}

export function LessonQuiz({ quiz }: Props) {
  const [questions, setQuestions] = useState(quiz);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setQuestions(shuffleQuiz(quiz));
  }, [quiz]);

  function restart() {
    setQuestions(shuffleQuiz(quiz));
    setQuestionIndex(0);
    setAnswers({});
    setChecked({});
    setFinished(false);
  }

  const question = questions[questionIndex];
  if (!question) return null;
  const selected = answers[questionIndex] ?? "";
  const isChecked = Boolean(checked[questionIndex]);
  const isCorrect = selected === question.answer;
  const score = questions.reduce((total, item, index) => total + (answers[index] === item.answer ? 1 : 0), 0);
  const correctOption = question.options.find((option) => option.id === question.answer);

  return <section className="mt-8 rounded-2xl border border-brand-200 bg-brand-50/50 p-5 dark:bg-brand-900/10" aria-labelledby="lesson-quiz-title">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 id="lesson-quiz-title" className="text-lg font-bold">Lesson quiz</h2>
      <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">{finished ? `${score} / ${questions.length} correct` : `Question ${questionIndex + 1} of ${questions.length}`}</span>
    </div>

    {finished ? <div className="mt-5">
      <p className="text-sm leading-6">You got <strong>{score} of {questions.length}</strong> questions correct.</p>
      <p className="mt-1 text-sm text-muted">Review the lesson and try again to improve your score.</p>
      <button type="button" onClick={restart} className="mt-4 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Shuffle and try again</button>
    </div> : <>
      <fieldset className="mt-4 space-y-2">
        <legend className="mb-3 text-sm font-medium leading-6">{question.question}</legend>
        {question.options.map((option, optionIndex) => {
          const label = String.fromCharCode(65 + optionIndex);
          const correctChoice = isChecked && option.id === question.answer;
          const wrongChoice = isChecked && option.id === selected && !isCorrect;
          return <label key={option.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${correctChoice ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30" : wrongChoice ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20" : selected === option.id ? "border-brand-400 bg-white dark:bg-slate-900" : "border-border-soft bg-surface"}`}>
            <input type="radio" name={`lesson-quiz-${questionIndex}`} value={option.id} checked={selected === option.id} disabled={isChecked} onChange={() => { setAnswers((current) => ({ ...current, [questionIndex]: option.id })); }} className="mt-0.5 accent-brand-600" />
            <span><strong className="mr-2">{label}</strong>{option.text}</span>
          </label>;
        })}
      </fieldset>

      {!isChecked ? <button type="button" onClick={() => setChecked((current) => ({ ...current, [questionIndex]: true }))} disabled={!selected} className="mt-4 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Check answer</button> : <>
        <p role="status" className={`mt-3 text-sm leading-6 ${isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-amber-800 dark:text-amber-200"}`}><strong>{isCorrect ? "Correct." : "Not quite."}</strong> {question.explanation}{!isCorrect && correctOption && <> Correct answer: <strong>{String.fromCharCode(65 + question.options.findIndex((option) => option.id === question.answer))}. {correctOption.text}</strong></>}</p>
        <button type="button" onClick={() => questionIndex + 1 < questions.length ? setQuestionIndex((current) => current + 1) : setFinished(true)} className="mt-4 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white">{questionIndex + 1 < questions.length ? "Next question" : "See results"}</button>
      </>}
    </>}
  </section>;
}
