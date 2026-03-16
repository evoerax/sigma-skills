#!/usr/bin/env python3
"""
易经金钱起卦法 (三钱法)
读取 64gua_final_v4.json 文件并提供占卜功能
"""

import json
import random
import os

# 金钱起卦法 (三钱法)
# 规则：
# 3个正面 (3x3=9) -> 老阳 (变爻，记为 1)
# 3个背面 (3x2=6) -> 老阴 (变爻，记为 0)
# 2个正面1个背面 (2x3 + 1x2 = 8) -> 少阴 (不变，记为 0)
# 1个正面2个背面 (1x3 + 2x2 = 7) -> 少阳 (不变，记为 1)


def toss_coins():
    """模拟掷三枚硬币，返回分值 (6, 7, 8, 9)"""
    # 假设 1 为正面 (3分)，0 为背面 (2分)
    coins = [random.choice([3, 2]) for _ in range(3)]
    return sum(coins)


def get_yao_info(score):
    """根据分值返回爻的性质"""
    if score == 9:
        return "1", "老阳 (变)", True
    if score == 6:
        return "0", "老阴 (变)", True
    if score == 7:
        return "1", "少阳", False
    if score == 8:
        return "0", "少阴", False
    # Fallback (should not happen with random.choice([2, 3]))
    return "0", "少阴", False


def main():
    # 加载校对好的 64 卦数据
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, "64_hexagrams.json")

    try:
        with open(json_path, "r", encoding="utf-8") as f:
            gua_data = json.load(f)
    except FileNotFoundError:
        print(f"错误：未找到 {json_path} 文件，请确保文件存在。")
        return

    print("--- 易经金钱起卦法 (三钱法) ---")
    print("正在为您起卦，请静心思考您要占问的事项...\n")

    binary_id = ""
    yao_results = []
    moving_indices = []  # 记录变爻的索引 (0-5)

    # 从初爻到上爻 (1-6)
    for i in range(6):
        score = toss_coins()
        bit, desc, is_moving = get_yao_info(score)
        binary_id += bit
        yao_results.append((i, desc, is_moving))
        if is_moving:
            moving_indices.append(i)

        # 打印起卦过程
        yao_name = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"][i]
        print(f"{yao_name}: {desc} (分值: {score})")

    # 匹配卦象 (binary_id 是从初爻到上爻排列的)
    target_gua = next((g for g in gua_data if g["binary_id"] == binary_id), None)

    if not target_gua:
        print(f"\n抱歉，未能匹配到卦象 (ID: {binary_id})，请检查数据。")
        return

    print("\n" + "=" * 40)
    print(
        f"【本卦】：{target_gua['symbol']} {target_gua['name']} ({target_gua['pinyin']})"
    )
    print(f"【五行】：{target_gua['element']}")
    print(f"【卦辞】：{target_gua['gua_ci']}")
    print(f"【大象】：{target_gua['da_xiang']}")
    print(f"【现代解读】：{target_gua['modern_summary']['theme']}")
    print(f"【建议】：{target_gua['modern_summary']['advice']}")
    print("=" * 40)

    # 输出变爻爻辞
    if moving_indices:
        print("\n【变爻解析】：")
        for idx in moving_indices:
            line = target_gua["lines"][idx]
            print(f"--- {line['position']} ---")
            print(f"爻辞：{line['yao_ci']}")
            print(f"象曰：{line['xiao_xiang']}")

        # 计算并显示变卦
        related_binary = ""
        for i in range(6):
            if i in moving_indices:
                if binary_id[i] == "1":
                    related_binary += "0"
                else:
                    related_binary += "1"
            else:
                related_binary += binary_id[i]

        related_gua = next(
            (g for g in gua_data if g["binary_id"] == related_binary), None
        )
        if related_gua:
            print(
                f"\n【变卦】：{related_gua['symbol']} {related_gua['name']} ({related_gua['pinyin']})"
            )
            print(f"【卦辞】：{related_gua['gua_ci']}")
    else:
        print("\n【解析】：此卦无变爻，请以本卦卦辞为准。")

    print("\n提示：占卜结果仅供参考，请理性对待。")


if __name__ == "__main__":
    main()
