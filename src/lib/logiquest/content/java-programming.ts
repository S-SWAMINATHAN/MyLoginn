/** Java Programming. Every "What is the output?" program is compiled and run by `npm run lq:validate`. */
import type { RawQ, RawSubject } from "../types";
import { m, topic } from "./build";

/** Wraps statements in a Main class unless the snippet already declares one. The first option must be the exact output. */
const prog = (code: string, imports = "") =>
  code.includes("class Main") ? `${imports}${code}` : `${imports}public class Main {\n    public static void main(String[] args) {\n${code.split("\n").map((l) => `        ${l}`).join("\n")}\n    }\n}`;
const out = (code: string, o: string[], e: string, d: 1 | 2 | 3 = 1, imports = ""): RawQ => {
  const src = prog(code, imports);
  return m(`What is the output of the following program?\n\`\`\`java\n${src}\n\`\`\``, o, e, { d, check: `java:${src}` });
};

const fundamentals: RawQ[] = [
  m("Which of these is the correct signature of the main method?", ["public static void main(String[] args)", "public void main(String args)", "static public int main(String[] args)", "public static void Main(String[] args)"], "The JVM looks for public static void main(String[] args); Java is case-sensitive."),
  m("What is the size of an int in Java?", ["32 bits", "16 bits", "64 bits", "Depends on the platform"], "Java's primitive sizes are fixed: int is always 32 bits."),
  m("What is the default value of an int field (instance variable)?", ["0", "null", "Garbage value", "1"], "Fields get default values (0 for numbers); local variables must be initialised before use."),
  out("int x = 7 / 2;\ndouble y = 7 / 2.0;\nSystem.out.println(x + \" \" + y);", ["3 3.5", "3.5 3.5", "3 3", "4 3.5"], "Integer division truncates (7 / 2 = 3); with a double operand the result is 3.5."),
  out("char c = 'A';\nc += 2;\nSystem.out.println(c);", ["C", "67", "A2", "Error"], "Compound assignment on a char adds to its code (65 + 2 = 67) and keeps the char type: 'C'.", 2),
  out("System.out.println(1 + 2 + \"3\" + 4 + 5);", ["3345", "12345", "3345.0", "15"], "Evaluation is left to right: 1 + 2 = 3, then string concatenation: \"3\" + \"3\" + \"4\" + \"5\".", 2),
  out("long big = Integer.MAX_VALUE;\nbig++;\nint small = Integer.MAX_VALUE;\nsmall++;\nSystem.out.println(big + \" \" + small);", ["2147483648 -2147483648", "2147483648 2147483648", "-2147483648 2147483648", "Error"], "The long can hold the larger value; the int overflows and wraps to Integer.MIN_VALUE.", 3),
  m("Which of these is NOT a Java primitive type?", ["String", "boolean", "char", "byte"], "String is a class; the eight primitives are byte, short, int, long, float, double, char and boolean."),
  out("double d = 10;\nint i = (int) 9.99;\nSystem.out.println(d + \" \" + i);", ["10.0 9", "10 10", "10.0 10", "10 9"], "int widens to double automatically (10.0); casting 9.99 to int truncates to 9."),
  m("Which keyword makes a variable's value unchangeable after assignment?", ["final", "const", "static", "immutable"], "final variables can be assigned only once ('const' is reserved but unused)."),
  out("var list = java.util.List.of(1, 2, 3);\nSystem.out.println(list.size());", ["3", "Error", "0", "[1, 2, 3]"], "var (Java 10+) infers the local variable type; List.of creates an immutable list of 3 items."),
];

const operators: RawQ[] = [
  out("int a = 5;\nint b = a++ + ++a;\nSystem.out.println(a + \" \" + b);", ["7 12", "7 11", "6 11", "7 10"], "a++ yields 5 (a becomes 6), then ++a makes a 7 and yields 7. b = 5 + 7 = 12.", 3),
  out("System.out.println(10 % 3 + \" \" + (-10) % 3 + \" \" + 10 % -3);", ["1 -1 1", "1 2 1", "1 -1 -1", "1 1 1"], "In Java the remainder takes the sign of the dividend.", 2),
  out("int x = 6;\nSystem.out.println((x & 3) + \" \" + (x | 3) + \" \" + (x ^ 3));", ["2 7 5", "2 7 1", "6 7 5", "2 3 5"], "6 = 110, 3 = 011: & = 010 (2), | = 111 (7), ^ = 101 (5).", 2),
  out("System.out.println((-16 >> 2) + \" \" + (-16 >>> 28));", ["-4 15", "-4 -4", "4 15", "-4 268435455"], ">> keeps the sign (−16 / 4 = −4); >>> shifts in zeros, so the top bits of −16 (all ones) leave 15.", 3),
  out("int x = 10;\nboolean r = (x > 5) || (++x > 0);\nSystem.out.println(r + \" \" + x);", ["true 10", "true 11", "false 10", "false 11"], "|| short-circuits: the right side (++x) never runs because the left is true.", 2),
  out("int x = 10;\nx += x++ + ++x;\nSystem.out.println(x);", ["32", "31", "30", "33"], "x += expr means x = 10 + (10 + 12) = 32; the saved left value is 10.", 3),
  out("String s = (5 > 3) ? \"yes\" : \"no\";\nSystem.out.println(s);", ["yes", "no", "true", "Error"], "The ternary operator picks the first value when the condition is true."),
  out("System.out.println(0.1 + 0.2 == 0.3);", ["false", "true", "0.3", "Error"], "Binary floating point cannot represent 0.1 and 0.2 exactly.", 2),
  out("byte b = 127;\nb++;\nSystem.out.println(b);", ["-128", "128", "127", "Error"], "byte ranges from −128 to 127; incrementing 127 overflows to −128.", 2),
];

