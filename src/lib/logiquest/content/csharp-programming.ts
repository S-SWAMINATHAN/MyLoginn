/**
 * C# Programming. No C# compiler is available in the validation environment, so output questions are kept to
 * simple, well-defined language behaviour and every answer is explained.
 */
import type { RawQ, RawSubject } from "../types";
import { m, topic } from "./build";

const code = (src: string) => `\`\`\`csharp\n${src}\n\`\`\``;
/**
 * Snippets use C# top-level statements (implicit usings). Snippets written as "<type declarations>\n// <statement>"
 * are reordered so the statement comes first, as top-level programs require.
 */
const out = (src: string, o: string[], e: string, d: 1 | 2 | 3 = 1): RawQ => {
  const lines = src.split("\n");
  const last = lines[lines.length - 1];
  const program = last.startsWith("// ") ? [last.slice(3), ...lines.slice(0, -1)].join("\n") : src;
  return m(`What is the output of the following program?\n${code(program)}`, o, e, { d });
};

const introduction: RawQ[] = [
  m("C# programs are compiled to:", ["Intermediate Language (IL), which the CLR compiles to native code", "Native machine code only", "Java bytecode", "JavaScript"], "The C# compiler emits IL; the CLR's JIT compiler turns it into machine code at run time."),
  m("Which method is the entry point of a C# console application?", ["static void Main(string[] args)", "public void Start()", "static int main()", "void Run()"], "Main (which may also return int or be async) is the entry point; top-level statements generate it implicitly."),
  m("Which keyword imports a namespace in C#?", ["using", "import", "include", "require"], "using System; lets you write Console instead of System.Console."),
  out("Console.WriteLine(\"Hello\" + 1 + 2);", ["Hello12", "Hello3", "3Hello", "Compile error"], "String concatenation proceeds left to right: \"Hello\" + 1 = \"Hello1\", then + 2 = \"Hello12\"."),
  out("Console.WriteLine(1 + 2 + \"Hello\");", ["3Hello", "12Hello", "Hello3", "Compile error"], "1 + 2 is evaluated first (3), then concatenated."),
  m("C# is a ____ typed language.", ["statically (strongly)", "dynamically only", "weakly", "untyped"], "Types are checked at compile time; dynamic is an opt-in exception."),
];

const dotnet: RawQ[] = [
  m("What does CLR stand for?", ["Common Language Runtime", "Common Library Resource", "Central Language Registry", "Compiled Language Runtime"], "The CLR runs .NET programs: JIT compilation, garbage collection, type safety and exceptions."),
  m("What is the CTS?", ["Common Type System — the rules for types shared by all .NET languages", "C# Type Syntax", "Compiled Type Store", "Common Thread Scheduler"], "The CTS lets types defined in one .NET language be used from another."),
  m("What is an assembly in .NET?", ["A compiled unit of deployment (DLL or EXE) containing IL and metadata", "A machine-code file", "A source file", "A namespace"], "Assemblies carry IL, metadata and a manifest."),
  m("Which component reclaims memory of unreachable objects in .NET?", ["The garbage collector", "The JIT compiler", "The linker", "The CTS"], "The GC manages the managed heap automatically."),
  m("What is the role of the JIT compiler?", ["It converts IL into native code at run time", "It converts C# to IL", "It links assemblies", "It manages threads"], "Just-in-time compilation happens when methods are first called."),
  m("Code that runs under the control of the CLR is called:", ["Managed code", "Native code", "Unsafe code", "Script code"], "Managed code benefits from GC, type safety and other CLR services."),
];

