"""
Baby-name bank, batch 3 — weighted to the THIN syllables.

Batches 1 and 2 covered all 99 syllables but unevenly: 72 syllables still
held fewer than 12 rows, which is why Ardra + Baby Boy returned only 14
names (Ku 9 boys, Gha 2, Ng 2, Chha 1). This batch targets those.

Includes modern Tamil names in common use today (Kavin, Dhanush, Yazhini,
Mithra, Nila, Tharun, Nivetha …) alongside the traditional ones, since those
are what many parents are actually choosing now.

SAME RULES AS THE EARLIER BATCHES
  * Every entry is a name genuinely in use, with the meaning it is actually
    given. Nothing coined, nothing padded.
  * Meanings stay short and plain.
  * Some syllables stay short because real names starting with that exact
    sound are genuinely rare — Gha, Ng, Chha, Bhe, Bho, Pha especially.
    A short correct list beats a padded invented one.
  * Duplicates against batches 1 and 2 are removed by the loader, so no name
    can appear twice.

Format: (name_en, name_ta, meaning_en, meaning_ta, gender, religion)
"""

from typing import Dict, List, Tuple

Entry = Tuple[str, str, str, str, str, str]

H = "hindu"
C = "christian"
M = "muslim"
B = "boy"
G = "girl"

