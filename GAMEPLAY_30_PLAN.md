# 30 条可玩性修改意见与执行卡

目标是把 Ranch Life 的日循环从“走到设施再点面板”扩展为可走、可观察、可复玩的生活模拟。所有卡都复用 `state.js` 的经济、AI、存档和日结边界。每张卡先做一个可回退切片，验证后再扩内容。机制参考只用于抽象玩法，不复制 `game-space`、FOMT 或 Mineraltown 的代码、美术、角色和剧情。

## 1–10：每日决策、探索与关系

### 1. 每日三件事轮换
- 目标：每天从照料、探索、贸易、社交和季节活动中完成三个可见目标。
- 30 秒循环：打开今日清单，走到对应 Canvas 地标，完成一次行动，进度立即变化。
- 数据：`daily.tasks[]`、`daily.seed`、`daily.recapChoice`、`daily.claimedTaskIds`。
- 奖励与代价：完成奖励金币和公民点，未完成失去连胜，不能重复领奖。
- 日结/牧心：记录完成项、放弃项和下一日偏好，写入 `routine` 记忆。
- 验收：桌面快捷键和 390×844 滚动清单可完成，刷新不重复发奖。

### 2. 雨后采集窗口
- 目标：在雨后短时间寻找当季山货。
- 30 秒循环：清晨看到足迹提示，进入牧场或村口，触碰发光节点并采集。
- 数据：`forage.weatherDay`、`forage.nodes[]`、`expiresDay`、`claimed`、`combo`。
- 奖励与代价：山货进入贸易链，窗口结束节点消失，失败只损失行动时间。
- 日结/牧心：记录雨后公共资源是否被利用，影响生态关系。
- 验收：晴雨场景有可见差异，行动键不会重复发物品，触控横竖屏均可采集。

### 3. 场景藏宝点
- 目标：通过真实空间理解每张地图的故事。
- 30 秒循环：靠近不显眼地标，看到提示，按行动调查，获得线索、关系或资源。
- 数据：`world.sceneFinds[sceneId][findId]`、`world.findSeed`。
- 奖励与代价：集齐一张地图的点位解锁地方志，调查消耗时间。
- 日结/牧心：显示新发现，记忆引用发现地点。
- 验收：城市、港口、议事厅、工坊、海岛各有可走到点位，存档后仍在。

### 4. NPC 每日话题
- 目标：按时间表找到 NPC，获得有上下文的关系机会。
- 30 秒循环：追到 NPC，交谈，选择一句回应，关系即时变化。
- 数据：`npcTopics`、`social.topicDay`、`relations.npc`、`lastTalkDay`。
- 奖励与代价：首次回应增加关系，错误回应小幅降低信任，不扣金币。
- 日结/牧心：记下话题、时间和回应，形成偏好预测。
- 验收：NPC 移动后交互半径正确，换日可重新触发，移动端能打开和关闭对话。

### 5. 礼物偏好与回礼
- 目标：用农场产出建立长期关系。
- 30 秒循环：走近 NPC，打开轻量礼物栏，选择背包物品并确认。
- 数据：`giftPrefs`、`giftHistory`、`giftLog`、`giftTags`。
- 奖励与代价：偏好物 +5，普通物 +1，讨厌物 -2，回礼为种子或公民点。
- 日结/牧心：显示赠礼对象、命中率和回礼，写入社交记忆。
- 验收：库存不足禁用，单日一次，刷新和重载不重复扣物。

### 6. 订单连锁与声誉等级
- 目标：把单次交货变成稳定航线。
- 30 秒循环：港口接单、交付、查看下一单预告，安排下一天生产。
- 数据：`market.tier`、`contractStreak`、`contractChainId`、`contracts[].expiresDay`。
- 奖励与代价：连续三单提升报价，过期扣声誉和公民点，订单保留一晚后才判定过期。
- 日结/牧心：结算准时率、链条进度和过期后果，写入经济风险记忆。
- 验收：订单跨一次 `advanceDay` 保留，过期有明确声誉损失，重复交付无重复奖励。

### 7. 地方志收集册
- 目标：收集地图、山货、节日和 NPC 话题形成长期目标。
- 30 秒循环：发现新内容，日结加入地方志，在工坊或菜单查看来源。
- 数据：`collection.entries[]`、`collection.stats`、`firstSeenDay`。
- 奖励与代价：收齐一类给少量公民点或牧心信任，未发现条目只显示轮廓。
- 日结/牧心：显示本日新增和缺口，记忆把收藏当作长期兴趣。
- 验收：旧存档默认空，稳定排序，移动端正文不低于 11px 且可滚动。