const datatypes: RawQ[] = [
  m("Which of these is a value type in C#?", ["int", "string", "object", "class instance"], "int (System.Int32) is a struct, i.e. a value type; string and object are reference types."),
  m("What is the size of a C# long?", ["64 bits", "32 bits", "128 bits", "Depends on the platform"], "long is always System.Int64."),
  m("Which type should be used for exact monetary calculations?", ["decimal", "double", "float", "int"], "decimal is a base-10 type with 28–29 significant digits, avoiding binary rounding errors."),
  out("int a = 7, b = 2;\nConsole.WriteLine(a / b);\nConsole.WriteLine(a / 2.0);", ["3\n3.5", "3.5\n3.5", "3\n3", "4\n3.5"], "Integer division truncates; dividing by a double gives 3.5."),
  out("int? x = null;\nConsole.WriteLine(x ?? 10);", ["10", "null", "0", "Compile error"], "?? returns the right operand when the left is null.", 2),
  m("What is boxing?", ["Converting a value type to object (allocating it on the heap)", "Converting object to a value type", "Wrapping a class in a struct", "Casting int to long"], "Unboxing is the reverse explicit conversion."),
  out("var s = \"text\";\nConsole.WriteLine(s.GetType().Name);", ["String", "var", "Object", "string"], "var infers System.String; Type.Name is \"String\".", 2),
  out("char c = 'A';\nConsole.WriteLine((int)c + 1);", ["66", "B", "A1", "Compile error"], "Casting 'A' to int gives 65; adding 1 gives 66."),
];

const operators: RawQ[] = [
  out("int x = 5;\nint y = x++ + ++x;\nConsole.WriteLine($\"{x} {y}\");", ["7 12", "7 11", "6 11", "6 12"], "C# evaluates operands left to right: x++ yields 5 (x = 6), ++x yields 7 (x = 7); y = 12.", 3),
  out("Console.WriteLine(10 % 3 + \" \" + (-10 % 3));", ["1 -1", "1 2", "1 1", "-1 1"], "The remainder takes the sign of the dividend in C#."),
  out("bool a = true, b = false;\nConsole.WriteLine(a && b || !b);", ["True", "False", "true", "Compile error"], "(true && false) || true = true; Console prints booleans as True/False.", 2),
  out("int n = 6;\nConsole.WriteLine((n & 3) + \" \" + (n | 1) + \" \" + (n ^ 4));", ["2 7 2", "2 7 6", "6 7 2", "3 7 2"], "6 = 110: & 011 = 010 (2); | 001 = 111 (7); ^ 100 = 010 (2).", 2),
  out("string s = null;\nConsole.WriteLine(s?.Length ?? -1);", ["-1", "0", "null", "NullReferenceException"], "?. returns null instead of throwing, and ?? substitutes −1.", 2),
  m("What does the 'is' operator do?", ["Tests whether an object is compatible with a type (and can bind a variable)", "Compares two values", "Converts a type", "Allocates memory"], "e.g. if (o is string s) { … }"),
];

const control: RawQ[] = [
  out("for (int i = 0; i < 10; i += 4) Console.Write(i + \" \");", ["0 4 8 ", "0 4 8 12 ", "4 8 ", "0 4 "], "i takes 0, 4, 8; 12 fails the condition."),
  out("int day = 2;\nswitch (day)\n{\n    case 1: Console.Write(\"Mon\"); break;\n    case 2: Console.Write(\"Tue\"); break;\n    default: Console.Write(\"?\"); break;\n}", ["Tue", "TueMon", "?", "Compile error"], "C# switch sections must not fall through; each ends with break."),
  m("In C#, falling through from one non-empty case section to the next without break:", ["Is a compile-time error", "Executes the next case", "Is a runtime error", "Is allowed only for strings"], "C# forbids implicit fall-through; use goto case if needed."),
  out("int[] nums = { 2, 4, 6 };\nint sum = 0;\nforeach (var n in nums) sum += n;\nConsole.WriteLine(sum);", ["12", "246", "6", "0"], "foreach visits every element."),
  out("int i = 0;\nwhile (true) { if (++i == 3) break; }\nConsole.WriteLine(i);", ["3", "2", "Infinite loop", "4"], "The loop breaks when i reaches 3."),
  out("string r = 5 switch { < 0 => \"neg\", 0 => \"zero\", _ => \"pos\" };\nConsole.WriteLine(r);", ["pos", "neg", "zero", "Compile error"], "A switch expression with relational patterns (C# 9) picks the first matching arm.", 2),
];

