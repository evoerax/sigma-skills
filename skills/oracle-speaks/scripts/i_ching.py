#!/usr/bin/env python3
"""
I Ching Divination Script
Generates hexagrams using coin or number method
"""

import random
import argparse
import json

# Trigram mapping for number method
TRIGRAMS = {
    1: {"name": "乾", "symbol": "☰", "meaning": "Heaven", "element": "Metal"},
    2: {"name": "兌", "symbol": "☱", "meaning": "Lake", "element": "Metal"},
    3: {"name": "離", "symbol": "☲", "meaning": "Fire", "element": "Fire"},
    4: {"name": "震", "symbol": "☳", "meaning": "Thunder", "element": "Wood"},
    5: {"name": "巽", "symbol": "☴", "meaning": "Wind", "element": "Wood"},
    6: {"name": "坎", "symbol": "☵", "meaning": "Water", "element": "Water"},
    7: {"name": "艮", "symbol": "☶", "meaning": "Mountain", "element": "Earth"},
    8: {"name": "坤", "symbol": "☷", "meaning": "Earth", "element": "Earth"},
}

# Line symbols
YANG = "⚊"
YIN = "⚋"


def coin_method():
    """Generate hexagram using coin method"""
    lines = []
    for i in range(6):
        # Toss three coins (2 = tail, 3 = head)
        coins = [random.choice([2, 3]) for _ in range(3)]
        total = sum(coins)

        # Determine line type
        if total == 6:  # Three tails (old yin)
            lines.append(
                {
                    "value": 6,
                    "symbol": YIN,
                    "changing": True,
                    "type": "old yin",
                    "position": i + 1,
                }
            )
        elif total == 7:  # Two tails, one head (young yin)
            lines.append(
                {
                    "value": 7,
                    "symbol": YIN,
                    "changing": False,
                    "type": "young yin",
                    "position": i + 1,
                }
            )
        elif total == 8:  # Two heads, one tail (young yang)
            lines.append(
                {
                    "value": 8,
                    "symbol": YANG,
                    "changing": False,
                    "type": "young yang",
                    "position": i + 1,
                }
            )
        elif total == 9:  # Three heads (old yang)
            lines.append(
                {
                    "value": 9,
                    "symbol": YANG,
                    "changing": True,
                    "type": "old yang",
                    "position": i + 1,
                }
            )

    return lines


def number_method():
    """Generate hexagram using number method"""
    # Generate two random numbers between 1-8
    upper_num = random.randint(1, 8)
    lower_num = random.randint(1, 8)

    upper_trigram = TRIGRAMS[upper_num]
    lower_trigram = TRIGRAMS[lower_num]

    # For simplicity, we'll create lines based on the trigram characteristics
    lines = []

    # Generate lines for lower trigram (bottom 3 lines)
    for i in range(3):
        if lower_num in [1, 3, 4, 6]:  # More yang
            lines.append(
                {
                    "value": 8,
                    "symbol": YANG,
                    "changing": False,
                    "type": "young yang",
                    "position": i + 1,
                }
            )
        else:
            lines.append(
                {
                    "value": 7,
                    "symbol": YIN,
                    "changing": False,
                    "type": "young yin",
                    "position": i + 1,
                }
            )

    # Generate lines for upper trigram (top 3 lines)
    for i in range(3, 6):
        if upper_num in [1, 3, 4, 6]:
            lines.append(
                {
                    "value": 8,
                    "symbol": YANG,
                    "changing": False,
                    "type": "young yang",
                    "position": i + 1,
                }
            )
        else:
            lines.append(
                {
                    "value": 7,
                    "symbol": YIN,
                    "changing": False,
                    "type": "young yin",
                    "position": i + 1,
                }
            )

    # Calculate changing line
    changing_line = (upper_num + lower_num) % 6
    if changing_line == 0:
        changing_line = 6

    # Make the changing line "old"
    idx = changing_line - 1
    if lines[idx]["symbol"] == YANG:
        lines[idx]["value"] = 9
        lines[idx]["changing"] = True
        lines[idx]["type"] = "old yang"
    else:
        lines[idx]["value"] = 6
        lines[idx]["changing"] = True
        lines[idx]["type"] = "old yin"

    return lines, upper_trigram, lower_trigram


def print_hexagram(lines, upper_trigram=None, lower_trigram=None):
    """Print the hexagram diagram"""
    print("\n" + "=" * 40)
    print("I CHING HEXAGRAM")
    print("=" * 40)

    if upper_trigram and lower_trigram:
        print(
            f"\nUpper Trigram: {upper_trigram['name']} ({upper_trigram['meaning']}) {upper_trigram['symbol']}"
        )
        print(
            f"Lower Trigram: {lower_trigram['name']} ({lower_trigram['meaning']}) {lower_trigram['symbol']}"
        )

    print("\nHexagram (bottom to top):")
    for i in range(5, -1, -1):
        line = lines[i]
        changing_indicator = " ← changing" if line["changing"] else ""
        print(
            f"  Line {line['position']}: {line['symbol']} {line['type']}{changing_indicator}"
        )

    # Print as a single line for easy copying
    hexagram_str = "".join([line["symbol"] for line in lines])
    print(f"\nCompact: {hexagram_str}")


def main():
    parser = argparse.ArgumentParser(description="I Ching Divination Script")
    parser.add_argument(
        "--method",
        choices=["coin", "number"],
        default="coin",
        help="Divination method: coin or number",
    )
    parser.add_argument("--json", action="store_true", help="Output as JSON")

    args = parser.parse_args()

    if args.method == "coin":
        lines = coin_method()
        upper_trigram = None
        lower_trigram = None
    else:
        lines, upper_trigram, lower_trigram = number_method()

    if args.json:
        result = {
            "method": args.method,
            "lines": lines,
            "upper_trigram": upper_trigram,
            "lower_trigram": lower_trigram,
            "hexagram_str": "".join([line["symbol"] for line in lines]),
        }
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print_hexagram(lines, upper_trigram, lower_trigram)

        # Calculate related hexagram if there are changing lines
        changing_lines = [line for line in lines if line["changing"]]
        if changing_lines:
            print("\n" + "-" * 40)
            print("CHANGING LINES DETECTED")
            print("-" * 40)
            print("Related hexagram (after changes):")
            related_lines = []
            for line in lines:
                if line["changing"]:
                    # Flip the line
                    if line["symbol"] == YANG:
                        related_lines.append(
                            {
                                "symbol": YIN,
                                "type": "young yin",
                                "position": line["position"],
                            }
                        )
                    else:
                        related_lines.append(
                            {
                                "symbol": YANG,
                                "type": "young yang",
                                "position": line["position"],
                            }
                        )
                else:
                    related_lines.append(line)

            for i in range(5, -1, -1):
                line = related_lines[i]
                print(f"  Line {line['position']}: {line['symbol']} {line['type']}")

            related_str = "".join([line["symbol"] for line in related_lines])
            print(f"\nCompact: {related_str}")


if __name__ == "__main__":
    main()