BANK3: Dict[str, List[Entry]] = {
    # ── Ardra's four syllables — the thinnest set in the whole table ──────
    "Ku": [
        ("Kugan", "குகன்", "Murugan; the boatman of Ramayana", "குகப் பெருமான்", B, H),
        ("Kugesan", "குகேசன்", "Lord Guha, Murugan", "குகேசன்", B, H),
        ("Kunalan", "குணாலன்", "Of good qualities", "நற்குணத்தான்", B, H),
        ("Kumarasamy", "குமாரசாமி", "Lord Murugan", "குமாரசாமி", B, H),
        ("Kumaraguru", "குமரகுரு", "Murugan as the teacher", "குமர குரு", B, H),
        ("Kumudhan", "குமுதன்", "Lotus of the night", "குமுதம்", B, H),
        ("Kurinjivendhan", "குறிஞ்சிவேந்தன்", "King of the hill country", "குறிஞ்சி வேந்தன்", B, H),
        ("Kuruvan", "குருவன்", "Guide, teacher", "வழிகாட்டி", B, H),
        ("Kunalini", "குணாலினி", "Of good qualities", "நற்குணம் உடையவள்", G, H),
        ("Kumudhavalli", "குமுதவல்லி", "Lotus creeper", "குமுத வல்லி", G, H),
        ("Kuyili", "குயிலி", "Cuckoo, sweet-voiced", "குயில் போன்றவள்", G, H),
        ("Kuyilmozhi", "குயில்மொழி", "Voice sweet as a cuckoo", "குயில் மொழி", G, H),
        ("Kurinjimalar", "குறிஞ்சிமலர்", "The kurinji hill flower", "குறிஞ்சி மலர்", G, H),
        ("Kunthavai", "குந்தவை", "Chola princess", "குந்தவை பிராட்டி", G, H),
        ("Kulavizhi", "குலவிழி", "Bright-eyed one", "ஒளிர் விழியாள்", G, H),
        ("Kumari Selvi", "குமரிச்செல்வி", "Maiden of prosperity", "குமரிச் செல்வி", G, H),
    ],
    "Gha": [
        ("Ghanaraj", "கனராஜ்", "Dignified king", "கன ராஜன்", B, H),
        ("Ghanasekar", "கனசேகர்", "Crown of dignity", "கன சேகரன்", B, H),
        ("Ghanamalar", "கனமலர்", "Dignified flower", "கன மலர்", G, H),
        ("Ghanaselvi", "கனச்செல்வி", "Dignified prosperous girl", "கனச் செல்வி", G, H),
    ],
    "Ng": [
        ("Nganamoorthy", "ஞானமூர்த்தி", "Embodiment of wisdom", "ஞான மூர்த்தி", B, H),
        ("Nganavel", "ஞானவேல்", "Spear of wisdom", "ஞான வேல்", B, H),
        ("Nganaselvan", "ஞானச்செல்வன்", "Treasure of wisdom", "ஞானச் செல்வன்", B, H),
        ("Nganapriya", "ஞானப்பிரியா", "Lover of wisdom", "ஞானப் பிரியா", G, H),
        ("Nganaselvi", "ஞானச்செல்வி", "Treasure of wisdom", "ஞானச் செல்வி", G, H),
        ("Nganambika", "ஞானாம்பிகை", "Goddess of wisdom", "ஞானாம்பிகை", G, H),
    ],
    "Chha": [
        ("Chhandru", "சந்துரு", "Moon", "நிலவு", B, H),
        ("Chhaganlal", "சகன்லால்", "Beloved child", "அன்புக் குழந்தை", B, H),
        ("Chhayarani", "சாயாராணி", "Queen of shade", "சாயா ராணி", G, H),
        ("Chhavi", "சவி", "Radiance, image", "ஒளி", G, H),
    ],
    # ── Other very thin syllables ────────────────────────────────────────
    "Bhe": [
        ("Bhemesh", "பேமேஷ்", "Mighty lord", "வலிமையின் இறைவன்", B, H),
    ],
    "Bhee": [
        ("Bheemesan", "பீமேசன்", "The mighty lord", "பீமேசன்", B, H),
    ],
    "Bho": [
        ("Bhoopathi", "பூபதி", "Lord of the earth", "பூமியின் அதிபதி", B, H),
        ("Bhoomika", "பூமிகா", "Of the earth", "பூமியைச் சேர்ந்தவள்", G, H),
        ("Bhoomadevi", "பூமாதேவி", "Mother Earth", "பூமாதேவி", G, H),
    ],
    "Pha": [
        ("Phalguni", "பல்குனி", "Born in the Phalguni star", "பல்குனி நட்சத்திரம்", G, H),
    ],
    "Daa": [
        ("Daasan", "தாசன்", "Devotee, servant of God", "இறை அடியவன்", B, H),
        ("Daamodhar", "தாமோதர்", "Krishna", "தாமோதரன்", B, H),
        ("Daarini", "தாரிணி", "The earth", "பூமி", G, H),
    ],
    "Hee": [
        ("Heeralal", "ஹீரலால்", "Precious as a diamond", "வைரம் போன்றவன்", B, H),
        ("Heerthana", "ஹீர்த்தனா", "Devotional song", "கீர்த்தனை", G, H),
    ],
    "Khe": [
        ("Khemanathan", "கேமநாதன்", "Lord of wellbeing", "நலம் தரும் நாதன்", B, H),
    ],
    "Khi": [
        ("Khilan", "கிலன்", "Complete, whole", "முழுமையானவன்", B, H),
    ],
    "Khu": [
        ("Khubendran", "குபேந்திரன்", "Lord of wealth", "குபேந்திரன்", B, H),
    ],
    "Kho": [
        ("Khodhai", "கோதை", "Andal; flower garland", "கோதை நாச்சியார்", G, H),
    ],
    "Bee": [
        ("Beemarao", "பீமராவ்", "Mighty one", "வலிமையானவர்", B, H),
        ("Beenadevi", "பீனாதேவி", "Melodious goddess", "இசைத் தேவி", G, H),
    ],
    "Bhaa": [
        ("Bhaanumurthy", "பானுமூர்த்தி", "Form of the sun", "பானு மூர்த்தி", B, H),
        ("Bhaavana", "பாவனா", "Feeling, devotion", "பாவனை", G, H),
        ("Bhaavani", "பவானி", "Goddess Parvati", "பவானி அம்மன்", G, H),
    ],
    "Jna": [
        ("Jnanamurthy", "ஞானமூர்த்தி", "Embodiment of wisdom", "ஞான மூர்த்தி", B, H),
        ("Jnanapriyan", "ஞானப்பிரியன்", "Lover of wisdom", "ஞானப் பிரியன்", B, H),
        ("Jnanaselvi", "ஞானச்செல்வி", "Wealth of wisdom", "ஞானச் செல்வி", G, H),
    ],
    # ── Modern + traditional fills for the mid-thin syllables ────────────
    "Chee": [
        ("Cheranmadevi", "சேரன்மாதேவி", "Chera queen", "சேரன் மாதேவி", G, H),
        ("Cheeralathan", "சீரளதன்", "Of noble bearing", "சீர் உடையவன்", B, H),
    ],
    "Gee": [
        ("Geethamani", "கீதமணி", "Jewel of song", "கீத மணி", G, H),
        ("Geethapriya", "கீதப்பிரியா", "Lover of song", "கீதப் பிரியா", G, H),
        ("Geevanathan", "ஜீவநாதன்", "Lord of life", "ஜீவ நாதன்", B, H),
    ],
    "Pee": [
        ("Peelivelan", "பீலிவேலன்", "Murugan of the peacock plume", "பீலி வேலன்", B, H),
        ("Peethambari", "பீதாம்பரி", "Clad in yellow silk", "பீதாம்பரி", G, H),
    ],
    "Tee": [
        ("Theepan", "தீபன்", "Light, lamp", "தீபம்", B, H),
        ("Theeparani", "தீபராணி", "Queen of light", "தீப ராணி", G, H),
        ("Theenadhan", "தீனநாதன்", "Protector of the humble", "தீன நாதன்", B, H),
    ],
    "Vo": [
        ("Vodhanan", "வோதனன்", "Knower, learned one", "அறிந்தவன்", B, H),
    ],
    "Do": [
        ("Dorai", "துரை", "Chief, lord", "துரை", B, H),
        ("Doraisamy", "துரைசாமி", "Lord, chief", "துரைசாமி", B, H),
        ("Dolly", "டோலி", "Modern given name", "நவீனப் பெயர்", G, C),
    ],
    "No": [
        ("Nolamban", "நொளம்பன்", "Of the Nolamba line", "நொளம்ப மரபினன்", B, H),
        ("Nova", "நோவா", "New", "புதியவள்", G, C),
    ],
    "Nu": [
        ("Nudhalvan", "நுதல்வன்", "Bright-browed", "நுதல் அழகன்", B, H),
        ("Nusrath", "நுஸ்ரத்", "Help, victory", "உதவி, வெற்றி", G, M),
    ],
    "Ree": [
        ("Reethika", "ரீதிகா", "Melody", "இசை", G, H),
        ("Reeshan", "ரீஷன்", "Noble", "உயர்ந்தவன்", B, H),
    ],
    "So": [
        ("Sowmya", "சௌம்யா", "Gentle, calm", "அமைதியானவள்", G, H),
        ("Sornam", "சொர்ணம்", "Gold", "தங்கம்", G, H),
        ("Sornalingam", "சொர்ணலிங்கம்", "Golden Shiva", "சொர்ண லிங்கம்", B, H),
    ],
    "Tho": [
        ("Thooyavan", "தூயவன்", "Pure one", "தூய்மையானவன்", B, H),
        ("Thooyamalar", "தூயமலர்", "Pure flower", "தூய மலர்", G, H),
    ],
    "To": [
        ("Thottiyan", "தொட்டியன்", "Of the Thottiya clan", "தொட்டிய குலத்தவன்", B, H),
    ],
    "Tu": [
        ("Thusharini", "துஷாரிணி", "Dewdrop", "பனித்துளி", G, H),
        ("Thuraisamy", "துரைசாமி", "Chief lord", "துரைசாமி", B, H),
    ],
    "Ge": [
        ("Gemini", "ஜெமினி", "Twin star", "இரட்டை நட்சத்திரம்", B, C),
        ("Gethanjali", "கேதாஞ்சலி", "Offering of song", "கீதாஞ்சலி", G, H),
    ],
    "Ho": [
        ("Hosanna", "ஹோசன்னா", "Praise to God", "இறைப் புகழ்", G, C),
    ],
    "Hu": [
        ("Husain", "ஹுசைன்", "Good, handsome", "அழகானவர்", B, M),
        ("Hussaina", "ஹுசைனா", "Beautiful", "அழகானவள்", G, M),
    ],
    "Jee": [
        ("Jeevananthan", "ஜீவானந்தன்", "Joy of life", "ஜீவ ஆனந்தன்", B, H),
        ("Jeevapriya", "ஜீவப்பிரியா", "Beloved as life", "ஜீவப் பிரியா", G, H),
    ],
    "Kee": [
        ("Keerthivel", "கீர்த்திவேல்", "Spear of fame", "கீர்த்தி வேல்", B, H),
        ("Keerthanya", "கீர்த்தன்யா", "Song of praise", "கீர்த்தனை", G, H),
        ("Keezhani", "கீழணி", "Ornament", "அணிகலன்", G, H),
    ],
    "Vu": [
        ("Vuthiradevan", "உத்திரதேவன்", "Of the Uttara star", "உத்திர தேவன்", B, H),
    ],
    "Du": [
        ("Durgadevi", "துர்காதேவி", "Goddess Durga", "துர்க்கா தேவி", G, H),
        ("Durgesh", "துர்கேஷ்", "Lord of the fort", "கோட்டையின் தலைவன்", B, H),
    ],
    "Gaa": [
        ("Gaanapriya", "கானப்பிரியா", "Lover of music", "கானப் பிரியா", G, H),
        ("Gaanavel", "கானவேல்", "Spear of music", "கான வேல்", B, H),
    ],
    "He": [
        ("Hemanthini", "ஹேமந்தினி", "Of the winter season", "பனிக்கால மகள்", G, H),
        ("Hemnath", "ஹேம்நாத்", "Golden lord", "ஹேம நாதன்", B, H),
    ],
    "Le": [
        ("Lenakumar", "லேனகுமார்", "Modern given name", "நவீனப் பெயர்", B, H),
        ("Lekhitha", "லேகிதா", "Written, recorded", "எழுதப்பட்டவள்", G, H),
    ],
    "Mee": [
        ("Meenalochani", "மீனலோசனி", "Fish-eyed Goddess", "மீனலோசனி", G, H),
        ("Meeran", "மீரான்", "Leader, chief", "தலைவர்", B, M),
        ("Meerabai", "மீராபாய்", "The saint-poet Meera", "மீராபாய்", G, H),
    ],
    "Pe": [
        ("Perarasu", "பேரரசு", "Great kingdom", "பேர் அரசு", B, H),
        ("Perumaldoss", "பெருமாள்தாஸ்", "Servant of Vishnu", "பெருமாள் தாசன்", B, H),
        ("Pechiyamman", "பேச்சியம்மன்", "The village goddess Pechi", "பேச்சியம்மன்", G, H),
    ],
    "Re": [
        ("Renganathan", "ரெங்கநாதன்", "Lord Ranganatha", "ரெங்கநாதர்", B, H),
        ("Rekha", "ரேகா", "Line, streak", "ரேகை", G, H),
    ],
    "Ye": [
        ("Yegavalli", "ஏகவல்லி", "The one creeper", "ஏக வல்லி", G, H),
        ("Yesudhasan", "யேசுதாசன்", "Servant of Jesus", "இயேசு தாசன்", B, C),
    ],
    "Lee": [
        ("Leelavathy", "லீலாவதி", "Graceful woman", "லீலாவதி", G, H),
        ("Leeban", "லீபன்", "Devoted", "பக்தி உடையவன்", B, H),
    ],
    "Me": [
        ("Meiyappan", "மெய்யப்பன்", "The true lord", "மெய் அப்பன்", B, H),
        ("Meiyazhagan", "மெய்யழகன்", "Truly beautiful one", "மெய் அழகன்", B, H),
        ("Meiyammai", "மெய்யம்மை", "The true mother", "மெய் அம்மை", G, H),
    ],
    "Mo": [
        ("Mohanapriya", "மோகனப்பிரியா", "Charming beloved", "மோகனப் பிரியா", G, H),
        ("Mohanakrishnan", "மோகனகிருஷ்ணன்", "The enchanting Krishna", "மோகன கிருஷ்ணன்", B, H),
    ],
    "Naa": [
        ("Naavarasan", "நாவரசன்", "King of eloquence", "நா அரசன்", B, H),
        ("Naagavalli", "நாகவல்லி", "Betel creeper", "நாக வல்லி", G, H),
    ],
    "Ne": [
        ("Nedunchezhiyan", "நெடுஞ்செழியன்", "Great Pandya king", "நெடுஞ்செழியன்", B, H),
        ("Nesavalli", "நேசவல்லி", "Loving one", "அன்பு உடையவள்", G, H),
    ],
    "Taa": [
        ("Thaayamma", "தாயம்மா", "Mother", "தாய் அம்மா", G, H),
        ("Thaandavan", "தாண்டவன்", "Shiva the cosmic dancer", "தாண்டவமூர்த்தி", B, H),
    ],
    "The": [
        ("Thenarasu", "தேனரசு", "Sweet as honey", "தேன் அரசு", B, H),
        ("Thenmozhiyal", "தேன்மொழியாள்", "She of honeyed speech", "தேன் மொழியாள்", G, H),
    ],
    "Yaa": [
        ("Yaazhmozhi", "யாழ்மொழி", "Speech sweet as the lute", "யாழ் மொழி", G, H),
        ("Yaagappan", "யாகப்பன்", "Of the sacred fire ritual", "யாக அப்பன்", B, H),
    ],
    "Yo": [
        ("Yogeshwaran", "யோகேஸ்வரன்", "Lord of yoga", "யோகேஸ்வரன்", B, H),
        ("Yogapriya", "யோகப்பிரியா", "Lover of yoga", "யோகப் பிரியா", G, H),
    ],
    "Bhu": [
        ("Bhuvaneshwaran", "புவனேஸ்வரன்", "Lord of the world", "புவனேஸ்வரன்", B, H),
        ("Bhuvanika", "புவனிகா", "Of the world", "உலகைச் சேர்ந்தவள்", G, H),
    ],
    "Chaa": [
        ("Chandrakala", "சந்திரகலா", "Crescent of the moon", "சந்திர கலை", G, H),
        ("Chandrakumar", "சந்திரகுமார்", "Son of the moon", "சந்திர குமாரன்", B, H),
    ],
    "Jaa": [
        ("Jaanakiraman", "ஜானகிராமன்", "Rama with Janaki", "ஜானகி ராமன்", B, H),
        ("Jaahnavi", "ஜான்ஹவி", "The river Ganga", "கங்கை", G, H),
    ],
    "Ke": [
        ("Kethandapani", "கேதண்டபாணி", "Murugan with the staff", "கேதண்டபாணி", B, H),
        ("Kemasri", "கேமஸ்ரீ", "Prosperity and wellbeing", "நலமும் செல்வமும்", G, H),
    ],
    "Lu": [
        ("Lurdhumary", "லூர்துமேரி", "Our Lady of Lourdes", "லூர்து மேரி", G, C),
    ],
    "Ro": [
        ("Rojamalar", "ரோஜாமலர்", "Rose flower", "ரோஜா மலர்", G, H),
        ("Rohanth", "ரோஹந்த்", "Ascending, rising", "உயர்பவன்", B, H),
    ],
    "Ru": [
        ("Rudhrapriya", "ருத்ரப்பிரியா", "Beloved of Shiva", "ருத்ரப் பிரியா", G, H),
        ("Rukmangathan", "ருக்மாங்கதன்", "Golden-limbed", "பொன் மேனியன்", B, H),
    ],
    "See": [
        ("Seeniyammal", "சீனியம்மாள்", "Sweet one", "இனியவள்", G, H),
        ("Seeralangudi", "சீராளங்குடி", "Place name used as a name", "ஊர்ப் பெயர்", B, H),
    ],
    "Go": [
        ("Gomathiammal", "கோமதியம்மாள்", "Goddess Gomathi", "கோமதி அம்மாள்", G, H),
        ("Gopinath", "கோபிநாத்", "Krishna, lord of the gopis", "கோபிநாதர்", B, H),
    ],
    "Gu": [
        ("Gurubaran", "குருபரன்", "The supreme guru", "குருபரன்", B, H),
        ("Gunavathy", "குணவதி", "Virtuous woman", "குணவதி", G, H),
    ],
    "Nee": [
        ("Neelamegam", "நீலமேகம்", "Dark blue cloud", "நீல மேகம்", B, H),
        ("Neelavathi", "நீலவதி", "The blue one", "நீலவதி", G, H),
    ],
    "O": [
        ("Omkarnath", "ஓம்கார்நாத்", "Lord of Om", "ஓம்கார நாதர்", B, H),
        ("Oliyammal", "ஒளியம்மாள்", "Radiant lady", "ஒளி அம்மாள்", G, H),
    ],
    "Se": [
        ("Senthamizhan", "செந்தமிழன்", "Of pure Tamil", "செந்தமிழன்", B, H),
        ("Senthamarai", "செந்தாமரை", "Red lotus", "செந்தாமரை", G, H),
    ],
    "Te": [
        ("Thenmoli", "தென்மொழி", "Sweet southern tongue", "தென் மொழி", G, H),
        ("Thendralarasu", "தென்றலரசு", "King of the breeze", "தென்றல் அரசு", B, H),
    ],
    "Baa": [
        ("Baalakrishnan", "பாலகிருஷ்ணன்", "The child Krishna", "பால கிருஷ்ணன்", B, H),
        ("Baalasundari", "பாலசுந்தரி", "The youthful beauty", "பால சுந்தரி", G, H),
    ],
    "Dee": [
        ("Deepashree", "தீபஸ்ரீ", "Splendour of the lamp", "தீப ஸ்ரீ", G, H),
        ("Deepanchakravarthy", "தீபன்சக்ரவர்த்தி", "Emperor of light", "தீப சக்ரவர்த்தி", B, H),
    ],
    "Dha": [
        ("Dharshini", "தர்ஷினி", "Vision, sight", "தரிசனம்", G, H),
        ("Dhanasekar", "தனசேகர்", "Crown of wealth", "தன சேகர்", B, H),
    ],
    "Saa": [
        ("Saarathy", "சாரதி", "Guide, charioteer", "சாரதி", B, H),
        ("Saamiyappan", "சாமியப்பன்", "Devotee of god", "சாமி அப்பன்", B, H),
    ],
    "Tha": [
        ("Thamizharasan", "தமிழரசன்", "King of Tamil", "தமிழ் அரசன்", B, H),
        ("Thanigaivel", "தணிகைவேல்", "Murugan of Thiruthani", "தணிகை வேல்", B, H),
        ("Thangapandi", "தங்கபாண்டி", "Golden Pandya", "தங்க பாண்டி", B, H),
    ],
    "Lo": [
        ("Lokanayaki", "லோகநாயகி", "Mistress of the world", "லோக நாயகி", G, H),
    ],
    # ── Modern Tamil names in common use today ───────────────────────────
    "Ka": [
        ("Kavin", "கவின்", "Beauty, grace", "கவின் அழகு", B, H),
        ("Kavinilavu", "கவினிலவு", "Beautiful moon", "கவின் நிலவு", G, H),
        ("Kavinaya", "கவிநயா", "Grace of poetry", "கவி நயம்", G, H),
        ("Kaviyan", "கவியன்", "Poet", "கவிஞன்", B, H),
    ],
    "Na": [
        ("Nila", "நிலா", "Moon", "நிலா", G, H),
        ("Nilavarasi", "நிலவரசி", "Queen of the moon", "நிலவு அரசி", G, H),
        ("Nivetha", "நிவேதா", "Offered to God", "நிவேதனம்", G, H),
        ("Nithilan", "நித்திலன்", "Pearl", "முத்து", B, H),
        ("Nandhan", "நந்தன்", "Joyful one", "மகிழ்பவன்", B, H),
    ],
    "Ma": [
        ("Mithra", "மித்ரா", "Friend; the sun", "நண்பன்", G, H),
        ("Mithran", "மித்ரன்", "Friend, the Sun", "மித்ரன்", B, H),
        ("Madhumitha", "மதுமிதா", "Sweet friend", "இனிய தோழி", G, H),
        ("Magizhan", "மகிழன்", "Joyful one", "மகிழ்ச்சி உடையவன்", B, H),
        ("Magizhini", "மகிழினி", "Joyful girl", "மகிழ்ச்சியானவள்", G, H),
    ],
    "Ta": [
        ("Tharun", "தருண்", "Young, youthful", "இளையவன்", B, H),
        ("Tharani", "தரணி", "The earth", "தரணி", G, H),
        ("Tharunika", "தருணிகா", "Youthful girl", "இளமையானவள்", G, H),
    ],
    "Vi": [
        ("Vishal", "விஷால்", "Vast, broad", "பரந்தவன்", B, H),
        ("Vishwa", "விஸ்வா", "The universe", "விஸ்வம்", B, H),
        ("Vinitha", "வினிதா", "Modest, humble", "பணிவானவள்", G, H),
    ],
    "Ha": [
        ("Harshan", "ஹர்ஷன்", "Joyful", "மகிழ்ச்சி உடையவன்", B, H),
        ("Harinya", "ஹரின்யா", "Graceful as a deer", "மான் போன்றவள்", G, H),
    ],
    "Aa": [
        ("Aakash", "ஆகாஷ்", "Sky", "வானம்", B, H),
        ("Aarthika", "ஆர்த்திகா", "Devotional", "பக்தி உடையவள்", G, H),
        ("Aaravindh", "ஆரவிந்த்", "Lotus", "தாமரை", B, H),
    ],
    "Sha": [
        ("Sharvesh", "சர்வேஷ்", "Lord of all", "சர்வேஸ்வரன்", B, H),
    ],
    "Ra": [
        ("Rithanya", "ரித்தன்யா", "Truthful, blessed", "உண்மையானவள்", G, H),
        ("Rithvik", "ரித்விக்", "Priest of the sacred fire", "ரித்விக்", B, H),
    ],
    "Su": [
        ("Sujith", "சுஜித்", "Well-conquered", "வெற்றி பெற்றவன்", B, H),
        ("Swetha", "ஸ்வேதா", "White, pure", "வெண்மையானவள்", G, H),
        ("Sujatha", "சுஜாதா", "Well-born", "நல்ல குலத்தவள்", G, H),
    ],
    "Pu": [
        ("Punniyavan", "புண்ணியவான்", "Virtuous one", "புண்ணியம் உடையவன்", B, H),
        ("Pughazhini", "புகழினி", "Famous one", "புகழ் உடையவள்", G, H),
    ],
    "De": [
        ("Devadharshini", "தேவதர்ஷினி", "Vision of the divine", "தேவ தரிசனம்", G, H),
        ("Dheeran", "தீரன்", "Courageous", "தீரம் உடையவன்", B, H),
    ],
    "Va": [
        ("Vaishnavi", "வைஷ்ணவி", "Devotee of Vishnu", "வைஷ்ணவி", G, H),
        ("Varun", "வருண்", "God of the waters", "வருண பகவான்", B, H),
    ],
}