### 8. 季节路线变化
- 目标：每季重新认识熟悉地图。
- 30 秒循环：观察季节入口、阻挡或装饰，走新路线，发现季节设施。
- 数据：`season`、`seasonDay`、`sceneVariants[sceneId][season]`。
- 奖励与代价：季节路线有专属资源，错季入口关闭，不能制造死路。
- 日结/牧心：记录是否适应路线，生态和社区关系受影响。
- 验收：四季切换后所有主路可达，Canvas 和 Phaser farm 切片均稳定。

### 9. 日结二选一
- 目标：决定如何解释今天的劳动成果。
- 30 秒循环：日结看三条事实，选择写入牧心或转为公共行动。
- 数据：`daily.recapChoice`、`daily.recapOptions`、`ai.trust`、`government.civicPoints`。
- 奖励与代价：牧心路线 +2 信任，公共路线 +1 公民点和社区关系，两者不可同时取。
- 日结/牧心：选择本身写入记忆，UI 显示因果。
- 验收：手动和自动睡眠均只出现一次，按钮和关闭键至少 44px。

### 10. 结局后二周目修正牌
- 目标：结局后用不同约束重玩七天。
- 30 秒循环：选择一张修正牌，完成牌面目标，解锁短后记。
- 数据：`story.postGameModifier`、`postGameProgress`、`postGameDeadline`、`postScriptsSeen`。
- 奖励与代价：修正牌有明确偏向和一个代价，不改写首周结局判定。
- 日结/牧心：追踪修正牌进度，将二周目与首周对照。
- 验收：仅在结局后出现，刷新不丢失，桌面和 390×844 均可选择和查看。

## 11–20：真实地点、NPC、节日与空间事件

### 11. 四条路牌地标任务链
- 目标：在牧场、城市、贸易港、议事厅完成修桥—交货—议事—回报链。
- 空间：每站有路牌、碰撞矩形、行动提示和实体入口。
- 数据：`quests.activeId`、`stepIndex`、`completedSteps`、`deadlineDay`、`expired`。
- 失败与回收：订单过期扣声誉，桥材保留，下一周可重接，中断按步骤恢复。
- 验收：四张 Canvas 地图真实走到地标，日结显示原因，牧心新增任务记忆。

### 12. 午后换岗 NPC 日程
- 目标：根据时段找到正确的人，获得关系和信息。
- 空间：城市市场、港口厨房、议事厅档案桌、工坊花园均为可碰撞工作点。
- 数据：`npcSchedules[npcId]`、`currentSlot`、`lastTalkDay`、`missedCount`。
- 失败与回收：错过时段只得到留言，下一时段可重遇，地图日程牌预览下一站。
- 验收：6/12/18 点状态快照显示位置变化，NPC 不堵门，跨日与重载一致。

### 13. 本周三件事公告板
- 目标：接一份公共请求，安排一周生产与路线。
- 空间：城市公告板、港口收货牌、牧场出货箱、议事厅盖章桌。
- 数据：`weeklyRequests[]`、`acceptedRequestIds`、`deliveredCounts`、`expiredRequestIds`。
- 失败与回收：周末未交付扣公民点和声誉，已收集物返还，可降奖励转下周。
- 验收：公告板是可走到的 Canvas 元素，订单跨日保存，周末日结明确结果。

### 14. 潮灯节空间活动
- 目标：在节日当天完成四个现场活动中的两个。
- 空间：港口灯船、城市彩旗广场、议事厅水章台、海岛灯塔。
- 数据：`festival.activeId`、`activityFlags`、`year`、`rewardClaimed`、`materialRefunded`。
- 失败与回收：错过当天不补发，消耗材料按规则返还，下一年同日重现。
- 验收：装饰、NPC 坐标、入口和碰撞随节日开关，日结和牧心记录结果。

### 15. NPC 生日与礼物偏好
- 目标：在真实地点找到生日 NPC，交付带标签礼物。
- 空间：蛋糕店、港口厨房、工坊花园、议事厅休息室。
- 数据：`birthdays[npcId]`、`giftTags`、`birthdayGiftedDay`、`giftResult`。
- 失败与回收：错送物品只小幅增减关系，错过生日返还，重复交付无效。
- 验收：生日 NPC 可在 Canvas 中找到，刷新和重载不重复奖励。

