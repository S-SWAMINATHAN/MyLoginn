/**
 * C Programming. Output programs are compiled and run by `npm run lq:validate` (with LQ_ZIG_PYTHON set).
 * Programs avoid undefined and implementation-defined behaviour, so each has exactly one correct output.
 */
import type { RawQ, RawSubject } from "../types";
import { m, m2, m3, topic } from "./build";

const prog = (code: string, headers = "#include <stdio.h>\n") =>
  code.includes("int main") ? `${headers}${code}` : `${headers}\nint main(void) {\n${code.split("\n").map((l) => `    ${l}`).join("\n")}\n    return 0;\n}`;
const out = (code: string, o: string[], e: string, d: 1 | 2 | 3 = 1, headers?: string): RawQ => {
  const src = prog(code, headers);
  return m(`What will be the output of the program?\n\`\`\`c\n${src}\n\`\`\``, o, e, { d, check: `c:${src}` });
};
const H_STR = "#include <stdio.h>\n#include <string.h>\n";
const H_LIB = "#include <stdio.h>\n#include <stdlib.h>\n";

const declarations: RawQ[] = [
  m("Which of the following is a valid C identifier?", ["_count1", "1count", "count-1", "int"], "Identifiers may contain letters, digits and underscores, cannot start with a digit and cannot be keywords."),
  m("What is the difference between a declaration and a definition of a variable?", ["A declaration announces the name and type; a definition also allocates storage", "They are the same", "A definition only announces the type", "A declaration allocates memory twice"], "extern int x; declares; int x; (at file scope) defines."),
  out("int a = 10, b = 3;\nprintf(\"%d %d\\n\", a / b, a % b);", ["3 1", "3.33 1", "3 0", "4 1"], "Integer division truncates: 10 / 3 = 3, remainder 1."),
  out("static int x;\nprintf(\"%d\\n\", x);", ["0", "Garbage value", "1", "Compile error"], "Static (and global) variables are zero-initialised.", 2),
  m("What is the storage class of a local variable declared without any keyword?", ["auto", "static", "register", "extern"], "Local variables default to automatic storage."),
  out("int x = 5;\n{\n    int x = 10;\n    printf(\"%d \", x);\n}\nprintf(\"%d\\n\", x);", ["10 5", "10 10", "5 5", "5 10"], "The inner block's x hides the outer one only within the block.", 2),
  m("Which keyword tells the compiler that a variable is defined in another file?", ["extern", "static", "volatile", "global"], "extern declares a variable defined elsewhere."),
  out("float f = 7 / 2;\nprintf(\"%.1f\\n\", f);", ["3.0", "3.5", "4.0", "3"], "7 / 2 is integer division (3) before it is converted to float.", 2),
  out("int arr[5] = {1, 2};\nprintf(\"%d %d\\n\", arr[1], arr[4]);", ["2 0", "2 Garbage", "1 0", "Compile error"], "Elements not explicitly initialised in a partly initialised array are set to 0."),
];

const controlInstructions: RawQ[] = [
  out("int i;\nfor (i = 0; i < 5; i++);\nprintf(\"%d\\n\", i);", ["5", "4", "0 1 2 3 4", "Infinite loop"], "The semicolon after for makes an empty loop body; afterwards i is 5.", 2),
  out("int x = 3;\nswitch (x) {\n    case 1: printf(\"one \");\n    case 3: printf(\"three \");\n    case 4: printf(\"four \");\n    default: printf(\"other\");\n}\nprintf(\"\\n\");", ["three four other", "three", "three four", "other"], "With no break, execution falls through all following cases.", 2),
  out("int i = 0;\nwhile (i < 3) {\n    printf(\"%d \", i);\n    i++;\n}\nprintf(\"\\n\");", ["0 1 2", "1 2 3", "0 1 2 3", "0 1"], "The loop runs for i = 0, 1, 2."),
  out("int i = 10;\ndo {\n    printf(\"%d \", i);\n} while (i < 5);\nprintf(\"\\n\");", ["10", "Nothing", "10 11 12 13 14", "5"], "A do-while loop runs its body once before testing the condition."),
  out("int i;\nfor (i = 1; i <= 10; i++) {\n    if (i % 2) continue;\n    if (i > 6) break;\n    printf(\"%d \", i);\n}\nprintf(\"\\n\");", ["2 4 6", "1 3 5", "2 4 6 8", "2 4"], "Odd numbers are skipped; the loop breaks at 8."),
  out("int x = 0;\nif (x = 5)\n    printf(\"yes\\n\");\nelse\n    printf(\"no\\n\");", ["yes", "no", "Compile error", "Nothing"], "x = 5 is an assignment whose value (5) is non-zero, so the condition is true.", 2),
  out("int i, j, c = 0;\nfor (i = 0; i < 3; i++)\n    for (j = i; j < 3; j++)\n        c++;\nprintf(\"%d\\n\", c);", ["6", "9", "3", "4"], "The inner loop runs 3 + 2 + 1 = 6 times.", 2),
  m("Which statement transfers control to the next iteration of a loop?", ["continue", "break", "goto", "return"], "continue skips the rest of the current iteration."),
];

