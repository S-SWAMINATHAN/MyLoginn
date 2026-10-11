"""
Baby-name bank, batch 4 — fills the letters that fell below 20.

A-Z coverage before this batch: I = 2, O = 11, U = 16. Every other letter
with any names at all already had 20+. This adds real Tamil names for those
three, plus a spread of modern names in current use.

Same rules as every earlier batch: real names only, meanings that EXPLAIN
rather than restate the name, no padding.

F, Q, W, X and Z stay empty. Tamil has no native names beginning with those
sounds, so there is nothing real to add.
"""

from typing import Dict, List, Tuple

Entry = Tuple[str, str, str, str, str, str]
H, C, M, B, G = "hindu", "christian", "muslim", "boy", "girl"

BANK4: Dict[str, List[Entry]] = {
    # ── I : was 2 ────────────────────────────────────────────────────────
    "Ee": [
        ("Iniyan", "இனியன்", "One whose nature is sweet to all", "இனிமையான குணம் உடையவன்", B, H),
        ("Iniya", "இனியா", "Sweet natured girl", "இனிமையானவள்", G, H),
        ("Ilangovan", "இளங்கோவன்", "The young prince who renounced the throne", "சிலப்பதிகாரம் இயற்றிய இளவரசர்", B, H),
        ("Ilakkiya", "இலக்கியா", "The body of written art", "எழுத்துக் கலை", G, H),
        ("Ilavarasi", "இளவரசி", "Daughter of a royal house", "அரச குலப் பெண்", G, H),
        ("Indhumathi", "இந்துமதி", "One whose face is calm as the moon", "நிலவு போன்ற முகம் உடையவள்", G, H),
        ("Inbarasi", "இன்பரசி", "She who rules with joy", "மகிழ்ச்சியை ஆள்பவள்", G, H),
        ("Inbaraj", "இன்பராஜ்", "One who brings joy to others", "மகிழ்ச்சி தருபவன்", B, H),
        ("Isaimani", "இசைமணி", "One as precious as music", "இசையில் சிறந்தவள்", G, H),
        ("Isaivani", "இசைவாணி", "She whose voice carries music", "இசைக் குரல் உடையவள்", G, H),
        ("Ilamathi", "இளமதி", "The young crescent moon", "இளம் பிறை", G, H),
        ("Iraiyanbu", "இறையன்பு", "Love directed towards God", "இறைவன் மீது கொண்ட அன்பு", B, H),
        ("Ilangumaran", "இளங்குமரன்", "The youthful Murugan", "இளமை வடிவ முருகன்", B, H),
        ("Indhuja", "இந்துஜா", "Born of the moon", "நிலவில் தோன்றியவள்", G, H),
        ("Ishwarya", "ஐஸ்வர்யா", "Abundance in every form", "நிறைவான செல்வம்", G, H),
        ("Ilanthirayan", "இளந்திரையன்", "Young ruler of the coastal land", "கடற்கரை நாட்டு இளவரசன்", B, H),
        ("Inbanithi", "இன்பநிதி", "A treasury of happiness", "மகிழ்ச்சிக் கருவூலம்", B, H),
        ("Ilakkumi", "இலக்குமி", "She who grants abundance", "வளம் அருளும் திருமகள்", G, H),
        ("Imayavan", "இமையவன்", "One steady as the Himalaya", "இமயம் போன்ற உறுதி உடையவன்", B, H),
        ("Isakki", "இசக்கி", "Village guardian deity of the south", "தென்னக காவல் தெய்வம்", G, H),
    ],
    # ── O : was 11 ───────────────────────────────────────────────────────
    "O": [
        ("Olimathi", "ஒளிமதி", "A mind that shines with clarity", "தெளிவான அறிவு உடையவள்", G, H),
        ("Oliarasan", "ஒளியரசன்", "One who reigns like light", "ஒளி போல் ஆள்பவன்", B, H),
        ("Oviyarasi", "ஓவியரசி", "As lovely as a finished painting", "ஓவியம் போன்ற அழகி", G, H),
        ("Ottakoothan", "ஒட்டக்கூத்தன்", "Court poet of the later Cholas", "சோழர் அவைக் கவிஞர்", B, H),
        ("Ondiveeran", "ஒண்டிவீரன்", "Warrior who fought alone", "தனித்து நின்று போரிட்ட வீரன்", B, H),
        ("Oliyavan", "ஒளியவன்", "One who carries light within", "ஒளி பொருந்தியவன்", B, H),
        ("Omsakthi", "ஓம்சக்தி", "The primal sound joined with power", "பிரணவமும் சக்தியும்", G, H),
        ("Oyilarasi", "ஒயிலரசி", "Graceful in movement", "நளினமாக நடப்பவள்", G, H),
        ("Oppilan", "ஒப்பிலான்", "One without equal", "ஒப்பாரும் மிக்காரும் இல்லாதவன்", B, H),
        ("Odhimalar", "ஓதிமலர்", "A flower offered while chanting", "ஓதி வழிபடும் மலர்", G, H),
    ],
    # ── U : was 16 ───────────────────────────────────────────────────────
    "U": [
        ("Unnikrishnan", "உண்ணிகிருஷ்ணன்", "Krishna in his infant form", "குழந்தை வடிவ கண்ணன்", B, H),
        ("Uthayachandran", "உதயச்சந்திரன்", "The moon as it rises", "உதிக்கும் நிலவு", B, H),
        ("Ulagapriya", "உலகப்பிரியா", "Dear to everyone around her", "எல்லோரும் விரும்புபவள்", G, H),
        ("Uravarasi", "உறவரசி", "One who holds a family together", "உறவுகளை இணைப்பவள்", G, H),
        ("Uyirmozhi", "உயிர்மொழி", "Speech that carries life in it", "உயிருள்ள சொல்", G, H),
        ("Ulagavan", "உலகவன்", "One who belongs to the whole world", "உலகுக்கு உரியவன்", B, H),
        ("Urimai", "உரிமை", "That which is rightfully one's own", "தனக்கு உரியது", G, H),
        ("Uthirakumar", "உத்திரகுமார்", "Son born under the Uttara star", "உத்திர நட்சத்திரத்து மகன்", B, H),
    ],
    # ── Modern names in current use, spread across letters ───────────────
    "Aa": [
        ("Adhvik", "அத்விக்", "One of a kind", "ஒப்பற்றவன்", B, H),
        ("Aniga", "அனிகா", "Full of grace", "அருள் நிறைந்தவள்", G, H),
    ],
    "Ka": [
        ("Kayal", "கயல்", "Carp fish, used for lovely eyes", "கயல் விழி", G, H),
        ("Kalaimathi", "கலைமதி", "A mind gifted in the arts", "கலையறிவு உடையவள்", G, H),
    ],
    "Na": [
        ("Nithilan", "நித்திலன்", "Pearl of great worth", "விலைமதிப்பற்ற முத்து", B, H),
        ("Netrasri", "நேத்ரஸ்ரீ", "Beauty that rests in the eyes", "கண்ணழகு கொண்டவள்", G, H),
    ],
    "Ta": [
        ("Thanvi", "தன்வி", "Slender and graceful", "மெல்லிய அழகி", G, H),
        ("Tharunya", "தருண்யா", "The season of youth", "இளமைப் பருவம்", G, H),
    ],
    "Va": [
        ("Varshini", "வர்ஷிணி", "One who showers like rain", "மழை போல் அருள்பவள்", G, H),
        ("Vetrimaran", "வெற்றிமாறன்", "Pandya ruler marked by victory", "வெற்றி கண்ட பாண்டியன்", B, H),
    ],
    "Su": [
        ("Sanjana", "சஞ்சனா", "Gentle and agreeable by nature", "மென்மையான குணத்தினள்", G, H),
        ("Sarvin", "சர்வின்", "One who is complete in himself", "நிறைவானவன்", B, H),
    ],
    "Ha": [
        ("Hasini", "ஹாசினி", "One with a ready smile", "புன்னகை உடையவள்", G, H),
    ],
    "Ma": [
        ("Mithun", "மிதுன்", "Born under the Gemini sign", "மிதுன ராசியில் பிறந்தவன்", B, H),
    ],
}
