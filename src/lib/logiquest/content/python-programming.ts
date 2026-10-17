/** Python Programming. Every "What is the output?" question is executed by `npm run lq:validate`. */
import type { RawQ, RawSubject } from "../types";
import { m, m2, m3, topic } from "./build";

/** Output question: the first option must be exactly what the program prints. */
const out = (code: string, o: string[], e: string, d: 1 | 2 | 3 = 1): RawQ =>
  m(`What is the output of the following code?\n\`\`\`python\n${code}\n\`\`\``, o, e, { d, check: `py:${code}` });

const basics: RawQ[] = [
  m("Which of the following is a valid variable name in Python?", ["_total", "2total", "total-sum", "class"], "Names may start with a letter or underscore and contain letters, digits and underscores. '2total' starts with a digit, 'total-sum' contains '-', and 'class' is a keyword."),
  m("Which symbol starts a single-line comment in Python?", ["#", "//", "/*", "--"], "Python comments begin with #."),
  m("How does Python mark a block of code (for example the body of an if)?", ["By indentation", "By curly braces", "By begin/end keywords", "By semicolons"], "Python uses indentation to define blocks."),
  out("print(type(10 / 2).__name__)", ["float", "int", "double", "number"], "The / operator always returns a float in Python 3, even for exact results."),
  out("x = 7\ny = 2\nprint(x // y, x % y)", ["3 1", "3.5 1", "3 0", "4 1"], "// is floor division (7 // 2 = 3) and % gives the remainder (1)."),
  out("print(2 ** 3 ** 2)", ["512", "64", "36", "18"], "** is right-associative: 3 ** 2 = 9 first, then 2 ** 9 = 512.", 2),
  out("a, b = 5, 10\na, b = b, a\nprint(a, b)", ["10 5", "5 10", "10 10", "5 5"], "Tuple assignment swaps the values in one step."),
  out("print('Hello', 'World', sep='-', end='!')", ["Hello-World!", "Hello World!", "Hello-World", "Hello - World !"], "sep is placed between items and end replaces the default newline."),
  m("What does the input() function return?", ["Always a string", "An integer if a number is typed", "A float", "It depends on the input"], "input() always returns a str; convert with int() or float()."),
  out("x = 5\nx += 3\nx *= 2\nprint(x)", ["16", "13", "11", "10"], "x = 5 + 3 = 8, then 8 × 2 = 16."),
  m("Which keyword is used to define a function in Python?", ["def", "function", "fun", "define"], "Functions are defined with def."),
  out("print(bool(''), bool('0'), bool(0))", ["False True False", "False False False", "True True False", "False True True"], "An empty string is falsy; '0' is a non-empty string (truthy); the number 0 is falsy.", 2),
];

const dataTypes: RawQ[] = [
  out("print(type([]).__name__, type(()).__name__, type({}).__name__)", ["list tuple dict", "list tuple set", "array tuple dict", "list list dict"], "[] is a list, () a tuple and {} an empty dict (not a set)."),
  out("print(int('42') + float('1.5'))", ["43.5", "421.5", "43", "Error"], "int('42') = 42, float('1.5') = 1.5, and 42 + 1.5 = 43.5."),
  out("print(int(3.99), round(3.5), round(2.5))", ["3 4 2", "4 4 3", "3 4 3", "3 3 2"], "int() truncates toward zero. round() uses banker's rounding: 3.5 → 4, 2.5 → 2.", 3),
  m("Which of these types is immutable?", ["tuple", "list", "dict", "set"], "Tuples cannot be modified after creation; lists, dicts and sets can."),
  out("print(0.1 + 0.2 == 0.3)", ["False", "True", "None", "Error"], "Floating-point numbers are binary approximations: 0.1 + 0.2 is 0.30000000000000004.", 2),
  out("x = None\nprint(x is None, type(x).__name__)", ["True NoneType", "False NoneType", "True None", "True null"], "None is the only value of type NoneType; compare it with 'is'."),
  out("print(10 == 10.0, 10 is 10.0)", ["True False", "True True", "False False", "False True"], "== compares values (equal), while 'is' compares identity: an int and a float are different objects.", 3),
  out("print(len(str(12345)))", ["5", "12345", "1", "Error"], "str(12345) is '12345', which has 5 characters."),
  m("What is the result of type(3 + 4j)?", ["<class 'complex'>", "<class 'float'>", "<class 'int'>", "Error"], "Numbers with a 'j' suffix are complex."),
  out("print(bin(10), hex(255))", ["0b1010 0xff", "1010 ff", "0b1010 0xFF", "0o12 0xff"], "bin() and hex() return strings with the prefixes 0b and 0x; hex uses lowercase letters."),
];

