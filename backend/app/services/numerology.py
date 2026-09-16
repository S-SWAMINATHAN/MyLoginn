"""
Chaldean Name Numerology Engine.
Governed by AGENTS.md §1 (Non-Hallucination Rules).

=============================================================================
SYSTEM BOUNDARY — READ FIRST
=============================================================================
This module implements CHALDEAN NUMEROLOGY, which is a SEPARATE TRADITION
from the Vedic astrology that powers the rest of this application. It has a
different origin (Babylonian/Chaldean, popularised in the West by Cheiro's
"Book of Numbers") and different rules from Jyotish.

Per AGENTS.md §1.7 ("Never mix regional/systemic conventions silently"),
this module:
  - NEVER touches or alters the Nakshatra-Pada naming logic in
    services/baby_names.py. That file remains 100% classical Vedic.
  - Returns its output under clearly-prefixed `numerology_*` fields so the
    two systems can never be mistaken for one blended result in the UI.

=============================================================================
WHAT IS COMPUTED, AND AT WHAT CONFIDENCE
=============================================================================
1. CHALDEAN LETTER-VALUE CHART (1-8; no letter maps to 9)
   CONFIDENCE: HIGH. This table is reproduced identically across Chaldean
   numerology references. 9 is excluded from the letter chart by design
   (traditionally held as sacred/unassignable) — that exclusion IS the
   standard chart, not an omission.

2. MOOLANK (Birth Number) = single-digit reduction of the DAY of birth.
   CONFIDENCE: HIGH. Universally consistent method.

3. BHAGYANK (Destiny Number) = single-digit reduction of ALL digits of the
   full date of birth.
   CONFIDENCE: HIGH. Universally consistent method.

4. NAMANK (Name Number) = sum of Chaldean letter values of the name,
   reduced to a single digit. The raw (unreduced) total is also returned,
   because Chaldean practice treats the compound total as meaningful.
   CONFIDENCE: HIGH for the summing method.
   DOCUMENTED CHOICE: master numbers (11/22) are NOT preserved; this always
   reduces fully to 1-9, which is the standard Chaldean (as opposed to
   Pythagorean) convention. Flagged rather than silently assumed.

5. NUMBER COMPATIBILITY MATRIX (friend / neutral / enemy between 1-9)
   CONFIDENCE: MEDIUM-HIGH, WITH AN EXPLICIT CAVEAT.
   Compatibility tables DO vary between numerology sources. This is the
   single most source-variable part of the system and must not be presented
   as though it were a fixed astronomical fact.
   The table below was cross-checked against the reference calculator's
   own published outputs and reproduces them exactly:
       Namank 3 <-> Moolank 6  => Friendly   (matches reference)
       Namank 3 <-> Bhagyank 4 => Neutral    (matches reference)
       Namank 3 <-> Bhagyank 7 => Friendly   (matches reference)
   NOTE: this table is NOT derived from Vedic planetary friendship
   (Naisargika Sambandha). Deriving it that way would produce different —
   and, versus the reference, wrong — answers, because Jupiter (3) and
   Venus (6) are classical enemies in Jyotish yet friendly in numerology.
   This divergence is itself evidence that the two systems are distinct,
   and is why they are kept separate throughout this codebase.

=============================================================================
SCOPE LIMIT
=============================================================================
Numerology here operates on the LATIN/ENGLISH spelling of a name only.
Chaldean numerology has no standard Tamil-script letter-value mapping, and
none has been invented. Tamil names are scored via their English spelling.
"""

import re
from typing import Dict, Any, List, Optional

# -----------------------------------------------------------------------------
# 1. Chaldean letter-value chart (HIGH confidence — see module docstring)
# -----------------------------------------------------------------------------
_CHART_GROUPS = {
    1: "AIJQY",
    2: "BKR",
    3: "CGLS",
    4: "DMT",
    5: "EHNX",
    6: "UVW",
    7: "OZ",
    8: "FP",
}
_CHALDEAN_CHART: Dict[str, int] = {}
for _value, _letters in _CHART_GROUPS.items():
    for _ch in _letters:
        _CHALDEAN_CHART[_ch] = _value

# -----------------------------------------------------------------------------
# 2. Number -> ruling planet (used for descriptive text only, NOT for the
#    compatibility matrix — see docstring point 5 for why).
# -----------------------------------------------------------------------------
_NUMBER_PLANET = {
    1: {"en": "Sun",     "ta": "சூரியன்"},
    2: {"en": "Moon",    "ta": "சந்திரன்"},
    3: {"en": "Jupiter", "ta": "குரு"},
    4: {"en": "Rahu",    "ta": "ராகு"},
    5: {"en": "Mercury", "ta": "புதன்"},
    6: {"en": "Venus",   "ta": "சுக்கிரன்"},
    7: {"en": "Ketu",    "ta": "கேது"},
    8: {"en": "Saturn",  "ta": "சனி"},
    9: {"en": "Mars",    "ta": "செவ்வாய்"},
}

# -----------------------------------------------------------------------------
# 3. Compatibility matrix (MEDIUM-HIGH confidence — validated against the
#    reference calculator; see docstring point 5).
# -----------------------------------------------------------------------------
_FRIENDLY: Dict[int, set] = {
    1: {1, 2, 3, 5, 9},
    2: {1, 2, 3, 5, 7},
    3: {1, 2, 3, 5, 6, 7, 9},
    4: {1, 5, 6, 7, 8},
    5: {1, 2, 3, 5, 6, 9},
    6: {3, 5, 6, 7, 8},
    7: {2, 3, 4, 6, 7},
    8: {4, 6, 8},
    9: {1, 2, 3, 5, 9},
}
_ENEMY: Dict[int, set] = {
    1: {6, 8},
    2: {8},
    3: {8},
    4: {2, 9},
    5: set(),
    6: {1, 4},
    7: {8},
    8: {1, 3, 5, 9},
    9: {4, 8},
}

