"""Reads a JSON list of {i, kind, code, answer} on stdin and prints a JSON list of failures.
kind "expr": numeric value of the Python expression must equal the number/fraction in the answer text.
kind "py":   stdout of the Python program must equal the answer text exactly (after trimming)."""
import json, math, re, subprocess, sys
from fractions import Fraction

NUM = re.compile(r"-?\d+(?:\.\d+)?(?:\s*/\s*\d+)?")


def parse(text):
    t = text.replace(",", "")
    m = NUM.search(t)
    if not m:
        return None
    s = m.group(0).replace(" ", "")
    return Fraction(s) if "/" in s else Fraction(s)


def main():
    items = json.load(sys.stdin)
    bad = []
    env = {"__builtins__": {"abs": abs, "round": round, "sum": sum, "min": min, "max": max, "pow": pow, "range": range, "len": len, "int": int, "float": float}, "math": math, "Fraction": Fraction, "comb": math.comb, "perm": math.perm, "factorial": math.factorial, "gcd": math.gcd, "lcm": math.lcm, "sqrt": math.sqrt}
    for it in items:
        try:
            if it["kind"] == "expr":
                value = eval(it["code"], env)
                got = Fraction(value).limit_denominator(10**9) if not isinstance(value, Fraction) else value
                want = parse(it["answer"])
                if want is None or abs(got - want) > Fraction(1, 10**6):
                    bad.append({"i": it["i"], "why": f"expression gives {float(got):.6g}, option says {it['answer']!r}"})
            else:
                r = subprocess.run([sys.executable, "-I", "-c", it["code"]], capture_output=True, text=True, timeout=10)
                if r.stdout.strip() != it["answer"].strip():
                    bad.append({"i": it["i"], "why": f"program prints {r.stdout.strip()!r}, option says {it['answer']!r}" + (f" (stderr: {r.stderr.strip()[-80:]})" if r.returncode else "")})
        except Exception as e:  # noqa: BLE001
            bad.append({"i": it["i"], "why": f"check failed to run: {e}"})
    print(json.dumps(bad))


main()
