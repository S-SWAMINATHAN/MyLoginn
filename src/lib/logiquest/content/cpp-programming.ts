/** C++ Programming. Output programs are compiled and run by `npm run lq:validate` (with LQ_ZIG_PYTHON set). */
import type { RawQ, RawSubject } from "../types";
import { m, m2, m3, topic } from "./build";

const H = "#include <iostream>\nusing namespace std;\n";
const prog = (code: string, headers = H) =>
  code.includes("int main") ? `${headers}${code}` : `${headers}\nint main() {\n${code.split("\n").map((l) => `    ${l}`).join("\n")}\n    return 0;\n}`;
const out = (code: string, o: string[], e: string, d: 1 | 2 | 3 = 1, headers?: string): RawQ => {
  const src = prog(code, headers);
  return m(`What will be the output of the program?\n\`\`\`cpp\n${src}\n\`\`\``, o, e, { d, check: `cpp:${src}` });
};

const oops: RawQ[] = [
  m("Which OOP principle hides internal details and exposes only what is necessary?", ["Encapsulation", "Inheritance", "Polymorphism", "Recursion"], "Encapsulation bundles data with the methods that operate on it and restricts direct access."),
  m("Which concept allows the same function call to behave differently for different objects?", ["Polymorphism", "Encapsulation", "Abstraction only", "Templates only"], "Polymorphism lets one interface have many implementations."),
  m("What is the default access level of members in a C++ class?", ["private", "public", "protected", "internal"], "class members are private by default; struct members are public by default."),
  m("What is the only difference between struct and class in C++?", ["Default access (public for struct, private for class)", "struct cannot have methods", "class cannot have constructors", "struct cannot be inherited"], "Apart from default member and base-class access, struct and class are equivalent."),
  m("Which is NOT a feature of OOP?", ["Procedural decomposition only", "Inheritance", "Encapsulation", "Polymorphism"], "OOP organises programs around objects; pure procedural decomposition is the contrasting style."),
  out("class Counter {\n    int c = 0;\npublic:\n    void inc() { ++c; }\n    int get() const { return c; }\n};\nint main() {\n    Counter k; k.inc(); k.inc();\n    cout << k.get() << endl;\n    return 0;\n}", ["2", "0", "1", "Compile error"], "The private member c is changed only through public methods (encapsulation)."),
  m("What is abstraction?", ["Showing essential features while hiding implementation details", "Making all members public", "Creating many objects", "Copying objects"], "Abstraction lets users work with what an object does, not how."),
];

const references: RawQ[] = [
  out("int a = 5;\nint &r = a;\nr = 10;\ncout << a << endl;", ["10", "5", "Address of a", "Compile error"], "A reference is an alias; assigning to r assigns to a."),
  out("void inc(int &x) { x++; }\nint main() {\n    int n = 1;\n    inc(n); inc(n);\n    cout << n << endl;\n    return 0;\n}", ["3", "1", "2", "Compile error"], "Passing by reference lets the function modify the caller's variable."),
  m("Which statement about references is true?", ["A reference must be initialised and cannot be reseated to refer to another object", "A reference can be NULL", "A reference can be changed to refer to another variable", "References need the * operator to access the value"], "References are bound once at initialisation."),
  out("int a = 1, b = 2;\nint &r = a;\nr = b;\nb = 7;\ncout << a << \" \" << r << endl;", ["2 2", "7 7", "1 2", "2 7"], "r = b copies the value 2 into a (r still refers to a); later changes to b do not affect a.", 3),
  out("int x = 4;\nconst int &cr = x;\nx = 9;\ncout << cr << endl;", ["9", "4", "Compile error", "0"], "cr is a read-only alias of x, so it sees x's new value.", 2),
  m("Why pass large objects as const T& to functions?", ["To avoid copying while preventing modification", "To make the object mutable", "To allocate it on the heap", "To force a copy"], "const references are efficient and safe."),
  out("int& pick(int &a, int &b) { return a > b ? a : b; }\nint main() {\n    int x = 3, y = 8;\n    pick(x, y) = 0;\n    cout << x << \" \" << y << endl;\n    return 0;\n}", ["3 0", "0 8", "3 8", "Compile error"], "pick returns a reference to y (the larger), so assigning 0 to the result changes y.", 3),
];

