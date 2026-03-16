#!/usr/bin/env python3
"""
Liu Yao (Six Line) Divination Script
Generates six-line hexagrams for detailed analysis
"""

import random
import argparse
import json

# Line symbols
YANG = "⚊"
YIN = "⚋"


def generate_six_lines():
    """Generate six lines using coin method"""
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
                    "chinese_name": ["初", "二", "三", "四", "五", "上"][i] + "爻",
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
                    "chinese_name": ["初", "二", "三", "四", "五", "上"][i] + "爻",
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
                    "chinese_name": ["初", "二", "三", "四", "五", "上"][i] + "爻",
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
                    "chinese_name": ["初", "二", "三", "四", "五", "上"][i] + "爻",
                }
            )

    return lines


def print_reading(lines):
    """Print the Liu Yao reading"""
    print("\n" + "=" * 40)
    print("LIU YAO (六爻) READING")
    print("=" * 40)

    print("\nSix Lines (from bottom to top):")
    for i in range(5, -1, -1):
        line = lines[i]
        changing_indicator = " ← changing" if line["changing"] else ""
        print(
            f"  {line['chinese_name']} ({line['position']}): {line['symbol']} {line['type']}{changing_indicator}"
        )

    # Print as a single line
    hexagram_str = "".join([line["symbol"] for line in lines])
    print(f"\nCompact: {hexagram_str}")

    # Count line types
    yang_count = sum(1 for line in lines if line["symbol"] == YANG)
    yin_count = 6 - yang_count
    changing_count = sum(1 for line in lines if line["changing"])

    print(f"\nStatistics:")
    print(f"  Yang lines: {yang_count}")
    print(f"  Yin lines: {yin_count}")
    print(f"  Changing lines: {changing_count}")

    # Interpret the pattern
    if changing_count == 0:
        print("\nInterpretation: Situation is stable with no major changes expected.")
    elif changing_count <= 2:
        print("\nInterpretation: Minor changes expected in specific areas.")
    elif changing_count <= 4:
        print("\nInterpretation: Significant transformation occurring.")
    else:
        print("\nInterpretation: Major life changes ahead, embrace the transformation.")


def main():
    parser = argparse.ArgumentParser(description="Liu Yao Divination Script")
    parser.add_argument("--json", action="store_true", help="Output as JSON")

    args = parser.parse_args()

    lines = generate_six_lines()

    if args.json:
        result = {
            "method": "liu_yao",
            "lines": lines,
            "hexagram_str": "".join([line["symbol"] for line in lines]),
        }
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print_reading(lines)

        # Show related hexagram if there are changing lines
        changing_lines = [line for line in lines if line["changing"]]
        if changing_lines:
            print("\n" + "-" * 40)
            print("CHANGING LINES ANALYSIS")
            print("-" * 40)

            print("Current situation:")
            for line in changing_lines:
                print(f"  {line['chinese_name']}: {line['type']} (will change)")

            print("\nFuture development:")
            related_lines = []
            for line in lines:
                if line["changing"]:
                    if line["symbol"] == YANG:
                        related_lines.append(
                            {
                                "symbol": YIN,
                                "type": "young yin",
                                "position": line["position"],
                                "chinese_name": line["chinese_name"],
                            }
                        )
                    else:
                        related_lines.append(
                            {
                                "symbol": YANG,
                                "type": "young yang",
                                "position": line["position"],
                                "chinese_name": line["chinese_name"],
                            }
                        )
                else:
                    related_lines.append(line)

            for i in range(5, -1, -1):
                line = related_lines[i]
                print(f"  {line['chinese_name']}: {line['symbol']} {line['type']}")


if __name__ == "__main__":
    main()