# -----------------------------------------------------------------------------
# 4. Personality descriptions per Moolank (Birth Number).
#    These are the standard published trait-sets for each Chaldean birth
#    number. They describe the NUMBER, not a prediction about the person's
#    future — no event, date, or outcome is ever asserted.
# -----------------------------------------------------------------------------
_MOOLANK_PERSONALITY = {
    1: {
        "en": "You are independent, self-driven, and naturally take the lead. Ruled by the Sun, you carry authority and originality. At times rigidity or ego can create friction, but your determination generally carries you through.",
        "ta": "நீங்கள் சுயசார்புடையவர், தன்னம்பிக்கை மிக்கவர், இயல்பாகவே தலைமை ஏற்பவர். சூரியனின் ஆட்சியால் அதிகாரமும் புதுமையும் கொண்டவர். சில சமயங்களில் பிடிவாதம் அல்லது தன்முனைப்பு சிக்கல் தரலாம், ஆனால் உங்கள் உறுதி உங்களை வெற்றி பெறச் செய்யும்.",
    },
    2: {
        "en": "You are sensitive, intuitive, and cooperative. Ruled by the Moon, you read people well and prefer harmony over confrontation. Emotional fluctuation and indecision are the areas to watch.",
        "ta": "நீங்கள் உணர்வுப்பூர்வமானவர், உள்ளுணர்வு மிக்கவர், ஒத்துழைப்பு உள்ளவர். சந்திரனின் ஆட்சியால் மற்றவர்களை நன்கு புரிந்துகொள்வீர்கள், மோதலைவிட இணக்கத்தை விரும்புவீர்கள். மனநிலை மாற்றமும் முடிவெடுக்க தயக்கமும் கவனிக்க வேண்டியவை.",
    },
    3: {
        "en": "You are expressive, optimistic, and knowledge-oriented. Ruled by Jupiter, you carry wisdom, teaching ability, and a naturally positive outlook. Scattering energy across too many interests is the main caution.",
        "ta": "நீங்கள் கருத்தை வெளிப்படுத்தும் திறன் உள்ளவர், நம்பிக்கையாளர், அறிவு நாட்டம் கொண்டவர். குருவின் ஆட்சியால் ஞானமும் கற்பிக்கும் திறனும் நேர்மறை பார்வையும் உண்டு. பல ஆர்வங்களில் சக்தியை சிதறடிப்பதே முக்கிய எச்சரிக்கை.",
    },
    4: {
        "en": "You are unconventional, analytical, and quick to see what others miss. Ruled by Rahu, you often take an unusual route to success. Sudden changes and restlessness need conscious management.",
        "ta": "நீங்கள் வழக்கத்திற்கு மாறானவர், பகுப்பாய்வு திறன் உள்ளவர், மற்றவர்கள் காணாததை விரைவில் காண்பவர். ராகுவின் ஆட்சியால் வழக்கத்திற்கு மாறான பாதையில் வெற்றி காண்பீர்கள். திடீர் மாற்றங்களும் அமைதியின்மையும் கவனமாக கையாள வேண்டியவை.",
    },
    5: {
        "en": "You are adaptable, communicative, and commercially sharp. Ruled by Mercury, you learn fast and connect with people easily. Over-commitment and nervous energy are worth guarding against.",
        "ta": "நீங்கள் சூழ்நிலைக்கேற்ப மாறுபவர், தொடர்பு திறன் மிக்கவர், வணிக நுட்பம் உள்ளவர். புதனின் ஆட்சியால் விரைவில் கற்பீர்கள், மக்களுடன் எளிதில் இணைவீர்கள். அதிக பொறுப்பேற்றலும் பதற்றமும் தவிர்க்க வேண்டியவை.",
    },
    6: {
        "en": "You are responsible, caring, and naturally connected with family, comfort, beauty, and harmony. Ruled by Venus, you have the ability to create balance around you. At times emotional expectations or over-responsibility may create pressure, but your Venus energy supports success and popularity.",
        "ta": "நீங்கள் பொறுப்புள்ளவர், அன்பானவர், குடும்பம், வசதி, அழகு, இணக்கத்துடன் இயல்பாக இணைந்தவர். சுக்கிரனின் ஆட்சியால் உங்களைச் சுற்றி சமநிலையை உருவாக்கும் திறன் உண்டு. சில சமயங்களில் உணர்வுப்பூர்வ எதிர்பார்ப்புகள் அல்லது அதிக பொறுப்பு அழுத்தம் தரலாம், ஆனால் சுக்கிர சக்தி வெற்றியையும் புகழையும் தரும்.",
    },
    7: {
        "en": "You are introspective, research-minded, and drawn to depth over surface. Ruled by Ketu, you have strong intuition and spiritual inclination. Detachment and over-analysis are the areas to balance.",
        "ta": "நீங்கள் சுயபரிசோதனை செய்பவர், ஆராய்ச்சி மனப்பான்மை உள்ளவர், மேலோட்டத்தைவிட ஆழத்தை நாடுபவர். கேதுவின் ஆட்சியால் வலுவான உள்ளுணர்வும் ஆன்மீக நாட்டமும் உண்டு. பற்றின்மையும் அளவுக்கு அதிகமான ஆய்வும் சமநிலைப்படுத்த வேண்டியவை.",
    },
    8: {
        "en": "You are disciplined, persevering, and built for long-term effort. Ruled by Saturn, results often come slowly but last. Delays and heavy responsibility are part of the path rather than a sign of failure.",
        "ta": "நீங்கள் ஒழுக்கமானவர், விடாமுயற்சி உள்ளவர், நீண்டகால முயற்சிக்கு ஏற்றவர். சனியின் ஆட்சியால் பலன்கள் மெதுவாக வரும், ஆனால் நிலைத்திருக்கும். தாமதங்களும் கனத்த பொறுப்புகளும் தோல்வியின் அறிகுறி அல்ல, பாதையின் ஒரு பகுதியே.",
    },
    9: {
        "en": "You are energetic, courageous, and protective of those you care about. Ruled by Mars, you act decisively and dislike injustice. Impatience and temper are the main areas to temper.",
        "ta": "நீங்கள் ஆற்றல் மிக்கவர், துணிச்சலானவர், நேசிப்பவர்களை பாதுகாப்பவர். செவ்வாயின் ஆட்சியால் உறுதியாக செயல்படுவீர்கள், அநீதியை வெறுப்பீர்கள். பொறுமையின்மையும் கோபமும் கட்டுப்படுத்த வேண்டியவை.",
    },
}


# -----------------------------------------------------------------------------
# 5. BHAGYANK (Destiny Number) — life path / direction.
#    Derived from the FULL date of birth, so this varies independently of the
#    birth day alone. Describes the arc a life tends to follow, never a
#    specific event, date, or outcome.
# -----------------------------------------------------------------------------
_BHAGYANK_PATH = {
    1: {
        "en": "Your life path pushes you toward leading rather than following. Opportunities tend to arrive when you take initiative instead of waiting for permission.",
        "ta": "உங்கள் வாழ்க்கைப் பாதை பின்தொடர்வதைவிட தலைமை ஏற்பதை நோக்கி செலுத்துகிறது. அனுமதிக்காகக் காத்திராமல் நீங்களே முன்முயற்சி எடுக்கும்போது வாய்ப்புகள் வரும்.",
    },
    2: {
        "en": "Your life path works through partnership, cooperation, and patience. Progress usually comes via relationships and alliances rather than solo force.",
        "ta": "உங்கள் வாழ்க்கைப் பாதை கூட்டுறவு, ஒத்துழைப்பு, பொறுமை வழியாக இயங்குகிறது. தனி முயற்சியைவிட உறவுகள் மற்றும் கூட்டணிகள் வழியாகவே முன்னேற்றம் வரும்.",
    },
    3: {
        "en": "Your life path is oriented toward learning, teaching, and communication. Knowledge shared tends to return to you as opportunity.",
        "ta": "உங்கள் வாழ்க்கைப் பாதை கற்றல், கற்பித்தல், தொடர்பு நோக்கி அமைந்துள்ளது. பகிர்ந்த அறிவு வாய்ப்பாக உங்களிடம் திரும்பி வரும்.",
    },
    4: {
        "en": "Your life path is unconventional and rarely linear. Progress often comes through unexpected routes, sudden turns, and work others overlook.",
        "ta": "உங்கள் வாழ்க்கைப் பாதை வழக்கத்திற்கு மாறானது, நேர்கோட்டில் அமைவதில்லை. எதிர்பாராத வழிகள், திடீர் திருப்பங்கள், மற்றவர்கள் கவனிக்காத பணிகள் வழியாக முன்னேற்றம் வரும்.",
    },
    5: {
        "en": "Your life path favours movement, exchange, and adaptability. Trade, travel, communication and networks tend to open doors for you.",
        "ta": "உங்கள் வாழ்க்கைப் பாதை இயக்கம், பரிமாற்றம், மாற்றியமைத்தல் ஆகியவற்றை விரும்புகிறது. வணிகம், பயணம், தொடர்பு, தொடர்பு வலையமைப்புகள் உங்களுக்கு வழிகளைத் திறக்கும்.",
    },
    6: {
        "en": "Your life path centres on family, responsibility, and creating comfort for others. Duty taken on willingly tends to become your source of standing.",
        "ta": "உங்கள் வாழ்க்கைப் பாதை குடும்பம், பொறுப்பு, மற்றவர்களுக்கு வசதி உருவாக்குதல் ஆகியவற்றை மையமாகக் கொண்டது. விருப்பத்துடன் ஏற்கும் கடமையே உங்கள் மதிப்பின் ஆதாரமாகும்.",
    },
    7: {
        "en": "Your life path draws you toward depth, study, and inner enquiry. Answers usually come from reflection and research rather than from crowds.",
        "ta": "உங்கள் வாழ்க்கைப் பாதை ஆழம், கற்றல், உள்நோக்கிய விசாரணை ஆகியவற்றை நோக்கி இழுக்கிறது. கூட்டத்திலிருந்து அல்லாமல், சிந்தனை மற்றும் ஆராய்ச்சியிலிருந்தே பதில்கள் கிடைக்கும்.",
    },
    8: {
        "en": "Your life path is built on endurance. Results arrive later than for others, but what you build on this path tends to hold its ground.",
        "ta": "உங்கள் வாழ்க்கைப் பாதை சகிப்புத்தன்மையின் மீது கட்டப்பட்டது. மற்றவர்களைவிட பலன்கள் தாமதமாக வரும், ஆனால் இப்பாதையில் நீங்கள் கட்டியமைப்பது நிலைத்து நிற்கும்.",
    },
    9: {
        "en": "Your life path involves effort, protection, and standing up for causes. Energy spent on behalf of others tends to define your direction.",
        "ta": "உங்கள் வாழ்க்கைப் பாதையில் முயற்சி, பாதுகாப்பு, நியாயத்திற்காக நிற்றல் ஆகியவை அடங்கும். மற்றவர்களுக்காகச் செலவிடும் ஆற்றலே உங்கள் திசையை வரையறுக்கும்.",
    },
}

