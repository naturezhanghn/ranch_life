# 主 Agent 迭代脚手架

`backlog.yaml` 是大版本的唯一任务清单。主 Agent 每轮只领取依赖已经完成的任务，向子 Agent 发送任务卡，收回变更文件清单后运行门禁，再更新任务状态。

## 一轮工作流

1. 读取 `backlog.yaml`，筛选 `status: queued` 且 `depends_on` 全部为 `done` 的任务。
2. 为每个任务生成任务卡，写明输入、交付物、允许目录、禁止目录和检查命令。
3. 子 Agent 完成后只提交允许目录内的文件，并报告测试输出和未解决问题。
4. 主 Agent 检查变更范围，执行任务卡中的门禁。失败时创建最小修复任务，禁止扩大修改范围。
5. 门禁全部通过后，将任务标记为 `done`，记录迭代报告，再领取下一批任务。

## 任务卡模板

```yaml
id: story-ch05-worker
agent: script-writer
input:
  outline: docs/story/ch05.md
  contract: docs/large-version-blueprint.md
output:
  - story/chapters/ch05.json
allowed_paths:
  - story/chapters/
  - story/reports/
checks:
  - story-ids
  - story-word-count
  - story-fallbacks
blocked_by:
  - narrative-ch05
```

## 主 Agent 的监督规则

- 一个子 Agent 只负责一个明确产物，禁止跨目录顺手重构。
- 剧情 Agent 先交节点数据和回退文本，系统 Agent 再接入运行时代码。
- 任何新增状态都必须提供默认值、旧存档迁移和幂等测试。
- 发布 Agent 只在构建、测试、剧情路径和差异检查全部通过后推送。
- 每轮保留 `reports/iteration-XX.md`，记录完成项、失败门禁和下一轮依赖。

## 当前首轮状态

员工动态、长线剧情运行时和十万字蓝图已经完成。章节正文按 `chapter-pack-01` 开始逐章生产，避免一次性把未审核长文本塞入前端。