const ctorDtor: RawQ[] = [
  out("class A {\npublic:\n    A() { cout << \"C\"; }\n    ~A() { cout << \"D\"; }\n};\nint main() {\n    A a;\n    cout << \"M\";\n    return 0;\n}", ["CMD", "CDM", "MCD", "CM"], "The constructor runs at creation, M is printed, and the destructor runs when a goes out of scope."),
  out("class A {\n    int id;\npublic:\n    A(int i) : id(i) { cout << \"C\" << id; }\n    ~A() { cout << \"D\" << id; }\n};\nint main() {\n    A a(1);\n    A b(2);\n    return 0;\n}", ["C1C2D2D1", "C1C2D1D2", "C1D1C2D2", "C2C1D1D2"], "Objects are destroyed in reverse order of construction.", 2),
  out("class B {\npublic:\n    B() { cout << \"B\"; }\n    ~B() { cout << \"~B\"; }\n};\nclass D : public B {\npublic:\n    D() { cout << \"D\"; }\n    ~D() { cout << \"~D\"; }\n};\nint main() { D d; return 0; }", ["BD~D~B", "DB~B~D", "BD~B~D", "DB~D~B"], "Base constructors run first; destructors run in the reverse order.", 2),
  out("class P {\npublic:\n    int x;\n    P(int v) : x(v) {}\n    P(const P &o) : x(o.x + 1) { cout << \"copy \"; }\n};\nint main() {\n    P a(5);\n    P b = a;\n    cout << b.x << endl;\n    return 0;\n}", ["copy 6", "5", "copy 5", "6"], "P b = a calls the copy constructor, which adds 1.", 2),
  m("When is a destructor called for an object created with new?", ["When delete is called on it", "When the function returns", "Never", "When the program starts"], "Heap objects live until they are deleted (or managed by a smart pointer)."),
  m("Why should a base class with virtual functions have a virtual destructor?", ["So deleting a derived object through a base pointer calls the derived destructor", "To make the class abstract", "To speed up construction", "It is never needed"], "Without a virtual destructor, delete through a base pointer is undefined behaviour."),
  m("What is a member initialiser list used for?", ["Initialising members (including const members and references) before the constructor body runs", "Listing all methods", "Declaring friends", "Calling the destructor"], "const members and references must be initialised in the initialiser list."),
];

const functions: RawQ[] = [
  out("int add(int a, int b) { return a + b; }\ndouble add(double a, double b) { return a + b + 0.5; }\nint main() {\n    cout << add(2, 3) << \" \" << add(2.0, 3.0) << endl;\n    return 0;\n}", ["5 5.5", "5.5 5.5", "5 5", "Compile error"], "Overload resolution picks the int version for int arguments and the double version for doubles.", 2),
  out("int power(int b, int e = 2) { int r = 1; while (e--) r *= b; return r; }\nint main() {\n    cout << power(3) << \" \" << power(2, 5) << endl;\n    return 0;\n}", ["9 32", "3 32", "9 10", "6 32"], "e defaults to 2: 3² = 9; 2⁵ = 32."),
  out("inline int sq(int x) { return x * x; }\nint main() { cout << sq(7) << endl; return 0; }", ["49", "14", "7", "Compile error"], "inline is a hint; the function still behaves like a normal function."),
  out("auto add = [](int a, int b) { return a * b; };\ncout << add(3, 4) << endl;", ["12", "7", "34", "Compile error"], "The lambda is named 'add' but multiplies: 3 × 4 = 12.", 2),
  out("int x = 10;\nauto f = [x]() mutable { x += 5; return x; };\ncout << f() << \" \" << x << endl;", ["15 10", "15 15", "10 10", "Compile error"], "Captured by value: the lambda changes its own copy (allowed by mutable).", 3),
  m("Which of these is NOT part of a function's signature for overloading?", ["Return type", "Number of parameters", "Types of parameters", "Order of parameter types"], "Functions cannot be overloaded on return type alone."),
];