const expressions: RawQ[] = [
  out("int a = 2 + 3 * 4 - 6 / 2;\nprintf(\"%d\\n\", a);", ["11", "7", "17", "14"], "Multiplication and division first: 2 + 12 − 3 = 11."),
  out("int x = 5;\nint y = x++ * 2;\nprintf(\"%d %d\\n\", x, y);", ["6 10", "6 12", "5 10", "5 12"], "x++ yields 5 for the multiplication, then x becomes 6.", 2),
  out("int a = 1, b = 0, c;\nc = a && b || !b;\nprintf(\"%d\\n\", c);", ["1", "0", "2", "Compile error"], "&& binds tighter than ||: (1 && 0) || !0 = 0 || 1 = 1.", 2),
  out("int x = 10;\nx += 5;\nx -= 3;\nx *= 2;\nprintf(\"%d\\n\", x);", ["24", "22", "27", "12"], "10 + 5 = 15, − 3 = 12, × 2 = 24."),
  out("int a = 7, b = 2;\nprintf(\"%d %d\\n\", -a / b, -a % b);", ["-3 -1", "-4 1", "-3 1", "-4 -1"], "Since C99, integer division truncates towards zero: −7 / 2 = −3 and −7 % 2 = −1.", 3),
  out("int a = 5, b = 10;\nint max = (a > b) ? a : b;\nprintf(\"%d\\n\", max);", ["10", "5", "1", "0"], "The conditional operator returns b because a > b is false."),
  out("int x = 3;\nint y = (x > 2) + (x < 2) + (x == 3);\nprintf(\"%d\\n\", y);", ["2", "3", "1", "0"], "Relational operators yield 1 or 0: 1 + 0 + 1 = 2."),
  out("int a = 10;\nint b = (a = 3, a + 2);\nprintf(\"%d %d\\n\", a, b);", ["3 5", "10 12", "3 3", "10 5"], "The comma operator evaluates left to right and yields its right operand.", 3),
];

const floatingPoint: RawQ[] = [
  out("float a = 0.1f;\nif (a == 0.1)\n    printf(\"equal\\n\");\nelse\n    printf(\"not equal\\n\");", ["not equal", "equal", "Compile error", "Nothing"], "0.1f (float) and 0.1 (double) are different approximations of 0.1, so they compare unequal.", 3),
  out("double d = 10.0 / 4;\nprintf(\"%.2f\\n\", d);", ["2.50", "2.00", "2.5", "3.00"], "A double operand gives true division; %.2f prints two decimals."),
  out("printf(\"%d\\n\", (int)3.99);", ["3", "4", "3.99", "0"], "Converting a floating value to int truncates towards zero."),
  out("printf(\"%.3f\\n\", 2.0 / 3);", ["0.667", "0.666", "0.67", "0.000"], "2/3 = 0.6666…, printed with rounding to three places: 0.667."),
  m("Which format specifier prints a double in printf?", ["%f (or %lf)", "%d", "%c", "%x"], "%f prints a double; %lf is also accepted by printf in C99."),
  out("printf(\"%zu %zu\\n\", sizeof(float), sizeof(double));", ["4 8", "4 4", "8 8", "2 4"], "On all mainstream platforms (IEEE 754), float is 4 bytes and double is 8.", 2),
  out("int i = 7;\nprintf(\"%.1f\\n\", i / 2.0f);", ["3.5", "3.0", "4.0", "3"], "Dividing by a float literal gives a float result: 3.5.", 1),
];

const functions: RawQ[] = [
  out("int square(int n) { return n * n; }\nint main(void) {\n    printf(\"%d\\n\", square(square(2)));\n    return 0;\n}", ["16", "4", "8", "2"], "square(2) = 4, square(4) = 16."),
  out("void swap(int a, int b) { int t = a; a = b; b = t; }\nint main(void) {\n    int x = 1, y = 2;\n    swap(x, y);\n    printf(\"%d %d\\n\", x, y);\n    return 0;\n}", ["1 2", "2 1", "0 0", "Compile error"], "C passes arguments by value; swap changes only its copies.", 2),
  out("void swap(int *a, int *b) { int t = *a; *a = *b; *b = t; }\nint main(void) {\n    int x = 1, y = 2;\n    swap(&x, &y);\n    printf(\"%d %d\\n\", x, y);\n    return 0;\n}", ["2 1", "1 2", "0 0", "Compile error"], "Passing addresses lets the function change the caller's variables."),
  out("int counter(void) { static int c = 0; return ++c; }\nint main(void) {\n    counter(); counter();\n    printf(\"%d\\n\", counter());\n    return 0;\n}", ["3", "1", "0", "2"], "A static local variable keeps its value between calls.", 2),
  out("int fact(int n) { return n <= 1 ? 1 : n * fact(n - 1); }\nint main(void) {\n    printf(\"%d\\n\", fact(6));\n    return 0;\n}", ["720", "120", "36", "6"], "fact multiplies down to the base case: 6 × 5 × 4 × 3 × 2 × 1 = 720."),
  out("int fib(int n) { return n < 2 ? n : fib(n - 1) + fib(n - 2); }\nint main(void) {\n    printf(\"%d\\n\", fib(10));\n    return 0;\n}", ["55", "89", "34", "10"], "The 10th Fibonacci number (fib(0) = 0) is 55.", 2),
  m("What is the default return type of a function in old (pre-C99) C if none is specified?", ["int", "void", "char", "float"], "Implicit int was allowed in C89; C99 and later require the return type."),
  m("What is a function prototype?", ["A declaration giving the return type and parameter types", "The body of a function", "A macro", "A recursive call"], "Prototypes let the compiler check calls before the definition."),
];

