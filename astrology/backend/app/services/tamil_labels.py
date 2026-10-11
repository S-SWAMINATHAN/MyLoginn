"""
Canonical Tamil, Sanskrit, and English labels for Vedic Astrology (Jathagam).
Governed by AGENTS.md and jathagam-architecture.md.
"""

PLANET_LABELS = {
    "Sun": {"ta": "சூரியன்", "ta_short": "சூ", "sa": "Surya", "en": "Sun", "lord_ta": "சூரியன்"},
    "Moon": {"ta": "சந்திரன்", "ta_short": "சந்", "sa": "Chandra", "en": "Moon", "lord_ta": "சந்திரன்"},
    "Mars": {"ta": "செவ்வாய்", "ta_short": "செவ்", "sa": "Mangala", "en": "Mars", "lord_ta": "செவ்வாய்"},
    "Mercury": {"ta": "புதன்", "ta_short": "புத", "sa": "Budha", "en": "Mercury", "lord_ta": "புதன்"},
    "Jupiter": {"ta": "குரு", "ta_short": "குரு", "sa": "Guru", "en": "Jupiter", "lord_ta": "குரு (வியாழன்)"},
    "Venus": {"ta": "சுக்கிரன்", "ta_short": "சுக்", "sa": "Shukra", "en": "Venus", "lord_ta": "சுக்கிரன் (வெள்ளி)"},
    "Saturn": {"ta": "சனி", "ta_short": "சனி", "sa": "Shani", "en": "Saturn", "lord_ta": "சனி"},
    "Rahu": {"ta": "ராகு", "ta_short": "ராகு", "sa": "Rahu", "en": "Rahu", "lord_ta": "ராகு"},
    "Ketu": {"ta": "கேது", "ta_short": "கேது", "sa": "Ketu", "en": "Ketu", "lord_ta": "கேது"},
    "Lagna": {"ta": "லக்னம்", "ta_short": "லக்", "sa": "Lagna", "en": "Ascendant", "lord_ta": "லக்னம்"},
    "Gulika": {"ta": "குளிகன்", "ta_short": "குளி", "sa": "Gulika", "en": "Gulika", "lord_ta": "குளிகன்"},
    "Mandi": {"ta": "மாந்தி", "ta_short": "மாந்", "sa": "Mandi", "en": "Mandi", "lord_ta": "மாந்தி"},
}

SIGN_LABELS = {
    1: {"sa": "Mesha", "ta": "மேஷம்", "en": "Aries", "lord": "Mars", "element": "Fire", "element_ta": "நெருப்பு"},
    2: {"sa": "Vrishabha", "ta": "ரிஷபம்", "en": "Taurus", "lord": "Venus", "element": "Earth", "element_ta": "நிலம்"},
    3: {"sa": "Mithuna", "ta": "மிதுனம்", "en": "Gemini", "lord": "Mercury", "element": "Air", "element_ta": "காற்று"},
    4: {"sa": "Karkataka", "ta": "கடகம்", "en": "Cancer", "lord": "Moon", "element": "Water", "element_ta": "நீர்"},
    5: {"sa": "Simha", "ta": "சிம்மம்", "en": "Leo", "lord": "Sun", "element": "Fire", "element_ta": "நெருப்பு"},
    6: {"sa": "Kanya", "ta": "கன்னி", "en": "Virgo", "lord": "Mercury", "element": "Earth", "element_ta": "நிலம்"},
    7: {"sa": "Tula", "ta": "துலாம்", "en": "Libra", "lord": "Venus", "element": "Air", "element_ta": "காற்று"},
    8: {"sa": "Vrischika", "ta": "விருச்சிகம்", "en": "Scorpio", "lord": "Mars", "element": "Water", "element_ta": "நீர்"},
    9: {"sa": "Dhanus", "ta": "தனுசு", "en": "Sagittarius", "lord": "Jupiter", "element": "Fire", "element_ta": "நெருப்பு"},
    10: {"sa": "Makara", "ta": "மகரம்", "en": "Capricorn", "lord": "Saturn", "element": "Earth", "element_ta": "நிலம்"},
    11: {"sa": "Kumbha", "ta": "கும்பம்", "en": "Aquarius", "lord": "Saturn", "element": "Air", "element_ta": "காற்று"},
    12: {"sa": "Meena", "ta": "மீனம்", "en": "Pisces", "lord": "Jupiter", "element": "Water", "element_ta": "நீர்"},
}