const flowControl: RawQ[] = [
  out("int sum = 0;\nfor (int i = 1; i <= 5; i++) sum += i;\nSystem.out.println(sum);", ["15", "10", "5", "21"], "1 + 2 + 3 + 4 + 5 = 15."),
  out("int i = 0;\ndo { i++; } while (i < 0);\nSystem.out.println(i);", ["1", "0", "Infinite loop", "-1"], "A do-while body runs at least once."),
  out("int day = 3;\nswitch (day) {\n    case 1: System.out.print(\"A\");\n    case 3: System.out.print(\"B\");\n    case 4: System.out.print(\"C\");\n        break;\n    default: System.out.print(\"D\");\n}", ["BC", "B", "BCD", "D"], "Without break, execution falls through from case 3 into case 4 until the break.", 2),
  out("outer:\nfor (int i = 0; i < 3; i++) {\n    for (int j = 0; j < 3; j++) {\n        if (j == 1) continue outer;\n        System.out.print(i + \"\" + j + \" \");\n    }\n}", ["00 10 20", "00 01 10 11 20 21", "00", "00 10"], "continue outer skips to the next i as soon as j reaches 1.", 3),
  out("for (int i = 0; i < 10; i += 3) {\n    if (i == 6) break;\n    System.out.print(i + \" \");\n}", ["0 3", "0 3 6", "0 3 6 9", "3 6"], "The loop prints 0 and 3, then breaks at 6."),
  out("String r = switch (2) {\n    case 1 -> \"one\";\n    case 2 -> \"two\";\n    default -> \"many\";\n};\nSystem.out.println(r);", ["two", "one", "many", "Error"], "Switch expressions (Java 14+) with -> do not fall through and return a value."),
  out("int[] a = {3, 5, 7};\nint t = 0;\nfor (int v : a) t += v;\nSystem.out.println(t);", ["15", "357", "7", "3"], "The enhanced for loop visits each element."),
  out("int n = 1234, rev = 0;\nwhile (n > 0) { rev = rev * 10 + n % 10; n /= 10; }\nSystem.out.println(rev);", ["4321", "1234", "10", "0"], "The loop builds the number with its digits reversed.", 2),
];

const declarations: RawQ[] = [
  m("Which access modifier makes a member visible only within its own class?", ["private", "protected", "default (package-private)", "public"], "private restricts access to the declaring class."),
  m("Which access level allows access from the same package and from subclasses in other packages?", ["protected", "private", "default", "None of these"], "protected = package access plus subclass access."),
  m("A class with no access modifier is visible:", ["Only within its package", "Everywhere", "Only to subclasses", "Only within the file"], "The default (package-private) access limits visibility to the same package."),
  m("Can a top-level class be declared private?", ["No", "Yes", "Only if it is abstract", "Only if it is final"], "Top-level classes may only be public or package-private."),
  m("What does the static keyword mean for a field?", ["One copy is shared by all instances of the class", "The value cannot change", "It is stored on the stack", "It is private"], "Static fields belong to the class, not to individual objects."),
  out("class Main {\n    static int count = 0;\n    Main() { count++; }\n    public static void main(String[] args) {\n        new Main(); new Main(); new Main();\n        System.out.println(Main.count);\n    }\n}", ["3", "1", "0", "Error"], "count is static, so every constructor call increments the same variable."),
  m("Which modifier prevents a method from being overridden?", ["final", "static", "abstract", "private only"], "A final method cannot be overridden in a subclass."),
  m("Which combination of modifiers is illegal for a method?", ["abstract and final", "public and static", "private and final", "protected and synchronized"], "An abstract method must be overridden, but a final method cannot be — the two contradict."),
];

