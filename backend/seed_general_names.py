#!/usr/bin/env python3
"""
Seed / migrate the baby_names table for the General Name Generator.

    python -m backend.seed_general_names            # seed + migrate + report
    python -m backend.seed_general_names --csv f.csv  # also import a real CSV

ON "MOCK DATA"
--------------
The brief asked for a mock-data script, and also for no fake names. Those
pull in opposite directions, so this seeds from the 1,002 VERIFIED names
already in the app's banks instead of inventing test rows. Fake rows in a
baby-name product do not stay in testing — they get shipped, printed, and
acted on by a parent.

To grow the table beyond the banks, use --csv with a real dataset. Header:
    syllable,name_english,name_tamil,meaning_english,meaning_tamil,gender,religion
Rows missing syllable or name_english are skipped and counted, never guessed.
"""

import argparse
import sys


def main() -> int:
    parser = argparse.ArgumentParser(description="Seed the baby_names table.")
    parser.add_argument("--csv", help="Path to a real name dataset to import.")
    parser.add_argument("--force", action="store_true",
                        help="Rebuild bank-sourced rows from scratch.")
    args = parser.parse_args()

    try:
        from backend.app.services import name_db
    except ModuleNotFoundError:
        print("Run from the project root, e.g. "
              "`python -m backend.seed_general_names`", file=sys.stderr)
        return 1

    print("1. Creating table / applying migrations …")
    name_db.init_db()

    print("2. Seeding from the verified banks …")
    print("   ", name_db.seed_from_banks(force=args.force))

    if args.csv:
        print(f"3. Importing {args.csv} …")
        print("   ", name_db.import_csv(args.csv))

    stats = name_db.db_stats()
    counts = name_db.letter_counts()
    print("\nTable now holds:")
    print(f"  rows                 : {stats['total_rows']}")
    print(f"  distinct letters     : {len(counts)}")
    print(f"  names per letter     : {dict(sorted(counts.items()))}")
    missing = sorted(set("ABCDEFGHIJKLMNOPQRSTUVWXYZ") - set(counts))
    if missing:
        print(f"  letters with no names: {', '.join(missing)}")
        print("    (Tamil has no native names starting with these sounds —")
        print("     that is the language, not missing data.)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