const operators: RawQ[] = [
  out("print(5 > 3 and 2 > 4)", ["False", "True", "None", "Error"], "True and False is False."),
  out("print(0 or 'hello')", ["hello", "0", "True", "False"], "'or' returns the first truthy operand, here 'hello'.", 2),
  out("print(not 0, not 5)", ["True False", "False True", "True True", "False False"], "0 is falsy so not 0 is True; 5 is truthy so not 5 is False."),
  out("print(7 & 3, 7 | 8, 6 ^ 3)", ["3 15 5", "3 15 9", "7 15 5", "3 8 5"], "7 & 3 = 0b111 & 0b011 = 3; 7 | 8 = 15; 6 ^ 3 = 0b110 ^ 0b011 = 0b101 = 5.", 2),
  out("print(1 << 4, 64 >> 3)", ["16 8", "4 8", "16 16", "5 61"], "Shifting left by 4 multiplies by 16; shifting right by 3 divides by 8."),
  out("print(-7 // 2, -7 % 2)", ["-4 1", "-3 -1", "-3 1", "-4 -1"], "Floor division rounds toward negative infinity (−3.5 → −4), and the remainder takes the sign of the divisor: −7 = 2 × (−4) + 1.", 3),
  out("print(3 in [1, 2, 3], 'a' not in 'cat')", ["True False", "True True", "False False", "False True"], "3 is in the list; 'a' is in 'cat', so 'not in' is False."),
  out("x = [1, 2]\ny = x\ny.append(3)\nprint(x)", ["[1, 2, 3]", "[1, 2]", "[3]", "Error"], "y and x refer to the same list object, so appending through y changes x.", 2),
  out("print(1 < 2 < 3, 3 > 2 > 2)", ["True False", "True True", "False False", "False True"], "Comparisons chain: 1 < 2 and 2 < 3 is True; 3 > 2 and 2 > 2 is False."),
  out("print(10 / 4, 10 // 4, 10 % 4)", ["2.5 2 2", "2 2 2", "2.5 2.5 2", "2.5 3 2"], "True division gives 2.5, floor division 2, remainder 2."),
];

const strings: RawQ[] = [
  out("s = 'Python'\nprint(s[0], s[-1], s[1:4])", ["P n yth", "P n ytho", "y n yth", "P o yth"], "Index 0 is 'P', -1 is the last character 'n', and s[1:4] is characters 1 to 3: 'yth'."),
  out("print('ab' * 3)", ["ababab", "ab3", "ab ab ab", "Error"], "Multiplying a string repeats it."),
  out("s = 'hello world'\nprint(s.title(), s.upper().count('L'))", ["Hello World 3", "Hello world 3", "Hello World 2", "HELLO WORLD 3"], "title() capitalises each word; upper() gives 'HELLO WORLD', which contains three 'L's.", 2),
  out("print('a,b,,c'.split(','))", ["['a', 'b', '', 'c']", "['a', 'b', 'c']", "['a,b,,c']", "('a', 'b', '', 'c')"], "split(',') keeps the empty string between two consecutive commas.", 2),
  out("print('-'.join(['2026', '10', '17']))", ["2026-10-17", "-2026-10-17", "2026 10 17", "['2026', '10', '17']"], "join() inserts the separator between items."),
  out("s = 'racecar'\nprint(s == s[::-1])", ["True", "False", "racecar", "Error"], "s[::-1] reverses the string; 'racecar' is a palindrome."),
  out("print('[' + '  data  '.strip() + ']')", ["[data]", "[  data]", "[data  ]", "[  data  ]"], "strip() removes leading and trailing whitespace."),
  out("print('Python'.find('th'), 'Python'.find('z'))", ["2 -1", "2 0", "3 -1", "2 None"], "find() returns the index of the first match, or −1 when not found."),
  m("Strings in Python are:", ["Immutable", "Mutable", "Mutable only with replace()", "Arrays of bytes"], "Strings cannot be changed in place; methods like replace() return new strings."),
  out("name, age = 'Asha', 21\nprint(f'{name} is {age + 1} next year')", ["Asha is 22 next year", "{name} is {age + 1} next year", "Asha is 21 next year", "Asha is age + 1 next year"], "f-strings evaluate the expressions inside braces."),
  out("print('Mississippi'.replace('ss', 'SS', 1))", ["MiSSissippi", "MiSSiSSippi", "Mississippi", "MISSissippi"], "The third argument limits the number of replacements to one.", 2),
  out("print(len('hello\\n'))", ["6", "7", "5", "Error"], "'\\n' is a single newline character, so the length is 5 + 1 = 6.", 2),
];

const lists: RawQ[] = [
  out("a = [3, 1, 2]\na.sort()\nprint(a)", ["[1, 2, 3]", "[3, 2, 1]", "[3, 1, 2]", "None"], "sort() sorts the list in place in ascending order."),
  out("a = [3, 1, 2]\nprint(a.sort())", ["None", "[1, 2, 3]", "[3, 1, 2]", "Error"], "sort() modifies the list and returns None; use sorted(a) to get a new list.", 2),
  out("a = [1, 2, 3, 4, 5]\nprint(a[1:4], a[::2])", ["[2, 3, 4] [1, 3, 5]", "[1, 2, 3] [1, 3, 5]", "[2, 3, 4, 5] [1, 3, 5]", "[2, 3, 4] [2, 4]"], "a[1:4] takes indexes 1–3; a[::2] takes every second item."),
  out("a = [1, 2]\na.append([3, 4])\nprint(len(a))", ["3", "4", "2", "Error"], "append() adds its argument as one element (a nested list).", 2),
  out("a = [1, 2]\na.extend([3, 4])\nprint(a)", ["[1, 2, 3, 4]", "[1, 2, [3, 4]]", "[3, 4, 1, 2]", "[1, 2]"], "extend() adds each element of the iterable."),
  out("a = [10, 20, 30]\nprint(a.pop(), a)", ["30 [10, 20]", "10 [20, 30]", "30 [10, 20, 30]", "None [10, 20]"], "pop() removes and returns the last element by default."),
  out("a = [0] * 3\nprint(a)", ["[0, 0, 0]", "[0]", "[0, 3]", "0"], "Multiplying a list repeats its elements."),
  out("a = [1, 2, 3]\nb = a[:]\nb[0] = 99\nprint(a[0])", ["1", "99", "None", "Error"], "a[:] creates a shallow copy, so changing b does not affect a.", 2),
  out("print([1, 2] + [3], [1, 2] == [2, 1])", ["[1, 2, 3] False", "[1, 2, 3] True", "[4, 2] False", "[1, 2, [3]] False"], "+ concatenates lists; list equality depends on order."),
  out("a = [5, 3, 8]\nprint(max(a), min(a), sum(a))", ["8 3 16", "8 3 15", "5 3 16", "3 8 16"], "max, min and sum work on lists of numbers."),
  out("matrix = [[1, 2], [3, 4]]\nprint(matrix[1][0])", ["3", "2", "1", "4"], "matrix[1] is [3, 4], and its index 0 is 3."),
  out("a = [1, 2, 3, 2]\na.remove(2)\nprint(a)", ["[1, 3, 2]", "[1, 3]", "[1, 2, 3]", "[1, 2, 3, 2]"], "remove() deletes only the first occurrence of the value.", 2),
];

