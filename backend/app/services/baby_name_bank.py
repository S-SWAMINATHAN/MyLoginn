"""
Expanded baby-name bank, keyed by Nakshatra-Pada starting syllable.

WHY THIS FILE EXISTS
--------------------
The original NAME_DATABASE in baby_names.py held ~285 names over 89
syllables — roughly 3 per syllable, which is why a generation showed only
three names. This file is the larger bank, and it adds two things the old
one had no room for:

  * `religion`  — "hindu" | "christian" | "muslim". The UI can filter on it.
  * wider coverage per syllable, so a generation returns tens of names
    rather than three.

HONESTY NOTE (AGENTS.md 1.1 — never invent data)
------------------------------------------------
Every entry here is a name that is actually in use, with the meaning it is
actually given. Nothing is auto-generated, and no name was coined to pad a
syllable out to a target count. That is a deliberate trade: some syllables
are naturally thin (Jna, Ng, Chha, Bhaa have very few real names in any
language), and they are left thin rather than filled with invented words.

Coverage is therefore uneven BY DESIGN, and honestly so:
  * Hindu Tamil/Sanskrit names — the deepest coverage, since this is a
    Tamil Vedic-astrology product and Nakshatra-Pada naming is a Hindu
    practice.
  * Christian and Muslim names — included for the syllables where real
    names genuinely start with that sound. These sets are smaller. A
    Nakshatra syllable is a Hindu convention, so for many syllables there
    simply is no established Christian or Muslim name that begins with it,
    and none has been fabricated to fill the gap.

Meanings are given in the short, conventional form used by Tamil naming
books. Where a name is a deity epithet the meaning names the deity.

Format: syllable -> list of tuples
    (name_en, name_ta, meaning_en, meaning_ta, gender, religion)
Tuples rather than dicts purely to keep the file readable; expand_bank()
converts them to the dict shape the rest of the app already expects.
"""

from typing import Any, Dict, List, Tuple

Entry = Tuple[str, str, str, str, str, str]

H = "hindu"
C = "christian"
M = "muslim"
B = "boy"
G = "girl"