NAKSHATRA_LABELS = [
    {"index": 1, "sa": "Ashwini", "ta": "அசுவினி", "lord": "Ketu", "lord_ta": "கேது", "deity": "Ashwini Kumaras", "ganam": "Deva", "ganam_ta": "தேவ கணம்", "yoni": "Horse", "yoni_ta": "ஆண் குதிரை", "rajju": "Pada", "rajju_ta": "பாத ரஜ்ஜு", "bootham": "Earth", "bootham_ta": "நிலம்", "nadi": "Vata (Adhi)", "nadi_ta": "ஆதி நாடி (வாதம்)", "vriksham_ta": "எட்டி மரம்", "pakshi_ta": "புள்ளு (இராசாளி)", "mirugam_ta": "குதிரை"},
    {"index": 2, "sa": "Bharani", "ta": "பரணி", "lord": "Venus", "lord_ta": "சுக்கிரன்", "deity": "Yama", "ganam": "Manushya", "ganam_ta": "மனித கணம்", "yoni": "Elephant", "yoni_ta": "ஆண் யானை", "rajju": "Thigh (Uru)", "rajju_ta": "தொடை (ஊரு) ரஜ்ஜு", "bootham": "Earth", "bootham_ta": "நிலம்", "nadi": "Pitta (Madhya)", "nadi_ta": "மத்ய நாடி (பித்தம்)", "vriksham_ta": "நெல்லி மரம்", "pakshi_ta": "காகம்", "mirugam_ta": "யானை"},
    {"index": 3, "sa": "Krittika", "ta": "கார்த்திகை", "lord": "Sun", "lord_ta": "சூரியன்", "deity": "Agni", "ganam": "Rakshasa", "ganam_ta": "ராக்ஷஸ கணம்", "yoni": "Sheep", "yoni_ta": "பெண் ஆடு", "rajju": "Stomach (Udara)", "rajju_ta": "உதர ரஜ்ஜு", "bootham": "Earth", "bootham_ta": "நிலம்", "nadi": "Kapha (Antya)", "nadi_ta": "அந்த்ய நாடி (கபம்)", "vriksham_ta": "அத்தி மரம்", "pakshi_ta": "மயில்", "mirugam_ta": "ஆடு"},
    {"index": 4, "sa": "Rohini", "ta": "ரோகிணி", "lord": "Moon", "lord_ta": "சந்திரன்", "deity": "Brahma", "ganam": "Manushya", "ganam_ta": "மனித கணம்", "yoni": "Serpent", "yoni_ta": "ஆண் பாம்பு", "rajju": "Neck (Kanda)", "rajju_ta": "கண்ட ரஜ்ஜு", "bootham": "Earth", "bootham_ta": "நிலம்", "nadi": "Kapha (Antya)", "nadi_ta": "அந்த்ய நாடி (கபம்)", "vriksham_ta": "நாவல் மரம்", "pakshi_ta": "ஆந்தை", "mirugam_ta": "பாம்பு"},
    {"index": 5, "sa": "Mrigashirsha", "ta": "மிருகசீரிஷம்", "lord": "Mars", "lord_ta": "செவ்வாய்", "deity": "Soma", "ganam": "Deva", "ganam_ta": "தேவ கணம்", "yoni": "Serpent", "yoni_ta": "பெண் பாம்பு", "rajju": "Head (Sirasu)", "rajju_ta": "சிரசு ரஜ்ஜு", "bootham": "Earth", "bootham_ta": "நிலம்", "nadi": "Pitta (Madhya)", "nadi_ta": "மத்ய நாடி (பித்தம்)", "vriksham_ta": "கருங்காலி மரம்", "pakshi_ta": "கோழி", "mirugam_ta": "மான்"},
    {"index": 6, "sa": "Ardra", "ta": "திருவாதிரை", "lord": "Rahu", "lord_ta": "ராகு", "deity": "Rudra", "ganam": "Manushya", "ganam_ta": "மனித கணம்", "yoni": "Dog", "yoni_ta": "பெண் நாய்", "rajju": "Neck (Kanda)", "rajju_ta": "கண்ட ரஜ்ஜு", "bootham": "Water", "bootham_ta": "நீர்", "nadi": "Vata (Adhi)", "nadi_ta": "ஆதி நாடி (வாதம்)", "vriksham_ta": "செங்கருங்காலி மரம்", "pakshi_ta": "அன்றில்", "mirugam_ta": "நாய்"},
    {"index": 7, "sa": "Punarvasu", "ta": "புனர்பூசம்", "lord": "Jupiter", "lord_ta": "குரு", "deity": "Aditi", "ganam": "Deva", "ganam_ta": "தேவ கணம்", "yoni": "Cat", "yoni_ta": "பெண் பூனை", "rajju": "Stomach (Udara)", "rajju_ta": "உதர ரஜ்ஜு", "bootham": "Water", "bootham_ta": "நீர்", "nadi": "Vata (Adhi)", "nadi_ta": "ஆதி நாடி (வாதம்)", "vriksham_ta": "மூங்கில் மரம்", "pakshi_ta": "அன்னப் பறவை", "mirugam_ta": "பூனை"},
    {"index": 8, "sa": "Pushya", "ta": "பூசம்", "lord": "Saturn", "lord_ta": "சனி", "deity": "Brihaspati", "ganam": "Deva", "ganam_ta": "தேவ கணம்", "yoni": "Goat", "yoni_ta": "ஆண் ஆடு", "rajju": "Thigh (Uru)", "rajju_ta": "தொடை (ஊரு) ரஜ்ஜு", "bootham": "Water", "bootham_ta": "நீர்", "nadi": "Pitta (Madhya)", "nadi_ta": "மத்ய நாடி (பித்தம்)", "vriksham_ta": "அரசு மரம்", "pakshi_ta": "குயில்", "mirugam_ta": "ஆடு"},
    {"index": 9, "sa": "Ashlesha", "ta": "ஆயில்யம்", "lord": "Mercury", "lord_ta": "புதன்", "deity": "Sarpa", "ganam": "Rakshasa", "ganam_ta": "ராக்ஷஸ கணம்", "yoni": "Cat", "yoni_ta": "ஆண் பூனை", "rajju": "Pada", "rajju_ta": "பாத ரஜ்ஜு", "bootham": "Water", "bootham_ta": "நீர்", "nadi": "Kapha (Antya)", "nadi_ta": "அந்த்ய நாடி (கபம்)", "vriksham_ta": "புன்னை மரம்", "pakshi_ta": "செம்போத்து", "mirugam_ta": "பூனை"},
    {"index": 10, "sa": "Magha", "ta": "மகம்", "lord": "Ketu", "lord_ta": "கேது", "deity": "Pitris", "ganam": "Rakshasa", "ganam_ta": "ராக்ஷஸ கணம்", "yoni": "Rat", "yoni_ta": "ஆண் எலி", "rajju": "Pada", "rajju_ta": "பாத ரஜ்ஜு", "bootham": "Water", "bootham_ta": "நீர்", "nadi": "Kapha (Antya)", "nadi_ta": "அந்த்ய நாடி (கபம்)", "vriksham_ta": "ஆலமரம்", "pakshi_ta": "ஆண் மயில்", "mirugam_ta": "எலி"},
    {"index": 11, "sa": "Purva Phalguni", "ta": "பூரம்", "lord": "Venus", "lord_ta": "சுக்கிரன்", "deity": "Bhaga", "ganam": "Manushya", "ganam_ta": "மனித கணம்", "yoni": "Rat", "yoni_ta": "பெண் எலி", "rajju": "Thigh (Uru)", "rajju_ta": "தொடை (ஊரு) ரஜ்ஜு", "bootham": "Water", "bootham_ta": "நீர்", "nadi": "Pitta (Madhya)", "nadi_ta": "மத்ய நாடி (பித்தம்)", "vriksham_ta": "பலா மரம்", "pakshi_ta": "பெண் மயில்", "mirugam_ta": "எலி"},
    {"index": 12, "sa": "Uttara Phalguni", "ta": "உத்திரம்", "lord": "Sun", "lord_ta": "சூரியன்", "deity": "Aryaman", "ganam": "Manushya", "ganam_ta": "மனித கணம்", "yoni": "Cow", "yoni_ta": "ஆண் மாடு", "rajju": "Stomach (Udara)", "rajju_ta": "உதர ரஜ்ஜு", "bootham": "Fire", "bootham_ta": "நெருப்பு", "nadi": "Vata (Adhi)", "nadi_ta": "ஆதி நாடி (வாதம்)", "vriksham_ta": "அலரி / இலந்தை", "pakshi_ta": "கழுகு / கூகை", "mirugam_ta": "பசு / மாடு"},
    {"index": 13, "sa": "Hasta", "ta": "அஸ்தம்", "lord": "Moon", "lord_ta": "சந்திரன்", "deity": "Savitar", "ganam": "Deva", "ganam_ta": "தேவ கணம்", "yoni": "Buffalo", "yoni_ta": "பெண் எருமை", "rajju": "Neck (Kanda)", "rajju_ta": "கண்ட ரஜ்ஜு", "bootham": "Fire", "bootham_ta": "நெருப்பு", "nadi": "Vata (Adhi)", "nadi_ta": "ஆதி நாடி (வாதம்)", "vriksham_ta": "அத்தி மரம்", "pakshi_ta": "பருந்து", "mirugam_ta": "எருமை"},
    {"index": 14, "sa": "Chitra", "ta": "சித்திரை", "lord": "Mars", "lord_ta": "செவ்வாய்", "deity": "Tvashtar", "ganam": "Rakshasa", "ganam_ta": "ராக்ஷஸ கணம்", "yoni": "Tiger", "yoni_ta": "பெண் புலி", "rajju": "Head (Sirasu)", "rajju_ta": "சிரசு ரஜ்ஜு", "bootham": "Fire", "bootham_ta": "நெருப்பு", "nadi": "Pitta (Madhya)", "nadi_ta": "மத்ய நாடி (பித்தம்)", "vriksham_ta": "வில்வ மரம்", "pakshi_ta": "மரங்கொத்தி", "mirugam_ta": "புலி"},
    {"index": 15, "sa": "Swati", "ta": "சுவாதி", "lord": "Rahu", "lord_ta": "ராகு", "deity": "Vayu", "ganam": "Deva", "ganam_ta": "தேவ கணம்", "yoni": "Buffalo", "yoni_ta": "ஆண் எருமை", "rajju": "Neck (Kanda)", "rajju_ta": "கண்ட ரஜ்ஜு", "bootham": "Fire", "bootham_ta": "நெருப்பு", "nadi": "Kapha (Antya)", "nadi_ta": "அந்த்ய நாடி (கபம்)", "vriksham_ta": "மருத மரம்", "pakshi_ta": "வானம்பாடி", "mirugam_ta": "எருமை"},
    {"index": 16, "sa": "Vishakha", "ta": "விசாகம்", "lord": "Jupiter", "lord_ta": "குரு", "deity": "Indragni", "ganam": "Rakshasa", "ganam_ta": "ராக்ஷஸ கணம்", "yoni": "Tiger", "yoni_ta": "ஆண் புலி", "rajju": "Stomach (Udara)", "rajju_ta": "உதர ரஜ்ஜு", "bootham": "Fire", "bootham_ta": "நெருப்பு", "nadi": "Kapha (Antya)", "nadi_ta": "அந்த்ய நாடி (கபம்)", "vriksham_ta": "விளா மரம்", "pakshi_ta": "செங்காகம்", "mirugam_ta": "புலி"},
    {"index": 17, "sa": "Anuradha", "ta": "அனுஷம்", "lord": "Saturn", "lord_ta": "சனி", "deity": "Mitra", "ganam": "Deva", "ganam_ta": "தேவ கணம்", "yoni": "Deer", "yoni_ta": "பெண் மான்", "rajju": "Thigh (Uru)", "rajju_ta": "தொடை (ஊரு) ரஜ்ஜு", "bootham": "Fire", "bootham_ta": "நெருப்பு", "nadi": "Pitta (Madhya)", "nadi_ta": "மத்ய நாடி (பித்தம்)", "vriksham_ta": "மகிழ மரம்", "pakshi_ta": "புள்ளு", "mirugam_ta": "மான்"},
    {"index": 18, "sa": "Jyeshtha", "ta": "கேட்டை", "lord": "Mercury", "lord_ta": "புதன்", "deity": "Indra", "ganam": "Rakshasa", "ganam_ta": "ராக்ஷஸ கணம்", "yoni": "Deer", "yoni_ta": "ஆண் மான்", "rajju": "Pada", "rajju_ta": "பாத ரஜ்ஜு", "bootham": "Air", "bootham_ta": "காற்று", "nadi": "Vata (Adhi)", "nadi_ta": "ஆதி நாடி (வாதம்)", "vriksham_ta": "பிராய் மரம்", "pakshi_ta": "சக்ரவாகம்", "mirugam_ta": "மான்"},
    {"index": 19, "sa": "Moola", "ta": "மூலம்", "lord": "Ketu", "lord_ta": "கேது", "deity": "Nirriti", "ganam": "Rakshasa", "ganam_ta": "ராக்ஷஸ கணம்", "yoni": "Dog", "yoni_ta": "பெண் நாய்", "rajju": "Pada", "rajju_ta": "பாத ரஜ்ஜு", "bootham": "Air", "bootham_ta": "காற்று", "nadi": "Vata (Adhi)", "nadi_ta": "ஆதி நாடி (வாதம்)", "vriksham_ta": "மரா மரம்", "pakshi_ta": "செம்பருந்து", "mirugam_ta": "நாய்"},
    {"index": 20, "sa": "Purva Ashadha", "ta": "பூராடம்", "lord": "Venus", "lord_ta": "சுக்கிரன்", "deity": "Apas", "ganam": "Manushya", "ganam_ta": "மனித கணம்", "yoni": "Monkey", "yoni_ta": "ஆண் குரங்கு", "rajju": "Thigh (Uru)", "rajju_ta": "தொடை (ஊரு) ரஜ்ஜு", "bootham": "Air", "bootham_ta": "காற்று", "nadi": "Pitta (Madhya)", "nadi_ta": "மத்ய நாடி (பித்தம்)", "vriksham_ta": "வஞ்சி மரம்", "pakshi_ta": "காட்டுக்கோழி", "mirugam_ta": "குரங்கு"},
    {"index": 21, "sa": "Uttara Ashadha", "ta": "உத்திராடம்", "lord": "Sun", "lord_ta": "சூரியன்", "deity": "Vishwadevas", "ganam": "Manushya", "ganam_ta": "மனித கணம்", "yoni": "Mongoose", "yoni_ta": "ஆண் கீரி", "rajju": "Stomach (Udara)", "rajju_ta": "உதர ரஜ்ஜு", "bootham": "Air", "bootham_ta": "காற்று", "nadi": "Kapha (Antya)", "nadi_ta": "அந்த்ய நாடி (கபம்)", "vriksham_ta": "பலா மரம்", "pakshi_ta": "வல்லூறு", "mirugam_ta": "கீரி"},
    {"index": 22, "sa": "Shravana", "ta": "திருவோணம்", "lord": "Moon", "lord_ta": "சந்திரன்", "deity": "Vishnu", "ganam": "Deva", "ganam_ta": "தேவ கணம்", "yoni": "Monkey", "yoni_ta": "பெண் குரங்கு", "rajju": "Neck (Kanda)", "rajju_ta": "கண்ட ரஜ்ஜு", "bootham": "Air", "bootham_ta": "காற்று", "nadi": "Kapha (Antya)", "nadi_ta": "அந்த்ய நாடி (கபம்)", "vriksham_ta": "எருக்கு மரம்", "pakshi_ta": "நாரை", "mirugam_ta": "குரங்கு"},
    {"index": 23, "sa": "Dhanishta", "ta": "அவிட்டம்", "lord": "Mars", "lord_ta": "செவ்வாய்", "deity": "Vasus", "ganam": "Rakshasa", "ganam_ta": "ராக்ஷஸ கணம்", "yoni": "Lion", "yoni_ta": "பெண் சிங்கம்", "rajju": "Head (Sirasu)", "rajju_ta": "சிரசு ரஜ்ஜு", "bootham": "Air", "bootham_ta": "காற்று", "nadi": "Pitta (Madhya)", "nadi_ta": "மத்ய நாடி (பித்தம்)", "vriksham_ta": "வன்னி மரம்", "pakshi_ta": "பொன்வண்டு", "mirugam_ta": "சிங்கம்"},
    {"index": 24, "sa": "Shatabhisha", "ta": "சதயம்", "lord": "Rahu", "lord_ta": "ராகு", "deity": "Varuna", "ganam": "Rakshasa", "ganam_ta": "ராக்ஷஸ கணம்", "yoni": "Horse", "yoni_ta": "பெண் குதிரை", "rajju": "Neck (Kanda)", "rajju_ta": "கண்ட ரஜ்ஜு", "bootham": "Ether", "bootham_ta": "ஆகாயம்", "nadi": "Vata (Adhi)", "nadi_ta": "ஆதி நாடி (வாதம்)", "vriksham_ta": "கடம்ப மரம்", "pakshi_ta": "காகம்", "mirugam_ta": "குதிரை"},
    {"index": 25, "sa": "Purva Bhadrapada", "ta": "பூரட்டாதி", "lord": "Jupiter", "lord_ta": "குரு", "deity": "Aja Ekapada", "ganam": "Manushya", "ganam_ta": "மனித கணம்", "yoni": "Lion", "yoni_ta": "ஆண் சிங்கம்", "rajju": "Stomach (Udara)", "rajju_ta": "உதர ரஜ்ஜு", "bootham": "Ether", "bootham_ta": "ஆகாயம்", "nadi": "Vata (Adhi)", "nadi_ta": "ஆதி நாடி (வாதம்)", "vriksham_ta": "தேமா மரம்", "pakshi_ta": "உள்ளான்", "mirugam_ta": "சிங்கம்"},
    {"index": 26, "sa": "Uttara Bhadrapada", "ta": "உத்திரட்டாதி", "lord": "Saturn", "lord_ta": "சனி", "deity": "Ahirbudhnya", "ganam": "Manushya", "ganam_ta": "மனித கணம்", "yoni": "Cow", "yoni_ta": "பெண் பசு", "rajju": "Thigh (Uru)", "rajju_ta": "தொடை (ஊரு) ரஜ்ஜு", "bootham": "Ether", "bootham_ta": "ஆகாயம்", "nadi": "Pitta (Madhya)", "nadi_ta": "மத்ய நாடி (பித்தம்)", "vriksham_ta": "வேம்பு மரம்", "pakshi_ta": "கொக்கு", "mirugam_ta": "பசு"},
    {"index": 27, "sa": "Revati", "ta": "ரேவதி", "lord": "Mercury", "lord_ta": "புதன்", "deity": "Pushan", "ganam": "Deva", "ganam_ta": "தேவ கணம்", "yoni": "Elephant", "yoni_ta": "பெண் யானை", "rajju": "Pada", "rajju_ta": "பாத ரஜ்ஜு", "bootham": "Ether", "bootham_ta": "ஆகாயம்", "nadi": "Kapha (Antya)", "nadi_ta": "அந்த்ய நாடி (கபம்)", "vriksham_ta": "இலுப்பை மரம்", "pakshi_ta": "வெண்புறா", "mirugam_ta": "யானை"},
]