const objectsClasses: RawQ[] = [
  out("class Main {\n    int x;\n    Main(int x) { this.x = x; }\n    public static void main(String[] args) {\n        Main a = new Main(5);\n        Main b = a;\n        b.x = 9;\n        System.out.println(a.x);\n    }\n}", ["9", "5", "0", "Error"], "a and b refer to the same object, so changing b.x changes a.x.", 2),
  out("class Main {\n    static void change(int v) { v = 100; }\n    public static void main(String[] args) {\n        int n = 1;\n        change(n);\n        System.out.println(n);\n    }\n}", ["1", "100", "0", "Error"], "Java passes primitives by value; the method changes only its own copy.", 2),
  out("class Box { int v; }\nclass Main {\n    static void set(Box b) { b.v = 7; b = new Box(); b.v = 99; }\n    public static void main(String[] args) {\n        Box x = new Box();\n        set(x);\n        System.out.println(x.v);\n    }\n}", ["7", "99", "0", "Error"], "The reference is copied: the first assignment changes the original object; reassigning b does not affect x.", 3),
  m("If a class defines no constructor, Java provides:", ["A default no-argument constructor", "No constructor at all", "A constructor taking all fields", "A private constructor"], "The compiler adds a default constructor only when none is declared."),
  out("class Main {\n    Main() { this(5); System.out.print(\"A\"); }\n    Main(int x) { System.out.print(\"B\"); }\n    public static void main(String[] args) { new Main(); }\n}", ["BA", "AB", "A", "B"], "this(5) calls the other constructor first, which prints B; then A is printed.", 2),
  m("What is method overloading?", ["Several methods with the same name but different parameter lists", "A subclass redefining a parent method", "Calling a method too many times", "A method with too many lines"], "Overloading is resolved at compile time using the parameter types."),
  out("class Main {\n    static String f(int x) { return \"int\"; }\n    static String f(long x) { return \"long\"; }\n    static String f(Integer x) { return \"Integer\"; }\n    public static void main(String[] args) { System.out.println(f(5)); }\n}", ["int", "long", "Integer", "Error"], "An exact primitive match is preferred over widening or boxing.", 3),
  m("Which keyword refers to the current object?", ["this", "self", "super", "me"], "this refers to the current instance."),
];

const inheritance: RawQ[] = [
  out("class A { String who() { return \"A\"; } }\nclass B extends A { String who() { return \"B\"; } }\nclass Main {\n    public static void main(String[] args) {\n        A obj = new B();\n        System.out.println(obj.who());\n    }\n}", ["B", "A", "AB", "Error"], "Method calls are dispatched on the runtime type (dynamic binding).", 2),
  out("class A { A() { System.out.print(\"A\"); } }\nclass B extends A { B() { System.out.print(\"B\"); } }\nclass Main { public static void main(String[] args) { new B(); } }", ["AB", "BA", "B", "A"], "A subclass constructor first calls the superclass constructor (implicitly super())."),
  out("class A { static String s() { return \"A\"; } }\nclass B extends A { static String s() { return \"B\"; } }\nclass Main {\n    public static void main(String[] args) {\n        A obj = new B();\n        System.out.println(obj.s());\n    }\n}", ["A", "B", "AB", "Error"], "Static methods are hidden, not overridden; the call is resolved on the declared type A.", 3),
  out("class A { int x = 1; }\nclass B extends A { int x = 2; }\nclass Main {\n    public static void main(String[] args) {\n        A obj = new B();\n        System.out.println(obj.x + \" \" + ((B) obj).x);\n    }\n}", ["1 2", "2 2", "1 1", "2 1"], "Fields are not polymorphic; obj.x uses the declared type A.", 3),
  m("Does Java support multiple inheritance of classes?", ["No, but a class can implement multiple interfaces", "Yes", "Only for abstract classes", "Only with the extends keyword twice"], "A class extends one class but may implement many interfaces."),
  m("Which keyword calls the parent class's constructor?", ["super", "this", "parent", "base"], "super(...) must be the first statement in a constructor."),
  out("class A { String hi() { return \"A\"; } }\nclass B extends A { String hi() { return super.hi() + \"B\"; } }\nclass Main { public static void main(String[] args) { System.out.println(new B().hi()); } }", ["AB", "BA", "B", "A"], "super.hi() calls the parent version."),
  m("Overriding a method in a subclass requires the same:", ["Name and parameter list", "Name only", "Return value only", "Access modifier only"], "The signature must match; the return type may be covariant and access may be widened."),
];