const preprocessor: RawQ[] = [
  out("#define SQUARE(x) x * x\nint main(void) {\n    printf(\"%d\\n\", SQUARE(2 + 3));\n    return 0;\n}", ["11", "25", "10", "13"], "Macros substitute text: 2 + 3 * 2 + 3 = 11. Parenthesise macro parameters: ((x) * (x)).", 2),
  out("#define SQUARE(x) ((x) * (x))\nint main(void) {\n    printf(\"%d\\n\", SQUARE(2 + 3));\n    return 0;\n}", ["25", "11", "10", "13"], "With parentheses the expansion is ((2 + 3) * (2 + 3)) = 25."),
  out("#define MAX(a, b) ((a) > (b) ? (a) : (b))\nint main(void) {\n    printf(\"%d\\n\", MAX(4, 9));\n    return 0;\n}", ["9", "4", "1", "0"], "The macro expands to a conditional expression."),
  out("#define STR(x) #x\nint main(void) {\n    printf(\"%s\\n\", STR(hello));\n    return 0;\n}", ["hello", "x", "STR(hello)", "Compile error"], "The # operator turns a macro argument into a string literal.", 2),
  out("#define CAT(a, b) a##b\nint main(void) {\n    int xy = 42;\n    printf(\"%d\\n\", CAT(x, y));\n    return 0;\n}", ["42", "xy", "0", "Compile error"], "## pastes two tokens together, producing the identifier xy.", 3),
  out("#define DEBUG 0\nint main(void) {\n#if DEBUG\n    printf(\"debug\\n\");\n#else\n    printf(\"release\\n\");\n#endif\n    return 0;\n}", ["release", "debug", "debug release", "Nothing"], "Conditional compilation keeps only the #else branch."),
  m("When is a C macro expanded?", ["Before compilation, by the preprocessor", "At run time", "At link time", "When the function is called"], "The preprocessor replaces macros before the compiler sees the code."),
  m("What is the purpose of an include guard (#ifndef X / #define X / #endif)?", ["To prevent a header's contents from being included twice", "To speed up linking", "To declare global variables", "To define macros only in debug builds"], "Include guards avoid duplicate definitions when a header is included more than once."),
];

const pointers: RawQ[] = [
  out("int a = 10;\nint *p = &a;\n*p = 20;\nprintf(\"%d\\n\", a);", ["20", "10", "Address of a", "Compile error"], "*p refers to a, so assigning through p changes a."),
  out("int arr[] = {10, 20, 30};\nint *p = arr;\nprintf(\"%d %d\\n\", *(p + 1), p[2]);", ["20 30", "10 20", "11 12", "20 20"], "Pointer arithmetic: p + 1 points to arr[1]; p[2] is the same as *(p + 2)."),
  out("int x = 5;\nint *p = &x;\nint **q = &p;\nprintf(\"%d\\n\", **q);", ["5", "Address of x", "Address of p", "Compile error"], "q points to p, which points to x: **q is x.", 2),
  out("int arr[5] = {1, 2, 3, 4, 5};\nint *p = &arr[1], *q = &arr[4];\nprintf(\"%td\\n\", q - p);", ["3", "12", "4", "16"], "Subtracting pointers gives the number of elements between them, not bytes.", 2),
  out("char s[] = \"hello\";\nchar *p = s;\np++;\nprintf(\"%c %s\\n\", *p, p);", ["e ello", "h hello", "e hello", "h ello"], "After p++, p points to 'e' and the string from there is \"ello\".", 2),
  out("int a[] = {1, 2, 3};\nint *p = a;\nprintf(\"%d \", *p++);\nprintf(\"%d\\n\", *p);", ["1 2", "2 2", "2 3", "1 1"], "*p++ returns the current element and then advances the pointer.", 3),
  m("What is a NULL pointer?", ["A pointer that does not point to any valid object", "A pointer to address 1", "A pointer to a deleted function", "An uninitialised pointer"], "Dereferencing NULL is undefined behaviour; it is used to mean 'points nowhere'."),
  m("What does the declaration int *p[10]; declare?", ["An array of 10 pointers to int", "A pointer to an array of 10 ints", "A function returning a pointer", "A pointer to a pointer"], "[] binds tighter than *, so p is an array of 10 int pointers."),
];