# Canonical Tamil Vaaram x Janma Nakshatra Dina Subha Yoga Lookup
# 0: Sunday (ஞாயிறு), 1: Monday (திங்கள்), 2: Tuesday (செவ்வாய்), 3: Wednesday (புதன்),
# 4: Thursday (வியாழன்), 5: Friday (வெள்ளி), 6: Saturday (சனி)
# Index is Nakshatra Number (1 to 27)
TAMIL_DINA_YOGAS = {
    0: {  # Sunday (ஞாயிறு)
        13: ("Amrita Yoga", "அமிர்த யோகம்"), 17: ("Amrita Yoga", "அமிர்த யோகம்"), 19: ("Amrita Yoga", "அமிர்த யோகம்"), 21: ("Amrita Yoga", "அமிர்த யோகம்"), 27: ("Amrita Yoga", "அமிர்த யோகம்"),
        4: ("Marana Yoga", "மரண யோகம்"), 10: ("Marana Yoga", "மரண யோகம்"), 18: ("Marana Yoga", "மரண யோகம்"), 25: ("Marana Yoga", "மரண யோகம்")
    },
    1: {  # Monday (திங்கள்)
        4: ("Amrita Yoga", "அமிர்த யோகம்"), 5: ("Amrita Yoga", "அமிர்த யோகம்"), 15: ("Amrita Yoga", "அமிர்த யோகம்"), 22: ("Amrita Yoga", "அமிர்த யோகம்"),
        2: ("Marana Yoga", "மரண யோகம்"), 14: ("Marana Yoga", "மரண யோகம்"), 16: ("Marana Yoga", "மரண யோகம்")
    },
    2: {  # Tuesday (செவ்வாய்)
        1: ("Amrita Yoga", "அமிர்த யோகம்"), 8: ("Amrita Yoga", "அமிர்த யோகம்"), 13: ("Amrita Yoga", "அமிர்த யோகம்"), 26: ("Amrita Yoga", "அமிர்த யோகம்"),
        16: ("Marana Yoga", "மரண யோகம்"), 22: ("Marana Yoga", "மரண யோகம்"), 24: ("Marana Yoga", "மரண யோகம்"), 27: ("Marana Yoga", "மரண யோகம்")
    },
    3: {  # Wednesday (புதன்)
        17: ("Amrita Yoga", "அமிர்த யோகம்"), 27: ("Amrita Yoga", "அமிர்த யோகம்"),
        1: ("Marana Yoga", "மரண யோகம்"), 5: ("Marana Yoga", "மரண யோகம்"), 7: ("Marana Yoga", "மரண யோகம்"), 12: ("Marana Yoga", "மரண யோகம்"), 23: ("Marana Yoga", "மரண யோகம்")
    },
    4: {  # Thursday (வியாழன்)
        7: ("Amrita Yoga", "அமிர்த யோகம்"), 8: ("Amrita Yoga", "அமிர்த யோகம்"), 15: ("Amrita Yoga", "அமிர்த யோகம்"), 20: ("Amrita Yoga", "அமிர்த யோகம்"),
        3: ("Marana Yoga", "மரண யோகம்"), 11: ("Marana Yoga", "மரண யோகம்"), 22: ("Marana Yoga", "மரண யோகம்"), 25: ("Marana Yoga", "மரண யோகம்")
    },
    5: {  # Friday (வெள்ளி)
        1: ("Amrita Yoga", "அமிர்த யோகம்"), 8: ("Amrita Yoga", "அமிர்த யோகம்"), 13: ("Amrita Yoga", "அமிர்த யோகம்"), 22: ("Amrita Yoga", "அமிர்த யோகம்"),
        3: ("Marana Yoga", "மரண யோகம்"), 4: ("Marana Yoga", "மரண யோகம்"), 9: ("Marana Yoga", "மரண யோகம்"), 17: ("Marana Yoga", "மரண யோகம்")
    },
    6: {  # Saturday (சனி)
        2: ("Amrita Yoga", "அமிர்த யோகம்"), 3: ("Amrita Yoga", "அமிர்த யோகம்"), 4: ("Amrita Yoga", "அமிர்த யோகம்"), 15: ("Amrita Yoga", "அமிர்த யோகம்"),
        1: ("Marana Yoga", "மரண யோகம்"), 5: ("Marana Yoga", "மரண யோகம்"), 7: ("Marana Yoga", "மரண யோகம்"), 13: ("Marana Yoga", "மரண யோகம்"), 14: ("Marana Yoga", "மரண யோகம்"), 19: ("Marana Yoga", "மரண யோகம்"), 26: ("Marana Yoga", "மரண யோகம்")
    }
}

