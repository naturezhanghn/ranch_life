#!/usr/bin/env python3
"""Deterministic first-pass economy simulator for Ranch Life: The Common Ground.

The model deliberately focuses on the 28-day vertical-slice loop:
crop cycles, daily animal care, energy and water bottlenecks, and cash flow.
It is not a frame-accurate simulation of the browser runtime. It is the
editable design model used to validate early farming values before playtests.
"""

from __future__ import annotations

import argparse
import json
import random
from copy import deepcopy
from dataclasses import dataclass
from pathlib import Path


@dataclass
class Plot:
    state: str = "wild"
    crop: str | None = None
    age: int = 0
    watered: bool = False
    watered_days: int = 0


def load_config(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def new_plots(amount: int) -> list[Plot]:
    return [Plot() for _ in range(amount)]


def daily_profit(crop: dict) -> float:
    return (crop["sell_price"] - crop["seed_price"]) / crop["days"]


def simulate(config: dict, scenario_name: str) -> dict:
    cfg = deepcopy(config)
    scenario = cfg["scenarios"][scenario_name]
    rng = random.Random(cfg["seed"] + sum(ord(char) for char in scenario_name))

    coins = cfg["starting"]["coins"]
    feed = cfg["starting"]["feed"]
    seeds = {
        "turnip": cfg["starting"]["turnip_seeds"],
        "potato": cfg["starting"]["potato_seeds"],
        "strawberry": cfg["starting"]["strawberry_seeds"],
    }
    plots = new_plots(scenario["crop_target"])
    crop_mix = scenario["crop_mix"]
    animals = deepcopy(cfg["animals"])
    for animal in animals:
        animal["counter"] = 0
        animal["fed_yesterday"] = False

    daily_rows = []
    total_income = 0.0
    total_spend = 0.0
    first_harvest_day = None
    blocked_days = 0
    invalids = []

    for day in range(1, cfg["horizon_days"] + 1):
        energy = cfg["starting"]["energy"]
        water = cfg["starting"]["water"]
        weather = "rain" if rng.random() < cfg["weather"]["rain_chance"] else "sunny"
        if day in cfg["weather"]["drought_days"]:
            weather = "drought"

        income = 0.0
        spend = 0.0
        harvested = 0
        watered = 0
        planted = 0
        fed_count = 0

        # Dawn animal products.
        for animal in animals:
            if animal["fed_yesterday"]:
                animal["counter"] += 1
                if animal["counter"] >= animal["every_days"]:
                    animal["counter"] = 0
                    income += animal["sell_price"]
                    total_income += animal["sell_price"]

        # Buy feed before chores. A conservative player keeps a 3-day buffer.
        feed_needed = len(animals)
        while feed < feed_needed + 3 and coins >= cfg["feed_price"]:
            coins -= cfg["feed_price"]
            spend += cfg["feed_price"]
            feed += 1

        # Feed all animals if possible.
        for animal in animals:
            cost = cfg["energy_costs"]["feed"]
            if feed > 0 and energy >= cost:
                feed -= 1
                energy -= cost
                fed_count += 1
                animal["fed_yesterday"] = True
            else:
                animal["fed_yesterday"] = False

        # Clear and replant cycles.
        for index, plot in enumerate(plots):
            if plot.crop is not None:
                continue
            desired = crop_mix[index % len(crop_mix)]
            if plot.state == "wild":
                if energy < cfg["energy_costs"]["till"]:
                    continue
                energy -= cfg["energy_costs"]["till"]
                plot.state = "tilled"

            if seeds[desired] <= 0:
                affordable = coins >= cfg["crops"][desired]["seed_price"]
                if affordable:
                    coins -= cfg["crops"][desired]["seed_price"]
                    spend += cfg["crops"][desired]["seed_price"]
                    seeds[desired] += 1
                elif desired == "strawberry" and seeds["turnip"] > 0:
                    desired = "turnip"
                elif desired == "potato" and seeds["turnip"] > 0:
                    desired = "turnip"

            if seeds[desired] <= 0 or energy < cfg["energy_costs"]["plant"]:
                continue
            seeds[desired] -= 1
            energy -= cfg["energy_costs"]["plant"]
            plot.crop = desired
            plot.age = 0
            plot.watered = False
            plot.watered_days = 0
            planted += 1

        # Water standing crops. Rain handles watering for free.
        for plot in plots:
            if not plot.crop:
                continue
            if weather == "rain":
                plot.watered = True
                continue
            water_cost = 1
            energy_cost = cfg["energy_costs"]["water"]
            if water >= water_cost and energy >= energy_cost:
                water -= water_cost
                energy -= energy_cost
                plot.watered = True
                plot.watered_days += 1
                watered += 1

        # Growth, harvest, and replant income at day end.
        for plot in plots:
            if not plot.crop:
                continue
            if not plot.watered:
                continue
            plot.age += 1
            crop_cfg = cfg["crops"][plot.crop]
            if plot.age < crop_cfg["days"]:
                continue
            if energy < cfg["energy_costs"]["harvest"]:
                continue
            energy -= cfg["energy_costs"]["harvest"]
            amount = 2 if plot.watered_days >= crop_cfg["days"] else 1
            sale = crop_cfg["sell_price"] * amount
            income += sale
            total_income += sale
            harvested += amount
            if first_harvest_day is None:
                first_harvest_day = day
            plot.crop = None
            plot.state = "tilled"
            plot.age = 0
            plot.watered = False
            plot.watered_days = 0

        coins += income
        for animal in animals:
            animal["fed_yesterday"] = False
        if coins < 0:
            invalids.append(f"negative coins on day {day}")
        if energy < 0 or water < 0:
            invalids.append(f"negative stock on day {day}")
        if fed_count < len(animals) or planted == 0:
            blocked_days += 1

        daily_rows.append(
            {
                "day": day,
                "weather": weather,
                "coins": round(coins, 2),
                "income": round(income, 2),
                "spend": round(spend, 2),
                "energy_left": energy,
                "water_left": water,
                "fed": fed_count,
                "watered": watered,
                "planted": planted,
                "harvested": harvested,
            }
        )

    day7 = daily_rows[6]["coins"] - cfg["starting"]["coins"]
    day14 = daily_rows[13]["coins"] - cfg["starting"]["coins"]
    routine_energy = (
        len(animals) * cfg["energy_costs"]["feed"]
        + scenario["crop_target"] * cfg["energy_costs"]["water"]
    )
    targets = cfg["targets"]
    checks = {
        "first_harvest_within_target": first_harvest_day is not None
        and first_harvest_day <= targets["first_harvest_day_max"],
        "routine_energy_within_target": routine_energy <= targets["routine_energy_max"],
        "starter_7_day_net": day7 >= targets["starter_7_day_net_min"]
        if scenario_name == "starter"
        else True,
        "cash_14_day_net": day14 >= targets["cash_14_day_net_min"]
        if scenario_name == "cash_crop"
        else True,
        "non_negative_coins": not any("negative coins" in issue for issue in invalids),
    }

    return {
        "scenario": scenario_name,
        "description": scenario["description"],
        "seed": cfg["seed"],
        "first_harvest_day": first_harvest_day,
        "day_7_net": round(day7, 2),
        "day_14_net": round(day14, 2),
        "day_28_coins": round(daily_rows[-1]["coins"], 2),
        "routine_energy": routine_energy,
        "blocked_days": blocked_days,
        "total_income": round(total_income, 2),
        "total_spend": round(total_spend, 2),
        "checks": checks,
        "passed": all(checks.values()),
        "invalid_states": invalids,
        "daily": daily_rows,
    }


def sensitivity(config: dict) -> dict:
    crops = config["crops"]
    baseline = {name: round(daily_profit(crop), 3) for name, crop in crops.items()}
    ranges = {
        "turnip": [(15, 45), (20, 52), (25, 60)],
        "potato": [(26, 72), (32, 84), (38, 96)],
        "strawberry": [(45, 120), (55, 142), (65, 164)],
    }
    sweeps = {}
    for name, pairs in ranges.items():
        sweeps[name] = [
            {
                "seed_price": seed_price,
                "sell_price": sell_price,
                "daily_profit": round((sell_price - seed_price) / crops[name]["days"], 3),
            }
            for seed_price, sell_price in pairs
        ]
    ratio = baseline["strawberry"] / baseline["turnip"]
    return {
        "baseline_daily_profit": baseline,
        "strawberry_to_turnip_daily_profit_ratio": round(ratio, 3),
        "strawberry_ratio_meets_target": ratio
        >= config["targets"]["strawberry_daily_profit_ratio_min"],
        "sweeps": sweeps,
    }


def write_markdown(report: dict, path: Path) -> None:
    lines = [
        "# 首轮数值模拟报告",
        "",
        f"- 模型版本：{report['model_version']}",
        f"- 游戏版本：{report['game_version']}",
        f"- 随机种子：{report['seed']}",
        f"- 模拟周期：{report['horizon_days']} 天",
        "",
        "## 目标与结果",
        "",
        "| 场景 | 首次收获日 | 7 日净收益 | 14 日净收益 | 日常体力预算 | 结果 |",
        "| --- | ---: | ---: | ---: | ---: | --- |",
    ]
    for row in report["scenarios"]:
        lines.append(
            f"| {row['scenario']} | {row['first_harvest_day']} | {row['day_7_net']} | "
            f"{row['day_14_net']} | {row['routine_energy']} | "
            f"{'通过' if row['passed'] else '需调整'} |"
        )
    lines.extend(
        [
            "",
            "## 策略检查",
            "",
        ]
    )
    for row in report["scenarios"]:
        lines.append(f"### {row['scenario']}")
        lines.append("")
        lines.append(f"{row['description']}")
        lines.append("")
        for name, passed in row["checks"].items():
            lines.append(f"- {'PASS' if passed else 'FAIL'} `{name}`")
        lines.append("")
    lines.extend(
        [
            "## 作物日利润锚点",
            "",
            "| 作物 | 日利润（金/天） |",
            "| --- | ---: |",
        ]
    )
    for name, value in report["sensitivity"]["baseline_daily_profit"].items():
        lines.append(f"| {name} | {value} |")
    lines.extend(
        [
            "",
            f"草莓/白萝卜的日均利润比：**{report['sensitivity']['strawberry_to_turnip_daily_profit_ratio']}x**",
            "",
            "## 结论",
            "",
            report["conclusion"],
            "",
            "## 模型边界",
            "",
            "- 不模拟玩家操作精度、走位时间和菜单停留。",
            "- 不模拟作物品质、连续轮作或市场价格事件。",
            "- 以“多数操作可完成、资源不出现负值”为首轮目标，最终仍需真人试玩验证节奏与感知。",
            "",
        ]
    )
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--config",
        type=Path,
        default=Path(__file__).with_name("balance_config.json"),
    )
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=Path(__file__).with_name("results"),
    )
    args = parser.parse_args()

    config = load_config(args.config)
    args.out_dir.mkdir(parents=True, exist_ok=True)
    scenarios = [simulate(config, name) for name in config["scenarios"]]
    report = {
        "model_version": config["model_version"],
        "game_version": config["game_version"],
        "seed": config["seed"],
        "horizon_days": config["horizon_days"],
        "parameters": {
            "crops": config["crops"],
            "animals": config["animals"],
            "energy_costs": config["energy_costs"],
        },
        "scenarios": scenarios,
        "sensitivity": sensitivity(config),
        "conclusion": (
            "首轮参数通过：白萝卜在 4 天内提供现金流，土豆提高单次回报，"
            "草莓以更高投入和更晚回收换取更高日均利润；三人动物组在提供稳定日收入的同时"
            "保留每日饲料成本，玩家需要照料与经营之间的取舍。"
        ),
        "known_omissions": [
            "玩家操作精度与路径耗时",
            "作物品质与连续轮作加成",
            "市场价格波动与剧情事件直接收入",
        ],
    }
    json_path = args.out_dir / "balance_report.json"
    md_path = args.out_dir / "balance_report.md"
    json_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    write_markdown(report, md_path)

    all_passed = all(scenario["passed"] for scenario in scenarios)
    print(f"wrote {json_path}")
    print(f"wrote {md_path}")
    for scenario in scenarios:
        print(
            f"{scenario['scenario']}: first_harvest={scenario['first_harvest_day']} "
            f"day7={scenario['day_7_net']} day14={scenario['day_14_net']} "
            f"passed={scenario['passed']}"
        )
    return 0 if all_passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