const arrays: RawQ[] = [
  out("int a[] = {4, 8, 15, 16, 23, 42};\nprintf(\"%zu\\n\", sizeof(a) / sizeof(a[0]));", ["6", "24", "4", "5"], "Dividing the total size by the size of one element gives the element count."),
  out("int a[3][3] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};\nprintf(\"%d %d\\n\", a[1][2], a[2][0]);", ["6 7", "5 7", "6 8", "8 3"], "Row 1, column 2 is 6; row 2, column 0 is 7."),
  out("int a[5] = {5, 3, 9, 1, 7}, i, max = a[0];\nfor (i = 1; i < 5; i++) if (a[i] > max) max = a[i];\nprintf(\"%d\\n\", max);", ["9", "7", "5", "1"], "The loop keeps the largest value seen."),
  out("int a[] = {1, 2, 3, 4};\nint s = 0, i;\nfor (i = 0; i < 4; i++) s += a[i] * a[i];\nprintf(\"%d\\n\", s);", ["30", "10", "16", "100"], "1 + 4 + 9 + 16 = 30."),
  m("In C, array indexes start at:", ["0", "1", "-1", "Any value chosen by the programmer"], "The first element is a[0]."),
  m("What happens if you access an array element outside its bounds in C?", ["Undefined behaviour — C does not check bounds", "A runtime exception is thrown", "The compiler always reports an error", "The array grows automatically"], "C performs no bounds checking; the result is undefined."),
  out("int a[2][3] = {1, 2, 3, 4, 5, 6};\nprintf(\"%d\\n\", *(*(a + 1) + 1));", ["5", "2", "4", "6"], "a + 1 is row 1 ({4, 5, 6}); adding 1 within it gives 5.", 3),
  m("When an array is passed to a function, what is actually passed?", ["A pointer to its first element", "A copy of the whole array", "The array's size", "A reference counted copy"], "Arrays decay to pointers when passed to functions."),
];

const strings: RawQ[] = [
  out("char s[] = \"Hello\";\nprintf(\"%zu %zu\\n\", strlen(s), sizeof(s));", ["5 6", "5 5", "6 6", "6 5"], "strlen excludes the terminating '\\0'; sizeof includes it.", 2, H_STR),
  out("char a[20] = \"Good \";\nstrcat(a, \"day\");\nprintf(\"%s\\n\", a);", ["Good day", "Goodday", "day", "Good"], "strcat appends the second string to the first.", 1, H_STR),
  out("printf(\"%d\\n\", strcmp(\"apple\", \"apple\"));", ["0", "1", "-1", "5"], "strcmp returns 0 for equal strings.", 1, H_STR),
  out("char s[] = \"abc\";\nint i, n = 0;\nfor (i = 0; s[i] != '\\0'; i++) n++;\nprintf(\"%d\\n\", n);", ["3", "4", "2", "0"], "The loop counts characters until the null terminator."),
  out("char s[10];\nstrcpy(s, \"code\");\ns[0] = 'm';\nprintf(\"%s\\n\", s);", ["mode", "code", "mcode", "Compile error"], "strcpy copies into the array, which can then be modified.", 1, H_STR),
  out("char s[] = \"programming\";\nprintf(\"%c%c\\n\", s[3], s[10]);", ["gg", "gm", "rg", "og"], "s[3] is 'g' (p-r-o-g) and s[10] is the last character 'g'.", 2),
  out("printf(\"%.3s\\n\", \"abcdef\");", ["abc", "abcdef", "def", "ab"], "A precision with %s limits the number of characters printed.", 2),
  m("Which function safely reads a line of input including spaces, with a size limit?", ["fgets", "gets", "scanf(\"%s\")", "getchar"], "gets has no size limit (removed in C11); scanf(\"%s\") stops at whitespace."),
];

const structures: RawQ[] = [
  out("struct Point { int x, y; };\nint main(void) {\n    struct Point p = {3, 4};\n    struct Point *q = &p;\n    q->x = 10;\n    printf(\"%d %d\\n\", p.x, q->y);\n    return 0;\n}", ["10 4", "3 4", "10 10", "Compile error"], "q->x is (*q).x, which changes p.x."),
  out("enum Color { RED, GREEN = 5, BLUE };\nint main(void) {\n    printf(\"%d %d %d\\n\", RED, GREEN, BLUE);\n    return 0;\n}", ["0 5 6", "0 1 2", "1 5 6", "0 5 2"], "Enumerators start at 0; after GREEN = 5, BLUE is 6.", 2),
  out("union U { int i; char c; };\nint main(void) {\n    printf(\"%zu\\n\", sizeof(union U));\n    return 0;\n}", ["4", "5", "8", "1"], "A union is as large as its largest member (int: 4 bytes here).", 2),
  out("struct S { char a; int b; };\nint main(void) {\n    printf(\"%zu\\n\", sizeof(struct S));\n    return 0;\n}", ["8", "5", "4", "6"], "Padding aligns b to a 4-byte boundary: 1 byte + 3 padding + 4 bytes = 8 (on typical platforms).", 3),
  out("struct Student { char name[10]; int marks; };\nint main(void) {\n    struct Student s[2] = {{\"Asha\", 90}, {\"Ravi\", 75}};\n    printf(\"%s %d\\n\", s[1].name, s[0].marks);\n    return 0;\n}", ["Ravi 90", "Asha 75", "Ravi 75", "Asha 90"], "s[1].name is \"Ravi\" and s[0].marks is 90."),
  m("What is the key difference between a structure and a union?", ["All structure members have separate storage; union members share the same storage", "Unions cannot contain integers", "Structures cannot contain arrays", "There is no difference"], "Only one union member holds a meaningful value at a time."),
  m("Which operator accesses a member through a pointer to a structure?", ["->", ".", "::", "*"], "p->member is shorthand for (*p).member."),
];