# -----------------------------------------------------------------------------
# 6. NAMANK (Name Number) — OUTER personality / public projection.
#    THIS is the name-driven layer. In Chaldean practice the Namank governs how
#    a person is perceived and how the name "carries" in the world, as distinct
#    from the inner nature (Moolank) and the life direction (Bhagyank).
#    Because it is computed from the spelling, changing the name changes this
#    section — which is exactly the behaviour a name-selection tool needs.
# -----------------------------------------------------------------------------
_NAMANK_EXPRESSION = {
    1: {
        "en": "This name projects authority and individuality. People tend to remember it and associate it with someone who takes charge.",
        "ta": "இப்பெயர் அதிகாரத்தையும் தனித்தன்மையையும் வெளிப்படுத்துகிறது. மக்கள் இதை நினைவில் வைத்துக்கொள்வார்கள், பொறுப்பேற்பவர் என்ற எண்ணத்தை ஏற்படுத்தும்.",
    },
    2: {
        "en": "This name projects gentleness and approachability. It reads as cooperative and tends to put others at ease.",
        "ta": "இப்பெயர் மென்மையையும் அணுகுதன்மையையும் வெளிப்படுத்துகிறது. ஒத்துழைப்பானதாகத் தோன்றி மற்றவர்களை நிம்மதியாக உணரச் செய்யும்.",
    },
    3: {
        "en": "This name projects warmth, intelligence, and expressiveness. It carries well socially and is easy for people to speak and recall.",
        "ta": "இப்பெயர் அன்பு, அறிவு, வெளிப்படுத்தும் திறன் ஆகியவற்றைக் காட்டுகிறது. சமூகத்தில் நன்கு பொருந்தும், மக்கள் எளிதில் உச்சரித்து நினைவில் வைப்பார்கள்.",
    },
    4: {
        "en": "This name projects distinctiveness — it stands out rather than blends in. It suits someone expected to take an unconventional route.",
        "ta": "இப்பெயர் தனித்துவத்தை வெளிப்படுத்துகிறது — கூட்டத்தில் கலக்காமல் தனித்து நிற்கும். வழக்கத்திற்கு மாறான பாதையில் செல்பவருக்கு ஏற்றது.",
    },
    5: {
        "en": "This name projects quickness and versatility. It reads as modern and adaptable, and tends to travel well across places and languages.",
        "ta": "இப்பெயர் விரைவையும் பல்திறனையும் வெளிப்படுத்துகிறது. நவீனமாகவும் மாற்றியமைக்கக்கூடியதாகவும் தோன்றும், பல இடங்களிலும் மொழிகளிலும் நன்கு பொருந்தும்.",
    },
    6: {
        "en": "This name projects charm, care, and aesthetic appeal. It reads as pleasant and tends to attract goodwill easily.",
        "ta": "இப்பெயர் கவர்ச்சி, அக்கறை, அழகியல் ஈர்ப்பு ஆகியவற்றை வெளிப்படுத்துகிறது. இனிமையானதாகத் தோன்றி எளிதில் நல்லெண்ணத்தை ஈர்க்கும்.",
    },
    7: {
        "en": "This name projects depth and quiet seriousness. It reads as thoughtful rather than loud, and suits scholarly or reflective paths.",
        "ta": "இப்பெயர் ஆழத்தையும் அமைதியான தீவிரத்தையும் வெளிப்படுத்துகிறது. ஆரவாரமாக அல்லாமல் சிந்தனைமிக்கதாகத் தோன்றும், கல்வி அல்லது ஆன்மீகப் பாதைக்கு ஏற்றது.",
    },
    8: {
        "en": "This name projects weight and seriousness. It reads as substantial, though it can feel heavier than playful — a consideration for a child's name.",
        "ta": "இப்பெயர் கனத்தையும் தீவிரத்தையும் வெளிப்படுத்துகிறது. உறுதியானதாகத் தோன்றும், ஆனால் விளையாட்டுத்தனத்தைவிட கனமாக உணரப்படலாம் — குழந்தைப் பெயருக்கு இது கவனிக்கத்தக்கது.",
    },
    9: {
        "en": "This name projects energy and boldness. It reads as strong and active, carrying a sense of courage.",
        "ta": "இப்பெயர் ஆற்றலையும் துணிச்சலையும் வெளிப்படுத்துகிறது. வலிமையாகவும் சுறுசுறுப்பாகவும் தோன்றி, தைரியத்தின் உணர்வைத் தரும்.",
    },
}


