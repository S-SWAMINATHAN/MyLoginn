"""
Pancha Pakshi Shastra — Kalai Magal parity (Phase 6).

Tables for the 5 birds (Vulture, Owl, Crow, Cock, Peacock) in the waxing (shukla)
and waning (krishna) halves, taken from the Kalai Magal Type D reports REF-001 and
T001–T08 (every bird except the Peacock appears as a birth bird). The Peacock rows
are derived, not guessed: in every yama the five birds perform five different
activities (verified on all 140 cells of the four known birds), so the Peacock
has the one remaining activity; its colour, direction, name letters and padu days
are likewise the one value left over among the five birds.

Birth bird (standard): shukla — stars 1–5 Vulture, 6–11 Owl, 12–16 Crow,
17–21 Cock, 22–27 Peacock; krishna — 1–5 Peacock, 6–11 Cock, 12–16 Crow,
17–21 Owl, 22–27 Vulture (9/9 reports).

Yamas start at a fixed 06:00 and last 2 h 24 m (5 day + 5 night), as Kalai prints.

Detailed "2+21 page" sub-periods (T01, 500 rows, all reproduced):
  • The sub-periods follow an activity cycle that starts at the birth bird's
    activity; each sub-period is labelled with the bird doing that activity
    in that yama.
  • Cycle and minutes per activity depend on paksha and day/night (CYCLE, MINUTES).
  • Result = RESULTS[(main activity, sub activity, relation)], relation of the
    sub-period bird to the birth bird (Self / Friend / Enemy) using the friend
    list of the BIRTH paksha in both halves (as Kalai prints).
  • Ruling (athikara) days for krishna Cock/Peacock follow the detailed pages;
    Kalai's 2-page summary prints the shukla values there.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

BIRDS = ["Vulture", "Owl", "Crow", "Cock", "Peacock"]
BIRD_TA = {"Vulture": "வல்லூறு", "Owl": "ஆந்தை", "Crow": "காகம்", "Cock": "கோழி", "Peacock": "மயில்"}
ACTS = ["Eat", "Walk", "Rule", "Sleep", "Death"]
ACT_TA = {"Eat": "ஊண்", "Walk": "நடை", "Rule": "அரசு", "Sleep": "துயில்", "Death": "சாவு"}
DAY_TA = ["ஞாயிறு", "திங்கள்", "செவ்வாய்", "புதன்", "வியாழன்", "வெள்ளி", "சனி"]
DAY_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
COLOUR_TA = {"Yellow": "மஞ்சள்", "White": "வெள்ளை", "Red": "சிகப்பு", "Green": "பச்சை", "Black": "கருமை"}
DIR_TA = {"East": "கிழக்கு", "South": "தெற்கு", "West": "மேற்கு", "North": "வடக்கு", "Centre": "நடு"}
RESULT_TA = {"Very Good": "மிக நன்று", "Good": "நன்று", "Medium": "மத்திமம்", "Bad": "தீது", "Very Bad": "மிகத் தீது"}
YAMA_STARTS = ["06:00", "08:24", "10:48", "13:12", "15:36"]

TABLES: Dict[str, Dict[str, Any]] = {
 "Vulture|shukla": {
  "padu": [
   4,
   6
  ],
  "letters": "அ ஆ ஐ ஒள",
  "colour": "Yellow",
  "direction": "East",
  "rule_day": [
   0,
   2
  ],
  "rule_night": [
   5
  ],
  "friends": [
   "Peacock",
   "Owl"
  ],
  "enemies": [
   "Crow",
   "Cock"
  ],
  "grid": [
   [
    "Eat",
    "Walk",
    "Rule",
    "Sleep",
    "Death",
    "Death",
    "Walk",
    "Sleep",
    "Eat",
    "Rule"
   ],
   [
    "Death",
    "Eat",
    "Walk",
    "Rule",
    "Sleep",
    "Walk",
    "Sleep",
    "Eat",
    "Rule",
    "Death"
   ],
   [
    "Eat",
    "Walk",
    "Rule",
    "Sleep",
    "Death",
    "Death",
    "Walk",
    "Sleep",
    "Eat",
    "Rule"
   ],
   [
    "Death",
    "Eat",
    "Walk",
    "Rule",
    "Sleep",
    "Walk",
    "Sleep",
    "Eat",
    "Rule",
    "Death"
   ],
   [
    "Sleep",
    "Death",
    "Eat",
    "Walk",
    "Rule",
    "Sleep",
    "Eat",
    "Rule",
    "Death",
    "Walk"
   ],
   [
    "Rule",
    "Sleep",
    "Death",
    "Eat",
    "Walk",
    "Eat",
    "Rule",
    "Death",
    "Walk",
    "Sleep"
   ],
   [
    "Walk",
    "Rule",
    "Sleep",
    "Death",
    "Eat",
    "Rule",
    "Death",
    "Walk",
    "Sleep",
    "Eat"
   ]
  ],
  "derived": False
 },
 "Owl|shukla": {
  "padu": [
   0,
   5
  ],
  "letters": "இ ஈ",
  "colour": "White",
  "direction": "South",
  "rule_day": [
   1,
   3
  ],
  "rule_night": [
   6
  ],
  "friends": [
   "Vulture",
   "Crow"
  ],
  "enemies": [
   "Peacock",
   "Cock"
  ],
  "grid": [
   [
    "Walk",
    "Rule",
    "Sleep",
    "Death",
    "Eat",
    "Rule",
    "Death",
    "Walk",
    "Sleep",
    "Eat"
   ],
   [
    "Eat",
    "Walk",
    "Rule",
    "Sleep",
    "Death",
    "Death",
    "Walk",
    "Sleep",
    "Eat",
    "Rule"
   ],
   [
    "Walk",
    "Rule",
    "Sleep",
    "Death",
    "Eat",
    "Rule",
    "Death",
    "Walk",
    "Sleep",
    "Eat"
   ],
   [
    "Eat",
    "Walk",
    "Rule",
    "Sleep",
    "Death",
    "Death",
    "Walk",
    "Sleep",
    "Eat",
    "Rule"
   ],
   [
    "Death",
    "Eat",
    "Walk",
    "Rule",
    "Sleep",
    "Walk",
    "Sleep",
    "Eat",
    "Rule",
    "Death"
   ],
   [
    "Sleep",
    "Death",
    "Eat",
    "Walk",
    "Rule",
    "Sleep",
    "Eat",
    "Rule",
    "Death",
    "Walk"
   ],
   [
    "Rule",
    "Sleep",
    "Death",
    "Eat",
    "Walk",
    "Eat",
    "Rule",
    "Death",
    "Walk",
    "Sleep"
   ]
  ],
  "derived": False
 },
 "Crow|shukla": {
  "padu": [
   1
  ],
  "letters": "உ ஊ",
  "colour": "Red",
  "direction": "West",
  "rule_day": [
   4
  ],
  "rule_night": [
   0,
   2
  ],
  "friends": [
   "Owl",
   "Cock"
  ],
  "enemies": [
   "Vulture",
   "Peacock"
  ],
  "grid": [
   [
    "Rule",
    "Sleep",
    "Death",
    "Eat",
    "Walk",
    "Eat",
    "Rule",
    "Death",
    "Walk",
    "Sleep"
   ],
   [
    "Walk",
    "Rule",
    "Sleep",
    "Death",
    "Eat",
    "Rule",
    "Death",
    "Walk",
    "Sleep",
    "Eat"
   ],
   [
    "Rule",
    "Sleep",
    "Death",
    "Eat",
    "Walk",
    "Eat",
    "Rule",
    "Death",
    "Walk",
    "Sleep"
   ],
   [
    "Walk",
    "Rule",
    "Sleep",
    "Death",
    "Eat",
    "Rule",
    "Death",
    "Walk",
    "Sleep",
    "Eat"
   ],
   [
    "Eat",
    "Walk",
    "Rule",
    "Sleep",
    "Death",
    "Death",
    "Walk",
    "Sleep",
    "Eat",
    "Rule"
   ],
   [
    "Death",
    "Eat",
    "Walk",
    "Rule",
    "Sleep",
    "Walk",
    "Sleep",
    "Eat",
    "Rule",
    "Death"
   ],
   [
    "Sleep",
    "Death",
    "Eat",
    "Walk",
    "Rule",
    "Sleep",
    "Eat",
    "Rule",
    "Death",
    "Walk"
   ]
  ],
  "derived": False
 },
 "Cock|shukla": {
  "padu": [
   2
  ],
  "letters": "எ ஏ",
  "colour": "Green",
  "direction": "North",
  "rule_day": [
   5
  ],
  "rule_night": [
   1,
   3
  ],
  "friends": [
   "Peacock",
   "Crow"
  ],
  "enemies": [
   "Vulture",
   "Owl"
  ],
  "grid": [
   [
    "Sleep",
    "Death",
    "Eat",
    "Walk",
    "Rule",
    "Sleep",
    "Eat",
    "Rule",
    "Death",
    "Walk"
   ],
   [
    "Rule",
    "Sleep",
    "Death",
    "Eat",
    "Walk",
    "Eat",
    "Rule",
    "Death",
    "Walk",
    "Sleep"
   ],
   [
    "Sleep",
    "Death",
    "Eat",
    "Walk",
    "Rule",
    "Sleep",
    "Eat",
    "Rule",
    "Death",
    "Walk"
   ],
   [
    "Rule",
    "Sleep",
    "Death",
    "Eat",
    "Walk",
    "Eat",
    "Rule",
    "Death",
    "Walk",
    "Sleep"
   ],
   [
    "Walk",
    "Rule",
    "Sleep",
    "Death",
    "Eat",
    "Rule",
    "Death",
    "Walk",
    "Sleep",
    "Eat"
   ],
   [
    "Eat",
    "Walk",
    "Rule",
    "Sleep",
    "Death",
    "Death",
    "Walk",
    "Sleep",
    "Eat",
    "Rule"
   ],
   [
    "Death",
    "Eat",
    "Walk",
    "Rule",
    "Sleep",
    "Walk",
    "Sleep",
    "Eat",
    "Rule",
    "Death"
   ]
  ],
  "derived": False
 },
 "Peacock|shukla": {
  "padu": [
   3
  ],
  "letters": "ஒ ஓ",
  "colour": "Black",
  "direction": "Centre",
  "rule_day": [
   6
  ],
  "rule_night": [
   4
  ],
  "friends": [
   "Vulture",
   "Cock"
  ],
  "enemies": [
   "Owl",
   "Crow"
  ],
  "grid": [
   [
    "Death",
    "Eat",
    "Walk",
    "Rule",
    "Sleep",
    "Walk",
    "Sleep",
    "Eat",
    "Rule",
    "Death"
   ],
   [
    "Sleep",
    "Death",
    "Eat",
    "Walk",
    "Rule",
    "Sleep",
    "Eat",
    "Rule",
    "Death",
    "Walk"
   ],
   [
    "Death",
    "Eat",
    "Walk",
    "Rule",
    "Sleep",
    "Walk",
    "Sleep",
    "Eat",
    "Rule",
    "Death"
   ],
   [
    "Sleep",
    "Death",
    "Eat",
    "Walk",
    "Rule",
    "Sleep",
    "Eat",
    "Rule",
    "Death",
    "Walk"
   ],
   [
    "Rule",
    "Sleep",
    "Death",
    "Eat",
    "Walk",
    "Eat",
    "Rule",
    "Death",
    "Walk",
    "Sleep"
   ],
   [
    "Walk",
    "Rule",
    "Sleep",
    "Death",
    "Eat",
    "Rule",
    "Death",
    "Walk",
    "Sleep",
    "Eat"
   ],
   [
    "Eat",
    "Walk",
    "Rule",
    "Sleep",
    "Death",
    "Death",
    "Walk",
    "Sleep",
    "Eat",
    "Rule"
   ]
  ],
  "derived": True
 },
 "Vulture|krishna": {
  "padu": [
   2
  ],
  "letters": "இ ஈ",
  "colour": "Black",
  "direction": "East",
  "rule_day": [
   5
  ],
  "rule_night": [
   0,
   2
  ],
  "friends": [
   "Peacock",
   "Crow"
  ],
  "enemies": [
   "Owl",
   "Cock"
  ],
  "grid": [
   [
    "Walk",
    "Eat",
    "Death",
    "Sleep",
    "Rule",
    "Eat",
    "Sleep",
    "Walk",
    "Death",
    "Rule"
   ],
   [
    "Sleep",
    "Rule",
    "Walk",
    "Eat",
    "Death",
    "Death",
    "Rule",
    "Eat",
    "Sleep",
    "Walk"
   ],
   [
    "Walk",
    "Eat",
    "Death",
    "Sleep",
    "Rule",
    "Eat",
    "Sleep",
    "Walk",
    "Death",
    "Rule"
   ],
   [
    "Death",
    "Sleep",
    "Rule",
    "Walk",
    "Eat",
    "Sleep",
    "Walk",
    "Death",
    "Rule",
    "Eat"
   ],
   [
    "Rule",
    "Walk",
    "Eat",
    "Death",
    "Sleep",
    "Walk",
    "Death",
    "Rule",
    "Eat",
    "Sleep"
   ],
   [
    "Eat",
    "Death",
    "Sleep",
    "Rule",
    "Walk",
    "Rule",
    "Eat",
    "Sleep",
    "Walk",
    "Death"
   ],
   [
    "Sleep",
    "Rule",
    "Walk",
    "Eat",
    "Death",
    "Death",
    "Rule",
    "Eat",
    "Sleep",
    "Walk"
   ]
  ],
  "derived": False
 },
 "Owl|krishna": {
  "padu": [
   1
  ],
  "letters": "உ ஊ",
  "colour": "Red",
  "direction": "North",
  "rule_day": [
   4
  ],
  "rule_night": [
   3
  ],
  "friends": [
   "Cock",
   "Crow"
  ],
  "enemies": [
   "Vulture",
   "Peacock"
  ],
  "grid": [
   [
    "Death",
    "Sleep",
    "Rule",
    "Walk",
    "Eat",
    "Rule",
    "Eat",
    "Sleep",
    "Walk",
    "Death"
   ],
   [
    "Walk",
    "Eat",
    "Death",
    "Sleep",
    "Rule",
    "Walk",
    "Death",
    "Rule",
    "Eat",
    "Sleep"
   ],
   [
    "Death",
    "Sleep",
    "Rule",
    "Walk",
    "Eat",
    "Rule",
    "Eat",
    "Sleep",
    "Walk",
    "Death"
   ],
   [
    "Rule",
    "Walk",
    "Eat",
    "Death",
    "Sleep",
    "Eat",
    "Sleep",
    "Walk",
    "Death",
    "Rule"
   ],
   [
    "Eat",
    "Death",
    "Sleep",
    "Rule",
    "Walk",
    "Sleep",
    "Walk",
    "Death",
    "Rule",
    "Eat"
   ],
   [
    "Sleep",
    "Rule",
    "Walk",
    "Eat",
    "Death",
    "Death",
    "Rule",
    "Eat",
    "Sleep",
    "Walk"
   ],
   [
    "Walk",
    "Eat",
    "Death",
    "Sleep",
    "Rule",
    "Walk",
    "Death",
    "Rule",
    "Eat",
    "Sleep"
   ]
  ],
  "derived": False
 },
 "Crow|krishna": {
  "padu": [
   0
  ],
  "letters": "ஒ ஓ",
  "colour": "Yellow",
  "direction": "South",
  "rule_day": [
   3
  ],
  "rule_night": [
   4
  ],
  "friends": [
   "Owl",
   "Vulture"
  ],
  "enemies": [
   "Peacock",
   "Cock"
  ],
  "grid": [
   [
    "Rule",
    "Walk",
    "Eat",
    "Death",
    "Sleep",
    "Death",
    "Rule",
    "Eat",
    "Sleep",
    "Walk"
   ],
   [
    "Death",
    "Sleep",
    "Rule",
    "Walk",
    "Eat",
    "Sleep",
    "Walk",
    "Death",
    "Rule",
    "Eat"
   ],
   [
    "Rule",
    "Walk",
    "Eat",
    "Death",
    "Sleep",
    "Death",
    "Rule",
    "Eat",
    "Sleep",
    "Walk"
   ],
   [
    "Eat",
    "Death",
    "Sleep",
    "Rule",
    "Walk",
    "Rule",
    "Eat",
    "Sleep",
    "Walk",
    "Death"
   ],
   [
    "Sleep",
    "Rule",
    "Walk",
    "Eat",
    "Death",
    "Eat",
    "Sleep",
    "Walk",
    "Death",
    "Rule"
   ],
   [
    "Walk",
    "Eat",
    "Death",
    "Sleep",
    "Rule",
    "Walk",
    "Death",
    "Rule",
    "Eat",
    "Sleep"
   ],
   [
    "Death",
    "Sleep",
    "Rule",
    "Walk",
    "Eat",
    "Sleep",
    "Walk",
    "Death",
    "Rule",
    "Eat"
   ]
  ],
  "derived": False
 },
 "Cock|krishna": {
  "padu": [
   4,
   6
  ],
  "letters": "அ ஆ ஐ ஒள",
  "colour": "White",
  "direction": "Centre",
  "rule_day": [
   0,
   2
  ],
  "rule_night": [
   1,
   6
  ],
  "friends": [
   "Peacock",
   "Owl"
  ],
  "enemies": [
   "Crow",
   "Vulture"
  ],
  "grid": [
   [
    "Eat",
    "Death",
    "Sleep",
    "Rule",
    "Walk",
    "Walk",
    "Death",
    "Rule",
    "Eat",
    "Sleep"
   ],
   [
    "Rule",
    "Walk",
    "Eat",
    "Death",
    "Sleep",
    "Eat",
    "Sleep",
    "Walk",
    "Death",
    "Rule"
   ],
   [
    "Eat",
    "Death",
    "Sleep",
    "Rule",
    "Walk",
    "Walk",
    "Death",
    "Rule",
    "Eat",
    "Sleep"
   ],
   [
    "Sleep",
    "Rule",
    "Walk",
    "Eat",
    "Death",
    "Death",
    "Rule",
    "Eat",
    "Sleep",
    "Walk"
   ],
   [
    "Walk",
    "Eat",
    "Death",
    "Sleep",
    "Rule",
    "Rule",
    "Eat",
    "Sleep",
    "Walk",
    "Death"
   ],
   [
    "Death",
    "Sleep",
    "Rule",
    "Walk",
    "Eat",
    "Sleep",
    "Walk",
    "Death",
    "Rule",
    "Eat"
   ],
   [
    "Rule",
    "Walk",
    "Eat",
    "Death",
    "Sleep",
    "Eat",
    "Sleep",
    "Walk",
    "Death",
    "Rule"
   ]
  ],
  "derived": False
 },
 "Peacock|krishna": {
  "padu": [
   3,
   5
  ],
  "letters": "எ ஏ",
  "colour": "Green",
  "direction": "West",
  "rule_day": [
   1,
   6
  ],
  "rule_night": [
   5
  ],
  "friends": [
   "Vulture",
   "Cock"
  ],
  "enemies": [
   "Owl",
   "Crow"
  ],
  "grid": [
   [
    "Sleep",
    "Rule",
    "Walk",
    "Eat",
    "Death",
    "Sleep",
    "Walk",
    "Death",
    "Rule",
    "Eat"
   ],
   [
    "Eat",
    "Death",
    "Sleep",
    "Rule",
    "Walk",
    "Rule",
    "Eat",
    "Sleep",
    "Walk",
    "Death"
   ],
   [
    "Sleep",
    "Rule",
    "Walk",
    "Eat",
    "Death",
    "Sleep",
    "Walk",
    "Death",
    "Rule",
    "Eat"
   ],
   [
    "Walk",
    "Eat",
    "Death",
    "Sleep",
    "Rule",
    "Walk",
    "Death",
    "Rule",
    "Eat",
    "Sleep"
   ],
   [
    "Death",
    "Sleep",
    "Rule",
    "Walk",
    "Eat",
    "Death",
    "Rule",
    "Eat",
    "Sleep",
    "Walk"
   ],
   [
    "Rule",
    "Walk",
    "Eat",
    "Death",
    "Sleep",
    "Eat",
    "Sleep",
    "Walk",
    "Death",
    "Rule"
   ],
   [
    "Eat",
    "Death",
    "Sleep",
    "Rule",
    "Walk",
    "Rule",
    "Eat",
    "Sleep",
    "Walk",
    "Death"
   ]
  ],
  "derived": True
 }
}

RESULTS: Dict[str, str] = {
 "Eat|Eat|Self": "Good",
 "Eat|Walk|Friend": "Good",
 "Eat|Rule|Enemy": "Good",
 "Eat|Sleep|Enemy": "Medium",
 "Eat|Death|Friend": "Medium",
 "Walk|Walk|Self": "Medium",
 "Walk|Rule|Friend": "Good",
 "Walk|Sleep|Enemy": "Medium",
 "Walk|Death|Enemy": "Very Bad",
 "Walk|Eat|Friend": "Good",
 "Rule|Rule|Self": "Very Good",
 "Rule|Sleep|Friend": "Medium",
 "Rule|Death|Enemy": "Bad",
 "Rule|Eat|Enemy": "Good",
 "Rule|Walk|Friend": "Good",
 "Sleep|Sleep|Self": "Bad",
 "Sleep|Death|Friend": "Very Bad",
 "Sleep|Eat|Enemy": "Medium",
 "Sleep|Walk|Enemy": "Medium",
 "Sleep|Rule|Friend": "Medium",
 "Death|Death|Self": "Very Bad",
 "Death|Eat|Friend": "Medium",
 "Death|Walk|Enemy": "Very Bad",
 "Death|Rule|Enemy": "Bad",
 "Death|Sleep|Friend": "Very Bad",
 "Death|Walk|Friend": "Bad",
 "Death|Sleep|Enemy": "Very Bad",
 "Death|Eat|Enemy": "Bad",
 "Death|Rule|Friend": "Medium",
 "Walk|Sleep|Friend": "Medium",
 "Walk|Eat|Enemy": "Medium",
 "Walk|Rule|Enemy": "Medium",
 "Walk|Death|Friend": "Bad",
 "Sleep|Eat|Friend": "Medium",
 "Sleep|Rule|Enemy": "Medium",
 "Sleep|Death|Enemy": "Very Bad",
 "Sleep|Walk|Friend": "Medium",
 "Eat|Rule|Friend": "Very Good",
 "Eat|Death|Enemy": "Bad",
 "Eat|Walk|Enemy": "Medium",
 "Eat|Sleep|Friend": "Medium",
 "Rule|Death|Friend": "Medium",
 "Rule|Walk|Enemy": "Medium",
 "Rule|Sleep|Enemy": "Medium",
 "Rule|Eat|Friend": "Very Good"
}

# next activity in the sub-period cycle and minutes per activity
CYCLE = {
    ("shukla", "day"): {"Eat": "Walk", "Walk": "Rule", "Rule": "Sleep", "Sleep": "Death", "Death": "Eat"},
    ("shukla", "night"): {"Eat": "Rule", "Walk": "Sleep", "Rule": "Death", "Sleep": "Eat", "Death": "Walk"},
    ("krishna", "day"): {"Eat": "Death", "Walk": "Eat", "Rule": "Walk", "Sleep": "Rule", "Death": "Sleep"},
    ("krishna", "night"): {"Eat": "Sleep", "Walk": "Death", "Rule": "Eat", "Sleep": "Walk", "Death": "Rule"},
}
MINUTES = {
    ("shukla", "day"): {"Eat": 30, "Walk": 36, "Rule": 48, "Sleep": 18, "Death": 12},
    ("shukla", "night"): {"Eat": 30, "Walk": 30, "Rule": 24, "Sleep": 24, "Death": 36},
    ("krishna", "day"): {"Eat": 48, "Walk": 36, "Rule": 18, "Sleep": 12, "Death": 30},
    ("krishna", "night"): {"Eat": 42, "Walk": 42, "Rule": 18, "Sleep": 18, "Death": 24},
}


def birth_bird(nakshatra: int, shukla: bool) -> str:
    grp = 0 if nakshatra <= 5 else 1 if nakshatra <= 11 else 2 if nakshatra <= 16 else 3 if nakshatra <= 21 else 4
    return (BIRDS if shukla else ["Peacock", "Cock", "Crow", "Owl", "Vulture"])[grp]


def _t(bird: str, paksha: str) -> Dict[str, Any]:
    return TABLES[f"{bird}|{paksha}"]


def activity(bird: str, paksha: str, weekday: int, slot: int) -> str:
    """weekday 0=Sunday; slot 0-4 day yamas, 5-9 night yamas."""
    return _t(bird, paksha)["grid"][weekday][slot]


def relation(birth: str, other: str, paksha: str) -> str:
    if other == birth:
        return "Self"
    return "Friend" if other in _t(birth, paksha)["friends"] else "Enemy"


def summary(bird: str, paksha: str) -> Dict[str, Any]:
    t = _t(bird, paksha)
    return {
        "bird": bird, "bird_ta": BIRD_TA[bird], "paksha": paksha,
        "padu_days": [DAY_EN[d] for d in t["padu"]], "padu_days_ta": [DAY_TA[d] for d in t["padu"]],
        "letters": t["letters"], "colour": t["colour"], "colour_ta": COLOUR_TA[t["colour"]],
        "direction": t["direction"], "direction_ta": DIR_TA[t["direction"]],
        "ruling_day": [DAY_EN[d] for d in t["rule_day"]], "ruling_day_ta": [DAY_TA[d] for d in t["rule_day"]],
        "ruling_night": [DAY_EN[d] for d in t["rule_night"]], "ruling_night_ta": [DAY_TA[d] for d in t["rule_night"]],
        "friends": t["friends"], "friends_ta": [BIRD_TA[b] for b in t["friends"]],
        "enemies": t["enemies"], "enemies_ta": [BIRD_TA[b] for b in t["enemies"]],
        "grid": [{"day": DAY_EN[d], "day_ta": DAY_TA[d], "activities": t["grid"][d],
                  "activities_ta": [ACT_TA[a] for a in t["grid"][d]]} for d in range(7)],
        "derived": t["derived"],
    }


def _hm(minutes: int) -> str:
    m = minutes % 1440
    return f"{m // 60:02d}:{m % 60:02d}"


def _ruling_bird(paksha: str, weekday: int, night: bool) -> Optional[str]:
    key = "rule_night" if night else "rule_day"
    for b in BIRDS:
        if weekday in (_t(b, paksha)[key] or []):
            return b
    return None


def _padu_bird(paksha: str, weekday: int) -> Optional[str]:
    for b in BIRDS:
        if weekday in _t(b, paksha)["padu"]:
            return b
    return None


def detailed(bird: str, paksha: str, birth_paksha: Optional[str] = None) -> List[Dict[str, Any]]:
    """Kalai's "2+21 pages": for each weekday group and day/night, 5 yamas × 5 sub-periods."""
    groups: List[List[int]] = []
    for d in range(7):
        row = _t(bird, paksha)["grid"][d]
        for g in groups:
            if _t(bird, paksha)["grid"][g[0]] == row:
                g.append(d)
                break
        else:
            groups.append([d])
    pages = []
    for g in groups:
        for night in (False, True):
            dn = "night" if night else "day"
            yamas = []
            for y in range(5):
                slot = y + (5 if night else 0)
                start = 6 * 60 + (12 * 60 if night else 0) + y * 144
                main = activity(bird, paksha, g[0], slot)
                who = {activity(b, paksha, g[0], slot): b for b in BIRDS}
                subs, a, t0 = [], main, start
                for _ in range(5):
                    b = who[a]
                    rel = relation(bird, b, birth_paksha or paksha)  # Kalai: friends of the BIRTH paksha
                    mins = MINUTES[(paksha, dn)][a]
                    res = RESULTS.get(f"{main}|{a}|{rel}")
                    subs.append({"bird": b, "bird_ta": BIRD_TA[b], "activity": a, "activity_ta": ACT_TA[a],
                                 "start": _hm(t0), "end": _hm(t0 + mins), "relation": rel,
                                 "result": res, "result_ta": RESULT_TA.get(res) if res else None})
                    t0 += mins
                    a = CYCLE[(paksha, dn)][a]
                yamas.append({"yama": y + 1, "start": _hm(start), "end": _hm(start + 144),
                              "activity": main, "activity_ta": ACT_TA[main], "subs": subs})
            pages.append({"paksha": paksha, "weekdays": [DAY_EN[d] for d in g], "weekdays_ta": [DAY_TA[d] for d in g],
                          "part": dn, "ruling_bird": _ruling_bird(paksha, g[0], night),
                          "padu": [{"day": DAY_EN[d], "bird": _padu_bird(paksha, d)} for d in g],
                          "yamas": yamas})
    return pages


def panchapakshi_report(nakshatra: int, shukla: bool, detailed_pages: bool = False) -> Dict[str, Any]:
    bird = birth_bird(nakshatra, shukla)
    out = {"status": "ok", "birth_bird": bird, "birth_bird_ta": BIRD_TA[bird],
           "birth_paksha": "shukla" if shukla else "krishna",
           "yama_starts": YAMA_STARTS,
           "shukla": summary(bird, "shukla"), "krishna": summary(bird, "krishna")}
    if detailed_pages:
        bp = "shukla" if shukla else "krishna"
        out["detailed"] = detailed(bird, "shukla", bp) + detailed(bird, "krishna", bp)
    return out