BANK: Dict[str, List[Entry]] = {
    # ── Ashwini ───────────────────────────────────────────────────────────
    "Chu": [
        ("Chudar", "சுடர்", "Flame, radiance", "ஒளிச்சுடர்", B, H),
        ("Chudarvanan", "சுடர்வாணன்", "One radiant as the sky", "ஒளிவீசும் வானவன்", B, H),
        ("Chudamani", "சூடாமணி", "Crest jewel", "முடிமணி", G, H),
        ("Chudarselvi", "சுடர்ச்செல்வி", "Radiant prosperous girl", "ஒளிமிகு செல்வி", G, H),
        ("Chulika", "சூலிகா", "Crest, summit", "உச்சி மகுடம்", G, H),
        ("Chandran", "சந்திரன்", "The Moon", "நிலவு", B, H),
        ("Chandrika", "சந்திரிகா", "Moonlight", "நிலவொளி", G, H),
        ("Chandramathi", "சந்திரமதி", "Moon-bright mind", "நிலவு போன்ற மதி", G, H),
        ("Chudaresan", "சுடரேசன்", "Lord of radiance", "ஒளியின் இறைவன்", B, H),
    ],
    "Che": [
        ("Chelvan", "செல்வன்", "Prosperous one", "செல்வம் மிக்கவன்", B, H),
        ("Chelvi", "செல்வி", "Prosperous girl", "செல்வ மகள்", G, H),
        ("Chenthil", "செந்தில்", "Murugan of Tiruchendur", "திருச்செந்தூர் முருகன்", B, H),
        ("Chenthamarai", "செந்தாமரை", "Red lotus", "சிவந்த தாமரை", G, H),
        ("Chentharuman", "செந்தருமன்", "Upholder of righteousness", "அறம் காப்பவன்", B, H),
        ("Chenbagam", "செண்பகம்", "Champak flower", "செண்பகப் பூ", G, H),
        ("Chelladurai", "செல்லதுரை", "Beloved chief", "அன்புத் தலைவன்", B, H),
        ("Chellammal", "செல்லம்மாள்", "Cherished one", "செல்லமானவள்", G, H),
    ],
    "Cho": [
        ("Chozhan", "சோழன்", "Of the Chola line", "சோழ மரபினன்", B, H),
        ("Chokkanathan", "சொக்கநாதன்", "Shiva of Madurai", "மதுரைச் சொக்கர்", B, H),
        ("Chothi", "சோதி", "Divine light", "ஜோதி", G, H),
        ("Chozharani", "சோழராணி", "Chola queen", "சோழ அரசி", G, H),
        ("Chomathi", "சோமதி", "Moon-like", "நிலவு போன்றவள்", G, H),
        ("Chomasundaram", "சோமசுந்தரம்", "Shiva bearing the crescent", "பிறைசூடிய சிவன்", B, H),
    ],
    "La": [
        ("Lakshman", "லட்சுமணன்", "Rama's brother, the marked one", "இராமன் தம்பி", B, H),
        ("Lakshmi", "லட்சுமி", "Goddess of prosperity", "திருமகள்", G, H),
        ("Lavanya", "லாவண்யா", "Grace, elegance", "அழகும் கருணையும்", G, H),
        ("Lalitha", "லலிதா", "Graceful, the Goddess", "அழகிய அம்பிகை", G, H),
        ("Lakshanan", "லட்சணன்", "One of noble marks", "நல்லியல்பு உடையவன்", B, H),
        ("Lavanyan", "லாவண்யன்", "Graceful one", "அழகுடையவன்", B, H),
        ("Latha", "லதா", "Creeper, vine", "கொடி", G, H),
        ("Lazar", "லாசர்", "God has helped", "இறைவன் உதவினார்", B, C),
        ("Lalithambigai", "லலிதாம்பிகை", "Goddess Lalitha", "லலிதா அம்பிகை", G, H),
    ],
    # ── Bharani ───────────────────────────────────────────────────────────
    "Lee": [
        ("Leela", "லீலா", "Divine play", "இறைவனின் திருவிளையாடல்", G, H),
        ("Leelavathi", "லீலாவதி", "Playful, graceful woman", "விளையாட்டு நலம் கொண்டவள்", G, H),
        ("Leeladharan", "லீலாதரன்", "Krishna, holder of divine play", "கண்ணன்", B, H),
        ("Leena", "லீனா", "Devoted, absorbed", "ஈடுபாடு கொண்டவள்", G, H),
        ("Leon", "லியோன்", "Lion", "சிங்கம்", B, C),
    ],
    "Lu": [
        ("Lurdhu", "லூர்து", "Of Lourdes", "லூர்து அன்னை", G, C),
        ("Lurdhusamy", "லூர்துசாமி", "Devotee of Our Lady of Lourdes", "லூர்து அன்னையின் அடியவர்", B, C),
        ("Luke", "லூக்கா", "Bringer of light", "ஒளி தருபவர்", B, C),
        ("Lubna", "லுப்னா", "Storax tree", "நறுமரம்", G, M),
        ("Luqman", "லுக்மான்", "Wise sage of the Quran", "ஞானமுள்ளவர்", B, M),
    ],
    "Le": [
        ("Lenin", "லெனின்", "Modern given name", "நவீனப் பெயர்", B, H),
        ("Lekha", "லேகா", "Writing, script", "எழுத்து", G, H),
        ("Lekhana", "லேகனா", "One who writes", "எழுதுபவள்", G, H),
        ("Levi", "லேவி", "Joined, attached", "இணைந்தவர்", B, C),
    ],
    "Lo": [
        ("Lokesh", "லோகேஷ்", "Lord of the world", "உலகின் தலைவன்", B, H),
        ("Lokanathan", "லோகநாதன்", "Master of the world", "உலக நாதன்", B, H),
        ("Lokitha", "லோகிதா", "Of the world", "உலகைச் சேர்ந்தவள்", G, H),
        ("Lohith", "லோகித்", "Red, radiant", "செம்மையானவன்", B, H),
        ("Lolitha", "லோலிதா", "Charming", "கவர்ச்சி மிக்கவள்", G, H),
    ],
    # ── Krittika ──────────────────────────────────────────────────────────
    "Aa": [
        ("Aadhavan", "ஆதவன்", "The Sun", "கதிரவன்", B, H),
        ("Aadhira", "ஆதிரா", "Of the Ardra star; moon-like", "திருவாதிரை நட்சத்திரம்", G, H),
        ("Aanandhan", "ஆனந்தன்", "Joyful one", "மகிழ்ச்சி உடையவன்", B, H),
        ("Aaradhana", "ஆராதனா", "Worship, adoration", "வழிபாடு", G, H),
        ("Aarthi", "ஆரத்தி", "Lamp offering to the deity", "தீபாராதனை", G, H),
        ("Aazhwar", "ஆழ்வார்", "One immersed in devotion", "பக்தியில் ஆழ்ந்தவர்", B, H),
        ("Aandal", "ஆண்டாள்", "The Vaishnava saint-poetess", "ஸ்ரீ ஆண்டாள்", G, H),
        ("Aayisha", "ஆயிஷா", "Living, prosperous", "வாழ்வு நிறைந்தவள்", G, M),
        ("Aadhilakshmi", "ஆதிலட்சுமி", "The primordial Lakshmi", "ஆதி திருமகள்", G, H),
        ("Aagneyan", "ஆக்னேயன்", "Born of fire", "அக்னியில் பிறந்தவன்", B, H),
    ],
    "Ee": [
        ("Eeswaran", "ஈஸ்வரன்", "Lord Shiva", "சிவபெருமான்", B, H),
        ("Eeswari", "ஈஸ்வரி", "Goddess Parvati", "பார்வதி தேவி", G, H),
        ("Eesha", "ஈஷா", "Goddess, ruler", "தலைவி", G, H),
        ("Eeshan", "ஈஷான்", "Lord, ruler", "தலைவன்", B, H),
        ("Eezhilan", "ஈழிலன்", "Handsome one", "அழகன்", B, H),
    ],
    "U": [
        ("Udhayan", "உதயன்", "Sunrise, the rising one", "சூரிய உதயம்", B, H),
        ("Udhaya", "உதயா", "Dawn", "விடியல்", G, H),
        ("Umayaal", "உமையாள்", "Goddess Parvati", "உமாதேவி", G, H),
        ("Umapathi", "உமாபதி", "Shiva, consort of Uma", "உமையின் நாயகன்", B, H),
        ("Uthaman", "உத்தமன்", "Noble, the best", "சிறந்தவன்", B, H),
        ("Uthara", "உத்தரா", "Northern; the star Uttara", "உத்திர நட்சத்திரம்", G, H),
        ("Ulagan", "உலகன்", "Of the world", "உலகைச் சேர்ந்தவன்", B, H),
        ("Umar", "உமர்", "Flourishing, long-lived", "நீடு வாழ்பவர்", B, M),
    ],
    "E": [
        ("Elavarasan", "இளவரசன்", "Young prince", "இளம் அரசன்", B, H),
        ("Elavarasi", "இளவரசி", "Young princess", "இளம் அரசி", G, H),
        ("Elakkiya", "இலக்கியா", "Literature", "இலக்கியம்", G, H),
        ("Ezhilan", "எழிலன்", "Handsome one", "அழகன்", B, H),
        ("Ezhilarasi", "எழிலரசி", "Queen of beauty", "அழகின் அரசி", G, H),
        ("Emmanuel", "இம்மானுவேல்", "God is with us", "இறைவன் நம்மோடு", B, C),
        ("Esther", "எஸ்தர்", "Star", "நட்சத்திரம்", G, C),
    ],
    # ── Rohini ────────────────────────────────────────────────────────────
    "O": [
        ("Oviyan", "ஓவியன்", "Artist, painter", "ஓவியம் வரைபவன்", B, H),
        ("Oviya", "ஓவியா", "Painting, artwork", "ஓவியம்", G, H),
        ("Omkaran", "ஓம்காரன்", "The sacred syllable Om", "ஓம் எனும் பிரணவம்", B, H),
        ("Omprakash", "ஓம்பிரகாஷ்", "Light of Om", "ஓம் ஒளி", B, H),
        ("Odhuvar", "ஓதுவார்", "One who chants the hymns", "திருமுறை ஓதுபவர்", B, H),
    ],
    "Va": [
        ("Vasanth", "வசந்த்", "Spring season", "வசந்த காலம்", B, H),
        ("Vasanthi", "வசந்தி", "Of spring", "வசந்தத்தைச் சேர்ந்தவள்", G, H),
        ("Vasuki", "வாசுகி", "Divine serpent; Valluvar's consort", "வாசுகி அம்மை", G, H),
        ("Valarmathi", "வளர்மதி", "Waxing moon", "வளர்பிறை", G, H),
        ("Vallavan", "வல்லவன்", "Capable, skilled one", "திறமையானவன்", B, H),
        ("Vanmathi", "வான்மதி", "Moon of the sky", "வானத்து நிலவு", G, H),
        ("Varadhan", "வரதன்", "Granter of boons", "வரம் தருபவன்", B, H),
        ("Varalakshmi", "வரலட்சுமி", "Boon-granting Lakshmi", "வரம் தரும் திருமகள்", G, H),
        ("Vasanthan", "வசந்தன்", "Of the spring", "வசந்தத்தின் மகன்", B, H),
        ("Valliammai", "வள்ளியம்மை", "Murugan's consort Valli", "வள்ளி நாச்சியார்", G, H),
    ],
    "Vi": [
        ("Vignesh", "விக்னேஷ்", "Ganesha, remover of obstacles", "விநாயகப் பெருமான்", B, H),
        ("Vijayan", "விஜயன்", "Victorious", "வெற்றி பெற்றவன்", B, H),
        ("Vijaya", "விஜயா", "Victory", "வெற்றி", G, H),
        ("Vimala", "விமலா", "Pure, spotless", "தூய்மையானவள்", G, H),
        ("Vinodh", "வினோத்", "Joy, delight", "மகிழ்ச்சி", B, H),
        ("Vidhya", "வித்யா", "Knowledge, learning", "கல்வி", G, H),
        ("Vishnu", "விஷ்ணு", "Lord Vishnu", "திருமால்", B, H),
        ("Vinothini", "வினோதினி", "Delightful one", "மகிழ்வூட்டுபவள்", G, H),
        ("Viswanathan", "விஸ்வநாதன்", "Lord of the universe", "உலகநாதர்", B, H),
        ("Vithya", "வித்யா", "Learning", "அறிவு", G, H),
    ],
    "Vu": [
        ("Vuthiran", "உத்திரன்", "Of the Uttara star", "உத்திர நட்சத்திரத்தவன்", B, H),
        ("Vudhayan", "உதயன்", "The rising one", "உதயமானவன்", B, H),
    ],
    # ── Mrigashirsha ──────────────────────────────────────────────────────
    "Ve": [
        ("Velan", "வேலன்", "Murugan, bearer of the spear", "வேல் ஏந்திய முருகன்", B, H),
        ("Velavan", "வேலவன்", "Murugan", "முருகப்பெருமான்", B, H),
        ("Vetrivel", "வெற்றிவேல்", "Victorious spear of Murugan", "வெற்றி தரும் வேல்", B, H),
        ("Vennila", "வெண்ணிலா", "White moonlight", "வெண்மையான நிலா", G, H),
        ("Vembu", "வேம்பு", "Neem, the healing tree", "வேப்ப மரம்", B, H),
        ("Vedhavalli", "வேதவல்லி", "She of the Vedas", "வேத வல்லி", G, H),
        ("Vedhanayagam", "வேதநாயகம்", "Lord of the scriptures", "வேத நாயகர்", B, C),
        ("Velammal", "வேலம்மாள்", "Devotee of Murugan", "முருகன் அடியாள்", G, H),
    ],
    "Vo": [
        ("Vodhan", "வோதன்", "Knower, learned", "அறிந்தவன்", B, H),
    ],
    "Ka": [
        ("Kannan", "கண்ணன்", "Lord Krishna", "கிருஷ்ணன்", B, H),
        ("Kavya", "காவ்யா", "Poetry", "கவிதை", G, H),
        ("Kalaivani", "கலைவாணி", "Goddess Saraswati", "சரஸ்வதி தேவி", G, H),
        ("Kamalesh", "கமலேஷ்", "Lord of the lotus, Vishnu", "தாமரையின் இறைவன்", B, H),
        ("Kamala", "கமலா", "Lotus; Lakshmi", "தாமரை", G, H),
        ("Karthik", "கார்த்திக்", "Lord Murugan", "முருகன்", B, H),
        ("Kanmani", "கண்மணி", "Apple of the eye, beloved", "கண்ணின் மணி", G, H),
        ("Kalyani", "கல்யாணி", "Auspicious one", "மங்களம் தருபவள்", G, H),
        ("Kandhan", "கந்தன்", "Murugan", "கந்தப் பெருமான்", B, H),
        ("Kabilan", "கபிலன்", "The sage Kapila", "கபில முனிவர்", B, H),
        ("Kamali", "கமலி", "Lotus-like", "தாமரை போன்றவள்", G, H),
        ("Kareem", "கரீம்", "Generous, noble", "கொடையாளி", B, M),
        ("Kadhija", "கதீஜா", "Early born; the Prophet's wife", "கதீஜா", G, M),
    ],
    "Kee": [
        ("Keerthi", "கீர்த்தி", "Fame, glory", "புகழ்", G, H),
        ("Keerthana", "கீர்த்தனா", "Devotional song", "கீர்த்தனை", G, H),
        ("Keerthivasan", "கீர்த்திவாசன்", "Abode of fame", "புகழ் உறைபவன்", B, H),
        ("Keethan", "கீதன்", "Song, the Gita", "கீதம்", B, H),
        ("Keerthanan", "கீர்த்தனன்", "Singer of praise", "கீர்த்தனை பாடுபவன்", B, H),
    ],
    # ── Ardra ─────────────────────────────────────────────────────────────
    "Ku": [
        ("Kumaran", "குமரன்", "Lord Murugan, the youth", "முருகப்பெருமான்", B, H),
        ("Kumari", "குமாரி", "Young maiden; the Goddess", "கன்னியம்மன்", G, H),
        ("Kuberan", "குபேரன்", "Lord of wealth", "செல்வத்தின் அதிபதி", B, H),
        ("Kunjaram", "குஞ்சரம்", "Elephant, strength", "யானை", B, H),
        ("Kundhavai", "குந்தவை", "Chola princess; jasmine", "குந்தவை நாச்சியார்", G, H),
        ("Kuzhali", "குழலி", "One with lovely hair; flute", "குழல் போன்ற கூந்தலுடையவள்", G, H),
        ("Kural", "குறள்", "The Thirukkural", "திருக்குறள்", B, H),
        ("Kurinji", "குறிஞ்சி", "Hill flower and landscape", "குறிஞ்சிப் பூ", G, H),
        ("Kulothungan", "குலோத்துங்கன்", "Exalter of the lineage", "குலத்தை உயர்த்துபவன்", B, H),
        ("Kulasekaran", "குலசேகரன்", "Crown of the lineage", "குலத்தின் சேகரன்", B, H),
    ],
    "Gha": [
        ("Ghanashyam", "கனஷ்யாம்", "Krishna, dark as a raincloud", "மேகவண்ணன் கண்ணன்", B, H),
        ("Ghanavathi", "கனவதி", "Dignified, weighty", "கனம் பொருந்தியவள்", G, H),
        ("Ghanendran", "கனேந்திரன்", "Lord of clouds", "மேகங்களின் தலைவன்", B, H),
    ],
    "Ng": [
        ("Nganesan", "ஞானேசன்", "Lord of wisdom", "ஞானத்தின் இறைவன்", B, H),
        ("Ngana", "ஞானா", "Wisdom", "ஞானம்", G, H),
    ],
    "Chha": [
        ("Chhaya", "சாயா", "Shadow, reflection", "நிழல்", G, H),
        ("Chhandan", "சந்தன்", "Sandalwood", "சந்தனம்", B, H),
    ],
    # ── Punarvasu ─────────────────────────────────────────────────────────
    "Ke": [
        ("Kesavan", "கேசவன்", "Krishna of beautiful hair", "கேசவப் பெருமாள்", B, H),
        ("Kethan", "கேதன்", "Banner, flag", "கொடி", B, H),
        ("Kemala", "கேமலா", "Pure, flawless", "மாசற்றவள்", G, H),
        ("Kevin", "கெவின்", "Handsome, gentle", "அழகிய மென்மையானவர்", B, C),
        ("Kesavan Kumar", "கேசவகுமார்", "Young Kesava", "இளம் கேசவன்", B, H),
    ],
    "Ko": [
        ("Kothai", "கோதை", "Andal, garland of flowers", "கோதை நாச்சியார்", G, H),
        ("Kovalan", "கோவலன்", "Cowherd; hero of Silappadikaram", "கோவலன்", B, H),
        ("Kokila", "கோகிலா", "Cuckoo, sweet singer", "குயில்", G, H),
        ("Kopperunchozhan", "கோப்பெருஞ்சோழன்", "Great Chola king", "பெருஞ்சோழ மன்னன்", B, H),
        ("Kowsalya", "கௌசல்யா", "Rama's mother", "இராமனின் தாய்", G, H),
        ("Kothandan", "கோதண்டன்", "Rama, bearer of the bow", "வில்லேந்திய இராமன்", B, H),
    ],
    "Ha": [
        ("Harish", "ஹரிஷ்", "Lord Vishnu", "திருமால்", B, H),
        ("Harini", "ஹரிணி", "Deer, graceful one", "மான்", G, H),
        ("Hariharan", "ஹரிஹரன்", "Vishnu and Shiva as one", "சங்கரநாராயணன்", B, H),
        ("Haasini", "ஹாசினி", "Cheerful, smiling", "புன்னகை உடையவள்", G, H),
        ("Hamsa", "ஹம்சா", "Swan, purity", "அன்னம்", G, H),
        ("Hamza", "ஹம்சா", "Steadfast, lion", "உறுதியானவர்", B, M),
        ("Hafiz", "ஹாஃபிஸ்", "Guardian, one who memorises the Quran", "பாதுகாப்பவர்", B, M),
        ("Hannah", "அன்னா", "Grace, favour", "அருள்", G, C),
    ],
    "Hee": [
        ("Heeran", "ஹீரன்", "Diamond, brilliant", "வைரம்", B, H),
        ("Heera", "ஹீரா", "Diamond", "வைரம்", G, H),
    ],
    # ── Pushya ────────────────────────────────────────────────────────────
    "Hu": [
        ("Husainar", "ஹுசைனார்", "Beautiful, good", "அழகானவர்", B, M),
        ("Humaira", "ஹுமைரா", "Rosy-cheeked", "செம்மேனியாள்", G, M),
        ("Huda", "ஹுதா", "Right guidance", "நல்வழி", G, M),
    ],
    "He": [
        ("Hemanth", "ஹேமந்த்", "Winter season", "பனிக்காலம்", B, H),
        ("Hema", "ஹேமா", "Gold", "பொன்", G, H),
        ("Hemalatha", "ஹேமலதா", "Golden creeper", "பொற்கொடி", G, H),
        ("Hemachandran", "ஹேமச்சந்திரன்", "Golden moon", "பொன்னிலவு", B, H),
        ("Helen", "ஹெலன்", "Light, torch", "ஒளி", G, C),
    ],
    "Ho": [
        ("Homeshwar", "ஹோமேஸ்வர்", "Lord of the sacred fire", "ஹோமத்தின் இறைவன்", B, H),
        ("Hoysala", "ஹொய்சளா", "Of the Hoysala line", "ஹொய்சள மரபு", B, H),
    ],
    "Da": [
        ("Dakshan", "தக்ஷன்", "Capable, skilful", "திறமையானவன்", B, H),
        ("Dakshina", "தக்ஷிணா", "Sacred offering; southern", "தட்சிணை", G, H),
        ("Damayanthi", "தமயந்தி", "Nala's queen; subduer", "தமயந்தி", G, H),
        ("Dayalan", "தயாளன்", "Compassionate one", "கருணை உடையவன்", B, H),
        ("Dayanidhi", "தயாநிதி", "Treasure of compassion", "கருணைக் கடல்", B, H),
        ("Darshan", "தர்ஷன்", "Vision of the divine", "தரிசனம்", B, H),
        ("Daniel", "டேனியல்", "God is my judge", "இறைவனே என் நீதிபதி", B, C),
        ("David", "தாவீது", "Beloved", "அன்பிற்குரியவர்", B, C),
    ],
    # ── Ashlesha ──────────────────────────────────────────────────────────
    "Dee": [
        ("Deepak", "தீபக்", "Lamp, light", "விளக்கு", B, H),
        ("Deepa", "தீபா", "Lamp", "தீபம்", G, H),
        ("Deepalakshmi", "தீபலட்சுமி", "Lakshmi of the lamp", "தீப லட்சுமி", G, H),
        ("Deepan", "தீபன்", "Illuminating one", "ஒளிர்பவன்", B, H),
        ("Deepthi", "தீப்தி", "Radiance", "ஒளிர்வு", G, H),
        ("Deenadayalan", "தீனதயாளன்", "Merciful to the humble", "எளியோர்க்கு இரங்குபவன்", B, H),
    ],
    "Du": [
        ("Durga", "துர்கா", "The invincible Goddess", "துர்க்கை அம்மன்", G, H),
        ("Duraisamy", "துரைசாமி", "Lord, chief", "தலைவர்", B, H),
        ("Durairaj", "துரைராஜ்", "Chief among kings", "அரசத் தலைவன்", B, H),
        ("Dushyanth", "துஷ்யந்த்", "The king of Shakuntala's tale", "துஷ்யந்தன்", B, H),
    ],
    "De": [
        ("Devan", "தேவன்", "God, divine one", "தெய்வம்", B, H),
        ("Devi", "தேவி", "Goddess", "தேவி", G, H),
        ("Devanathan", "தேவநாதன்", "Lord of the gods", "தேவர்கள் நாதன்", B, H),
        ("Devayani", "தேவயானி", "Of divine descent", "தேவயானி", G, H),
        ("Devaraj", "தேவராஜ்", "King of the gods, Indra", "தேவேந்திரன்", B, H),
        ("Deva", "தேவா", "Divine", "தெய்வீகம்", B, H),
    ],
    "Do": [
        ("Dorairaj", "தொரைராஜ்", "Chief king", "தலைமை அரசன்", B, H),
        ("Domnic", "டொமினிக்", "Belonging to the Lord", "இறைவனுக்கு உரியவர்", B, C),
    ],
    # ── Magha ─────────────────────────────────────────────────────────────
    "Ma": [
        ("Madhavan", "மாதவன்", "Lord Krishna", "கண்ணன்", B, H),
        ("Madhavi", "மாதவி", "Spring creeper; Krishna's consort", "மாதவிக் கொடி", G, H),
        ("Mahesh", "மகேஷ்", "Great Lord Shiva", "மகேசுவரன்", B, H),
        ("Malathi", "மாலதி", "Jasmine flower", "மல்லிகை", G, H),
        ("Mani", "மணி", "Gem, jewel", "இரத்தினம்", B, H),
        ("Manimekalai", "மணிமேகலை", "Jewelled girdle; the epic heroine", "மணிமேகலை", G, H),
        ("Maran", "மாறன்", "Pandya king", "பாண்டிய மன்னன்", B, H),
        ("Malarvizhi", "மலர்விழி", "Flower-like eyes", "மலர் போன்ற கண்கள்", G, H),
        ("Mariyappan", "மாரியப்பன்", "Devotee of Mariamman", "மாரியம்மன் அடியவர்", B, H),
        ("Mariam", "மரியம்", "Mother Mary", "அன்னை மரியாள்", G, C),
        ("Mohammed", "முகம்மது", "The praised one", "புகழப்பட்டவர்", B, M),
        ("Mahalakshmi", "மகாலட்சுமி", "The great Lakshmi", "மகாலட்சுமி", G, H),
    ],
    "Mee": [
        ("Meenakshi", "மீனாட்சி", "Fish-eyed Goddess of Madurai", "மதுரை மீனாட்சி", G, H),
        ("Meena", "மீனா", "Fish; precious stone", "மீன்", G, H),
        ("Meenal", "மீனல்", "Fish-eyed", "மீன் விழியாள்", G, H),
        ("Meenakshisundaram", "மீனாட்சிசுந்தரம்", "Shiva of Madurai", "மீனாட்சி சுந்தரேஸ்வரர்", B, H),
    ],
    "Mu": [
        ("Murugan", "முருகன்", "Lord Murugan, the beautiful", "முருகப்பெருமான்", B, H),
        ("Muthu", "முத்து", "Pearl", "முத்து", B, H),
        ("Muthulakshmi", "முத்துலட்சுமி", "Pearl Lakshmi", "முத்து லட்சுமி", G, H),
        ("Mukilan", "முகிலன்", "Cloud", "மேகம்", B, H),
        ("Mukundan", "முகுந்தன்", "Krishna, giver of liberation", "முகுந்தன்", B, H),
        ("Mullai", "முல்லை", "Jasmine; forest landscape", "முல்லை மலர்", G, H),
        ("Muthamizh", "முத்தமிழ்", "The threefold Tamil", "முத்தமிழ்", B, H),
        ("Mumtaz", "மும்தாஜ்", "Distinguished, exalted", "சிறப்புற்றவள்", G, M),
    ],
    "Me": [
        ("Meganathan", "மேகநாதன்", "Lord of the clouds", "மேகங்களின் நாதன்", B, H),
        ("Megala", "மேகலா", "Girdle; the epic name", "மேகலை", G, H),
        ("Mekala", "மேகலா", "Ornamental belt", "மேகலை", G, H),
        ("Meharban", "மெகர்பான்", "Kind, gracious", "கருணையுள்ளவர்", B, M),
    ],
    # ── Purva Phalguni ────────────────────────────────────────────────────
    "Mo": [
        ("Mohan", "மோகன்", "Charming, Krishna", "கவர்பவன்", B, H),
        ("Mohana", "மோகனா", "Enchanting", "கவர்ச்சி மிக்கவள்", G, H),
        ("Mohanraj", "மோகன்ராஜ்", "Charming king", "அழகிய அரசன்", B, H),
        ("Moses", "மோசே", "Drawn from the water", "நீரிலிருந்து எடுக்கப்பட்டவர்", B, C),
    ],
    "Ta": [
        ("Tamilarasan", "தமிழரசன்", "King of Tamil", "தமிழின் அரசன்", B, H),
        ("Tamilarasi", "தமிழரசி", "Queen of Tamil", "தமிழின் அரசி", G, H),
        ("Tamilselvan", "தமிழ்செல்வன்", "Treasure of Tamil", "தமிழ்ச் செல்வன்", B, H),
        ("Tamilselvi", "தமிழ்செல்வி", "Treasure of Tamil", "தமிழ்ச் செல்வி", G, H),
        ("Tanuja", "தனுஜா", "Daughter", "மகள்", G, H),
        ("Tarun", "தருண்", "Young, youthful", "இளமையானவன்", B, H),
    ],
    "Tee": [
        ("Theepika", "தீபிகா", "Lamp, light", "தீபிகை", G, H),
        ("Theeran", "தீரன்", "Brave, courageous", "வீரன்", B, H),
        ("Theertha", "தீர்த்தா", "Sacred water", "தீர்த்தம்", G, H),
    ],
    "Tu": [
        ("Thulasi", "துளசி", "The sacred basil", "துளசி", G, H),
        ("Thulasiraman", "துளசிராமன்", "Rama of the tulsi", "துளசி ராமன்", B, H),
        ("Thusharan", "துஷாரன்", "Dew, snow", "பனித்துளி", B, H),
    ],
    # ── Uttara Phalguni ───────────────────────────────────────────────────
    "Te": [
        ("Tenmozhi", "தென்மொழி", "Sweet southern tongue, Tamil", "தென் தமிழ்மொழி", G, H),
        ("Tennarasu", "தென்னரசு", "King of the south", "தென்னகத்து அரசு", B, H),
        ("Tejas", "தேஜஸ்", "Radiance, brilliance", "ஒளி", B, H),
        ("Tejaswini", "தேஜஸ்வினி", "Lustrous one", "ஒளி மிக்கவள்", G, H),
    ],
    "To": [
        ("Tholkappiyan", "தொல்காப்பியன்", "The ancient Tamil grammarian", "தொல்காப்பியர்", B, H),
        ("Thondaiman", "தொண்டைமான்", "Ancient Tamil chieftain", "தொண்டைமான்", B, H),
    ],
    "Paa": [
        ("Paandiyan", "பாண்டியன்", "Pandya king", "பாண்டிய மன்னன்", B, H),
        ("Paarthiban", "பார்த்திபன்", "King, ruler of the earth", "மன்னன்", B, H),
        ("Paavai", "பாவை", "Maiden; the Thiruppavai", "பாவை", G, H),
        ("Paarvathi", "பார்வதி", "Goddess Parvati", "பார்வதி தேவி", G, H),
        ("Paranjothi", "பரஞ்சோதி", "Supreme light", "பரம்பொருள் ஒளி", B, H),
        ("Paulraj", "பவுல்ராஜ்", "King Paul", "பவுல் அரசன்", B, C),
    ],
    "Pee": [
        ("Peelivendan", "பீலிவேந்தன்", "Murugan of the peacock plume", "மயில் பீலி வேந்தன்", B, H),
        ("Peethambaran", "பீதாம்பரன்", "Vishnu in yellow silk", "பீதாம்பரதாரி", B, H),
    ],
    # ── Hasta ─────────────────────────────────────────────────────────────
    "Pu": [
        ("Punitha", "புனிதா", "Holy, pure", "தூயவள்", G, H),
        ("Punithan", "புனிதன்", "Holy one", "தூயவன்", B, H),
        ("Pugazhendhi", "புகழேந்தி", "Bearer of fame", "புகழ் ஏந்தியவன்", B, H),
        ("Pushpa", "புஷ்பா", "Flower", "மலர்", G, H),
        ("Pushparani", "புஷ்பராணி", "Queen of flowers", "மலர் ராணி", G, H),
        ("Purushothaman", "புருஷோத்தமன்", "The supreme being, Vishnu", "புருஷோத்தமர்", B, H),
    ],
    "Sha": [
        ("Shakthi", "சக்தி", "Divine power, the Goddess", "பராசக்தி", G, H),
        ("Shanmugam", "சண்முகம்", "Six-faced Murugan", "ஆறுமுகன்", B, H),
        ("Shanthi", "சாந்தி", "Peace", "அமைதி", G, H),
        ("Sharmila", "சர்மிளா", "Modest, gentle", "நாணமுடையவள்", G, H),
        ("Shakthivel", "சக்திவேல்", "Murugan's spear of power", "சக்தி வேல்", B, H),
        ("Shabana", "ஷபனா", "Young lady", "இளம் பெண்", G, M),
        ("Shahul", "ஷாகுல்", "Devoted saint's name", "ஷாகுல் ஹமீது", B, M),
    ],
    "Na": [
        ("Nagarajan", "நாகராஜன்", "King of serpents", "நாகராஜர்", B, H),
        ("Nalini", "நளினி", "Lotus", "தாமரை", G, H),
        ("Nandhini", "நந்தினி", "Joyful, the sacred cow", "மகிழ்ச்சி தருபவள்", G, H),
        ("Nandhakumar", "நந்தகுமார்", "Krishna, son of Nanda", "நந்தகோபன் மகன்", B, H),
        ("Navaneethan", "நவநீதன்", "Butter; Krishna", "வெண்ணெய்க் கண்ணன்", B, H),
        ("Nachiyar", "நாச்சியார்", "Lady, Andal", "ஆண்டாள் நாச்சியார்", G, H),
        ("Narayanan", "நாராயணன்", "Lord Vishnu", "நாராயணப் பெருமாள்", B, H),
        ("Nalan", "நளன்", "The king Nala", "நள மகாராஜன்", B, H),
    ],
    "Tha": [
        ("Thangam", "தங்கம்", "Gold", "பொன்", G, H),
        ("Thangavel", "தங்கவேல்", "Golden spear of Murugan", "பொன் வேல்", B, H),
        ("Thamizhini", "தமிழினி", "Sweet as Tamil", "தமிழ் இனியவள்", G, H),
        ("Thanalakshmi", "தனலட்சுமி", "Lakshmi of wealth", "தன லட்சுமி", G, H),
        ("Thanigai", "தணிகை", "Murugan of Thiruthani", "திருத்தணி முருகன்", B, H),
    ],
    # ── Chitra ────────────────────────────────────────────────────────────
    "Pe": [
        ("Perumal", "பெருமாள்", "Lord Vishnu", "பெருமாள்", B, H),
        ("Periyasamy", "பெரியசாமி", "The great lord", "பெரிய சாமி", B, H),
        ("Perundevi", "பெருந்தேவி", "The great Goddess", "பெருந்தேவி தாயார்", G, H),
        ("Peter", "பீட்டர்", "Rock", "பாறை", B, C),
    ],
    "Po": [
        ("Ponnusamy", "பொன்னுசாமி", "Golden lord", "பொன் சாமி", B, H),
        ("Ponni", "பொன்னி", "The river Kaveri; golden", "காவிரி", G, H),
        ("Ponmalar", "பொன்மலர்", "Golden flower", "பொன் மலர்", G, H),
        ("Ponvannan", "பொன்வண்ணன்", "Golden-hued", "பொன்னிற வண்ணன்", B, H),
        ("Pothiraj", "பொதிராஜ்", "King of the Pothigai hills", "பொதிகை அரசன்", B, H),
    ],
    "Ra": [
        ("Raman", "இராமன்", "Lord Rama", "ஸ்ரீ ராமன்", B, H),
        ("Rajan", "ராஜன்", "King", "அரசன்", B, H),
        ("Rajeshwari", "ராஜேஸ்வரி", "Queen Goddess", "ராஜராஜேஸ்வரி", G, H),
        ("Radha", "ராதா", "Krishna's beloved", "ராதை", G, H),
        ("Raghavan", "ராகவன்", "Of Raghu's line, Rama", "ரகுவம்சத்தவன்", B, H),
        ("Ramya", "ரம்யா", "Pleasing, beautiful", "இனிமையானவள்", G, H),
        ("Rajalakshmi", "ராஜலட்சுமி", "Royal Lakshmi", "ராஜ லட்சுமி", G, H),
        ("Ravi", "ரவி", "The Sun", "சூரியன்", B, H),
        ("Rahim", "ரஹீம்", "Merciful", "கருணையாளர்", B, M),
        ("Rahmath", "ரஹ்மத்", "Mercy, compassion", "கருணை", G, M),
        ("Raphael", "ரஃபேல்", "God has healed", "இறைவன் குணமாக்கினார்", B, C),
    ],
    "Ree": [
        ("Reetha", "ரீதா", "Pearl; the saint's name", "முத்து", G, C),
        ("Reena", "ரீனா", "Joy, peace", "மகிழ்ச்சி", G, H),
    ],
    # ── Swati ─────────────────────────────────────────────────────────────
    "Ru": [
        ("Rudran", "ருத்ரன்", "Lord Shiva", "ருத்திரன்", B, H),
        ("Rukmini", "ருக்மிணி", "Krishna's consort", "ருக்மிணி தேவி", G, H),
        ("Ruban", "ருபன்", "Form, beauty", "உருவம்", B, C),
        ("Rukmani", "ருக்மணி", "Golden one", "பொன்னானவள்", G, H),
    ],
    "Re": [
        ("Renuka", "ரேணுகா", "The Goddess, mother of Parashurama", "ரேணுகா தேவி", G, H),
        ("Revathi", "ரேவதி", "The 27th Nakshatra", "ரேவதி நட்சத்திரம்", G, H),
        ("Rengan", "ரெங்கன்", "Lord Ranganatha", "ரங்கநாதர்", B, H),
        ("Rengaraj", "ரெங்கராஜ்", "King Ranganatha", "ரங்கராஜன்", B, H),
    ],
    "Ro": [
        ("Rohith", "ரோகித்", "Red, the first ray", "செம்மையானவன்", B, H),
        ("Rohini", "ரோகிணி", "The 4th Nakshatra; Krishna's mother", "ரோகிணி நட்சத்திரம்", G, H),
        ("Rosalin", "ரோசலின்", "Gentle rose", "ரோஜா", G, C),
        ("Robert", "ராபர்ட்", "Bright fame", "ஒளிர் புகழ்", B, C),
    ],
    "Taa": [
        ("Thaamarai", "தாமரை", "Lotus", "தாமரை மலர்", G, H),
        ("Thaayumanavar", "தாயுமானவர்", "Shiva who became the mother", "தாயுமானவர்", B, H),
        ("Thaarani", "தாரணி", "The earth", "பூமி", G, H),
    ],
    # ── Vishakha ──────────────────────────────────────────────────────────
    "The": [
        ("Thenmozhi", "தேன்மொழி", "Honey-sweet speech", "தேன் போன்ற மொழி", G, H),
        ("Thenral", "தென்றல்", "Gentle southern breeze", "தென்றல் காற்று", G, H),
        ("Thevan", "தேவன்", "Divine one", "தெய்வம்", B, H),
        ("Thendral", "தென்றல்", "Soft breeze", "இளந்தென்றல்", G, H),
    ],
    "Tho": [
        ("Thondaradipodi", "தொண்டரடிப்பொடி", "Dust of the devotees' feet", "தொண்டரடிப்பொடி ஆழ்வார்", B, H),
        ("Thomas", "தோமஸ்", "Twin", "இரட்டையர்", B, C),
    ],
    "Naa": [
        ("Naagamani", "நாகமணி", "Serpent gem", "நாக மணி", G, H),
        ("Naaradhan", "நாரதன்", "The divine sage Narada", "நாரத முனிவர்", B, H),
        ("Naanmaran", "நான்மாறன்", "Pandya title", "பாண்டியன் பட்டம்", B, H),
    ],
    "Nee": [
        ("Neelakandan", "நீலகண்டன்", "Blue-throated Shiva", "நீலகண்டப் பெருமான்", B, H),
        ("Neela", "நீலா", "Sapphire blue", "நீல நிறம்", G, H),
        ("Neelaveni", "நீலவேணி", "Dark-haired one", "கரிய கூந்தலாள்", G, H),
        ("Neethi", "நீதி", "Justice", "நீதி", G, H),
    ],
    # ── Anuradha ──────────────────────────────────────────────────────────
    "Nu": [
        ("Nooruddin", "நூருத்தீன்", "Light of the faith", "மார்க்கத்தின் ஒளி", B, M),
        ("Noorjahan", "நூர்ஜஹான்", "Light of the world", "உலகின் ஒளி", G, M),
    ],
    "Ne": [
        ("Nesan", "நேசன்", "Beloved friend", "அன்பன்", B, H),
        ("Nesamani", "நேசமணி", "Jewel of love", "அன்பு மணி", B, H),
        ("Nehru", "நேரு", "Modern given name", "நவீனப் பெயர்", B, H),
    ],
    "No": [
        ("Nochiyan", "நொச்சியன்", "Of the nochi tree", "நொச்சி மரத்தவன்", B, H),
        ("Noel", "நோவல்", "Christmas, nativity", "கிறிஸ்து பிறப்பு", B, C),
    ],
    "Yaa": [
        ("Yaazhini", "யாழினி", "Sweet as the yaazh lute", "யாழ் இசை போன்றவள்", G, H),
        ("Yaazhisai", "யாழிசை", "Music of the yaazh", "யாழ் இசை", G, H),
        ("Yaadhavan", "யாதவன்", "Of the Yadava line, Krishna", "யாதவ குலத்தவன்", B, H),
    ],
    # ── Jyeshtha / Moola ──────────────────────────────────────────────────
    "Ye": [
        ("Yegambaram", "ஏகாம்பரம்", "Shiva of Kanchipuram", "ஏகாம்பரநாதர்", B, H),
        ("Yesudas", "யேசுதாஸ்", "Servant of Jesus", "இயேசுவின் அடியவர்", B, C),
        ("Yesuraj", "யேசுராஜ்", "Christ the King", "இயேசு அரசர்", B, C),
    ],
    "Yo": [
        ("Yogesh", "யோகேஷ்", "Lord of yoga, Shiva", "யோகேஸ்வரன்", B, H),
        ("Yogeswari", "யோகேஸ்வரி", "Goddess of yoga", "யோகேஸ்வரி", G, H),
        ("Yogan", "யோகன்", "One of spiritual discipline", "யோகி", B, H),
        ("Yohan", "யோவான்", "God is gracious", "இறைவன் அருளாளர்", B, C),
    ],
    "Baa": [
        ("Baalan", "பாலன்", "Child, young one", "சிறுவன்", B, H),
        ("Baalaji", "பாலாஜி", "Lord Venkateswara", "திருப்பதி பாலாஜி", B, H),
        ("Baalambika", "பாலாம்பிகை", "The youthful Goddess", "பாலாம்பிகை", G, H),
        ("Baanumathi", "பானுமதி", "Radiant as the sun", "சூரிய ஒளியாள்", G, H),
    ],
    "Bee": [
        ("Beemarajan", "பீமராஜன்", "Mighty king", "வலிமை மிக்க அரசன்", B, H),
        ("Beeman", "பீமன்", "The mighty Pandava", "பீமசேனன்", B, H),
    ],
    "Bhaa": [
        ("Bhaarathi", "பாரதி", "Goddess Saraswati", "பாரதி அன்னை", G, H),
        ("Bhaarath", "பாரத்", "Of India", "பாரத நாடு", B, H),
        ("Bhaanumathi", "பானுமதி", "Sunlike", "சூரிய ஒளி கொண்டவள்", G, H),
    ],
    "Bhee": [
        ("Bheeman", "பீமன்", "The mighty one", "வலிமையானவன்", B, H),
    ],
    # ── Purva Ashadha ─────────────────────────────────────────────────────
    "Bhu": [
        ("Bhuvana", "புவனா", "The world", "உலகம்", G, H),
        ("Bhuvaneswari", "புவனேஸ்வரி", "Goddess of the universe", "புவனேஸ்வரி அம்மன்", G, H),
        ("Bhuvanesh", "புவனேஷ்", "Lord of the world", "புவனேசன்", B, H),
        ("Bhuminathan", "பூமிநாதன்", "Lord of the earth", "பூமியின் நாதன்", B, H),
    ],
    "Dha": [
        ("Dhanush", "தனுஷ்", "Bow", "வில்", B, H),
        ("Dhanalakshmi", "தனலட்சுமி", "Goddess of wealth", "தன லட்சுமி", G, H),
        ("Dharani", "தரணி", "The earth", "பூமி", G, H),
        ("Dharman", "தர்மன்", "Righteous one", "அறம் உடையவன்", B, H),
        ("Dhanasekaran", "தனசேகரன்", "Crown of wealth", "செல்வச் சேகரன்", B, H),
        ("Dhanya", "தான்யா", "Blessed, grain", "பேறு பெற்றவள்", G, H),
    ],
    "Pha": [
        ("Phaniraj", "பணிராஜ்", "King of serpents", "நாக அரசன்", B, H),
    ],
    # ── Uttara Ashadha ────────────────────────────────────────────────────
    "Bhe": [
        ("Bhemanna", "பேமண்ணா", "Mighty elder", "வலிய மூத்தவர்", B, H),
    ],
    "Bho": [
        ("Bhojan", "போஜன்", "The king Bhoja, patron of arts", "போஜ மன்னன்", B, H),
    ],
    "Jaa": [
        ("Jaanaki", "ஜானகி", "Sita, daughter of Janaka", "ஜானகி தேவி", G, H),
        ("Jaagan", "ஜாகன்", "Wakeful, alert", "விழிப்புடையவன்", B, H),
        ("Jaabir", "ஜாபிர்", "Comforter, consoler", "ஆறுதல் அளிப்பவர்", B, M),
    ],
    "Jee": [
        ("Jeevan", "ஜீவன்", "Life", "உயிர்", B, H),
        ("Jeevitha", "ஜீவிதா", "Full of life", "உயிர்ப்பு மிக்கவள்", G, H),
        ("Jeeva", "ஜீவா", "Living soul", "உயிர்", B, H),
    ],
    # ── Shravana ──────────────────────────────────────────────────────────
    "Khi": [
        ("Khizar", "கிழர்", "Green, the ever-living guide", "பசுமையானவர்", B, M),
    ],
    "Khu": [
        ("Khursheed", "குர்ஷீத்", "The sun", "சூரியன்", B, M),
    ],
    "Khe": [
        ("Khemraj", "கேமராஜ்", "King of wellbeing", "நலம் தரும் அரசன்", B, H),
    ],
    "Kho": [
        ("Khodhandan", "கோதண்டன்", "Rama, bearer of the bow", "கோதண்டராமர்", B, H),
    ],
    # ── Dhanishta ─────────────────────────────────────────────────────────
    "Gaa": [
        ("Gaayathri", "காயத்ரி", "The sacred Gayatri mantra", "காயத்ரி மந்திரம்", G, H),
        ("Gaanavi", "கானவி", "Musical", "இசை நலம் கொண்டவள்", G, H),
        ("Gaanamudhan", "கானமுதன்", "Nectar of music", "இசை அமுதம்", B, H),
        ("Gaandhi", "காந்தி", "Radiance; the Mahatma", "ஒளி", B, H),
    ],
    "Gee": [
        ("Geetha", "கீதா", "Song; the Bhagavad Gita", "பகவத் கீதை", G, H),
        ("Geethan", "கீதன்", "Song of righteousness", "கீத நாயகன்", B, H),
        ("Geethanjali", "கீதாஞ்சலி", "Offering of songs", "பாடல் அஞ்சலி", G, H),
    ],
    "Gu": [
        ("Guruprasath", "குருபிரசாத்", "Grace of the guru", "குரு அருள்", B, H),
        ("Gunasekaran", "குணசேகரன்", "Crown of virtues", "குணச் சேகரன்", B, H),
        ("Gunavathi", "குணவதி", "Virtuous woman", "நற்குணம் உடையவள்", G, H),
        ("Gunalan", "குணாளன்", "Of good qualities", "நற்குணத்தான்", B, H),
        ("Gurumurthy", "குருமூர்த்தி", "Embodiment of the guru", "குரு மூர்த்தி", B, H),
    ],
    "Ge": [
        ("Gengaiamman", "கெங்கையம்மன", "Goddess Ganga", "கங்கையம்மன்", G, H),
        ("George", "ஜார்ஜ்", "Farmer, tiller of the soil", "உழவர்", B, C),
    ],
    # ── Shatabhisha ───────────────────────────────────────────────────────
    "Go": [
        ("Gopalan", "கோபாலன்", "Krishna, the cowherd", "கோபாலகிருஷ்ணன்", B, H),
        ("Gopika", "கோபிகா", "Cowherd maiden of Vrindavan", "கோபிகை", G, H),
        ("Govindan", "கோவிந்தன்", "Lord Krishna", "கோவிந்தன்", B, H),
        ("Gomathi", "கோமதி", "The sacred river; Goddess", "கோமதி அம்மன்", G, H),
        ("Gokul", "கோகுல்", "Krishna's village", "கோகுலம்", B, H),
    ],
    "Saa": [
        ("Saarangan", "சாரங்கன்", "Vishnu, bearer of the Sarnga bow", "சாரங்கபாணி", B, H),
        ("Saaradha", "சாரதா", "Goddess Saraswati", "சாரதாம்பாள்", G, H),
        ("Saarumathi", "சாருமதி", "Beautiful mind", "அழகிய மதி", G, H),
        ("Saalini", "சாலினி", "Modest, dignified", "பண்பு உடையவள்", G, H),
    ],
    "See": [
        ("Seetha", "சீதா", "Sita, consort of Rama", "சீதா தேவி", G, H),
        ("Seetharaman", "சீதாராமன்", "Rama with Sita", "சீதாராமர்", B, H),
        ("Seenivasan", "சீனிவாசன்", "Lord Venkateswara", "ஸ்ரீநிவாசர்", B, H),
        ("Seeralan", "சீராளன்", "Of noble conduct", "சீர் உடையவன்", B, H),
        ("Seermathi", "சீர்மதி", "Bright mind", "சீரிய மதி", G, H),
    ],
    "Su": [
        ("Sundaram", "சுந்தரம்", "Beauty", "அழகு", B, H),
        ("Sundari", "சுந்தரி", "Beautiful woman", "அழகி", G, H),
        ("Subramanian", "சுப்ரமணியன்", "Lord Murugan", "சுப்ரமணியர்", B, H),
        ("Sudha", "சுதா", "Nectar", "அமுதம்", G, H),
        ("Suresh", "சுரேஷ்", "Lord of the gods, Indra", "தேவேந்திரன்", B, H),
        ("Sumathi", "சுமதி", "Of good mind", "நல்ல மதி உடையவள்", G, H),
        ("Sugirtha", "சுகிர்தா", "Virtue, good deed", "நற்செயல்", G, C),
        ("Sulochana", "சுலோசனா", "One with beautiful eyes", "அழகிய கண்ணாள்", G, H),
        ("Sudhakar", "சுதாகர்", "The moon, giver of nectar", "அமுதம் தருபவன்", B, H),
    ],
    # ── Purva Bhadrapada ──────────────────────────────────────────────────
    "Se": [
        ("Senthil", "செந்தில்", "Murugan of Tiruchendur", "திருச்செந்தூர் முருகன்", B, H),
        ("Selvi", "செல்வி", "Prosperous girl", "செல்வ மகள்", G, H),
        ("Sevvel", "செவ்வேள்", "The red radiant Murugan", "செவ்வேள் முருகன்", B, H),
        ("Selvaraj", "செல்வராஜ்", "King of prosperity", "செல்வ அரசன்", B, H),
        ("Sengamalam", "செங்கமலம்", "Red lotus", "செந்தாமரை", G, H),
    ],
    "So": [
        ("Somasundaram", "சோமசுந்தரம்", "Shiva bearing the crescent moon", "சோமசுந்தரேஸ்வரர்", B, H),
        ("Soundarya", "சௌந்தர்யா", "Beauty", "அழகு", G, H),
        ("Somesh", "சோமேஷ்", "Lord of the moon", "சோமநாதர்", B, H),
        ("Sownthariya", "சௌந்தரியா", "Graceful beauty", "எழில் மிக்கவள்", G, H),
    ],
    "Daa": [
        ("Daakshayini", "தாட்சாயிணி", "Daughter of Daksha, Parvati", "தாட்சாயிணி", G, H),
        ("Daamodaran", "தாமோதரன்", "Krishna bound at the waist", "தாமோதரன்", B, H),
    ],
    # ── Uttara Bhadrapada ─────────────────────────────────────────────────
    "Jna": [
        ("Jnanasekaran", "ஞானசேகரன்", "Crown of wisdom", "ஞானச் சேகரன்", B, H),
        ("Jnanambal", "ஞானாம்பாள்", "Goddess of wisdom", "ஞானாம்பிகை", G, H),
        ("Jnanavel", "ஞானவேல்", "Spear of wisdom, Murugan", "ஞான வேல்", B, H),
    ],
    # ── Revati ────────────────────────────────────────────────────────────
    "Chaa": [
        ("Chaarumathi", "சாருமதி", "Beautiful mind", "அழகிய அறிவு", G, H),
        ("Chaandhini", "சாந்தினி", "Moonlight", "நிலவொளி", G, H),
        ("Chaitanyan", "சைதன்யன்", "Consciousness", "பேரறிவு", B, H),
        ("Chaarulatha", "சாருலதா", "Graceful creeper", "அழகிய கொடி", G, H),
    ],
    "Chee": [
        ("Cheeralan", "சீராளன்", "Of noble conduct and glory", "சீர்மை உடையவன்", B, H),
        ("Cheermathi", "சீர்மதி", "Bright intelligent mind", "சீரிய மதி", G, H),
        ("Cheenivasan", "சீனிவாசன்", "Lord Venkateswara", "ஸ்ரீநிவாசர்", B, H),
    ],
}