BHAVA_LABELS = {
    1: {"name": "Lagna / Tanu Bhava", "name_ta": "1-ஆம் பாவம் (லக்னம் / தனு பாவம் - உடல், குணம், தோற்றம்)", "significations": ["character", "physique", "health", "longevity", "vitality", "general well-being"], "significations_ta": ["உடல் தோற்றம்", "குணம்", "ஆரோக்கியம்", "ஆயுள் பலம்", "மன உறுதி"]},
    2: {"name": "Dhana / Kutumba Bhava", "name_ta": "2-ஆம் பாவம் (தன / குடும்ப பாவம் - செல்வம், வாக்கு, குடும்பம்)", "significations": ["wealth", "family", "speech", "vision", "early education", "accumulated assets"], "significations_ta": ["குடும்ப வாழ்க்கை", "செல்வ வளம்", "வாக்கு வன்மை", "பொருளாதார நிலை"]},
    3: {"name": "Bhratri / Sahaja Bhava", "name_ta": "3-ஆம் பாவம் (சகஜ பாவம் - இளைய சகோதரம், தைரியம், முயற்சி)", "significations": ["younger siblings", "courage", "efforts", "communication", "short journeys", "talents"], "significations_ta": ["இளைய சகோதரர்கள்", "தைரியம்", "சுய முயற்சி", "தொடர்பாடல்", "குறுகிய பயணங்கள்"]},
    4: {"name": "Matru / Sukha Bhava", "name_ta": "4-ஆம் பாவம் (மாத்ரு / சுக பாவம் - தாய், வீடு, வாகனம், கல்வி)", "significations": ["mother", "vehicles", "properties", "formal education", "domestic happiness", "mental peace"], "significations_ta": ["தாய் அன்பு", "வீடு, மனை", "வாகன யோகம்", "கல்வி", "சுக போகங்கள்"]},
    5: {"name": "Putra / Purva Punya Bhava", "name_ta": "5-ஆம் பாவம் (புத்திர / பூர்வ புண்ணிய பாவம் - குழந்தைகள், புத்தி, யோகம்)", "significations": ["children", "intellect", "past-life merits", "speculation", "creativity", "mantra siddhi"], "significations_ta": ["குழந்தை பாக்கியம்", "பூர்வ புண்ணியம்", "நுண்ணறிவு", "படைப்பாற்றல்", "ஆன்மீக நாட்டம்"]},
    6: {"name": "Shatru / Roga / Rina Bhava", "name_ta": "6-ஆம் பாவம் (சத்ரு / ரோக / ருண பாவம் - கடன், நோய், எதிரி, வெற்றி)", "significations": ["debts", "diseases", "enemies", "litigation", "service", "overcoming obstacles"], "significations_ta": ["ரோகம் (ஆரோக்கிய சவால்கள்)", "ருணம் (கடன்)", "சத்ரு (எதிரிகள் மீதான வெற்றி)", "போட்டித் தேர்வு"]},
    7: {"name": "Kalatra / Jaya Bhava", "name_ta": "7-ஆம் பாவம் (களத்திர பாவம் - வாழ்க்கை துணை, திருமணம், கூட்டு தொழில்)", "significations": ["spouse", "marriage", "partnerships", "business relations", "foreign travel"], "significations_ta": ["வாழ்க்கைத் துணை", "திருமண யோகம்", "கூட்டுத் தொழில்", "வெளிநாட்டு பயணம்"]},
    8: {"name": "Ayur / Randhra Bhava", "name_ta": "8-ஆம் பாவம் (ஆயுள் / ரந்திர பாவம் - ஆயுள், திடீர் தனலாபம், ஆன்மீக ஞானம்)", "significations": ["longevity", "unexpected gains/losses", "occult", "transformation", "inheritance"], "significations_ta": ["ஆயுள் தீர்க்கம்", "திடீர் மாற்றங்கள் / லாபம்", "மறைமுக அறிவு", "ஆராய்ச்சி"]},
    9: {"name": "Bhagya / Dharma Bhava", "name_ta": "9-ஆம் பாவம் (பாக்கிய / தர்ம பாவம் - தந்தை, குரு, பாக்கியம், தர்மம்)", "significations": ["father", "fortune", "higher learning", "guru", "dharma", "pilgrimages"], "significations_ta": ["தந்தை யோகம்", "பாக்கிய பலன்", "தர்ம சிந்தனை", "குருவின் அருள்", "உயர் கல்வி"]},
    10: {"name": "Karma / Rajya Bhava", "name_ta": "10-ஆம் பாவம் (கர்ம / ஜீவன பாவம் - தொழில், உத்தியோகம், புகழ், அந்தஸ்து)", "significations": ["profession", "career", "social status", "fame", "authority", "leadership"], "significations_ta": ["தொழில் & உத்தியோகம்", "சமூக அந்தஸ்து", "புகழ்", "அதிகார பதவி"]},
    11: {"name": "Labha / Aya Bhava", "name_ta": "11-ஆம் பாவம் (லாப பாவம் - மூத்த சகோதரம், வருமானம், விருப்பங்கள் நிறைவேறுதல்)", "significations": ["gains", "income", "elder siblings", "fulfillment of desires", "networks", "friends"], "significations_ta": ["பொருளாதார லாபம்", "மூத்த சகோதரர்கள்", "ஆசைகள் நிறைவேறுதல்", "நட்பு வட்டம்"]},
    12: {"name": "Moksha / Vyaya Bhava", "name_ta": "12-ஆம் பாவம் (விரய / மோட்ச பாவம் - சுப விரயம், தூக்கம், வெளிநாடு, மோட்சம்)", "significations": ["expenditures", "losses", "liberation (moksha)", "foreign settlement", "bed pleasures", "isolation"], "significations_ta": ["சுப விரயம்", "வெளிநாட்டு குடியிருப்பு", "நிம்மதியான தூக்கம்", "ஆன்மீக மோட்சம்"]},
}