# -----------------------------------------------------------------------------
# 7. COMPOUND NUMBER (the UNREDUCED name total).
#    CONFIDENCE: MEDIUM. Chaldean practice (Cheiro) treats the compound total
#    as carrying its own character, distinct from its reduced digit — this is
#    why two names that both reduce to 3 (e.g. total 48 vs total 30) are not
#    considered identical. The descriptions below cover the commonly-cited
#    compound numbers; they describe the NUMBER's traditional character only,
#    and never assert an event, date, or outcome.
#    Compound totals outside the covered range fall back to a neutral,
#    explicitly-stated "not individually characterised" line rather than
#    inventing a meaning (AGENTS.md 1.2 / 1.4).
# -----------------------------------------------------------------------------
_COMPOUND_MEANING = {
    10: ("a self-contained, complete number — associated with rising by one's own effort",
         "தன்னிறைவான, முழுமையான எண் — சுய முயற்சியால் உயர்வதைக் குறிக்கும்"),
    11: ("a number of trials and hidden tests — asks for caution and patience",
         "சோதனைகள் மற்றும் மறைந்த தடைகளின் எண் — கவனமும் பொறுமையும் கேட்கிறது"),
    12: ("a number of learning through others — associated with sacrifice and anxiety in early phases",
         "மற்றவர்கள் வழியாகக் கற்கும் எண் — ஆரம்ப காலத்தில் தியாகம் மற்றும் கவலையுடன் தொடர்புடையது"),
    13: ("a number of upheaval and change — traditionally read as power that must be handled carefully, not as misfortune",
         "மாற்றம் மற்றும் புரட்சியின் எண் — துரதிர்ஷ்டம் அல்ல, கவனமாகக் கையாள வேண்டிய சக்தி"),
    14: ("a number of movement and risk — associated with dealings, travel, and fluctuating fortune",
         "இயக்கம் மற்றும் ஆபத்தின் எண் — பரிவர்த்தனைகள், பயணம், மாறும் அதிர்ஷ்டத்துடன் தொடர்புடையது"),
    15: ("a number of charm and attraction — associated with eloquence and the ability to win favour",
         "கவர்ச்சி மற்றும் ஈர்ப்பின் எண் — சொல்வன்மை மற்றும் நல்லெண்ணத்தைப் பெறும் திறனுடன் தொடர்புடையது"),
    16: ("a number warning of sudden reversal — traditionally read as needing humility and care",
         "திடீர் மாற்றத்தை எச்சரிக்கும் எண் — பணிவும் கவனமும் தேவை என்று கருதப்படுகிறது"),
    17: ("a number of endurance and lasting name — associated with rising after difficulty",
         "சகிப்புத்தன்மை மற்றும் நிலைத்த புகழின் எண் — சிரமத்திற்குப் பிறகு உயர்வதுடன் தொடர்புடையது"),
    18: ("a number of conflict and hard-won gain — asks for care in dealings with others",
         "மோதல் மற்றும் கடினமாகப் பெறும் ஆதாயத்தின் எண் — மற்றவர்களுடனான பரிவர்த்தனையில் கவனம் தேவை"),
    19: ("a number of success and recognition — traditionally considered highly favourable",
         "வெற்றி மற்றும் அங்கீகாரத்தின் எண் — மிகவும் சாதகமானதாகக் கருதப்படுகிறது"),
    20: ("a number of awakening and new purpose — associated with delays before clarity",
         "விழிப்பு மற்றும் புதிய நோக்கத்தின் எண் — தெளிவுக்கு முன் தாமதங்களுடன் தொடர்புடையது"),
    21: ("a number of advancement and honour — associated with progress after early struggle",
         "முன்னேற்றம் மற்றும் மரியாதையின் எண் — ஆரம்பச் சிரமத்திற்குப் பின் முன்னேற்றத்துடன் தொடர்புடையது"),
    22: ("a number cautioning against illusion — asks for realism and grounded judgement",
         "மாயையிலிருந்து எச்சரிக்கும் எண் — யதார்த்தமும் நிலையான பகுத்தறிவும் தேவை"),
    23: ("a number of protection and support — traditionally among the most favourable compounds",
         "பாதுகாப்பு மற்றும் ஆதரவின் எண் — மிகச் சாதகமான கூட்டு எண்களில் ஒன்று"),
    24: ("a number of gain through association — associated with help from influential people",
         "தொடர்பு வழியாக ஆதாயம் தரும் எண் — செல்வாக்கு உள்ளவர்களின் உதவியுடன் தொடர்புடையது"),
    25: ("a number of learning by experience — strength arrives through observation and testing",
         "அனுபவத்தால் கற்கும் எண் — கவனிப்பு மற்றும் சோதனை வழியாக பலம் வரும்"),
    26: ("a number urging caution in partnerships and finances — asks for careful counsel",
         "கூட்டாண்மை மற்றும் நிதியில் கவனத்தைக் கோரும் எண் — கவனமான ஆலோசனை தேவை"),
    27: ("a number of authority earned through intellect — associated with reward for original work",
         "அறிவால் பெறும் அதிகாரத்தின் எண் — சுயமான பணிக்கான பலனுடன் தொடர்புடையது"),
    28: ("a number of promise needing consolidation — gains can be lost if not secured",
         "உறுதிப்படுத்த வேண்டிய வாக்குறுதியின் எண் — பாதுகாக்கப்படாவிட்டால் ஆதாயம் இழக்கப்படலாம்"),
    29: ("a number of uncertainty in relations — asks for discernment about whom to trust",
         "உறவுகளில் நிச்சயமற்ற தன்மையின் எண் — யாரை நம்புவது என்பதில் தெளிவு தேவை"),
    30: ("a number of thoughtful retreat — associated with mental power used deliberately rather than for show",
         "சிந்தனைமிக்க தனிமையின் எண் — வெளிக்காட்டலுக்காக அல்லாமல் வேண்டுமென்றே பயன்படுத்தப்படும் மனவலிமையுடன் தொடர்புடையது"),
    31: ("a number of self-containment — similar to 30, with a stronger inclination to solitude",
         "தன்னிறைவின் எண் — 30-ஐ ஒத்தது, தனிமையை நோக்கிய அதிக நாட்டத்துடன்"),
    32: ("a number of communication and collective appeal — carries well with groups",
         "தொடர்பு மற்றும் கூட்டு ஈர்ப்பின் எண் — குழுக்களுடன் நன்கு பொருந்தும்"),
    33: ("a number sharing the character of 24 — gain through supportive association",
         "24-இன் இயல்பைப் பகிரும் எண் — ஆதரவான தொடர்பு வழியாக ஆதாயம்"),
    34: ("a number sharing the character of 25 — strength through tested experience",
         "25-இன் இயல்பைப் பகிரும் எண் — சோதிக்கப்பட்ட அனுபவத்தால் பலம்"),
    35: ("a number sharing the character of 26 — caution advised in partnerships",
         "26-இன் இயல்பைப் பகிரும் எண் — கூட்டாண்மையில் கவனம் அறிவுறுத்தப்படுகிறது"),
    36: ("a number sharing the character of 27 — authority through intellect",
         "27-இன் இயல்பைப் பகிரும் எண் — அறிவால் பெறும் அதிகாரம்"),
    37: ("a number of good association — favourable for partnerships and friendships",
         "நல்ல தொடர்பின் எண் — கூட்டாண்மை மற்றும் நட்புக்கு சாதகமானது"),
    38: ("a number sharing the character of 29 — discernment needed about whom to trust",
         "29-இன் இயல்பைப் பகிரும் எண் — யாரை நம்புவது என்பதில் தெளிவு தேவை"),
    39: ("a number sharing the character of 30 — deliberate, inward-directed mental power",
         "30-இன் இயல்பைப் பகிரும் எண் — வேண்டுமென்றே, உள்நோக்கிய மனவலிமை"),
    40: ("a number sharing the character of 31 — self-contained and independent",
         "31-இன் இயல்பைப் பகிரும் எண் — தன்னிறைவும் சுயசார்பும்"),
    41: ("a number sharing the character of 32 — strong collective and communicative appeal",
         "32-இன் இயல்பைப் பகிரும் எண் — வலுவான கூட்டு மற்றும் தொடர்பு ஈர்ப்பு"),
    42: ("a number sharing the character of 24 — benefit through influential support",
         "24-இன் இயல்பைப் பகிரும் எண் — செல்வாக்கான ஆதரவு வழியாக நன்மை"),
    43: ("a number cautioning against instability — asks for steady, settled choices",
         "நிலையற்ற தன்மையிலிருந்து எச்சரிக்கும் எண் — நிலையான, உறுதியான தேர்வுகள் தேவை"),
    44: ("a number sharing the character of 26 — careful counsel advised",
         "26-இன் இயல்பைப் பகிரும் எண் — கவனமான ஆலோசனை அறிவுறுத்தப்படுகிறது"),
    45: ("a number sharing the character of 27 — reward for original and intelligent work",
         "27-இன் இயல்பைப் பகிரும் எண் — சுயமான, அறிவார்ந்த பணிக்கான பலன்"),
    46: ("a number sharing the character of 37 — favourable association and support",
         "37-இன் இயல்பைப் பகிரும் எண் — சாதகமான தொடர்பும் ஆதரவும்"),
    47: ("a number sharing the character of 29 — care needed in close dealings",
         "29-இன் இயல்பைப் பகிரும் எண் — நெருங்கிய பரிவர்த்தனைகளில் கவனம் தேவை"),
    48: ("a number sharing the character of 30 — reflective mental strength, applied quietly rather than displayed",
         "30-இன் இயல்பைப் பகிரும் எண் — வெளிக்காட்டாமல் அமைதியாகப் பயன்படுத்தப்படும் சிந்தனை வலிமை"),
    49: ("a number sharing the character of 31 — independent and self-directed",
         "31-இன் இயல்பைப் பகிரும் எண் — சுயசார்பும் தன்னிச்சையும்"),
    50: ("a number sharing the character of 32 — wide communicative reach",
         "32-இன் இயல்பைப் பகிரும் எண் — பரந்த தொடர்பு எல்லை"),
    51: ("a number of sudden advancement — forceful, and traditionally read as needing care in how power is used",
         "திடீர் முன்னேற்றத்தின் எண் — வலிமையானது, அதிகாரத்தைப் பயன்படுத்தும் விதத்தில் கவனம் தேவை"),
    52: ("a number sharing the character of 43 — asks for stability over restlessness",
         "43-இன் இயல்பைப் பகிரும் எண் — அமைதியின்மையைவிட நிலைத்தன்மை தேவை"),
}