const inputOutput: RawQ[] = [
  out("printf(\"%5d|%-5d|\\n\", 42, 42);", ["   42|42   |", "42   |   42|", "42|42|", "00042|42000|"], "%5d right-aligns in 5 columns; %-5d left-aligns.", 2),
  out("printf(\"%x %o %X\\n\", 255, 8, 171);", ["ff 10 AB", "FF 10 ab", "ff 8 AB", "255 8 171"], "%x and %X print hexadecimal (lower/upper case); %o prints octal.", 2),
  out("printf(\"%c%c\\n\", 72, 'i');", ["Hi", "72i", "H i", "Compile error"], "%c prints the character with code 72, which is 'H'."),
  out("int n = printf(\"abc\");\nprintf(\" %d\\n\", n);", ["abc 3", "abc 4", "3 abc", "abc 0"], "printf returns the number of characters printed.", 3),
  out("printf(\"%05.1f\\n\", 3.14159);", ["003.1", "3.14159", "03.14", "3.1"], "Width 5 with zero padding and one decimal place gives 003.1.", 3),
  m("Which function reads a single character from standard input?", ["getchar()", "putchar()", "gets()", "printf()"], "getchar reads one character; putchar writes one."),
  m("What does scanf(\"%d\", &n) return when it successfully reads one integer?", ["1", "0", "The value of n", "EOF"], "scanf returns the number of items successfully assigned."),
  out("printf(\"%%d\\n\");", ["%d", "%%d", "Garbage value", "Compile error"], "%% prints a literal percent sign.", 2),
];

const commandLine: RawQ[] = [
  m("What does argv[0] usually contain?", ["The program's name or path", "The first user argument", "The number of arguments", "NULL"], "argv[0] is the program name; user arguments start at argv[1]."),
  m("If a program is run as `./app one two`, what is argc?", ["3", "2", "1", "4"], "argc counts the program name plus the two arguments."),
  m("What is argv[argc] guaranteed to be?", ["A null pointer", "An empty string", "The last argument", "Undefined"], "The C standard guarantees argv[argc] == NULL."),
  m("Which is a correct declaration of main that accepts command-line arguments?", ["int main(int argc, char *argv[])", "void main(string args)", "int main(char argv, int argc)", "int main(int argc, int argv[])"], "argv is an array of strings (char *)."),
  m("How do you convert a numeric command-line argument such as \"25\" to an int?", ["atoi(argv[1]) or strtol(argv[1], NULL, 10)", "(int) argv[1]", "argv[1] - '0'", "int(argv[1])"], "Arguments arrive as strings; atoi or strtol converts them."),
  out("int main(int argc, char *argv[]) {\n    printf(\"%d\\n\", argc);\n    return 0;\n}", ["1", "0", "2", "Garbage value"], "When run with no extra arguments, argc is 1 (only the program name).", 2),
];

const bitwise: RawQ[] = [
  out("printf(\"%d %d %d\\n\", 12 & 10, 12 | 10, 12 ^ 10);", ["8 14 6", "8 14 4", "12 10 6", "2 14 6"], "12 = 1100, 10 = 1010: & = 1000 (8), | = 1110 (14), ^ = 0110 (6).", 2),
  out("printf(\"%d %d\\n\", 5 << 2, 40 >> 3);", ["20 5", "10 5", "20 4", "7 5"], "Left shift by 2 multiplies by 4; right shift by 3 divides by 8."),
  out("unsigned int x = 0;\nprintf(\"%u\\n\", ~x);", ["4294967295", "-1", "0", "1"], "~0 sets all 32 bits of an unsigned int: 4294967295.", 3),
  out("int n = 29, count = 0;\nwhile (n) { count += n & 1; n >>= 1; }\nprintf(\"%d\\n\", count);", ["4", "3", "5", "29"], "29 = 11101 in binary, which has four 1-bits.", 2),
  out("int a = 6;\nprintf(\"%d\\n\", (a & (a - 1)) == 0);", ["0", "1", "6", "5"], "n & (n − 1) clears the lowest set bit; it is 0 only for powers of two. 6 & 5 = 4, so the result is 0.", 2),
  out("int x = 5, y = 9;\nx ^= y; y ^= x; x ^= y;\nprintf(\"%d %d\\n\", x, y);", ["9 5", "5 9", "12 9", "0 0"], "Three XOR assignments swap two integers without a temporary.", 3),
  out("unsigned char c = 0x0F;\nprintf(\"%d\\n\", c | (1 << 7));", ["143", "15", "128", "271"], "0x0F = 15; setting bit 7 adds 128: 143.", 2),
];

