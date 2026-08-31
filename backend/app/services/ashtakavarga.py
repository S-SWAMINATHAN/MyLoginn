"""
Ashtakavarga Calculation Engine.
Strictly adheres to classical Brihat Parashara Hora Shastra (BPHS Ch. 66–72) bindu rules.
Total Sarvashtakavarga points = 337.
"""

from typing import Dict, List, Any

# Classical BPHS Bindu Rules: Planet -> Donor -> Benefic houses from Donor (1-indexed)
ASHTAKAVARGA_RULES = {
    "Sun": {
        "Sun": [1, 2, 4, 7, 8, 9, 10, 11],
        "Moon": [3, 6, 10, 11],
        "Mars": [1, 2, 4, 7, 8, 9, 10, 11],
        "Mercury": [3, 5, 6, 9, 10, 11, 12],
        "Jupiter": [5, 6, 9, 11],
        "Venus": [6, 7, 12],
        "Saturn": [1, 2, 4, 7, 8, 9, 10, 11],
        "Lagna": [3, 4, 6, 10, 11, 12]
    },
    "Moon": {
        "Sun": [3, 6, 7, 8, 10, 11],
        "Moon": [1, 3, 6, 7, 10, 11],
        "Mars": [2, 3, 5, 6, 9, 10, 11],
        "Mercury": [1, 3, 4, 5, 7, 8, 10, 11],
        "Jupiter": [1, 4, 7, 8, 10, 11, 12],
        "Venus": [3, 4, 5, 7, 9, 10, 11],
        "Saturn": [3, 5, 6, 11],
        "Lagna": [3, 6, 10, 11]
    },
    "Mars": {
        "Sun": [3, 5, 6, 10, 11],
        "Moon": [3, 6, 11],
        "Mars": [1, 2, 4, 7, 8, 10, 11],
        "Mercury": [3, 5, 6, 11],
        "Jupiter": [6, 10, 11, 12],
        "Venus": [6, 8, 11, 12],
        "Saturn": [1, 4, 7, 8, 9, 10, 11],
        "Lagna": [1, 3, 6, 10, 11]
    },
    "Mercury": {
        "Sun": [5, 6, 9, 11, 12],
        "Moon": [2, 4, 6, 8, 10, 11],
        "Mars": [1, 2, 4, 7, 8, 9, 10, 11],
        "Mercury": [1, 3, 5, 6, 9, 10, 11, 12],
        "Jupiter": [6, 8, 11, 12],
        "Venus": [1, 2, 3, 4, 5, 8, 9, 11],
        "Saturn": [1, 2, 4, 7, 8, 9, 10, 11],
        "Lagna": [1, 2, 4, 6, 8, 10, 11]
    },
    "Jupiter": {
        "Sun": [1, 2, 3, 4, 7, 8, 9, 10, 11],
        "Moon": [2, 5, 7, 9, 11],
        "Mars": [1, 2, 4, 7, 8, 10, 11],
        "Mercury": [1, 2, 4, 5, 6, 9, 10, 11],
        "Jupiter": [1, 2, 3, 4, 7, 8, 10, 11],
        "Venus": [2, 5, 6, 9, 10, 11],
        "Saturn": [3, 5, 6, 12],
        "Lagna": [1, 2, 4, 5, 6, 7, 9, 10, 11]
    },
    "Venus": {
        "Sun": [8, 11, 12],
        "Moon": [1, 2, 3, 4, 5, 8, 9, 11, 12],
        "Mars": [3, 4, 6, 9, 11, 12],
        "Mercury": [3, 5, 6, 9, 11],
        "Jupiter": [5, 8, 9, 10, 11],
        "Venus": [1, 2, 3, 4, 5, 8, 9, 10, 11],
        "Saturn": [3, 4, 5, 8, 9, 10, 11],
        "Lagna": [1, 2, 3, 4, 5, 8, 9, 11]
    },
    "Saturn": {
        "Sun": [1, 2, 4, 7, 8, 10, 11],
        "Moon": [3, 6, 11],
        "Mars": [3, 5, 6, 10, 11, 12],
        "Mercury": [6, 8, 9, 10, 11, 12],
        "Jupiter": [5, 6, 11, 12],
        "Venus": [6, 11, 12],
        "Saturn": [3, 5, 6, 11],
        "Lagna": [1, 3, 4, 6, 10, 11]
    }
}

def calculate_ashtakavarga(
    lagna_sign_num: int,
    planets_by_name: Dict[str, Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Computes Bhinnashtakavarga for 7 planets and Sarvashtakavarga for 12 signs (Mesha=1 to Meena=12).
    """
    sign_positions = {}
    for p_name in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]:
        if p_name in planets_by_name:
            sign_positions[p_name] = planets_by_name[p_name]["rasi_number"]
        else:
            sign_positions[p_name] = 1
    sign_positions["Lagna"] = lagna_sign_num

    bhav_matrix: Dict[str, List[int]] = {}
    sarvashtakavarga = [0] * 12

    for recipient_planet, donors in ASHTAKAVARGA_RULES.items():
        planet_bindus = [0] * 12  # index 0=Mesha, 11=Meena
        for donor_name, benefic_houses in donors.items():
            donor_sign = sign_positions.get(donor_name, 1)
            for h in benefic_houses:
                target_sign = ((donor_sign - 1 + (h - 1)) % 12)  # 0 to 11
                planet_bindus[target_sign] += 1

        bhav_matrix[recipient_planet] = planet_bindus
        for sign_idx in range(12):
            sarvashtakavarga[sign_idx] += planet_bindus[sign_idx]

    # Sarvashtakavarga from Lagna House 1 to House 12
    sarvashtakavarga_by_house = [
        sarvashtakavarga[((lagna_sign_num - 1 + h) % 12)] for h in range(12)
    ]

    return {
        "bhinnashtakavarga": bhav_matrix,
        "sarvashtakavarga": sarvashtakavarga,
        "sarvashtakavarga_by_house": sarvashtakavarga_by_house,
        "total_points": sum(sarvashtakavarga)
    }