const interfaces: RawQ[] = [
  out("interface Shape { double area(); default String name() { return \"shape\"; } }\nclass Sq implements Shape { public double area() { return 4; } }\nclass Main { public static void main(String[] args) { Shape s = new Sq(); System.out.println(s.name() + \" \" + s.area()); } }", ["shape 4.0", "shape 4", "Sq 4.0", "Error"], "Default methods provide an implementation; area() returns 4 as a double (4.0).", 2),
  m("Can an abstract class have a constructor?", ["Yes", "No", "Only a private one", "Only if it has no abstract methods"], "Abstract classes can have constructors, which run when subclasses are created."),
  m("Can you create an object of an abstract class with new?", ["No", "Yes", "Only inside the same package", "Only if it is public"], "Abstract classes cannot be instantiated directly."),
  m("Interface fields are implicitly:", ["public static final", "private", "protected", "transient"], "All fields in an interface are constants."),
  m("Which feature did Java 8 add to interfaces?", ["Default and static methods", "Constructors", "Instance fields", "Private constructors"], "Java 8 added default and static methods (Java 9 added private methods)."),
  out("abstract class Animal { abstract String sound(); String speak() { return \"I say \" + sound(); } }\nclass Cow extends Animal { String sound() { return \"moo\"; } }\nclass Main { public static void main(String[] args) { System.out.println(new Cow().speak()); } }", ["I say moo", "moo", "I say", "Error"], "The template method speak() calls the subclass's sound()."),
  m("A functional interface has exactly:", ["One abstract method", "One default method", "No methods", "Two abstract methods"], "Functional interfaces (one abstract method) can be implemented with lambdas."),
];

const innerClasses: RawQ[] = [
  out("class Main {\n    private int x = 7;\n    class Inner { int get() { return x; } }\n    public static void main(String[] args) {\n        Main o = new Main();\n        Main.Inner in = o.new Inner();\n        System.out.println(in.get());\n    }\n}", ["7", "0", "Error", "null"], "A non-static inner class can access the outer object's private members.", 2),
  m("How is a static nested class created from outside?", ["new Outer.Nested()", "outer.new Nested()", "Outer.new Nested()", "new Nested() only inside Outer"], "A static nested class does not need an outer instance."),
  out("interface Greeter { String greet(); }\nclass Main {\n    public static void main(String[] args) {\n        Greeter g = new Greeter() { public String greet() { return \"hi\"; } };\n        System.out.println(g.greet());\n    }\n}", ["hi", "Greeter", "Error", "null"], "An anonymous class implements the interface inline."),
  m("Local variables used inside an anonymous class or lambda must be:", ["final or effectively final", "static", "public", "volatile"], "Captured local variables must not be reassigned after initialisation."),
  out("class Main {\n    public static void main(String[] args) {\n        Runnable r = () -> System.out.println(\"run\");\n        r.run();\n    }\n}", ["run", "Error", "Runnable", "nothing"], "A lambda implements the single method of the functional interface Runnable."),
];

const exceptions: RawQ[] = [
  out("try {\n    int x = 5 / 0;\n    System.out.print(\"A\");\n} catch (ArithmeticException e) {\n    System.out.print(\"B\");\n} finally {\n    System.out.print(\"C\");\n}", ["BC", "ABC", "AC", "B"], "Division by zero throws before 'A' is printed; catch prints B and finally prints C."),
  out("class Main {\n    static int f() {\n        try { return 1; } finally { System.out.print(\"F\"); }\n    }\n    public static void main(String[] args) { System.out.println(f()); }\n}", ["F1", "1F", "1", "F"], "finally runs before the method returns.", 2),
  m("Which of these is a checked exception?", ["IOException", "NullPointerException", "ArithmeticException", "ArrayIndexOutOfBoundsException"], "Checked exceptions (not subclasses of RuntimeException) must be caught or declared."),
  m("What is the superclass of all exceptions and errors?", ["Throwable", "Exception", "Error", "RuntimeException"], "Throwable has two direct subclasses: Exception and Error."),
  out("try {\n    String s = null;\n    s.length();\n} catch (NullPointerException e) {\n    System.out.println(\"NPE\");\n}", ["NPE", "0", "null", "Error"], "Calling a method on null throws NullPointerException."),
  out("try {\n    int[] a = new int[2];\n    a[2] = 1;\n} catch (RuntimeException e) {\n    System.out.println(e.getClass().getSimpleName());\n}", ["ArrayIndexOutOfBoundsException", "RuntimeException", "IndexOutOfBoundsException", "Exception"], "Index 2 is outside an array of length 2; the catch for the superclass catches it.", 2),
  m("What does the throws clause in a method signature do?", ["Declares exceptions the method may pass to its caller", "Throws an exception immediately", "Catches exceptions", "Suppresses all exceptions"], "throws declares; throw actually raises an exception."),
  m("Which statement automatically closes resources such as streams?", ["try-with-resources", "finally only", "synchronized", "catch"], "try (Resource r = …) { } closes r automatically (AutoCloseable)."),
];