const arrays: RawQ[] = [
  out("int[] a = new int[3];\nConsole.WriteLine(a[1] + \" \" + a.Length);", ["0 3", "null 3", "Garbage 3", "0 2"], "Numeric array elements default to 0."),
  out("int[,] g = { { 1, 2 }, { 3, 4 } };\nConsole.WriteLine(g[1, 0] + g.Length);", ["7", "3", "34", "5"], "g[1, 0] is 3 and a 2×2 array has Length 4: 3 + 4 = 7.", 2),
  out("int[][] j = { new[] { 1 }, new[] { 2, 3, 4 } };\nConsole.WriteLine(j[1].Length);", ["3", "2", "1", "4"], "A jagged array's rows can have different lengths."),
  m("Accessing an index outside an array's bounds in C# results in:", ["IndexOutOfRangeException", "Undefined behaviour", "A default value", "A compile error"], "C# checks bounds at run time."),
  out("int[] a = { 3, 1, 2 };\nArray.Sort(a);\nConsole.WriteLine(string.Join(\",\", a));", ["1,2,3", "3,1,2", "3,2,1", "Compile error"], "Array.Sort sorts in place."),
];

const strings: RawQ[] = [
  out("string s = \"Hello\";\ns.ToUpper();\nConsole.WriteLine(s);", ["Hello", "HELLO", "hello", "Compile error"], "Strings are immutable; ToUpper returns a new string that is discarded here.", 2),
  out("string a = \"cat\";\nstring b = \"c\" + \"at\";\nConsole.WriteLine(a == b);", ["True", "False", "true", "Compile error"], "== on strings compares their contents.", 1),
  out("Console.WriteLine(\"a,b,c\".Split(',').Length);", ["3", "5", "2", "1"], "Split produces three substrings."),
  out("var sb = new System.Text.StringBuilder(\"ab\");\nsb.Append(\"cd\").Insert(0, \"x\");\nConsole.WriteLine(sb);", ["xabcd", "abcdx", "abxcd", "xab"], "StringBuilder is mutable: append then insert at index 0."),
  out("string name = \"Ravi\";\nint age = 21;\nConsole.WriteLine($\"{name} is {age + 1}\");", ["Ravi is 22", "{name} is {age + 1}", "Ravi is 21", "Compile error"], "Interpolated strings evaluate expressions in braces."),
  out("Console.WriteLine(\"Programming\".Substring(3, 4));", ["gram", "gramm", "ogra", "ram"], "Substring(startIndex, length): starting at index 3, four characters: 'gram'.", 2),
  out("Console.WriteLine(string.IsNullOrEmpty(\"\") + \" \" + \"abc\".Contains(\"bc\"));", ["True True", "False True", "True False", "False False"], "An empty string is null-or-empty; 'abc' contains 'bc'."),
];

const classes: RawQ[] = [
  m("Which keyword creates an instance of a class?", ["new", "create", "instance", "alloc"], "new allocates the object and runs its constructor."),
  m("Classes in C# are ____ types; structs are ____ types.", ["reference; value", "value; reference", "value; value", "reference; reference"], "Assigning a class variable copies the reference; assigning a struct copies the value."),
  out("class P { public int X; }\nvar a = new P { X = 1 };\nvar b = a;\nb.X = 5;\nConsole.WriteLine(a.X);", ["5", "1", "0", "Compile error"], "a and b refer to the same object.", 2),
  out("struct S { public int X; }\nvar a = new S { X = 1 };\nvar b = a;\nb.X = 5;\nConsole.WriteLine(a.X);", ["1", "5", "0", "Compile error"], "Structs are copied by value, so changing b does not affect a.", 2),
  m("What does the static modifier on a class mean?", ["The class cannot be instantiated and contains only static members", "The class cannot be inherited only", "The class is thread-safe", "The class is immutable"], "Static classes (e.g. Math) hold only static members."),
  m("Which access modifier allows access only within the same assembly?", ["internal", "private", "protected", "public"], "internal limits access to the containing assembly."),
];