const tuples: RawQ[] = [
  out("t = (1, 2, 3)\nprint(t[1], len(t))", ["2 3", "1 3", "2 2", "Error"], "Index 1 is 2, and the tuple has 3 items."),
  out("t = (5)\nprint(type(t).__name__)", ["int", "tuple", "list", "Error"], "Parentheses alone do not make a tuple; a one-element tuple needs a comma: (5,).", 2),
  out("t = (5,)\nprint(type(t).__name__, len(t))", ["tuple 1", "int 1", "tuple 5", "list 1"], "The trailing comma makes it a one-element tuple."),
  out("a, *b = (1, 2, 3, 4)\nprint(a, b)", ["1 [2, 3, 4]", "1 (2, 3, 4)", "[1] [2, 3, 4]", "Error"], "Extended unpacking collects the remaining items into a list.", 3),
  m("What happens when you run: t = (1, 2); t[0] = 5", ["TypeError is raised", "t becomes (5, 2)", "t becomes [5, 2]", "Nothing happens"], "Tuples are immutable; item assignment raises TypeError."),
  out("t = (1, 2, 2, 3, 2)\nprint(t.count(2), t.index(3))", ["3 3", "3 2", "2 3", "3 4"], "2 appears three times; 3 is at index 3."),
  out("print((1, 2) + (3,), (1, 2) * 2)", ["(1, 2, 3) (1, 2, 1, 2)", "(1, 2, 3) (2, 4)", "(4, 2) (1, 2, 1, 2)", "Error"], "+ concatenates and * repeats tuples."),
  out("x, y = 3, 4\nprint((x, y) < (3, 5))", ["True", "False", "Error", "None"], "Tuples compare element by element: 3 == 3, then 4 < 5.", 2),
  m("Why can a tuple be used as a dictionary key but a list cannot?", ["Tuples are immutable and hashable", "Tuples are faster", "Lists are ordered", "Tuples have fixed length 2"], "Dictionary keys must be hashable; immutable tuples (of hashable items) are, mutable lists are not."),
];

const dictionaries: RawQ[] = [
  out("d = {'a': 1, 'b': 2}\nd['c'] = 3\nprint(len(d), d['b'])", ["3 2", "2 2", "3 3", "Error"], "Adding a new key grows the dict to 3 items; d['b'] is 2."),
  out("d = {'a': 1}\nprint(d.get('z'), d.get('z', 0))", ["None 0", "Error", "0 0", "None None"], "get() returns None (or the given default) for a missing key instead of raising KeyError."),
  out("d = {'x': 1, 'y': 2}\nprint(list(d.keys()), list(d.values()))", ["['x', 'y'] [1, 2]", "['x', 'y'] ['1', '2']", "[1, 2] ['x', 'y']", "('x', 'y') (1, 2)"], "keys() and values() return views; list() converts them."),
  out("d = {'a': 1, 'a': 5}\nprint(d)", ["{'a': 5}", "{'a': 1}", "{'a': 1, 'a': 5}", "Error"], "Duplicate keys are allowed in a literal, but the last value wins.", 2),
  out("d = {'b': 2, 'a': 1}\nfor k in sorted(d):\n    print(k, d[k], end=' ')", ["a 1 b 2", "b 2 a 1", "a b 1 2", "1 2"], "sorted(d) sorts the keys alphabetically.", 2),
  out("counts = {}\nfor ch in 'banana':\n    counts[ch] = counts.get(ch, 0) + 1\nprint(counts)", ["{'b': 1, 'a': 3, 'n': 2}", "{'a': 3, 'b': 1, 'n': 2}", "{'b': 1, 'a': 1, 'n': 1}", "{'banana': 1}"], "Counting with get(); dicts keep insertion order (b, a, n).", 2),
  out("d = {'a': 1, 'b': 2}\nprint(d.pop('a'), d)", ["1 {'b': 2}", "a {'b': 2}", "1 {'a': 1, 'b': 2}", "None {'b': 2}"], "pop(key) removes the key and returns its value."),
  out("d1 = {'a': 1}\nd2 = {'b': 2, 'a': 9}\nd1.update(d2)\nprint(d1)", ["{'a': 9, 'b': 2}", "{'a': 1, 'b': 2}", "{'b': 2, 'a': 9}", "{'a': 1}"], "update() overwrites existing keys and adds new ones; 'a' keeps its original position.", 3),
  m("Which of these cannot be a dictionary key?", ["[1, 2]", "(1, 2)", "'key'", "42"], "Lists are mutable and unhashable, so they cannot be keys."),
  out("d = {i: i * i for i in range(4)}\nprint(d[3])", ["9", "3", "6", "Error"], "The dict comprehension maps each i to i², so d[3] = 9."),
];

