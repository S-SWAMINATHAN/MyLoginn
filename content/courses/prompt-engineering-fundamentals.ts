import { L, mk, q, pyChallenge } from "./_helpers";

export default mk({
  slug: "prompt-engineering-fundamentals", title: "Prompt Engineering Fundamentals", category: "AI & Generative AI", track: "ai", level: "Beginner", weeks: 2,
  description: "Learn to get reliable, useful results from AI assistants: how large language models respond, the anatomy of a good prompt, roles, context, examples, output formats, iteration and how to check AI answers for mistakes.",
  audience: "Students and professionals in any field who use AI assistants and want clear, repeatable, safe results.",
  objectives: ["Explain at a high level how language models generate answers and why they can be wrong", "Write prompts with a clear task, context, constraints and output format", "Use roles, examples and step-by-step instructions to improve results", "Iterate on a weak prompt using targeted feedback", "Verify AI output and spot hallucinations", "Protect sensitive information when using AI tools"],
  tags: ["Prompt Engineering", "Generative AI", "LLM", "ChatGPT", "AI Productivity"], relatedSlugs: ["generative-ai-fundamentals", "ai-tools-for-productivity"],
  modules: [
    { title: "Understanding the Tool", lessons: [
      L("What a language model is and is not", 13,
`## How it works, in plain words

A **large language model (LLM)** is trained on huge amounts of text to **predict the next piece of text** (a *token*) given what came before. By doing this over and over it can write essays, code, summaries and answers. It does not look things up unless it is connected to a search or documents tool, and it does not "know" things the way a person does.

## What this means for you

| Strength | Why |
|---|---|
| Drafting and rewriting text | Fluent patterns from training |
| Summarising and extracting | Works well on text you provide |
| Explaining concepts and giving examples | Common knowledge is well represented |
| Brainstorming and structuring | Combines patterns creatively |
| Writing and explaining code | Learned from large amounts of code |

| Limitation | Consequence |
|---|---|
| **Hallucination** | It can state false facts, sources or numbers confidently |
| **Knowledge cut-off** | Its training data ends at a date; recent events may be missing |
| **No guaranteed reasoning** | Maths and logic can fail without careful prompting or tools |
| **Sensitivity to wording** | Small prompt changes can change the answer |
| **No private memory of you** | It only uses what is in the conversation (and any settings you enabled) |

## Tokens and context

Text is split into **tokens** (roughly word pieces). The **context window** is how much text the model can consider at once (your prompt, the conversation and its reply). Very long chats may lose early details.

## Randomness

Models sample from probabilities, so the same prompt can give **different answers**. Some tools expose a **temperature** setting: low is more consistent, high is more varied.

## Practice

Ask an assistant a factual question you already know well and one with a deliberately made-up detail. Compare how it handles each.`,
        [q("What does a large language model fundamentally do?", ["Predicts the next token from the text so far", "Searches the Internet for every answer", "Thinks like a person", "Stores your password"], 0, "It generates text by predicting likely next tokens."), q("A confident but false statement from an AI is called a:", ["Hallucination", "Token", "Prompt", "Cache"], 0, "Hallucinations are plausible but incorrect outputs."), q("Why can the same prompt give different answers?", ["The model samples from probabilities", "The Internet changes", "Keyboards differ", "It never can"], 0, "Generation involves randomness unless it is set very low.")],
        ["A language model predicts likely next words, which makes it fluent but not always correct.", "Like a very well-read friend who answers quickly but sometimes remembers wrongly.", [["Strong", "Drafting, summarising, explaining", "Patterns from training"], ["Weak", "Facts, recent events, exact maths", "Hallucination risk"], ["Context", "Tokens and window", "Only what is in the chat"]], "Use AI as a capable assistant that you verify, not as an authority.", ["It predicts, it does not know", "It can hallucinate", "Give it the facts you need it to use"], "Trusting an AI answer without checking it."]),
      L("Anatomy of a good prompt", 15,
`## The five parts

A strong prompt usually contains:

1. **Task:** what you want done, with a clear verb.
2. **Context:** who it is for, background facts, the situation.
3. **Constraints:** length, tone, things to include or avoid.
4. **Format:** how the answer should look (bullets, table, JSON, email).
5. **Input:** the text or data to work on (clearly separated).

## Weak versus strong

**Weak:** *"Write about exercise."*

**Strong:**
\`\`\`
Task: Write a 120-word motivational message.
Audience: first-year college students who skip morning workouts.
Tone: friendly and practical, no medical claims.
Include: one 10-minute routine and one tip to build a habit.
Format: a short paragraph followed by three bullet points.
\`\`\`

## Use delimiters for input

Separate instructions from the material to work on so the model does not confuse them.

\`\`\`
Summarise the text between the triple quotes in 3 bullets.
"""
...paste the article here...
"""
\`\`\`

## Be specific, not long

Add detail that **changes the answer**: audience, level, goal, length. Remove filler. A short, precise prompt beats a long vague one.

## Say what to do, not only what to avoid

"Use simple words a 14-year-old understands" works better than "do not be complicated".

## Ask for what you will use

If you need a table or JSON to paste somewhere else, say so. If you want the AI to ask you questions first, say that too: *"Ask me up to 3 clarifying questions before you begin."*

## Practice

Rewrite "Explain databases" into a prompt with all five parts for a specific audience.`,
        [q("Which prompt part tells the model how the answer should look?", ["Task", "Format", "Context", "Input"], 1, "Format specifies bullets, table, JSON, email and so on."), q("Why use delimiters like triple quotes?", ["To separate instructions from the material to process", "To make text bold", "To hide text", "To save tokens only"], 0, "Delimiters prevent mixing instructions with the input text."), q("Which prompt is stronger?", ["Write about exercise.", "Write a 120-word friendly message for first-year students with one 10-minute routine, as a paragraph and three bullets.", "Exercise.", "Tell me everything."], 1, "It states audience, length, tone, content and format.")],
        ["A good prompt states the task, context, constraints, format and the input to work on.", "Like briefing a new colleague: they need the goal, the audience and what finished looks like.", [["Say", "Task and context", "Clear verb, real situation"], ["Shape", "Constraints and format", "Length, tone, structure"], ["Give", "Input in delimiters", "Material to work on"]], "Precision, not length, improves results.", ["Include audience and goal", "Specify the format", "Separate input with delimiters"], "Writing a one-line request and expecting the model to guess everything."]),
      L("Roles, examples and step-by-step instructions", 15,
`## Roles (personas)

Assigning a role sets the **perspective, vocabulary and level**: *"Act as an experienced QA lead reviewing a test plan."* A role helps tone and focus; it does not make the model more factually accurate, so still verify.

## Few-shot examples

Showing one to three examples teaches the pattern better than describing it.

\`\`\`
Classify the support message as Billing, Technical or Other.

Message: "I was charged twice this month." -> Billing
Message: "The app crashes when I open settings." -> Technical
Message: "Do you have a student discount?" -> Other

Message: "I can't log in after the update." ->
\`\`\`

**Zero-shot** means no examples, **one-shot** one, **few-shot** a few. Make examples **consistent and representative**.

## Step-by-step guidance

For multi-part tasks, list the steps or ask the model to work through them:

\`\`\`
1. List the main risks in the plan below.
2. Rate each as High, Medium or Low with one-sentence reasons.
3. Suggest one mitigation for each High risk.
\`\`\`

Asking for reasoning ("explain your steps briefly") can improve accuracy on logic and maths, and lets you spot errors.

## Positive and negative examples

Include a bad example only if you label it clearly as what to avoid.

## Asking for options

*"Give me three versions: formal, friendly and very short."* Comparing options is faster than rewriting one.

## Practice

Write a few-shot prompt that classifies customer emails into three categories with three examples.`,
        [q("What is a few-shot prompt?", ["A prompt containing a few worked examples of the pattern", "A very short prompt", "A prompt with no words", "A prompt that deletes data"], 0, "Few-shot prompts include a small number of examples."), q("Does assigning a role guarantee factual accuracy?", ["Yes, always", "No, it shapes tone and focus but you must still verify", "Only for maths", "Only for code"], 1, "Roles change style and perspective, not truthfulness."), q("Listing numbered steps in a prompt helps because:", ["It structures multi-part tasks and makes errors easier to spot", "It makes the answer longer", "It hides mistakes", "It reduces cost to zero"], 0, "Steps give the model a clear structure and let you check each part.")],
        ["Roles set the viewpoint, examples teach the pattern and steps structure the work.", "Like training an intern: show a sample, number the steps, and say whose seat they are sitting in.", [["Role", "Perspective and tone", "Still verify facts"], ["Examples", "Few-shot", "Consistent and representative"], ["Steps", "Numbered tasks", "Easier to check"]], "Show, structure and ask for options to get better first drafts.", ["Use examples for classification", "Break big tasks into steps", "Ask for several versions"], "Giving inconsistent examples that teach the wrong pattern."]),
    ] },
    { title: "Improving and Trusting Results", lessons: [
      L("Iterating and refining", 13,
`## Prompting is a conversation

The first answer is a draft. Improve it with **specific feedback**:

- *"Shorten to 80 words and keep the second bullet."*
- *"Make the tone more formal and remove jargon."*
- *"You assumed I use Windows. Give the macOS steps instead."*
- *"Add one real-world example for each point."*

Vague feedback ("make it better") gives vague results.

## A refinement loop

1. **Draft** with a structured prompt.
2. **Review** against your goal: what is missing, wrong or off-tone?
3. **Refine** with one or two targeted instructions.
4. **Repeat** until it is good enough, then **edit by hand**.

## Save what works

Keep a library of **prompt templates** with placeholders:

\`\`\`
Summarise the text below for [AUDIENCE] in [N] bullets.
Highlight any dates, owners and decisions.
Text: """[PASTE]"""
\`\`\`

Templates make results repeatable across a team.

## When it goes wrong

- **It ignores a rule:** repeat it once at the end and make it specific.
- **It rambles:** set a word limit and format.
- **It repeats itself:** start a fresh chat with a tighter prompt.
- **It drifts in a long chat:** restate the goal or summarise and restart.

## Ask the AI to improve the prompt

*"Here is my prompt and the poor result. What is missing or unclear in my prompt?"* is often a quick way to find the gap.

## Practice

Take a weak result you have received and write three targeted follow-up instructions to fix it.`,
        [q("Which follow-up is the most useful?", ["Make it better", "Shorten to 80 words and keep the second bullet", "Do it again", "Hmm"], 1, "Specific, actionable feedback produces specific improvements."), q("What is a prompt template?", ["A reusable prompt with placeholders", "A virus", "A model setting", "A file format"], 0, "Templates make good prompts repeatable."), q("If a long chat starts to drift, a good fix is to:", ["Restate the goal or restart with a summary", "Add more random text", "Ignore it", "Switch off the computer"], 0, "Refreshing the context keeps the model on track.")],
        ["Treat the first answer as a draft and refine with specific feedback.", "Like editing with a colleague: point to the line and say what to change.", [["Review", "Compare with your goal", "Missing, wrong, off-tone"], ["Refine", "One or two instructions", "Specific, not vague"], ["Save", "Templates", "Repeatable results"]], "Short targeted loops beat one giant perfect prompt.", ["Give specific feedback", "Keep templates", "Restart when a chat drifts"], "Saying 'make it better' and hoping."]),
      L("Checking AI output and avoiding hallucinations", 14,
`## Never skip verification

AI text can **sound right and be wrong**. Common failure types:

- **Invented facts, quotes and citations** (non-existent papers or URLs).
- **Wrong numbers** and arithmetic.
- **Outdated information** after the training cut-off.
- **Plausible but incorrect code** or commands.
- **Bias** from training data.

## A verification checklist

1. **Check key facts** against a reliable source (official documentation, a textbook, a recognised news source).
2. **Open every citation and link**; do not trust ones you have not seen.
3. **Run the code or command** in a safe environment before using it.
4. **Recalculate numbers** with a calculator or spreadsheet.
5. **Ask for sources or reasoning**, then verify them.
6. **Cross-check** with a second source or a second model for important decisions.

## Reduce hallucinations by design

- **Provide the source text** and say *"Answer only from the text below. If the answer is not in it, say 'Not in the text'."*
- **Ask for uncertainty:** *"If you are not sure, say so."*
- **Use tools** (search, calculators, code execution) when available.

## High-stakes areas

Do not rely on AI alone for medical, legal, financial or safety decisions. Use it to prepare questions and understand, then consult a qualified person.

## Academic and workplace honesty

Follow your school or employer's rules about AI use. Disclose it where required and remember **you are responsible** for what you submit.

## Practice

Ask an assistant for three references on a topic. Try to find each one. Record which were real.`,
        [q("What is the safest way to use a citation produced by an AI?", ["Trust it", "Open and verify it before using it", "Copy it into a report immediately", "Ignore all sources"], 1, "AI can invent plausible references, so check them."), q("Which prompt reduces hallucinations?", ["Answer only from the text below; if it is not there say 'Not in the text'.", "Tell me anything.", "Be creative.", "Guess if unsure."], 0, "Grounding the answer in provided text limits invention."), q("For medical or legal decisions you should:", ["Rely on AI alone", "Use AI for preparation and consult a qualified professional", "Never read anything", "Post questions publicly"], 1, "High-stakes decisions need qualified human judgement.")],
        ["AI output must be verified, because fluent text can still be false.", "Like a confident stranger giving directions: friendly, quick and worth checking on the map.", [["Check", "Facts, numbers, citations", "Use reliable sources"], ["Ground", "Provide the source text", "Answer only from it"], ["Escalate", "High-stakes topics", "Ask a professional"]], "You are responsible for anything you publish or submit.", ["Verify every citation", "Run code before using it", "Ground answers in provided text"], "Copying AI-generated references into a report without opening them."]),
      { ...L("Safe use of AI and a prompt-writing exercise", 14,
`## Protect information

Anything you paste into an online AI tool may be **stored, reviewed or used to improve the service**, depending on the product and settings. Rules of thumb:

- **Never paste** passwords, API keys, access tokens, bank or card numbers, health records, Aadhaar or other government IDs, or private customer data.
- **Remove or mask** names and identifiers (use "Customer A").
- **Follow your organisation's policy**: use approved tools and enterprise accounts where required.
- Check **privacy settings** for chat history and training use.

## Other risks

- **Prompt injection:** hidden instructions inside a web page or document can try to hijack an AI that reads it. Treat content from untrusted sources as data, not instructions.
- **Copyright and licences:** you may not be allowed to reuse generated text, images or code without checking terms.
- **Over-reliance:** keep practising core skills; use AI to speed up, not replace, your thinking.
- **Bias and fairness:** review outputs about people for stereotypes.

## Build a prompt checklist

Before you press Send ask: *Is the task clear? Is the audience stated? Are constraints and format given? Is the input separated? Is it safe to share this?*

## Mini exercise in code

Prompts can be built from templates. The challenge below practises assembling a prompt from parts, as a reusable template would.`,
        [q("Which is safe to paste into a public AI tool?", ["An API key", "A customer's personal data", "A made-up example with masked names", "A bank password"], 2, "Only masked or fictional data is safe."), q("Prompt injection is:", ["Hidden instructions in content that try to control the AI", "A way to speed up GPUs", "A type of keyboard", "A cooking method"], 0, "Untrusted content can contain instructions that hijack the AI."), q("Who is responsible for AI-assisted work you submit?", ["Only the AI company", "You are", "Nobody", "The reader"], 1, "You remain accountable for what you publish or submit.")],
        ["Treat AI tools like a public space: share carefully, mask details and watch for hidden instructions.", "Like talking in a lift: helpful, but not the place to read out your passwords.", [["Protect", "No secrets or personal data", "Mask identifiers"], ["Guard", "Prompt injection", "Content is data"], ["Own", "Check licences and policy", "You are responsible"]], "Safe habits let you benefit from AI without exposing data.", ["Never paste secrets", "Follow organisation policy", "Be accountable for output"], "Pasting a client's confidential document into a free public chatbot."]),
        challenge: pyChallenge("Build a prompt from a template", "Read three lines: the task, the audience, and the format. Print exactly: 'Task: <task>', then 'Audience: <audience>', then 'Format: <format>', each on its own line, then a final line 'Check facts before using.'", "task = input()\naudience = input()\nformat_ = input()\n# print the four lines\n",
          [{ input: "Summarise the article\nCollege students\n3 bullets", expected: "Task: Summarise the article\nAudience: College students\nFormat: 3 bullets\nCheck facts before using." }, { input: "Write an email\nCustomers\nShort paragraph", expected: "Task: Write an email\nAudience: Customers\nFormat: Short paragraph\nCheck facts before using.", hidden: true }],
          ["Use input() three times to read the parts.", "Use f-strings like f'Task: {task}'.", "The last line is always the same text."],
          "task = input()\naudience = input()\nformat_ = input()\nprint(f'Task: {task}')\nprint(f'Audience: {audience}')\nprint(f'Format: {format_}')\nprint('Check facts before using.')",
          "A template fills named slots with the user's values and adds a fixed reminder line.") },
    ] },
  ],
  final: [
    q("An LLM mainly works by:", ["Predicting likely next tokens", "Searching Google each time", "Reading your mind", "Running a database query"], 0, "Next-token prediction."),
    q("A confident but false AI statement is:", ["A hallucination", "A prompt", "A token", "A cache"], 0, "Hallucination."),
    q("Which part of a prompt states how the answer should look?", ["Format", "Task", "Context", "Input"], 0, "Format."),
    q("Why use delimiters around pasted text?", ["Separate instructions from material", "Make it colourful", "Hide it", "Shorten it"], 0, "Clear boundaries."),
    q("Few-shot prompting means:", ["Giving a few examples", "Giving no words", "Using a camera", "Using a short model"], 0, "Examples teach the pattern."),
    q("A role in a prompt mainly affects:", ["Perspective and tone", "Factual truth guarantees", "Internet speed", "File size"], 0, "It shapes style, not truth."),
    q("Which feedback is best?", ["Shorten to 80 words and keep bullet two", "Make it better", "Again", "Hmm"], 0, "Specific."),
    q("A prompt template is:", ["A reusable prompt with placeholders", "A virus", "A file system", "A GPU"], 0, "Reusable structure."),
    q("Before using an AI citation you should:", ["Verify it exists", "Trust it", "Ignore it", "Delete it"], 0, "Check sources."),
    q("To reduce hallucination, you can:", ["Provide the source text and require answers only from it", "Ask for creativity", "Use no context", "Remove all constraints"], 0, "Grounding."),
    q("Which should never be pasted into a public AI chat? (select all that apply)", ["Passwords", "API keys", "Customer personal data", "A fictional example"], [0, 1, 2], "Fictional examples are fine."),
    q("Prompt injection is:", ["Hidden instructions in content that try to control the AI", "A GPU feature", "A cooking style", "A spreadsheet formula"], 0, "A security risk."),
    q("Who is responsible for AI-assisted work you submit?", ["You", "Nobody", "The model", "The reader"], 0, "You are accountable."),
    q("For medical or legal decisions you should:", ["Consult a qualified professional", "Rely on AI alone", "Guess", "Ask a stranger"], 0, "High stakes."),
    q("Same prompt, different answers because:", ["Generation involves randomness", "The Internet changed", "Your screen is different", "Never happens"], 0, "Sampling."),
  ],
  project: { title: "Capstone: a personal prompt library", brief: "Create a library of five reusable prompt templates for your own study or work (summarise, explain, plan, rewrite, quiz). For each include the five prompt parts, one example input and output you verified, a note on how you checked accuracy, and a data-safety rule." },
});