const constructors: RawQ[] = [
  out("class A {\n    public A() { Console.Write(\"A\"); }\n}\nclass B : A {\n    public B() { Console.Write(\"B\"); }\n}\n// new B();", ["AB", "BA", "B", "A"], "The base constructor runs before the derived constructor body."),
  out("class P {\n    public int V;\n    public P() : this(7) { }\n    public P(int v) { V = v; }\n}\n// Console.WriteLine(new P().V);", ["7", "0", "Compile error", "null"], "this(7) chains to the other constructor."),
  m("What is a static constructor used for?", ["To initialise static data once, before the type is first used", "To create instances faster", "To prevent instantiation", "To destroy objects"], "A static constructor has no access modifier or parameters and runs once per type."),
  m("If a class defines a constructor with parameters only, does C# still provide a default parameterless constructor?", ["No", "Yes", "Only for structs", "Only for static classes"], "The default constructor is supplied only when no constructor is declared."),
  m("Which syntax calls a base class constructor?", ["public Derived() : base(…)", "super(…)", "Base.ctor(…)", "parent(…)"], ": base(…) in the constructor declaration calls the base constructor."),
  m("What is a primary constructor (C# 12)?", ["Parameters declared on the class or struct header, available throughout its body", "The first constructor in a file", "A static constructor", "A constructor that cannot be overloaded"], "class Point(int x, int y) { … } declares a primary constructor."),
];

const inheritance: RawQ[] = [
  m("How many classes can a C# class inherit from directly?", ["One", "Two", "Unlimited", "None"], "C# supports single class inheritance and multiple interface implementation."),
  m("Which keyword prevents a class from being inherited?", ["sealed", "static", "final", "const"], "A sealed class cannot be a base class."),
  out("class A { public virtual string Who() => \"A\"; }\nclass B : A { public override string Who() => \"B\"; }\n// A obj = new B(); Console.WriteLine(obj.Who());", ["B", "A", "AB", "Compile error"], "An override is called through a base reference (dynamic dispatch)."),
  out("class A { public string Who() => \"A\"; }\nclass B : A { public new string Who() => \"B\"; }\n// A obj = new B(); Console.WriteLine(obj.Who());", ["A", "B", "AB", "Compile error"], "new hides the base method; through an A reference, A.Who is called.", 3),
  m("Which keyword accesses a member of the base class from a derived class?", ["base", "super", "parent", "this"], "base.Method() calls the base implementation."),
  m("What is the ultimate base class of all types in C#?", ["System.Object", "System.Base", "System.Type", "System.Value"], "Every type derives from System.Object (object)."),
];

const polymorphism: RawQ[] = [
  m("Runtime polymorphism in C# is achieved with:", ["virtual and override methods", "method overloading", "generics only", "static methods"], "The method called depends on the object's runtime type."),
  m("Compile-time polymorphism in C# is achieved with:", ["method and operator overloading", "virtual methods", "interfaces", "inheritance"], "Overloads are resolved by the compiler."),
  m("What is an abstract method?", ["A method declared without a body that derived classes must override", "A static method", "A private method", "A sealed method"], "Abstract methods can exist only in abstract classes."),
  m("Can an abstract class be instantiated?", ["No", "Yes", "Only with new()", "Only in the same assembly"], "Only concrete derived classes can be instantiated."),
  out("abstract class Shape { public abstract double Area(); }\nclass Sq : Shape { public override double Area() => 4; }\n// Shape s = new Sq(); Console.WriteLine(s.Area());", ["4", "4.0", "0", "Compile error"], "The override returns 4; a double 4 prints as \"4\" in C#.", 2),
  m("What does a sealed override do?", ["Overrides a virtual method and prevents further overriding", "Hides the base method", "Makes the method static", "Makes the class abstract"], "public sealed override void M() { … }"),
];