const sets: RawQ[] = [
  out("s = {1, 2, 2, 3}\nprint(len(s))", ["3", "4", "2", "Error"], "Sets store unique elements only."),
  out("a = {1, 2, 3}\nb = {2, 3, 4}\nprint(sorted(a & b), sorted(a | b))", ["[2, 3] [1, 2, 3, 4]", "[1, 4] [1, 2, 3, 4]", "[2, 3] [1, 2, 2, 3, 3, 4]", "[2, 3] [2, 3]"], "& is intersection and | is union."),
  out("a = {1, 2, 3}\nb = {2, 3, 4}\nprint(sorted(a - b), sorted(a ^ b))", ["[1] [1, 4]", "[4] [1, 4]", "[1] [2, 3]", "[1, 4] [1]"], "a − b keeps items only in a; a ^ b keeps items in exactly one set.", 2),
  out("s = set()\nprint(type(s).__name__, type({}).__name__)", ["set dict", "set set", "dict dict", "dict set"], "set() creates an empty set; {} creates an empty dict."),
  out("print({1, 2} <= {1, 2, 3}, {1, 4} <= {1, 2, 3})", ["True False", "True True", "False False", "False True"], "<= tests for subset."),
  out("s = {3, 1, 2}\ns.add(2)\ns.discard(10)\nprint(sorted(s))", ["[1, 2, 3]", "[1, 2, 2, 3]", "Error", "[1, 2, 3, 10]"], "Adding an existing element changes nothing, and discard() ignores missing elements.", 2),
  m("Why can't a list be an element of a set?", ["Lists are unhashable", "Sets only hold numbers", "Lists are ordered", "Sets have a size limit"], "Set elements must be hashable; lists are mutable and unhashable."),
  out("words = ['a', 'b', 'a', 'c', 'b']\nprint(len(set(words)))", ["3", "5", "2", "Error"], "Converting to a set removes duplicates: {'a', 'b', 'c'}."),
];

const controlFlow: RawQ[] = [
  out("x = 15\nif x > 10 and x % 5 == 0:\n    print('A')\nelif x > 10:\n    print('B')\nelse:\n    print('C')", ["A", "B", "C", "AB"], "Both conditions in the first test are true, so 'A' is printed and the other branches are skipped."),
  out("for i in range(1, 10, 3):\n    print(i, end=' ')", ["1 4 7", "1 4 7 10", "1 3 6 9", "3 6 9"], "range(1, 10, 3) gives 1, 4, 7 (10 is excluded)."),
  out("total = 0\nfor i in range(5):\n    total += i\nprint(total)", ["10", "15", "5", "4"], "0 + 1 + 2 + 3 + 4 = 10."),
  out("i = 0\nwhile i < 5:\n    i += 2\nprint(i)", ["6", "5", "4", "8"], "i takes values 2, 4, 6; the loop stops when i = 6."),
  out("for i in range(5):\n    if i == 3:\n        break\n    print(i, end=' ')", ["0 1 2", "0 1 2 3", "3", "0 1 2 4"], "break leaves the loop when i reaches 3."),
  out("for i in range(5):\n    if i % 2 == 0:\n        continue\n    print(i, end=' ')", ["1 3", "0 2 4", "1 2 3 4", "0 1 2 3 4"], "continue skips even numbers."),
  out("for i in range(3):\n    pass\nelse:\n    print('done')", ["done", "Nothing is printed", "0 1 2", "Error"], "A for loop's else block runs when the loop finishes without break.", 2),
  out("for i in range(3):\n    if i == 1:\n        break\nelse:\n    print('done')\nprint(i)", ["1", "done\n1", "done\n2", "2"], "The loop exits with break, so the else block does not run; i is 1.", 3),
  out("x = 5\nresult = 'even' if x % 2 == 0 else 'odd'\nprint(result)", ["odd", "even", "5", "Error"], "The conditional expression picks 'odd' because 5 % 2 is 1."),
  out("count = 0\nfor i in range(3):\n    for j in range(3):\n        if i != j:\n            count += 1\nprint(count)", ["6", "9", "3", "0"], "Of 9 (i, j) pairs, 3 have i == j, leaving 6.", 2),
  out("match 3:\n    case 1:\n        print('one')\n    case 3:\n        print('three')\n    case _:\n        print('other')", ["three", "one", "other", "Error"], "The match statement (Python 3.10+) runs the first case that matches.", 2),
];