const objectsClasses: RawQ[] = [
  out("class Box {\npublic:\n    static int count;\n    Box() { count++; }\n};\nint Box::count = 0;\nint main() {\n    Box a, b, c;\n    cout << Box::count << endl;\n    return 0;\n}", ["3", "1", "0", "Compile error"], "A static data member is shared by all objects."),
  out("class P {\n    int v;\npublic:\n    P(int x) : v(x) {}\n    friend int peek(const P &p);\n};\nint peek(const P &p) { return p.v; }\nint main() { cout << peek(P(42)) << endl; return 0; }", ["42", "0", "Compile error", "Garbage"], "A friend function may access private members.", 2),
  out("class A {\npublic:\n    int x = 1;\n    A& add(int n) { x += n; return *this; }\n};\nint main() {\n    A a;\n    a.add(2).add(3);\n    cout << a.x << endl;\n    return 0;\n}", ["6", "3", "1", "4"], "Returning *this by reference allows chained calls: 1 + 2 + 3 = 6.", 2),
  m("What is the 'this' pointer?", ["A pointer to the object on which a member function is called", "A pointer to the class", "A global pointer", "A pointer to the base class"], "Inside non-static member functions, this points to the current object."),
  m("A const member function promises to:", ["Not modify the object's (non-mutable) data members", "Return a constant", "Be called only once", "Be inlined"], "Declared as int get() const;, it can be called on const objects."),
  out("class S {\npublic:\n    int a;\n    S() : a(0) {}\n};\nint main() {\n    S arr[3];\n    cout << arr[0].a + arr[2].a << endl;\n    return 0;\n}", ["0", "Garbage", "3", "Compile error"], "Each element is created with the default constructor, which sets a to 0."),
];

const inheritance: RawQ[] = [
  out("class A { public: int f() { return 1; } };\nclass B : public A { public: int f() { return 2; } };\nint main() {\n    B b;\n    A &r = b;\n    cout << r.f() << \" \" << b.f() << endl;\n    return 0;\n}", ["1 2", "2 2", "1 1", "2 1"], "Without virtual, the call through an A& uses A::f (static binding).", 2),
  m("With public inheritance, public members of the base class become:", ["public in the derived class", "private in the derived class", "protected in the derived class", "inaccessible"], "Public inheritance preserves public and protected access."),
  m("With private inheritance, public members of the base class become:", ["private in the derived class", "public in the derived class", "protected in the derived class", "deleted"], "Private inheritance makes inherited public and protected members private."),
  m("What problem does virtual inheritance solve?", ["The diamond problem (duplicate base sub-objects in multiple inheritance)", "Slow virtual calls", "Memory leaks", "Name hiding"], "class B : virtual public A ensures only one A sub-object is shared."),
  out("class A { public: A() { cout << \"A\"; } };\nclass B { public: B() { cout << \"B\"; } };\nclass C : public B, public A { public: C() { cout << \"C\"; } };\nint main() { C c; return 0; }", ["BAC", "ABC", "CBA", "CAB"], "Base classes are constructed in the order they are listed in the class definition (B, then A), then C.", 3),
  m("Can a derived class access private members of its base class directly?", ["No", "Yes", "Only in constructors", "Only with public inheritance"], "Private members are accessible only to the class itself (and its friends)."),
];

const polymorphism: RawQ[] = [
  out("class Shape { public: virtual const char* name() { return \"shape\"; } virtual ~Shape() {} };\nclass Circle : public Shape { public: const char* name() override { return \"circle\"; } };\nint main() {\n    Shape *s = new Circle();\n    cout << s->name() << endl;\n    delete s;\n    return 0;\n}", ["circle", "shape", "shapecircle", "Compile error"], "A virtual function is dispatched on the object's dynamic type."),
  m("What makes a class abstract in C++?", ["Having at least one pure virtual function (= 0)", "Declaring it with the abstract keyword", "Having a private constructor", "Having no data members"], "virtual void draw() = 0; makes the class abstract."),
  m("How is runtime polymorphism implemented by most compilers?", ["A virtual table (vtable) of function pointers per class", "Macros", "Templates", "Function overloading"], "Each polymorphic object holds a pointer to its class's vtable."),
  out("class A { public: virtual int v() { return 1; } virtual ~A() {} };\nclass B : public A { public: int v() override { return 2; } };\nint main() {\n    A a = B();\n    cout << a.v() << endl;\n    return 0;\n}", ["1", "2", "Compile error", "Garbage"], "Copying a B into an A object slices off the B part, so A::v is called.", 3),
  m("What does the override keyword do?", ["Makes the compiler check that the function really overrides a base virtual function", "Makes a function virtual", "Prevents further overriding", "Hides the base function"], "override catches signature mistakes at compile time."),
  m("Compile-time polymorphism is achieved by:", ["Function overloading and templates", "Virtual functions", "Inheritance alone", "Dynamic casting"], "Overloads and templates are resolved during compilation."),
];