# -----------------------------------------------------------------------------
# 8. PER-NUMBER ATTRIBUTES — short traits, lucky numbers / colours / days.
#    CONFIDENCE: HIGH for the lucky-number rule, MEDIUM-HIGH for colours/days.
#
#    Lucky numbers follow the standard arithmetic series n, n+9, n+18, n+27.
#    VERIFIED against the reference calculator: for Namank 3 it publishes
#    "3, 12, 21, 30", which this rule reproduces exactly.
#
#    Colours/days are the standard Navagraha-linked associations. Cross-checked
#    for number 3, where the reference publishes yellow / orange / white and
#    Thursday / Friday — both matching the entries below.
# -----------------------------------------------------------------------------
_NUMBER_ATTRIBUTES = {
    1: {
        "traits_en": "Leadership, authority, originality, independence",
        "traits_ta": "தலைமைத்துவம், அதிகாரம், சுயசிந்தனை, சுதந்திரம்",
        "colors_en": ["Gold", "Orange", "Red"],
        "colors_ta": ["தங்கம்", "ஆரஞ்சு", "சிவப்பு"],
        "days_en": ["Sunday", "Monday"],
        "days_ta": ["ஞாயிறு", "திங்கள்"],
    },
    2: {
        "traits_en": "Sensitivity, intuition, cooperation, imagination",
        "traits_ta": "உணர்வு, உள்ளுணர்வு, ஒத்துழைப்பு, கற்பனை",
        "colors_en": ["White", "Cream", "Light Green"],
        "colors_ta": ["வெண்மை", "கிரீம்", "இளம் பச்சை"],
        "days_en": ["Monday", "Sunday"],
        "days_ta": ["திங்கள்", "ஞாயிறு"],
    },
    3: {
        "traits_en": "Creativity, wisdom, friendliness, expression",
        "traits_ta": "படைப்பாற்றல், ஆன்மீகம், நட்பு, வெளிப்பாடு",
        "colors_en": ["Yellow", "Orange", "White"],
        "colors_ta": ["மஞ்சள்", "ஆரஞ்சு", "வெண்மை"],
        "days_en": ["Thursday", "Friday"],
        "days_ta": ["வியாழன்", "வெள்ளி"],
    },
    4: {
        "traits_en": "Unconventional thinking, discipline, analysis, endurance",
        "traits_ta": "கடின உழைப்பு, ஒழுங்கு, பகுப்பாய்வு, சகிப்புத்தன்மை",
        "colors_en": ["Grey", "Blue", "Khaki"],
        "colors_ta": ["சாம்பல்", "நீலம்", "காக்கி"],
        "days_en": ["Saturday", "Sunday"],
        "days_ta": ["சனி", "ஞாயிறு"],
    },
    5: {
        "traits_en": "Intelligence, speed, communication, adaptability",
        "traits_ta": "சுதந்திரம், அறிவு, பயணம், மாற்றம்",
        "colors_en": ["Green", "Light Grey", "White"],
        "colors_ta": ["பச்சை", "இளம் சாம்பல்", "வெண்மை"],
        "days_en": ["Wednesday", "Friday"],
        "days_ta": ["புதன்", "வெள்ளி"],
    },
    6: {
        "traits_en": "Care, beauty, responsibility, artistry",
        "traits_ta": "அன்பு, அழகு, குடும்பம், கலை",
        "colors_en": ["White", "Pink", "Light Blue"],
        "colors_ta": ["வெண்மை", "இளஞ்சிவப்பு", "இளநீலம்"],
        "days_en": ["Friday", "Wednesday"],
        "days_ta": ["வெள்ளி", "புதன்"],
    },
    7: {
        "traits_en": "Spirituality, research, depth, introspection",
        "traits_ta": "ஆன்மீகம், மரபு, ஆழ்ந்த சிந்தனை",
        "colors_en": ["White", "Grey", "Smoke"],
        "colors_ta": ["வெண்மை", "சாம்பல்", "புகைநிறம்"],
        "days_en": ["Monday", "Sunday"],
        "days_ta": ["திங்கள்", "ஞாயிறு"],
    },
    8: {
        "traits_en": "Discipline, structure, patience, perseverance",
        "traits_ta": "ஒழுக்கம், அமைப்பு, பொறுமை, விடாமுயற்சி",
        "colors_en": ["Dark Blue", "Black", "Purple"],
        "colors_ta": ["கருநீலம்", "கருப்பு", "ஊதா"],
        "days_en": ["Saturday", "Friday"],
        "days_ta": ["சனி", "வெள்ளி"],
    },
    9: {
        "traits_en": "Courage, energy, protection, determination",
        "traits_ta": "வீரம், ஆற்றல், பாதுகாப்பு, உறுதி",
        "colors_en": ["Red", "Maroon", "Pink"],
        "colors_ta": ["சிவப்பு", "மெரூன்", "இளஞ்சிவப்பு"],
        "days_en": ["Tuesday", "Thursday"],
        "days_ta": ["செவ்வாய்", "வியாழன்"],
    },
}


def lucky_numbers_for(n: int) -> list:
    """Standard series n, n+9, n+18, n+27.
    VERIFIED: n=3 -> [3, 12, 21, 30], matching the reference calculator."""
    if not 1 <= n <= 9:
        return []
    return [n + 9 * i for i in range(4)]


