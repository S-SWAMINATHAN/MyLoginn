/**
 * "What is the output?" helpers for the extra question files. The first option must be the program's exact output;
 * `npm run lq:validate` compiles and runs every program to confirm it.
 */
import type { RawQ } from "../../types";
import { m } from "../build";

type D = 1 | 2 | 3;
const indent = (code: string, pad: string) => code.split("\n").map((l) => `${pad}${l}`).join("\n");

export const C_STDIO = "#include <stdio.h>\n";
export const C_STR = "#include <stdio.h>\n#include <string.h>\n";
export const C_LIB = "#include <stdio.h>\n#include <stdlib.h>\n";

export function cOut(code: string, o: string[], e: string, d: D = 1, headers = C_STDIO): RawQ {
  const src = code.includes("int main") ? `${headers}${code}` : `${headers}\nint main(void) {\n${indent(code, "    ")}\n    return 0;\n}`;
  return m(`What will be the output of the program?\n\`\`\`c\n${src}\n\`\`\``, o, e, { d, check: `c:${src}` });
}

export const CPP_IO = "#include <iostream>\nusing namespace std;\n";

export function cppOut(code: string, o: string[], e: string, d: D = 1, headers = CPP_IO): RawQ {
  const src = code.includes("int main") ? `${headers}${code}` : `${headers}\nint main() {\n${indent(code, "    ")}\n    return 0;\n}`;
  return m(`What will be the output of the program?\n\`\`\`cpp\n${src}\n\`\`\``, o, e, { d, check: `cpp:${src}` });
}

export function javaOut(code: string, o: string[], e: string, d: D = 1, imports = ""): RawQ {
  const src = code.includes("class Main") ? `${imports}${code}` : `${imports}public class Main {\n    public static void main(String[] args) {\n${indent(code, "        ")}\n    }\n}`;
  return m(`What is the output of the following program?\n\`\`\`java\n${src}\n\`\`\``, o, e, { d, check: `java:${src}` });
}

export function pyOut(code: string, o: string[], e: string, d: D = 1): RawQ {
  return m(`What is the output of the following code?\n\`\`\`python\n${code}\n\`\`\``, o, e, { d, check: `py:${code}` });
}