const strings: RawQ[] = [
  out("String a = \"hello\";\nString b = \"hello\";\nString c = new String(\"hello\");\nSystem.out.println((a == b) + \" \" + (a == c) + \" \" + a.equals(c));", ["true false true", "true true true", "false false true", "true false false"], "Literals are interned (same object); new String creates a distinct object. equals compares contents.", 3),
  out("String s = \"Java\";\ns.concat(\" rocks\");\nSystem.out.println(s);", ["Java", "Java rocks", " rocks", "Error"], "Strings are immutable; concat returns a new string that is discarded here.", 2),
  out("StringBuilder sb = new StringBuilder(\"abc\");\nsb.append(\"d\").reverse();\nSystem.out.println(sb);", ["dcba", "abcd", "dabc", "Error"], "StringBuilder is mutable; append then reverse gives dcba."),
  out("String s = \"Programming\";\nSystem.out.println(s.substring(3, 7) + \" \" + s.indexOf('g') + \" \" + s.charAt(0));", ["gram 3 P", "gramm 3 P", "gram 4 P", "ogra 3 r"], "substring(3, 7) takes indexes 3–6: 'gram'; the first 'g' is at index 3.", 2),
  out("System.out.println(\"a,b,,c\".split(\",\").length);", ["4", "3", "5", "Error"], "split keeps the empty string between the two commas (trailing empties are removed, but this one is not trailing).", 3),
  out("String s = \"  Hi  \";\nSystem.out.println(\"[\" + s.trim() + \"]\" + s.length());", ["[Hi]6", "[Hi]2", "[  Hi  ]6", "[Hi]4"], "trim() returns a new string; s itself still has length 6."),
  out("System.out.println(String.join(\"-\", \"a\", \"b\", \"c\") + \" \" + \"ab\".repeat(2));", ["a-b-c abab", "abc abab", "a-b-c ab2", "Error"], "String.join and repeat (Java 11+) build new strings."),
  out("System.out.println(\"apple\".compareTo(\"banana\") < 0);", ["true", "false", "Error", "0"], "compareTo is negative when the first string comes earlier in dictionary order."),
];

const javaLang: RawQ[] = [
  out("System.out.println(Math.max(3, 7) + \" \" + Math.abs(-2.5) + \" \" + Math.round(2.5) + \" \" + Math.round(-2.5));", ["7 2.5 3 -2", "7 2.5 3 -3", "7 -2.5 3 -2", "7 2.5 2 -2"], "Math.round rounds half up (towards positive infinity): 2.5 → 3, −2.5 → −2.", 3),
  out("Integer a = 127, b = 127, c = 128, d = 128;\nSystem.out.println((a == b) + \" \" + (c == d));", ["true false", "true true", "false false", "false true"], "Integer caches values from −128 to 127; outside that range == compares different objects.", 3),
  out("System.out.println(Integer.parseInt(\"42\") + Integer.valueOf(8) + \" \" + Integer.toBinaryString(5));", ["50 101", "428 101", "50 5", "Error"], "parseInt gives 42, plus 8 = 50; toBinaryString(5) = \"101\".", 2),
  out("System.out.println(Character.isDigit('7') + \" \" + Character.toUpperCase('q'));", ["true Q", "false Q", "true q", "7 Q"], "Character utility methods test and convert characters."),
  m("Which class is the root of the Java class hierarchy?", ["java.lang.Object", "java.lang.Class", "java.lang.System", "java.lang.Base"], "Every class extends Object directly or indirectly."),
  m("If you override equals(), which method should you also override?", ["hashCode()", "toString()", "clone()", "finalize()"], "Equal objects must have equal hash codes, or hash-based collections break."),
  out("Object o = \"text\";\nSystem.out.println(o instanceof String s ? s.length() : -1);", ["4", "-1", "Error", "text"], "Pattern matching for instanceof (Java 16+) binds s when the test succeeds.", 2),
];

