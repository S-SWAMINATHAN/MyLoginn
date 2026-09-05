"""
Detailed Rasi, Nakshatra, and Lagna Predictions Engine.
Cites classical treatises:
- Phaladeepika (Mantreswara) Ch. 6, 8, 14
- Brihat Jataka (Varahamihira) Ch. 16–18
- Jathaka Alankaram (Classical Tamil treatise on Nakshatra Phalan)
- Brihat Parashara Hora Shastra (BPHS)
"""

from typing import Dict, Any, List, Optional
from backend.app.services.tamil_labels import SIGN_LABELS, NAKSHATRA_LABELS, PLANET_LABELS

# Classical descriptions for 12 Rasis (Phaladeepika & Brihat Jataka)
RASI_PREDICTIONS: Dict[int, Dict[str, Any]] = {
    1: {
        "element": "Fire", "element_ta": "நெருப்பு தத்துவம்",
        "mobility": "Chara", "mobility_ta": "சர ராசி",
        "ruling_planet": "Mars", "ruling_planet_ta": "செவ்வாய் பகவான்",
        "symbol": "Ram", "symbol_ta": "ஆடு",
        "personality": "Dynamic, enterprising, courageous, and pioneering with a natural instinct for leadership.",
        "personality_ta": "தைரியம், சுறுசுறுப்பு, தலைமைப் பண்பு, நேர்மை மற்றும் எதையும் விரைவாக முடிக்கும் வல்லமை கொண்டவர்.",
        "strengths_ta": "சுயமரியாதை, சவால்களை எதிர்கொள்ளும் துணிவு, விரைவான முடிவெடுக்கும் திறன்.",
        "challenges_ta": "முன்கோபம், அவசரப்பட்டு முடிவெடுத்தல், பொறுமையின்மை தவிர்க்கப்பட வேண்டும்.",
        "career_ta": "நிர்வாகம், ராணுவம், காவல் துறை, அறுவை சிகிச்சை, பொறியியல், விளையாட்டு மற்றும் தொழில் முனைவு.",
        "wealth_ta": "சுய உழைப்பால் செல்வ வளம் சேரும்; நிலம் மற்றும் அசையா சொத்து யோகம் உண்டு.",
        "health_ta": "தலை, ரத்த அழுத்தம் மற்றும் உஷ்ண உபாதைகளில் கவனம் தேவை. நீர் அருந்துதல் நலம்."
    },
    2: {
        "element": "Earth", "element_ta": "நில தத்துவம்",
        "mobility": "Sthira", "mobility_ta": "ஸ்திர ராசி",
        "ruling_planet": "Venus", "ruling_planet_ta": "சுக்கிர பகவான்",
        "symbol": "Bull", "symbol_ta": "காளை",
        "personality": "Patient, artistic, steadfast, reliable, and deeply appreciative of harmony, beauty, and luxury.",
        "personality_ta": "அமைதியான சுபாவம், பொறுமை, கலை ஆர்வம், நம்பகத்தன்மை மற்றும் நிலையான உழைப்பு உடையவர்.",
        "strengths_ta": "நிலையான எண்ணம், நிதி சேமிப்பு ஆற்றல், பாசப்பிணைப்பு, குடும்ப அக்கறை.",
        "challenges_ta": "பிடிவாத குணம், மாற்றங்களை ஏற்க தயங்குதல், அதிக உணவு பிரியம்.",
        "career_ta": "வங்கி, நிதித்துறை, கலை, திரைப்படம், ஆடை வடிவமைப்பு, விவசாயம், உணவு மற்றும் சொகுசு பொருட்கள்.",
        "wealth_ta": "நிலையான தன யோகம், ஆபரணங்கள் மற்றும் வாகன யோகம் இயல்பாக அமையும்.",
        "health_ta": "தொண்டை, கழுத்து பகுதி மற்றும் சளி தொந்தரவுகளில் கவனம் தேவை."
    },
    3: {
        "element": "Air", "element_ta": "காற்று தத்துவம்",
        "mobility": "Ubhaya", "mobility_ta": "உபய ராசி",
        "ruling_planet": "Mercury", "ruling_planet_ta": "புதன் பகவான்",
        "symbol": "Twins", "symbol_ta": "இரட்டையர்",
        "personality": "Intellectual, witty, adaptable, communicative, with a keen aptitude for learning and networking.",
        "personality_ta": "நுண்ணறிவு, சிறந்த வாக்கு வன்மை, நகைச்சுவை உணர்வு, பன்முகத் திறமை மற்றும் சாமர்த்தியம்.",
        "strengths_ta": "எழுத்து மற்றும் பேச்சாற்றல், புதிய விஷயங்களை விரைந்து கற்றல், சமயோசித புத்தி.",
        "challenges_ta": "மனக் குழப்பம், ஒரு காரியத்தில் நிலைத்திருக்க முடியாமை, படபடப்பு.",
        "career_ta": "எழுத்து, பத்திரிகை, ஊடகம், தகவல் தொழில்நுட்பம் (IT), வர்த்தகம், கல்வி மற்றும் தரகு.",
        "wealth_ta": "புத்தி கூர்மையால் வருமானம் பெருகும்; பல வழிகளில் தனலாபம் ஏற்படும்.",
        "health_ta": "தோள்பட்டை, கைகள், நரம்பு மண்டலம் மற்றும் சுவாசக் கோளாறுகளில் கவனம் தேவை."
    },
    4: {
        "element": "Water", "element_ta": "நீர் தத்துவம்",
        "mobility": "Chara", "mobility_ta": "சர ராசி",
        "ruling_planet": "Moon", "ruling_planet_ta": "சந்திர பகவான்",
        "symbol": "Crab", "symbol_ta": "நண்டு",
        "personality": "Deeply emotional, intuitive, nurturing, family-oriented, with powerful imaginative capability.",
        "personality_ta": "இரக்க குணம், தாயுள்ளம், ஆழமான கற்பனைத் திறன், குடும்பப் பற்று மற்றும் தியாக மனப்பான்மை.",
        "strengths_ta": "உள்ளுணர்வு பலம், பிறருக்கு உதவும் குணம், சிறந்த ஞாபக சக்தி, விருந்தோம்பல்.",
        "challenges_ta": "மன அலைச்சல், அதிக உணர்ச்சிவசப்படுதல், பழைய கவலைகளை நினைத்து வருந்துதல்.",
        "career_ta": "மருத்துவம், செவிலியர் பணி, கல்வி, ஹோட்டல் துறை, நீர் சார்ந்த தொழில்கள், உளவியல்.",
        "wealth_ta": "ஏற்ற இறக்கங்கள் நிறைந்தாலும் சொந்த வீடு, நிலம் மற்றும் வண்டி வாகன யோகம் கிட்டும்.",
        "health_ta": "மார்பு, செரிமானம் மற்றும் சளி உபாதைகளில் கவனம் தேவை. மன அமைதி அவசியம்."
    },
    5: {
        "element": "Fire", "element_ta": "நெருப்பு தத்துவம்",
        "mobility": "Sthira", "mobility_ta": "ஸ்திர ராசி",
        "ruling_planet": "Sun", "ruling_planet_ta": "சூரிய பகவான்",
        "symbol": "Lion", "symbol_ta": "சிங்கம்",
        "personality": "Regal, magnanimous, confident, charismatic, with natural authority and honorable demeanor.",
        "personality_ta": "ராஜ கம்பீரம், பெருந்தன்மை, ஆளுமைத் திறன், தன்னம்பிக்கை மற்றும் அஞ்சா நெஞ்சம் உடையவர்.",
        "strengths_ta": "நேர்மையான நடத்தை, சொல் தவறாமை, மற்றவர்களை வழிநடத்தும் திறன், பெருந்தன்மை.",
        "challenges_ta": "அகம்பாவம், புகழ்ச்சியை விரும்புதல், மற்றவர்கள் மீது ஆதிக்கம் செலுத்த நினைத்தல்.",
        "career_ta": "அரசு உயர் பதவிகள், அரசியல், நிர்வாக இயக்குனர், மருத்துவம், தங்கம்/நகைத் தொழில்.",
        "wealth_ta": "பரம்பரை சொத்து, அரசாங்க அனுகூலம் மற்றும் சமூக அந்தஸ்துடன் கூடிய பெரும் செல்வம்.",
        "health_ta": "இதயம், முதுகுத் தண்டு, கண் பார்வை மற்றும் உஷ்ண சம்பந்தப்பட்ட நோய்களில் எச்சரிக்கை."
    },
    6: {
        "element": "Earth", "element_ta": "நில தத்துவம்",
        "mobility": "Ubhaya", "mobility_ta": "உபய ராசி",
        "ruling_planet": "Mercury", "ruling_planet_ta": "புதன் பகவான்",
        "symbol": "Maiden", "symbol_ta": "கன்னிப் பெண்",
        "personality": "Analytical, meticulous, modest, pragmatic, and dedicated to service, perfection, and order.",
        "personality_ta": "ஆராய்ச்சி குணம், துல்லியம், எளிமை, ஒழுக்கம், விவேகம் மற்றும் கடமை உணர்வு மிக்கவர்.",
        "strengths_ta": "கணக்கு மற்றும் தர்க்க நுண்ணறிவு, விமர்சன ஆய்வு, சேவை மனப்பான்மை, தூய்மை.",
        "challenges_ta": "குறைகாண்பது, அதீத கவலை, திருப்தியடையாத மனநிலை தவிர்க்கப்பட வேண்டும்.",
        "career_ta": "கணக்காளர் (CA), தணிக்கை, புள்ளியியல், மென்பொருள் தயாரிப்பு, ஆசிரியர், மருத்துவம்.",
        "wealth_ta": "திட்டமிட்ட சிக்கனத்தால் சேமிப்பு உயரும்; உழைப்பிற்கு ஏற்ற நிலையான வருமானம்.",
        "health_ta": "வயிற்றுப் பகுதி, குடல் உபாதைகள் மற்றும் நரம்புத் தளர்ச்சியில் கவனம் தேவை."
    },
    7: {
        "element": "Air", "element_ta": "காற்று தத்துவம்",
        "mobility": "Chara", "mobility_ta": "சர ராசி",
        "ruling_planet": "Venus", "ruling_planet_ta": "சுக்கிர பகவான்",
        "symbol": "Balance", "symbol_ta": "தராசு",
        "personality": "Charming, diplomatic, just, socially gifted, and constantly striving for balance, love, and beauty.",
        "personality_ta": "நியாயம், நடுநிலைமை, இனிமையான பேச்சு, வசீகரத் தோற்றம் மற்றும் சமூக நல்லிணக்கம்.",
        "strengths_ta": "சமாதானம் செய்யும் திறன், கலை ரசனை, கூட்டு முயற்சிகளில் வெற்றி, நற்குணங்கள்.",
        "challenges_ta": "தீர்க்கமான முடிவெடுக்க காலதாமதம், பிறரை திருப்திப்படுத்த தன் விருப்பத்தை விடுதல்.",
        "career_ta": "சட்டம், நீதித்துறை, தூதரகம், வியாபாரம், கலை, ஆடை/அழகு சாதனங்கள், பொதுத்தொடர்பு.",
        "wealth_ta": "கூட்டு வியாபாரம் மற்றும் வாழ்க்கைத் துணையினால் தனவிருத்தி; ஆடம்பர வாழ்க்கை.",
        "health_ta": "சிறுநீரகம், இடுப்பு பகுதி மற்றும் சர்க்கரை உபாதைகளில் கவனம் தேவை."
    },
    8: {
        "element": "Water", "element_ta": "நீர் தத்துவம்",
        "mobility": "Sthira", "mobility_ta": "ஸ்திர ராசி",
        "ruling_planet": "Mars", "ruling_planet_ta": "செவ்வாய் பகவான்",
        "symbol": "Scorpion", "symbol_ta": "தேள்",
        "personality": "Intense, mystical, determined, deeply perceptive, possessive, with profound emotional resilience.",
        "personality_ta": "கம்பீரமான மன உறுதி, மறைமுக ஆற்றல், விடாமுயற்சி, உண்மை கண்டறியும் ஆர்வம்.",
        "strengths_ta": "மர்மங்களை அறியும் கூர்மை, தோல்விகளை வெற்றியாக்கும் வீரம், தியாக குணம்.",
        "challenges_ta": "பழிவாங்கும் எண்ணம், அதிக சந்தேகம், ரகசியம் காக்கும் அதீத பிடிவாதம்.",
        "career_ta": "ஆராய்ச்சி, உளவுத்துறை, அறுவை சிகிச்சை, வேதியியல், சுரங்கம், ஆன்மீகம், ஜோதிடம்.",
        "wealth_ta": "திடீர் தனலாபம், பூர்வீக சொத்து மற்றும் காப்பீடு/வாரிசு உரிமை வழியில் வருமானம்.",
        "health_ta": "இனப்பெருக்க உறுப்புகள், மூல உபாதைகள் மற்றும் ரத்த ஓட்டத்தில் கவனம் தேவை."
    },
    9: {
        "element": "Fire", "element_ta": "நெருப்பு தத்துவம்",
        "mobility": "Ubhaya", "mobility_ta": "உபய ராசி",
        "ruling_planet": "Jupiter", "ruling_planet_ta": "குரு பகவான்",
        "symbol": "Bow & Arrow", "symbol_ta": "வில்",
        "personality": "Philosophical, optimistic, truthful, generous, fond of higher knowledge, dharma, and travel.",
        "personality_ta": "ஆன்மீக நாட்டம், தர்ம சிந்தனை, நேர்மை, விரிந்த மனப்பான்மை மற்றும் குரு பக்தி.",
        "strengths_ta": "நல்லொழுக்கம், அறிவுரை கூறும் திறன், தொலைநோக்கு பார்வை, தாராள குணம்.",
        "challenges_ta": "வெளிப்படையாக பேசி பகை சம்பாதித்தல், நடைமுறைக்கு ஒவ்வாத அதிகப்படியான நம்பிக்கை.",
        "career_ta": "பேராசிரியர், நீதிபதி, மதகுரு, வங்கி மேலாண்மை, தத்துவ ஆய்வு, சர்வதேச வர்த்தகம்.",
        "wealth_ta": "தர்ம வழியில் ஈட்டிய பெருஞ்செல்வம், தெய்வ அனுகூலத்தால் குறையாத தன பாக்கியம்.",
        "health_ta": "தொடை பகுதி, கல்லீரல் மற்றும் கொழுப்பு தொடர்பான உபாதைகளில் கவனம் தேவை."
    },
    10: {
        "element": "Earth", "element_ta": "நில தத்துவம்",
        "mobility": "Chara", "mobility_ta": "சர ராசி",
        "ruling_planet": "Saturn", "ruling_planet_ta": "சனி பகவான்",
        "symbol": "Crocodile / Sea-Goat", "symbol_ta": "முதலை / மான் முகம்",
        "personality": "Disciplined, ambitious, pragmatic, persevering, with deep respect for duty, order, and mastery.",
        "personality_ta": "கடின உழைப்பு, லட்சிய வெறி, விவேகம், பொறுப்புணர்ச்சி மற்றும் உயர்ந்த நிர்வாகத் திறன்.",
        "strengths_ta": "தளர்வறியா உழைப்பு, சிக்கனம், பொறுமை, படிப்படியாக உயர்ந்த நிலையை அடைதல்.",
        "challenges_ta": "மன அழுத்தம், அதிக கண்டிப்பு, எளிதில் மகிழ்ச்சியடையாத இறுகிய தன்மை.",
        "career_ta": "அரசு நிர்வாகம், கட்டுமானம், இயந்திரங்கள், விவசாயம், சுரங்கம், தொழிற்சாலை மேலாண்மை.",
        "wealth_ta": "வாழ்க்கையின் பிற்பகுதியில் அசைக்க முடியாத பெரும் சொத்து மற்றும் சமூக மரியாதை.",
        "health_ta": "முழங்கால் மூட்டுகள், எலும்பு மற்றும் தோல் நோய்களில் கவனம் தேவை."
    },
    11: {
        "element": "Air", "element_ta": "காற்று தத்துவம்",
        "mobility": "Sthira", "mobility_ta": "ஸ்திர ராசி",
        "ruling_planet": "Saturn", "ruling_planet_ta": "சனி பகவான்",
        "symbol": "Water-Bearer", "symbol_ta": "குடம்",
        "personality": "Humanitarian, visionary, inventive, independent, egalitarian, with progressive ideals and deep intellect.",
        "personality_ta": "மனிதாபிமானம், புதுமை சிந்தனை, சமத்துவம், பரந்த மனப்பான்மை மற்றும் சமூக நலனில் அக்கறை.",
        "strengths_ta": "புதிய கண்டுபிடிப்புகள், நண்பர்கள் வட்டம், பாகுபாடற்ற அன்பு, ஆழ்ந்த தத்துவ ஞானம்.",
        "challenges_ta": "தனிமை விரும்புதல், குடும்பத்தில் ஈடுபாடின்மை போல் தோன்றுதல், பிடிவாதம்.",
        "career_ta": "விஞ்ஞானம், விண்வெளி ஆய்வு, சமூக சேவை, தொலைத்தொடர்பு, மின் பொறியியல், என்.ஜி.ஓ.",
        "wealth_ta": "லாப ஸ்தான ராசியாக அமைவதால் பல வழிகளில் வருமானம், மூத்த சகோதரர் ஆதரவு.",
        "health_ta": "கணுக்கால், கால்கள் மற்றும் ரத்த ஓட்ட மண்டலத்தில் கவனம் தேவை."
    },
    12: {
        "element": "Water", "element_ta": "நீர் தத்துவம்",
        "mobility": "Ubhaya", "mobility_ta": "உபய ராசி",
        "ruling_planet": "Jupiter", "ruling_planet_ta": "குரு பகவான்",
        "symbol": "Two Fishes", "symbol_ta": "இரட்டை மீன்கள்",
        "personality": "Compassionate, spiritual, artistic, self-sacrificing, intuitive, and connected to the transcendental.",
        "personality_ta": "கருணை, ஆன்மீக பக்தி, கலை தாகம், தியாக உள்ளம் மற்றும் மோட்ச நாட்டம் உடையவர்.",
        "strengths_ta": "பிறர் துயர் கண்டு உருகும் உள்ளம், தெய்வீக அருள், ஆழமான பக்தி, கவிதை நயம்.",
        "challenges_ta": "நடைமுறை யதார்த்தத்தை உணராமை, அளவுக்கு மீறிய தியாகம், எளிதில் ஏமாறுதல்.",
        "career_ta": "ஆன்மீகத் தொண்டு, மருத்துவம், நீர் மேலாண்மை, கடல்சார் வாணிபம், கலை, திரைப்பட இயக்கம்.",
        "wealth_ta": "புண்ணிய காரியங்களுக்காக தான தர்மங்கள் செய்யும் யோகம்; வெளிநாட்டு வருமானம்.",
        "health_ta": "பாதங்கள், தூக்கமின்மை மற்றும் நீர் சம்பந்தப்பட்ட உபாதைகளில் எச்சரிக்கை."
    }
}