const interfaces: RawQ[] = [
  m("Can a C# class implement multiple interfaces?", ["Yes", "No", "Only two", "Only if the class is abstract"], "class C : IA, IB, IC { … }"),
  m("By convention, interface names in C# start with:", ["I", "Int", "_", "If"], "e.g. IDisposable, IEnumerable."),
  m("What is explicit interface implementation?", ["Implementing a member as IInterface.Member so it is accessible only through the interface", "Writing all methods public", "Implementing an interface in another file", "Using the implements keyword"], "It resolves name clashes between interfaces."),
  m("Since C# 8, interfaces can contain:", ["Default method implementations", "Instance fields", "Constructors", "Finalizers"], "Default interface methods allow adding members without breaking implementers."),
  m("Which interface enables the using statement for releasing resources?", ["IDisposable", "IEnumerable", "IComparable", "ICloneable"], "using calls Dispose() automatically."),
  m("Which interface makes a type usable in foreach?", ["IEnumerable (or IEnumerable<T>)", "IList only", "IDisposable", "IComparer"], "foreach requires a GetEnumerator method, typically via IEnumerable."),
];

const properties: RawQ[] = [
  m("What is an auto-implemented property?", ["A property whose backing field is generated by the compiler: public int Age { get; set; }", "A method with no body", "A static field", "A readonly field"], "The compiler creates a hidden backing field."),
  m("What does an init accessor (C# 9) allow?", ["Setting the property only during object initialisation", "Setting the property at any time", "Reading the property only once", "Making the property static"], "public string Name { get; init; } is immutable after construction."),
  m("What is an indexer?", ["A member that lets objects be indexed like arrays: this[int i]", "A loop counter", "A database index", "A static method"], "public T this[int i] { get { … } set { … } }"),
  out("class Temp {\n    private double c;\n    public double F { get => c * 9 / 5 + 32; set => c = (value - 32) * 5 / 9; }\n}\n// var t = new Temp(); t.F = 212; Console.WriteLine(t.F);", ["212", "100", "32", "0"], "Setting F stores 100 °C; reading F converts it back to 212.", 2),
  m("Which keyword refers to the incoming value inside a property setter?", ["value", "val", "input", "this"], "set { field = value; }"),
];

const structsEnums: RawQ[] = [
  out("enum Level { Low, Medium = 5, High }\n// Console.WriteLine((int)Level.High);", ["6", "2", "5", "High"], "Enum values continue from the last explicit value: High = 6.", 2),
  out("enum Color { Red, Green, Blue }\n// Console.WriteLine(Color.Green);", ["Green", "1", "Color.Green", "0"], "Converting an enum to a string gives its name."),
  m("Can a struct inherit from another struct?", ["No (but it can implement interfaces)", "Yes", "Only from System.ValueType explicitly", "Only if sealed"], "Structs are implicitly sealed and derive from System.ValueType."),
  m("Which is a good use of a struct?", ["A small, immutable value such as a 2D point", "A large object with many fields that is frequently modified", "A class hierarchy root", "A database connection"], "Small value-semantic data types suit structs."),
  m("What does the [Flags] attribute on an enum indicate?", ["Its values can be combined with bitwise OR", "It cannot be converted to int", "It is sealed", "Its values are strings"], "e.g. FileAccess.Read | FileAccess.Write"),
];