PORUTHAM_NAMES = [
    {"key": "dina", "ta": "தினப் பொருத்தம்", "sa": "Dina Porutham", "desc": "Good health, longevity, and disease-free life together."},
    {"key": "gana", "ta": "கணப் பொருத்தம்", "sa": "Gana Porutham", "desc": "Temperamental harmony and mutual understanding."},
    {"key": "mahendra", "ta": "மகேந்திரப் பொருத்தம்", "sa": "Mahendra Porutham", "desc": "Prosperity, lineage continuity, and progeny."},
    {"key": "sthree_deergha", "ta": "ஸ்திரீ தீர்க்கப் பொருத்தம்", "sa": "Stree Deergha", "desc": "Accumulated wealth, peace, and auspiciousness."},
    {"key": "yoni", "ta": "யோனிப் பொருத்தம்", "sa": "Yoni Porutham", "desc": "Physical compatibility and mutual affection."},
    {"key": "rasi", "ta": "ராசிப் பொருத்தம்", "sa": "Rasi Porutham", "desc": "Family harmony, unity, and growth."},
    {"key": "rasiyadhipathi", "ta": "ராசி அதிபதிப் பொருத்தம்", "sa": "Rasiyadhipathi Porutham", "desc": "Friendship between ruling planetary lords."},
    {"key": "vasya", "ta": "வசியப் பொருத்தம்", "sa": "Vasya Porutham", "desc": "Mutual attraction, love, and magnetic bond."},
    {"key": "rajju", "ta": "ரஜ்ஜுப் பொருத்தம்", "sa": "Rajju Porutham", "desc": "Mangalya Bhagyam and longevity of the bond (Crucial)."},
    {"key": "vedha", "ta": "வேதைப் பொருத்தம்", "sa": "Vedha Porutham", "desc": "Absence of mutual affliction or adversity."},
]

