"""
Tamil → Latin transliteration for NAME NUMEROLOGY.

Name numerology (Chaldean) works on English letters. A name typed in Tamil
(e.g. குருபிரசாத்) used to total 0 because no Latin letter was found. This
converts it to the common Tamil-English spelling (Guruprasath → KURUPIRACAT
style is avoided; we use the usual spellings: க=K, ச=S, ட=D, த=TH, ப=P, ற=R,
ழ=ZH, ள=L, ன=N, ஞ=GN, ங=NG, ஜ=J, ஷ=SH, ஸ=S, ஹ=H, ஶ்ரீ=SRI) so the total
matches how the same name is written in English.
"""
from __future__ import annotations

CONS = {"க": "k", "ங": "ng", "ச": "s", "ஞ": "gn", "ட": "d", "ண": "n", "த": "th", "ந": "n", "ப": "p", "ம": "m",
        "ய": "y", "ர": "r", "ல": "l", "வ": "v", "ழ": "zh", "ள": "l", "ற": "r", "ன": "n", "ஜ": "j", "ஷ": "sh",
        "ஸ": "s", "ஹ": "h", "க்ஷ": "ksh"}
VOWELS = {"அ": "a", "ஆ": "aa", "இ": "i", "ஈ": "ee", "உ": "u", "ஊ": "oo", "எ": "e", "ஏ": "e", "ஐ": "ai",
          "ஒ": "o", "ஓ": "o", "ஔ": "au"}
SIGNS = {"ா": "aa", "ி": "i", "ீ": "ee", "ு": "u", "ூ": "oo", "ெ": "e", "ே": "e", "ை": "ai", "ொ": "o", "ோ": "o", "ௌ": "au"}
VIRAMA = "்"


def tamil_to_latin(text: str) -> str:
    s = (text or "").replace("ஸ்ரீ", "sri")
    out, i = [], 0
    while i < len(s):
        ch = s[i]
        if ch in VOWELS:
            out.append(VOWELS[ch]); i += 1; continue
        if ch in CONS:
            base = CONS[ch]
            nxt = s[i + 1] if i + 1 < len(s) else ""
            if nxt == VIRAMA:
                out.append(base); i += 2; continue
            if nxt in SIGNS:
                out.append(base + SIGNS[nxt]); i += 2; continue
            out.append(base + "a"); i += 1; continue
        out.append(ch if ch.isascii() else " "); i += 1
    return " ".join("".join(out).split())


def has_latin(text: str) -> bool:
    return any("a" <= c.lower() <= "z" for c in (text or ""))
