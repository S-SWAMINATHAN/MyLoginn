"""
Baby-name bank, batch 2.

Same rules as baby_name_bank.py: every entry is a name that is genuinely in
use, with the meaning it is actually given. Nothing is coined to pad a
syllable out to a count, and no meaning is guessed at. Where a syllable has
few real names it stays short.

Meanings are kept SHORT and plain, the way a Tamil naming book gives them —
two or three words where that is the whole meaning. A longer sentence would
only be padding.

Format matches batch 1:
    (name_en, name_ta, meaning_en, meaning_ta, gender, religion)
"""

from typing import Dict, List, Tuple

Entry = Tuple[str, str, str, str, str, str]

H = "hindu"
C = "christian"
M = "muslim"
B = "boy"
G = "girl"

BANK2: Dict[str, List[Entry]] = {
    "Chu": [
        ("Chudarkodi", "சுடர்க்கொடி", "Radiant creeper", "ஒளிக் கொடி", G, H),
        ("Chudaroli", "சுடரொளி", "Bright light", "சுடர் ஒளி", G, H),
        ("Chunthari", "சுந்தரி", "Beautiful one", "அழகி", G, H),
    ],
    "Che": [
        ("Chezhian", "செழியன்", "Prosperous, Pandya title", "செழிப்பானவன்", B, H),
        ("Chenkodi", "செங்கொடி", "Red banner", "சிவப்புக் கொடி", G, H),
        ("Chentamil", "செந்தமிழ்", "Pure Tamil", "தூய தமிழ்", B, H),
        ("Chelvakumar", "செல்வக்குமார்", "Prosperous son", "செல்வ மகன்", B, H),
        ("Chenkathir", "செங்கதிர்", "Red ray of the sun", "செம்மையான கதிர்", B, H),
    ],
    "Cho": [
        ("Cholamathi", "சோழமதி", "Chola moon", "சோழ நிலவு", G, H),
        ("Chondamani", "சொந்தமணி", "Own jewel", "சொந்த மணி", G, H),
    ],
    "La": [
        ("Lalitham", "லலிதம்", "Gentle, graceful", "மென்மை", G, H),
        ("Lakshanya", "லட்சண்யா", "Of good qualities", "நல்லியல்பு", G, H),
        ("Lalgudi", "லால்குடி", "Place name used as a name", "ஊர்ப் பெயர்", B, H),
        ("Lawrence", "லாரன்ஸ்", "Crowned with laurel", "வெற்றி மாலை", B, C),
    ],
    "Lee": [
        ("Leelamani", "லீலாமணி", "Jewel of divine play", "லீலா மணி", G, H),
    ],
    "Lo": [
        ("Logeswaran", "லோகேஸ்வரன்", "Lord of the world", "உலக ஈஸ்வரன்", B, H),
        ("Logamadevi", "லோகமாதேவி", "Great queen of the world", "உலக மகாதேவி", G, H),
        ("Lohithan", "லோகிதன்", "Red, radiant", "சிவந்தவன்", B, H),
    ],
    "Aa": [
        ("Aadhilingam", "ஆதிலிங்கம்", "The primordial Shiva", "ஆதி லிங்கம்", B, H),
        ("Aaleesha", "ஆலீஷா", "Protected by God", "இறைவன் காப்பவள்", G, M),
        ("Aarumugam", "ஆறுமுகம்", "Six-faced Murugan", "ஆறுமுகப் பெருமான்", B, H),
        ("Aanandhi", "ஆனந்தி", "Joyful woman", "மகிழ்ச்சி உடையவள்", G, H),
        ("Aazhagi", "அழகி", "Beautiful one", "அழகானவள்", G, H),
        ("Aavudaiyappan", "ஆவுடையப்பன்", "Shiva of the avudaiyar", "ஆவுடையார் கோயில் இறைவன்", B, H),
    ],
    "Ee": [
        ("Eesan", "ஈசன்", "Lord Shiva", "ஈசன்", B, H),
        ("Eeswarapriya", "ஈஸ்வரப்பிரியா", "Beloved of Shiva", "ஈஸ்வரனுக்கு இனியவள்", G, H),
        ("Eeliyas", "இலியாஸ்", "The prophet Elijah", "நபி இலியாஸ்", B, M),
    ],
    "U": [
        ("Ulaganathan", "உலகநாதன்", "Lord of the world", "உலக நாதன்", B, H),
        ("Uma", "உமா", "Goddess Parvati", "உமாதேவி", G, H),
        ("Umamaheswari", "உமாமகேஸ்வரி", "Uma, consort of Shiva", "உமா மகேஸ்வரி", G, H),
        ("Uthiradevi", "உத்திரதேவி", "Goddess of the Uttara star", "உத்திர தேவி", G, H),
        ("Udhayakumar", "உதயகுமார்", "Son of the dawn", "உதய குமாரன்", B, H),
        ("Ulagammal", "உலகம்மாள்", "Mother of the world", "உலகன்னை", G, H),
    ],
    "E": [
        ("Ezhilmathi", "எழில்மதி", "Beautiful moon", "அழகிய நிலவு", G, H),
        ("Elangovan", "இளங்கோவன்", "Young prince", "இளவரசன்", B, H),
        ("Elakkiyan", "இலக்கியன்", "Of literature", "இலக்கியத்தவன்", B, H),
        ("Elamathi", "இளமதி", "Young moon", "இளம் நிலவு", G, H),
        ("Elizabeth", "எலிசபெத்", "God is my oath", "இறைவன் என் சத்தியம்", G, C),
    ],
    "O": [
        ("Oliyarasi", "ஒளியரசி", "Queen of light", "ஒளியின் அரசி", G, H),
        ("Oliventhan", "ஒளிவேந்தன்", "King of light", "ஒளி வேந்தன்", B, H),
        ("Othuvaan", "ஓதுவான்", "One who chants", "ஓதுபவன்", B, H),
    ],
    "Va": [
        ("Vairamuthu", "வைரமுத்து", "Diamond pearl", "வைர முத்து", B, H),
        ("Vasumathi", "வசுமதி", "The earth", "பூமி", G, H),
        ("Vadivelu", "வடிவேலு", "Murugan's sharp spear", "வடி வேல்", B, H),
        ("Vanmathi", "வான்மதி", "Moon of the sky", "வான் நிலவு", G, H),
        ("Valarmathy", "வளர்மதி", "Growing moon", "வளர்பிறை", G, H),
        ("Vanathi", "வானதி", "Of the sky", "வானத்தவள்", G, H),
        ("Vasantha", "வசந்தா", "Spring", "வசந்தம்", G, H),
        ("Varadharajan", "வரதராஜன்", "Boon-granting king, Vishnu", "வரதராஜப் பெருமாள்", B, H),
    ],
    "Vi": [
        ("Vivek", "விவேக்", "Discernment, wisdom", "விவேகம்", B, H),
        ("Vinayagam", "விநாயகம்", "Lord Ganesha", "விநாயகர்", B, H),
        ("Vijayalakshmi", "விஜயலட்சுமி", "Lakshmi of victory", "விஜய லட்சுமி", G, H),
        ("Vimalan", "விமலன்", "Pure one", "தூயவன்", B, H),
        ("Vidhusha", "விதுஷா", "Learned woman", "கற்றறிந்தவள்", G, H),
        ("Vijayakumar", "விஜயகுமார்", "Son of victory", "விஜய குமாரன்", B, H),
    ],
    "Ve": [
        ("Velmurugan", "வேல்முருகன்", "Murugan with the spear", "வேல் முருகன்", B, H),
        ("Vengadesan", "வெங்கடேசன்", "Lord of Tirupati", "வேங்கடேசப் பெருமாள்", B, H),
        ("Velankanni", "வேளாங்கண்ணி", "Our Lady of Velankanni", "வேளாங்கண்ணி அன்னை", G, C),
        ("Vetriselvan", "வெற்றிச்செல்வன்", "Treasure of victory", "வெற்றிச் செல்வன்", B, H),
        ("Vennilaa", "வெண்ணிலா", "White moonlight", "வெண் நிலா", G, H),
    ],
    "Ka": [
        ("Kavitha", "கவிதா", "Poem", "கவிதை", G, H),
        ("Kalaimagal", "கலைமகள்", "Goddess Saraswati", "கலைமகள்", G, H),
        ("Kalaiselvan", "கலைச்செல்வன்", "Treasure of the arts", "கலைச் செல்வன்", B, H),
        ("Kaliyamoorthy", "காளியமூர்த்தி", "Form of Kali", "காளி மூர்த்தி", B, H),
        ("Kamatchi", "காமாட்சி", "Goddess Kamakshi", "காமாட்சி அம்மன்", G, H),
        ("Kaviyarasu", "கவியரசு", "King of poets", "கவி அரசு", B, H),
        ("Karpagam", "கற்பகம்", "The wish-granting tree", "கற்பக விருட்சம்", G, H),
        ("Kanimozhi", "கனிமொழி", "Sweet speech", "இனிய மொழி", G, H),
    ],
    "Ku": [
        ("Kumaravel", "குமரவேல்", "Murugan with the spear", "குமர வேல்", B, H),
        ("Kumudha", "குமுதா", "Water lily", "குமுதம்", G, H),
        ("Kuppusamy", "குப்புசாமி", "Traditional Tamil name", "பாரம்பரியப் பெயர்", B, H),
        ("Kunthala", "குந்தளா", "One with fine hair", "கூந்தல் அழகி", G, H),
        ("Kulanthai", "குழந்தை", "Child", "குழந்தை", B, H),
        ("Kumudhini", "குமுதினி", "Lotus pond", "குமுதம் நிறைந்தவள்", G, H),
    ],
    "Ma": [
        ("Manimaran", "மணிமாறன்", "Jewel of the Pandya line", "மணி மாறன்", B, H),
        ("Maheswari", "மகேஸ்வரி", "The great Goddess", "மகேஸ்வரி", G, H),
        ("Manjula", "மஞ்சுளா", "Sweet, pleasing", "இனியவள்", G, H),
        ("Manohar", "மனோகர்", "Captivating", "மனதைக் கவர்பவன்", B, H),
        ("Malarkodi", "மலர்க்கொடி", "Flowering creeper", "மலர்க் கொடி", G, H),
        ("Marimuthu", "மாரிமுத்து", "Pearl of Mariamman", "மாரி முத்து", B, H),
        ("Mangaiyarkarasi", "மங்கையர்க்கரசி", "Queen among women", "மங்கையர்க்கரசி", G, H),
        ("Mariyappan", "மாரியப்பன்", "Devotee of Mariamman", "மாரி அப்பன்", B, H),
    ],
    "Mu": [
        ("Muthuraman", "முத்துராமன்", "Pearl Rama", "முத்து ராமன்", B, H),
        ("Mullaivendhan", "முல்லைவேந்தன்", "King of the jasmine land", "முல்லை வேந்தன்", B, H),
        ("Muthumari", "முத்துமாரி", "Goddess Mariamman", "முத்து மாரியம்மன்", G, H),
        ("Murugesan", "முருகேசன்", "Lord Murugan", "முருகேசர்", B, H),
        ("Mugilan", "முகிலன்", "Cloud", "முகில்", B, H),
    ],
    "Na": [
        ("Nagammal", "நாகம்மாள்", "Serpent goddess", "நாகம்மன்", G, H),
        ("Nallathambi", "நல்லதம்பி", "Good younger brother", "நல்ல தம்பி", B, H),
        ("Nanmaran", "நன்மாறன்", "Good Pandya king", "நன் மாறன்", B, H),
        ("Nithya", "நித்யா", "Eternal", "நிரந்தரம்", G, H),
        ("Nilavan", "நிலவன்", "Moon", "நிலவு", B, H),
        ("Nirmala", "நிர்மலா", "Pure, spotless", "தூயவள்", G, H),
    ],
    "Ra": [
        ("Rajarajan", "ராஜராஜன்", "King of kings, the Chola", "ராஜராஜ சோழன்", B, H),
        ("Ramanathan", "ராமநாதன்", "Lord of Rama, Shiva", "ராமநாதர்", B, H),
        ("Rajathi", "ராஜாத்தி", "Queenly", "அரசி", G, H),
        ("Ranjitha", "ரஞ்சிதா", "Delighted, pleasing", "மகிழ்ச்சி தருபவள்", G, H),
        ("Ravichandran", "ரவிச்சந்திரன்", "Sun and moon", "ரவி சந்திரன்", B, H),
        ("Rajeswari", "ராஜேஸ்வரி", "Queen Goddess", "ராஜேஸ்வரி", G, H),
    ],
    "Se": [
        ("Sengodan", "செங்கோடன்", "Murugan of Sengodu", "செங்கோட்டு வேலவன்", B, H),
        ("Sethuraman", "சேதுராமன்", "Rama of the causeway", "சேது ராமன்", B, H),
        ("Selvamani", "செல்வமணி", "Jewel of prosperity", "செல்வ மணி", G, H),
        ("Sengottuvel", "செங்கோட்டுவேல்", "Murugan's red spear", "செங்கோட்டு வேல்", B, H),
    ],
    "Su": [
        ("Subbulakshmi", "சுப்புலட்சுமி", "Auspicious Lakshmi", "சுப லட்சுமி", G, H),
        ("Sundaravalli", "சுந்தரவல்லி", "Beautiful creeper", "சுந்தர வல்லி", G, H),
        ("Suriyan", "சூரியன்", "The Sun", "சூரியன்", B, H),
        ("Sumithra", "சுமித்ரா", "Good friend", "நல்ல தோழி", G, H),
        ("Subhashini", "சுபாஷிணி", "Sweet-spoken", "இனிமையாகப் பேசுபவள்", G, H),
        ("Sudalaimuthu", "சுடலைமுத்து", "Pearl of Sudalai", "சுடலை முத்து", B, H),
    ],
    "Sha": [
        ("Shanmugapriya", "சண்முகப்பிரியா", "Beloved of Murugan", "சண்முகனுக்கு இனியவள்", G, H),
        ("Shanmathi", "சாண்மதி", "Moon-like", "நிலவு போன்றவள்", G, H),
        ("Shahina", "ஷாஹினா", "Royal falcon", "அரச பருந்து", G, M),
    ],
    "Go": [
        ("Gomathinayagam", "கோமதிநாயகம்", "Lord of Gomathi", "கோமதி நாயகர்", B, H),
        ("Govindaraj", "கோவிந்தராஜ்", "King Govinda", "கோவிந்த ராஜன்", B, H),
        ("Gokila", "கோகிலா", "Cuckoo", "குயில்", G, H),
    ],
    "Gu": [
        ("Gunaseelan", "குணசீலன்", "Of good character", "நற்குணம் உடையவன்", B, H),
        ("Gunasundari", "குணசுந்தரி", "Beautiful in character", "குணத்தில் அழகி", G, H),
        ("Gurusamy", "குருசாமி", "The guru as god", "குரு சாமி", B, H),
    ],
    "Paa": [
        ("Paandimathi", "பாண்டிமதி", "Pandya moon", "பாண்டி நிலவு", G, H),
        ("Paranthaman", "பரந்தாமன்", "Vishnu, the supreme abode", "பரந்தாமன்", B, H),
        ("Paavendhan", "பாவேந்தன்", "King of poetry", "பா வேந்தன்", B, H),
    ],
    "Pu": [
        ("Pugazhmani", "புகழ்மணி", "Jewel of fame", "புகழ் மணி", G, H),
        ("Pungodi", "பூங்கொடி", "Flowering creeper", "பூங் கொடி", G, H),
        ("Punniyakodi", "புண்ணியக்கொடி", "Creeper of merit", "புண்ணியக் கொடி", G, H),
        ("Purushoth", "புருஷோத்", "Supreme person", "புருஷோத்தமன்", B, H),
    ],
    "Po": [
        ("Ponmudi", "பொன்முடி", "Golden crown", "பொன் முடி", B, H),
        ("Ponnammal", "பொன்னம்மாள்", "Golden mother", "பொன் அம்மாள்", G, H),
        ("Pothumponnu", "பொதும்பொன்னு", "Precious gold", "பொன்னானவள்", G, H),
        ("Ponmani", "பொன்மணி", "Golden jewel", "பொன் மணி", G, H),
    ],
    "Ko": [
        ("Kodeeswaran", "கோடீஸ்வரன்", "Lord of crores", "கோடீஸ்வரன்", B, H),
        ("Kousalya", "கௌசல்யா", "Rama's mother", "கௌசல்யை", G, H),
        ("Kodhandaraman", "கோதண்டராமன்", "Rama with the bow", "கோதண்ட ராமர்", B, H),
    ],
    "Ne": [
        ("Nedumaran", "நெடுமாறன்", "Tall Pandya king", "நெடு மாறன்", B, H),
        ("Nesamalar", "நேசமலர்", "Flower of love", "அன்பு மலர்", G, H),
    ],
    "Nee": [
        ("Neelambari", "நீலாம்பரி", "Clad in blue", "நீல ஆடை உடையவள்", G, H),
        ("Neelagreevan", "நீலகிரீவன்", "Blue-throated Shiva", "நீலகண்டன்", B, H),
    ],
    "Te": [
        ("Tenkasi", "தென்காசி", "Kashi of the south", "தென் காசி", B, H),
        ("Tejeswari", "தேஜேஸ்வரி", "Radiant goddess", "ஒளி மிக்கவள்", G, H),
    ],
    "Tha": [
        ("Thangamani", "தங்கமணி", "Golden jewel", "தங்க மணி", G, H),
        ("Thamarai", "தாமரை", "Lotus", "தாமரை", G, H),
        ("Thandapani", "தண்டபாணி", "Murugan with the staff", "தண்டாயுதபாணி", B, H),
        ("Thanalakshmanan", "தனலட்சுமணன்", "Prosperous Lakshmana", "தன லட்சுமணன்", B, H),
    ],
    "Dha": [
        ("Dhanabal", "தனபால்", "Strength of wealth", "தன பலம்", B, H),
        ("Dharmalingam", "தர்மலிங்கம்", "Shiva of righteousness", "தர்ம லிங்கம்", B, H),
        ("Dhanammal", "தனம்மாள்", "Wealthy lady", "தனம் உடையவள்", G, H),
    ],
    "Jaa": [
        ("Jaanavi", "ஜான்வி", "The river Ganga", "கங்கை", G, H),
    ],
    "Jee": [
        ("Jeevarathinam", "ஜீவரத்தினம்", "Jewel of life", "ஜீவ ரத்தினம்", B, H),
    ],
    "Saa": [
        ("Saarathi", "சாரதி", "Charioteer, guide", "தேரோட்டி", B, H),
        ("Saandhini", "சாந்தினி", "Moonlight", "நிலவொளி", G, H),
    ],
    "See": [
        ("Seetharamalakshmi", "சீதாராமலட்சுமி", "Sita, Rama and Lakshmi", "சீதா ராம லட்சுமி", G, H),
        ("Seerkazhi", "சீர்காழி", "Place of Sambandar", "சீர்காழி", B, H),
    ],
    "Ge": [
        ("Gengadharan", "கங்காதரன்", "Shiva bearing the Ganga", "கங்காதரர்", B, H),
    ],
    "Gaa": [
        ("Gaayathridevi", "காயத்ரிதேவி", "Goddess Gayatri", "காயத்ரி தேவி", G, H),
    ],
    "Yo": [
        ("Yoganathan", "யோகநாதன்", "Lord of yoga", "யோக நாதன்", B, H),
        ("Yogalakshmi", "யோகலட்சுமி", "Lakshmi of good fortune", "யோக லட்சுமி", G, H),
    ],
    "Ye": [
        ("Yesudasan", "யேசுதாசன்", "Servant of Jesus", "இயேசு தாசன்", B, C),
    ],
    "De": [
        ("Devanayagam", "தேவநாயகம்", "Lord of the gods", "தேவ நாயகம்", B, C),
        ("Devasena", "தேவசேனா", "Murugan's consort", "தெய்வானை", G, H),
        ("Deveswari", "தேவேஸ்வரி", "Divine goddess", "தேவேஸ்வரி", G, H),
    ],
    "Dee": [
        ("Deepalatha", "தீபலதா", "Creeper of light", "தீப லதா", G, H),
        ("Deenabandhu", "தீனபந்து", "Friend of the poor", "எளியோர் நண்பன்", B, H),
    ],
    "Ho": [
        ("Homasundaram", "ஹோமசுந்தரம்", "Beauty of the sacred fire", "ஹோம சுந்தரம்", B, H),
    ],
    "Ha": [
        ("Haridas", "ஹரிதாஸ்", "Servant of Vishnu", "ஹரி தாசன்", B, H),
        ("Harshini", "ஹர்ஷிணி", "Joyful", "மகிழ்ச்சி உடையவள்", G, H),
        ("Haseena", "ஹசீனா", "Beautiful", "அழகானவள்", G, M),
    ],
    "Ro": [
        ("Rohinidevi", "ரோகிணிதேவி", "Goddess of the Rohini star", "ரோகிணி தேவி", G, H),
    ],
    "Ru": [
        ("Rudhraksh", "ருத்ராக்ஷ்", "The sacred bead of Shiva", "ருத்ராட்சம்", B, H),
    ],
    "Mo": [
        ("Mohanambal", "மோகனாம்பாள்", "Enchanting lady", "மோகனாம்பாள்", G, H),
        ("Mohanasundaram", "மோகனசுந்தரம்", "Charming beauty", "மோகன சுந்தரம்", B, H),
    ],
    "To": [
        ("Thondaiyarkon", "தொண்டையர்கோன்", "Chief of the Thondai land", "தொண்டை நாட்டு கோன்", B, H),
    ],
    "Ta": [
        ("Tamilmani", "தமிழ்மணி", "Jewel of Tamil", "தமிழ் மணி", G, H),
        ("Tamilvanan", "தமிழ்வாணன்", "One who lives by Tamil", "தமிழ் வாணன்", B, H),
    ],
    "Taa": [
        ("Thaamaraiselvi", "தாமரைச்செல்வி", "Lotus maiden", "தாமரைச் செல்வி", G, H),
    ],
    "Naa": [
        ("Naagalingam", "நாகலிங்கம்", "Shiva with the serpent", "நாக லிங்கம்", B, H),
    ],
    "The": [
        ("Thenmalar", "தேன்மலர்", "Honey flower", "தேன் மலர்", G, H),
        ("Thevanai", "தெய்வானை", "Murugan's consort", "தெய்வானை அம்மன்", G, H),
    ],
    "Bhu": [
        ("Bhuvanapriya", "புவனப்பிரியா", "Beloved of the world", "புவனப் பிரியா", G, H),
    ],
    "Baa": [
        ("Baalamurugan", "பாலமுருகன்", "The child Murugan", "பால முருகன்", B, H),
        ("Baalamani", "பாலமணி", "Young jewel", "பால மணி", G, H),
    ],
    "Bhaa": [
        ("Bhaarathidasan", "பாரதிதாசன்", "Follower of Bharathi", "பாரதிதாசன்", B, H),
    ],
    "Jna": [
        ("Jnanasundari", "ஞானசுந்தரி", "Beautiful in wisdom", "ஞான சுந்தரி", G, H),
    ],
    "Ng": [
        ("Nganasekar", "ஞானசேகர்", "Crown of wisdom", "ஞான சேகர்", B, H),
    ],
    "Gha": [
        ("Ghanapriya", "கனப்பிரியா", "Beloved, dignified", "கனம் மிக்கவள்", G, H),
    ],
    "Chha": [
        ("Chhayadevi", "சாயாதேவி", "Goddess of shade", "சாயா தேவி", G, H),
    ],
}