const functions: RawQ[] = [
  out("def add(a, b=10):\n    return a + b\nprint(add(5), add(5, 1))", ["15 6", "15 15", "5 6", "Error"], "b defaults to 10 unless a value is passed."),
  out("def f():\n    pass\nprint(f())", ["None", "pass", "Error", "0"], "A function without a return statement returns None."),
  out("def f(*args):\n    return len(args)\nprint(f(1, 2, 3))", ["3", "1", "6", "Error"], "*args collects positional arguments into a tuple."),
  out("def f(**kw):\n    return sorted(kw)\nprint(f(b=2, a=1))", ["['a', 'b']", "['b', 'a']", "{'a': 1, 'b': 2}", "[1, 2]"], "**kw collects keyword arguments into a dict; sorted() returns its keys in order.", 2),
  out("def f(x, lst=[]):\n    lst.append(x)\n    return lst\nf(1)\nprint(f(2))", ["[1, 2]", "[2]", "[1]", "Error"], "Default arguments are evaluated once, so the same list is shared between calls. Use None as the default to avoid this.", 3),
  out("x = 10\ndef f():\n    x = 5\n    return x\nprint(f(), x)", ["5 10", "5 5", "10 10", "10 5"], "Assignment inside f creates a local x; the global x is unchanged.", 2),
  out("x = 10\ndef f():\n    global x\n    x = 5\nf()\nprint(x)", ["5", "10", "None", "Error"], "'global x' makes the assignment change the module-level variable."),
  out("def fact(n):\n    return 1 if n <= 1 else n * fact(n - 1)\nprint(fact(5))", ["120", "24", "5", "720"], "5! = 5 × 4 × 3 × 2 × 1 = 120."),
  out("def outer():\n    count = 0\n    def inner():\n        nonlocal count\n        count += 1\n        return count\n    return inner\nc = outer()\nc()\nprint(c())", ["2", "1", "0", "Error"], "inner is a closure; nonlocal lets it update outer's count across calls.", 3),
  out("def f(a, b):\n    return a - b\nprint(f(b=1, a=10))", ["9", "-9", "Error", "11"], "Keyword arguments are matched by name, not position."),
  m("What is a docstring?", ["A string literal placed first in a function, class or module to document it", "A comment that starts with #", "A string stored in a file", "A variable named doc"], "Docstrings are available at runtime through __doc__ and help()."),
];

const lambdaFunctional: RawQ[] = [
  out("square = lambda x: x * x\nprint(square(6))", ["36", "12", "6", "Error"], "A lambda is an anonymous function: 6 × 6 = 36."),
  out("print(list(map(lambda x: x + 1, [1, 2, 3])))", ["[2, 3, 4]", "[1, 2, 3]", "[2, 4, 6]", "<map object>"], "map applies the function to every item."),
  out("print(list(filter(lambda x: x % 2, range(6))))", ["[1, 3, 5]", "[0, 2, 4]", "[1, 2, 3, 4, 5]", "[]"], "filter keeps items for which the function returns a truthy value (odd numbers).", 2),
  out("from functools import reduce\nprint(reduce(lambda a, b: a * b, [1, 2, 3, 4]))", ["24", "10", "4", "Error"], "reduce folds the list: ((1 × 2) × 3) × 4 = 24.", 2),
  out("words = ['pear', 'fig', 'banana']\nprint(sorted(words, key=len))", ["['fig', 'pear', 'banana']", "['banana', 'fig', 'pear']", "['banana', 'pear', 'fig']", "['pear', 'fig', 'banana']"], "key=len sorts by string length."),
  out("pairs = [(1, 'b'), (2, 'a')]\nprint(sorted(pairs, key=lambda p: p[1])[0])", ["(2, 'a')", "(1, 'b')", "'a'", "2"], "Sorting by the second element puts (2, 'a') first.", 2),
  out("print(list(zip([1, 2, 3], 'ab')))", ["[(1, 'a'), (2, 'b')]", "[(1, 'a'), (2, 'b'), (3, None)]", "[1, 'a', 2, 'b']", "Error"], "zip stops at the shortest iterable.", 2),
  out("print(any([0, '', 5]), all([1, 'x', []]))", ["True False", "False False", "True True", "False True"], "any is True if one item is truthy (5); all is False because [] is falsy.", 2),
  out("for i, ch in enumerate('ab', start=1):\n    print(i, ch, end=' ')", ["1 a 2 b", "0 a 1 b", "a 1 b 2", "1 2"], "enumerate pairs each item with a counter starting at 1."),
];

const comprehensions: RawQ[] = [
  out("print([x * 2 for x in range(4)])", ["[0, 2, 4, 6]", "[2, 4, 6, 8]", "[0, 1, 2, 3]", "[0, 2, 4]"], "The comprehension doubles 0, 1, 2, 3."),
  out("print([x for x in range(10) if x % 3 == 0])", ["[0, 3, 6, 9]", "[3, 6, 9]", "[0, 3, 6]", "[1, 4, 7]"], "Keeps multiples of 3 from 0 to 9."),
  out("print({x % 3 for x in range(10)})", ["{0, 1, 2}", "{0, 3, 6, 9}", "[0, 1, 2]", "{1, 2, 3}"], "A set comprehension keeps unique remainders."),
  out("print([(i, j) for i in range(2) for j in range(2) if i != j])", ["[(0, 1), (1, 0)]", "[(0, 0), (1, 1)]", "[(0, 1)]", "[(1, 0), (0, 1)]"], "Nested loops in a comprehension run left to right."),
  out("g = (x * x for x in range(3))\nprint(type(g).__name__, sum(g))", ["generator 5", "list 5", "generator 9", "tuple 5"], "Parentheses make a generator expression; 0 + 1 + 4 = 5.", 2),
  out("def gen():\n    yield 1\n    yield 2\nprint(list(gen()))", ["[1, 2]", "[1]", "2", "<generator>"], "yield produces values lazily; list() collects them."),
  out("g = (i for i in range(3))\nprint(list(g), list(g))", ["[0, 1, 2] []", "[0, 1, 2] [0, 1, 2]", "[] []", "Error"], "A generator can be consumed only once.", 3),
  out("def count_up(n):\n    i = 0\n    while i < n:\n        yield i\n        i += 1\nprint(sum(count_up(4)))", ["6", "10", "4", "3"], "It yields 0, 1, 2, 3 whose sum is 6.", 2),
  out("print([c.upper() for c in 'abc' if c != 'b'])", ["['A', 'C']", "['A', 'B', 'C']", "['a', 'c']", "AC"], "Filters out 'b' and upper-cases the rest."),
];