const operatorOverloading: RawQ[] = [
  out("struct V {\n    int x, y;\n    V operator+(const V &o) const { return {x + o.x, y + o.y}; }\n};\nint main() {\n    V a{1, 2}, b{3, 4};\n    V c = a + b;\n    cout << c.x << \",\" << c.y << endl;\n    return 0;\n}", ["4,6", "3,7", "1,2", "Compile error"], "operator+ adds the components."),
  out("struct M {\n    int v;\n    bool operator<(const M &o) const { return v > o.v; }\n};\nint main() {\n    M a{3}, b{5};\n    cout << (a < b) << endl;\n    return 0;\n}", ["0", "1", "Compile error", "true"], "The overloaded < actually compares with >, so 3 > 5 is false (0). cout prints bools as 0/1 by default.", 3),
  m("Which operators cannot be overloaded in C++?", [":: . .* ?: and sizeof", "+ and -", "<< and >>", "[] and ()"], "The scope, member access, member pointer, conditional and sizeof operators cannot be overloaded."),
  out("struct C {\n    int n = 0;\n    C& operator++() { ++n; return *this; }\n    C operator++(int) { C t = *this; ++n; return t; }\n};\nint main() {\n    C c;\n    C a = c++;\n    ++c;\n    cout << a.n << \" \" << c.n << endl;\n    return 0;\n}", ["0 2", "1 2", "0 1", "2 2"], "Postfix returns the old value (0); after both increments c.n is 2.", 3),
  m("Why is operator<< for output usually a non-member (often friend) function?", ["Its left operand is an ostream, not the class", "Members cannot return references", "It must be static", "It cannot access members otherwise"], "cout << obj calls operator<<(ostream&, const T&)."),
];

const templates: RawQ[] = [
  out("template <typename T>\nT maxOf(T a, T b) { return a > b ? a : b; }\nint main() {\n    cout << maxOf(3, 9) << \" \" << maxOf(2.5, 1.5) << endl;\n    return 0;\n}", ["9 2.5", "3 1.5", "9 2", "Compile error"], "The template is instantiated for int and for double."),
  out("template <typename T, int N>\nint size(T (&)[N]) { return N; }\nint main() {\n    int a[7];\n    cout << size(a) << endl;\n    return 0;\n}", ["7", "4", "28", "Compile error"], "N is deduced from the array type int[7].", 3),
  out("template <typename T>\nstruct Box { T v; T get() { return v; } };\nint main() {\n    Box<int> b{5};\n    Box<char> c{'z'};\n    cout << b.get() << c.get() << endl;\n    return 0;\n}", ["5z", "5 z", "5122", "Compile error"], "Each Box<T> is a separate class; << prints 5 then z.", 2),
  m("When are templates instantiated?", ["At compile time, for each set of template arguments used", "At run time", "At link time only", "When the program starts"], "The compiler generates code for each instantiation."),
  m("What is template specialisation?", ["Providing a separate implementation for particular template arguments", "Making a template private", "Calling a template recursively", "Converting a template to a macro"], "e.g. template<> struct Box<bool> { … }."),
];

const exceptions: RawQ[] = [
  out("try {\n    throw 42;\n} catch (int e) {\n    cout << \"int \" << e << endl;\n} catch (...) {\n    cout << \"other\" << endl;\n}", ["int 42", "other", "42", "Compile error"], "The int handler matches the thrown int."),
  out("try {\n    throw string(\"oops\");\n} catch (const exception &e) {\n    cout << \"std\" << endl;\n} catch (const string &s) {\n    cout << s << endl;\n}", ["oops", "std", "Compile error", "Nothing"], "A std::string is not derived from std::exception, so the second handler catches it.", 2, "#include <iostream>\n#include <string>\n#include <exception>\nusing namespace std;\n"),
  out("#include <stdexcept>\nint main() {\n    try {\n        throw out_of_range(\"bad index\");\n    } catch (const exception &e) {\n        cout << e.what() << endl;\n    }\n    return 0;\n}", ["bad index", "out_of_range", "std::exception", "Compile error"], "out_of_range derives from std::exception; what() returns the message.", 2),
  m("What does catch (...) do?", ["Catches an exception of any type", "Catches nothing", "Rethrows the exception", "Catches only std::exception"], "The ellipsis handler catches everything; put it last."),
  m("What happens if an exception is not caught anywhere?", ["std::terminate is called", "It is ignored", "The function returns 0", "The exception is converted to an int"], "An uncaught exception terminates the program."),
  m("What does noexcept on a function indicate?", ["The function does not throw exceptions", "The function catches all exceptions", "The function returns nothing", "The function is inline"], "If a noexcept function does throw, std::terminate is called."),
];