const collections: RawQ[] = [
  out("java.util.List<Integer> l = new java.util.ArrayList<>(java.util.List.of(3, 1, 2));\njava.util.Collections.sort(l);\nSystem.out.println(l);", ["[1, 2, 3]", "[3, 1, 2]", "[3, 2, 1]", "Error"], "Collections.sort sorts the list in natural order."),
  out("java.util.Set<String> s = new java.util.HashSet<>();\ns.add(\"a\"); s.add(\"a\"); s.add(\"b\");\nSystem.out.println(s.size());", ["2", "3", "1", "Error"], "A Set ignores duplicates."),
  out("java.util.Map<String, Integer> m = new java.util.TreeMap<>();\nm.put(\"b\", 2); m.put(\"a\", 1); m.put(\"b\", 5);\nSystem.out.println(m);", ["{a=1, b=5}", "{b=2, a=1}", "{b=5, a=1}", "{a=1, b=2}"], "TreeMap keeps keys sorted; putting an existing key replaces its value.", 2),
  out("java.util.Deque<Integer> st = new java.util.ArrayDeque<>();\nst.push(1); st.push(2); st.push(3);\nSystem.out.println(st.pop() + \" \" + st.peek());", ["3 2", "1 2", "3 3", "1 1"], "push/pop use the deque as a stack (last in, first out)."),
  out("java.util.Queue<Integer> q = new java.util.LinkedList<>();\nq.offer(1); q.offer(2); q.offer(3);\nSystem.out.println(q.poll() + \" \" + q.size());", ["1 2", "3 2", "1 3", "3 3"], "A queue is first in, first out; poll removes the head."),
  out("java.util.List<Integer> l = new java.util.ArrayList<>(java.util.List.of(10, 20, 30));\nl.remove(Integer.valueOf(10));\nl.remove(0);\nSystem.out.println(l);", ["[30]", "[20, 30]", "[10, 30]", "[]"], "remove(Object) deletes the value 10; remove(int) deletes the item at index 0 (20).", 3),
  m("Which collection keeps insertion order and allows fast lookup by key?", ["LinkedHashMap", "HashMap", "TreeSet", "PriorityQueue"], "LinkedHashMap preserves insertion order; HashMap does not guarantee order."),
  m("What is the main difference between ArrayList and LinkedList?", ["ArrayList gives fast random access; LinkedList gives fast insertion and removal at the ends", "LinkedList is synchronised", "ArrayList cannot store duplicates", "They are identical"], "ArrayList is backed by an array; LinkedList is a doubly linked list."),
  out("java.util.PriorityQueue<Integer> pq = new java.util.PriorityQueue<>(java.util.List.of(5, 1, 4));\nSystem.out.println(pq.poll());", ["1", "5", "4", "Error"], "A PriorityQueue removes the smallest element first (min-heap) by default."),
];

const generics: RawQ[] = [
  m("What is the main benefit of generics?", ["Compile-time type safety without casts", "Faster execution", "Smaller class files", "Multiple inheritance"], "Generics catch type errors at compile time and remove the need for casts."),
  m("What does List<? extends Number> accept?", ["A list of Number or any subclass such as Integer", "Only List<Number>", "Any list", "A list of objects that Number extends"], "An upper-bounded wildcard accepts lists of Number or its subtypes (read-only use)."),
  out("class Main {\n    static <T extends Comparable<T>> T max(T a, T b) { return a.compareTo(b) >= 0 ? a : b; }\n    public static void main(String[] args) { System.out.println(max(3, 9) + \" \" + max(\"pear\", \"apple\")); }\n}", ["9 pear", "3 apple", "9 apple", "Error"], "A generic method works for any Comparable type: 9 > 3 and \"pear\" > \"apple\".", 2),
  m("What is type erasure?", ["Generic type information is removed at compile time, so List<String> and List<Integer> share one runtime class", "Deleting unused types", "Garbage collection of generic objects", "Converting primitives to objects"], "Generics are implemented by erasure for backward compatibility."),
  m("Why can't you write `new T()` inside a generic class?", ["Because of type erasure the actual type is not known at runtime", "Because T is always abstract", "Because constructors are private", "Because T must be an interface"], "The runtime does not know what T is."),
  out("java.util.List<Integer> nums = java.util.List.of(1, 2, 3);\nint s = 0;\nfor (int n : nums) s += n;\nSystem.out.println(s);", ["6", "123", "Error", "3"], "Auto-unboxing converts each Integer to int."),
];

const threads: RawQ[] = [
  m("Which method starts a new thread of execution?", ["start()", "run()", "execute()", "begin()"], "start() creates a new thread that calls run(); calling run() directly runs it on the current thread."),
  m("What does the synchronized keyword ensure?", ["Only one thread at a time executes the block for the same lock", "Methods run faster", "Threads never wait", "Variables become final"], "synchronized provides mutual exclusion and memory visibility."),
  out("class Main {\n    public static void main(String[] args) throws Exception {\n        Thread t = new Thread(() -> System.out.print(\"T\"));\n        t.start();\n        t.join();\n        System.out.print(\"M\");\n    }\n}", ["TM", "MT", "M", "T"], "join() waits for t to finish, so T is always printed before M.", 2),
  m("Which state is a thread in after it has finished run()?", ["TERMINATED", "WAITING", "BLOCKED", "NEW"], "A thread whose run method has completed is TERMINATED."),
  m("What does the volatile keyword guarantee?", ["Reads and writes of the variable are visible to all threads", "Atomic increment operations", "The variable is never cached by the compiler and is final", "Mutual exclusion"], "volatile provides visibility, not atomicity (count++ is still unsafe)."),
  m("Which class makes creating a fixed pool of worker threads easy?", ["Executors", "ThreadGroup", "Runtime", "System"], "Executors.newFixedThreadPool(n) returns an ExecutorService."),
  out("class Main {\n    public static void main(String[] args) throws Exception {\n        java.util.concurrent.atomic.AtomicInteger c = new java.util.concurrent.atomic.AtomicInteger();\n        Thread[] ts = new Thread[4];\n        for (int i = 0; i < 4; i++) { ts[i] = new Thread(() -> { for (int k = 0; k < 1000; k++) c.incrementAndGet(); }); ts[i].start(); }\n        for (Thread t : ts) t.join();\n        System.out.println(c.get());\n    }\n}", ["4000", "1000", "Less than 4000, varies", "0"], "AtomicInteger makes each increment atomic, so the total is exactly 4 × 1000.", 3),
];

