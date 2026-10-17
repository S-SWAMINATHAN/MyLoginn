"""LogiQuest answer checker. Reads a JSON list of {i, kind, code, answer} on stdin, prints a JSON list of failures.
kind "expr": the numeric value of the Python expression must equal the first number in the answer text.
kind "py":   the stdout of the Python program must equal the answer text exactly (after trimming)."""
import json, math, re, subprocess, sys
from fractions import Fraction

NUM = re.compile(r"-?\d+(?:\.\d+)?(?:\s*/\s*\d+)?")


def parse(text):
    m = NUM.search(text.replace(",", ""))
    if not m:
        return None
    return Fraction(m.group(0).replace(" ", ""))


def main():
    items = json.load(sys.stdin)
    bad = []
    env = {"__builtins__": {"abs": abs, "round": round, "sum": sum, "min": min, "max": max, "pow": pow, "range": range, "len": len, "int": int, "float": float},
           "math": math, "Fraction": Fraction, "comb": math.comb, "perm": math.perm, "factorial": math.factorial, "gcd": math.gcd, "lcm": math.lcm, "sqrt": math.sqrt, "log": math.log, "log10": math.log10}
    for it in items:
        try:
            if it["kind"] == "expr":
                value = eval(it["code"], env)
                got = value if isinstance(value, Fraction) else Fraction(value).limit_denominator(10**9)
                want = parse(it["answer"])
                if want is None or abs(got - want) > max(Fraction(1, 100), abs(want) / 2000):
                    bad.append({"i": it["i"], "why": f"expression gives {float(got):.6g}, option says {it['answer']!r}"})
            else:
                r = subprocess.run([sys.executable, "-I", "-c", it["code"]], capture_output=True, text=True, timeout=10)
                out = r.stdout.replace("\r\n", "\n").strip()
                if r.returncode != 0:
                    bad.append({"i": it["i"], "why": f"program failed: {r.stderr.strip().splitlines()[-1] if r.stderr.strip() else r.returncode}"})
                elif out != it["answer"].strip():
                    bad.append({"i": it["i"], "why": f"program prints {out!r}, option says {it['answer']!r}"})
        except Exception as e:  # noqa: BLE001 - report every failure, never crash the whole run
            bad.append({"i": it["i"], "why": f"checker error: {e}"})
    json.dump(bad, sys.stdout)


main()