# Classical Nakshatra Predictions (Jathaka Alankaram & Phaladeepika)
NAKSHATRA_PREDICTIONS: Dict[int, Dict[str, Any]] = {
    1: {  # Ashwini
        "deity": "Ashwini Kumaras (Celestial Physicians)", "deity_ta": "அஸ்வினி குமாரர்கள் (தேவ மருத்துவர்கள்)",
        "traits_ta": "அழகிய தோற்றம், சுறுசுறுப்பு, புத்தி கூர்மை, வேகமான செயல்பாடு மற்றும் மருத்துவ அறிவு.",
        "career_ta": "மருத்துவம், ராணுவம், குதிரை ஏற்றம்/வாகனம், பொறியியல், விளையாட்டு.",
        "temple_ta": "திருத்துறைப்பூண்டி அருள்மிகு பிறவி மருந்தீஸ்வரர் திருக்கோவில் அல்லது திருவாரூர்.",
        "pada_effects_ta": [
            "1-ஆம் பாதம் (மேஷம்): தைரியம், தலைமை, வீரம் மற்றும் அதிகாரப் பதவி.",
            "2-ஆம் பாதம் (ரிஷபம்): நற்குணம், செல்வம், கலை ஆர்வம் மற்றும் குடும்ப சுகம்.",
            "3-ஆம் பாதம் (மிதுனம்): சிறந்த கல்வி, வாக்கு வன்மை, எழுத்தாற்றல் மற்றும் நகைச்சுவை.",
            "4-ஆம் பாதம் (கடகம்): தயாள குணம், ஆன்மீக நாட்டம், தாய் பக்தி மற்றும் நீர் யோகம்."
        ]
    },
    2: {  # Bharani
        "deity": "Yama Dharma Raja", "deity_ta": "எமதர்ம ராஜன்",
        "traits_ta": "சத்தியம் தவறாமை, துணிவு, நீதி காக்கும் குணம், கவர்ச்சியான ஆளுமை மற்றும் விடாமுயற்சி.",
        "career_ta": "நீதித்துறை, நிர்வாகம், அறுவை சிகிச்சை, விவசாயம், உணவுத் தொழில்.",
        "temple_ta": "மயிலாடுதுறை அருகே நல்லாடை அருள்மிகு அக்னீஸ்வரர் திருக்கோவில்.",
        "pada_effects_ta": [
            "1-ஆம் பாதம் (சிம்மம்): அரச அனுகூலம், அதிகார பதவி, புகழ் மற்றும் கர்வம்.",
            "2-ஆம் பாதம் (கன்னி): விவேகம், திட்டமிட்ட உழைப்பு, வியாபார நுணுக்கம்.",
            "3-ஆம் பாதம் (துலாம்): கலை நயம், சுகபோக வாழ்வு, வசீகர பேச்சு, தாம்பத்திய சுகம்.",
            "4-ஆம் பாதம் (விருச்சிகம்): பிடிவாதம், கடின உழைப்பு, தடைகளை வெல்லும் வீரம்."
        ]
    },
    3: {  # Krittika
        "deity": "Agni Bhagavan (Lord of Fire)", "deity_ta": "அக்னி பகவான்",
        "traits_ta": "பிரகாசமான முகம், நேர்மை, தலைமை, பசி தாங்காமை, கோபமும் அதே சமயம் இரக்கமும் கொண்டவர்.",
        "career_ta": "அரசு வேலை, ராணுவம், சமையல் கலை, தீயணைப்பு, நகை/உலோக வேலைகள்.",
        "temple_ta": "திருவண்ணாமலை அருள்மிகு அருணாசலேஸ்வரர் திருக்கோவில்.",
        "pada_effects_ta": [
            "1-ஆம் பாதம் (தனுசு): ஆன்மீக ஞானம், நீதி, பரந்த மனப்பான்மை மற்றும் அரசு மதிப்பு.",
            "2-ஆம் பாதம் (மகரம்): விடாமுயற்சி, தொழில் ஆர்வம், பொறுமை மற்றும் தனயோகம்.",
            "3-ஆம் பாதம் (கும்பம்): பொதுநலம், மனிதாபிமானம், புதுமை சிந்தனை, நற்பெயர்.",
            "4-ஆம் பாதம் (மீனம்): கருணை, பக்தி, சாந்த குணம் மற்றும் தியாக உள்ளம்."
        ]
    },
    4: {  # Rohini
        "deity": "Brahma / Prajapati", "deity_ta": "பிரம்மா / பிரஜாபதி",
        "traits_ta": "அழகிய வசீகர தோற்றம், இனிமையான பேச்சு, காதல் உணர்வு, கலை ரசனை மற்றும் செல்வாக்கு.",
        "career_ta": "கலை, சினிமா, வாசனை திரவியங்கள், விவசாயம், ஹோட்டல், ஜவுளி வியாபாரம்.",
        "temple_ta": "காஞ்சிபுரம் அருள்மிகு பண்டவதூதப் பெருமாள் திருக்கோவில்.",
        "pada_effects_ta": [
            "1-ஆம் பாதம் (மேஷம்): வீரம், சுறுசுறுப்பு, துணிவான முடிவுகள், விரைவு.",
            "2-ஆம் பாதம் (ரிஷபம்): பேரழகு, பெரும் தன யோகம், ஆபரண சேர்க்கை, வர்கோத்தமம்.",
            "3-ஆம் பாதம் (மிதுனம்): அறிவுக்கூர்மை, பேச்சுத் திறமை, வர்த்தக சாதனை.",
            "4-ஆம் பாதம் (கடகம்): தாயன்பு, ஆழமான பக்தி, நீர் யோகம் மற்றும் அமைதி."
        ]
    },
    5: {  # Mrigashirsha
        "deity": "Soma (Chandra / Moon)", "deity_ta": "சோமன் (சந்திர பகவான்)",
        "traits_ta": "எப்போதும் தேடுதல் குணம், விவேகம், சுறுசுறுப்பு, உற்சாகம் மற்றும் ஆராயும் அறிவு.",
        "career_ta": "ஆராய்ச்சி, தகவல் தொடர்பு, சுற்றுலா, நிலம்/ரியல் எஸ்டேட், இசை.",
        "temple_ta": "தஞ்சாவூர் அருகே எண்கண் அருள்மிகு ஆதிநாராயணப் பெருமாள் கோவில்.",
        "pada_effects_ta": [
            "1-ஆம் பாதம் (சிம்மம்): தைரியம், கம்பீரம், அரசு ஆதரவு மற்றும் புகழ்.",
            "2-ஆம் பாதம் (கன்னி): கல்வி நுண்ணறிவு, கணக்கு புலமை, சிக்கனம்.",
            "3-ஆம் பாதம் (துலாம்): கலை நயம், நட்பு வட்டம், நேர்த்தியான ஆடை ரசனை.",
            "4-ஆம் பாதம் (விருச்சிகம்): தீவிர ஆராய்ச்சி, ரகசிய ஞானம், அஞ்சா நெஞ்சம்."
        ]
    },
    6: {  # Ardra
        "deity": "Rudra (Lord Shiva)", "deity_ta": "ருத்ரன் (சிவபெருமான்)",
        "traits_ta": "ஆழ்ந்த சிந்தனை, கடுமையான உழைப்பு, தடைகளைத் தகர்க்கும் வீரம், இரக்க குணம்.",
        "career_ta": "மென்பொருள், மின்சாரம், வானிலை ஆய்வு, ஆயுர்வேதம், தொலைத்தொடர்பு.",
        "temple_ta": "சிதம்பரம் அருள்மிகு நடராஜர் திருக்கோவில் அல்லது திருவாதிரை திருத்தலங்கள்.",
        "pada_effects_ta": [
            "1-ஆம் பாதம் (தனுசு): தர்ம சிந்தனை, கல்வி ஆர்வம், பெரியோர் ஆசி.",
            "2-ஆம் பாதம் (மகரம்): பொறுமை, கடின உழைப்பு, தொழில் முன்னேற்றம்.",
            "3-ஆம் பாதம் (கும்பம்): புதுமை கண்டுபிடிப்பு, விஞ்ஞான அறிவு, மனிதாபிமானம்.",
            "4-ஆம் பாதம் (மீனம்): ஆன்மீக ஈடுபாடு, தியாக குணம், பரம சாந்தம்."
        ]
    },
    7: {  # Punarvasu
        "deity": "Aditi (Mother of the Gods)", "deity_ta": "அதிதி (தேவ மாதா)",
        "traits_ta": "மறுவாழ்வு தரும் சக்தி, நல்லொழுக்கம், அமைதி, தாராள குணம், ஸ்ரீ ராமரின் ஜென்ம நட்சத்திரம்.",
        "career_ta": "ஆசிரியர் பணி, நீதித்துறை, ஆன்மீகம், வங்கி, சமூக சீர்திருத்தம்.",
        "temple_ta": "வாலாஜாபேட்டை அருகே வாலாஜாபேட்டை தன்வந்திரி ஆரோக்கிய பீடம்.",
        "pada_effects_ta": [
            "1-ஆம் பாதம் (மேஷம்): வீரம், உறுதி, முன்னோடி தலைமை.",
            "2-ஆம் பாதம் (ரிஷபம்): சுகபோகம், நிலையான தனம், குடும்ப பாசம்.",
            "3-ஆம் பாதம் (மிதுனம்): வாக்கு வன்மை, பன்மொழிப் புலமை, அறிவு.",
            "4-ஆம் பாதம் (கடகம்): ஸ்ரீ ராமர் பாதம்; அதீத தர்ம குணம், தாய்மை, வர்கோத்தமம்."
        ]
    },
    8: {  # Pushya
        "deity": "Brihaspati (Guru)", "deity_ta": "பிருஹஸ்பதி (தேவகுரு)",
        "traits_ta": "அனைத்து நட்சத்திரங்களிலும் மங்களகரமானது; அறிவு, தர்மம், சகிப்புத்தன்மை, குருவருள்.",
        "career_ta": "கல்வி நிறுவனம், மத ஸ்தாபனம், அரசு நிர்வாகம், பால்பண்ணை, சட்டம்.",
        "temple_ta": "விளங்குளம் அருள்மிகு அட்சயபுரீஸ்வரர் திருக்கோவில் (தஞ்சை).",
        "pada_effects_ta": [
            "1-ஆம் பாதம் (சிம்மம்): ராஜ கம்பீரம், அரசு மேன்மை, நற்பெயர்.",
            "2-ஆம் பாதம் (கன்னி): சேவை மனப்பான்மை, தூய்மை, விவேகமான உழைப்பு.",
            "3-ஆம் பாதம் (துலாம்): நற்குணங்கள், இல்லற சுகம், நடுநிலைமை.",
            "4-ஆம் பாதம் (விருச்சிகம்): ஆன்மீக தீட்சை, யோக சாதனை, உள்நோக்கு அறிவு."
        ]
    },
    9: {  # Ashlesha
        "deity": "Sarpa / Nagas", "deity_ta": "சர்ப்ப தேவதைகள் (நாகர்கள்)",
        "traits_ta": "கூர்மையான பார்வை, சமயோசித புத்தி, சுதந்திர விரும்பி, செல்வாக்கு மிக்கவர்.",
        "career_ta": "மருத்துவம்/மருந்து தயாரிப்பு, சட்டம், அரசியல், வர்த்தகம், ரசாயனம்.",
        "temple_ta": "திருப்பாம்புரம் அருள்மிகு சேஷபுரீஸ்வரர் திருக்கோவில்.",
        "pada_effects_ta": [
            "1-ஆம் பாதம் (தனுசு): தான தர்மம், தத்துவ நாட்டம், பொது மரியாதை.",
            "2-ஆம் பாதம் (மகரம்): தொழில் வெற்றி, பொருளாதாரம், திட்டமிடல்.",
            "3-ஆம் பாதம் (கும்பம்): தத்துவ ஞானம், சமூகப் பார்வை, புதிய சிந்தனை.",
            "4-ஆம் பாதம் (மீனம்): ஆன்மீக முக்தி, மன நிம்மதி, கலை ஈடுபாடு."
        ]
    },
    10: {  # Magha
        "deity": "Pitris (Ancestors)", "deity_ta": "பித்ருக்கள் (முன்னோர்கள்)",
        "traits_ta": "முன்னோர் ஆசி, தலைமை தாங்கும் குணம், கம்பீரம், பரம்பரை மரியாதை, விசுவாசம்.",
        "career_ta": "அரசு தலைமை பதவி, பரம்பரை தொழில், மேலாண்மை, தொல்பொருள் ஆய்வு.",
        "temple_ta": "திருவொற்றியூர் அருள்மிகு வடிவுடையம்மன் திருக்கோவில்.",
        "pada_effects_ta": [
            "1-ஆம் பாதம் (மேஷம்): தலைமை, வீரம், திடமான கொள்கை.",
            "2-ஆம் பாதம் (ரிஷபம்): செல்வம், வாகன சுகம், குடும்ப மேன்மை.",
            "3-ஆம் பாதம் (மிதுனம்): கல்வி நுண்ணறிவு, சொல்வன்மை, வியாபாரம்.",
            "4-ஆம் பாதம் (கடகம்): தாய் பக்தி, இல்லற சுகம், தர்ம குணம்."
        ]
    }
}