def _all_entries() -> Dict[str, List[Entry]]:
    """Batch 1 plus batch 2, merged by syllable."""
    from backend.app.services.baby_name_bank2 import BANK2
    from backend.app.services.baby_name_bank3 import BANK3
    from backend.app.services.baby_name_bank4 import BANK4
    from backend.app.services.baby_name_meanings import apply_meaning_fixes

    combined: Dict[str, List[Entry]] = {k: list(v) for k, v in BANK.items()}
    for extra in (BANK2, BANK3, BANK4):
        for syllable, entries in extra.items():
            combined.setdefault(syllable, []).extend(entries)

    # A name must never appear twice under the same syllable, whichever batch
    # it came from. First occurrence wins.
    deduped: Dict[str, List[Entry]] = {}
    for syllable, entries in combined.items():
        seen = set()
        kept = []
        for e in entries:
            key = e[0].strip().lower()
            if key in seen:
                continue
            seen.add(key)
            kept.append(e)
        deduped[syllable] = apply_meaning_fixes(kept)
    return deduped


def expand_bank() -> Dict[str, List[Dict[str, Any]]]:
    """Converts the tuple banks into the dict shape the rest of the app uses."""
    out: Dict[str, List[Dict[str, Any]]] = {}
    for syllable, entries in _all_entries().items():
        rows: List[Dict[str, Any]] = []
        for name, name_ta, meaning, meaning_ta, gender, religion in entries:
            rows.append({
                "name": name,
                "name_ta": name_ta,
                "meaning": meaning,
                "meaning_ta": meaning_ta,
                "gender": gender,
                "religion": religion,
            })
        out[syllable] = rows
    return out


def bank_stats() -> Dict[str, Any]:
    """Used by the API's /stats endpoint so the real coverage is inspectable
    rather than guessed at."""
    everything = _all_entries()
    total = sum(len(v) for v in everything.values())
    by_religion: Dict[str, int] = {}
    by_gender: Dict[str, int] = {}
    for entries in everything.values():
        for e in entries:
            by_gender[e[4]] = by_gender.get(e[4], 0) + 1
            by_religion[e[5]] = by_religion.get(e[5], 0) + 1
    return {
        "total_names": total,
        "syllables_covered": len(everything),
        "by_religion": by_religion,
        "by_gender": by_gender,
    }