const oop: RawQ[] = [
  out("class Dog:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return self.name + ' says woof'\nprint(Dog('Rex').speak())", ["Rex says woof", "Dog says woof", "woof", "Error"], "__init__ stores the name; speak uses it."),
  out("class A:\n    count = 0\n    def __init__(self):\n        A.count += 1\nA(); A()\nprint(A.count)", ["2", "0", "1", "Error"], "count is a class attribute shared by all instances; it is incremented twice."),
  out("class Animal:\n    def sound(self):\n        return 'generic'\nclass Cat(Animal):\n    def sound(self):\n        return 'meow'\nprint(Cat().sound(), Animal().sound())", ["meow generic", "generic generic", "meow meow", "Error"], "Cat overrides sound(); Animal keeps its own version."),
  out("class A:\n    def hello(self):\n        return 'A'\nclass B(A):\n    def hello(self):\n        return 'B' + super().hello()\nprint(B().hello())", ["BA", "B", "A", "AB"], "super().hello() calls the parent's method.", 2),
  out("class P:\n    def __str__(self):\n        return 'Point'\nprint(P())", ["Point", "<__main__.P object>", "P", "Error"], "print() uses __str__ when it is defined."),
  out("class V:\n    def __init__(self, x):\n        self.x = x\n    def __add__(self, o):\n        return V(self.x + o.x)\nprint((V(2) + V(3)).x)", ["5", "23", "Error", "None"], "__add__ overloads the + operator.", 2),
  out("class A: pass\nclass B(A): pass\nprint(isinstance(B(), A), issubclass(A, B))", ["True False", "True True", "False False", "False True"], "A B object is also an A; A is not a subclass of B."),
  out("class Acc:\n    def __init__(self):\n        self.__bal = 100\na = Acc()\nprint(hasattr(a, '__bal'), a._Acc__bal)", ["False 100", "True 100", "False Error", "True 0"], "Names starting with __ are mangled to _ClassName__name, so '__bal' is not found directly.", 3),
  out("class T:\n    @staticmethod\n    def add(a, b):\n        return a + b\n    @classmethod\n    def name(cls):\n        return cls.__name__\nprint(T.add(2, 3), T.name())", ["5 T", "5 cls", "Error", "23 T"], "Static methods get no self or cls; class methods receive the class.", 2),
  out("class C:\n    def __init__(self):\n        self._v = 0\n    @property\n    def v(self):\n        return self._v * 10\nc = C()\nc._v = 4\nprint(c.v)", ["40", "4", "0", "Error"], "@property makes v readable like an attribute while running code.", 2),
  m("Which method is called when an object is created?", ["__init__", "__new__ only", "__create__", "__call__"], "__init__ initialises a newly created instance (after __new__ creates it)."),
];

const exceptions: RawQ[] = [
  out("try:\n    print(10 / 0)\nexcept ZeroDivisionError:\n    print('error')", ["error", "0", "inf", "ZeroDivisionError"], "Division by zero raises ZeroDivisionError, which is caught."),
  out("try:\n    x = int('abc')\nexcept ValueError:\n    x = -1\nprint(x)", ["-1", "abc", "0", "Error"], "int('abc') raises ValueError; the handler sets x = −1."),
  out("try:\n    print('A', end='')\nexcept Exception:\n    print('B', end='')\nelse:\n    print('C', end='')\nfinally:\n    print('D', end='')", ["ACD", "ABD", "AD", "ABCD"], "No exception occurs: try runs, then else, then finally.", 2),
  out("def f():\n    try:\n        return 'try'\n    finally:\n        print('finally', end=' ')\nprint(f())", ["finally try", "try finally", "try", "finally"], "finally runs before the function actually returns.", 3),
  out("d = {}\ntry:\n    d['k']\nexcept KeyError as e:\n    print(type(e).__name__)", ["KeyError", "IndexError", "ValueError", "None"], "Looking up a missing dict key raises KeyError."),
  out("try:\n    [1, 2][5]\nexcept (KeyError, IndexError):\n    print('caught')", ["caught", "IndexError", "Error", "None"], "A tuple of exception types catches any of them."),
  out("class MyError(Exception):\n    pass\ntry:\n    raise MyError('bad')\nexcept MyError as e:\n    print(e)", ["bad", "MyError", "MyError('bad')", "Error"], "Custom exceptions subclass Exception; printing one shows its message."),
  m("Which statement is used to raise an exception manually?", ["raise", "throw", "except", "error"], "Python uses raise."),
  out("try:\n    try:\n        1 / 0\n    finally:\n        print('inner', end=' ')\nexcept ZeroDivisionError:\n    print('outer')", ["inner outer", "outer inner", "outer", "inner"], "The inner finally runs first, then the exception reaches the outer handler.", 3),
];

