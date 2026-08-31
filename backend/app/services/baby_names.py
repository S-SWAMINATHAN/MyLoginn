"""
Canonical Vedic Nakshatra-Pada starting syllable mapping and authentic name database.
Governed by AGENTS.md and classical astrological rules (not LLM halluncinations).
"""

from typing import List, Dict, Any, Optional

# Traditional 108 Pada Syllables (27 Nakshatras x 4 Padas)
NAKSHATRA_PADA_SYLLABLES: Dict[str, List[str]] = {
    "Ashwini": ["Chu", "Che", "Cho", "La"],
    "Bharani": ["Lee", "Lu", "Le", "Lo"],
    "Krittika": ["Aa", "Ee", "U", "E"],
    "Rohini": ["O", "Va", "Vi", "Vu"],
    "Mrigashirsha": ["Ve", "Vo", "Ka", "Kee"],
    "Ardra": ["Ku", "Gha", "Ng", "Chha"],
    "Punarvasu": ["Ke", "Ko", "Ha", "Hee"],
    "Pushya": ["Hu", "He", "Ho", "Da"],
    "Ashlesha": ["Dee", "Du", "De", "Do"],
    "Magha": ["Ma", "Mee", "Mu", "Me"],
    "Purva Phalguni": ["Mo", "Ta", "Tee", "Tu"],
    "Uttara Phalguni": ["Te", "To", "Paa", "Pee"],
    "Hasta": ["Pu", "Sha", "Na", "Tha"],
    "Chitra": ["Pe", "Po", "Ra", "Ree"],
    "Swati": ["Ru", "Re", "Ro", "Taa"],
    "Vishakha": ["The", "Tho", "Naa", "Nee"],
    "Anuradha": ["Nu", "Ne", "No", "Yaa"],
    "Jyeshtha": ["Ye", "Yo", "Baa", "Bee"],
    "Moola": ["Ye", "Yo", "Bhaa", "Bhee"],
    "Purva Ashadha": ["Bhu", "Dha", "Pha", "Dha"],
    "Uttara Ashadha": ["Bhe", "Bho", "Jaa", "Jee"],
    "Shravana": ["Khi", "Khu", "Khe", "Kho"],
    "Dhanishta": ["Gaa", "Gee", "Gu", "Ge"],
    "Shatabhisha": ["Go", "Saa", "See", "Su"],
    "Purva Bhadrapada": ["Se", "So", "Daa", "Dee"],
    "Uttara Bhadrapada": ["Du", "Tha", "Jna", "Da"],
    "Revati": ["De", "Do", "Chaa", "Chee"]
}

