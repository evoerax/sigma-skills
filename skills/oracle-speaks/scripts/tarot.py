#!/usr/bin/env python3
"""
Tarot Card Divination Script
Draws Tarot cards for readings
"""

import random
import argparse
import json

# Major Arcana
MAJOR_ARCANA = [
    ("major", "00-the-fool", "The Fool"),
    ("major", "01-the-magician", "The Magician"),
    ("major", "02-the-high-priestess", "The High Priestess"),
    ("major", "03-the-empress", "The Empress"),
    ("major", "04-the-emperor", "The Emperor"),
    ("major", "05-the-hierophant", "The Hierophant"),
    ("major", "06-the-lovers", "The Lovers"),
    ("major", "07-the-chariot", "The Chariot"),
    ("major", "08-strength", "Strength"),
    ("major", "09-the-hermit", "The Hermit"),
    ("major", "10-wheel-of-fortune", "Wheel of Fortune"),
    ("major", "11-justice", "Justice"),
    ("major", "12-the-hanged-man", "The Hanged Man"),
    ("major", "13-death", "Death"),
    ("major", "14-temperance", "Temperance"),
    ("major", "15-the-devil", "The Devil"),
    ("major", "16-the-tower", "The Tower"),
    ("major", "17-the-star", "The Star"),
    ("major", "18-the-moon", "The Moon"),
    ("major", "19-the-sun", "The Sun"),
    ("major", "20-judgement", "Judgement"),
    ("major", "21-the-world", "The World"),
]

# Minor Arcana suits
SUITS = ["wands", "cups", "swords", "pentacles"]
RANKS = [
    "ace",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "page",
    "knight",
    "queen",
    "king",
]


def build_deck():
    """Build the full 78-card Tarot deck"""
    deck = list(MAJOR_ARCANA)
    for suit in SUITS:
        for rank in RANKS:
            card_name = f"{rank.title()} of {suit.title()}"
            deck.append((suit, f"{rank}-of-{suit}", card_name))
    return deck


def draw_cards(num_cards=3, deck=None):
    """Draw specified number of cards"""
    if deck is None:
        deck = build_deck()

    # Shuffle deck
    shuffled = deck.copy()
    random.shuffle(shuffled)

    # Draw cards
    drawn = []
    for i in range(min(num_cards, len(shuffled))):
        suit, card_id, name = shuffled[i]
        reversed_card = random.choice([True, False])
        drawn.append(
            {
                "suit": suit,
                "card_id": card_id,
                "name": name,
                "reversed": reversed_card,
                "position": i + 1,
            }
        )

    return drawn


def get_positions(position_names):
    """Get position definitions for spread"""
    positions = {
        "past": "What has led to this situation",
        "present": "Current circumstances",
        "future": "Potential outcome",
        "situation": "The current situation",
        "obstacle": "What you're facing",
        "guidance": "What you should do",
        "outcome": "Final result",
        "challenge": "The main challenge",
        "advice": "Advice for moving forward",
        "lesson": "What you need to learn",
    }

    result = []
    for i, name in enumerate(position_names):
        result.append(
            {
                "position": i + 1,
                "name": name,
                "meaning": positions.get(name.lower(), f"Position {i + 1}"),
            }
        )
    return result


def print_reading(cards, positions=None):
    """Print the tarot reading"""
    print("\n" + "=" * 40)
    print("TAROT READING")
    print("=" * 40)

    if positions:
        print(f"\nSpread: {len(cards)} cards")
        for i, pos in enumerate(positions):
            print(f"  {pos['position']}. {pos['name']}: {pos['meaning']}")

    print("\nCards Drawn:")
    for card in cards:
        reversed_str = " (Reversed)" if card["reversed"] else ""
        print(f"  {card['position']}. {card['name']}{reversed_str}")

    # Print compact format
    print("\nCompact:")
    for card in cards:
        symbol = "↓" if card["reversed"] else "↑"
        print(f"  {card['position']}. {card['name']} {symbol}")


def main():
    parser = argparse.ArgumentParser(description="Tarot Card Divination Script")
    parser.add_argument("--cards", type=int, default=3, help="Number of cards to draw")
    parser.add_argument(
        "--positions", type=str, default="", help="Comma-separated position names"
    )
    parser.add_argument("--json", action="store_true", help="Output as JSON")

    args = parser.parse_args()

    # Build positions
    if args.positions:
        position_names = [p.strip() for p in args.positions.split(",")]
    else:
        # Default positions based on number of cards
        if args.cards == 1:
            position_names = ["situation"]
        elif args.cards == 3:
            position_names = ["past", "present", "future"]
        elif args.cards == 4:
            position_names = ["situation", "obstacle", "guidance", "outcome"]
        elif args.cards == 5:
            position_names = ["past", "present", "future", "challenge", "advice"]
        else:
            position_names = [f"Position {i + 1}" for i in range(args.cards)]

    positions = get_positions(position_names[: args.cards])
    cards = draw_cards(args.cards)

    if args.json:
        result = {"cards": cards, "positions": positions}
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print_reading(cards, positions)


if __name__ == "__main__":
    main()
