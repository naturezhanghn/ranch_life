# 首轮数值模拟报告

- 模型版本：0.1.0
- 游戏版本：0.1.0
- 随机种子：20261119
- 模拟周期：28 天

## 目标与结果

| 场景 | 首次收获日 | 7 日净收益 | 14 日净收益 | 日常体力预算 | 结果 |
| --- | ---: | ---: | ---: | ---: | --- |
| starter | 4 | 308.0 | 864.0 | 13 | 通过 |
| cash_crop | 4 | 126.0 | 790.0 | 23 | 通过 |
| time_poor | 4 | 76.0 | 328.0 | 9 | 通过 |

## 策略检查

### starter

conservative player keeps 5 turnip plots and cares for all animals

- PASS `first_harvest_within_target`
- PASS `routine_energy_within_target`
- PASS `starter_7_day_net`
- PASS `cash_14_day_net`
- PASS `non_negative_coins`

### cash_crop

expansion player moves to 10 plots and strawberries when affordable

- PASS `first_harvest_within_target`
- PASS `routine_energy_within_target`
- PASS `starter_7_day_net`
- PASS `cash_14_day_net`
- PASS `non_negative_coins`

### time_poor

player prioritizes animals and only maintains 3 turnip plots

- PASS `first_harvest_within_target`
- PASS `routine_energy_within_target`
- PASS `starter_7_day_net`
- PASS `cash_14_day_net`
- PASS `non_negative_coins`

## 作物日利润锚点

| 作物 | 日利润（金/天） |
| --- | ---: |
| turnip | 8.0 |
| potato | 10.4 |
| strawberry | 14.5 |

草莓/白萝卜的日均利润比：**1.812x**

## 结论

首轮参数通过：白萝卜在 4 天内提供现金流，土豆提高单次回报，草莓以更高投入和更晚回收换取更高日均利润；三人动物组在提供稳定日收入的同时保留每日饲料成本，玩家需要照料与经营之间的取舍。

## 模型边界

- 不模拟玩家操作精度、走位时间和菜单停留。
- 不模拟作物品质、连续轮作或市场价格事件。
- 以“多数操作可完成、资源不出现负值”为首轮目标，最终仍需真人试玩验证节奏与感知。
