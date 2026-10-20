/**
 * Languages the competition judge can run. Safe to import from client components (no secrets, no server code).
 * `piston` names the runtime on the judge server; only languages installed and tested there may be enabled on a
 * competition (the admin screen shows what each connected worker reports).
 */
export const COMPETITION_LANGUAGES = {
  python: {
    label: "Python 3",
    monaco: "python",
    piston: "python",
    file: "main.py",
    starter: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    # write your solution here\n\nmain()\n",
  },
  javascript: {
    label: "JavaScript (Node.js)",
    monaco: "javascript",
    piston: "javascript",
    file: "main.js",
    starter: "const data = require(\"fs\").readFileSync(0, \"utf8\").trim().split(/\\s+/);\n// write your solution here\n",
  },
  java: {
    label: "Java",
    monaco: "java",
    piston: "java",
    file: "Main.java",
    starter: "import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));\n        // write your solution here\n    }\n}\n",
  },
  cpp: {
    label: "C++ 17",
    monaco: "cpp",
    piston: "c++",
    file: "main.cpp",
    starter: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    // write your solution here\n    return 0;\n}\n",
  },
} as const;

export type CompetitionLanguage = keyof typeof COMPETITION_LANGUAGES;

export const LANGUAGE_KEYS = Object.keys(COMPETITION_LANGUAGES) as CompetitionLanguage[];

export const isLanguage = (value: unknown): value is CompetitionLanguage =>
  typeof value === "string" && Object.prototype.hasOwnProperty.call(COMPETITION_LANGUAGES, value);

/** Narrows a stored JSON list to known language keys, keeping order and dropping anything else. */
export function toLanguageList(value: unknown): CompetitionLanguage[] {
  return Array.isArray(value) ? [...new Set(value.filter(isLanguage))] : [];
}

/** Largest source accepted for run, save or submit. */
export const MAX_SOURCE_CHARS = 64_000;
/** Largest custom stdin for Run. */
export const MAX_RUN_INPUT_CHARS = 16_000;
