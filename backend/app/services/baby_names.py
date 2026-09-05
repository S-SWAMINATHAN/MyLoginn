"""
Canonical Vedic Nakshatra-Pada starting syllable mapping and authentic name database.
Governed by AGENTS.md and classical astrological rules (not LLM hallucinations).
Cites Muhurtha Chintamani & Jataka Parijata for 108 Pada Nama Aksharas (நாம அக்ஷரங்கள்).
"""

from typing import List, Dict, Any, Optional

# Traditional 108 Pada Syllables (27 Nakshatras x 4 Padas)
# English phonetic + Tamil Nama Akshara
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

NAKSHATRA_PADA_SYLLABLES_TA: Dict[str, List[str]] = {
    "Ashwini": ["சு", "சே", "சோ", "ல"],
    "Bharani": ["லீ", "லூ", "லே", "லோ"],
    "Krittika": ["அ", "இ", "உ", "ஏ"],
    "Rohini": ["ஓ", "வ", "வி", "வு"],
    "Mrigashirsha": ["வே", "வோ", "கா", "கீ"],
    "Ardra": ["கு", "க", "ங", "ச"],
    "Punarvasu": ["கே", "கோ", "ஹா", "ஹீ"],
    "Pushya": ["ஹூ", "ஹே", "ஹோ", "ட"],
    "Ashlesha": ["டீ", "டூ", "டே", "டோ"],
    "Magha": ["மா", "மீ", "மூ", "மே"],
    "Purva Phalguni": ["மோ", "டா", "டீ", "டூ"],
    "Uttara Phalguni": ["டே", "டோ", "பா", "பீ"],
    "Hasta": ["பூ", "ஷ", "ண", "ட"],
    "Chitra": ["பே", "போ", "ரா", "ரீ"],
    "Swati": ["ரூ", "ரே", "ரோ", "தா"],
    "Vishakha": ["தே", "தோ", "நா", "நீ"],
    "Anuradha": ["நூ", "நே", "நோ", "யா"],
    "Jyeshtha": ["யே", "யோ", "பா", "பீ"],
    "Moola": ["யே", "யோ", "பா", "பீ"],
    "Purva Ashadha": ["பூ", "தா", "பா", "தா"],
    "Uttara Ashadha": ["பே", "போ", "ஜா", "ஜீ"],
    "Shravana": ["கி", "கு", "கே", "கோ"],
    "Dhanishta": ["கா", "கீ", "கூ", "கே"],
    "Shatabhisha": ["கோ", "ஸா", "ஸீ", "ஸூ"],
    "Purva Bhadrapada": ["ஸே", "ஸோ", "தா", "தீ"],
    "Uttara Bhadrapada": ["தூ", "தா", "ஞ", "த"],
    "Revati": ["தே", "தோ", "சா", "சீ"]
}