const delegates: RawQ[] = [
  m("What is a delegate?", ["A type-safe reference to a method", "A class field", "A thread", "An interface"], "Delegates hold references to methods with a matching signature."),
  out("Func<int, int, int> add = (a, b) => a + b;\nConsole.WriteLine(add(2, 3));", ["5", "23", "Compile error", "0"], "Func<int, int, int> takes two ints and returns an int."),
  out("Action<string> greet = n => Console.Write(\"Hi \" + n);\ngreet += n => Console.Write(\"!\");\ngreet(\"Ann\");", ["Hi Ann!", "Hi Ann", "!", "Compile error"], "+= adds a method to a multicast delegate; both run in order.", 2),
  m("What does the event keyword add to a delegate field?", ["Outside code can only subscribe (+=) and unsubscribe (−=), not invoke or reassign it", "Thread safety", "Asynchronous execution", "Serialization"], "Events protect the delegate from external invocation."),
  m("Which delegate type returns bool and takes one argument?", ["Predicate<T>", "Action<T>", "Func<T>", "EventHandler"], "Predicate<T> is used by methods such as List<T>.Find."),
];

const generics: RawQ[] = [
  m("What is the benefit of generics such as List<T> over ArrayList?", ["Type safety and no boxing for value types", "Unlimited size", "Thread safety", "Faster string handling"], "List<int> stores ints directly without boxing."),
  out("var list = new List<int> { 3, 1, 2 };\nlist.Sort();\nConsole.WriteLine(string.Join(\" \", list));", ["1 2 3", "3 1 2", "3 2 1", "Compile error"], "List<T>.Sort sorts in place."),
  out("var d = new Dictionary<string, int> { [\"a\"] = 1 };\nd[\"a\"] += 4;\nConsole.WriteLine(d[\"a\"]);", ["5", "1", "4", "KeyNotFoundException"], "The indexer reads and updates the existing key."),
  m("What does the constraint 'where T : new()' require?", ["T must have a public parameterless constructor", "T must be a new type", "T must be a struct", "T must implement IDisposable"], "It allows new T() inside the generic code."),
  out("var nums = new[] { 1, 2, 3, 4, 5 };\nConsole.WriteLine(nums.Where(n => n % 2 == 1).Sum());", ["9", "15", "6", "3"], "LINQ Where keeps 1, 3, 5, which sum to 9.", 2),
];

const exceptions: RawQ[] = [
  out("try { int z = 0; Console.Write(10 / z); }\ncatch (DivideByZeroException) { Console.Write(\"D\"); }\nfinally { Console.Write(\"F\"); }", ["DF", "F", "D", "Infinity"], "Integer division by zero throws DivideByZeroException; finally always runs."),
  m("Which block always executes, whether or not an exception occurs?", ["finally", "catch", "try", "throw"], "finally is for clean-up."),
  m("What is the base class of all exceptions in C#?", ["System.Exception", "System.Error", "System.Throwable", "System.Object only"], "All exceptions derive from System.Exception."),
  m("What is the difference between 'throw;' and 'throw ex;' inside a catch block?", ["throw; preserves the original stack trace", "throw ex; preserves the stack trace", "They are identical", "throw; creates a new exception"], "Rethrow with throw; to keep the original stack trace."),
  m("What does an exception filter (catch (Exception e) when (cond)) do?", ["Catches the exception only if the condition is true", "Catches all exceptions", "Logs the exception", "Rethrows the exception"], "Filters run before the stack unwinds."),
  out("double x = 1.0 / 0;\nConsole.WriteLine(double.IsInfinity(x));", ["True", "False", "DivideByZeroException", "Compile error"], "Floating-point division by zero yields Infinity instead of throwing.", 2),
];