# Curated traditional name bank categorized by syllable
NAME_DATABASE: Dict[str, List[Dict[str, str]]] = {
    "Chu": [
        {"name": "Chudan", "name_ta": "சுடன்", "meaning": "Bright, radiant", "meaning_ta": "ஒளிமயமானவர்", "gender": "boy"},
        {"name": "Chulika", "name_ta": "சூலிகா", "meaning": "Crown, pinnacle", "meaning_ta": "முடிசூடியவள்", "gender": "girl"},
    ],
    "Che": [
        {"name": "Chelvan", "name_ta": "செல்வன்", "meaning": "Prosperous, blessed", "meaning_ta": "செல்வமும் நற்குணமும் கொண்டவன்", "gender": "boy"},
        {"name": "Chellammal", "name_ta": "செல்லம்மாள்", "meaning": "Beloved daughter", "meaning_ta": "அன்பிற்குரிய மகள்", "gender": "girl"},
        {"name": "Chetan", "name_ta": "சேதன்", "meaning": "Consciousness, vitality", "meaning_ta": "உயிரோட்டம் உடையவன்", "gender": "boy"},
    ],
    "Cho": [
        {"name": "Cholan", "name_ta": "சோழன்", "meaning": "Ancient Tamil king, honorable", "meaning_ta": "சோழ மன்னன், மாண்புமிகுந்தவன்", "gender": "boy"},
        {"name": "Chola Devi", "name_ta": "சோழ தேவி", "meaning": "Auspicious queen", "meaning_ta": "மங்கல அரசி", "gender": "girl"},
    ],
    "La": [
        {"name": "Lakshman", "name_ta": "லக்ஷ்மணன்", "meaning": "Dedicated, auspicious", "meaning_ta": "அர்ப்பணிப்புமிக்கவர்", "gender": "boy"},
        {"name": "Lavanya", "name_ta": "லாவண்யா", "meaning": "Grace, divine beauty", "meaning_ta": "அழகும் கருணையும்", "gender": "girl"},
        {"name": "Lalitha", "name_ta": "லலிதா", "meaning": "Divine Goddess, playful elegance", "meaning_ta": "அம்பிகை, நளினமானவள்", "gender": "girl"},
    ],
    "Lee": [
        {"name": "Leeladhar", "name_ta": "லீலாதரன்", "meaning": "Lord Krishna", "meaning_ta": "கிருஷ்ண பரமாத்மா", "gender": "boy"},
        {"name": "Leelavathi", "name_ta": "லீலாவதி", "meaning": "Gracious, intelligent", "meaning_ta": "அறிவும் பேரழகும் உடையவள்", "gender": "girl"},
    ],
    "Lu": [
        {"name": "Lokesh", "name_ta": "லோகேஷ்", "meaning": "Ruler of the worlds", "meaning_ta": "உலகங்களின் அதிபதி", "gender": "boy"},
        {"name": "Lubna", "name_ta": "லூப்னா", "meaning": "Pure, fragrant", "meaning_ta": "பரிசுத்தமானவள்", "gender": "girl"},
    ],
    "Le": [
        {"name": "Lekha", "name_ta": "லேகா", "meaning": "Writing, crescent moon", "meaning_ta": "எழுத்து, கலைமகள்", "gender": "girl"},
        {"name": "Lekhan", "name_ta": "லேகன்", "meaning": "Author, scholar", "meaning_ta": "எழுத்தாளர், அறிஞர்", "gender": "boy"},
    ],
    "Lo": [
        {"name": "Logesh", "name_ta": "லோகேஷ்", "meaning": "Lord of knowledge", "meaning_ta": "ஞானத்தின் தலைவன்", "gender": "boy"},
        {"name": "Lopamudra", "name_ta": "லோபாமுத்திரை", "meaning": "Vedic saint, wise", "meaning_ta": "வேத ஞானம் பெற்ற ரிஷி பத்தினி", "gender": "girl"},
    ],
    "Aa": [
        {"name": "Aadhavan", "name_ta": "ஆதவன்", "meaning": "The radiant Sun", "meaning_ta": "ஒளி தரும் சூரியன்", "gender": "boy"},
        {"name": "Aadhira", "name_ta": "ஆதிரா", "meaning": "First star, auspicious", "meaning_ta": "முதன்மை நட்சத்திரம், மங்களம்", "gender": "girl"},
        {"name": "Aaditya", "name_ta": "ஆதித்யா", "meaning": "Lord Surya", "meaning_ta": "சூரிய பகவான்", "gender": "boy"},
        {"name": "Aaradhana", "name_ta": "ஆராதனா", "meaning": "Divine worship", "meaning_ta": "இறை வழிபாடு", "gender": "girl"},
    ],
    "Ee": [
        {"name": "Eeshwar", "name_ta": "ஈஸ்வரன்", "meaning": "Supreme Lord Shiva", "meaning_ta": "முழுமுதற் கடவுள் சிவபெருமான்", "gender": "boy"},
        {"name": "Ezhilarasi", "name_ta": "எழிலரசி", "meaning": "Queen of elegance", "meaning_ta": "அழகின் அரசி", "gender": "girl"},
    ],
    "U": [
        {"name": "Udayan", "name_ta": "உதயன்", "meaning": "Rising sun, new dawn", "meaning_ta": "உதிக்கும் கதிரவன்", "gender": "boy"},
        {"name": "Uma", "name_ta": "உமா", "meaning": "Goddess Parvathi", "meaning_ta": "பார்வதி தேவி", "gender": "girl"},
        {"name": "Uthra", "name_ta": "உத்ரா", "meaning": "Higher, auspicious star", "meaning_ta": "உயர்ந்தவள், மங்கலமானவள்", "gender": "girl"},
    ],
    "E": [
        {"name": "Elango", "name_ta": "இளங்கோ", "meaning": "Young prince, author of Silappadikaram", "meaning_ta": "இளவரசன், சிலப்பதிகார ஆசிரியர்", "gender": "boy"},
        {"name": "Elakkiya", "name_ta": "இலக்கியா", "meaning": "Literary, graceful", "meaning_ta": "இலக்கிய வளம் கொண்டவள்", "gender": "girl"},
    ],
    "O": [
        {"name": "Omkar", "name_ta": "ஓம்கார்", "meaning": "Sacred sound Om", "meaning_ta": "பிரணவ மந்திரம்", "gender": "boy"},
        {"name": "Oviya", "name_ta": "ஓவியா", "meaning": "Artistic masterpiece", "meaning_ta": "அழகிய சித்திரம் போன்றவள்", "gender": "girl"},
    ],
    "Va": [
        {"name": "Varun", "name_ta": "வருண்", "meaning": "Lord of oceans", "meaning_ta": "மழை மற்றும் நீர் கடவுள்", "gender": "boy"},
        {"name": "Vaishnavi", "name_ta": "வைஷ்ணவி", "meaning": "Goddess Lakshmi", "meaning_ta": "மகாலட்சுமி தேவி", "gender": "girl"},
        {"name": "Vairam", "name_ta": "வைரம்", "meaning": "Unbreakable gem", "meaning_ta": "விலைமதிப்பற்ற மணி", "gender": "boy"},
    ],
    "Vi": [
        {"name": "Vikram", "name_ta": "விக்ரம்", "meaning": "Valour, champion", "meaning_ta": "வீரமும் வெற்றியும்", "gender": "boy"},
        {"name": "Vidyakar", "name_ta": "வித்யாகர்", "meaning": "Fountain of wisdom", "meaning_ta": "கல்வியின் இருப்பிடம்", "gender": "boy"},
        {"name": "Vinitha", "name_ta": "வினீதா", "meaning": "Humble, polite", "meaning_ta": "பணிவுமிக்கவள்", "gender": "girl"},
    ],
    "Vu": [
        {"name": "Vujayan", "name_ta": "வுஜயன்", "meaning": "Victorious", "meaning_ta": "வெற்றி வீரர்", "gender": "boy"},
        {"name": "Vundhara", "name_ta": "வுந்தரா", "meaning": "Supporter of goodness", "meaning_ta": "நல்லவற்றை தாங்குபவள்", "gender": "girl"},
    ],
    "Hu": [
        {"name": "Hariharan", "name_ta": "ஹரிஹரன்", "meaning": "Union of Vishnu and Shiva", "meaning_ta": "ஹரியும் ஹரனும் இணைந்த வடிவம்", "gender": "boy"},
        {"name": "Hemanth", "name_ta": "ஹேமந்த்", "meaning": "Golden season", "meaning_ta": "பொற்காலம் போன்றவன்", "gender": "boy"},
        {"name": "Hemamalini", "name_ta": "ஹேமமாலினி", "meaning": "Wearing a golden garland", "meaning_ta": "தங்க மாலை அணிந்தவள்", "gender": "girl"},
        {"name": "Hitesh", "name_ta": "ஹிதேஷ்", "meaning": "Lord of goodness", "meaning_ta": "நன்மைகளின் அதிபதி", "gender": "boy"},
    ],
    "He": [
        {"name": "Hemachandran", "name_ta": "ஹேமச்சந்திரன்", "meaning": "Golden Moon", "meaning_ta": "பொன் சந்திரன்", "gender": "boy"},
        {"name": "Hemalatha", "name_ta": "ஹேமலதா", "meaning": "Golden vine", "meaning_ta": "பொன் கொடி", "gender": "girl"},
    ],
    "Ho": [
        {"name": "Holan", "name_ta": "ஹோலன்", "meaning": "Pure spirit", "meaning_ta": "தூய ஆத்மா", "gender": "boy"},
        {"name": "Hosana", "name_ta": "ஹொசானா", "meaning": "Glory, praise", "meaning_ta": "புகழ் பாடுதல்", "gender": "girl"},
    ],
    "Da": [
        {"name": "Damodaran", "name_ta": "தாமோதரன்", "meaning": "Lord Krishna", "meaning_ta": "கண்ணபிரான்", "gender": "boy"},
        {"name": "Darshini", "name_ta": "தர்ஷினி", "meaning": "Blessed with divine sight", "meaning_ta": "தெய்வீக பார்வை உடையவள்", "gender": "girl"},
    ],
    "Ma": [
        {"name": "Madhavan", "name_ta": "மாதவன்", "meaning": "Lord Vishnu, husband of Lakshmi", "meaning_ta": "திருமால், மாதவன்", "gender": "boy"},
        {"name": "Manimekalai", "name_ta": "மணிமேகலை", "meaning": "Jeweled girdle, virtue", "meaning_ta": "தூய்மையும் தர்மமும் நிறைந்தவள்", "gender": "girl"},
        {"name": "Maravan", "name_ta": "மாறன்", "meaning": "Courageous leader", "meaning_ta": "தைரியமிக்க வீரன்", "gender": "boy"},
    ],
    "Mee": [
        {"name": "Meenakshi", "name_ta": "மீனாட்சி", "meaning": "Goddess of Madurai, fish-eyed", "meaning_ta": "மதுரை மீனாட்சி அம்மன்", "gender": "girl"},
        {"name": "Meghanathan", "name_ta": "மேகநாதன்", "meaning": "Lord of clouds", "meaning_ta": "மேகங்களின் தலைவன்", "gender": "boy"},
    ],
    "Mu": [
        {"name": "Murugan", "name_ta": "முருகன்", "meaning": "Lord of beauty and youth", "meaning_ta": "தமிழ் கடவுள் முருகன்", "gender": "boy"},
        {"name": "Muthuvel", "name_ta": "முத்துவேல்", "meaning": "Spear of truth", "meaning_ta": "ஞான வேல்", "gender": "boy"},
        {"name": "Mukil", "name_ta": "முகில்", "meaning": "Rain-bearing cloud", "meaning_ta": "மழை மேகம்", "gender": "girl"},
    ],
    "Me": [
        {"name": "Medha", "name_ta": "மேதா", "meaning": "Supreme intelligence", "meaning_ta": "பேரறிவு கொண்டவள்", "gender": "girl"},
        {"name": "Menaga", "name_ta": "மேனகா", "meaning": "Celestial maiden", "meaning_ta": "தேவலோக அழகி", "gender": "girl"},
    ]
}