### 16. 雨后山路与天气地图
- 目标：利用雨后窗口采集山货，绕开积水和雾区。
- 空间：牧场山路、水洼、季节节点和港口气象牌，天气改变碰撞与日程。
- 数据：`weatherModifier`、`wetRouteUntilMinute`、`forageNodes[]`、`npcWeatherOverrides`。
- 失败与回收：窗口结束节点消失，雾中迷路耗少量时间，次日重刷。
- 验收：同一场景晴雨有可见可走差异，日结和牧心记忆一致。

### 17. 四季山货收藏册
- 目标：在六张 Canvas 地图集齐季节山货套装。
- 空间：林缘、城市花园、港口礁石、海岛潮池均有闪光节点和采集后空状态。
- 数据：`collectionBook.foundIds`、`seasonSets`、`completedRewards`、`collectedDay`。
- 失败与回收：当天节点为空，普通物保留，稀有物下一年刷新。
- 验收：至少四张地图可实际采集，缺口可见，奖励幂等并写入日结。

### 18. 贸易港船班窗口
- 目标：在稳定合作社、快速近海线和高波动远洋线间做选择。
- 空间：售票亭、装卸台、船舷甲板、贸易公告牌，船只状态有碰撞变化。
- 数据：`shippingRoutes.currentTrip`、`departAtMinute`、`arrivalDay`、`cargoManifest`。
- 失败与回收：错过班次延迟订单，货物留在出货箱，港口显示下一班时间。
- 验收：港口 Canvas 显示船只状态，时间推进改变交互性，过夜结算与订单一致。

### 19. 水渠三段证据
- 目标：亲自找到物证，再回议事厅交叉核对。
- 空间：牧场旧闸、城市档案柜、议事厅水章桌、海岛旧航标。
- 数据：`evidence.nodesFound`、`sources`、`contradictions`、`checkedAt`、`waterConclusion`。
- 失败与回收：证据不全不能结论，错误摘要不锁路线，证据跨日保留。
- 验收：物证分布在至少三张地图，顺序可变，核对改变牧心和政策提示。

### 20. 可回放的一天事件导演
- 目标：参与由 NPC 集合、移动、对白、奖励和地图效果组成的短事件。
- 空间：事件路牌、集合点、移动终点和奖励点均在 Canvas 场景。
- 数据：`sceneEvents.activeId`、`stepIndex`、`paused`、`onceFlags`、`preEventSchedules`。
- 失败与回收：离场暂停，回来继续，超时走失败分支，奖励用唯一 key 防重。
- 验收：暂停和重载可恢复，NPC 路径与特效同步，结果进入日结和牧心。

## 21–30：玩法深度、经济、移动端与工程质量

### 21. 地图空间语言
- 目标：让道路、门、交互点、采集点和不可走区域一眼可读。
- 最小切片：`SCENE_DEFS` 增加 `landmarks` 与带需求条件的 `portals`，每场景一条主路一条支路。
- 数据：`sceneId`、`bounds`、`blockers`、`portalId`、`targetScene`、`spawn`、`label`。
- 验收：入口标签可见，行动键仅在半径内触发，城市、议事厅、工坊往返不漂移。

### 22. 实时狩猎遭遇
- 目标：给海岛或山林增加 15 秒主动探索风险，避免纯菜单玩法。
- 最小切片：一种温和野生动物、一个非致命驱赶/捕获动作、15 秒窗口。
- 数据：`encounterId`、`spawnZone`、`activeFrom/to`、`health`、`alertness`、`rewardTable`。
- 数值：动作前摇 180–240ms，命中窗口 300–500ms，失败损失 3–6 体力或一次机会。
- 验收：键盘和触控完成移动→行动→成功/逃脱，切场景和失焦不会重复发奖。

### 23. 狩猎收益门槛
- 目标：狩猎是选择，不成为海岛刷钱漏洞。
- 最小切片：普通/稀有两档，每日最多一次稀有捕获，收益进入贸易链。
- 数据：`rarity`、`chance`、`baseValue`、`seasonMultiplier`、`dailyCap`、`failPenalty`。
- 数值：稀有收益不超过同日两次普通海岛采集的 1.2 倍，声誉最多 +2/日。
- 验收：固定 seed 28 天模拟后，金币、声誉、岛屿资源仍在既有区间。