# Generic fallback attributes for remaining stars 11-27
DEFAULT_STAR_TRAITS: Dict[int, Dict[str, Any]] = {
    11: {"deity_ta": "பக தேவதை", "traits_ta": "சுப பாக்கியம், கலை ஆர்வம், மகிழ்ச்சியான வாழ்வு, பிறருக்கு உதவும் குணம்."},
    12: {"deity_ta": "ஆர்யமா (சூரியன்)", "traits_ta": "உயர் பதவி, தர்ம சிந்தனை, வாக்கு நாணயம், குடும்ப மேன்மை."},
    13: {"deity_ta": "சூரிய பகவான்", "traits_ta": "கைத்தொழில் வித்தகர், நகைச்சுவை, புத்தி கூர்மை, அதிர்ஷ்ட யோகம்."},
    14: {"deity_ta": "விஸ்வகர்மா (சிற்பி)", "traits_ta": "அழகியல் உணர்வு, வடிவமைப்பு திறன், ஆடை ஆபரண விருப்பம்."},
    15: {"deity_ta": "வாயு பகவான்", "traits_ta": "சுதந்திர மனப்பான்மை, எளிமை, நற்குணங்கள், வியாபார வெற்றி."},
    16: {"deity_ta": "இந்திராக்னி", "traits_ta": "லட்சிய வெற்றி, வைராக்கியம், தலைமைப் பண்பு, விடாமுயற்சி."},
    17: {"deity_ta": "மித்ரன்", "traits_ta": "நட்பு போற்றுதல், வெளிநாடு செல்லும் யோகம், ஆன்மீக நாட்டம்."},
    18: {"deity_ta": "இந்திரன்", "traits_ta": "தைரியம், மூத்தோர் பெருமை, பாதுகாப்பு உணர்வு, துணிச்சல்."},
    19: {"deity_ta": "நிருதி (அசுர தேவதை)", "traits_ta": "ஆராய்ச்சி அறிவு, ஆழ்ந்த வேர் வரை சென்று அறியும் குணம்."},
    20: {"deity_ta": "வருண பகவான் (அபாஹ்)", "traits_ta": "நட்பு, பாசப்பிணைப்பு, செல்வாக்கு, நீர் நிலை யோகம்."},
    21: {"deity_ta": "விஸ்வே தேவர்கள்", "traits_ta": "வெற்றி வீரர், பொறுமை, பொதுநலம், தலைமை பண்பு."},
    22: {"deity_ta": "மகாவிஷ்ணு", "traits_ta": "செவிமடுத்து கேட்டல், வேத சாஸ்திர புலமை, தாயன்பு, புகழ்."},
    23: {"deity_ta": "அஷ்ட வசுக்கள்", "traits_ta": "இசை ஞானம், தாராள மனம், வீரம், நற்புகழ், செல்வாக்கு."},
    24: {"deity_ta": "வருண பகவான்", "traits_ta": "மருத்துவ குணம், மறைமுக ஆற்றல், தத்துவ ஆய்வு, தீர்க்க புத்தி."},
    25: {"deity_ta": "அஜைகபாதன்", "traits_ta": "ஆன்மீக வைராக்கியம், தவ வலிமை, உயர்ந்த லட்சியம்."},
    26: {"deity_ta": "அஹிர்புத்னியன்", "traits_ta": "சாந்த குணம், கருணை, தியாக உள்ளம், குடும்ப அமைதி."},
    27: {"deity_ta": "பூஷா (வழித்துணை)", "traits_ta": "பயணங்கள், பாதுகாப்பு, மென்மையான பேச்சு, மோட்ச ஞானம்."}
}