TITHI_NAMES = [
    "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shasthi", "Saptami",
    "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Pournami",
    "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shasthi", "Saptami",
    "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
]

TITHI_NAMES_TA = [
    "பிரதமை", "துவிதியை", "திருதியை", "சதுர்த்தி", "பஞ்சமி", "சஷ்டி", "சப்தமி",
    "அஷ்டமி", "நவமி", "தசமி", "ஏகாதசி", "துவாதசி", "திரயோதசி", "சதுர்த்தசி", "பௌர்ணமி",
    "பிரதமை", "துவிதியை", "திருதியை", "சதுர்த்தி", "பஞ்சமி", "சஷ்டி", "சப்தமி",
    "அஷ்டமி", "நவமி", "தசமி", "ஏகாதசி", "துவாதசி", "திரயோதசி", "சதுர்த்தசி", "அமாவாசை"
]

VAARAM_NAMES = {
    0: {"en": "Sunday", "sa": "Ravivasara", "ta": "ஞாயிற்றுக்கிழமை"},
    1: {"en": "Monday", "sa": "Somavasara", "ta": "திங்கட்கிழமை"},
    2: {"en": "Tuesday", "sa": "Mangalavasara", "ta": "செவ்வாய்க்கிழமை"},
    3: {"en": "Wednesday", "sa": "Budhavasara", "ta": "புதன்கிழமை"},
    4: {"en": "Thursday", "sa": "Guruvasara", "ta": "வியாழக்கிழமை"},
    5: {"en": "Friday", "sa": "Shukravasara", "ta": "வெள்ளிக்கிழமை"},
    6: {"en": "Saturday", "sa": "Shanivasara", "ta": "சனிக்கிழமை"},
}