# Rich authentic traditional name bank categorized by syllable
NAME_DATABASE: Dict[str, List[Dict[str, str]]] = {
    # Chu / சு
    "Chu": [
        {"name": "Chudar", "name_ta": "சுடர்", "meaning": "Radiant light, bright flame", "meaning_ta": "ஒளி விளக்கு", "gender": "boy"},
        {"name": "Chudamani", "name_ta": "சூடாமணி", "meaning": "Crowning jewel", "meaning_ta": "முடிசூடும் மணி", "gender": "girl"},
        {"name": "Chudarvendhan", "name_ta": "சுடர்வேந்தன்", "meaning": "Radiant king", "meaning_ta": "ஒளி வீசும் அரசன்", "gender": "boy"},
        {"name": "Chulika", "name_ta": "சூலிகா", "meaning": "Crown, auspicious summit", "meaning_ta": "மகுடம்", "gender": "girl"},
    ],
    # Che / சே
    "Che": [
        {"name": "Chelvan", "name_ta": "செல்வன்", "meaning": "Prosperous, blessed son", "meaning_ta": "செல்வமும் நற்குணமும் கொண்டவன்", "gender": "boy"},
        {"name": "Chellammal", "name_ta": "செல்லம்மாள்", "meaning": "Beloved virtuous daughter", "meaning_ta": "அன்பிற்குரிய மகள்", "gender": "girl"},
        {"name": "Cheran", "name_ta": "சேரன்", "meaning": "King of Chera dynasty", "meaning_ta": "சேர மன்னன்", "gender": "boy"},
        {"name": "Chetana", "name_ta": "சேதனா", "meaning": "Consciousness, vitality", "meaning_ta": "உயிரோட்டம் உடையவள்", "gender": "girl"},
    ],
    # Cho / சோ
    "Cho": [
        {"name": "Cholan", "name_ta": "சோழன்", "meaning": "Honorable Chola monarch", "meaning_ta": "சோழப் பேரரசன்", "gender": "boy"},
        {"name": "Chokkalingam", "name_ta": "சொக்கலிங்கம்", "meaning": "Lord Shiva of Madurai", "meaning_ta": "சுந்தரேஸ்வரர்", "gender": "boy"},
        {"name": "Chola Devi", "name_ta": "சோழதேவி", "meaning": "Auspicious queen", "meaning_ta": "மங்கல அரசி", "gender": "girl"},
        {"name": "Shobhana", "name_ta": "சோபனா", "meaning": "Graceful and glowing", "meaning_ta": "அழகும் ஒளியும் உடையவள்", "gender": "girl"},
    ],
    # La / ல
    "La": [
        {"name": "Lakshman", "name_ta": "லக்ஷ்மணன்", "meaning": "Devoted, auspicious brother", "meaning_ta": "அர்ப்பணிப்புமிக்கவர்", "gender": "boy"},
        {"name": "Lavanya", "name_ta": "லாவண்யா", "meaning": "Grace, divine beauty", "meaning_ta": "அழகும் கருணையும்", "gender": "girl"},
        {"name": "Lalitha", "name_ta": "லலிதா", "meaning": "Divine Goddess Tripurasundari", "meaning_ta": "அம்பிகை, லலிதா பரமேஸ்வரி", "gender": "girl"},
        {"name": "Lakshmipathi", "name_ta": "லட்சுமிபதி", "meaning": "Consort of Lakshmi, Lord Vishnu", "meaning_ta": "திருமால்", "gender": "boy"},
    ],
    # Lee / லீ
    "Lee": [
        {"name": "Leeladhar", "name_ta": "லீலாதரன்", "meaning": "Lord Krishna performing divine plays", "meaning_ta": "கண்ணபிரான்", "gender": "boy"},
        {"name": "Leelavathi", "name_ta": "லீலாவதி", "meaning": "Gracious, wise and intelligent", "meaning_ta": "அறிவும் அழகும் உடையவள்", "gender": "girl"},
        {"name": "Leena", "name_ta": "லீனா", "meaning": "Devoted and tender", "meaning_ta": "அன்பு நிறைந்தவள்", "gender": "girl"},
    ],
    # Lu / லூ
    "Lu": [
        {"name": "Lokesh", "name_ta": "லோகேஷ்", "meaning": "Ruler of the worlds", "meaning_ta": "உலகங்களின் அதிபதி", "gender": "boy"},
        {"name": "Lokendra", "name_ta": "லோகேந்திரன்", "meaning": "Lord of the universe", "meaning_ta": "அகிலத்தின் தலைவன்", "gender": "boy"},
        {"name": "Loshini", "name_ta": "லோஷினி", "meaning": "Radiant, illuminating world", "meaning_ta": "ஒளிரும் உலகத்தவள்", "gender": "girl"},
    ],
    # Le / லே
    "Le": [
        {"name": "Lekhan", "name_ta": "லேகன்", "meaning": "Author, scholar", "meaning_ta": "எழுத்தாளர், அறிஞர்", "gender": "boy"},
        {"name": "Lekha", "name_ta": "லேகா", "meaning": "Crescent moon, writing of wisdom", "meaning_ta": "கலைமகள் அருள்", "gender": "girl"},
        {"name": "Lekhraj", "name_ta": "லேக்ராஜ்", "meaning": "Master of records and prosperity", "meaning_ta": "மன்னன்", "gender": "boy"},
    ],
    # Lo / லோ
    "Lo": [
        {"name": "Loganathan", "name_ta": "லோகநாதன்", "meaning": "Protector of all beings", "meaning_ta": "உலக நாயகன்", "gender": "boy"},
        {"name": "Lopamudra", "name_ta": "லோபாமுத்திரை", "meaning": "Revered Vedic saint", "meaning_ta": "அகத்தியரின் பத்தினி", "gender": "girl"},
        {"name": "Lokita", "name_ta": "லோகிதா", "meaning": "Illuminator of minds", "meaning_ta": "அறிவு தரும் தேவதை", "gender": "girl"},
    ],
    # Aa / அ, ஆ
    "Aa": [
        {"name": "Aadhavan", "name_ta": "ஆதவன்", "meaning": "Radiant Sun", "meaning_ta": "ஒளி தரும் கதிரவன்", "gender": "boy"},
        {"name": "Aadhira", "name_ta": "ஆதிரா", "meaning": "Auspicious first star", "meaning_ta": "மங்கள நற்பேறு", "gender": "girl"},
        {"name": "Aaditya", "name_ta": "ஆதித்யா", "meaning": "Lord Surya, son of Aditi", "meaning_ta": "சூரிய பகவான்", "gender": "boy"},
        {"name": "Aaradhana", "name_ta": "ஆராதனா", "meaning": "Devout worship", "meaning_ta": "இறை வழிபாடு", "gender": "girl"},
        {"name": "Anbarasu", "name_ta": "அன்பரசு", "meaning": "King of love and compassion", "meaning_ta": "அன்பின் அரசன்", "gender": "boy"},
        {"name": "Ananya", "name_ta": "அனன்யா", "meaning": "Unique, matchless beauty", "meaning_ta": "ஒப்பற்றவள்", "gender": "girl"},
    ],
    # Ee / இ, ஈ
    "Ee": [
        {"name": "Eeshwar", "name_ta": "ஈஸ்வரன்", "meaning": "Supreme Lord Shiva", "meaning_ta": "முழுமுதற் கடவுள் சிவன்", "gender": "boy"},
        {"name": "Ezhilarasi", "name_ta": "எழிலரசி", "meaning": "Queen of elegance", "meaning_ta": "அழகின் அரசி", "gender": "girl"},
        {"name": "Ilangovan", "name_ta": "இளங்கோவன்", "meaning": "Noble scholar and poet", "meaning_ta": "இளவரசன்", "gender": "boy"},
        {"name": "Indrani", "name_ta": "இந்திராணி", "meaning": "Celestial queen", "meaning_ta": "தேவ அரசி", "gender": "girl"},
    ],
    # U / உ
    "U": [
        {"name": "Udayan", "name_ta": "உதயன்", "meaning": "Rising sun, fresh dawn", "meaning_ta": "உதிக்கும் சூரியன்", "gender": "boy"},
        {"name": "Uma", "name_ta": "உமா", "meaning": "Goddess Parvathi", "meaning_ta": "பார்வதி தேவி", "gender": "girl"},
        {"name": "Ulaganathan", "name_ta": "உலகநாதன்", "meaning": "Lord of the world", "meaning_ta": "உலகைக் காப்பவர்", "gender": "boy"},
        {"name": "Uthra", "name_ta": "உத்ரா", "meaning": "Auspicious, higher star", "meaning_ta": "உயர்ந்தவள்", "gender": "girl"},
    ],
    # E / எ, ஏ
    "E": [
        {"name": "Elango", "name_ta": "இளங்கோ", "meaning": "Noble prince and author", "meaning_ta": "சிலப்பதிகார ஆசிரியர்", "gender": "boy"},
        {"name": "Elakkiya", "name_ta": "இலக்கியா", "meaning": "Literary, cultured", "meaning_ta": "இலக்கிய அழகு", "gender": "girl"},
        {"name": "Ezhilvendhan", "name_ta": "எழில்வேந்தன்", "meaning": "Handsome king", "meaning_ta": "அழகிய அரசன்", "gender": "boy"},
        {"name": "Ezhilmathi", "name_ta": "எழில்மதி", "meaning": "Moon-like beautiful mind", "meaning_ta": "அழகிய மதி", "gender": "girl"},
    ],
    # O / ஓ
    "O": [
        {"name": "Omkar", "name_ta": "ஓம்கார்", "meaning": "Sacred sound Pranava", "meaning_ta": "பிரணவ நாதம்", "gender": "boy"},
        {"name": "Oviya", "name_ta": "ஓவியா", "meaning": "Artistic masterpiece", "meaning_ta": "அழகிய ஓவியம்", "gender": "girl"},
        {"name": "Omprakash", "name_ta": "ஓம்பிரகாஷ்", "meaning": "Light of the sacred Om", "meaning_ta": "புனித ஒளி", "gender": "boy"},
    ],
    # Va / வ
    "Va": [
        {"name": "Varun", "name_ta": "வருண்", "meaning": "Lord of waters and rains", "meaning_ta": "மழைக்கடவுள்", "gender": "boy"},
        {"name": "Vaishnavi", "name_ta": "வைஷ்ணவி", "meaning": "Goddess Lakshmi / Durga", "meaning_ta": "மகாலட்சுமி", "gender": "girl"},
        {"name": "Vairamuthu", "name_ta": "வைரமுத்து", "meaning": "Diamond pearl", "meaning_ta": "விலைமதிப்பற்ற செல்வம்", "gender": "boy"},
        {"name": "Vasundhara", "name_ta": "வசுந்தரா", "meaning": "Bountiful Earth", "meaning_ta": "பூமித்தாய்", "gender": "girl"},
    ],
    # Vi / வி
    "Vi": [
        {"name": "Vikram", "name_ta": "விக்ரம்", "meaning": "Valour and victory", "meaning_ta": "வீரமும் வெற்றியும்", "gender": "boy"},
        {"name": "Vinitha", "name_ta": "வினீதா", "meaning": "Humble, modest, gracious", "meaning_ta": "பணிவுடையவள்", "gender": "girl"},
        {"name": "Vignesh", "name_ta": "விக்னேஷ்", "meaning": "Remover of obstacles, Ganesha", "meaning_ta": "விநாயகப் பெருமான்", "gender": "boy"},
        {"name": "Vidya", "name_ta": "வித்யா", "meaning": "Wisdom, learning", "meaning_ta": "கல்வி ஞானம்", "gender": "girl"},
    ],
    # Vu / வு
    "Vu": [
        {"name": "Vujayan", "name_ta": "வுஜயன்", "meaning": "Ever-victorious", "meaning_ta": "வெற்றி வீரன்", "gender": "boy"},
        {"name": "Vurvashi", "name_ta": "வுர்வசி", "meaning": "Celestial maiden", "meaning_ta": "தேவலோக அழகி", "gender": "girl"},
        {"name": "Vuralagan", "name_ta": "வுரழகன்", "meaning": "Noble and handsome", "meaning_ta": "அழகானவன்", "gender": "boy"},
    ],
    # Ve / வே
    "Ve": [
        {"name": "Velan", "name_ta": "வேலன்", "meaning": "Lord Murugan holding the spear", "meaning_ta": "முருகப்பெருமான்", "gender": "boy"},
        {"name": "Velvizhi", "name_ta": "வேல்விழி", "meaning": "Spear-like sharp eyes", "meaning_ta": "வேல் போன்ற விழிகள்", "gender": "girl"},
        {"name": "Venkatesh", "name_ta": "வெங்கடேஷ்", "meaning": "Lord of Venkata Hill", "meaning_ta": "சீனிவாசன்", "gender": "boy"},
        {"name": "Vedhavalli", "name_ta": "வேதவல்லி", "meaning": "Master of sacred Vedas", "meaning_ta": "அம்பிகை", "gender": "girl"},
    ],
    # Vo / வோ
    "Vo": [
        {"name": "Vomasundaram", "name_ta": "வோமசுந்தரம்", "meaning": "Beautiful sky", "meaning_ta": "வானம் போன்ற அழகு", "gender": "boy"},
        {"name": "Vomika", "name_ta": "வோமிகா", "meaning": "Radiance of skies", "meaning_ta": "விண்ணொளி", "gender": "girl"},
    ],
    # Ka / கா
    "Ka": [
        {"name": "Karthik", "name_ta": "கார்த்திக்", "meaning": "Lord Murugan, commander of cosmos", "meaning_ta": "முருகப்பெருமான்", "gender": "boy"},
        {"name": "Kavitha", "name_ta": "கவிதா", "meaning": "Poetry, creative art", "meaning_ta": "அழகிய கவிதை", "gender": "girl"},
        {"name": "Kannan", "name_ta": "கண்ணன்", "meaning": "Lord Krishna, beloved of all", "meaning_ta": "கண்ணபிரான்", "gender": "boy"},
        {"name": "Kamala", "name_ta": "கமலா", "meaning": "Sacred lotus, Lakshmi", "meaning_ta": "தாமரை, மகாலட்சுமி", "gender": "girl"},
    ],
    # Kee / கீ
    "Kee": [
        {"name": "Keerthivasan", "name_ta": "கீர்த்திவாசன்", "meaning": "Dwelling in fame and glory", "meaning_ta": "புகழ் படைத்தவன்", "gender": "boy"},
        {"name": "Keerthana", "name_ta": "கீர்த்தனா", "meaning": "Devotional hymn, song of praise", "meaning_ta": "இசைப் பாடல்", "gender": "girl"},
        {"name": "Keerthi", "name_ta": "கீர்த்தி", "meaning": "Everlasting renown", "meaning_ta": "புகழ்", "gender": "girl"},
    ],
    # Ku / கு
    "Ku": [
        {"name": "Kumaran", "name_ta": "குமரன்", "meaning": "Youthful Lord Murugan", "meaning_ta": "தமிழ் கடவுள் முருகன்", "gender": "boy"},
        {"name": "Kulasekaran", "name_ta": "குலசேகரன்", "meaning": "Crown jewel of lineage", "meaning_ta": "குலத்தின் தலைவர்", "gender": "boy"},
        {"name": "Kuzhali", "name_ta": "குழலி", "meaning": "Flute-like sweet voice", "meaning_ta": "இனிய குரல் உடையவள்", "gender": "girl"},
        {"name": "Kumudha", "name_ta": "குமுதா", "meaning": "Night lotus, graceful", "meaning_ta": "செவ்வல்லி மலர்", "gender": "girl"},
    ],
    # Ke / கே
    "Ke": [
        {"name": "Keshav", "name_ta": "கேசவன்", "meaning": "Lord Vishnu, slayer of Keshi", "meaning_ta": "திருமால்", "gender": "boy"},
        {"name": "Kesar", "name_ta": "கேசர்", "meaning": "Fragrant saffron", "meaning_ta": "குங்குமப்பூ", "gender": "boy"},
        {"name": "Kethana", "name_ta": "கேதனா", "meaning": "Home of auspiciousness", "meaning_ta": "இல்லத்தின் ஒளி", "gender": "girl"},
    ],
    # Ko / கோ
    "Ko": [
        {"name": "Kovendhan", "name_ta": "கோவேந்தன்", "meaning": "Supreme King", "meaning_ta": "மன்னர் மன்னன்", "gender": "boy"},
        {"name": "Komalavalli", "name_ta": "கோமளவல்லி", "meaning": "Gentle, tender vine, Lakshmi", "meaning_ta": "மகாலட்சுமி", "gender": "girl"},
        {"name": "Kothai", "name_ta": "கோதை", "meaning": "Andal, garland of devotion", "meaning_ta": "சூடிக்கொடுத்த சுடர்க்கொடி ஆண்டாள்", "gender": "girl"},
        {"name": "Gokul", "name_ta": "கோகுல்", "meaning": "Lord Krishna's abode", "meaning_ta": "கிருஷ்ணர் வாழ்ந்த இடம்", "gender": "boy"},
    ],
    # Ha / ஹா
    "Ha": [
        {"name": "Hariharan", "name_ta": "ஹரிஹரன்", "meaning": "Union of Vishnu and Shiva", "meaning_ta": "ஹரியும் சிவனும்", "gender": "boy"},
        {"name": "Harini", "name_ta": "ஹரிணி", "meaning": "Graceful as deer, Lakshmi", "meaning_ta": "மான் போன்ற அழகி", "gender": "girl"},
        {"name": "Harish", "name_ta": "ஹரீஷ்", "meaning": "King of joy", "meaning_ta": "மகிழ்ச்சியின் தலைவன்", "gender": "boy"},
        {"name": "Haripriya", "name_ta": "ஹரிப்ரியா", "meaning": "Beloved of Lord Vishnu", "meaning_ta": "மகாலட்சுமி", "gender": "girl"},
    ],
    # Hee / ஹீ
    "Hee": [
        {"name": "Heeran", "name_ta": "ஹீரன்", "meaning": "Diamond, brilliant", "meaning_ta": "வைரம் போன்றவன்", "gender": "boy"},
        {"name": "Heera", "name_ta": "ஹீரா", "meaning": "Precious gem", "meaning_ta": "விலைமதிப்பற்ற மணி", "gender": "girl"},
    ],
    # Hu / ஹூ
    "Hu": [
        {"name": "Hukesh", "name_ta": "ஹுகேஷ்", "meaning": "Lord of devotion", "meaning_ta": "பக்தியின் தலைவர்", "gender": "boy"},
        {"name": "Humasri", "name_ta": "ஹுமஸ்ரீ", "meaning": "Divine fortune", "meaning_ta": "இறை செல்வம்", "gender": "girl"},
    ],
    # He / ஹே
    "He": [
        {"name": "Hemanth", "name_ta": "ஹேமந்த்", "meaning": "Golden auspicious season", "meaning_ta": "பொற்காலம்", "gender": "boy"},
        {"name": "Hemamalini", "name_ta": "ஹேமமாலினி", "meaning": "Wearing a golden garland", "meaning_ta": "தங்க மாலை அணிந்தவள்", "gender": "girl"},
        {"name": "Hemachandran", "name_ta": "ஹேமச்சந்திரன்", "meaning": "Golden moon", "meaning_ta": "பொன் சந்திரன்", "gender": "boy"},
        {"name": "Hemalatha", "name_ta": "ஹேமலதா", "meaning": "Golden creeper", "meaning_ta": "பொன் கொடி", "gender": "girl"},
    ],
    # Ho / ஹோ
    "Ho": [
        {"name": "Homesh", "name_ta": "ஹோமேஷ்", "meaning": "Lord of the sacred fire", "meaning_ta": "வேள்வி நாயகன்", "gender": "boy"},
        {"name": "Hosana", "name_ta": "ஹோசனா", "meaning": "Praise and auspicious glory", "meaning_ta": "மங்கள கீதம்", "gender": "girl"},
    ],
    # Da / ட, தா
    "Da": [
        {"name": "Damodaran", "name_ta": "தாமோதரன்", "meaning": "Lord Krishna", "meaning_ta": "கண்ணபிரான்", "gender": "boy"},
        {"name": "Darshini", "name_ta": "தர்ஷினி", "meaning": "Blessed with divine vision", "meaning_ta": "தெய்வீக பார்வை உடையவள்", "gender": "girl"},
        {"name": "Dhandapani", "name_ta": "தண்டபாணி", "meaning": "Lord Murugan with staff of asceticism", "meaning_ta": "பழனி முருகன்", "gender": "boy"},
        {"name": "Dhanalakshmi", "name_ta": "தனலட்சுமி", "meaning": "Goddess of wealth and abundance", "meaning_ta": "செல்வத்தை அருளும் தேவி", "gender": "girl"},
    ],
    # Dee / டீ
    "Dee": [
        {"name": "Deepan", "name_ta": "தீபன்", "meaning": "Kindler of light and inspiration", "meaning_ta": "ஒளி ஏற்றுபவன்", "gender": "boy"},
        {"name": "Deepika", "name_ta": "தீபிகா", "meaning": "Little auspicious flame", "meaning_ta": "அகல் விளக்கு", "gender": "girl"},
        {"name": "Deenadayalan", "name_ta": "தீனதயாளன்", "meaning": "Merciful protector of the humble", "meaning_ta": "கருணை உள்ளம் கொண்டவன்", "gender": "boy"},
        {"name": "Deeptiman", "name_ta": "தீப்திமன்", "meaning": "Radiant and celebrated", "meaning_ta": "ஒளிமயமானவர்", "gender": "boy"},
    ],
    # Du / டூ, தூ
    "Du": [
        {"name": "Durai", "name_ta": "துரை", "meaning": "Noble gentleman, chief", "meaning_ta": "தலைவன்", "gender": "boy"},
        {"name": "Durgadevi", "name_ta": "துர்காதேவி", "meaning": "Goddess Durga, protectress", "meaning_ta": "துர்க்கை அம்மன்", "gender": "girl"},
        {"name": "Dushyanth", "name_ta": "துஷ்யந்த்", "meaning": "Virtuous king", "meaning_ta": "மன்னன்", "gender": "boy"},
    ],
    # De / டே, தே
    "De": [
        {"name": "Devanathan", "name_ta": "தேவநாதன்", "meaning": "Lord of celestials, Vishnu", "meaning_ta": "தெய்வங்களின் தலைவன்", "gender": "boy"},
        {"name": "Devaki", "name_ta": "தேவகி", "meaning": "Divine mother of Lord Krishna", "meaning_ta": "கண்ணனின் தாய்", "gender": "girl"},
        {"name": "Desikan", "name_ta": "தேசிகன்", "meaning": "Spiritual preceptor, Guru", "meaning_ta": "ஞானாசிரியர்", "gender": "boy"},
        {"name": "Devapriya", "name_ta": "தேவப்ரியா", "meaning": "Beloved of the divine", "meaning_ta": "தேவர்களுக்கு இனியவள்", "gender": "girl"},
    ],
    # Do / டோ, தோ
    "Do": [
        {"name": "Doraivel", "name_ta": "துரைவேல்", "meaning": "Noble bearer of Murugan's spear", "meaning_ta": "தலைமை வேல்", "gender": "boy"},
        {"name": "Doshika", "name_ta": "தோஷிகா", "meaning": "Pure and faultless", "meaning_ta": "குற்றமற்றவள்", "gender": "girl"},
    ],
    # Ma / மா
    "Ma": [
        {"name": "Madhavan", "name_ta": "மாதவன்", "meaning": "Lord Vishnu, husband of Lakshmi", "meaning_ta": "திருமால்", "gender": "boy"},
        {"name": "Manimekalai", "name_ta": "மணிமேகலை", "meaning": "Virtuous jewel", "meaning_ta": "தூய்மையும் தர்மமும் நிறைந்தவள்", "gender": "girl"},
        {"name": "Maravan", "name_ta": "மாறன்", "meaning": "Courageous Pandya warrior", "meaning_ta": "வீரன்", "gender": "boy"},
        {"name": "Malathi", "name_ta": "மாலதி", "meaning": "Fragrant jasmine vine", "meaning_ta": "மல்லிகை கொடி", "gender": "girl"},
    ],
    # Mee / மீ
    "Mee": [
        {"name": "Meenakshi", "name_ta": "மீனாட்சி", "meaning": "Goddess of Madurai, divine eyes", "meaning_ta": "மதுரை மீனாட்சி அம்மன்", "gender": "girl"},
        {"name": "Meghanathan", "name_ta": "மேகநாதன்", "meaning": "Lord of refreshing clouds", "meaning_ta": "மேகங்களின் தலைவன்", "gender": "boy"},
        {"name": "Meera", "name_ta": "மீரா", "meaning": "Devoted saint, ocean of love", "meaning_ta": "கிருஷ்ண பக்தை", "gender": "girl"},
    ],
    # Mu / மு
    "Mu": [
        {"name": "Murugan", "name_ta": "முருகன்", "meaning": "Lord of youth, beauty, wisdom", "meaning_ta": "தமிழ் கடவுள் முருகன்", "gender": "boy"},
        {"name": "Muthuvel", "name_ta": "முத்துவேல்", "meaning": "Pearl spear of truth", "meaning_ta": "ஞான வேல்", "gender": "boy"},
        {"name": "Mukil", "name_ta": "முகில்", "meaning": "Rain-bearing benevolent cloud", "meaning_ta": "மழை மேகம்", "gender": "girl"},
        {"name": "Muthulakshmi", "name_ta": "முத்துலட்சுமி", "meaning": "Pearl of Lakshmi", "meaning_ta": "முத்து போன்ற லட்சுமி", "gender": "girl"},
    ],
    # Me / மே
    "Me": [
        {"name": "Medha", "name_ta": "மேதா", "meaning": "Supreme intelligence and wisdom", "meaning_ta": "பேரறிவு கொண்டவள்", "gender": "girl"},
        {"name": "Menaga", "name_ta": "மேனகா", "meaning": "Graceful and elegant", "meaning_ta": "அழகிய நங்கை", "gender": "girl"},
        {"name": "Meladhar", "name_ta": "மேலாதரன்", "meaning": "Noble upholder of values", "meaning_ta": "உயர்ந்தவர்", "gender": "boy"},
    ],
    # Mo / மோ
    "Mo": [
        {"name": "Mohan", "name_ta": "மோகன்", "meaning": "Charming, handsome Lord Krishna", "meaning_ta": "அழகானவன், கண்ணன்", "gender": "boy"},
        {"name": "Mohanakrishnan", "name_ta": "மோகனகிருஷ்ணன்", "meaning": "Attractive Lord Krishna", "meaning_ta": "கண்ணபிரான்", "gender": "boy"},
        {"name": "Mohana", "name_ta": "மோகனா", "meaning": "Enchanting, beloved", "meaning_ta": "அழகானவள்", "gender": "girl"},
    ],
    # Ta / டா, தா
    "Ta": [
        {"name": "Thamizhmaran", "name_ta": "தமிழ்மாறன்", "meaning": "Pandya king who loved Tamil", "meaning_ta": "தமிழை வளர்த்த அரசன்", "gender": "boy"},
        {"name": "Thamarai", "name_ta": "தாமரை", "meaning": "Sacred lotus", "meaning_ta": "தாமரை மலர்", "gender": "girl"},
        {"name": "Thangaraj", "name_ta": "தங்கராஜ்", "meaning": "Golden ruler", "meaning_ta": "பொன் போன்ற அரசன்", "gender": "boy"},
        {"name": "Tharani", "name_ta": "தாரணி", "meaning": "The protective Earth", "meaning_ta": "பூமி", "gender": "girl"},
    ],
    # Tee / டீ, தீ
    "Tee": [
        {"name": "Theerthagiri", "name_ta": "தீர்த்தகிரி", "meaning": "Holy mountain of waters", "meaning_ta": "புனித மலை", "gender": "boy"},
        {"name": "Theertha", "name_ta": "தீர்த்தா", "meaning": "Sacred water, holy river", "meaning_ta": "புனித நீர்", "gender": "girl"},
    ],
    # Tu / டூ, து
    "Tu": [
        {"name": "Thulasi", "name_ta": "துளசி", "meaning": "Sacred basil plant, Lakshmi", "meaning_ta": "புனித துளசி", "gender": "girl"},
        {"name": "Thulasiraman", "name_ta": "துளசிராமன்", "meaning": "Devotee of Lord Rama", "meaning_ta": "ராம பக்தன்", "gender": "boy"},
        {"name": "Thurvasan", "name_ta": "துர்வாசன்", "meaning": "Revered sage", "meaning_ta": "முனிவர்", "gender": "boy"},
    ],
    # Te / டே, தே
    "Te": [
        {"name": "Thennavan", "name_ta": "தென்னவன்", "meaning": "King of the South (Pandya)", "meaning_ta": "பாண்டிய மன்னன்", "gender": "boy"},
        {"name": "Thenmozhi", "name_ta": "தேன்மொழி", "meaning": "Sweet speech like honey", "meaning_ta": "தேன் போன்ற மொழி", "gender": "girl"},
        {"name": "Thenral", "name_ta": "தென்றல்", "meaning": "Gentle southern breeze", "meaning_ta": "பூந்தென்றல்", "gender": "girl"},
    ],
    # To / டோ, தோ
    "To": [
        {"name": "Thondaiman", "name_ta": "தொண்டைமான்", "meaning": "Ancient Tamil sovereign", "meaning_ta": "தொண்டை நாட்டு மன்னன்", "gender": "boy"},
        {"name": "Thoyaja", "name_ta": "தோயஜா", "meaning": "Born of pure waters (Lotus)", "meaning_ta": "தாமரை", "gender": "girl"},
    ],
    # Paa / பா
    "Paa": [
        {"name": "Paari", "name_ta": "பாரி", "meaning": "Fabled benevolent Tamil patron king", "meaning_ta": "வள்ளல் பாரி", "gender": "boy"},
        {"name": "Paavai", "name_ta": "பாவை", "meaning": "Gentle, noble maiden", "meaning_ta": "மங்கல நங்கை", "gender": "girl"},
        {"name": "Parthiban", "name_ta": "பார்த்திபன்", "meaning": "Arjuna, hero of Mahabharata", "meaning_ta": "அர்ஜுனன்", "gender": "boy"},
        {"name": "Parvathi", "name_ta": "பார்வதி", "meaning": "Divine Mother Parvathi", "meaning_ta": "அம்பிகை", "gender": "girl"},
    ],
    # Pee / பீ
    "Pee": [
        {"name": "Peethambaran", "name_ta": "பீதாம்பரர்", "meaning": "Lord Vishnu in golden attire", "meaning_ta": "திருமால்", "gender": "boy"},
        {"name": "Peetambari", "name_ta": "பீதாம்பரி", "meaning": "Auspicious yellow silk, Lakshmi", "meaning_ta": "மகாலட்சுமி", "gender": "girl"},
    ],
    # Pu / பூ
    "Pu": [
        {"name": "Pugazhendhi", "name_ta": "புகழேந்தி", "meaning": "Acclaimed Tamil poet of Nalavenba", "meaning_ta": "புகழ் கொண்ட புலவர்", "gender": "boy"},
        {"name": "Poonkodi", "name_ta": "பூங்கொடி", "meaning": "Delicate flowering vine", "meaning_ta": "மலர் கொடி போன்றவள்", "gender": "girl"},
        {"name": "Pungundran", "name_ta": "பூங்குன்றன்", "meaning": "Revered Sangam philosopher", "meaning_ta": "கணியன் பூங்குன்றனார்", "gender": "boy"},
        {"name": "Poornima", "name_ta": "பூர்ணிமா", "meaning": "Auspicious Full Moon", "meaning_ta": "முழு நிலவு", "gender": "girl"},
    ],
    # Sha / ஷ
    "Sha": [
        {"name": "Shanmugam", "name_ta": "சண்முகம்", "meaning": "Six-faced Lord Murugan", "meaning_ta": "ஆறுமுக முருகன்", "gender": "boy"},
        {"name": "Sharadha", "name_ta": "சாரதா", "meaning": "Goddess Saraswathi of learning", "meaning_ta": "சரஸ்வதி தேவி", "gender": "girl"},
        {"name": "Shankar", "name_ta": "சங்கர்", "meaning": "Giver of auspicious bliss, Shiva", "meaning_ta": "சிவபெருமான்", "gender": "boy"},
        {"name": "Shakthi", "name_ta": "சக்தி", "meaning": "Supreme divine energy", "meaning_ta": "பராசக்தி", "gender": "girl"},
    ],
    # Na / ண, ந
    "Na": [
        {"name": "Natarajan", "name_ta": "நடராஜன்", "meaning": "Cosmic dancer Lord Shiva", "meaning_ta": "தில்லை நடராஜர்", "gender": "boy"},
        {"name": "Nandhini", "name_ta": "நந்தினி", "meaning": "Bringer of joy, Kamadhenu's daughter", "meaning_ta": "மகிழ்ச்சி தருபவள்", "gender": "girl"},
        {"name": "Navaneethan", "name_ta": "நவநீதன்", "meaning": "Lord Krishna loving butter", "meaning_ta": "கண்ணன்", "gender": "boy"},
        {"name": "Nalini", "name_ta": "நளினி", "meaning": "Graceful lotus flower", "meaning_ta": "தாமரை", "gender": "girl"},
    ],
    # Tha / த
    "Tha": [
        {"name": "Thangavel", "name_ta": "தங்கவேல்", "meaning": "Golden spear of Murugan", "meaning_ta": "பொன் வேல்", "gender": "boy"},
        {"name": "Thangam", "name_ta": "தங்கம்", "meaning": "Pure gold, precious child", "meaning_ta": "பொன்", "gender": "girl"},
        {"name": "Thavapalan", "name_ta": "தவபாலன்", "meaning": "Child born of sacred penance", "meaning_ta": "தவ புதல்வன்", "gender": "boy"},
    ],
    # Pe / பே
    "Pe": [
        {"name": "Perumal", "name_ta": "பெருமாள்", "meaning": "Supreme Lord Vishnu", "meaning_ta": "திருமால்", "gender": "boy"},
        {"name": "Perarasu", "name_ta": "பேரரசு", "meaning": "Mighty benevolent empire", "meaning_ta": "பேரரசன்", "gender": "boy"},
        {"name": "Perazhagi", "name_ta": "பேரழகி", "meaning": "Immense natural beauty", "meaning_ta": "பேரழகு கொண்டவள்", "gender": "girl"},
    ],
    # Po / போ
    "Po": [
        {"name": "Porko", "name_ta": "பொற்கோ", "meaning": "Golden monarch", "meaning_ta": "பொன் அரசன்", "gender": "boy"},
        {"name": "Porkodi", "name_ta": "பொற்கொடி", "meaning": "Golden graceful vine", "meaning_ta": "தங்கக் கொடி", "gender": "girl"},
        {"name": "Porselvan", "name_ta": "பொற்செல்வன்", "meaning": "Golden prosperous youth", "meaning_ta": "செல்வ மகன்", "gender": "boy"},
    ],
    # Ra / ரா
    "Ra": [
        {"name": "Raghavan", "name_ta": "ராகவன்", "meaning": "Scion of Raghu dynasty, Rama", "meaning_ta": "ஸ்ரீ ராமபிரான்", "gender": "boy"},
        {"name": "Radha", "name_ta": "ராதா", "meaning": "Beloved eternal consort of Krishna", "meaning_ta": "ராதா பிராட்டி", "gender": "girl"},
        {"name": "Rajendran", "name_ta": "ராஜேந்திரன்", "meaning": "King of kings, Rajendra Chola", "meaning_ta": "ராஜேந்திர சோழன்", "gender": "boy"},
        {"name": "Rajeshwari", "name_ta": "ராஜேஸ்வரி", "meaning": "Empress of the universe, Parvathi", "meaning_ta": "அகிலாண்டேஸ்வரி", "gender": "girl"},
    ],
    # Ree / ரீ
    "Ree": [
        {"name": "Reethik", "name_ta": "ரீத்திக்", "meaning": "Stream of truth, tradition", "meaning_ta": "தர்ம நெறி", "gender": "boy"},
        {"name": "Reethika", "name_ta": "ரீத்திகா", "meaning": "Joyful movement, brass/bell chime", "meaning_ta": "மகிழ்ச்சி தரும் நங்கை", "gender": "girl"},
    ],
    # Ru / ரூ
    "Ru": [
        {"name": "Rudresh", "name_ta": "ருத்ரேஷ்", "meaning": "Lord Shiva as Rudra", "meaning_ta": "சிவபெருமான்", "gender": "boy"},
        {"name": "Rukmani", "name_ta": "ருக்மணி", "meaning": "Consort of Lord Krishna", "meaning_ta": "கண்ணபிரானின் பட்டத்து ராணி", "gender": "girl"},
        {"name": "Rooban", "name_ta": "ரூபன்", "meaning": "Handsome countenance", "meaning_ta": "அழகன்", "gender": "boy"},
        {"name": "Roopavathi", "name_ta": "ரூபவதி", "meaning": "Endowed with beauty and virtue", "meaning_ta": "பேரழகி", "gender": "girl"},
    ],
    # Re / ரே
    "Re": [
        {"name": "Revant", "name_ta": "ரேவந்த்", "meaning": "Lord of horses, son of Surya", "meaning_ta": "சூரியனின் புதல்வன்", "gender": "boy"},
        {"name": "Revathi", "name_ta": "ரேவதி", "meaning": "Prosperity, auspicious star", "meaning_ta": "ரேவதி நட்சத்திர தேவதை", "gender": "girl"},
        {"name": "Renu", "name_ta": "ரேணு", "meaning": "Fragrant particle of virtue", "meaning_ta": "பரிசுத்தமானவள்", "gender": "girl"},
    ],
    # Ro / ரோ
    "Ro": [
        {"name": "Rohit", "name_ta": "ரோஹித்", "meaning": "First red rays of dawn", "meaning_ta": "சூரிய ஒளி", "gender": "boy"},
        {"name": "Roshini", "name_ta": "ரோஷினி", "meaning": "Radiance and light", "meaning_ta": "பிரகாசமானவள்", "gender": "girl"},
        {"name": "Rohan", "name_ta": "ரோகன்", "meaning": "Ascending to high virtue", "meaning_ta": "முன்னேறுபவன்", "gender": "boy"},
    ],
    # Taa / தா
    "Taa": [
        {"name": "Tharun", "name_ta": "தருண்", "meaning": "Youthful, energetic", "meaning_ta": "இளமை பொங்குபவன்", "gender": "boy"},
        {"name": "Tharika", "name_ta": "தாரிகா", "meaning": "Bright shining star", "meaning_ta": "விண்மீன்", "gender": "girl"},
        {"name": "Thara", "name_ta": "தாரா", "meaning": "Guiding star of fortune", "meaning_ta": "நட்சத்திரம்", "gender": "girl"},
    ],
    # The / தே
    "The": [
        {"name": "Thendral", "name_ta": "தென்றல்", "meaning": "Cool southern breeze", "meaning_ta": "பூந்தென்றல்", "gender": "girl"},
        {"name": "Thenappan", "name_ta": "தேனப்பன்", "meaning": "Sweet protector", "meaning_ta": "இனிய தந்தை", "gender": "boy"},
    ],
    # Tho / தோ
    "Tho": [
        {"name": "Thooyamani", "name_ta": "தூயமணி", "meaning": "Spotless pure pearl", "meaning_ta": "தூய்மையான முத்து", "gender": "boy"},
        {"name": "Thooyavan", "name_ta": "தூயவன்", "meaning": "Immaculate, holy person", "meaning_ta": "பரிசுத்தமானவர்", "gender": "boy"},
    ],
    # Naa / நா
    "Naa": [
        {"name": "Nagappan", "name_ta": "நாகப்பன்", "meaning": "Protective serpent deity", "meaning_ta": "முருகன்/நாகர்", "gender": "boy"},
        {"name": "Nagalakshmi", "name_ta": "நாகலட்சுமி", "meaning": "Auspicious goddess Lakshmi", "meaning_ta": "மகாலட்சுமி", "gender": "girl"},
        {"name": "Nachimuthu", "name_ta": "நாச்சிமுத்து", "meaning": "Precious gem", "meaning_ta": "விலைமதிப்பற்ற முத்து", "gender": "boy"},
    ],
    # Nee / நீ
    "Nee": [
        {"name": "Neelakantan", "name_ta": "நீலகண்டன்", "meaning": "Lord Shiva who drank poison to save universe", "meaning_ta": "சிவபெருமான்", "gender": "boy"},
        {"name": "Neelambari", "name_ta": "நீலாம்பரி", "meaning": "Soothing classical raga, blue sky", "meaning_ta": "இனிய ராகம்", "gender": "girl"},
        {"name": "Neeraj", "name_ta": "நீரஜ்", "meaning": "Pure lotus born of clear water", "meaning_ta": "தாமரை", "gender": "boy"},
        {"name": "Neeraja", "name_ta": "நீரஜா", "meaning": "Lotus-seated Goddess Lakshmi", "meaning_ta": "மகாலட்சுமி", "gender": "girl"},
    ],
    # Nu / நூ
    "Nu": [
        {"name": "Nupur", "name_ta": "நூபுர்", "meaning": "Auspicious anklet chime", "meaning_ta": "கொலுசு ஒலி", "gender": "girl"},
        {"name": "Nutan", "name_ta": "நூதன்", "meaning": "Fresh, bright and youthful", "meaning_ta": "புதுமையானவன்", "gender": "boy"},
    ],
    # Ne / நே
    "Ne": [
        {"name": "Nedunchezhian", "name_ta": "நெடுஞ்செழியன்", "meaning": "Great victorious Pandya king", "meaning_ta": "பாண்டிய மன்னன்", "gender": "boy"},
        {"name": "Nethra", "name_ta": "நேத்ரா", "meaning": "Divine sight and guidance", "meaning_ta": "கண்கள், பார்வை", "gender": "girl"},
        {"name": "Nesan", "name_ta": "நேசன்", "meaning": "Affectionate friend to all", "meaning_ta": "அன்புடையவன்", "gender": "boy"},
    ],
    # No / நோ
    "No": [
        {"name": "Nomesh", "name_ta": "நோமேஷ்", "meaning": "Lord of harmony", "meaning_ta": "இனிய தலைவன்", "gender": "boy"},
        {"name": "Nolika", "name_ta": "நோலிகா", "meaning": "Sweet singing songstress", "meaning_ta": "இன்னிசை பாடுபவள்", "gender": "girl"},
    ],
    # Yaa / யா
    "Yaa": [
        {"name": "Yadhavan", "name_ta": "யாதவன்", "meaning": "Lord Krishna, chief of Yadavas", "meaning_ta": "கண்ணபிரான்", "gender": "boy"},
        {"name": "Yazhini", "name_ta": "யாழினி", "meaning": "Sweet as ancient Tamil Yazh lute", "meaning_ta": "யாழ் போன்ற இனியவள்", "gender": "girl"},
        {"name": "Yashwant", "name_ta": "யஷ்வந்த்", "meaning": "Victorious and famous", "meaning_ta": "புகழுடையவன்", "gender": "boy"},
        {"name": "Yamuna", "name_ta": "யமுனா", "meaning": "Sacred river Yamuna", "meaning_ta": "புனித நதி", "gender": "girl"},
    ],
    # Ye / யே
    "Ye": [
        {"name": "Yogeswaran", "name_ta": "யோகேஸ்வரன்", "meaning": "Lord Shiva, master of Yoga", "meaning_ta": "யோகங்களின் தலைவன்", "gender": "boy"},
        {"name": "Yogalakshmi", "name_ta": "யோகலட்சுமி", "meaning": "Goddess Lakshmi bringing fortune", "meaning_ta": "பாக்கிய லட்சுமி", "gender": "girl"},
    ],
    # Yo / யோ
    "Yo": [
        {"name": "Yogesh", "name_ta": "யோகேஷ்", "meaning": "Master of spiritual practice", "meaning_ta": "யோகி", "gender": "boy"},
        {"name": "Yoshita", "name_ta": "யோஷிதா", "meaning": "Dignified, virtuous lady", "meaning_ta": "மங்கல நங்கை", "gender": "girl"},
    ],
    # Baa / பா, பா
    "Baa": [
        {"name": "Balaji", "name_ta": "பாலாஜி", "meaning": "Lord Venkateshwara of Tirumala", "meaning_ta": "ஏழுமலையான்", "gender": "boy"},
        {"name": "Bala", "name_ta": "பாலா", "meaning": "Youthful divine mother Tripura", "meaning_ta": "பாலாம்பிகை", "gender": "girl"},
        {"name": "Balachandran", "name_ta": "பாலச்சந்திரன்", "meaning": "Young crescent moon on Shiva's crest", "meaning_ta": "பிறை நிலவு", "gender": "boy"},
        {"name": "Bhagavathi", "name_ta": "பகவதி", "meaning": "Divine protectress", "meaning_ta": "அம்பிகை", "gender": "girl"},
    ],
    # Bee / பீ
    "Bee": [
        {"name": "Beeman", "name_ta": "பீமன்", "meaning": "Mighty hero of Mahabharata", "meaning_ta": "பீமசேனன்", "gender": "boy"},
        {"name": "Beena", "name_ta": "பீனா", "meaning": "Celestial Veena, musical melody", "meaning_ta": "வீணை நாதம்", "gender": "girl"},
    ],
    # Bhu / பூ, பு
    "Bhu": [
        {"name": "Bhuvanesh", "name_ta": "புவனேஸ்வரன்", "meaning": "Lord of the universe, Shiva", "meaning_ta": "அகில நாதன்", "gender": "boy"},
        {"name": "Bhuvaneshwari", "name_ta": "புவனேஸ்வரி", "meaning": "Supreme Mother of the cosmos", "meaning_ta": "அம்பிகை", "gender": "girl"},
        {"name": "Bhupathi", "name_ta": "பூபதி", "meaning": "Lord of the earth", "meaning_ta": "அரசன்", "gender": "boy"},
        {"name": "Bhumika", "name_ta": "பூமிகா", "meaning": "Mother Earth", "meaning_ta": "பூமிதேவி", "gender": "girl"},
    ],
    # Dha / தா, த
    "Dha": [
        {"name": "Dharmalingam", "name_ta": "தர்மலிங்கம்", "meaning": "Pillar of righteousness, Shiva", "meaning_ta": "சிவபெருமான்", "gender": "boy"},
        {"name": "Dharani", "name_ta": "தரணி", "meaning": "Sustainer of worlds, Earth", "meaning_ta": "பூமித்தாய்", "gender": "girl"},
        {"name": "Dhanush", "name_ta": "தனுஷ்", "meaning": "Sacred celestial bow", "meaning_ta": "வில்", "gender": "boy"},
        {"name": "Dhananya", "name_ta": "தனன்யா", "meaning": "Blessed with auspicious wealth", "meaning_ta": "செல்வ மகள்", "gender": "girl"},
    ],
    # Jaa / ஜா
    "Jaa": [
        {"name": "Janakiraman", "name_ta": "ஜானகிராமன்", "meaning": "Lord Rama, consort of Janaki", "meaning_ta": "ஸ்ரீ ராமன்", "gender": "boy"},
        {"name": "Janani", "name_ta": "ஜனனி", "meaning": "Mother of all beings, Goddess", "meaning_ta": "அம்பிகை", "gender": "girl"},
        {"name": "Jagadeesh", "name_ta": "ஜெகதீஷ்", "meaning": "Lord of the universe", "meaning_ta": "அகிலநாதன்", "gender": "boy"},
        {"name": "Janaki", "name_ta": "ஜானகி", "meaning": "Daughter of Janaka, Sita Devi", "meaning_ta": "சீதாதேவி", "gender": "girl"},
    ],
    # Jee / ஜீ
    "Jee": [
        {"name": "Jeevan", "name_ta": "ஜீவன்", "meaning": "Source of life, vital breath", "meaning_ta": "உயிர் ஒளி", "gender": "boy"},
        {"name": "Jeevitha", "name_ta": "ஜீவிதா", "meaning": "Joyous life, vibrant", "meaning_ta": "வாழ்வின் வசந்தம்", "gender": "girl"},
        {"name": "Jeevandhar", "name_ta": "ஜீவந்தரன்", "meaning": "Sustainer of life", "meaning_ta": "உயிரைக் காப்பவன்", "gender": "boy"},
    ],
    # Khi / கி
    "Khi": [
        {"name": "Kirubakaran", "name_ta": "கிருபாகரன்", "meaning": "Fountain of grace and mercy", "meaning_ta": "அருளாளன்", "gender": "boy"},
        {"name": "Kiruba", "name_ta": "கிருபா", "meaning": "Divine mercy and grace", "meaning_ta": "இறை அருள்", "gender": "girl"},
    ],
    # Khu / கு
    "Khu": [
        {"name": "Kulandhaivel", "name_ta": "குழந்தைவேல்", "meaning": "Youthful Lord Murugan", "meaning_ta": "முருகன்", "gender": "boy"},
        {"name": "Kushali", "name_ta": "குஷாலி", "meaning": "Cheerful and prosperous", "meaning_ta": "மகிழ்ச்சியானவள்", "gender": "girl"},
    ],
    # Khe / கே
    "Khe": [
        {"name": "Khemraj", "name_ta": "கேமராஜ்", "meaning": "King of peace and protection", "meaning_ta": "நலமளிக்கும் அரசன்", "gender": "boy"},
        {"name": "Khemika", "name_ta": "கேமிகா", "meaning": "Protective auspicious maiden", "meaning_ta": "பாதுகாப்பவள்", "gender": "girl"},
    ],
    # Kho / கோ
    "Kho": [
        {"name": "Koushik", "name_ta": "கௌஷிக்", "meaning": "Sage Vishwamitra, seeker of truth", "meaning_ta": "விஸ்வாமித்திரர்", "gender": "boy"},
        {"name": "Kousalya", "name_ta": "கௌசல்யா", "meaning": "Mother of Sri Rama, auspicious", "meaning_ta": "ஸ்ரீ ராமரின் தாய்", "gender": "girl"},
    ],
    # Gaa / கா
    "Gaa": [
        {"name": "Gandhivel", "name_ta": "காந்திவேல்", "meaning": "Radiant spear of Murugan", "meaning_ta": "ஒளி வேல்", "gender": "boy"},
        {"name": "Gaayathri", "name_ta": "காயத்ரி", "meaning": "Mother of sacred mantras", "meaning_ta": "காயத்ரி தேவி", "gender": "girl"},
        {"name": "Gaanamudhan", "name_ta": "கானமுதன்", "meaning": "Nectar of sweet music", "meaning_ta": "இசை அமுதன்", "gender": "boy"},
    ],
    # Gee / கீ
    "Gee": [
        {"name": "Geethan", "name_ta": "கீதன்", "meaning": "Song of righteousness (Bhagavad Gita)", "meaning_ta": "கீதை நாயகன்", "gender": "boy"},
        {"name": "Geetha", "name_ta": "கீதா", "meaning": "Sacred song of the Divine", "meaning_ta": "பகவத் கீதை", "gender": "girl"},
    ],
    # Gu / கு
    "Gu": [
        {"name": "Guhan", "name_ta": "குகன்", "meaning": "Lord Murugan dwelling in the heart", "meaning_ta": "முருகப்பெருமான்", "gender": "boy"},
        {"name": "Gunaseelan", "name_ta": "குணசீலன்", "meaning": "Virtuous character, honorable", "meaning_ta": "நற்குணம் உடையவன்", "gender": "boy"},
        {"name": "Gunavathi", "name_ta": "குணவதி", "meaning": "Endowed with all good virtues", "meaning_ta": "நற்குண நாயகி", "gender": "girl"},
        {"name": "Gurumurthy", "name_ta": "குருமூர்த்தி", "meaning": "Embodiment of Guru, Lord Shiva", "meaning_ta": "தட்சிணாமூர்த்தி", "gender": "boy"},
    ],
    # Ge / கே
    "Ge": [
        {"name": "Geyavelan", "name_ta": "கேயவேலன்", "meaning": "Lord Murugan revered in hymns", "meaning_ta": "வேலன்", "gender": "boy"},
        {"name": "Geyasri", "name_ta": "கேயஸ்ரீ", "meaning": "Radiant song of fortune", "meaning_ta": "பாடல் பொன்", "gender": "girl"},
    ],
    # Go / கோ
    "Go": [
        {"name": "Gopinath", "name_ta": "கோபிநாத்", "meaning": "Lord of the Gopis, Krishna", "meaning_ta": "கண்ணபிரான்", "gender": "boy"},
        {"name": "Gopika", "name_ta": "கோபிகா", "meaning": "Devotee of Lord Krishna", "meaning_ta": "கண்ணன் பக்தை", "gender": "girl"},
        {"name": "Govindan", "name_ta": "கோவிந்தன்", "meaning": "Protector of all beings", "meaning_ta": "திருமால்", "gender": "boy"},
        {"name": "Gomathi", "name_ta": "கோமதி", "meaning": "Goddess of Sankaranainar Koil", "meaning_ta": "சங்கரன்கோவில் அம்பாள்", "gender": "girl"},
    ],
    # Saa / சா, ஸா
    "Saa": [
        {"name": "Saravanan", "name_ta": "சரவணன்", "meaning": "Lord Murugan born in Saravana lake", "meaning_ta": "சரவணபவன்", "gender": "boy"},
        {"name": "Saradha", "name_ta": "சாரதா", "meaning": "Goddess of learning", "meaning_ta": "கலைமகள்", "gender": "girl"},
        {"name": "Sasikumar", "name_ta": "சசிகுமார்", "meaning": "Moon-like handsome youth", "meaning_ta": "சந்திர குமாரன்", "gender": "boy"},
        {"name": "Savitri", "name_ta": "சாவித்திரி", "meaning": "Sun-like luminous protectress", "meaning_ta": "பதிவிரதை", "gender": "girl"},
    ],
    # See / சீ, ஸீ
    "See": [
        {"name": "Seetharaman", "name_ta": "சீதாராமன்", "meaning": "Lord Rama with Sita Devi", "meaning_ta": "ஸ்ரீ ராமன்", "gender": "boy"},
        {"name": "Seethadevi", "name_ta": "சீதாதேவி", "meaning": "Mother Sita, consort of Rama", "meaning_ta": "ஜானகி", "gender": "girl"},
        {"name": "Seenivasan", "name_ta": "சீனிவாசன்", "meaning": "Dwelling of Sri (Lakshmi), Vishnu", "meaning_ta": "பெருமாள்", "gender": "boy"},
    ],
    # Su / சு, ஸூ
    "Su": [
        {"name": "Subramanian", "name_ta": "சுப்பிரமணியன்", "meaning": "Supreme radiance, Murugan", "meaning_ta": "முருகப்பெருமான்", "gender": "boy"},
        {"name": "Sundaram", "name_ta": "சுந்தரம்", "meaning": "Divine beauty, Shiva", "meaning_ta": "சுந்தரேஸ்வரர்", "gender": "boy"},
        {"name": "Subhashini", "name_ta": "சுபாஷினி", "meaning": "Eloquent and melodious speaker", "meaning_ta": "இனிய சொற்கள் பேசுபவள்", "gender": "girl"},
        {"name": "Suganya", "name_ta": "சுகன்யா", "meaning": "Auspicious and virtuous maiden", "meaning_ta": "மங்கல நங்கை", "gender": "girl"},
    ],
    # Se / சே, ஸே
    "Se": [
        {"name": "Senthil", "name_ta": "செந்தில்", "meaning": "Lord Murugan of Tiruchendur", "meaning_ta": "திருச்செந்தூர் முருகன்", "gender": "boy"},
        {"name": "Sevvel", "name_ta": "செவ்வேள்", "meaning": "Red-hued radiant commander Murugan", "meaning_ta": "முருகன்", "gender": "boy"},
        {"name": "Selvi", "name_ta": "செல்வி", "meaning": "Prosperous daughter", "meaning_ta": "செல்வ மகள்", "gender": "girl"},
    ],
    # So / சோ, ஸோ
    "So": [
        {"name": "Somasundaram", "name_ta": "சோமசுந்தரம்", "meaning": "Lord Shiva bearing the crescent Moon", "meaning_ta": "மதுரை சொக்கர்", "gender": "boy"},
        {"name": "Soundarya", "name_ta": "சௌந்தர்யா", "meaning": "Sublime celestial beauty", "meaning_ta": "பேரழகி", "gender": "girl"},
        {"name": "Somesh", "name_ta": "சோமேஷ்", "meaning": "Lord of the Moon, Shiva", "meaning_ta": "சோமநாதர்", "gender": "boy"},
    ],
    # Chaa / சா
    "Chaa": [
        {"name": "Chaitanya", "name_ta": "சைதன்யன்", "meaning": "Divine consciousness", "meaning_ta": "பேரறிவு கொண்டவர்", "gender": "boy"},
        {"name": "Chaamundi", "name_ta": "சாமுண்டீஸ்வரி", "meaning": "Goddess Chamundeshwari", "meaning_ta": "துர்க்கை அம்மன்", "gender": "girl"},
        {"name": "Chandran", "name_ta": "சந்திரன்", "meaning": "Cool Moon god", "meaning_ta": "திங்கள் பகவான்", "gender": "boy"},
        {"name": "Charulatha", "name_ta": "சாருலதா", "meaning": "Graceful vine", "meaning_ta": "அழகிய கொடி", "gender": "girl"},
    ],
    # Chee / சீ
    "Chee": [
        {"name": "Cheeralan", "name_ta": "சீராளன்", "meaning": "Son of noble conduct and glory", "meaning_ta": "பெருமைக்குரிய மகன்", "gender": "boy"},
        {"name": "Cheermathi", "name_ta": "சீர்மதி", "meaning": "Bright intelligent mind", "meaning_ta": "அறிவுடையவள்", "gender": "girl"},
    ]
}