def get_detailed_predictions(
    lagna_sign: int,
    rasi_sign: int,
    nakshatra_num: int,
    pada: int
) -> Dict[str, Any]:
    """
    Returns rich classical Tamil and English predictions for Rasi, Nakshatra, Pada, and Lagna.
    """
    rasi_info = RASI_PREDICTIONS.get(rasi_sign, RASI_PREDICTIONS[1])
    nak_info = NAKSHATRA_PREDICTIONS.get(nakshatra_num)
    if not nak_info:
        def_t = DEFAULT_STAR_TRAITS.get(nakshatra_num, {"deity_ta": "தேவதை", "traits_ta": "நற்குணங்கள் நிறைந்தவர்."})
        nak_info = {
            "deity": "Vedic Deity", "deity_ta": def_t["deity_ta"],
            "traits_ta": def_t["traits_ta"],
            "career_ta": "நிர்வாகம், கல்வி, வர்த்தகம், ஆன்மீகம்.",
            "temple_ta": "ஜென்ம நட்சத்திரத்திற்குரிய திருத்தலம் அல்லது குலதெய்வ வழிபாடு.",
            "pada_effects_ta": [
                f"{i+1}-ஆம் பாதம்: சுப யோகம், நற்குணங்கள், தொழில் முன்னேற்றம் மற்றும் குடும்ப சுகம்."
                for i in range(4)
            ]
        }

    lagna_info = RASI_PREDICTIONS.get(lagna_sign, RASI_PREDICTIONS[1])
    pada_idx = max(0, min(3, pada - 1))
    pada_desc_ta = nak_info["pada_effects_ta"][pada_idx] if pada_idx < len(nak_info.get("pada_effects_ta", [])) else f"{pada}-ஆம் பாத சுப பலன்கள்."

    return {
        "rasi_number": rasi_sign,
        "rasi_name": SIGN_LABELS[rasi_sign]["sa"],
        "rasi_name_ta": SIGN_LABELS[rasi_sign]["ta"],
        "rasi_prediction": rasi_info["personality"],
        "rasi_prediction_ta": rasi_info["personality_ta"],
        "rasi_element_ta": rasi_info["element_ta"],
        "rasi_mobility_ta": rasi_info["mobility_ta"],
        "rasi_ruling_planet_ta": rasi_info["ruling_planet_ta"],
        "rasi_strengths_ta": rasi_info["strengths_ta"],
        "rasi_challenges_ta": rasi_info["challenges_ta"],
        "rasi_career_ta": rasi_info["career_ta"],
        "rasi_wealth_ta": rasi_info["wealth_ta"],
        "rasi_health_ta": rasi_info["health_ta"],

        "nakshatra_number": nakshatra_num,
        "nakshatra_name": NAKSHATRA_LABELS[nakshatra_num - 1]["sa"],
        "nakshatra_name_ta": NAKSHATRA_LABELS[nakshatra_num - 1]["ta"],
        "nakshatra_deity": nak_info.get("deity", "Vedic Deity"),
        "nakshatra_deity_ta": nak_info.get("deity_ta", "தேவதை"),
        "nakshatra_traits_ta": nak_info["traits_ta"],
        "nakshatra_career_ta": nak_info["career_ta"],
        "nakshatra_temple_ta": nak_info.get("temple_ta", "குலதெய்வ கோவில்"),

        "pada": pada,
        "pada_prediction_ta": pada_desc_ta,

        "lagna_number": lagna_sign,
        "lagna_name": SIGN_LABELS[lagna_sign]["sa"],
        "lagna_name_ta": SIGN_LABELS[lagna_sign]["ta"],
        "lagna_prediction_ta": f"லக்னம் {SIGN_LABELS[lagna_sign]['ta']} ராசியில் உதித்துள்ளது. {lagna_info['personality_ta']}"
    }
