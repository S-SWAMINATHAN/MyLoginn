"""
Vedic Astrology Yoga and Dosha Detection Engine.
Strictly adheres to AGENTS.md §1 (Rule citation from BPHS, Phaladeepika, Jataka Parijata, Uttara Kalamrita).
"""

from typing import List, Dict, Any
from backend.app.services.tamil_labels import SIGN_LABELS, PLANET_LABELS

def detect_yogas(lagna_sign: int, planets_by_name: Dict[str, Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Identifies classical auspicious yogas with textual citations.
    """
    yogas = []

    moon = planets_by_name.get("Moon")
    sun = planets_by_name.get("Sun")
    mars = planets_by_name.get("Mars")
    mercury = planets_by_name.get("Mercury")
    jupiter = planets_by_name.get("Jupiter")
    venus = planets_by_name.get("Venus")
    saturn = planets_by_name.get("Saturn")
    rahu = planets_by_name.get("Rahu")
    ketu = planets_by_name.get("Ketu")

    # 1. Gaja Kesari Yoga (BPHS Ch. 36 / Phaladeepika Ch. 6)
    # Jupiter in Kendra (1, 4, 7, 10) from Moon
    if moon and jupiter:
        diff = ((jupiter["rasi_number"] - moon["rasi_number"]) % 12) + 1
        if diff in (1, 4, 7, 10):
            yogas.append({
                "name": "Gaja Kesari Yoga",
                "name_ta": "கஜகேசரி யோகம்",
                "category": "Maha Shubha Yoga",
                "present": True,
                "description": "Jupiter is in a Kendra (angular house) from the Moon. Bestows noble intellect, high public reputation, overcoming adversaries, and lasting prosperity.",
                "description_ta": "சந்திரனுக்கு கேந்திரத்தில் (1, 4, 7, 10) குரு பகவான் அமர்ந்துள்ளதால் கஜகேசரி யோகம் உண்டாகிறது. இது சிறந்த கல்வி, நுண்ணறிவு, தலைமைப் பண்பு மற்றும் நீடித்த புகழை தரும்.",
                "classical_source": "Brihat Parashara Hora Shastra Ch. 36 & Phaladeepika 6.1",
                "planets_involved": ["Moon", "Jupiter"]
            })

    # 2. Budhaditya Yoga (BPHS Ch. 36)
    # Sun and Mercury in the same sign
    if sun and mercury:
        if sun["rasi_number"] == mercury["rasi_number"]:
            yogas.append({
                "name": "Budhaditya Yoga",
                "name_ta": "புதாதித்ய யோகம் (நிபுண யோகம்)",
                "category": "Dhana & Vidya Yoga",
                "present": True,
                "description": "Sun and Mercury are conjoined in the same sign. Endows acute analytical intellect, academic brilliance, eloquence, and administrative skill.",
                "description_ta": "சூரியனும் புதனும் ஒரே ராசியில் இணைந்திருப்பதால் புதாதித்ய யோகம் அமைகிறது. சிறந்த கல்வித் திறன், வாக்கு வன்மை, கணிதம் மற்றும் நிர்வாகத் திறமையை அருளும்.",
                "classical_source": "Brihat Parashara Hora Shastra Ch. 36",
                "planets_involved": ["Sun", "Mercury"]
            })

    # 3. Guru Mangala Yoga (Jataka Parijata)
    # Jupiter and Mars conjunction or mutual Kendra
    if jupiter and mars:
        if jupiter["rasi_number"] == mars["rasi_number"] or (((jupiter["rasi_number"] - mars["rasi_number"]) % 12) + 1 in (1, 4, 7, 10)):
            yogas.append({
                "name": "Guru Mangala Yoga",
                "name_ta": "குரு மங்கள யோகம்",
                "category": "Bhagya & Bhoomi Yoga",
                "present": True,
                "description": "Auspicious association between Jupiter and Mars. Confers real-estate gains, upright leadership, administrative success, and strong moral courage.",
                "description_ta": "குரு மற்றும் செவ்வாய் இணைவு அல்லது சமசப்தம பார்வை காரணமாக அமைவது. நிலம், வீடு மனை யோகம், துணிச்சல் மற்றும் நேர்மையான தலைமைத்துவத்தை அளிக்கும்.",
                "classical_source": "Jataka Parijata Ch. 7",
                "planets_involved": ["Jupiter", "Mars"]
            })

    # 4. Chandra-Mangala Yoga (Phaladeepika Ch. 6)
    # Moon and Mars conjunction
    if moon and mars and moon["rasi_number"] == mars["rasi_number"]:
        yogas.append({
            "name": "Chandra-Mangala Yoga",
            "name_ta": "சந்திர மங்கள யோகம்",
            "category": "Dhana Yoga",
            "present": True,
            "description": "Moon and Mars conjoined in the same sign. Generates immense entrepreneurial capability, commercial wealth, and unyielding drive.",
            "description_ta": "சந்திரனும் செவ்வாயும் ஒரே ராசியில் இணைந்துள்ளதால் தொழில் மற்றும் வணிகத்தில் அபரிமிதமான தன லாபமும் வெற்றியும் உண்டாகும்.",
            "classical_source": "Phaladeepika 6.13",
            "planets_involved": ["Moon", "Mars"]
        })

    # 5. Pancha Mahapurusha Yogas (BPHS Ch. 36)
    # Mars: Ruchaka (Exalted/Own in Kendra from Lagna)
    if mars:
        m_house = ((mars["rasi_number"] - lagna_sign) % 12) + 1
        if m_house in (1, 4, 7, 10) and mars["status"] in ("Exalted", "Own House"):
            yogas.append({
                "name": "Ruchaka Yoga (Pancha Mahapurusha)",
                "name_ta": "ருசக யோகம் (பஞ்ச மகாபுருஷ யோகம்)",
                "category": "Maha Purusha Yoga",
                "present": True,
                "description": "Mars in Kendra in exaltation or own sign. Imparts supreme bravery, commanding executive authority, and physical vitality.",
                "description_ta": "செவ்வாய் கேந்திரத்தில் ஆட்சி அல்லது உச்சம் பெற்று விளங்குவது. அசாத்திய துணிச்சல், பாதுகாப்பு மற்றும் நிர்வாகத் துறைகளில் உச்ச பதவி வழங்கும்.",
                "classical_source": "Brihat Parashara Hora Shastra 36.2",
                "planets_involved": ["Mars"]
            })

    # Mercury: Bhadra (Exalted/Own in Kendra from Lagna)
    if mercury:
        me_house = ((mercury["rasi_number"] - lagna_sign) % 12) + 1
        if me_house in (1, 4, 7, 10) and "Exalted" in mercury["status"]:
            yogas.append({
                "name": "Bhadra Yoga (Pancha Mahapurusha)",
                "name_ta": "பத்ர யோகம் (பஞ்ச மகாபுருஷ யோகம்)",
                "category": "Maha Purusha Yoga",
                "present": True,
                "description": "Mercury in Kendra in its exaltation/own sign Virgo/Gemini. Endows mastery in communications, commerce, sciences, and noble longevity.",
                "description_ta": "புதன் கேந்திரத்தில் ஆட்சி/உச்சம் பெறுவது. வியாபாரம், தகவல் தொடர்பு, கணிதம் மற்றும் கல்வியில் நிகரற்ற மேன்மை அளிக்கும்.",
                "classical_source": "Brihat Parashara Hora Shastra 36.3",
                "planets_involved": ["Mercury"]
            })

    # Jupiter: Hamsa (Exalted/Own in Kendra from Lagna)
    if jupiter:
        j_house = ((jupiter["rasi_number"] - lagna_sign) % 12) + 1
        if j_house in (1, 4, 7, 10) and jupiter["status"] in ("Exalted", "Own House"):
            yogas.append({
                "name": "Hamsa Yoga (Pancha Mahapurusha)",
                "name_ta": "ஹம்ச யோகம் (பஞ்ச மகாபுருஷ யோகம்)",
                "category": "Maha Purusha Yoga",
                "present": True,
                "description": "Jupiter in Kendra in Cancer, Sagittarius, or Pisces. Confers saintly wisdom, high moral standing, royal honor, and spiritual grace.",
                "description_ta": "குரு கேந்திரத்தில் ஆட்சி/உச்சம் பெறுவது. ஆன்மீக ஞானம், அறநெறி, உயர் கௌரவம் மற்றும் தூய நற்பெயரை அருளும்.",
                "classical_source": "Brihat Parashara Hora Shastra 36.4",
                "planets_involved": ["Jupiter"]
            })

    # Venus: Malavya (Exalted/Own in Kendra from Lagna)
    if venus:
        v_house = ((venus["rasi_number"] - lagna_sign) % 12) + 1
        if v_house in (1, 4, 7, 10) and venus["status"] in ("Exalted", "Own House"):
            yogas.append({
                "name": "Malavya Yoga (Pancha Mahapurusha)",
                "name_ta": "மாளவ்ய யோகம் (பஞ்ச மகாபுருஷ யோகம்)",
                "category": "Maha Purusha Yoga",
                "present": True,
                "description": "Venus in Kendra in Pisces, Taurus, or Libra. Blesses with aesthetic refinement, luxurious comforts, domestic bliss, and vehicle prosperity.",
                "description_ta": "சுக்கிரன் கேந்திரத்தில் ஆட்சி/உச்சம் பெறுவது. கலை ஆர்வம், சகல சுகபோகங்கள், வாகன யோகம் மற்றும் மகிழ்ச்சியான இல்லறம் தரும்.",
                "classical_source": "Brihat Parashara Hora Shastra 36.5",
                "planets_involved": ["Venus"]
            })

    # Saturn: Sasa (Exalted/Own in Kendra from Lagna)
    if saturn:
        s_house = ((saturn["rasi_number"] - lagna_sign) % 12) + 1
        if s_house in (1, 4, 7, 10) and saturn["status"] in ("Exalted", "Own House"):
            yogas.append({
                "name": "Sasa Yoga (Pancha Mahapurusha)",
                "name_ta": "சச யோகம் (பஞ்ச மகாபுருஷ யோகம்)",
                "category": "Maha Purusha Yoga",
                "present": True,
                "description": "Saturn in Kendra in Libra, Capricorn, or Aquarius. Gives immense mass popularity, mastery over resources, leadership of organizations, and disciplined endurance.",
                "description_ta": "சனி கேந்திரத்தில் ஆட்சி/உச்சம் பெறுவது. மக்கள் செல்வாக்கு, அதிகார தலைமை, நிலைத்த செல்வம் மற்றும் கடின உழைப்பால் உயர்வு தரும்.",
                "classical_source": "Brihat Parashara Hora Shastra 36.6",
                "planets_involved": ["Saturn"]
            })

    # 6. Dharma Karmadhipati Yoga (BPHS Ch. 34)
    # 9th Lord and 10th Lord in mutual sambandha
    lord_9_name = SIGN_LABELS[((lagna_sign - 1 + 8) % 12) + 1]["lord"]
    lord_10_name = SIGN_LABELS[((lagna_sign - 1 + 9) % 12) + 1]["lord"]
    p9 = planets_by_name.get(lord_9_name)
    p10 = planets_by_name.get(lord_10_name)
    if p9 and p10 and p9["rasi_number"] == p10["rasi_number"]:
        yogas.append({
            "name": "Dharma Karmadhipati Yoga",
            "name_ta": "தர்ம கர்மாதிபதி யோகம்",
            "category": "Raja Yoga",
            "present": True,
            "description": "Conjunction of 9th Lord (Fortune/Dharma) and 10th Lord (Profession/Karma). Foretells high official status, righteousness, and professional eminence.",
            "description_ta": "9-ஆம் அதிபதியும் 10-ஆம் அதிபதியும் இணைந்து நிற்பதால் அமைவது. உன்னதமான தொழில் வெற்றி, உயர் பதவி, மற்றும் தர்ம சிந்தனையோடு கூடிய பெரும் புகழ் தரும்.",
            "classical_source": "Brihat Parashara Hora Shastra Ch. 34",
            "planets_involved": [lord_9_name, lord_10_name]
        })

    # 7. Amala Yoga (Phaladeepika 6.21)
    # 10th house from Lagna or Moon occupied by natural benefic (Jupiter, Venus, Mercury)
    h10_sign = ((lagna_sign - 1 + 9) % 12) + 1
    benefics_in_10 = [p["name"] for p in [jupiter, venus, mercury] if p and p["rasi_number"] == h10_sign]
    if benefics_in_10:
        yogas.append({
            "name": "Amala Yoga",
            "name_ta": "அமல யோகம்",
            "category": "Shubha Yoga",
            "present": True,
            "description": "Natural benefic occupying the 10th house. Gives unblemished reputation, philanthropic nature, and honorable career accomplishments.",
            "description_ta": "10-ஆம் பாவத்தில் சுப கிரகங்கள் அமர்ந்துள்ளதால் அமைவது. களங்கமற்ற நற்பெயர், தர்ம குணங்கள் மற்றும் மேன்மையான தொழில் நிலை தரும்.",
            "classical_source": "Phaladeepika 6.21",
            "planets_involved": benefics_in_10
        })

    return yogas

def detect_doshas(lagna_sign: int, planets_by_name: Dict[str, Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Identifies classical Doshas and applies authentic South Indian cancellation rules and Pariharams.
    """
    doshas = []

    moon = planets_by_name.get("Moon")
    mars = planets_by_name.get("Mars")
    mercury = planets_by_name.get("Mercury")
    venus = planets_by_name.get("Venus")
    sun = planets_by_name.get("Sun")
    jupiter = planets_by_name.get("Jupiter")
    rahu = planets_by_name.get("Rahu")
    ketu = planets_by_name.get("Ketu")
    saturn = planets_by_name.get("Saturn")

    # 1. Sevvai / Mangal / Kuja Dosham (South Indian Classical Standard)
    # Houses: 2, 4, 7, 8, 12 from Lagna, Moon, or Venus
    if mars:
        m_from_lagna = ((mars["rasi_number"] - lagna_sign) % 12) + 1
        m_from_moon = ((mars["rasi_number"] - moon["rasi_number"]) % 12) + 1 if moon else 0
        m_from_venus = ((mars["rasi_number"] - venus["rasi_number"]) % 12) + 1 if venus else 0

        dosha_houses = (2, 4, 7, 8, 12)
        has_lagna_dosha = m_from_lagna in dosha_houses
        has_moon_dosha = m_from_moon in dosha_houses
        has_venus_dosha = m_from_venus in dosha_houses

        if has_lagna_dosha or has_moon_dosha or has_venus_dosha:
            # Check South Indian Classical Cancellation Rules:
            # 1. Mars in Aries, Scorpio, Capricorn, Leo, Sagittarius, Pisces
            # 2. Mars conjunct or aspected by Jupiter or Moon
            # 3. Mars in 2nd in Gemini/Virgo, 4th in Aries/Scorpio, 7th in Capricorn/Cancer, 8th in Sagittarius/Pisces, 12th in Taurus/Libra
            cancellations = []
            if mars["rasi_number"] in (1, 8, 10, 5, 9, 12):
                cancellations.append(f"Mars is in {mars['rasi']} (Own / Exalted / Friendly sign).")
            if jupiter and (((jupiter["rasi_number"] - mars["rasi_number"]) % 12) + 1 in (1, 5, 7, 9)):
                cancellations.append("Mars receives the auspicious aspect/conjunction of Guru (Jupiter).")
            if moon and moon["rasi_number"] == mars["rasi_number"]:
                cancellations.append("Mars is conjoined with Chandra (Chandra-Mangala union cancels dosha).")
            if m_from_lagna == 2 and mars["rasi_number"] in (3, 6):
                cancellations.append("Mars in 2nd house in Gemini/Virgo cancels dosha.")
            if m_from_lagna == 4 and mars["rasi_number"] in (1, 8):
                cancellations.append("Mars in 4th house in Aries/Scorpio cancels dosha.")
            if m_from_lagna == 7 and mars["rasi_number"] in (4, 10):
                cancellations.append("Mars in 7th house in Cancer/Capricorn cancels dosha.")
            if m_from_lagna == 8 and mars["rasi_number"] in (9, 12):
                cancellations.append("Mars in 8th house in Sagittarius/Pisces cancels dosha.")
            if m_from_lagna == 12 and mars["rasi_number"] in (2, 7):
                cancellations.append("Mars in 12th house in Taurus/Libra cancels dosha.")

            is_cancelled = len(cancellations) > 0
            severity = "Low / Cancelled" if is_cancelled else ("High" if has_lagna_dosha and has_moon_dosha else "Moderate")

            doshas.append({
                "name": "Sevvai Dosham (Mangal Dosha)",
                "name_ta": "செவ்வாய் தோஷம்",
                "present": not is_cancelled,
                "severity": severity,
                "description": f"Mars is positioned in house {m_from_lagna} from Lagna." +
                               (f" However, the dosha is nullified due to classical exceptions: {'; '.join(cancellations)}" if is_cancelled
                                else " Requires matching with a compatible Sevvai Dosha horoscope."),
                "description_ta": f"செவ்வாய் பகவான் லக்னத்திற்கு {m_from_lagna}-ஆம் இடத்தில் அமர்ந்துள்ளார்." +
                                  (f" எனினும் சாஸ்திர விதிகளின்படி தோஷ நிவர்த்தி பெற்றுள்ளது: {'; '.join(cancellations)}" if is_cancelled
                                   else " பொருத்தமான செவ்வாய் தோஷ ஜாதகத்துடன் இணைப்பது உத்தமம்."),
                "remedies": [
                    "Worship Lord Muruga at Vaitheeswaran Koil / Palani.",
                    "Recite Skanda Shasti Kavacham on Tuesdays.",
                    "Light ghee lamp with red wick at temple on Tuesdays."
                ],
                "remedies_ta": [
                    "வைத்தீஸ்வரன் கோவில் / பழனி முருகன் தரிசனம் மற்றும் வழிபாடு.",
                    "செவ்வாய்க்கிழமைகளில் கந்த சஷ்டி கவசம் பாராயணம் செய்தல்.",
                    "செவ்வாய்க்கிழமைகளில் துர்க்கை அல்லது முருகனுக்கு நெய் தீபம் ஏற்றுதல்."
                ],
                "classical_source": "Brihat Parashara Hora Shastra & Tamil Jathaga Chandrika",
                "cancellation_rules_applied": cancellations
            })
        else:
            doshas.append({
                "name": "Sevvai Dosham (Mangal Dosha)",
                "name_ta": "செவ்வாய் தோஷம்",
                "present": False,
                "severity": "None",
                "description": "Mars is placed in an auspicious house without causing Kuja Dosham.",
                "description_ta": "செவ்வாய் பகவான் சுப பாவங்களில் அமர்ந்து தோஷம் இல்லாமல் உள்ளார்.",
                "remedies": [],
                "remedies_ta": [],
                "classical_source": "BPHS",
                "cancellation_rules_applied": []
            })

    # 2. Kala Sarpa Dosham
    # All 7 planets enclosed within Rahu-Ketu axis
    if rahu and ketu:
        r_deg = rahu["total_degree"]
        k_deg = ketu["total_degree"]

        # Normalize arc from Rahu to Ketu
        planets_to_check = [sun, moon, mars, mercury, jupiter, venus, saturn]
        arc_1 = True  # all between Rahu -> Ketu
        arc_2 = True  # all between Ketu -> Rahu

        for p in planets_to_check:
            if not p: continue
            deg = p["total_degree"]
            # Check if deg is inside [r_deg, k_deg] (forward)
            if (k_deg - r_deg) % 360.0 >= (deg - r_deg) % 360.0:
                arc_2 = False
            else:
                arc_1 = False

        is_kala_sarpa = arc_1 or arc_2
        if is_kala_sarpa:
            doshas.append({
                "name": "Kala Sarpa Dosham",
                "name_ta": "கால சர்ப்ப தோஷம்",
                "present": True,
                "severity": "Moderate",
                "description": "All 7 classical planets are hemmed between Rahu and Ketu axis. May cause initial life delays followed by dramatic elevation post age 28-33.",
                "description_ta": "அனைத்து 7 கிரகங்களும் ராகு-கேது அச்சின் ஒரு பக்கத்தில் அமைந்துள்ளதால் கால சர்ப்ப யோக/தோஷம் ஏற்படுகிறது. ஆரம்ப கால போராட்டங்களுக்குப் பின் 28-33 வயதிற்கு மேல் பெருவாழ்வு தரும்.",
                "remedies": [
                    "Visit Sri Kalahasti or Thirunageswaram Rahu Temple.",
                    "Perform Sarpa Shanti pariharam / Maha Mrityunjaya Japa.",
                    "Feed stray dogs on Saturdays."
                ],
                "remedies_ta": [
                    "திருக்காளஹஸ்தி அல்லது திருநாகேஸ்வரம் சென்று ராகு-கேது பரிகார பூஜை செய்தல்.",
                    "மகா மிருத்யுஞ்சய மந்திரம் அல்லது நாக தோஷ நிவர்த்தி ஸ்தோத்திரம் ஓதுதல்.",
                    "சனிக்கிழமை தோறும் அன்னதானம் அல்லது ஆதரவற்றோருக்கு உதவுதல்."
                ],
                "classical_source": "Jataka Parijata & Standard Parashari Jyotish",
                "cancellation_rules_applied": []
            })

    # 3. Pitru Dosham
    # Sun conjoined with Rahu/Ketu, or 9th lord afflicted
    if sun and rahu and (sun["rasi_number"] == rahu["rasi_number"] or sun["rasi_number"] == ketu["rasi_number"]):
        doshas.append({
            "name": "Pitru Dosham",
            "name_ta": "பித்ரு தோஷம்",
            "present": True,
            "severity": "Moderate",
            "description": "Sun (Karaka for Father and Soul) is conjunct Rahu/Ketu. Indicates karmic ancestors obligations.",
            "description_ta": "சூரியன் ராகு அல்லது கேதுவுடன் இணைந்துள்ளதால் பித்ருக்களின் ஆசி பெற வழிபாடுகள் தேவை என்பதை குறிக்கிறது.",
            "remedies": [
                "Perform Amavasya Tharpanam and charity regularly.",
                "Visit Rameswaram or Thilatharpanapuri for Pitru Pooja.",
                "Serve food to elders and cows on new moon days."
            ],
            "remedies_ta": [
                "அமாவாசை தோறும் முன்னோர்களுக்கு தர்ப்பணம் மற்றும் அன்னதானம் செய்தல்.",
                "ராமேஸ்வரம் அல்லது திலதர்ப்பணபுரி சென்று தீர்த்தமாடி வழிபாடு செய்தல்.",
                "பசு மாட்டிற்கு அகத்திகீரை மற்றும் வாழைப்பழம் வழங்குதல்."
            ],
            "classical_source": "Brihat Parashara Hora Shastra",
            "cancellation_rules_applied": []
        })

    # 4. Guru Chandala Dosham
    # Jupiter conjunct Rahu or Ketu
    if jupiter and rahu and jupiter["rasi_number"] == rahu["rasi_number"]:
        doshas.append({
            "name": "Guru Chandala Dosham",
            "name_ta": "குரு சண்டாள தோஷம்",
            "present": True,
            "severity": "Low",
            "description": "Jupiter is conjunct Rahu in the same sign. Advises caution in blind trust and regular worship of Guru.",
            "description_ta": "குருவும் ராகுவும் ஒரே ராசியில் இணைந்துள்ளதால் ஆசிரியர்கள், பெரியோர்களை மதித்து நடப்பது நற்பலன் தரும்.",
            "remedies": [
                "Worship Lord Dakshinamurthy on Thursdays with yellow flowers.",
                "Chant Guru Gayatri Mantra."
            ],
            "remedies_ta": [
                "வியாழக்கிழமைகளில் தட்சிணாமூர்த்திக்கு கொண்டைக்கடலை மாலை சாற்றி வழிபடுதல்.",
                "குரு காயத்ரி மந்திரம் பாராயணம் செய்தல்."
            ],
            "classical_source": "Jataka Parijata",
            "cancellation_rules_applied": []
        })

    # 5. Ganda Moola Dosham
    # Moon in Nakshatras: Ashwini (1), Ashlesha (9), Magha (10), Jyeshtha (18), Moola (19), Revati (27)
    if moon and moon.get("nakshatra_number") in (1, 9, 10, 18, 19, 27):
        doshas.append({
            "name": "Ganda Moola Nakshatra",
            "name_ta": "கண்ட மூல நட்சத்திர தோஷம்",
            "present": True,
            "severity": "Low",
            "description": f"Moon is placed in {moon['nakshatra']} which is at the junction of rasis and nakshatras.",
            "description_ta": f"சந்திரன் {moon['nakshatra_ta']} நட்சத்திரத்தில் (ராசி சந்திப்பு நட்சத்திரம்) அமைந்துள்ளது.",
            "remedies": [
                "Perform Nakshatra Shanti Pooja / Ganapathi Homam on birth star day.",
                "Donate green grams / clothing to scholars."
            ],
            "remedies_ta": [
                "ஜென்ம நட்சத்திர நாளன்று கணபதி ஹோமம் அல்லது நட்சத்திர சாந்தி பூஜை செய்தல்.",
                "ஏழைகளுக்கு ஆடை மற்றும் உணவு தானம் செய்தல்."
            ],
            "classical_source": "Muhurtha Chintamani & BPHS",
            "cancellation_rules_applied": []
        })

    return doshas