const gc: RawQ[] = [
  m("When does an object become eligible for garbage collection?", ["When no live thread can reach it through references", "When its method finishes", "When it is set to final", "After one minute"], "Unreachable objects are eligible; collection time is decided by the JVM."),
  m("Can you force garbage collection in Java?", ["No; System.gc() is only a request", "Yes, with System.gc()", "Yes, with Runtime.free()", "Yes, by calling finalize()"], "System.gc() suggests a collection; the JVM may ignore it."),
  out("class Main {\n    public static void main(String[] args) {\n        Object a = new Object();\n        Object b = a;\n        a = null;\n        System.out.println(b != null);\n    }\n}", ["true", "false", "Error", "null"], "The object is still referenced by b, so it is not eligible for collection.", 1),
  m("Where are Java objects allocated?", ["On the heap", "On the stack", "In registers", "In the method area only"], "Objects live on the heap; local primitive variables and references live on the stack."),
  m("The finalize() method is:", ["Deprecated and should not be relied on", "Guaranteed to run before exit", "Required for every class", "Called by System.gc() immediately"], "finalize() is deprecated (Java 9) because its timing is unpredictable; use try-with-resources or Cleaner."),
];

const assertions: RawQ[] = [
  m("How are assertions enabled when running a program?", ["With the -ea (or -enableassertions) JVM flag", "They are always enabled", "With the -assert flag at compile time", "By importing java.lang.assert"], "Assertions are disabled by default and enabled with -ea."),
  m("What happens when an enabled assertion fails?", ["An AssertionError is thrown", "A warning is printed and execution continues", "The JVM exits with code 0", "An Exception is returned"], "assert condition : message; throws AssertionError if the condition is false."),
  m("Which of these is a valid assert statement?", ["assert count >= 0 : \"count is negative\";", "assert(count >= 0, \"count is negative\");", "assert count >= 0 , \"count is negative\";", "assert: count >= 0;"], "The syntax is assert boolean-expression; or assert boolean-expression : detail-expression;."),
  m("Since which Java version has assert been a keyword?", ["Java 1.4", "Java 1.0", "Java 5", "Java 8"], "assert was introduced as a keyword in Java 1.4."),
  m("Assertions should NOT be used to:", ["Validate arguments of public methods", "Check internal invariants", "Document assumptions", "Check impossible code paths"], "Public method arguments must always be checked, so use exceptions (assertions may be disabled)."),
  out("class Main {\n    public static void main(String[] args) {\n        int x = -1;\n        assert x > 0 : \"negative\";\n        System.out.println(\"done\");\n    }\n}", ["done", "AssertionError: negative", "negative", "Error"], "Run without -ea, assertions are disabled, so the program prints 'done'.", 2),
];

const java8: RawQ[] = [
  out("java.util.List<Integer> l = java.util.List.of(1, 2, 3, 4, 5, 6);\nint s = l.stream().filter(n -> n % 2 == 0).mapToInt(n -> n * n).sum();\nSystem.out.println(s);", ["56", "21", "12", "91"], "Even numbers 2, 4, 6 squared are 4, 16, 36: sum 56.", 2),
  out("var names = java.util.List.of(\"bob\", \"alice\", \"carol\");\nSystem.out.println(names.stream().map(String::toUpperCase).sorted().toList());", ["[ALICE, BOB, CAROL]", "[BOB, ALICE, CAROL]", "[alice, bob, carol]", "Error"], "map converts each name, sorted orders them, toList collects (Java 16+)."),
  out("java.util.Optional<String> o = java.util.Optional.empty();\nSystem.out.println(o.orElse(\"none\") + \" \" + o.isPresent());", ["none false", "null false", "none true", "Error"], "orElse supplies a default for an empty Optional."),
  out("var words = java.util.List.of(\"a\", \"bb\", \"cc\", \"ddd\");\nvar g = words.stream().collect(java.util.stream.Collectors.groupingBy(String::length, java.util.stream.Collectors.counting()));\nSystem.out.println(g);", ["{1=1, 2=2, 3=1}", "{a=1, bb=2, ddd=3}", "[1, 2, 2, 3]", "{1=a, 2=bb, 3=ddd}"], "groupingBy groups words by length and counting counts each group.", 3),
  m("What does a stream's intermediate operation (such as filter or map) do until a terminal operation is called?", ["Nothing — streams are lazy", "It processes all elements immediately", "It modifies the source collection", "It throws an exception"], "Intermediate operations build a pipeline that runs only when a terminal operation such as collect or sum is invoked."),
  out("System.out.println(java.util.stream.IntStream.rangeClosed(1, 5).reduce(1, (a, b) -> a * b));", ["120", "15", "24", "5"], "reduce multiplies 1 × 1 × 2 × 3 × 4 × 5 = 120.", 2),
  m("Which java.time class represents a date without time or time zone?", ["LocalDate", "Instant", "ZonedDateTime", "Date"], "LocalDate is a date such as 2026-10-17."),
];