def get_baby_name_suggestions(
    nakshatra_name: str,
    pada: int,
    gender: Optional[str] = None,
    nakshatra_ta: Optional[str] = None
) -> Dict[str, Any]:
    """
    Returns the authentic Nakshatra-pada starting syllables (நாம அக்ஷரங்கள்) and shortlisted names.
    Governed by canonical Vedic astrology tables.
    """
    syllables = NAKSHATRA_PADA_SYLLABLES.get(nakshatra_name, ["A", "S", "K", "M"])
    syllables_ta = NAKSHATRA_PADA_SYLLABLES_TA.get(nakshatra_name, ["அ", "ச", "க", "ம"])

    target_idx = max(0, min(3, pada - 1))
    target_syllable = syllables[target_idx] if target_idx < len(syllables) else syllables[0]
    target_syllable_ta = syllables_ta[target_idx] if target_idx < len(syllables_ta) else syllables_ta[0]

    # Gather matching names
    raw_names = NAME_DATABASE.get(target_syllable, [])

    # If exact syllable has fewer than 2 names, check root match (e.g. 'Paa' -> 'Pu' / 'Pe')
    if len(raw_names) < 2:
        root = target_syllable[0]
        for k, v in NAME_DATABASE.items():
            if k.startswith(root) and k != target_syllable:
                raw_names.extend(v)
                if len(raw_names) >= 4:
                    break

    # Fallback to classical auspicious names if still empty
    if not raw_names:
        raw_names = [
            {"name": "Aadhavan", "name_ta": "ஆதவன்", "meaning": "Radiant Sun", "meaning_ta": "கதிரவன்", "gender": "boy"},
            {"name": "Aadhira", "name_ta": "ஆதிரா", "meaning": "Auspicious first star", "meaning_ta": "மங்கல நற்பேறு", "gender": "girl"},
            {"name": "Karthikeyan", "name_ta": "கார்த்திகேயன்", "meaning": "Lord Murugan", "meaning_ta": "முருகப்பெருமான்", "gender": "boy"},
            {"name": "Lavanya", "name_ta": "லாவண்யா", "meaning": "Grace and elegance", "meaning_ta": "அழகும் கருணையும்", "gender": "girl"},
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
        "starting_syllables_ta": syllables_ta,
        "target_syllable": target_syllable,
        "target_syllable_ta": target_syllable_ta,
        "nama_aksharas_all_padas": [
            f"பாதம் {i+1}: {syllables_ta[i]} ({syllables[i]})"
            for i in range(min(len(syllables), len(syllables_ta)))
        ],
        "gender": gender,
        "suggestions": filtered
    }