NITHYA_YOGAS = [
    "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma",
    "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
    "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha",
    "Shukla", "Brahma", "Indra", "Vaidhriti"
]

NITHYA_YOGAS_TA = [
    "விஷ்கம்பம்", "ப்ரீதி", "ஆயுஷ்மான்", "சௌபாக்யம்", "சோபனம்", "அதிகண்டம்", "சுகர்மம்",
    "த்ருதி", "சூலம்", "கண்டம்", "விருத்தி", "த்ருவம்", "வியாகாதம்", "ஹர்ஷணம்", "வஜ்ரம்",
    "சித்தி", "வியதீபாதம்", "வரீயான்", "பரிகம்", "சிவம்", "சித்தம்", "சாத்தியம்", "சுபம்",
    "சுப்ரம்", "பிராம்மம்", "ஐந்திரம்", "வைதிருதி"
]

KARANAS = [
    "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti (Bhadra)",
    "Shakuni", "Chatushpada", "Naga", "Kinstughna"
]

KARANAS_TA = [
    "பவம்", "பாலவம்", "கௌலவம்", "தைதுலை", "கரசை", "வணிசை", "பத்திரை (விஷ்டி)",
    "சகுனி", "சதுஷ்பாதம்", "நாகவம்", "கிம்ஸ்துக்னம்"
]