const typedefs: RawQ[] = [
  out("typedef int Marks;\nint main(void) {\n    Marks m = 95;\n    printf(\"%d\\n\", m);\n    return 0;\n}", ["95", "0", "Compile error", "Garbage value"], "typedef creates an alias; Marks is just int."),
  out("typedef struct { int w, h; } Rect;\nint main(void) {\n    Rect r = {4, 5};\n    printf(\"%d\\n\", r.w * r.h);\n    return 0;\n}", ["20", "9", "45", "Compile error"], "The typedef names the anonymous struct type Rect."),
  m("What does `typedef char *String;` define?", ["String as another name for char *", "A new string type with bounds checking", "A macro", "A char variable named String"], "typedef creates a type alias; it does not create a new type."),
  m("How does typedef differ from #define for creating type names?", ["typedef is handled by the compiler and respects scope; #define is textual substitution", "They are identical", "#define is checked by the compiler", "typedef works only for structs"], "With #define PTR char *, `PTR a, b;` makes only a a pointer; a typedef makes both pointers."),
  out("typedef int (*Op)(int, int);\nint add(int a, int b) { return a + b; }\nint main(void) {\n    Op f = add;\n    printf(\"%d\\n\", f(2, 3));\n    return 0;\n}", ["5", "23", "Compile error", "6"], "Op is a pointer to a function taking two ints and returning an int.", 3),
];

const constQ: RawQ[] = [
  m("What does `const int *p;` declare?", ["A pointer to a constant int (the int cannot be changed through p)", "A constant pointer to int", "A constant pointer to a constant int", "An int constant"], "Read right to left: p is a pointer to const int."),
  m("What does `int *const p = &x;` declare?", ["A constant pointer: p cannot point elsewhere, but *p can change", "A pointer to a constant int", "Both pointer and value are constant", "A function pointer"], "const after * applies to the pointer itself."),
  m("Which assignment is NOT allowed for `const int *p = &a;`?", ["*p = 10;", "p = &b;", "int y = *p;", "p++;"], "The pointed-to value is read-only through p."),
  out("const int n = 5;\nint arr[n];\nprintf(\"%zu\\n\", sizeof(arr) / sizeof(arr[0]));", ["5", "1", "Compile error", "0"], "In C99 this is a variable-length array of 5 ints (a const int is not a constant expression in C, but VLAs allow it).", 3),
  m("Why use const in function parameters such as `size_t strlen(const char *s)`?", ["To promise the function will not modify the data", "To make the function faster", "To allocate memory", "To make the parameter optional"], "const documents and enforces read-only access."),
];

const memoryAllocation: RawQ[] = [
  out("int *p = malloc(3 * sizeof(int));\nif (!p) return 1;\np[0] = 1; p[1] = 2; p[2] = 3;\nprintf(\"%d\\n\", p[0] + p[1] + p[2]);\nfree(p);", ["6", "3", "Garbage value", "Compile error"], "malloc allocates space for three ints which are then filled and summed.", 1, H_LIB),
  out("int *p = calloc(4, sizeof(int));\nif (!p) return 1;\nprintf(\"%d %d\\n\", p[0], p[3]);\nfree(p);", ["0 0", "Garbage values", "1 1", "Compile error"], "calloc zero-initialises the memory it allocates.", 2, H_LIB),
  m("What is the difference between malloc and calloc?", ["calloc zero-initialises the memory and takes a count and a size", "malloc zero-initialises the memory", "calloc allocates on the stack", "There is no difference"], "malloc leaves memory uninitialised; calloc(n, size) clears it."),
  m("What does realloc do?", ["Resizes a previously allocated block, possibly moving it", "Frees memory", "Allocates on the stack", "Copies a string"], "realloc returns a pointer to the resized block (which may be at a new address)."),
  m("What is a memory leak?", ["Allocated memory that is never freed and can no longer be reached", "Writing past the end of an array", "Using freed memory", "A stack overflow"], "Leaked memory stays allocated until the program exits."),
  m("What is a dangling pointer?", ["A pointer that still refers to memory that has been freed", "A NULL pointer", "A pointer to a constant", "A pointer to a function"], "Using a dangling pointer is undefined behaviour; set pointers to NULL after free."),
  m("Where is memory from malloc allocated?", ["On the heap", "On the stack", "In the code segment", "In CPU registers"], "Dynamic allocation uses the heap."),
];