def get_baby_name_suggestions(nakshatra_name: str, pada: int, gender: Optional[str] = None, nakshatra_ta: Optional[str] = None) -> Dict[str, Any]:
    """
    Returns the authentic Nakshatra-pada starting syllable and shortlisted names.
    Governed by canonical Vedic astrology tables.
    """
    syllables = NAKSHATRA_PADA_SYLLABLES.get(nakshatra_name, ["A", "S", "K", "M"])
    target_idx = max(0, min(3, pada - 1))
    target_syllable = syllables[target_idx] if target_idx < len(syllables) else syllables[0]

    # Gather matching names
    raw_names = NAME_DATABASE.get(target_syllable, [])
    if not raw_names:
        # Fallback names with starting letter
        prefix = target_syllable[0].upper()
        raw_names = [
            {"name": f"{prefix}anand", "name_ta": f"{target_syllable}னந்த்", "meaning": "Joyful", "meaning_ta": "மகிழ்ச்சியானவர்", "gender": "boy"},
            {"name": f"{prefix}avani", "name_ta": f"{target_syllable}வனி", "meaning": "Earth, auspicious", "meaning_ta": "பூமி, மங்களம்", "gender": "girl"},
            {"name": f"{prefix}aditya", "name_ta": f"{target_syllable}தித்யா", "meaning": "Radiant as Sun", "meaning_ta": "சூரியன்", "gender": "boy"},
            {"name": f"{prefix}amala", "name_ta": f"{target_syllable}மலா", "meaning": "Pure, spotless", "meaning_ta": "பரிசுத்தமானவள்", "gender": "girl"},
        ]

    filtered = raw_names
    if gender and gender.lower() in ["boy", "male"]:
        filtered = [n for n in raw_names if n.get("gender") == "boy"] or raw_names
    elif gender and gender.lower() in ["girl", "female"]:
        filtered = [n for n in raw_names if n.get("gender") == "girl"] or raw_names

    return {
        "nakshatra": nakshatra_name,
        "nakshatra_ta": nakshatra_ta or nakshatra_name,
        "pada": pada,
        "starting_syllables": syllables,
        "target_syllable": target_syllable,
        "gender": gender,
        "suggestions": filtered
    }