const namespaces: RawQ[] = [
  m("What is the purpose of a namespace?", ["To organise types and avoid name clashes", "To allocate memory", "To define access levels", "To compile code"], "System.Collections.Generic.List<T> is distinct from any other List type."),
  m("What does 'global using System;' (C# 10) do?", ["Imports System for every file in the project", "Makes System public", "Downloads the System package", "Creates a namespace"], "Global usings apply project-wide."),
  m("What is a file-scoped namespace declaration?", ["namespace MyApp; applying to the whole file without braces", "A namespace limited to one class", "A private namespace", "A namespace alias"], "Introduced in C# 10 to reduce nesting."),
  m("Can two classes with the same name exist in one project?", ["Yes, if they are in different namespaces", "No, never", "Only if one is static", "Only if one is generic"], "Fully qualified names (Namespace.Type) keep them distinct."),
  m("Which namespace contains List<T> and Dictionary<TKey, TValue>?", ["System.Collections.Generic", "System.Linq", "System.Text", "System.Collections"], "Generic collections live in System.Collections.Generic."),
  m("How do you create an alias for a namespace or type?", ["using Col = System.Collections.Generic;", "alias Col = System.Collections.Generic;", "namespace Col = System;", "import Col"], "using alias = Namespace.Or.Type;"),
];

const subject: RawSubject = {
  introduction: topic(introduction, { intro: "C# is a modern, object-oriented, type-safe language for .NET. Source code is compiled to IL and run by the CLR." }),
  "net-framework": topic(dotnet, { intro: ".NET provides the CLR (runtime), the base class library and tools. Key parts: CLR, CTS, CLS, JIT compiler, garbage collector, assemblies." }),
  datatypes: topic(datatypes, { intro: "C# types are value types (int, double, bool, char, decimal, structs, enums) or reference types (string, object, classes, arrays, delegates). Nullable value types (int?) can hold null." }),
  operators: topic(operators, { intro: "C# operators include arithmetic, relational, logical, bitwise, null-coalescing (??), null-conditional (?.), conditional (?:), is and as." }),
  "control-instructions": topic(control, { intro: "C# has if/else, switch statements and expressions, for, foreach, while, do-while, break, continue and goto. switch sections cannot fall through." }),
  arrays: topic(arrays, { intro: "C# supports single-dimensional, multi-dimensional (int[,]) and jagged (int[][]) arrays, with run-time bounds checking." }),
  strings: topic(strings, { intro: "string is an immutable reference type; == compares contents. Use StringBuilder for repeated modification and interpolated strings ($\"…\") for formatting." }),
  "classes-and-objects": topic(classes, { intro: "Classes are reference types with fields, properties, methods and events. Access modifiers: public, private, protected, internal, protected internal, private protected." }),
  constructors: topic(constructors, { intro: "Constructors initialise objects; they can be chained with this(…) and base(…). Static constructors initialise static data once." }),
  inheritance: topic(inheritance, { intro: "A class inherits from one base class and can implement many interfaces. virtual/override enable overriding; new hides a member; sealed stops inheritance." }),
  polymorphism: topic(polymorphism, { intro: "C# supports compile-time polymorphism (overloading) and runtime polymorphism (virtual/override, abstract members and interfaces)." }),
  interfaces: topic(interfaces, { intro: "Interfaces define contracts. A class may implement many interfaces; since C# 8 interfaces may include default implementations." }),
  "properties-and-indexers": topic(properties, { intro: "Properties expose data through get/set (or init) accessors; indexers let objects be used with [] syntax." }),
  "structures-and-enumerations": topic(structsEnums, { intro: "Structs are value types suited to small data; enums are named integer constants (optionally flags)." }),
  "delegates-and-events": topic(delegates, { intro: "Delegates are type-safe method references (Func, Action, Predicate). Events wrap delegates to implement the publisher–subscriber pattern." }),
  generics: topic(generics, { intro: "Generics (List<T>, Dictionary<TKey, TValue>, custom generic types and methods) provide type safety and performance. LINQ works over generic collections." }),
  "exception-handling": topic(exceptions, { intro: "C# uses try/catch/finally with exception classes derived from System.Exception; filters (when) and throw; for rethrowing are available." }),
  namespaces: topic(namespaces, { intro: "Namespaces organise types. using directives import them; global using and file-scoped namespaces reduce boilerplate." }),
};
export default subject;