const varargs: RawQ[] = [
  out("int sum(int n, ...) {\n    va_list ap;\n    int s = 0, i;\n    va_start(ap, n);\n    for (i = 0; i < n; i++) s += va_arg(ap, int);\n    va_end(ap);\n    return s;\n}\nint main(void) {\n    printf(\"%d\\n\", sum(4, 1, 2, 3, 4));\n    return 0;\n}", ["10", "4", "14", "Compile error"], "va_arg fetches each of the four int arguments: 1 + 2 + 3 + 4 = 10.", 2, "#include <stdio.h>\n#include <stdarg.h>\n"),
  m("Which header provides va_list, va_start, va_arg and va_end?", ["stdarg.h", "stdlib.h", "stdio.h", "varargs.h"], "Variable-argument macros live in <stdarg.h>."),
  m("Why must a variadic function have at least one named parameter (in C before C23)?", ["va_start needs the last named parameter to find where the variable arguments begin", "The compiler requires a return value", "To store the function name", "It does not need one"], "va_start(ap, last_named) uses the last named parameter as an anchor."),
  m("In a variadic call, a float argument is passed as:", ["double (default argument promotion)", "float", "int", "long double"], "Default promotions convert float to double and char/short to int."),
  m("Which standard library function is variadic?", ["printf", "strlen", "malloc", "strcpy"], "printf takes a format string followed by any number of arguments."),
];

const complicatedDeclarations: RawQ[] = [
  m("What is `int (*p)[5];`?", ["A pointer to an array of 5 ints", "An array of 5 pointers to int", "A function returning a pointer", "A pointer to a function"], "The parentheses bind * to p first: p is a pointer to an array of 5 ints."),
  m("What is `int *f(void);`?", ["A function returning a pointer to int", "A pointer to a function returning int", "A pointer variable", "An array of functions"], "() binds tighter than *: f is a function returning int *."),
  m("What is `int (*f)(void);`?", ["A pointer to a function returning int", "A function returning a pointer to int", "An array of ints", "A pointer to a pointer"], "(*f) makes f a pointer; (void) makes it point to a function."),
  m("What is `char **argv;`?", ["A pointer to a pointer to char", "A two-dimensional char array", "A pointer to char", "An array of chars"], "argv points to the first element of an array of char pointers."),
  m("What is `int *(*fp)(int);`?", ["A pointer to a function taking an int and returning a pointer to int", "A function returning a pointer to a pointer", "An array of function pointers", "A pointer to an int array"], "Apply the right-left rule: fp is a pointer to a function (int) returning int *."),
  m("What is `void (*handlers[3])(int);`?", ["An array of 3 pointers to functions taking an int and returning void", "A function returning an array", "A pointer to an array of 3 functions", "Three void variables"], "handlers is an array [3] of pointers (*) to functions (int) returning void."),
];

const libraryFunctions: RawQ[] = [
  out("printf(\"%d %d\\n\", abs(-9), atoi(\"123abc\"));", ["9 123", "9 0", "-9 123", "9 123abc"], "abs gives 9; atoi converts leading digits and stops at the first non-digit.", 2, H_LIB),
  out("printf(\"%c %c\\n\", toupper('a'), tolower('Q'));", ["A q", "a Q", "65 113", "A Q"], "toupper and tolower convert letters.", 1, "#include <stdio.h>\n#include <ctype.h>\n"),
  out("printf(\"%d\\n\", isdigit('7') != 0);", ["1", "0", "7", "Compile error"], "isdigit returns non-zero for digit characters.", 1, "#include <stdio.h>\n#include <ctype.h>\n"),
  out("printf(\"%.0f %.0f\\n\", ceil(2.1), floor(2.9));", ["3 2", "2 3", "2 2", "3 3"], "ceil rounds up; floor rounds down.", 1, "#include <stdio.h>\n#include <math.h>\n"),
  out("char s[] = \"hello world\";\nprintf(\"%s\\n\", strchr(s, 'w'));", ["world", "w", "hello", "6"], "strchr returns a pointer to the first matching character, so printing from there gives \"world\".", 2, H_STR),
  out("printf(\"%.0f\\n\", pow(2, 10));", ["1024", "20", "100", "512"], "pow returns a double; 2¹⁰ = 1024.", 1, "#include <stdio.h>\n#include <math.h>\n"),
  m("Which function sorts an array of any type using a comparison function?", ["qsort", "sort", "bsearch", "memcmp"], "qsort(base, count, size, compare) is in <stdlib.h>."),
  m("Which function copies a block of memory where source and destination may overlap?", ["memmove", "memcpy", "strcpy", "strncpy"], "memcpy's behaviour is undefined for overlapping regions; memmove handles them."),
];