const subject: RawSubject = {
  "language-fundamentals": topic(fundamentals, { intro: "Java is a statically typed, object-oriented language compiled to bytecode that runs on the JVM.", formulas: [{ h: "Primitive types", points: ["byte 8, short 16, int 32, long 64 bits; float 32, double 64; char 16 (unsigned); boolean", "Integer division truncates; mixing with a double gives a double", "Fields get default values; local variables must be initialised", "String + anything performs concatenation, evaluated left to right"] }] }),
  "operators-and-assignments": topic(operators, { intro: "Java operators follow precedence and left-to-right evaluation of operands.", formulas: [{ h: "Rules", points: ["x++ yields the old value; ++x yields the new value", "&& and || short-circuit; & and | do not", "% takes the sign of the dividend", ">> is an arithmetic shift; >>> shifts in zeros", "Compound assignments (+=, -=) include an implicit cast", "Integer types overflow silently (wrap around)"] }] }),
  "flow-control": topic(flowControl, { intro: "Java offers if/else, switch (statement and expression forms), for, enhanced for, while and do-while, with break, continue and labels." }),
  "declarations-and-access-control": topic(declarations, { intro: "Access modifiers control visibility: private (class), default (package), protected (package + subclasses), public (everywhere). Other modifiers: static, final, abstract, synchronized, transient, volatile." }),
  "objects-and-classes": topic(objectsClasses, { intro: "Classes define state (fields) and behaviour (methods); objects are instances created with new. Java passes everything by value — for objects, the value is a reference." }),
  "inheritance-and-polymorphism": topic(inheritance, { intro: "A class extends one superclass and inherits its members. Overridden instance methods are chosen at runtime (dynamic dispatch); static methods and fields are resolved by the declared type." }),
  "interfaces-and-abstract-classes": topic(interfaces, { intro: "Abstract classes can hold state and partial implementation; interfaces define contracts and (since Java 8) default and static methods. A class may implement many interfaces." }),
  "inner-classes": topic(innerClasses, { intro: "Java has member inner classes, static nested classes, local classes and anonymous classes. Lambdas are a concise alternative for functional interfaces." }),
  exceptions: topic(exceptions, { intro: "Exceptions are objects that extend Throwable. Checked exceptions must be caught or declared; unchecked ones (RuntimeException and Error) need not be.", formulas: [{ h: "Rules", points: ["finally runs whether or not an exception occurs (even after return)", "Catch more specific exceptions before general ones", "try-with-resources closes AutoCloseable resources automatically"] }] }),
  strings: topic(strings, { intro: "String objects are immutable. Use StringBuilder for repeated modification. Compare contents with equals(), not ==.", formulas: [{ h: "Common methods", points: ["length, charAt, substring(begin, end), indexOf, equals, equalsIgnoreCase, compareTo, split, trim, strip, replace, toUpperCase, join, repeat"] }] }),
  "javalang-class": topic(javaLang, { intro: "The java.lang package (imported automatically) contains Object, String, Math, the wrapper classes (Integer, Double, Character …), System and Thread." }),
  "objects-and-collections": topic(collections, { intro: "The Collections Framework provides List (ArrayList, LinkedList), Set (HashSet, LinkedHashSet, TreeSet), Map (HashMap, LinkedHashMap, TreeMap), Queue and Deque (ArrayDeque, PriorityQueue)." }),
  generics: topic(generics, { intro: "Generics parameterise classes and methods by type, giving compile-time safety. Wildcards (? extends T, ? super T) make APIs flexible; type erasure removes type arguments at runtime." }),
  threads: topic(threads, { intro: "Threads run concurrently. Create them with Thread/Runnable or, better, an ExecutorService. Protect shared data with synchronized, locks or atomic classes." }),
  "garbage-collections": topic(gc, { intro: "The JVM automatically reclaims memory used by objects that are no longer reachable. You can make objects unreachable (set references to null, let them go out of scope) but cannot force collection." }),
  assertions: topic(assertions, { intro: "assert condition; or assert condition : message; checks an assumption during development. Assertions are disabled unless the JVM is started with -ea." }),
  "java-8-features": topic(java8, { intro: "Java 8 introduced lambdas, method references, streams, Optional, default methods and the java.time API; later versions added var, records, switch expressions and pattern matching." }),
};
export default subject;