const stl: RawQ[] = [
  out("#include <vector>\nint main() {\n    vector<int> v = {3, 1, 4};\n    v.push_back(1);\n    cout << v.size() << \" \" << v[2] << endl;\n    return 0;\n}", ["4 4", "3 4", "4 1", "Compile error"], "push_back adds a fourth element; v[2] is 4."),
  out("#include <vector>\n#include <algorithm>\nint main() {\n    vector<int> v = {5, 2, 9, 1};\n    sort(v.begin(), v.end());\n    for (int x : v) cout << x << \" \";\n    cout << endl;\n    return 0;\n}", ["1 2 5 9", "9 5 2 1", "5 2 9 1", "1 5 2 9"], "std::sort orders the range ascending."),
  out("#include <map>\nint main() {\n    map<string, int> m;\n    m[\"b\"] = 2; m[\"a\"] = 1; m[\"b\"] += 5;\n    for (auto &p : m) cout << p.first << p.second << \" \";\n    cout << endl;\n    return 0;\n}", ["a1 b7", "b7 a1", "a1 b2", "b2 a1"], "std::map keeps keys sorted; operator[] creates or updates entries.", 2, "#include <iostream>\n#include <string>\nusing namespace std;\n"),
  out("#include <set>\nint main() {\n    set<int> s = {4, 1, 4, 2, 1};\n    cout << s.size() << \" \" << *s.begin() << endl;\n    return 0;\n}", ["3 1", "5 4", "3 4", "5 1"], "std::set stores unique elements in sorted order."),
  out("#include <stack>\nint main() {\n    stack<int> st;\n    st.push(1); st.push(2); st.push(3);\n    st.pop();\n    cout << st.top() << endl;\n    return 0;\n}", ["2", "3", "1", "Compile error"], "A stack is LIFO: after popping 3, the top is 2."),
  out("#include <vector>\n#include <numeric>\nint main() {\n    vector<int> v = {1, 2, 3, 4};\n    cout << accumulate(v.begin(), v.end(), 10) << endl;\n    return 0;\n}", ["20", "10", "24", "Compile error"], "accumulate starts at 10 and adds 1 + 2 + 3 + 4 = 20.", 2),
  m("Which container gives O(1) average lookup by key?", ["unordered_map", "map", "vector", "list"], "unordered_map is a hash table; map is a balanced tree with O(log n) lookup."),
  m("What do STL iterators provide?", ["A uniform way to traverse containers, used by algorithms", "Automatic memory management", "Thread safety", "Exception handling"], "Algorithms work on iterator ranges [begin, end)."),
];

const subject: RawSubject = {
  "oops-concepts": topic(oops, { intro: "C++ supports object-oriented programming through classes, encapsulation (access specifiers), inheritance and polymorphism (virtual functions), as well as generic programming with templates." }),
  references: topic(references, { intro: "A reference is an alias for an existing object. It must be initialised, cannot be null and cannot be reseated. Pass by reference to avoid copies or to modify arguments." }),
  "constructors-and-destructors": topic(ctorDtor, { intro: "Constructors initialise objects; destructors release resources when an object's lifetime ends.", formulas: [{ h: "Order", points: ["Base before derived; members in declaration order", "Destruction runs in the reverse order", "Local objects are destroyed in reverse order of creation"] }, { h: "Special members", points: ["Default, copy and move constructors; copy and move assignment; destructor (the rule of three/five)"] }] }),
  functions: topic(functions, { intro: "C++ adds function overloading, default arguments, inline functions, references and lambdas to C functions." }),
  "objects-and-classes": topic(objectsClasses, { intro: "A class defines data members and member functions; objects are instances. Static members belong to the class; friend functions may access private members; this points to the current object." }),
  inheritance: topic(inheritance, { intro: "A derived class inherits from one or more base classes with public, protected or private inheritance. Virtual inheritance avoids duplicate bases in diamond hierarchies." }),
  "polymorphism-and-virtual-functions": topic(polymorphism, { intro: "Virtual functions give runtime polymorphism through base pointers or references. A pure virtual function (= 0) makes a class abstract. Beware of object slicing when copying derived objects into base objects." }),
  "operator-overloading": topic(operatorOverloading, { intro: "Operators can be given meanings for user types with operator functions. Overload sensibly: + should add, < should define a strict weak ordering." }),
  templates: topic(templates, { intro: "Templates write code once for many types. Function and class templates are instantiated at compile time; specialisations customise particular types." }),
  "exception-handling": topic(exceptions, { intro: "C++ uses throw, try and catch. Throw objects derived from std::exception and catch them by const reference." }),
  stl: topic(stl, { intro: "The Standard Template Library provides containers (vector, list, deque, set, map, unordered_map, stack, queue, priority_queue), iterators and algorithms (sort, find, accumulate, …)." }),
};
export default subject;
