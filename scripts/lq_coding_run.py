"""Runs LogiQuest coding reference solutions in one process.
Reads JSON [{"slug", "ref", "inputs": [...]}] on stdin and prints JSON {slug: [{"output"} | {"error"}]}.
Each run gets a fresh globals dict, its own stdin/stdout, and a time limit."""
import io, json, signal, sys, threading, traceback

LIMIT = 20  # seconds per run


def run(ref, data):
    out = io.StringIO()
    old_in, old_out = sys.stdin, sys.stdout
    sys.stdin, sys.stdout = io.StringIO(data + "\n"), out
    error = None
    try:
        exec(compile(ref, "<ref>", "exec"), {"__name__": "__main__"})
    except SystemExit:
        pass
    except BaseException:  # noqa: BLE001 - report any failure of the reference
        error = traceback.format_exc().strip().splitlines()[-1]
    finally:
        sys.stdin, sys.stdout = old_in, old_out
    return out.getvalue(), error


def main():
    items = json.load(sys.stdin)
    result = {}
    sys.setrecursionlimit(20000)
    threading.stack_size(64 * 1024 * 1024)
    for it in items:
        runs = []
        for data in it["inputs"]:
            box = {}
            t = threading.Thread(target=lambda: box.update(r=run(it["ref"], data)), daemon=True)
            t.start()
            t.join(LIMIT)
            if t.is_alive():
                runs.append({"error": f"timed out after {LIMIT}s"})
                continue
            output, error = box["r"]
            runs.append({"error": error} if error else {"output": output})
        result[it["slug"]] = runs
    sys.stdout.write(json.dumps(result))


main()