def get_number_attributes(n: int) -> dict:
    """Planet + traits + lucky numbers/colours/days for a single digit 1-9."""
    if not 1 <= n <= 9:
        return {}
    a = _NUMBER_ATTRIBUTES[n]
    pl = _NUMBER_PLANET[n]
    return {
        "number": n,
        "planet": pl["en"],
        "planet_ta": pl["ta"],
        "traits": a["traits_en"],
        "traits_ta": a["traits_ta"],
        "lucky_numbers": lucky_numbers_for(n),
        "lucky_colors": a["colors_en"],
        "lucky_colors_ta": a["colors_ta"],
        "lucky_days": a["days_en"],
        "lucky_days_ta": a["days_ta"],
    }


# -----------------------------------------------------------------------------
# 9. MASTER NUMBERS 11 / 22 / 33 — informational.
#    IMPORTANT HONESTY NOTE: this engine's Namank/Moolank/Bhagyank always
#    reduce fully to 1-9 (the standard Chaldean convention, documented at the
#    top of this file). Master numbers are therefore reported as an
#    OBSERVATION ("an 11 appeared at an intermediate step") and never silently
#    override the reduced value. That keeps the headline numbers consistent
#    with the reference calculator while still surfacing the information.
# -----------------------------------------------------------------------------
_MASTER_NUMBERS = {
    11: {
        "title_en": "Spiritual Light",
        "title_ta": "ஆன்மீக ஒளி",
        "text_en": "Associated with intuition, inspiration, and heightened sensitivity. Traditionally regarded as carrying both greater potential and greater nervous strain.",
        "text_ta": "உள்ளுணர்வு, தூண்டுதல், கூர்ந்த உணர்திறன் ஆகியவற்றுடன் தொடர்புடையது. அதிக ஆற்றலையும் அதிக மன அழுத்தத்தையும் சேர்ந்தே கொண்டுவருவதாகக் கருதப்படுகிறது.",
    },
    22: {
        "title_en": "Master Builder",
        "title_ta": "மாஸ்டர் கட்டமைப்பாளர்",
        "text_en": "Associated with the ability to turn large ideas into concrete structures. Regarded as the most practically powerful of the master numbers.",
        "text_ta": "பெரிய கருத்துக்களை நடைமுறைக்குக் கொண்டுவரும் திறனுடன் தொடர்புடையது. மாஸ்டர் எண்களில் நடைமுறையில் மிகவும் சக்திவாய்ந்ததாகக் கருதப்படுகிறது.",
    },
    33: {
        "title_en": "Master Teacher",
        "title_ta": "மாஸ்டர் ஆசிரியர்",
        "text_en": "Associated with guidance, compassion, and responsibility toward others. The rarest of the three and traditionally considered the most demanding.",
        "text_ta": "வழிகாட்டுதல், கருணை, மற்றவர்கள் மீதான பொறுப்பு ஆகியவற்றுடன் தொடர்புடையது. மூன்றிலும் அரிதானது, மிகவும் கோரிக்கை மிக்கதாகக் கருதப்படுகிறது.",
    },
}


def detect_master_numbers(name_total: int, date_of_birth: str) -> list:
    """Reports any 11/22/33 appearing at an intermediate reduction step.
    Purely informational — see the section note above."""
    found = []

    def _steps(n: int):
        out = []
        while n > 9:
            n = sum(int(d) for d in str(n))
            out.append(n)
        return out

    candidates = set()
    for v in _steps(name_total):
        candidates.add(v)
    digits = re.sub(r"[^0-9]", "", date_of_birth)
    if digits:
        for v in _steps(sum(int(d) for d in digits)):
            candidates.add(v)
        day = int(date_of_birth.split("-")[2]) if len(date_of_birth.split("-")) == 3 else 0
        for v in _steps(day):
            candidates.add(v)
        if day in (11, 22, 33):
            candidates.add(day)
    if name_total in (11, 22, 33):
        candidates.add(name_total)

    for m in (11, 22, 33):
        if m in candidates:
            info = _MASTER_NUMBERS[m]
            found.append({
                "number": m,
                "title": info["title_en"],
                "title_ta": info["title_ta"],
                "text": info["text_en"],
                "text_ta": info["text_ta"],
            })
    return found


def get_reference_tables() -> dict:
    """Static reference data for the UI: the 1-9 meaning table, the Chaldean
    letter chart, and the master-number notes. Pure lookup, no computation."""
    return {
        "numbers": [get_number_attributes(n) for n in range(1, 10)],
        "letter_chart": [
            {"value": v, "letters": sorted(_CHART_GROUPS[v])} for v in sorted(_CHART_GROUPS)
        ],
        "master_numbers": [
            {
                "number": m,
                "title": _MASTER_NUMBERS[m]["title_en"],
                "title_ta": _MASTER_NUMBERS[m]["title_ta"],
                "text": _MASTER_NUMBERS[m]["text_en"],
                "text_ta": _MASTER_NUMBERS[m]["text_ta"],
            }
            for m in (11, 22, 33)
        ],
        "note": (
            "Lucky numbers follow the series n, n+9, n+18, n+27. Master numbers are "
            "shown for reference; this calculator reduces all core numbers fully to "
            "1-9, which is the standard Chaldean convention."
        ),
        "note_ta": (
            "அதிர்ஷ்ட எண்கள் n, n+9, n+18, n+27 என்ற வரிசையைப் பின்பற்றுகின்றன. மாஸ்டர் "
            "எண்கள் தகவலுக்காக மட்டுமே காட்டப்படுகின்றன; இந்தக் கணிப்பான் அனைத்து அடிப்படை "
            "எண்களையும் 1-9 ஆகக் குறைக்கிறது — இதுவே நியம கால்டியன் மரபு."
        ),
    }


def _reduce_to_single_digit(n: int) -> int:
    """Repeatedly sums digits until a single digit (1-9) remains.
    Does NOT preserve master numbers — see module docstring point 4."""
    while n > 9:
        n = sum(int(d) for d in str(n))
    return n


def compute_name_number(name: str) -> Dict[str, Any]:
    """Returns the Chaldean Namank plus the raw compound total and a
    per-letter breakdown. Non-letter characters (spaces, dots, punctuation)
    are skipped, not scored."""
    letters_only = re.sub(r"[^A-Za-z]", "", name or "").upper()
    breakdown: List[Dict[str, Any]] = []
    total = 0
    for ch in letters_only:
        val = _CHALDEAN_CHART.get(ch, 0)
        breakdown.append({"letter": ch, "value": val})
        total += val
    return {
        "name_number": _reduce_to_single_digit(total) if total > 0 else 0,
        "compound_total": total,
        "breakdown": breakdown,
    }


def compute_birth_number(date_of_birth: str) -> int:
    """Moolank — single-digit reduction of the DAY of birth. 'YYYY-MM-DD'."""
    day = int(date_of_birth.split("-")[2])
    return _reduce_to_single_digit(day)


def compute_destiny_number(date_of_birth: str) -> int:
    """Bhagyank — single-digit reduction of every digit in the full DOB."""
    digits_only = re.sub(r"[^0-9]", "", date_of_birth)
    return _reduce_to_single_digit(sum(int(d) for d in digits_only))


def _relation(a: int, b: int) -> str:
    """Returns 'Friendly' | 'Neutral' | 'Enemy' between two numbers.
    Treated as symmetric: if either direction flags enemy/friendly, that
    wins, enemy taking precedence. See docstring point 5 for the caveat."""
    if a == 0 or b == 0:
        return "Neutral"
    if b in _ENEMY.get(a, set()) or a in _ENEMY.get(b, set()):
        return "Enemy"
    if b in _FRIENDLY.get(a, set()) or a in _FRIENDLY.get(b, set()):
        return "Friendly"
    return "Neutral"


