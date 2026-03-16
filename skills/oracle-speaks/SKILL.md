---
name: oracle-speaks
description: |
  Comprehensive divination skill supporting multiple methods: I Ching (Yijing), Tarot, Liu Yao, and more.
  Use this whenever the user wants divination, fortune-telling, or guidance through mystical means.
  Triggers on mentions of: divination, fortune telling, I Ching, Yijing, 易经, Tarot, 塔罗牌, Liu Yao, 六爻, 占卜, 算卦, oracle, fate, destiny, guidance, reading, hexagram, cards, etc.
  Provides single or multi-card/hexagram readings with interpretation and practical guidance.
compatibility: {}
---

# Oracle Speaks

When the veil between worlds thins, the Oracle speaks. This skill provides divination guidance through multiple mystical traditions.

## When to Use This Skill

Use this skill whenever the user:
- Mentions divination, fortune-telling, or seeking guidance
- References specific divination methods (I Ching, Tarot, Liu Yao, etc.)
- Asks questions about fate, destiny, or future guidance
- Wants a "reading" or "prediction"
- Uses phrases like "what does the universe say?", "what should I do?", "guide me"
- Expresses uncertainty and seeks mystical insight

## Supported Divination Methods

### 1. I Ching (易经) - The Book of Changes
- **Method**: Coin method or number method
- **Output**: Hexagram (6 lines) with optional changing lines
- **Best for**: Life decisions, understanding situations, change analysis

### 2. Tarot Cards
- **Method**: Random card draws (1-10 cards)
- **Output**: Card spread with positions and interpretations
- **Best for**: Specific questions, past/present/future analysis

### 3. Liu Yao (六爻) - Six Lines
- **Method**: Traditional six-line divination
- **Output**: Six lines with changing analysis
- **Best for**: Detailed situational analysis

## How to Use

### Step 1: Determine the Method
Ask the user which method they prefer, or choose based on their question:
- **General guidance**: I Ching
- **Specific question**: Tarot
- **Detailed analysis**: Liu Yao

### Step 2: Generate the Divination
Use the appropriate script from the `scripts/` directory:
- `i_ching.py` - Generate I Ching hexagrams
- `tarot.py` - Draw Tarot cards
- `liu_yao.py` - Generate Liu Yao readings

### Step 3: Interpret the Results
Read the reference files in `references/` for meanings:
- `i_ching_meanings.md` - Hexagram interpretations
- `tarot_cards.md` - Card meanings
- `liu_yao_interpretations.md` - Line interpretations

### Step 4: Provide Guidance
Synthesize the reading into practical advice for the user's situation.

## Scripts

### i_ching.py
Generates I Ching hexagrams using coin or number method.
```bash
python .skills/oracle-speaks/scripts/i_ching.py --method coin
```

### tarot.py
Draws Tarot cards with optional positions.
```bash
python .skills/oracle-speaks/scripts/tarot.py --cards 3 --positions past,present,future
```

### liu_yao.py
Generates Liu Yao six-line readings.
```bash
python .skills/oracle-speaks/scripts/liu_yao.py
```

## Reference Files

### i_ching_meanings.md
Complete guide to all 64 hexagrams with:
- Hexagram names and symbols
- General meanings
- Changing line interpretations
- Practical guidance

### tarot_cards.md
Complete guide to all 78 Tarot cards with:
- Card meanings (upright and reversed)
- Suit interpretations
- Spread positions
- Reading techniques

### liu_yao_interpretations.md
Guide to six-line interpretations with:
- Line meanings
- Changing line analysis
- Combination readings

## Example Sessions

### Example 1: I Ching Reading
**User**: "I'm thinking about changing jobs, what should I do?"

**Response**:
1. Generate hexagram using coin method
2. Identify main hexagram and changing lines
3. Interpret the meaning
4. Provide guidance: "The hexagram suggests [meaning]. Consider [advice]..."

### Example 2: Tarot Reading
**User**: "What does the future hold for my relationship?"

**Response**:
1. Draw 3-card spread (past, present, future)
2. Interpret each card's position
3. Synthesize the story
4. Provide insights: "The cards show [story]. This suggests [guidance]..."

### Example 3: General Guidance
**User**: "I feel lost, guide me"

**Response**:
1. Choose appropriate method (I Ching for general guidance)
2. Generate reading
3. Provide compassionate interpretation
4. Offer practical next steps

## Reading Format

ALWAYS use this format for readings:

```
## [Method] Reading

### Question
[Restate the user's question]

### The Reading
[Show the generated hexagram/cards/lines]

### Interpretation
[Detailed interpretation of the symbols]

### Guidance
[Practical advice for the user's situation]

### Next Steps
[Actionable suggestions]
```

## Special Considerings

- **Ethics**: Never provide harmful advice. Always encourage professional help for serious issues.
- **Entertainment**: Present readings as guidance, not absolute predictions.
- **Cultural Sensitivity**: Respect different cultural beliefs about divination.
- **Privacy**: Don't ask for unnecessary personal information.

## Error Handling

If a script fails:
- Note the error to the user
- Provide a manual interpretation based on available information
- Never fabricate results

## Example Prompts

- "Give me an I Ching reading about my career"
- "Draw 3 Tarot cards for my love life"
- "What does the universe want me to know right now?"
- "I need guidance on a difficult decision"
- "Tell me my fortune"

## Output Structure

For each reading, provide:
1. **Method used**
2. **Symbols generated** (hexagram/cards/lines)
3. **Interpretation** (meaning of symbols)
4. **Guidance** (practical advice)
5. **Next steps** (actionable items)

Remember: The Oracle speaks through symbols, but you provide the human interpretation and practical guidance.