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
        # Kalai Magal parity: Mars gives Venus bindus in 3,5,6,9,11,12
        # (BPHS 66, Santhanam edition). The earlier 3,4,6,... row shifted one
        # bindu between signs 4 and 5 from Mars; with this row all 12
        # Sarvashtakavarga totals match a Kalai Magal Type-D report.
        "Mars": [3, 5, 6, 9, 11, 12],
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

    # Map planets occupying each sign (0-indexed sign 0..11)
    planets_in_signs: Dict[int, List[str]] = {i: [] for i in range(12)}
    for p_name, s_num in sign_positions.items():
        if p_name != "Lagna":
            planets_in_signs[(s_num - 1) % 12].append(p_name)

    # Calculate Trikona Shodhana, Ekadhipatya Shodhana, and Pindas for each planet
    trikona_shodhana_dict: Dict[str, List[int]] = {}
    ekadhipatya_shodhana_dict: Dict[str, List[int]] = {}
    pindas_dict: Dict[str, Dict[str, int]] = {}

    for p_name, raw_bav in bhav_matrix.items():
        tri_bav = compute_trikona_shodhana(raw_bav)
        eka_bav = compute_ekadhipatya_shodhana(tri_bav, planets_in_signs)
        pinda = compute_pinda_scores(eka_bav, sign_positions)

        trikona_shodhana_dict[p_name] = tri_bav
        ekadhipatya_shodhana_dict[p_name] = eka_bav
        pindas_dict[p_name] = pinda

    # Sarva Shodhita totals across all 7 planets
    sarva_trikona = [sum(trikona_shodhana_dict[p][i] for p in bhav_matrix) for i in range(12)]
    sarva_ekadhipatya = [sum(ekadhipatya_shodhana_dict[p][i] for p in bhav_matrix) for i in range(12)]
    total_shodhya_pinda = sum(pindas_dict[p]["shodhya_pinda"] for p in pindas_dict)

    return {
        "bhinnashtakavarga": bhav_matrix,
        "sarvashtakavarga": sarvashtakavarga,
        "sarvashtakavarga_by_house": sarvashtakavarga_by_house,
        "total_points": sum(sarvashtakavarga),
        "trikona_shodhana": trikona_shodhana_dict,
        "ekadhipatya_shodhana": ekadhipatya_shodhana_dict,
        "pindas": pindas_dict,
        "sarva_trikona": sarva_trikona,
        "sarva_ekadhipatya": sarva_ekadhipatya,
        "total_shodhya_pinda": total_shodhya_pinda,
    }


def compute_trikona_shodhana(bav: List[int]) -> List[int]:
    """
    Applies classical Parashara Trikona Shodhana (BPHS Ch. 67) to a 12-sign bindu array.
    Trikona triads: (0,4,8), (1,5,9), (2,6,10), (3,7,11).
    """
    res = list(bav)
    triad_groups = [
        (0, 4, 8),   # Fire: Mesha, Simha, Dhanus
        (1, 5, 9),   # Earth: Vrishabha, Kanya, Makara
        (2, 6, 10),  # Air: Mithuna, Tula, Kumbha
        (3, 7, 11),  # Water: Kataka, Vrischika, Meena
    ]

    for s1, s2, s3 in triad_groups:
        v1, v2, v3 = res[s1], res[s2], res[s3]
        if v1 == v2 == v3:
            res[s1], res[s2], res[s3] = 0, 0, 0
        elif v1 > 0 and v2 > 0 and v3 > 0:
            m = min(v1, v2, v3)
            res[s1], res[s2], res[s3] = v1 - m, v2 - m, v3 - m
        else:
            zeros = sum(1 for v in [v1, v2, v3] if v == 0)
            if zeros == 1:
                if v1 == 0:
                    m = min(v2, v3)
                    res[s2], res[s3] = v2 - m, v3 - m
                elif v2 == 0:
                    m = min(v1, v3)
                    res[s1], res[s3] = v1 - m, v3 - m
                else:
                    m = min(v1, v2)
                    res[s1], res[s2] = v1 - m, v2 - m
            # If zeros == 2, no reduction
    return res


def compute_ekadhipatya_shodhana(tri_bav: List[int], planets_in_signs: Dict[int, List[str]]) -> List[int]:
    """
    Applies classical Parashara Ekadhipatya Shodhana (BPHS Ch. 68) for dual-ownership signs.
    Pairs:
    - Mars: Mesha (0) & Vrischika (7)
    - Mercury: Mithuna (2) & Kanya (5)
    - Jupiter: Dhanus (8) & Meena (11)
    - Venus: Vrishabha (1) & Tula (6)
    - Saturn: Makara (9) & Kumbha (10)
    """
    res = list(tri_bav)
    pairs = [
        (0, 7),   # Mars
        (2, 5),   # Mercury
        (8, 11),  # Jupiter
        (1, 6),   # Venus
        (9, 10),  # Saturn
    ]

    for s1, s2 in pairs:
        v1, v2 = res[s1], res[s2]
        if v1 == 0 and v2 == 0:
            continue
        p1 = len(planets_in_signs.get(s1, [])) > 0
        p2 = len(planets_in_signs.get(s2, [])) > 0

        if p1 and p2:
            # Both occupied: no reduction
            continue
        elif not p1 and not p2:
            # Neither occupied
            if v1 == v2:
                res[s1], res[s2] = 0, 0
            elif v1 > v2:
                res[s2] = 0
            else:
                res[s1] = 0
        elif p1 and not p2:
            # s1 occupied, s2 unoccupied
            if v2 > v1:
                res[s2] = v1
            else:
                res[s2] = 0
        elif not p1 and p2:
            # s2 occupied, s1 unoccupied
            if v1 > v2:
                res[s1] = v2
            else:
                res[s1] = 0

    return res


def compute_pinda_scores(eka_bav: List[int], sign_positions: Dict[str, int]) -> Dict[str, int]:
    """
    Calculates Rasi Pinda, Graha Pinda, and Shodhya Pinda (BPHS Ch. 73).
    Rasi Multipliers: [7, 10, 8, 4, 10, 5, 7, 8, 9, 5, 11, 12] for signs 1-12.
    Graha Multipliers: Sun: 5, Moon: 5, Mars: 8, Mercury: 5, Jupiter: 10, Venus: 7, Saturn: 5.
    """
    rasi_gunakaras = [7, 10, 8, 4, 10, 5, 7, 8, 9, 5, 11, 12]
    graha_gunakaras = {
        "Sun": 5, "Moon": 5, "Mars": 8, "Mercury": 5,
        "Jupiter": 10, "Venus": 7, "Saturn": 5
    }

    # 1. Rasi Pinda
    rasi_pinda = sum(eka_bav[i] * rasi_gunakaras[i] for i in range(12))

    # 2. Graha Pinda
    graha_pinda = 0
    for p_name, g_mult in graha_gunakaras.items():
        p_sign = sign_positions.get(p_name, 1) - 1  # 0-indexed
        bindus_in_sign = eka_bav[p_sign]
        graha_pinda += bindus_in_sign * g_mult

    shodhya_pinda = rasi_pinda + graha_pinda

    return {
        "rasi_pinda": rasi_pinda,
        "graha_pinda": graha_pinda,
        "shodhya_pinda": shodhya_pinda
    }