const modules: RawQ[] = [
  out("import math\nprint(math.sqrt(16), math.floor(2.7), math.ceil(2.1))", ["4.0 2 3", "4 2 3", "4.0 3 3", "4.0 2 2"], "sqrt returns a float; floor and ceil return ints."),
  out("from collections import Counter\nprint(Counter('aabbbc').most_common(1))", ["[('b', 3)]", "[('a', 2)]", "('b', 3)", "{'b': 3}"], "most_common(1) returns a list with the most frequent element and its count.", 2),
  out("from collections import defaultdict\nd = defaultdict(int)\nd['x'] += 1\nprint(d['x'], d['y'])", ["1 0", "1 None", "Error", "0 0"], "defaultdict(int) gives 0 for missing keys.", 2),
  out("import random\nrandom.seed(1)\na = random.random()\nrandom.seed(1)\nprint(a == random.random())", ["True", "False", "Error", "None"], "Seeding the generator with the same value reproduces the same sequence."),
  m("What does `if __name__ == '__main__':` check?", ["Whether the file is being run directly rather than imported", "Whether the main function exists", "Whether the module is named main", "Whether the program has finished"], "When a file is run as a script, __name__ is '__main__'; when imported, it is the module name."),
  out("from itertools import permutations\nprint(len(list(permutations('abc'))))", ["6", "3", "9", "27"], "There are 3! = 6 orderings of three items."),
  out("import json\nprint(json.dumps({'a': [1, 2]}))", ['{"a": [1, 2]}', "{'a': [1, 2]}", '{"a": "[1, 2]"}', "Error"], "json.dumps uses double quotes as JSON requires.", 2),
  m("Which file marks a directory as a regular Python package (traditionally)?", ["__init__.py", "main.py", "setup.py", "package.json"], "A directory with __init__.py is a regular package (namespace packages may omit it)."),
  out("import datetime\nd = datetime.date(2024, 2, 28) + datetime.timedelta(days=1)\nprint(d)", ["2024-02-29", "2024-03-01", "2024-02-28", "Error"], "2024 is a leap year, so the day after 28 February is 29 February.", 2),
];

const fileHandling: RawQ[] = [
  m("Which mode opens a file for writing and creates it (erasing old contents if it exists)?", ["'w'", "'r'", "'a'", "'x'"], "'w' truncates or creates; 'a' appends; 'x' fails if the file exists."),
  m("What is the main advantage of `with open('f.txt') as f:`?", ["The file is closed automatically, even if an error occurs", "It reads faster", "It locks the file", "It opens in binary mode"], "The with statement uses a context manager that closes the file on exit."),
  out("import io\nf = io.StringIO('line1\\nline2\\n')\nprint(len(f.readlines()))", ["2", "1", "3", "12"], "readlines() returns one string per line.", 2),
  out("import io\nf = io.StringIO('abc')\nprint(f.read(2), f.read())", ["ab c", "ab abc", "abc ", "a bc"], "read(2) reads two characters; the next read continues from there.", 2),
  m("Which method writes a list of strings to a file without adding newlines?", ["writelines()", "write()", "writeline()", "append()"], "writelines() writes each string as-is; add '\\n' yourself."),
  m("What does the 'b' in mode 'rb' mean?", ["Binary mode", "Buffered", "Backup", "Begin at start"], "Binary mode reads bytes instead of text."),
  out("import io\nf = io.StringIO()\nf.write('hi')\nprint(f.getvalue(), f.tell())", ["hi 2", "hi 0", "2 hi", "Error"], "write() returns the count and moves the position to 2; getvalue() returns all contents.", 3),
  m("Which mode opens a file for appending?", ["'a'", "'w'", "'r+'", "'x'"], "'a' writes at the end without erasing existing content."),
];

const builtins: RawQ[] = [
  out("print(abs(-7), pow(2, 5), divmod(17, 5))", ["7 32 (3, 2)", "7 10 (3, 2)", "-7 32 (3, 2)", "7 32 (2, 3)"], "abs gives 7, pow(2, 5) = 32, divmod returns (quotient, remainder)."),
  out("print(sorted([3, 1, 2], reverse=True))", ["[3, 2, 1]", "[1, 2, 3]", "[3, 1, 2]", "None"], "reverse=True sorts in descending order."),
  out("print(list(range(5, 0, -2)))", ["[5, 3, 1]", "[5, 3, 1, -1]", "[1, 3, 5]", "[]"], "Counting down from 5 in steps of 2, stopping before 0."),
  out("print(len({'a': 1, 'b': 2}), len('abc'), len([[]]))", ["2 3 1", "4 3 0", "2 3 0", "2 3 2"], "len counts dict keys, string characters and list items ([[]] has one item)."),
  out("print(ord('A'), chr(98))", ["65 b", "65 B", "97 b", "A 98"], "ord gives the code point; chr gives the character."),
  out("print(list(reversed([1, 2, 3])), max('apple'))", ["[3, 2, 1] p", "[3, 2, 1] a", "[1, 2, 3] p", "[3, 2, 1] e"], "reversed iterates backwards; max of a string is its largest character, 'p'.", 2),
  out("print(round(3.14159, 2), int('101', 2))", ["3.14 5", "3.14 101", "3.1 5", "3 5"], "round to 2 decimals; int with base 2 parses binary."),
  out("print(isinstance(True, int), sum([True, True, False]))", ["True 2", "False 2", "True 3", "False Error"], "bool is a subclass of int (True == 1), so the sum is 2.", 3),
  out("nums = [1, 2, 3]\nprint(id(nums) == id(nums[:]))", ["False", "True", "Error", "None"], "Slicing creates a new list object with a different identity.", 2),
];