### 24. NPC 空间日程与密度
- 目标：NPC 移动有生活节奏且不堵路。
- 最小切片：4 名 NPC，每人 3 时段、2 节点，用 waypoint 插值不引入寻路系统。
- 数据：`npcId`、`schedule`、`waypointId`、`radius`、`collisionPolicy`。
- 数值：关键门口 72px 内最多一个 NPC，NPC 速度为玩家 35–55%。
- 验收：6/12/18 点位置变化可见，门口可通行，跨日、暂停、切场景稳定。

### 25. 节日空间事件
- 目标：节日改变地图动线，不只弹奖励面板。
- 最小切片：一个港口集市日，摊位、装饰、临时交互点和现场订单。
- 数据：`eventId`、`season`、`day`、`sceneChanges`、`temporaryLandmarks`、`claimed`。
- 数值：节日奖励为普通日收入 0.5–0.8 倍，重复进入不重复发奖。
- 验收：结束后碰撞和入口恢复，移动端入口不被弹窗遮挡，日结记录事件。

### 26. 移动触控状态机
- 目标：方向键、行动键、进门、乘船、交互在真实触控流中不丢输入。
- 最小切片：统一 `pointerdown/up/cancel/leave/blur`，行动键 180ms 去重，方向键支持长按。
- 数据：`pointerId`、`pressedDirections`、`lastActionAt`、`orientation`、`safeAreaInsets`。
- 数值：热区至少 44px，间距至少 6px，失焦清空输入集合。
- 验收：390×844 与 844×390 各完成 20 次移动、进门、乘船、交互，console error 为 0。

### 27. 反馈事件统一化
- 目标：玩家知道不能行动的原因、奖励来源和下一步地点。
- 最小切片：入口、遭遇、订单、季节事件共用 `feedbackEvent`，Canvas 标签、toast、日结使用同一 id。
- 数据：`eventId`、`kind`、`sourceScene`、`severity`、`messageKey`、`dedupeKey`。
- 验收：失败操作 500ms 内有反馈，同一事件不重复刷屏，手机正文至少 11px。

### 28. 存档迁移与回滚
- 目标：新系统和 Phaser 迁移不损坏旧存档。
- 最小切片：schema version、缺省字段迁移、坏档备份、上一份自动存档恢复。
- 数据：`version`、`scene`、`player`、`visitedScenes`、`encounters`、`shipping`、`backupChecksum`。
- 验收：旧档、缺字段、非法数值、损坏 JSON、重复奖励、场景中强退均可恢复。

### 29. 素材与场景 manifest
- 目标：生成素材可替换，运行时不绑定单张大图。
- 最小切片：`assets/manifest.json` 记录 `id/path/scene/kind/source/license/size/version`，缺失回退程序化占位。
- 数值：移动端单场景首屏素材 ≤8MB，单张背景 ≤2MB，按场景懒加载。
- 验收：删除一个生成素材仍可玩，manifest 版本可回滚，CI 检查缺文件和超大小。

### 30. Phaser 分阶段迁移
- 目标：只迁移渲染、输入、相机和 Scene 调度，业务规则继续由 `state.js` 拥有。
- 最小切片：先迁 farm，保留 Canvas 回退，再迁城市、港口、议事厅、工坊、海岛。
- 数据：`renderMode`、`phaserSceneKey`、`stateSnapshotVersion`、`inputOwner`、`fallbackReason`。
- 验收：`npm test`、Node16 Playwright 桌面/390×844/844×390、console error、失焦恢复、存档重载均通过，state 快照无差异。

## 素材生成任务

使用指定 `imagegen_function.py` 与 `gptimage2.txt` 配置生成原创、无商标、无原作角色的四张小型素材表，分别服务于 16/17 的采集节点、22/23 的温和狩猎、18 的潮汐贸易，以及 20/25 的节日空间事件。所有素材写入 `assets/generated/`，同时登记 `assets/manifest.json`，运行时保留程序化 fallback。

## 执行约束

每条先在当前分支或隔离 worktree 做最小切片，避免一次性重写业务状态。每完成一条运行 `npm test`，涉及 UI 时再跑真实 Node16 Playwright 桌面与 390×844，检查 console error、旧存档迁移和场景切换。重复未解决的 bug 先更新 `DEBUG_HANDOFF.md`，长任务同步 `CODEX_HANDOFF.md`。