_RELATION_TA = {"Friendly": "நட்பு", "Neutral": "சமம்", "Enemy": "பகை"}


def build_numerology_profile(name: str, date_of_birth: str) -> Dict[str, Any]:
    """Full Chaldean profile for a candidate name against a date of birth.

    Verdict logic mirrors the standard three-tier reading:
      - Favourable       : Namank friendly with BOTH Moolank and Bhagyank
      - Partially Aligned: friendly with one, neutral with the other
      - Needs Better Alignment : any enemy relation present, or neutral with both
    """
    name_result = compute_name_number(name)
    namank = name_result["name_number"]
    moolank = compute_birth_number(date_of_birth)
    bhagyank = compute_destiny_number(date_of_birth)

    rel_moolank = _relation(namank, moolank)
    rel_bhagyank = _relation(namank, bhagyank)

    has_enemy = "Enemy" in (rel_moolank, rel_bhagyank)
    friendly_count = [rel_moolank, rel_bhagyank].count("Friendly")

    if has_enemy:
        status, status_ta = "Needs Better Alignment", "மேம்பாடு தேவை"
    elif friendly_count == 2:
        status, status_ta = "Favourable", "சாதகமானது"
    elif friendly_count == 1:
        status, status_ta = "Partially Aligned", "பகுதியளவு பொருத்தம்"
    else:
        status, status_ta = "Needs Better Alignment", "மேம்பாடு தேவை"

    # ---- Headline + analysis text, built strictly from the values above ----
    if status == "Favourable":
        headline = f"Name Number {namank} shows strong alignment."
        headline_ta = f"பெயர் எண் {namank} வலுவான பொருத்தம் காட்டுகிறது."
        analysis = (
            f"Your Name Number {namank} is friendly with both your Birth Number "
            f"{moolank} and Destiny Number {bhagyank}. This represents strong basic "
            f"numerological compatibility and indicates that the name vibration "
            f"supports the natural qualities of this birth date."
        )
        analysis_ta = (
            f"பெயர் எண் {namank}, பிறப்பு எண் {moolank} மற்றும் ஊழ் எண் {bhagyank} "
            f"ஆகிய இரண்டுடனும் நட்பு கொண்டுள்ளது. இது வலுவான அடிப்படை எண் பொருத்தத்தைக் "
            f"குறிக்கிறது; இப்பெயரின் அதிர்வு இப்பிறந்த தேதியின் இயல்பான குணங்களுக்கு "
            f"ஆதரவாக அமைகிறது."
        )
    elif status == "Partially Aligned":
        strong_label = "Birth Number" if rel_moolank == "Friendly" else "Destiny Number"
        strong_val = moolank if rel_moolank == "Friendly" else bhagyank
        weak_label = "Destiny Number" if rel_moolank == "Friendly" else "Birth Number"
        weak_val = bhagyank if rel_moolank == "Friendly" else moolank
        strong_label_ta = "பிறப்பு எண்" if rel_moolank == "Friendly" else "ஊழ் எண்"
        weak_label_ta = "ஊழ் எண்" if rel_moolank == "Friendly" else "பிறப்பு எண்"
        headline = f"Name Number {namank} is only partially aligned."
        headline_ta = f"பெயர் எண் {namank} பகுதியளவே பொருந்துகிறது."
        analysis = (
            f"Your Name Number {namank} is friendly with your {strong_label} "
            f"{strong_val}, but only neutral with your {weak_label} {weak_val}. "
            f"The name therefore has a positive foundation, but it may not be giving "
            f"the strongest possible overall support. In Name Numerology the best "
            f"alignment is generally achieved when the name works supportively with "
            f"both core numbers."
        )
        analysis_ta = (
            f"பெயர் எண் {namank}, {strong_label_ta} {strong_val} உடன் நட்பாகவும், "
            f"{weak_label_ta} {weak_val} உடன் சமமாகவும் உள்ளது. எனவே பெயருக்கு நல்ல "
            f"அடித்தளம் உள்ளது, ஆனால் முழுமையான ஆதரவு கிடைக்காமல் இருக்கலாம். எண் "
            f"கணிதத்தில், பெயர் இரு அடிப்படை எண்களுடனும் ஆதரவாக இருக்கும்போதே சிறந்த "
            f"பொருத்தம் ஏற்படுகிறது."
        )
    else:
        headline = f"Name Number {namank} needs better alignment."
        headline_ta = f"பெயர் எண் {namank} மேம்பாடு தேவைப்படுகிறது."
        analysis = (
            f"Your Name Number {namank} relates to your Birth Number {moolank} as "
            f"'{rel_moolank}' and to your Destiny Number {bhagyank} as "
            f"'{rel_bhagyank}'. This does not mean the name is bad — it means the "
            f"numerical vibration is not actively reinforcing these two core numbers. "
            f"A numerologist can assess whether a small spelling refinement would "
            f"improve alignment while preserving the name's identity."
        )
        analysis_ta = (
            f"பெயர் எண் {namank}, பிறப்பு எண் {moolank} உடன் '{_RELATION_TA[rel_moolank]}' "
            f"நிலையிலும், ஊழ் எண் {bhagyank} உடன் '{_RELATION_TA[rel_bhagyank]}' "
            f"நிலையிலும் உள்ளது. இதன் பொருள் பெயர் கெட்டது என்பதல்ல — இந்த இரு அடிப்படை "
            f"எண்களையும் இப்பெயரின் அதிர்வு வலுப்படுத்தவில்லை என்பதே. எழுத்துக்களில் சிறிய "
            f"திருத்தம் பொருத்தத்தை மேம்படுத்துமா என்பதை எண் கணித நிபுணர் ஆய்வு செய்யலாம்."
        )

    # ---- Three-part personality reading -------------------------------------
    # Chaldean practice separates three distinct layers. Building all three is
    # what makes the reading actually respond to the NAME, not only the DOB:
    #   Moolank  (birth day)  -> inner core nature
    #   Bhagyank (full DOB)   -> life direction / path
    #   Namank   (spelling)   -> outer projection  <-- varies per candidate name
    core = _MOOLANK_PERSONALITY.get(moolank, _MOOLANK_PERSONALITY[1])
    path = _BHAGYANK_PATH.get(bhagyank, _BHAGYANK_PATH[1])
    expression = _NAMANK_EXPRESSION.get(namank, _NAMANK_EXPRESSION[1])

    core_planet = _NUMBER_PLANET.get(moolank, _NUMBER_PLANET[1])
    name_planet = _NUMBER_PLANET.get(namank, _NUMBER_PLANET[1])

    # Interplay line — states plainly whether the name's outer projection
    # reinforces or pulls against the inner nature. Built strictly from the
    # already-computed relation, never asserting anything extra.
    if namank == moolank:
        interplay = (
            f"Here the Name Number and Birth Number are the same ({namank}), so the "
            f"outward impression and the inner nature reinforce each other directly — "
            f"what people see closely matches what is actually there."
        )
        interplay_ta = (
            f"இங்கு பெயர் எண்ணும் பிறப்பு எண்ணும் ஒன்றே ({namank}), எனவே வெளித்தோற்றமும் "
            f"உள்ளார்ந்த இயல்பும் ஒன்றையொன்று நேரடியாக வலுப்படுத்துகின்றன — மக்கள் காண்பதே "
            f"உண்மையில் உள்ளதுடன் பொருந்துகிறது."
        )
    elif rel_moolank == "Friendly":
        interplay = (
            f"The name's outward vibration ({namank}, {name_planet['en']}) works "
            f"comfortably with the inner nature ({moolank}, {core_planet['en']}). The "
            f"impression the name creates supports rather than contradicts the "
            f"underlying temperament."
        )
        interplay_ta = (
            f"பெயரின் வெளிப்புற அதிர்வு ({namank}, {name_planet['ta']}) உள்ளார்ந்த இயல்புடன் "
            f"({moolank}, {core_planet['ta']}) இணக்கமாக இயங்குகிறது. பெயர் ஏற்படுத்தும் "
            f"எண்ணம் அடிப்படை குணத்திற்கு முரணாக இல்லாமல் ஆதரவாக அமைகிறது."
        )
    elif rel_moolank == "Enemy":
        interplay = (
            f"The name's outward vibration ({namank}, {name_planet['en']}) pulls against "
            f"the inner nature ({moolank}, {core_planet['en']}). This often shows up as a "
            f"gap between how the person is perceived and how they actually feel inside."
        )
        interplay_ta = (
            f"பெயரின் வெளிப்புற அதிர்வு ({namank}, {name_planet['ta']}) உள்ளார்ந்த இயல்புக்கு "
            f"({moolank}, {core_planet['ta']}) எதிராக இழுக்கிறது. இது பெரும்பாலும், மக்கள் "
            f"கருதுவதற்கும் உள்ளுக்குள் உணர்வதற்கும் இடையே இடைவெளியாக வெளிப்படும்."
        )
    else:
        interplay = (
            f"The name's outward vibration ({namank}, {name_planet['en']}) sits neutrally "
            f"with the inner nature ({moolank}, {core_planet['en']}) — neither reinforcing "
            f"nor obstructing it."
        )
        interplay_ta = (
            f"பெயரின் வெளிப்புற அதிர்வு ({namank}, {name_planet['ta']}) உள்ளார்ந்த இயல்புடன் "
            f"({moolank}, {core_planet['ta']}) சமநிலையில் உள்ளது — வலுப்படுத்தவும் இல்லை, "
            f"தடுக்கவும் இல்லை."
        )

    # Compound-total layer. This is what distinguishes two names that reduce to
    # the same Namank (e.g. total 48 vs total 30, both -> 3). Falls back to an
    # explicit "not individually characterised" statement rather than inventing
    # a meaning for totals outside the documented range.
    compound_total = name_result["compound_total"]
    _cm = _COMPOUND_MEANING.get(compound_total)
    if _cm:
        compound_line = (
            f"Its full compound total is {compound_total}, {_cm[0]} — which is what "
            f"distinguishes this spelling from other names that also reduce to {namank}."
        )
        compound_line_ta = (
            f"இதன் முழு கூட்டு எண் {compound_total}, {_cm[1]} — இதுவே {namank} ஆகக் "
            f"குறையும் மற்ற பெயர்களிலிருந்து இந்த எழுத்தமைப்பை வேறுபடுத்துகிறது."
        )
    else:
        compound_line = (
            f"Its full compound total is {compound_total}, which is not individually "
            f"characterised in the standard compound-number table used here."
        )
        compound_line_ta = (
            f"இதன் முழு கூட்டு எண் {compound_total}; இங்கு பயன்படுத்தப்படும் நியம கூட்டு எண் "
            f"அட்டவணையில் இதற்குத் தனி விளக்கம் இல்லை."
        )

    personality_sections = [
        {
            "key": "core",
            "title": f"Inner Nature — Birth Number {moolank}",
            "title_ta": f"உள்ளார்ந்த இயல்பு — பிறப்பு எண் {moolank}",
            "source_label": "from day of birth",
            "source_label_ta": "பிறந்த நாளிலிருந்து",
            "text": core["en"],
            "text_ta": core["ta"],
        },
        {
            "key": "path",
            "title": f"Life Direction — Destiny Number {bhagyank}",
            "title_ta": f"வாழ்க்கைத் திசை — ஊழ் எண் {bhagyank}",
            "source_label": "from full date of birth",
            "source_label_ta": "முழு பிறந்த தேதியிலிருந்து",
            "text": path["en"],
            "text_ta": path["ta"],
        },
        {
            "key": "expression",
            "title": f"How This Name Projects — Name Number {namank}",
            "title_ta": f"இப்பெயர் வெளிப்படுத்துவது — பெயர் எண் {namank}",
            "source_label": "from this name's spelling",
            "source_label_ta": "இப்பெயரின் எழுத்துக்களிலிருந்து",
            "text": expression["en"] + " " + compound_line + " " + interplay,
            "text_ta": expression["ta"] + " " + compound_line_ta + " " + interplay_ta,
        },
    ]

    # Backwards-compatible flat summary (kept so nothing that already reads
    # `personality` breaks); now includes all three layers, not just Moolank.
    personality = {
        "en": f"{core['en']} {path['en']} {expression['en']} {interplay}",
        "ta": f"{core['ta']} {path['ta']} {expression['ta']} {interplay_ta}",
    }

    return {
        "name": name,
        "name_number": namank,
        "name_compound_total": name_result["compound_total"],
        "name_number_breakdown": name_result["breakdown"],
        "birth_number": moolank,
        "destiny_number": bhagyank,
        "birth_number_planet": _NUMBER_PLANET[moolank]["en"] if moolank else "",
        "birth_number_planet_ta": _NUMBER_PLANET[moolank]["ta"] if moolank else "",
        "name_number_planet": _NUMBER_PLANET[namank]["en"] if namank else "",
        "name_number_planet_ta": _NUMBER_PLANET[namank]["ta"] if namank else "",
        "relation_with_birth_number": rel_moolank,
        "relation_with_birth_number_ta": _RELATION_TA[rel_moolank],
        "relation_with_destiny_number": rel_bhagyank,
        "relation_with_destiny_number_ta": _RELATION_TA[rel_bhagyank],
        "is_favorable": status == "Favourable",
        "alignment_status": status,
        "alignment_status_ta": status_ta,
        "headline": headline,
        "headline_ta": headline_ta,
        "analysis": analysis,
        "analysis_ta": analysis_ta,
        "name_number_attributes": get_number_attributes(namank),
        "birth_number_attributes": get_number_attributes(moolank),
        "destiny_number_attributes": get_number_attributes(bhagyank),
        "master_numbers_present": detect_master_numbers(compound_total, date_of_birth),
        "personality_sections": personality_sections,
        "personality": personality["en"],
        "personality_ta": personality["ta"],
        "classical_source": (
            "Chaldean numerology letter-value system (as popularised by Cheiro's "
            "Book of Numbers). Compatibility table cross-checked against published "
            "reference-calculator output. This is a separate tradition from the "
            "Vedic Nakshatra-Pada system used elsewhere on this site and is shown "
            "independently, never merged with it."
        ),
        "disclaimer": (
            "This checks basic numerical compatibility only. Compound numbers, name "
            "composition, repeated vibrations and deeper numerological patterns are "
            "not covered by this analysis. Numerology is a separate tradition from "
            "the Vedic Nakshatra-Pada naming shown above it."
        ),
        "disclaimer_ta": (
            "இது அடிப்படை எண் பொருத்தத்தை மட்டுமே சரிபார்க்கிறது. கூட்டு எண்கள், பெயர் "
            "அமைப்பு, மீண்டும் வரும் அதிர்வுகள் மற்றும் ஆழமான எண் கணித அம்சங்கள் இதில் "
            "அடங்கவில்லை. எண் கணிதம் மேலே காட்டப்படும் வேத நட்சத்திர-பாத முறையிலிருந்து "
            "வேறுபட்ட ஒரு தனி முறையாகும்."
        ),
    }