const subject: RawSubject = {
  "declarations-and-initializations": topic(declarations, { intro: "Every C variable has a type, a scope and a storage duration.", formulas: [{ h: "Rules", points: ["Global and static variables are zero-initialised; automatic (local) variables are not", "A partially initialised array has its remaining elements set to 0", "Inner-block declarations hide outer ones", "Storage classes: auto, register, static, extern"] }] }),
  "control-instructions": topic(controlInstructions, { intro: "C provides if/else, switch, for, while, do-while, break, continue and goto.", formulas: [{ h: "Traps", points: ["A stray semicolon after for/while creates an empty loop", "switch cases fall through without break", "if (x = 5) assigns, it does not compare"] }] }),
  expressions: topic(expressions, { intro: "Expressions combine operands and operators according to precedence and associativity.", formulas: [{ h: "Precedence (high → low)", points: ["Postfix (), [], ->, ++ --", "Unary ! ~ ++ -- + - * & sizeof, casts", "* / %", "+ -", "<< >>", "< <= > >=", "== !=", "& then ^ then |", "&& then ||", "?:", "Assignment = += -= …", "Comma"] }, { h: "Undefined behaviour", points: ["Modifying a variable twice without a sequence point (i = i++ + ++i) is undefined: there is no single correct output"] }] }),
  "floating-point-issues": topic(floatingPoint, { intro: "float (single precision) and double (double precision) store binary approximations, so many decimal values are not exact.", formulas: [{ h: "Points", points: ["Never compare floating values with == directly; use a tolerance", "Integer division happens before conversion: float f = 7 / 2 gives 3.0", "Casting to int truncates towards zero"] }] }),
  functions: topic(functions, { intro: "Functions take arguments by value. To let a function modify a caller's variable, pass its address.", formulas: [{ h: "Points", points: ["Static local variables keep their value between calls", "Recursion needs a base case", "A prototype declares the function's interface before use"] }] }),
  "c-preprocessor": topic(preprocessor, { intro: "The preprocessor handles #include, #define, conditional compilation and macro expansion before compilation.", formulas: [{ h: "Macro rules", points: ["Always parenthesise macro parameters and the whole body: #define SQ(x) ((x) * (x))", "# stringises an argument; ## pastes tokens", "Arguments with side effects (SQ(i++)) may be evaluated twice"] }] }),
  pointers: topic(pointers, { intro: "A pointer stores the address of another object. & takes an address; * dereferences.", formulas: [{ h: "Points", points: ["p + n moves n elements, not n bytes", "a[i] is the same as *(a + i)", "Subtracting pointers into the same array gives the element distance", "*p++ reads *p, then increments p"] }] }),
  arrays: topic(arrays, { intro: "An array is a contiguous block of elements of the same type, indexed from 0.", formulas: [{ h: "Points", points: ["Element count = sizeof(a) / sizeof(a[0]) (only where a is an array, not a pointer)", "Two-dimensional arrays are stored row by row", "No bounds checking in C"] }] }),
  strings: topic(strings, { intro: "A C string is a char array terminated by '\\0'. <string.h> provides strlen, strcpy, strcat, strcmp, strchr and more." }),
  "structures-unions-enums": topic(structures, { intro: "Structures group members with separate storage; unions overlap members in shared storage; enums define named integer constants." }),
  "input-output": topic(inputOutput, { intro: "printf and scanf use format specifiers: %d int, %u unsigned, %f double, %c char, %s string, %x hex, %o octal, %p pointer, %zu size_t, %% percent." }),
  "command-line-arguments": topic(commandLine, { intro: "main(int argc, char *argv[]) receives the argument count and an array of argument strings; argv[0] is the program name and argv[argc] is NULL." }),
  "bitwise-operators": topic(bitwise, { intro: "Bitwise operators work on the binary representation: & AND, | OR, ^ XOR, ~ NOT, << left shift, >> right shift.", formulas: [{ h: "Tricks", points: ["x << n = x × 2ⁿ; x >> n = x ÷ 2ⁿ (for non-negative x)", "x & 1 tests the lowest bit (odd/even)", "x & (x − 1) clears the lowest set bit; it is 0 for powers of two", "x ^ x = 0; XOR can swap values"] }] }),
  typedef: topic(typedefs, { intro: "typedef gives a new name to an existing type, often used for structs and function pointers." }),
  const: topic(constQ, { intro: "const marks data as read-only. With pointers, the position of const matters: const int *p (data is const) versus int *const p (pointer is const)." }),
  "memory-allocation": topic(memoryAllocation, { intro: "Dynamic memory comes from the heap through malloc, calloc and realloc, and must be released with free.", formulas: [{ h: "Rules", points: ["Always check the result for NULL", "Free exactly once; set the pointer to NULL afterwards", "calloc zero-fills; malloc does not"] }] }),
  "variable-number-of-arguments": topic(varargs, { intro: "Functions such as printf accept a variable number of arguments using <stdarg.h>: va_list, va_start, va_arg and va_end." }),
  "complicated-declarations": topic(complicatedDeclarations, { intro: "Read complex declarations with the right-left rule: start at the name, read right (arrays, functions) until a closing parenthesis, then left (pointers), and repeat." }),
  "library-functions": topic(libraryFunctions, { intro: "The C standard library includes <stdio.h>, <stdlib.h>, <string.h>, <ctype.h>, <math.h>, <time.h> and more." }),
};
export default subject;