const subject: RawSubject = {
  basics: topic(basics, { intro: "Python is an interpreted, dynamically typed language that uses indentation for blocks. Programs are run line by line; names refer to objects and do not need declared types.", formulas: [{ h: "Essentials", points: ["Identifiers: letters, digits and _; cannot start with a digit; case-sensitive; not a keyword", "print(*items, sep=' ', end='\\n')", "input() always returns a str", "Arithmetic: / true division, // floor division, % remainder, ** power (right-associative)"] }] }),
  "data-types": topic(dataTypes, { intro: "Built-in types include int, float, complex, bool, str, list, tuple, range, dict, set, frozenset and NoneType.", formulas: [{ h: "Key points", points: ["Immutable: int, float, str, tuple, frozenset, bool, None", "Mutable: list, dict, set", "{} is an empty dict; use set() for an empty set", "round() uses banker's rounding (round half to even)", "Floats are binary approximations: compare with a tolerance"] }] }),
  operators: topic(operators, { intro: "Python has arithmetic, comparison, logical, bitwise, membership (in) and identity (is) operators.", formulas: [{ h: "Rules", points: ["and/or return one of their operands (short-circuit), not always True/False", "Comparisons chain: a < b < c", "== compares value; is compares identity", "// and % follow floor division: −7 // 2 = −4, −7 % 2 = 1"] }] }),
  strings: topic(strings, { intro: "Strings are immutable sequences of Unicode characters. Index from 0 (or from −1 at the end) and slice with s[start:stop:step].", formulas: [{ h: "Common methods", points: ["upper, lower, title, strip, split, join, replace, find (−1 if absent), index (error if absent), startswith, endswith, count", "f-strings: f'{value:.2f}'", "s[::-1] reverses a string"] }] }),
  lists: topic(lists, { intro: "Lists are ordered, mutable sequences.", formulas: [{ h: "Methods", points: ["append(x) adds one item; extend(iterable) adds each item; insert(i, x)", "pop() removes and returns the last item; remove(x) deletes the first match", "sort() sorts in place and returns None; sorted(list) returns a new list", "a[:] or list(a) makes a shallow copy; b = a only copies the reference"] }] }),
  tuples: topic(tuples, { intro: "Tuples are ordered, immutable sequences, often used for fixed records and as dictionary keys.", formulas: [{ h: "Points", points: ["A one-item tuple needs a comma: (5,)", "Unpacking: a, b = t; extended: a, *rest = t", "Only count() and index() methods"] }] }),
  dictionaries: topic(dictionaries, { intro: "Dictionaries map hashable keys to values and keep insertion order (Python 3.7+).", formulas: [{ h: "Methods", points: ["d[k] raises KeyError for missing keys; d.get(k, default) does not", "keys(), values(), items() return live views", "update(), pop(k), setdefault(k, v)", "Comprehension: {k: v for … in …}"] }] }),
  sets: topic(sets, { intro: "Sets are unordered collections of unique, hashable elements.", formulas: [{ h: "Operations", points: ["a | b union, a & b intersection, a − b difference, a ^ b symmetric difference", "a <= b subset test", "add, remove (error if missing), discard (no error)"] }] }),
  "control-flow": topic(controlFlow, { intro: "Control flow uses if/elif/else, for loops over iterables, while loops, break, continue, pass, loop else and (3.10+) match.", formulas: [{ h: "Points", points: ["range(start, stop, step) excludes stop", "A loop's else runs only if the loop was not ended by break", "x if condition else y is a conditional expression"] }] }),
  functions: topic(functions, { intro: "Functions are defined with def and are first-class objects.", formulas: [{ h: "Arguments and scope", points: ["Default values are evaluated once — avoid mutable defaults", "*args collects positional, **kwargs keyword arguments", "LEGB scope rule: Local, Enclosing, Global, Built-in", "global and nonlocal allow assignment to outer variables"] }] }),
  "lambda-and-functional-tools": topic(lambdaFunctional, { intro: "Python supports a functional style: lambda expressions and higher-order functions such as map, filter, sorted with key, and functools.reduce." }),
  "comprehensions-and-generators": topic(comprehensions, { intro: "Comprehensions build lists, sets and dicts concisely. Generators produce values lazily with yield or generator expressions and can be iterated only once." }),
  "object-oriented-programming": topic(oop, { intro: "Classes bundle data and behaviour. Python supports inheritance, method overriding, operator overloading through special methods and properties.", formulas: [{ h: "Points", points: ["__init__ initialises instances; self refers to the instance", "Class attributes are shared; instance attributes belong to one object", "super() calls the parent class", "__str__, __repr__, __add__, __len__, __eq__ customise behaviour", "@staticmethod, @classmethod and @property decorators", "Names starting with __ are name-mangled"] }] }),
  exceptions: topic(exceptions, { intro: "Exceptions signal errors. Handle them with try/except, run success-only code in else, and clean-up code in finally.", formulas: [{ h: "Common exceptions", points: ["ZeroDivisionError, ValueError, TypeError, KeyError, IndexError, AttributeError, NameError, FileNotFoundError", "Custom exceptions subclass Exception", "finally always runs, even after return"] }] }),
  "modules-and-packages": topic(modules, { intro: "A module is a .py file; a package is a directory of modules. Python's standard library provides math, random, datetime, collections, itertools, json and many more." }),
  "file-handling": topic(fileHandling, { intro: "open(path, mode) returns a file object. Prefer the with statement so files close automatically.", formulas: [{ h: "Modes", points: ["'r' read (default), 'w' write (truncate/create), 'a' append, 'x' create (fail if exists)", "Add 'b' for binary and '+' for read/write", "read(), readline(), readlines(), write(), writelines()"] }] }),
  "built-in-functions": topic(builtins, { intro: "Python ships with built-in functions such as len, range, sorted, reversed, enumerate, zip, map, filter, sum, min, max, abs, round, pow, divmod, ord, chr, isinstance, id and type." }),
};
export default subject;
