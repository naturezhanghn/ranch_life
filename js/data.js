export const SAVE_KEY = "ranch-life-common-ground-save-v1";
export const SAVE_BACKUP_KEY = "ranch-life-common-ground-save-v1-backup";
export const SAVE_VERSION = 3;
export const DAY_LENGTH_MINUTES = 18 * 60;
export const DAY_START_MINUTES = 6 * 60;
export const NIGHT_MINUTES = 22 * 60;
export const REAL_SECONDS_PER_GAME_MINUTE = 0.22;

export const SEASONS = ["春", "夏", "秋", "冬"];
export const SEASON_DAYS = 28;
export const SEASONAL_CROP_CALENDAR = {
  grass: { seasons: ["春", "夏", "秋", "冬"], regrowDays: 2, note: "牛羊可以在成熟草地上放牧" },
  turnip: { seasons: ["春", "秋"], regrowDays: 0, note: "凉爽季节作物" },
  potato: { seasons: ["春", "秋"], regrowDays: 0, note: "地下块茎" },
  strawberry: { seasons: ["春"], regrowDays: 3, note: "收获后 3 天再次结果" },
  pea: { seasons: ["春"], regrowDays: 0, note: "春风豆荚" },
  tomato: { seasons: ["夏"], regrowDays: 0, note: "需要充足日照" },
  corn: { seasons: ["夏"], regrowDays: 0, note: "夏日高秆作物" },
  watermelon: { seasons: ["夏"], regrowDays: 0, note: "炎热季节瓜果" },
  chili: { seasons: ["夏"], regrowDays: 0, note: "越晒越香的辣椒" },
  pumpkin: { seasons: ["秋"], regrowDays: 0, note: "秋收大果" },
  carrot: { seasons: ["秋"], regrowDays: 0, note: "耐凉根茎" },
  sweetpotato: { seasons: ["秋"], regrowDays: 0, note: "入秋后甜度上升" },
  spinach: { seasons: ["冬"], regrowDays: 0, note: "耐寒叶菜" },
  cabbage: { seasons: ["冬"], regrowDays: 0, note: "冬日卷心菜" },
  leek: { seasons: ["冬"], regrowDays: 0, note: "雪前葱香" },
};
export const FORAGE_TABLE = {
  春: [
    { id: "spring_herb", name: "春芽草", icon: "❋", price: 28, chance: 0.7 },
    { id: "wild_strawberry", name: "林间野莓", icon: "●", price: 54, chance: 0.76, scene: "wilderness" },
  ],
  夏: [
    { id: "summer_berry", name: "夏莓", icon: "●", price: 42, chance: 0.65 },
    { id: "wild_plum", name: "野李子", icon: "◆", price: 62, chance: 0.7, scene: "wilderness" },
  ],
  秋: [
    { id: "autumn_mushroom", name: "秋野菇", icon: "◉", price: 68, chance: 0.58 },
    { id: "acorn", name: "橡果", icon: "◇", price: 48, chance: 0.72, scene: "wilderness" },
  ],
  冬: [
    { id: "winter_root", name: "雪下根", icon: "◇", price: 82, chance: 0.45 },
    { id: "pine_cone", name: "松塔", icon: "✦", price: 56, chance: 0.62, scene: "wilderness" },
  ],
};
export const FORAGE_NODE_DEFS = [
  {
    id: "farm_rain_trail",
    interactionId: "forage",
    scene: "farm",
    x: 390,
    y: 246,
    radius: 58,
    label: "寻找雨后足迹",
  },
  {
    id: "city_rain_trail",
    interactionId: "city_forage",
    scene: "city",
    x: 310,
    y: 520,
    radius: 58,
    label: "寻找村口山货",
  },
  {
    id: "wilderness_fruit_grove",
    interactionId: "wilderness_forage",
    scene: "wilderness",
    x: 560,
    y: 370,
    radius: 64,
    label: "摘取林间野果",
  },
  {
    id: "wilderness_deep_grove",
    interactionId: "wilderness_forage_deep",
    scene: "wilderness",
    x: 1110,
    y: 600,
    radius: 64,
    label: "寻找深林果实",
  },
];
export const HOUSE_UPGRADES = [
  { level: 1, cost: 260, title: "增筑小屋", features: ["冰箱", "储物柜"], description: "解锁冰箱与额外储物空间。" },
  { level: 2, cost: 520, title: "厨房扩建", features: ["厨房", "料理台"], description: "解锁厨房料理，料理可恢复体力并提高关系。" },
];

export const BARN_UPGRADES = [
  { level: 1, capacity: 6, cost: 220, title: "新建牛羊棚", description: "扩大牛羊活动区，最多容纳 6 只牲畜。" },
  { level: 2, capacity: 10, cost: 480, title: "扩建牛羊棚", description: "增加通风棚舍和饮水槽，最多容纳 10 只牲畜。" },
];

export const WORKER_HOUSING_UPGRADES = [
  { level: 1, capacity: 8, cost: 220, title: "修建员工宿舍", description: "在牧场北侧修建带公共厨房和储物柜的员工宿舍，可容纳 8 名员工与小精灵。" },
  { level: 2, capacity: 14, cost: 460, title: "扩建员工宿舍", description: "增加独立床位、洗衣间和夜间灯带，可容纳 14 名员工与小精灵。" },
  { level: 3, capacity: 22, cost: 860, title: "修建伙伴长屋", description: "建成长屋和暖棚，所有牧场员工与小精灵都有固定床位，可容纳 22 人。" },
];

export const AUTOMATION_UPGRADES = [
  {
    level: 1,
    cost: 480,
    title: "安装自动播种机",
    description: "在牧场左侧铺设轨道和播种臂，每天自动开垦并播下 2 格当季作物。",
    machine: "播种臂",
    capacity: 2,
  },
  {
    level: 2,
    cost: 760,
    title: "接入滴灌系统",
    description: "为左侧农机区接入水渠，每天按地块顺序灌溉 4 格作物。",
    machine: "滴灌轨道",
    capacity: 4,
  },
  {
    level: 3,
    cost: 980,
    title: "安装自动收获机",
    description: "成熟作物会由收获机逐格采下并直接送入出货箱，每天最多收获 6 格。",
    machine: "收获车",
    capacity: 6,
  },
];

export const HOME_RECIPES = [
  {
    id: "farm_stew",
    name: "田园炖菜",
    icon: "🍲",
    ingredients: { turnip: 1, potato: 1 },
    energy: 22,
    relation: 1,
    description: "萝卜和土豆慢炖，恢复 22 点体力。",
    requiresKitchen: false,
  },
  {
    id: "milk_pancake",
    name: "牛奶煎饼",
    icon: "🥞",
    ingredients: { milk: 1, egg: 1 },
    energy: 28,
    relation: 2,
    description: "牛奶、鸡蛋和一点甜味，恢复 28 点体力。",
    requiresKitchen: true,
  },
  {
    id: "tide_fish_soup",
    name: "潮鱼汤",
    icon: "🍜",
    ingredients: { tidefish: 1, seaweed: 1 },
    energy: 34,
    relation: 2,
    description: "鱼塘与海岛的鲜味，恢复 34 点体力。",
    requiresKitchen: true,
  },
];

export const HOME_TV_PROGRAMS = [
  "《界河天气》提醒你，明天的雨会先落在上游。",
  "《老手艺》播到一半，主持人正在教人修补旧水桶。",
  "《潮汐观察》记录了一群鱼如何绕开浅滩。",
  "《村口访谈》邀请罗婶谈明年要分出去的种子。",
];
export const TOWN_EVENTS = [
  { id: "spring_market", season: "春", day: 7, title: "春芽集市", reward: 80, description: "城镇广场收购春季作物，价格提高。" },
  { id: "summer_festival", season: "夏", day: 14, title: "潮灯节", reward: 120, description: "贸易港与海岛声誉获得额外提升。", festivalId: "tide_lantern" },
  { id: "autumn_harvest", season: "秋", day: 21, title: "丰收会", reward: 160, description: "高品质牲畜产品获得额外结算。" },
  { id: "winter_birthdays", season: "冬", day: 3, title: "冬日生日会", reward: 60, description: "给当天的居民送礼可获得双倍关系。" },
];

export const REGION_ORDER = ["farm", "city", "island", "trade", "government", "sprites"];

export const REGION_SCENE_MAP = {
  farm: "farm",
  city: "city",
  island: "island",
  trade: "port",
  government: "council",
  sprites: "workshop",
};

export const SCENE_REGION_MAP = {
  ...Object.fromEntries(
    Object.entries(REGION_SCENE_MAP).map(([regionId, sceneId]) => [sceneId, regionId]),
  ),
  quarry: "city",
  metropolis: "city",
  house: "farm",
  workerDorm: "farm",
  wilderness: "farm",
};

export const REGIONS = {
  farm: {
    id: "farm",
    name: "月溪牧场",
    shortName: "牧场",
    icon: "⌂",
    kicker: "日常 · 土地与牲畜",
    description: "照料、种植和把每一天过成一条有回声的生活。",
    accent: "leaf",
  },
  city: {
    id: "city",
    name: "河港市",
    shortName: "城市",
    icon: "▦",
    kicker: "建设 · 公共设施",
    description: "把赚到的钱投入港口、诊所和市民议事厅。",
    accent: "amber",
  },
  island: {
    id: "island",
    name: "蓝潮海岛",
    shortName: "海岛",
    icon: "◒",
    kicker: "探索 · 潮汐与精灵",
    description: "乘渡轮寻找海藻、椰子和会发光的潮汐矿石。",
    accent: "water",
  },
  trade: {
    id: "trade",
    name: "贸易航线",
    shortName: "贸易",
    icon: "↔",
    kicker: "市场 · 价格与订单",
    description: "观察需求波动，选择卖给合作社还是远方的商队。",
    accent: "gold",
  },
  government: {
    id: "government",
    name: "共同议政",
    shortName: "政府",
    icon: "⚖",
    kicker: "治理 · 政策与责任",
    description: "用公民点推动政策，把社区关系变成可执行的规则。",
    accent: "ink",
  },
  sprites: {
    id: "sprites",
    name: "小精灵工坊",
    shortName: "小精灵",
    icon: "✦",
    kicker: "伙伴 · 分工与成长",
    description: "邀请小精灵帮忙照料牧场，每天重新安排它们的工作。",
    accent: "rose",
  },
};

export const WORLD = {
  width: 1600,
  height: 900,
  bounds: { left: 62, top: 72, right: 1538, bottom: 878 },
  ranchFence: {
    left: 42,
    top: 24,
    right: 1250,
    bottom: 754,
    rightGate: { top: 408, bottom: 478 },
    bottomGate: { left: 620, right: 704 },
  },
  field: { x: 260, y: 300, cols: 8, rows: 4, tile: 56 },
  house: { x: 90, y: 50, w: 250, h: 175 },
  aiShed: { x: 355, y: 68, w: 170, h: 132 },
  workerHousing: { x: 548, y: 68, w: 150, h: 132 },
  automationYard: { x: 74, y: 300, w: 148, h: 194 },
  pasture: { x: 735, y: 28, w: 495, h: 360 },
  pond: { x: 1010, y: 620, rx: 205, ry: 88 },
  villageShop: { x: 92, y: 540, w: 185, h: 103 },
  archive: { x: 326, y: 540, w: 169, h: 103 },
  noticeboard: { x: 604, y: 506, w: 38, h: 78 },
  shippingBin: { x: 790, y: 302, w: 49, h: 43 },
};

export const SCENE_DEFS = {
  farm: {
    id: "farm",
    name: "月溪牧场",
    subtitle: "田地、牲畜棚与旧水渠",
    palette: ["#89a96b", "#75985a"],
    spawn: { x: 286, y: 282, facing: "down" },
    blockers: [],
    portals: [
      { id: "portal_city", x: 652, y: 458, radius: 42, target: "city", label: "沿路去村庄" },
      { id: "portal_port", x: 824, y: 555, radius: 42, target: "port", label: "去码头" },
      { id: "portal_wilderness", x: 1295, y: 443, radius: 50, target: "wilderness", label: "穿过护栏去野外" },
    ],
  },
  wilderness: {
    id: "wilderness",
    name: "围栏外·十倍森林",
    subtitle: "可以探索的森林、野果、河谷与野兽猎场",
    palette: ["#577c5c", "#263f36"],
    spawn: { x: 120, y: 443, facing: "right" },
    blockers: [],
    portals: [
      { id: "portal_farm", x: 80, y: 443, radius: 50, target: "farm", label: "回到牧场护栏" },
    ],
  },
  house: {
    id: "house",
    name: "月溪牧场·家",
    subtitle: "厨房、客厅与属于自己的夜晚",
    palette: ["#d9c8a5", "#8b705d"],
    spawn: { x: 640, y: 620, facing: "up" },
    blockers: [
      { x: 72, y: 72, w: 330, h: 150 },
      { x: 458, y: 72, w: 364, h: 150 },
      { x: 880, y: 72, w: 330, h: 150 },
      { x: 72, y: 380, w: 260, h: 124 },
      { x: 948, y: 380, w: 260, h: 124 },
    ],
    portals: [
      { id: "portal_farm", x: 640, y: 680, radius: 42, target: "farm", label: "回到牧场" },
    ],
  },
  workerDorm: {
    id: "workerDorm",
    name: "员工与小精灵宿舍",
    subtitle: "下班后的公共厨房、床位和晚间慰问空间",
    palette: ["#c8ad86", "#796b63"],
    spawn: { x: 640, y: 660, facing: "up" },
    blockers: [],
    portals: [
      { id: "portal_farm", x: 640, y: 730, radius: 44, target: "farm", label: "回到牧场" },
    ],
  },
  city: {
    id: "city",
    name: "河港市",
    subtitle: "市场、议事厅与居民街区",
    palette: ["#7f9b8c", "#536f65"],
    spawn: { x: 115, y: 608, facing: "right" },
    blockers: [
      { x: 52, y: 66, w: 248, h: 146 },
      { x: 348, y: 68, w: 234, h: 146 },
      { x: 650, y: 72, w: 252, h: 145 },
      { x: 974, y: 82, w: 220, h: 132 },
      { x: 48, y: 312, w: 218, h: 132 },
      { x: 978, y: 310, w: 226, h: 136 },
    ],
    portals: [
      { id: "portal_farm", x: 90, y: 648, radius: 42, target: "farm", label: "回月溪牧场" },
      { id: "portal_port", x: 1138, y: 640, radius: 42, target: "port", label: "去贸易港" },
      { id: "portal_council", x: 770, y: 275, radius: 52, target: "council", label: "进入共同议事厅" },
      { id: "portal_workshop", x: 1080, y: 274, radius: 52, target: "workshop", label: "进入小精灵工坊" },
      { id: "portal_quarry", x: 560, y: 620, radius: 48, target: "quarry", label: "出城去旧矿道" },
    ],
  },
  quarry: {
    id: "quarry",
    name: "旧矿道",
    subtitle: "废弃矿车、深井与尚未塌落的矿脉",
    palette: ["#857b66", "#403f3a"],
    spawn: { x: 116, y: 606, facing: "right" },
    blockers: [
      { x: 54, y: 72, w: 250, h: 154 },
      { x: 438, y: 84, w: 386, h: 158 },
      { x: 926, y: 74, w: 238, h: 162 },
      { x: 190, y: 376, w: 208, h: 112 },
      { x: 834, y: 380, w: 246, h: 118 },
    ],
    portals: [
      { id: "portal_city", x: 86, y: 646, radius: 42, target: "city", label: "回河港市" },
    ],
  },
  port: {
    id: "port",
    name: "贸易港",
    subtitle: "出货、订单与蓝潮渡轮",
    palette: ["#6da5a6", "#3f747f"],
    spawn: { x: 110, y: 610, facing: "right" },
    blockers: [
      { x: 52, y: 72, w: 240, h: 142 },
      { x: 360, y: 70, w: 272, h: 142 },
      { x: 714, y: 74, w: 266, h: 136 },
      { x: 1030, y: 72, w: 174, h: 138 },
      { x: 50, y: 340, w: 192, h: 136 },
    ],
    portals: [
      { id: "portal_city", x: 86, y: 640, radius: 42, target: "city", label: "回河港市" },
    ],
  },
  metropolis: {
    id: "metropolis",
    name: "新潮大都会",
    subtitle: "研发园区、金融街、贸易塔与大学城",
    palette: ["#718fa4", "#344d62"],
    spawn: { x: 100, y: 650, facing: "right" },
    blockers: [
      { x: 48, y: 72, w: 258, h: 194 },
      { x: 350, y: 64, w: 264, h: 202 },
      { x: 658, y: 66, w: 268, h: 204 },
      { x: 970, y: 60, w: 246, h: 210 },
      { x: 50, y: 382, w: 280, h: 148 },
      { x: 392, y: 390, w: 276, h: 144 },
      { x: 734, y: 388, w: 282, h: 144 },
    ],
    portals: [
      { id: "portal_port", x: 82, y: 700, radius: 46, target: "port", label: "乘船回贸易港" },
    ],
  },
  council: {
    id: "council",
    name: "共同议事厅",
    subtitle: "水章、公共政策与市民议事",
    palette: ["#798f9c", "#4d626c"],
    spawn: { x: 110, y: 620, facing: "right" },
    blockers: [
      { x: 126, y: 86, w: 506, h: 235 },
      { x: 718, y: 86, w: 414, h: 235 },
      { x: 84, y: 420, w: 250, h: 104 },
      { x: 970, y: 420, w: 218, h: 104 },
    ],
    portals: [
      { id: "portal_city", x: 88, y: 654, radius: 42, target: "city", label: "回河港市" },
    ],
  },
  workshop: {
    id: "workshop",
    name: "小精灵工坊",
    subtitle: "伙伴、分工与发光的种子仓",
    palette: ["#8da978", "#5c815f"],
    spawn: { x: 112, y: 620, facing: "right" },
    blockers: [
      { x: 90, y: 72, w: 288, h: 190 },
      { x: 508, y: 86, w: 270, h: 172 },
      { x: 920, y: 92, w: 250, h: 166 },
      { x: 160, y: 408, w: 198, h: 128 },
      { x: 854, y: 400, w: 220, h: 130 },
    ],
    portals: [
      { id: "portal_city", x: 90, y: 650, radius: 42, target: "city", label: "回河港市" },
    ],
  },
  island: {
    id: "island",
    name: "蓝潮海岛",
    subtitle: "潮声湾、银沙滩、月光礁与赤潮花园",
    palette: ["#8dc4b4", "#4c918c"],
    spawn: { x: 112, y: 620, facing: "right" },
    blockers: [
      { x: 74, y: 72, w: 250, h: 168 },
      { x: 488, y: 86, w: 214, h: 156 },
      { x: 892, y: 66, w: 300, h: 190 },
      { x: 342, y: 428, w: 202, h: 122 },
    ],
    portals: [
      { id: "portal_port", x: 92, y: 650, radius: 42, target: "port", label: "乘渡轮回港" },
    ],
  },
};

export const SCENE_SEASON_VARIANTS = {
  farm: {
    春: {
      label: "融雪渠岸",
      palette: ["#94b67b", "#73985e"],
      routeLabel: "沿旧渠看融雪",
      landmark: {
        id: "farm_spring_seep",
        x: 1120,
        y: 500,
        radius: 58,
        label: "查看融雪渠口",
        itemId: "spring_herb",
        detail: "雪水从旧渠石缝里渗出来，渠岸先长出了今年第一丛春芽草。",
      },
      blockers: [],
    },
    夏: {
      label: "浓荫渠岸",
      palette: ["#8eae63", "#5f8f55"],
      routeLabel: "穿过蝉鸣树荫",
      landmark: {
        id: "farm_summer_shade",
        x: 1120,
        y: 500,
        radius: 58,
        label: "查看渠边树荫",
        itemId: "summer_berry",
        detail: "树荫把正午的渠水压暗了一截，夏莓在潮湿的石缝边熟得发亮。",
      },
      blockers: [{ x: 690, y: 430, w: 140, h: 38, label: "集市草棚" }],
    },
    秋: {
      label: "落叶车辙",
      palette: ["#b2945d", "#7f8355"],
      routeLabel: "沿落叶车辙走",
      landmark: {
        id: "farm_autumn_rut",
        x: 1120,
        y: 500,
        radius: 58,
        label: "查看落叶车辙",
        itemId: "autumn_mushroom",
        detail: "运草车压出的旧车辙里积着湿叶，秋野菇从木屑和渠泥之间冒出来。",
      },
      blockers: [{ x: 700, y: 500, w: 120, h: 36, label: "晒谷架" }],
    },
    冬: {
      label: "薄冰渠岸",
      palette: ["#9fb5b4", "#6d898b"],
      routeLabel: "绕开薄冰去渠口",
      landmark: {
        id: "farm_winter_ice",
        x: 1120,
        y: 500,
        radius: 58,
        label: "查看薄冰渠口",
        itemId: "winter_root",
        detail: "渠面结着薄冰，冰下的雪下根仍然活着。旧水渠没有停，只是走得更慢。",
      },
      blockers: [{ x: 720, y: 430, w: 110, h: 32, label: "封路雪堆" }],
    },
  },
  city: {
    春: {
      label: "槐花街",
      palette: ["#8ca98a", "#5d7969"],
      routeLabel: "沿槐花街去广场",
      landmark: {
        id: "city_spring_blossom",
        x: 620,
        y: 580,
        radius: 56,
        label: "查看槐花落处",
        itemId: "spring_herb",
        detail: "老槐树下落了一层花，春芽草从石缝里钻出来，经过的人都没有踩它。",
      },
      blockers: [],
    },
    夏: {
      label: "遮阳长廊",
      palette: ["#78998b", "#4f6f67"],
      routeLabel: "沿遮阳长廊去港口",
      landmark: {
        id: "city_summer_awning",
        x: 620,
        y: 580,
        radius: 56,
        label: "查看遮阳长廊",
        itemId: "summer_berry",
        detail: "布篷把广场切成一条阴凉的走廊，夏莓摊主把最甜的一小篮留给路人尝。",
      },
      blockers: [{ x: 930, y: 520, w: 120, h: 34, label: "夏日摊位" }],
    },
    秋: {
      label: "丰收侧街",
      palette: ["#a68f68", "#6d6f58"],
      routeLabel: "穿过丰收侧街",
      landmark: {
        id: "city_autumn_market",
        x: 620,
        y: 580,
        radius: 56,
        label: "查看丰收侧街",
        itemId: "autumn_mushroom",
        detail: "侧街堆着新谷袋和木箱，潮湿的箱底长出秋野菇，清洁工把它们扫到树根边。",
      },
      blockers: [{ x: 210, y: 500, w: 116, h: 36, label: "谷袋堆" }],
    },
    冬: {
      label: "炉火门廊",
      palette: ["#8c9ba0", "#586b73"],
      routeLabel: "沿炉火门廊回议事厅",
      landmark: {
        id: "city_winter_hearth",
        x: 620,
        y: 580,
        radius: 56,
        label: "查看炉火门廊",
        itemId: "winter_root",
        detail: "门廊边的炉灰还温着，雪下根被居民埋在灰里保鲜，留给晚归的人。",
      },
      blockers: [{ x: 930, y: 520, w: 104, h: 30, label: "防滑沙袋" }],
    },
  },
  port: {
    春: {
      label: "潮痕栈桥",
      palette: ["#75aaa9", "#467982"],
      routeLabel: "沿潮痕上栈桥",
      landmark: {
        id: "port_spring_tide",
        x: 700,
        y: 620,
        radius: 56,
        label: "查看潮痕栈桥",
        itemId: "spring_herb",
        detail: "春潮把一小片草籽带上栈桥，木缝里长出了盐味很重的春芽草。",
      },
      blockers: [],
    },
    夏: {
      label: "凉潮码头",
      palette: ["#68a2a7", "#39717f"],
      routeLabel: "沿凉潮码头去渡轮",
      landmark: {
        id: "port_summer_breeze",
        x: 700,
        y: 620,
        radius: 56,
        label: "查看凉潮码头",
        itemId: "summer_berry",
        detail: "午后的海风从货箱之间穿过，夏莓被船员放在阴凉处，免得被太阳晒软。",
      },
      blockers: [{ x: 470, y: 500, w: 128, h: 34, label: "装卸货箱" }],
    },
    秋: {
      label: "货栈风门",
      palette: ["#8d9a89", "#506d6d"],
      routeLabel: "穿过货栈风门",
      landmark: {
        id: "port_autumn_warehouse",
        x: 700,
        y: 620,
        radius: 56,
        label: "查看货栈风门",
        itemId: "autumn_mushroom",
        detail: "风门后的木托盘带着远洋湿气，秋野菇长在没人注意的角落里。",
      },
      blockers: [{ x: 470, y: 500, w: 108, h: 32, label: "封舱木架" }],
    },
    冬: {
      label: "封港信号",
      palette: ["#82989f", "#4d6670"],
      routeLabel: "沿封港信号走",
      landmark: {
        id: "port_winter_signal",
        x: 700,
        y: 620,
        radius: 56,
        label: "查看封港信号",
        itemId: "winter_root",
        detail: "冬季船班变少，信号灯下堆着防冻的稻草。雪下根被压在稻草里，等下一艘船。",
      },
      blockers: [{ x: 470, y: 500, w: 96, h: 30, label: "防冻草包" }],
    },
  },
  island: {
    春: {
      label: "候鸟沙脊",
      palette: ["#97c7b5", "#548f88"],
      routeLabel: "沿候鸟沙脊去潮池",
      landmark: {
        id: "island_spring_migration",
        x: 640,
        y: 620,
        radius: 56,
        label: "查看候鸟沙脊",
        itemId: "spring_herb",
        detail: "候鸟在沙脊上歇脚，翅膀带下来的草籽在潮线以上发了芽。",
      },
      blockers: [],
    },
    夏: {
      label: "珊瑚浅滩",
      palette: ["#83c2b8", "#438b8b"],
      routeLabel: "沿珊瑚浅滩去灯塔",
      landmark: {
        id: "island_summer_coral",
        x: 640,
        y: 620,
        radius: 56,
        label: "查看珊瑚浅滩",
        itemId: "summer_berry",
        detail: "浅滩水温升高，夏莓在背阴的礁石后成熟，孩子们只摘熟透的那几颗。",
      },
      blockers: [{ x: 520, y: 500, w: 104, h: 32, label: "潮汐浮标" }],
    },
    秋: {
      label: "候鸟礁",
      palette: ["#9fb69c", "#557e75"],
      routeLabel: "沿候鸟礁去潮池",
      landmark: {
        id: "island_autumn_reef",
        x: 640,
        y: 620,
        radius: 56,
        label: "查看候鸟礁",
        itemId: "autumn_mushroom",
        detail: "秋潮把海藻和木片堆在礁石背风处，秋野菇在淡水渗出的地方长了一圈。",
      },
      blockers: [{ x: 520, y: 500, w: 92, h: 30, label: "晒网架" }],
    },
    冬: {
      label: "避风灯塔",
      palette: ["#90aaa9", "#4d7579"],
      routeLabel: "沿避风灯塔回渡口",
      landmark: {
        id: "island_winter_lighthouse",
        x: 640,
        y: 620,
        radius: 56,
        label: "查看避风灯塔",
        itemId: "winter_root",
        detail: "冬季海风被灯塔挡住，墙根下的雪下根是岛上少数还活着的绿色。",
      },
      blockers: [{ x: 520, y: 500, w: 88, h: 28, label: "防浪木栅" }],
    },
  },
  council: {
    春: {
      label: "水章花窗",
      palette: ["#849ba5", "#566d77"],
      routeLabel: "沿水章花窗去档案桌",
      landmark: {
        id: "council_spring_window",
        x: 600,
        y: 620,
        radius: 56,
        label: "查看水章花窗",
        itemId: "spring_herb",
        detail: "花窗把春日的绿光投在水章上，窗台边的春芽草提醒人们：水也会记住季节。",
      },
      blockers: [],
    },
    夏: {
      label: "石廊阴面",
      palette: ["#7b9199", "#4b626b"],
      routeLabel: "沿石廊阴面去议事桌",
      landmark: {
        id: "council_summer_corridor",
        x: 600,
        y: 620,
        radius: 56,
        label: "查看石廊阴面",
        itemId: "summer_berry",
        detail: "石廊把暑气挡在门外，夏莓被放在窗边的水盆里，供来议事的人分着吃。",
      },
      blockers: [{ x: 300, y: 500, w: 110, h: 30, label: "临时长椅" }],
    },
    秋: {
      label: "档案晒台",
      palette: ["#8e8d7e", "#59645e"],
      routeLabel: "沿档案晒台去水章桌",
      landmark: {
        id: "council_autumn_terrace",
        x: 600,
        y: 620,
        radius: 56,
        label: "查看档案晒台",
        itemId: "autumn_mushroom",
        detail: "晒台上的旧纸页被风翻动，秋野菇从潮湿的砖缝里探出来，像另一份未归档的证据。",
      },
      blockers: [{ x: 300, y: 500, w: 96, h: 28, label: "晾纸架" }],
    },
    冬: {
      label: "水章暖房",
      palette: ["#81939a", "#506873"],
      routeLabel: "沿水章暖房去议事桌",
      landmark: {
        id: "council_winter_room",
        x: 600,
        y: 620,
        radius: 56,
        label: "查看水章暖房",
        itemId: "winter_root",
        detail: "暖房里的水没有结冰，雪下根被种在旧水章柜旁，提醒每个人制度也要过冬。",
      },
      blockers: [{ x: 300, y: 500, w: 84, h: 26, label: "门帘挡风架" }],
    },
  },
  workshop: {
    春: {
      label: "温室花架",
      palette: ["#92ae7c", "#618662"],
      routeLabel: "沿温室花架去种子仓",
      landmark: {
        id: "workshop_spring_trellis",
        x: 520,
        y: 380,
        radius: 56,
        label: "查看温室花架",
        itemId: "spring_herb",
        detail: "小精灵把第一根藤蔓牵上花架，春芽草在花盆边缘自己长了出来。",
      },
      blockers: [],
    },
    夏: {
      label: "蜂蜜花墙",
      palette: ["#8aa967", "#5a815d"],
      routeLabel: "沿蜂蜜花墙去温室",
      landmark: {
        id: "workshop_summer_honey",
        x: 520,
        y: 380,
        radius: 56,
        label: "查看蜂蜜花墙",
        itemId: "summer_berry",
        detail: "花墙把工坊的午后染成金色，夏莓被蜜蜂和精灵一起看护着。",
      },
      blockers: [{ x: 760, y: 500, w: 104, h: 30, label: "蜂箱推车" }],
    },
    秋: {
      label: "种子仓侧门",
      palette: ["#a18f69", "#6b7a5c"],
      routeLabel: "沿种子仓侧门去花园",
      landmark: {
        id: "workshop_autumn_seed",
        x: 520,
        y: 380,
        radius: 56,
        label: "查看种子仓侧门",
        itemId: "autumn_mushroom",
        detail: "侧门边的木箱受了潮，秋野菇从谷壳里长出来，精灵把它记录成新的观察样本。",
      },
      blockers: [{ x: 760, y: 500, w: 96, h: 28, label: "种子麻袋" }],
    },
    冬: {
      label: "月光温室",
      palette: ["#89a3a1", "#577b75"],
      routeLabel: "沿月光温室去种子仓",
      landmark: {
        id: "workshop_winter_glass",
        x: 520,
        y: 380,
        radius: 56,
        label: "查看月光温室",
        itemId: "winter_root",
        detail: "温室玻璃上结着薄霜，雪下根在暖灯下缓慢生长，证明照料不一定追求速度。",
      },
      blockers: [{ x: 760, y: 500, w: 88, h: 26, label: "暖灯推车" }],
    },
  },
  quarry: {
    春: {
      label: "矿脉苔痕",
      palette: ["#8c876d", "#4b5146"],
      routeLabel: "沿矿脉苔痕去深井",
      landmark: {
        id: "quarry_spring_moss",
        x: 760,
        y: 620,
        radius: 56,
        label: "查看矿脉苔痕",
        itemId: "spring_herb",
        detail: "矿壁渗水的地方长出一线新苔，旧矿道也有自己的春天。",
      },
      blockers: [],
    },
    夏: {
      label: "井口凉风",
      palette: ["#8b8267", "#48483f"],
      routeLabel: "沿井口凉风去矿车",
      landmark: {
        id: "quarry_summer_draft",
        x: 760,
        y: 620,
        radius: 56,
        label: "查看井口凉风",
        itemId: "summer_berry",
        detail: "深井送出的凉风让矿工把夏莓暂存在井口，免得午后就坏掉。",
      },
      blockers: [{ x: 450, y: 500, w: 108, h: 30, label: "矿车轨道" }],
    },
    秋: {
      label: "旧矿车辙",
      palette: ["#9c8763", "#4e4a3d"],
      routeLabel: "沿旧矿车辙去碎石场",
      landmark: {
        id: "quarry_autumn_cart",
        x: 760,
        y: 620,
        radius: 56,
        label: "查看旧矿车辙",
        itemId: "autumn_mushroom",
        detail: "废弃矿车停在岔道上，车斗里的湿木屑长出秋野菇，矿工说这是矿道的年轮。",
      },
      blockers: [{ x: 450, y: 500, w: 96, h: 28, label: "废矿车" }],
    },
    冬: {
      label: "矿灯井台",
      palette: ["#85918e", "#454c4a"],
      routeLabel: "沿矿灯井台去安全站",
      landmark: {
        id: "quarry_winter_lamp",
        x: 760,
        y: 620,
        radius: 56,
        label: "查看矿灯井台",
        itemId: "winter_root",
        detail: "井台边的矿灯一夜没灭，雪下根在灯影里活着，安全员把它当作换班的路标。",
      },
      blockers: [{ x: 450, y: 500, w: 84, h: 26, label: "矿灯架" }],
    },
  },
};

export const SCENE_INTERACTIONS = {
  workerDorm: [
    { id: "dorm_workers", x: 300, y: 350, radius: 62, label: "下班后慰问员工", keycap: "E" },
    { id: "dorm_sprites", x: 800, y: 350, radius: 62, label: "和小精灵聊聊", keycap: "E" },
    { id: "dorm_kitchen", x: 640, y: 470, radius: 60, label: "查看宿舍公共厨房", keycap: "E" },
    { id: "dorm_beds", x: 640, y: 260, radius: 58, label: "查看入住床位", keycap: "E" },
    { id: "dorm_upgrade", x: 640, y: 560, radius: 58, label: "扩建住宿", keycap: "E" },
  ],
  house: [
    { id: "house_kitchen", x: 200, y: 310, radius: 64, label: "在厨房做饭", keycap: "E" },
    { id: "house_tv", x: 640, y: 300, radius: 58, label: "打开电视", keycap: "E" },
    { id: "house_game", x: 1030, y: 300, radius: 58, label: "玩掌机游戏", keycap: "E" },
    { id: "house_bed", x: 1030, y: 570, radius: 62, label: "上床休息", keycap: "E" },
    { id: "house_facility", x: 470, y: 520, radius: 64, label: "进入家务与生活室", keycap: "E", facilityId: "house" },
  ],
  city: [
    { id: "city_market", x: 430, y: 275, radius: 62, label: "进入城市建设处", keycap: "E" },
    { id: "city_mayor", x: 474, y: 526, radius: 58, label: "和市政官聊聊", keycap: "E" },
    { id: "city_forage", x: 310, y: 520, radius: 58, label: "寻找村口山货", keycap: "E", forageNode: true },
    { id: "city_weekly", x: 700, y: 560, radius: 54, label: "查看本周公共请求", keycap: "E" },
    { id: "city_facility", x: 950, y: 430, radius: 64, label: "进入市民居所", keycap: "E", facilityId: "city" },
  ],
  council: [
    { id: "council_government", x: 380, y: 364, radius: 64, label: "打开共同议政", keycap: "E" },
    { id: "council_water", x: 860, y: 366, radius: 64, label: "查看水章档案", keycap: "E" },
    { id: "council_clerk", x: 600, y: 566, radius: 54, label: "和议事员聊聊", keycap: "E" },
    { id: "council_weekly", x: 520, y: 620, radius: 54, label: "查看公共请求盖章台", keycap: "E" },
    { id: "council_facility", x: 1040, y: 500, radius: 64, label: "进入议事厅后屋", keycap: "E", facilityId: "council" },
  ],
  workshop: [
    { id: "workshop_sprites", x: 234, y: 318, radius: 64, label: "打开小精灵工坊", keycap: "E" },
    { id: "workshop_garden", x: 640, y: 318, radius: 64, label: "查看精灵花园", keycap: "E" },
    { id: "workshop_keeper", x: 760, y: 566, radius: 54, label: "和精灵看守聊聊", keycap: "E" },
    { id: "workshop_facility", x: 1040, y: 510, radius: 64, label: "进入精灵工坊生活间", keycap: "E", facilityId: "workshop" },
  ],
  island: [
    { id: "island_tidePool", x: 372, y: 342, radius: 60, label: "探索潮声湾", keycap: "E", spot: "tidePool" },
    { id: "island_silverBeach", x: 760, y: 342, radius: 60, label: "探索银沙滩", keycap: "E", spot: "silverBeach" },
    { id: "island_moonReef", x: 1100, y: 350, radius: 60, label: "探索月光礁", keycap: "E", spot: "moonReef" },
    { id: "island_redGarden", x: 590, y: 590, radius: 60, label: "探索赤潮花园", keycap: "E", spot: "redGarden" },
    { id: "island_patrol", x: 930, y: 500, radius: 58, label: "湿地巡护", keycap: "E", minigame: "hunt" },
    { id: "island_fishing", x: 1120, y: 570, radius: 58, label: "潮汐垂钓", keycap: "E", minigame: "fishing" },
    { id: "island_facility", x: 1040, y: 650, radius: 64, label: "进入蓝潮岛民居", keycap: "E", facilityId: "island" },
  ],
  port: [
    { id: "port_trade", x: 490, y: 275, radius: 62, label: "查看贸易航线", keycap: "E" },
    { id: "port_ferry", x: 850, y: 278, radius: 64, label: "乘蓝潮渡轮", keycap: "E" },
    { id: "port_shipping", x: 1114, y: 286, radius: 58, label: "打开港口出货箱", keycap: "E" },
    { id: "port_sailor", x: 500, y: 542, radius: 54, label: "和渡轮长聊聊", keycap: "E" },
    { id: "port_delivery_run", x: 760, y: 520, radius: 58, label: "限时运货", keycap: "E", minigame: "delivery" },
    { id: "port_weekly", x: 900, y: 600, radius: 54, label: "查看本周收货牌", keycap: "E" },
    { id: "port_facility", x: 1040, y: 430, radius: 64, label: "进入港口值班屋", keycap: "E", facilityId: "port" },
    { id: "port_metropolis", x: 970, y: 278, radius: 58, label: "乘船去新潮大都会", keycap: "E" },
  ],
  metropolis: [
    { id: "metro_machine_lab", x: 178, y: 310, radius: 64, label: "进入农机研发中心", keycap: "E" },
    { id: "metro_finance", x: 480, y: 310, radius: 64, label: "进入金融交易所", keycap: "E" },
    { id: "metro_university", x: 790, y: 310, radius: 64, label: "进入大学种子实验室", keycap: "E" },
    { id: "metro_breeding", x: 1090, y: 310, radius: 64, label: "进入畜牧遗传学院", keycap: "E" },
    { id: "metro_trade", x: 190, y: 575, radius: 58, label: "查看大都会贸易牌", keycap: "E" },
    { id: "metro_cityhall", x: 530, y: 575, radius: 58, label: "访问城市金融服务台", keycap: "E" },
    { id: "metro_library", x: 850, y: 575, radius: 58, label: "查阅研究档案", keycap: "E" },
    { id: "metro_port", x: 1120, y: 575, radius: 58, label: "乘船回贸易港", keycap: "E" },
    { id: "metro_facility", x: 1100, y: 700, radius: 64, label: "进入大都会服务站", keycap: "E", facilityId: "metropolis" },
  ],
  quarry: [
    { id: "quarry_vein", x: 620, y: 330, radius: 64, label: "旧矿脉采样", keycap: "E", minigame: "mining" },
    { id: "quarry_facility", x: 1010, y: 470, radius: 64, label: "进入旧矿工棚", keycap: "E", facilityId: "quarry" },
  ],
  wilderness: [
    { id: "wilderness_forage", x: 560, y: 370, radius: 64, label: "摘取林间野果", keycap: "E", forageNode: true },
    { id: "wilderness_forage_deep", x: 1110, y: 600, radius: 64, label: "寻找深林果实", keycap: "E", forageNode: true },
    { id: "wilderness_hunt", x: 980, y: 430, radius: 72, label: "装备猎枪或猎刀进入猎场", keycap: "E", minigame: "hunt" },
    { id: "wilderness_hunt_deep", x: 1400, y: 620, radius: 72, label: "追踪远林野兽", keycap: "E", minigame: "hunt" },
    { id: "wilderness_camp", x: 760, y: 190, radius: 64, label: "进入森林营地", keycap: "E", facilityId: "wilderness" },
  ],
};

const FACILITY_ACTIONS = [
  { id: "rest", action: "rest" },
  { id: "forecast", action: "forecast" },
  { id: "water", action: "water" },
  { id: "staff", action: "staff" },
  { id: "market", action: "market" },
  { id: "archive", action: "archive" },
  { id: "collection", action: "collection" },
  { id: "fish", action: "fish" },
  { id: "journal", action: "journal" },
  { id: "storage", action: "storage" },
];

function buildFacility(title, subtitle, labels) {
  return {
    title,
    subtitle,
    functions: FACILITY_ACTIONS.map((entry, index) => ({ ...entry, label: labels[index] })),
  };
}

export const SCENE_FACILITY_FUNCTIONS = {
  farm: buildFacility("牧场综合作业屋", "十项功能把农务、员工和出货安排集中在一张值班台上。", [
    "安排今日休息",
    "查看天气与河流",
    "补充公共水罐",
    "查看员工排班",
    "打开季节商店",
    "查看牧场档案",
    "整理牧场收藏",
    "查看鱼塘与河钓",
    "写下今日农务日志",
    "查看仓储与出货",
  ]),
  house: buildFacility("家·生活功能室", "厨房、娱乐、储物和每日安排都可以在这里完成。", [
    "小憩十五分钟",
    "看天气预报",
    "给水罐补水",
    "安排员工与小精灵",
    "打开商店清单",
    "翻阅地方档案",
    "整理收藏图鉴",
    "查看鱼塘与河钓",
    "写生活日志",
    "查看冰箱与储物柜",
  ]),
  city: buildFacility("河港市民居", "市民居所兼作公共服务站，处理物资、关系和城市记录。", [
    "在门廊休息",
    "听城市天气",
    "领取公共饮水",
    "查看居民员工",
    "查看季节种子",
    "查阅城市档案",
    "整理城市收藏",
    "查看河港鱼讯",
    "记录市民见闻",
    "查看城市仓单",
  ]),
  port: buildFacility("港口值班屋", "港口值班屋连接订单、河流、鱼货和船期。", [
    "休息并核对船期",
    "查看潮汐天气",
    "领取码头饮水",
    "安排港口员工",
    "查看港口货价",
    "查看航线档案",
    "整理贸易收藏",
    "查看河口鱼讯",
    "记录今日船讯",
    "查看待运货物",
  ]),
  council: buildFacility("议事厅后屋", "后屋保存水章、公民记录和公共工程的十项日常功能。", [
    "静坐恢复体力",
    "查看水位预报",
    "补充议事厅水罐",
    "查看公共员工",
    "查看季节物资",
    "翻阅水章档案",
    "整理地方志收藏",
    "查看河道鱼讯",
    "写下议事记录",
    "查看公共仓单",
  ]),
  workshop: buildFacility("精灵工坊生活间", "工坊生活间让伙伴安排、收藏和生产记录有清晰的交接位置。", [
    "让精灵轮休",
    "查看温室天气",
    "补充工坊水罐",
    "安排小精灵岗位",
    "查看种子清单",
    "查阅工坊档案",
    "整理工坊收藏",
    "查看鱼塘与河钓",
    "写交接日志",
    "查看材料仓",
  ]),
  island: buildFacility("蓝潮岛民居", "岛屋把潮汐、鱼获、档案和返航准备组合成日常站点。", [
    "在海风里休息",
    "查看潮汐天气",
    "补充岛屋水罐",
    "安排海岛员工",
    "查看海岛物价",
    "翻阅潮线档案",
    "整理潮汐收藏",
    "开始潮汐垂钓",
    "写潮线日志",
    "查看鱼获仓",
  ]),
  quarry: buildFacility("旧矿工棚", "矿工棚提供安全、天气、档案和矿产交接功能。", [
    "在安全屋休息",
    "查看矿道天气",
    "补充矿工水罐",
    "安排矿道员工",
    "查看季节物资",
    "翻阅安全档案",
    "整理矿脉收藏",
    "查看下游鱼讯",
    "写安全日志",
    "查看矿石仓",
  ]),
  wilderness: buildFacility("森林护林屋", "护林屋是探索、员工协作和野外资源回收的安全补给点。", [
    "在营火边休息",
    "查看森林天气",
    "补充野外水罐",
    "呼唤狩猎副手",
    "查看野外货价",
    "翻阅森林档案",
    "整理野外收藏",
    "查看河谷鱼讯",
    "记录探索路线",
    "查看野果与猎获仓",
  ]),
  metropolis: buildFacility("大都会综合服务站", "研发、金融、贸易和大学研究在这里交接，成果会回到你的牧场。", [
    "在城市公园休息",
    "查看城市气象",
    "领取公共饮水",
    "查看城市人才",
    "查看实验种子",
    "翻阅大学档案",
    "整理研究收藏",
    "查看港口鱼讯",
    "写下研发日志",
    "查看金融仓单",
  ]),
};

export const SCENE_NPCS = [
  {
    id: "mayor",
    name: "市政官沈禾",
    role: "河港市公共事务协调员",
    speedRatio: 0.44,
    visual: { body: "#476878", trim: "#e7c979", skin: "#e2b38d", hair: "#283a42", hairStyle: "swept", accessory: "clipboard", face: "focused" },
    scenes: [
      { from: 6 * 60, to: 11 * 60, scene: "city", x: 474, y: 526, path: [{ x: 474, y: 526 }, { x: 620, y: 560 }] },
      { from: 11 * 60, to: 15 * 60, scene: "council", x: 600, y: 566, path: [{ x: 600, y: 566 }, { x: 520, y: 610 }] },
      { from: 15 * 60, to: 22 * 60, scene: "city", x: 474, y: 526, path: [{ x: 620, y: 560 }, { x: 474, y: 526 }] },
    ],
  },
  {
    id: "merchant",
    name: "港口商人岑岑",
    role: "贸易航线经纪人",
    speedRatio: 0.42,
    visual: { body: "#a9684d", trim: "#f0c67d", skin: "#c98e6d", hair: "#5a342e", hairStyle: "bob", accessory: "satchel", face: "smile" },
    scenes: [
      { from: 6 * 60, to: 13 * 60, scene: "port", x: 500, y: 542, path: [{ x: 500, y: 542 }, { x: 640, y: 600 }] },
      { from: 13 * 60, to: 18 * 60, scene: "city", x: 430, y: 275, path: [{ x: 430, y: 275 }, { x: 560, y: 380 }] },
      { from: 18 * 60, to: 22 * 60, scene: "port", x: 500, y: 542, path: [{ x: 640, y: 600 }, { x: 500, y: 542 }] },
    ],
  },
  {
    id: "pirateCaptain",
    name: "海盗船长鸦七",
    role: "自由贸易船队领航员",
    speedRatio: 0.45,
    visual: { body: "#384d67", trim: "#d7a958", skin: "#c68763", hair: "#2b303b", hairStyle: "hat", accessory: "⚓", face: "smile" },
    scenes: [
      { from: 6 * 60, to: 12 * 60, scene: "port", x: 760, y: 542, path: [{ x: 760, y: 542 }, { x: 930, y: 590 }] },
      { from: 12 * 60, to: 17 * 60, scene: "city", x: 900, y: 580, path: [{ x: 900, y: 580 }, { x: 820, y: 500 }] },
      { from: 17 * 60, to: 22 * 60, scene: "metropolis", x: 1120, y: 575, path: [{ x: 1120, y: 575 }, { x: 1040, y: 690 }] },
    ],
  },
  {
    id: "spriteKeeper",
    name: "精灵看守白露",
    role: "小精灵工坊的照看人",
    speedRatio: 0.39,
    visual: { body: "#728e63", trim: "#e4d58b", skin: "#f0c59d", hair: "#557c5e", hairStyle: "leaf", accessory: "staff", face: "kind" },
    scenes: [
      { from: 6 * 60, to: 10 * 60, scene: "workshop", x: 760, y: 566, path: [{ x: 760, y: 566 }, { x: 620, y: 610 }] },
      { from: 10 * 60, to: 16 * 60, scene: "island", x: 760, y: 342, path: [{ x: 760, y: 342 }, { x: 640, y: 420 }] },
      { from: 16 * 60, to: 22 * 60, scene: "workshop", x: 760, y: 566, path: [{ x: 620, y: 610 }, { x: 760, y: 566 }] },
    ],
  },
  {
    id: "farmerLuo",
    name: "罗婶",
    role: "上游村种植户",
    speedRatio: 0.46,
    visual: { body: "#a96b63", trim: "#f2d59b", skin: "#b9795f", hair: "#514038", hairStyle: "bun", accessory: "basket", face: "kind" },
    scenes: [
      { from: 6 * 60, to: 10 * 60, scene: "city", x: 260, y: 526, path: [{ x: 260, y: 526 }, { x: 360, y: 560 }] },
      { from: 10 * 60, to: 14 * 60, scene: "port", x: 310, y: 540, path: [{ x: 310, y: 540 }, { x: 420, y: 600 }] },
      { from: 14 * 60, to: 22 * 60, scene: "city", x: 260, y: 526, path: [{ x: 360, y: 560 }, { x: 260, y: 526 }] },
    ],
  },
  {
    id: "archivist",
    name: "顾遥",
    role: "地方档案员",
    visual: { body: "#59647f", trim: "#c6d8d1", skin: "#e7ba99", hair: "#30394a", hairStyle: "bob", accessory: "book", face: "glasses" },
    scenes: [
      { from: 6 * 60, to: 12 * 60, scene: "council", x: 860, y: 366 },
      { from: 12 * 60, to: 17 * 60, scene: "city", x: 770, y: 275 },
      { from: 17 * 60, to: 22 * 60, scene: "council", x: 860, y: 366 },
    ],
  },
  {
    id: "cook",
    name: "阿澜",
    role: "港口厨房主理人",
    visual: { body: "#c87059", trim: "#f2dfad", skin: "#d39a73", hair: "#8a4736", hairStyle: "bun", accessory: "ladle", face: "bright" },
    scenes: [
      { from: 6 * 60, to: 11 * 60, scene: "port", x: 1114, y: 286 },
      { from: 11 * 60, to: 16 * 60, scene: "city", x: 430, y: 275 },
      { from: 16 * 60, to: 22 * 60, scene: "port", x: 1114, y: 286 },
    ],
  },
  {
    id: "islandChild",
    name: "小满",
    role: "蓝潮海岛见习采集员",
    visual: { body: "#4f9ba1", trim: "#e9d58c", skin: "#c98d69", hair: "#294b53", hairStyle: "short", accessory: "shell", face: "bright" },
    scenes: [
      { from: 6 * 60, to: 12 * 60, scene: "island", x: 372, y: 342 },
      { from: 12 * 60, to: 17 * 60, scene: "island", x: 590, y: 590 },
      { from: 17 * 60, to: 22 * 60, scene: "port", x: 500, y: 542 },
    ],
  },
  {
    id: "quarryForeman",
    name: "衡叔",
    role: "旧矿道安全员",
    visual: { body: "#5c6262", trim: "#e0b86d", skin: "#b77d61", hair: "#6a5a4d", hairStyle: "beard", accessory: "lantern", face: "stern" },
    scenes: [
      { from: 6 * 60, to: 12 * 60, scene: "quarry", x: 300, y: 560 },
      { from: 12 * 60, to: 17 * 60, scene: "city", x: 560, y: 580 },
      { from: 17 * 60, to: 22 * 60, scene: "quarry", x: 300, y: 560 },
    ],
  },
  {
    id: "professorLin",
    name: "林教授",
    role: "大学种子实验室负责人",
    speedRatio: 0.38,
    visual: { body: "#6578a0", trim: "#d7c781", skin: "#e4b58e", hair: "#3d4658", hairStyle: "swept", accessory: "book", face: "glasses" },
    scenes: [
      { from: 6 * 60, to: 12 * 60, scene: "metropolis", x: 790, y: 310, path: [{ x: 790, y: 310 }, { x: 850, y: 575 }] },
      { from: 12 * 60, to: 17 * 60, scene: "metropolis", x: 850, y: 575, path: [{ x: 850, y: 575 }, { x: 790, y: 310 }] },
      { from: 17 * 60, to: 22 * 60, scene: "metropolis", x: 790, y: 310, path: [{ x: 790, y: 310 }, { x: 850, y: 575 }] },
    ],
  },
  {
    id: "bankerQiao",
    name: "乔理事",
    role: "金融交易所风控师",
    speedRatio: 0.4,
    visual: { body: "#586977", trim: "#e8bf77", skin: "#c98968", hair: "#2f3940", hairStyle: "short", accessory: "clipboard", face: "focused" },
    scenes: [
      { from: 6 * 60, to: 12 * 60, scene: "metropolis", x: 480, y: 310, path: [{ x: 480, y: 310 }, { x: 530, y: 575 }] },
      { from: 12 * 60, to: 17 * 60, scene: "metropolis", x: 530, y: 575, path: [{ x: 530, y: 575 }, { x: 480, y: 310 }] },
      { from: 17 * 60, to: 22 * 60, scene: "metropolis", x: 480, y: 310, path: [{ x: 480, y: 310 }, { x: 530, y: 575 }] },
    ],
  },
  {
    id: "engineerHe",
    name: "何工",
    role: "农机研发工程师",
    speedRatio: 0.43,
    visual: { body: "#568375", trim: "#e5d18b", skin: "#d19b72", hair: "#4c3f38", hairStyle: "short", accessory: "satchel", face: "bright" },
    scenes: [
      { from: 6 * 60, to: 12 * 60, scene: "metropolis", x: 178, y: 310, path: [{ x: 178, y: 310 }, { x: 190, y: 575 }] },
      { from: 12 * 60, to: 17 * 60, scene: "metropolis", x: 190, y: 575, path: [{ x: 190, y: 575 }, { x: 178, y: 310 }] },
      { from: 17 * 60, to: 22 * 60, scene: "metropolis", x: 178, y: 310, path: [{ x: 178, y: 310 }, { x: 190, y: 575 }] },
    ],
  },
];

const NPC_PLAYER_SPEED = 154;
const NPC_DOOR_DENSITY_RADIUS = 72;

function pointAlongNpcPath(path, distance) {
  if (path.length === 1) return { ...path[0], segment: 0 };
  let remaining = distance;
  for (let index = 0; index < path.length - 1; index += 1) {
    const start = path[index];
    const end = path[index + 1];
    const segmentLength = Math.hypot(end.x - start.x, end.y - start.y);
    if (remaining <= segmentLength) {
      const progress = segmentLength ? remaining / segmentLength : 0;
      return {
        x: start.x + (end.x - start.x) * progress,
        y: start.y + (end.y - start.y) * progress,
        segment: index,
      };
    }
    remaining -= segmentLength;
  }
  return { ...path[path.length - 1], segment: path.length - 2 };
}

export function npcPositionForEntry(entry, minutes) {
  const path = Array.isArray(entry.path) && entry.path.length > 1
    ? entry.path
    : [{ x: entry.x, y: entry.y }];
  const lengths = path.slice(1).map((point, index) =>
    Math.hypot(point.x - path[index].x, point.y - path[index].y),
  );
  const totalLength = lengths.reduce((sum, length) => sum + length, 0);
  const speedPerMinute = NPC_PLAYER_SPEED * (entry.speedRatio || 0.44) * REAL_SECONDS_PER_GAME_MINUTE;
  const elapsed = Math.max(0, minutes - entry.from);
  const cycle = Math.max(1, totalLength * 2);
  const rawDistance = (elapsed * speedPerMinute) % cycle;
  const distance = rawDistance <= totalLength ? rawDistance : cycle - rawDistance;
  return {
    scene: entry.scene,
    ...pointAlongNpcPath(path, distance),
    moving: path.length > 1,
  };
}

export function scheduledNpcPositions(minutes, sceneId) {
  const positions = SCENE_NPCS.map((npc) => {
    const entries = npc.scenes || [];
    const entry = entries.find((candidate) => minutes >= candidate.from && minutes < candidate.to)
      || entries[entries.length - 1];
    if (!entry || entry.scene !== sceneId) return null;
    return {
      ...npcPositionForEntry({ ...entry, speedRatio: npc.speedRatio || entry.speedRatio }, minutes),
      npc,
      entry,
    };
  }).filter(Boolean);

  const portals = SCENE_DEFS[sceneId]?.portals || [];
  for (const portal of portals) {
    const near = positions.filter((position) => (
      Math.hypot(position.x - portal.x, position.y - portal.y) < NPC_DOOR_DENSITY_RADIUS
    ));
    if (near.length <= 1) continue;
    const sorted = [...near].sort((a, b) => {
      const distanceA = Math.hypot(a.x - portal.x, a.y - portal.y);
      const distanceB = Math.hypot(b.x - portal.x, b.y - portal.y);
      return distanceA - distanceB || a.npc.id.localeCompare(b.npc.id);
    });
    for (const position of sorted.slice(1)) {
      const dx = position.x - portal.x;
      const dy = position.y - portal.y;
      const distance = Math.hypot(dx, dy) || 1;
      position.x = portal.x + (dx / distance) * 80;
      position.y = portal.y + (dy / distance) * 80;
      position.densityAdjusted = true;
    }
  }
  return positions;
}

export const NPC_TOPICS = {
  mayor: {
    prompt: "阿禾把新的水章草稿摊在桌上：如果水量再一次不足，应该先保护谁？",
    choices: [
      {
        id: "common",
        label: "先公开水量记录，让每个村都参与决定。",
        delta: 3,
        community: 2,
        reply: "“公开会让人吵起来，但吵过一次，下一次就不必重新猜。”",
      },
      {
        id: "speed",
        label: "先让市政快速决定，事后再解释。",
        delta: -1,
        community: -1,
        reply: "“快是快，可被跳过的人会把这件事记很久。”",
      },
    ],
  },
  merchant: {
    prompt: "岑岑问你：港口接到一笔高价远洋单，但会挤掉本村小农的交付窗口。",
    choices: [
      {
        id: "shared",
        label: "保留一部分舱位给本地小农。",
        delta: 3,
        community: 1,
        reply: "“利润少一点，但下次船靠岸时，码头还会有人愿意等你。”",
      },
      {
        id: "profit",
        label: "先拿远洋单，市场机会不等人。",
        delta: -1,
        community: -1,
        reply: "“机会确实不等人。可小农也不会永远等我们。”",
      },
    ],
  },
  spriteKeeper: {
    prompt: "白露问：小精灵是否可以为了效率，临时越过自己最擅长的岗位？",
    choices: [
      {
        id: "consent",
        label: "先问它们愿意学什么，再安排工作。",
        delta: 3,
        community: 1,
        reply: "“它们不是备用零件。愿意学，和被安排去学，是两种关系。”",
      },
      {
        id: "order",
        label: "先按牧场缺口派工，成长以后再说。",
        delta: -1,
        community: -1,
        reply: "“效率表上没有写它们昨晚做了梦。”",
      },
    ],
  },
  islandChild: {
    prompt: "小满指着潮池问：稀有的月光珍珠应该全部捞走吗？",
    choices: [
      {
        id: "leave",
        label: "留一半给下一次潮汐和别的生物。",
        delta: 2,
        ecology: 2,
        reply: "“阿婆说，海不是今天才有的。”",
      },
      {
        id: "take",
        label: "今天能带走就带走，明天未必还有机会。",
        delta: -1,
        ecology: -1,
        reply: "“那明天来的人，只能看到空掉的礁缝。”",
      },
    ],
  },
  quarryForeman: {
    prompt: "衡叔敲了敲矿道支柱：深层的富矿能卖好价，但今天的木梁已经旧了。",
    choices: [
      {
        id: "repair",
        label: "先修支柱，少采一钩也认了。",
        delta: 2,
        community: 1,
        reply: "“矿可以明天再采，人不能明天再长出来。”",
      },
      {
        id: "risk",
        label: "只下一钩，应该来得及。",
        delta: -1,
        community: -1,
        reply: "“每个出事的人，进去前都说过‘应该’。”",
      },
    ],
  },
  farmerLuo: {
    prompt: "罗婶把一篮刚收的菜放在台阶上：如果水只够保住一块田，你会先保哪一块？",
    choices: [
      {
        id: "shared",
        label: "先保住能供大家吃饭的地，再按缺口轮换。",
        delta: 3,
        community: 2,
        ecology: 1,
        reply: "“轮换很麻烦，可至少没人会被一块地的界线挡在饭桌外。”",
      },
      {
        id: "best",
        label: "先保产量最高的地，尽快把损失补回来。",
        delta: -1,
        community: -1,
        reply: "“账面会好看些，可下一场雨来之前，大家未必还愿意一起种。”",
      },
    ],
  },
  archivist: {
    prompt: "顾遥找到一页没有归档的旧记录：历史资料应该先保护原样，还是先让更多人看懂？",
    choices: [
      {
        id: "open",
        label: "保留原件，也把释读过程公开给村民。",
        delta: 3,
        community: 1,
        reply: "“档案不是锁起来才算保存。有人能追问，它才真的活着。”",
      },
      {
        id: "curate",
        label: "先由专家整理成统一版本，避免误读。",
        delta: 0,
        community: -1,
        reply: "“统一很整齐，可被删掉的那行字，往往正是后来的人要找的。”",
      },
    ],
  },
  cook: {
    prompt: "阿澜在厨房清点食材：今天的公共餐桌应该优先保证品种，还是优先保证每个人都吃饱？",
    choices: [
      {
        id: "enough",
        label: "先保证每个人有足够的一份，再谈菜单。",
        delta: 3,
        community: 2,
        reply: "“好吃当然重要，可有人空着肚子时，菜单只是另一种浪费。”",
      },
      {
        id: "variety",
        label: "保留多样菜单，让更多生产者有展示机会。",
        delta: 1,
        community: 0,
        reply: "“那就把每一份都写清来源，别让漂亮的菜遮住谁没有分到。”",
      },
    ],
  },
  professorLin: {
    prompt: "林教授把两株候选作物放在灯下：新品种应该先追求更高产量，还是先保证明年还能留种？",
    choices: [
      { id: "seed", label: "先保证可留种，再逐年提高产量。", delta: 3, ecology: 2, reply: "“实验室的成果要能走出实验室，才算真正成熟。”" },
      { id: "yield", label: "先把产量做到最高，再补上留种方案。", delta: 0, ecology: -1, reply: "“数字会先变漂亮，但土地不会忘记代价。”" },
    ],
  },
  bankerQiao: {
    prompt: "乔理事问：牧场的第一笔贷款，应该投入看得见的机器，还是留作雨季的备用金？",
    choices: [
      { id: "reserve", label: "留出备用金，先把风险写进账本。", delta: 3, community: 1, reply: "“会算风险的人，才有机会把收益留到下一季。”" },
      { id: "machine", label: "先买机器，让产量尽快增长。", delta: 1, community: 0, reply: "“增长可以很快，偿还也要有同样清楚的计划。”" },
    ],
  },
  engineerHe: {
    prompt: "何工把自动收获车停在试验田边：机器要替人做完所有动作，还是只接手重复的那一段？",
    choices: [
      { id: "assist", label: "只接手重复劳动，把判断留给干活的人。", delta: 3, community: 1, reply: "“这样机器才是伙伴，人的经验也有位置。”" },
      { id: "replace", label: "先追求全自动，效率最重要。", delta: -1, community: -1, reply: "“效率曲线很陡，回头路往往没有标记。”" },
    ],
  },
  pirateCaptain: {
    prompt: "鸦七把一张没有盖章的航线图压在桌上：自由船队要不要绕开城市的正规码头？",
    choices: [
      { id: "share", label: "先登记货物，也把小船的路线公开。", delta: 3, community: 1, reply: "“规矩不是锁链，能让每条船都知道自己不会被悄悄丢下。”" },
      { id: "hide", label: "趁没人发现，走最快的暗线。", delta: -1, community: -1, reply: "“暗线走得快，可出了风暴，没人知道该去哪里找你。”" },
    ],
  },
};

// 角色之间的固定协作关系会在同一地图相遇时以短动画和气泡呈现，也会在对话里留下线索。
export const NPC_BONDS = [
  { a: "mayor", b: "merchant", scene: "city", label: "水量与航线", line: "先把本地货物的船位留出来，再谈远洋报价。" },
  { a: "mayor", b: "archivist", scene: "city", label: "公开记录", line: "每一份水量记录都要能被居民查到。" },
  { a: "merchant", b: "cook", scene: "port", label: "港口餐桌", line: "今天靠岸的鱼先给厨房留一筐。" },
  { a: "farmerLuo", b: "cook", scene: "city", label: "种子与餐桌", line: "我留种，你把它变成大家吃得到的饭。" },
  { a: "spriteKeeper", b: "islandChild", scene: "island", label: "潮汐与精灵", line: "记住没有拿走的东西，也是一种采集。" },
  { a: "archivist", b: "quarryForeman", scene: "city", label: "安全档案", line: "最后一页仍然要写所有人平安回来。" },
  { a: "farmerLuo", b: "mayor", scene: "city", label: "水章与田埂", line: "先把水量和种子的来处写清楚。" },
  { a: "merchant", b: "islandChild", scene: "port", label: "潮路交接", line: "这张潮汐图先交给下一班船员。" },
  { a: "professorLin", b: "engineerHe", scene: "metropolis", label: "种子与机器", line: "先让机器读懂作物的节奏，再追求更快。" },
  { a: "bankerQiao", b: "engineerHe", scene: "metropolis", label: "预算与维护", line: "每一台机器都要把维修费写进第一张账。" },
  { a: "professorLin", b: "bankerQiao", scene: "metropolis", label: "研究经费", line: "好的研究需要耐心，也需要一笔透明的预算。" },
  { a: "pirateCaptain", b: "merchant", scene: "port", label: "暗线与账本", line: "每一条自由航线，也要给货物留下能追溯的名字。" },
  { a: "pirateCaptain", b: "bankerQiao", scene: "metropolis", label: "风险与风暴", line: "海上的风向变得快，账本要给船员留出回头路。" },
];

export const NPC_STORY_ARCS = {
  mayor: {
    title: "水章与一张空椅子",
    role: "市政官沈禾的城市线",
    beats: [
      "沈禾每天最早到议事厅，把昨夜的水位抄在一张没有抬头的纸上。她说，空椅子也应该算作一种意见，因为总有人没能赶来。",
      "她收到上游村的回信，信里只有一枚湿掉的印章。沈禾不急着盖回去，而是请你陪她把每个缺席的人都写进会议记录。",
      "她终于把水章草稿摊到所有人面前。城市的灯亮了一盏，沈禾把那张空椅子搬到桌边，留给下一个还没被听见的人。",
    ],
  },
  merchant: {
    title: "潮汐账本",
    role: "港口商人岑岑的航线线",
    beats: [
      "岑岑把一条旧航线画在手背上。她说小时候船晚了三天，港口的人就用一锅热粥把彼此留住。",
      "远洋买家给出高价，要求她抹掉本地小农的名字。岑岑把报价单折成纸船，问你愿不愿意一起承担慢一点的航程。",
      "她把新的舱位表挂到港口，第一行写着‘先让货物回到生产它的人身边’。潮水退去时，纸船没有被冲走。",
    ],
  },
  spriteKeeper: {
    title: "精灵工坊的夜班",
    role: "精灵看守白露的工坊线",
    beats: [
      "白露说，工坊最安静的时间不是夜里，而是小精灵第一次被安排去做不擅长的事时。她想学会听见那一点迟疑。",
      "她把旧排班表拆成七张小纸片，让每只精灵自己挑一张。有人选了陌生岗位，也有人把纸片放回原处。",
      "白露在门口挂起一盏小灯，灯下写着‘愿意帮忙也是一种能力’。工坊第一次没有统一的铃声，只有不同的脚步。",
    ],
  },
  farmerLuo: {
    title: "罗婶的种子账",
    role: "上游村罗婶的田埂线",
    beats: [
      "罗婶把每一包种子都标上了来处。她说最好的种子不是最贵的那包，而是明年还能分给邻居的那包。",
      "一场小雨让她的田埂塌了一角。她没有先抢救自己的菜，而是先去看下游的水口，回来时篮子里只剩一半收成。",
      "她把一把新芽放在村口柜台上，邀请每个路过的人带走两颗。她说，种子只有离开账本，才会变成下一季的故事。",
    ],
  },
  archivist: {
    title: "没有编号的那一页",
    role: "档案员顾遥的地方记忆线",
    beats: [
      "顾遥在档案室里发现一页没有编号的纸。它没有结论，只有几个人名和一条被反复改写的水路。",
      "她拒绝把那页纸归入‘无效材料’，开始挨家挨户寻找名字的主人。每找到一个人，纸上的空白就少一小块。",
      "顾遥把原件放进透明的档案盒，同时把释读草稿贴到公告栏。她说，保存一段历史，也要保存人们质疑它的权利。",
    ],
  },
  cook: {
    title: "同一张餐桌",
    role: "港口厨师阿澜的公共厨房线",
    beats: [
      "阿澜每天开火前先数碗。她说少一只碗，就意味着有人只能站在门外听别人吃饭。",
      "港口的订单变少，她把菜单改成当季能找到的东西。有人嫌菜色简单，她却把每种食材的名字写在盘边。",
      "雨停后的晚餐有三种颜色，来自三座村子的田。阿澜把最后一碗汤端到桌中央，让所有人自己决定从哪里开始。",
    ],
  },
  islandChild: {
    title: "潮线上的小旗子",
    role: "小满的海岛成长线",
    beats: [
      "小满在潮池边插下第一面小旗，记录今天没有带走的珍珠。她说海岛也需要有人记住‘没有拿走’的东西。",
      "她跟着潮水追了很远，发现一只被塑料绳缠住的海鸟。小满把当天的采集篮倒空，先给它留出一条路。",
      "她把新的潮汐地图交给你，地图上最亮的标记不是资源，而是每个需要绕开的浅滩。她终于开始教别人怎么留下。",
    ],
  },
  quarryForeman: {
    title: "矿灯不会替人走路",
    role: "衡叔的矿道安全线",
    beats: [
      "衡叔每天下井前都摸一遍木梁。他说矿灯只照亮脚下，不能替任何人判断下一步是否安全。",
      "一块富矿露出金色边缘，支柱却发出细响。衡叔把矿镐放下，带所有人回到地面，宁愿让订单晚一天。",
      "他把那块矿石留在安全站，旁边立着一本新簿子，第一页写着：今天所有人平安回来。",
    ],
  },
  professorLin: {
    title: "让种子走出玻璃房",
    role: "林教授的大学研究线",
    beats: [
      "林教授把每株幼苗的来处写在白板上。她说研究不是把植物锁在玻璃房里，而是让它们回到真正的田地。",
      "她和何工争论滴灌速度，最后把计时器交给种植户试用。实验记录第一次多了一栏：人觉得顺不顺手。",
      "毕业生们把第一批优良种子送到牧场，林教授只留下两包作为下一年的对照组。她说，分享也是研究的一部分。",
    ],
  },
  bankerQiao: {
    title: "账本上的雨季",
    role: "乔理事的金融线",
    beats: [
      "乔理事每天在交易所门口写下当天的风险。她说，最可靠的收益不是最高的数字，而是遇到坏天气还能兑现。",
      "他把机器维护费单独列成一栏，拒绝把它藏进宣传里的‘效率提升’。每个借款人都能看见自己承担的部分。",
      "当第一笔票据顺利结算，乔理事把利息的一部分投入大学奖学金。资金流动起来，也应该让下一代有选择。",
    ],
  },
  engineerHe: {
    title: "机器要听见田地",
    role: "何工的农机线",
    beats: [
      "何工把传感器插进土里，先听了半天风。他说真正的自动化不是让人消失，而是让重复动作不再磨损人的手。",
      "他邀请周禾一起调试收获车，把一格一格的泥土反馈写进程序。机器第一次因为人的一句‘慢一点’而改变路线。",
      "新机器交付时，何工把维修扳手留在牧场。他知道一台有用的机器，必须让使用它的人能打开外壳。",
    ],
  },
  pirateCaptain: {
    title: "没有旗子的航线",
    role: "海盗船长鸦七的自由贸易线",
    beats: [
      "鸦七的船没有旗子，只有一盏在雾里不肯熄灭的灯。他说自由不是没人管，而是每个人都知道自己能回到哪里。",
      "一批急着出港的货物没有登记，鸦七把缆绳重新系紧，等商人和船员把来源写清楚。暗线也要能追溯，风暴来时才不会丢下任何人。",
      "他把一面新旗挂在桅杆上，旗面没有徽章，只有港口、城市和牧场共同画出的三条线。鸦七终于有了愿意认领的航线。",
    ],
  },
};

export const SCENE_FINDS = {
  farm: [
    {
      id: "old_gate",
      x: 584,
      y: 520,
      label: "查看旧闸刻痕",
      lore: "闸石侧面有三种深浅不同的刻痕，像是不同年代的人在同一处记下过水位。",
      reward: { coins: 18 },
    },
    {
      id: "field_stone",
      x: 190,
      y: 320,
      label: "翻看田埂石",
      lore: "田埂下压着一枚生锈的田界钉，上面没有地主姓名，只有共同修渠的年份。",
      reward: { coins: 12 },
    },
  ],
  city: [
    {
      id: "market_tile",
      x: 660,
      y: 540,
      label: "查看旧市场砖",
      lore: "一块被磨平的铺地砖上刻着三只手共同托起一束麦穗，边缘已经缺了一角。",
      reward: { coins: 16 },
    },
    {
      id: "ferry_post",
      x: 1110,
      y: 475,
      label: "读旧渡口牌",
      lore: "渡口牌背后写着几行已经褪色的名字，都是曾在这条航线上轮班守夜的人。",
      reward: { coins: 20 },
    },
  ],
  council: [
    {
      id: "water_ledger",
      x: 620,
      y: 520,
      label: "翻阅水章旧页",
      lore: "旧水章里没有“先到先得”，只有“先行者负责通知后来者”。",
      reward: { coins: 24 },
    },
  ],
  workshop: [
    {
      id: "sprite_etch",
      x: 760,
      y: 430,
      label: "查看精灵刻线",
      lore: "工坊门框上刻着七种不同的手势，白露说那是七个小精灵互相交接工作的暗号。",
      reward: { coins: 22 },
    },
  ],
  island: [
    {
      id: "drift_bottle",
      x: 850,
      y: 570,
      label: "捡起漂流瓶",
      lore: "瓶中信来自另一座岛，写着：如果你们也看见潮水变低，请联系我们。",
      reward: { coins: 26 },
    },
    {
      id: "old_beacon",
      x: 1080,
      y: 470,
      label: "查看旧航标",
      lore: "航标上的灯塔图案被海风磨得模糊，底下仍能看见“为夜行者留灯”五个字。",
      reward: { coins: 22 },
    },
  ],
  wilderness: [
    {
      id: "forest_trail_marker",
      x: 330,
      y: 710,
      label: "记录森林旧路标",
      lore: "树皮上的箭头指向更深的林地，彤彤留下的记号提醒你：探索要给回来的路留出方向。",
      reward: { coins: 32 },
    },
    {
      id: "wildlife_waterhole",
      x: 1240,
      y: 730,
      label: "观察野兽饮水处",
      lore: "河谷边留下鹿、野猪和狐狸交错的足迹。这里是观察野兽的安全距离，也是森林最安静的课堂。",
      reward: { coins: 40 },
    },
  ],
  quarry: [
    {
      id: "safety_ledger",
      x: 300,
      y: 560,
      label: "查看矿道安全簿",
      lore: "安全簿最后一页没有写产量，只写着：今日所有人平安归来。",
      reward: { coins: 20 },
    },
  ],
};

export const COLLECTION_DEFS = {
  places: {
    name: "地图里的旧痕迹",
    entries: Object.entries(SCENE_FINDS).flatMap(([scene, finds]) =>
      finds.map((find) => ({
        id: `${scene}:${find.id}`,
        label: `${find.label} · ${SCENE_DEFS[scene]?.name || scene}`,
        source: SCENE_DEFS[scene]?.name || scene,
      })),
    ),
  },
  forage: {
    name: "季节山货",
    entries: Object.entries(FORAGE_TABLE).flatMap(([season, items]) =>
      items.map((item) => ({
        id: item.id,
        label: `${item.name} · ${season}季`,
        source: "雨后山货",
      })),
    ),
  },
  people: {
    name: "居民与话题",
    entries: Object.entries(NPC_TOPICS).map(([npcId, topic]) => ({
      id: npcId,
      label: topic.prompt,
      source: SCENE_NPCS.find((npc) => npc.id === npcId)?.name || npcId,
    })),
  },
};

export const GIFT_TAGS = {
  turnip: ["vegetable", "humble"],
  potato: ["vegetable", "humble"],
  strawberry: ["fruit", "sweet"],
  pea: ["vegetable", "spring"],
  tomato: ["vegetable", "summer"],
  corn: ["vegetable", "summer"],
  watermelon: ["fruit", "summer"],
  chili: ["vegetable", "spicy"],
  pumpkin: ["vegetable", "autumn"],
  carrot: ["vegetable", "humble"],
  sweetpotato: ["vegetable", "autumn"],
  spinach: ["vegetable", "winter"],
  cabbage: ["vegetable", "winter"],
  leek: ["vegetable", "winter"],
  egg: ["protein", "farm"],
  milk: ["protein", "farm"],
  wool: ["craft", "farm"],
  tidefish: ["sea", "protein"],
  ore: ["mineral", "craft"],
  seaweed: ["sea", "herb"],
  coconut: ["fruit", "sea"],
  pearl: ["luxury", "sea"],
  coral: ["craft", "sea"],
  spring_herb: ["herb", "seasonal"],
  summer_berry: ["fruit", "seasonal"],
  autumn_mushroom: ["herb", "seasonal"],
  winter_root: ["herb", "seasonal"],
};

export const GIFT_PREFERENCES = {
  mayor: { likes: ["herb", "vegetable", "seasonal"], dislikes: ["luxury"] },
  merchant: { likes: ["sea", "fruit", "luxury"], dislikes: ["vegetable"] },
  spriteKeeper: { likes: ["herb", "seasonal", "sweet"], dislikes: ["mineral"] },
  islandChild: { likes: ["sea", "fruit", "sweet"], dislikes: ["mineral"] },
  quarryForeman: { likes: ["mineral", "protein", "farm"], dislikes: ["luxury"] },
  farmerLuo: { likes: ["vegetable", "fruit", "seasonal"], dislikes: ["luxury"] },
  archivist: { likes: ["herb", "craft", "seasonal"], dislikes: ["protein"] },
  cook: { likes: ["protein", "vegetable", "fruit"], dislikes: ["mineral"] },
};

export const PLAYER_START = { x: 286, y: 282, facing: "down" };

export const TOOLS = [
  {
    id: "hoe",
    name: "锄头",
    icon: "⌁",
    key: "1",
    energy: 4,
    hint: "把草地开垦成田垄",
  },
  {
    id: "seed",
    name: "种子",
    icon: "◒",
    key: "2",
    energy: 1,
    hint: "在田垄里播下种子",
  },
  {
    id: "water",
    name: "水壶",
    icon: "▽",
    key: "3",
    energy: 2,
    water: 1,
    hint: "为作物浇一次水",
  },
  {
    id: "harvest",
    name: "收获篮",
    icon: "∪",
    key: "4",
    energy: 2,
    hint: "采收成熟的作物",
  },
  {
    id: "shotgun",
    name: "猎枪",
    icon: "⚒",
    key: "5",
    energy: 4,
    hint: "装备后进入护栏外猎场，追踪野兽",
  },
  {
    id: "huntingKnife",
    name: "猎刀",
    icon: "†",
    key: "6",
    energy: 3,
    hint: "近身追踪野兽，也可进入护栏外猎场",
  },
];

export const PRODUCT_QUALITY_LABELS = {
  S: "S 级",
  M: "M 级",
  L: "L 级",
};

export const PRODUCT_QUALITY_MULTIPLIERS = {
  S: 1,
  M: 1.35,
  L: 1.8,
};

export const BACKPACK_UPGRADES = [
  { level: 1, slots: 4, cost: 180, title: "布料背包", description: "背包从 2 格扩展到 4 格。" },
  { level: 2, slots: 8, cost: 420, title: "远行背包", description: "背包从 4 格扩展到 8 格。" },
];

export const TOOL_UPGRADE_LEVELS = {
  hoe: [
    { level: 1, cost: 140, title: "熟铁锄", description: "开垦体力消耗降低 1。" },
    { level: 2, cost: 320, title: "精工锄", description: "开垦体力消耗降低 2。" },
  ],
  seed: [
    { level: 1, cost: 100, title: "分格播种器", description: "播种体力消耗降低 1。" },
    { level: 2, cost: 240, title: "精准播种器", description: "播种时额外提高照料质量。" },
  ],
  water: [
    { level: 1, cost: 160, title: "铜口水壶", description: "浇水体力消耗降低 1。" },
    { level: 2, cost: 360, title: "蓄压水壶", description: "浇水体力消耗降低 1，最大水量提高 4。" },
  ],
  harvest: [
    { level: 1, cost: 120, title: "藤编收获篮", description: "收获体力消耗降低 1。" },
    { level: 2, cost: 280, title: "锋叶收获篮", description: "收获时更容易获得额外产量。" },
  ],
};

export const CROPS = {
  grass: {
    id: "grass",
    name: "牧草",
    seedName: "牧草种子",
    icon: "♧",
    color: "#86b85f",
    leaf: "#3e8c4d",
    days: 2,
    seedPrice: 12,
    sellPrice: 0,
    isGrass: true,
    description: "成熟后可供牛羊在扩大的草场上自由觅食。",
  },
  turnip: {
    id: "turnip",
    name: "白萝卜",
    seedName: "白萝卜种子",
    icon: "◒",
    color: "#f1e8ca",
    leaf: "#6f9f61",
    days: 4,
    seedPrice: 20,
    sellPrice: 52,
    description: "长得快，价格稳。适合刚接手农场的人。",
  },
  potato: {
    id: "potato",
    name: "土豆",
    seedName: "土豆种薯",
    icon: "◉",
    color: "#c39158",
    leaf: "#5f8a55",
    days: 5,
    seedPrice: 32,
    sellPrice: 84,
    description: "耐储存，成熟稍慢，但能卖个好价钱。",
  },
  strawberry: {
    id: "strawberry",
    name: "草莓",
    seedName: "草莓秧苗",
    icon: "♥",
    color: "#c65f57",
    leaf: "#5c8d55",
    days: 6,
    seedPrice: 55,
    sellPrice: 142,
    description: "投入高、等待久，却是市场上最亮眼的收成。",
  },
  pea: {
    id: "pea",
    name: "豌豆",
    seedName: "豌豆种子",
    icon: "❋",
    color: "#9fc979",
    leaf: "#4e8a56",
    days: 6,
    seedPrice: 28,
    sellPrice: 96,
    description: "春季豆荚清甜，适合和草莓错峰经营。",
  },
  tomato: {
    id: "tomato",
    name: "番茄",
    seedName: "番茄种子",
    icon: "●",
    color: "#d65c4e",
    leaf: "#5d9157",
    days: 5,
    seedPrice: 30,
    sellPrice: 92,
    description: "夏日阳光越足，果实越饱满。",
  },
  corn: {
    id: "corn",
    name: "玉米",
    seedName: "玉米种子",
    icon: "▥",
    color: "#f1cb5c",
    leaf: "#6e9a51",
    days: 7,
    seedPrice: 36,
    sellPrice: 108,
    description: "生长期较长，但能稳定填满夏季田垄。",
  },
  watermelon: {
    id: "watermelon",
    name: "西瓜",
    seedName: "西瓜种子",
    icon: "◉",
    color: "#5b9a63",
    leaf: "#477c4e",
    days: 8,
    seedPrice: 48,
    sellPrice: 128,
    description: "占地久、回报稳，是夏季的大宗商品。",
  },
  chili: {
    id: "chili",
    name: "辣椒",
    seedName: "辣椒种子",
    icon: "♠",
    color: "#d94f42",
    leaf: "#4f8e4d",
    days: 7,
    seedPrice: 42,
    sellPrice: 124,
    description: "香料商在夏末会为它开出更好的价钱。",
  },
  pumpkin: {
    id: "pumpkin",
    name: "南瓜",
    seedName: "南瓜种子",
    icon: "◉",
    color: "#df9a4d",
    leaf: "#57874d",
    days: 8,
    seedPrice: 44,
    sellPrice: 126,
    description: "秋季大果，适合为节庆订单备货。",
  },
  carrot: {
    id: "carrot",
    name: "胡萝卜",
    seedName: "胡萝卜种子",
    icon: "♦",
    color: "#e6844e",
    leaf: "#659655",
    days: 4,
    seedPrice: 24,
    sellPrice: 72,
    description: "成熟快，帮助你在秋季维持稳定现金流。",
  },
  sweetpotato: {
    id: "sweetpotato",
    name: "红薯",
    seedName: "红薯苗",
    icon: "◆",
    color: "#aa6b58",
    leaf: "#58864f",
    days: 6,
    seedPrice: 34,
    sellPrice: 104,
    description: "埋在地里的甜味，秋风越凉越受欢迎。",
  },
  spinach: {
    id: "spinach",
    name: "菠菜",
    seedName: "菠菜种子",
    icon: "✤",
    color: "#4f9a62",
    leaf: "#36734a",
    days: 5,
    seedPrice: 26,
    sellPrice: 82,
    description: "耐寒叶菜，冬季也能给厨房提供新鲜蔬菜。",
  },
  cabbage: {
    id: "cabbage",
    name: "卷心菜",
    seedName: "卷心菜种子",
    icon: "✿",
    color: "#86b978",
    leaf: "#4c874d",
    days: 7,
    seedPrice: 38,
    sellPrice: 116,
    description: "冬日耐寒作物，适合和动物产品一起出货。",
  },
  leek: {
    id: "leek",
    name: "大葱",
    seedName: "大葱种子",
    icon: "┃",
    color: "#d5e2bd",
    leaf: "#4d8d55",
    days: 6,
    seedPrice: 30,
    sellPrice: 98,
    description: "雪前种下的葱香，是冬季料理的好搭档。",
  },
};

export const PRODUCTS = {
  grass: { id: "grass", name: "牧草", icon: "♧", sellPrice: 0, kind: "grass" },
  turnip: { id: "turnip", name: "白萝卜", icon: "◒", sellPrice: 52, kind: "crop" },
  potato: { id: "potato", name: "土豆", icon: "◉", sellPrice: 84, kind: "crop" },
  strawberry: { id: "strawberry", name: "草莓", icon: "♥", sellPrice: 142, kind: "crop" },
  pea: { id: "pea", name: "豌豆", icon: "❋", sellPrice: 96, kind: "crop" },
  tomato: { id: "tomato", name: "番茄", icon: "●", sellPrice: 92, kind: "crop" },
  corn: { id: "corn", name: "玉米", icon: "▥", sellPrice: 108, kind: "crop" },
  watermelon: { id: "watermelon", name: "西瓜", icon: "◉", sellPrice: 128, kind: "crop" },
  chili: { id: "chili", name: "辣椒", icon: "♠", sellPrice: 124, kind: "crop" },
  pumpkin: { id: "pumpkin", name: "南瓜", icon: "◉", sellPrice: 126, kind: "crop" },
  carrot: { id: "carrot", name: "胡萝卜", icon: "♦", sellPrice: 72, kind: "crop" },
  sweetpotato: { id: "sweetpotato", name: "红薯", icon: "◆", sellPrice: 104, kind: "crop" },
  spinach: { id: "spinach", name: "菠菜", icon: "✤", sellPrice: 82, kind: "crop" },
  cabbage: { id: "cabbage", name: "卷心菜", icon: "✿", sellPrice: 116, kind: "crop" },
  leek: { id: "leek", name: "大葱", icon: "┃", sellPrice: 98, kind: "crop" },
  egg: { id: "egg", name: "鸡蛋", icon: "◯", sellPrice: 34, kind: "animal" },
  milk: { id: "milk", name: "牛奶", icon: "◌", sellPrice: 76, kind: "animal" },
  wool: { id: "wool", name: "羊毛", icon: "☁", sellPrice: 96, kind: "animal" },
  feed: { id: "feed", name: "饲料", icon: "≋", buyPrice: 12, kind: "supply" },
};

export const MARKET_GOODS = {
  turnip: {
    id: "turnip",
    name: "白萝卜",
    icon: "◒",
    basePrice: 52,
    minPrice: 34,
    maxPrice: 86,
    volatility: 0.16,
    source: "牧场",
  },
  potato: {
    id: "potato",
    name: "土豆",
    icon: "◉",
    basePrice: 84,
    minPrice: 54,
    maxPrice: 132,
    volatility: 0.2,
    source: "牧场",
  },
  strawberry: {
    id: "strawberry",
    name: "草莓",
    icon: "♥",
    basePrice: 142,
    minPrice: 92,
    maxPrice: 228,
    volatility: 0.27,
    source: "牧场",
  },
  pea: {
    id: "pea",
    name: "豌豆",
    icon: "❋",
    basePrice: 96,
    minPrice: 62,
    maxPrice: 148,
    volatility: 0.22,
    source: "牧场",
  },
  tomato: {
    id: "tomato",
    name: "番茄",
    icon: "●",
    basePrice: 92,
    minPrice: 60,
    maxPrice: 142,
    volatility: 0.22,
    source: "牧场",
  },
  corn: {
    id: "corn",
    name: "玉米",
    icon: "▥",
    basePrice: 108,
    minPrice: 70,
    maxPrice: 166,
    volatility: 0.2,
    source: "牧场",
  },
  watermelon: {
    id: "watermelon",
    name: "西瓜",
    icon: "◉",
    basePrice: 128,
    minPrice: 82,
    maxPrice: 194,
    volatility: 0.24,
    source: "牧场",
  },
  chili: {
    id: "chili",
    name: "辣椒",
    icon: "♠",
    basePrice: 124,
    minPrice: 80,
    maxPrice: 188,
    volatility: 0.28,
    source: "牧场",
  },
  pumpkin: {
    id: "pumpkin",
    name: "南瓜",
    icon: "◉",
    basePrice: 126,
    minPrice: 82,
    maxPrice: 192,
    volatility: 0.25,
    source: "牧场",
  },
  carrot: {
    id: "carrot",
    name: "胡萝卜",
    icon: "♦",
    basePrice: 72,
    minPrice: 46,
    maxPrice: 110,
    volatility: 0.18,
    source: "牧场",
  },
  sweetpotato: {
    id: "sweetpotato",
    name: "红薯",
    icon: "◆",
    basePrice: 104,
    minPrice: 68,
    maxPrice: 158,
    volatility: 0.21,
    source: "牧场",
  },
  spinach: {
    id: "spinach",
    name: "菠菜",
    icon: "✤",
    basePrice: 82,
    minPrice: 52,
    maxPrice: 124,
    volatility: 0.2,
    source: "牧场",
  },
  cabbage: {
    id: "cabbage",
    name: "卷心菜",
    icon: "✿",
    basePrice: 116,
    minPrice: 74,
    maxPrice: 176,
    volatility: 0.22,
    source: "牧场",
  },
  leek: {
    id: "leek",
    name: "大葱",
    icon: "┃",
    basePrice: 98,
    minPrice: 64,
    maxPrice: 150,
    volatility: 0.2,
    source: "牧场",
  },
  egg: {
    id: "egg",
    name: "鸡蛋",
    icon: "◯",
    basePrice: 34,
    minPrice: 22,
    maxPrice: 58,
    volatility: 0.13,
    source: "牲畜棚",
  },
  milk: {
    id: "milk",
    name: "牛奶",
    icon: "◌",
    basePrice: 76,
    minPrice: 48,
    maxPrice: 116,
    volatility: 0.17,
    source: "牲畜棚",
  },
  wool: {
    id: "wool",
    name: "羊毛",
    icon: "☁",
    basePrice: 96,
    minPrice: 62,
    maxPrice: 148,
    volatility: 0.23,
    source: "牲畜棚",
  },
  seaweed: {
    id: "seaweed",
    name: "潮汐海藻",
    icon: "≋",
    basePrice: 30,
    minPrice: 18,
    maxPrice: 54,
    volatility: 0.3,
    source: "蓝潮海岛",
  },
  coconut: {
    id: "coconut",
    name: "银沙椰子",
    icon: "◒",
    basePrice: 48,
    minPrice: 28,
    maxPrice: 84,
    volatility: 0.26,
    source: "蓝潮海岛",
  },
  pearl: {
    id: "pearl",
    name: "月光珍珠",
    icon: "◇",
    basePrice: 120,
    minPrice: 72,
    maxPrice: 220,
    volatility: 0.38,
    source: "蓝潮海岛",
  },
  coral: {
    id: "coral",
    name: "赤潮珊瑚",
    icon: "❋",
    basePrice: 64,
    minPrice: 38,
    maxPrice: 118,
    volatility: 0.34,
    source: "蓝潮海岛",
  },
  tidefish: {
    id: "tidefish",
    name: "潮汐银鱼",
    icon: "≈",
    basePrice: 34,
    minPrice: 20,
    maxPrice: 62,
    volatility: 0.28,
    source: "潮汐垂钓",
  },
  ore: {
    id: "ore",
    name: "旧矿铜",
    icon: "◆",
    basePrice: 58,
    minPrice: 34,
    maxPrice: 104,
    volatility: 0.24,
    source: "旧矿道",
  },
  spring_herb: {
    id: "spring_herb",
    name: "春芽草",
    icon: "❋",
    basePrice: 28,
    minPrice: 16,
    maxPrice: 48,
    volatility: 0.22,
    source: "雨后山货",
  },
  summer_berry: {
    id: "summer_berry",
    name: "夏莓",
    icon: "●",
    basePrice: 42,
    minPrice: 25,
    maxPrice: 72,
    volatility: 0.25,
    source: "雨后山货",
  },
  autumn_mushroom: {
    id: "autumn_mushroom",
    name: "秋野菇",
    icon: "◉",
    basePrice: 68,
    minPrice: 42,
    maxPrice: 112,
    volatility: 0.28,
    source: "雨后山货",
  },
  winter_root: {
    id: "winter_root",
    name: "雪下根",
    icon: "◇",
    basePrice: 82,
    minPrice: 48,
    maxPrice: 138,
    volatility: 0.3,
    source: "雨后山货",
  },
  wild_strawberry: {
    id: "wild_strawberry",
    name: "林间野莓",
    icon: "●",
    basePrice: 54,
    minPrice: 30,
    maxPrice: 96,
    volatility: 0.3,
    source: "护栏外荒野",
  },
  wild_plum: {
    id: "wild_plum",
    name: "野李子",
    icon: "◆",
    basePrice: 62,
    minPrice: 36,
    maxPrice: 108,
    volatility: 0.28,
    source: "护栏外荒野",
  },
  acorn: {
    id: "acorn",
    name: "橡果",
    icon: "◇",
    basePrice: 48,
    minPrice: 28,
    maxPrice: 82,
    volatility: 0.24,
    source: "护栏外荒野",
  },
  pine_cone: {
    id: "pine_cone",
    name: "松塔",
    icon: "✦",
    basePrice: 56,
    minPrice: 32,
    maxPrice: 94,
    volatility: 0.25,
    source: "护栏外荒野",
  },
};

export const MINIGAME_DEFS = {
  hunt: {
    id: "hunt",
    title: "狩猎与巡护",
    subtitle: "在湿地保护候鸟，在护栏外追踪野兽，保持安全距离完成记录。",
    scene: "island",
    scenes: ["island", "wilderness"],
    energy: 4,
    clockMinutes: 40,
    duration: 15,
    action: "点击/轻触目标；键盘用方向键移动准星，空格执行追踪。金色目标稀有且只计入一次。",
    rewardNote: "普通追踪给补贴；每日最多记录一次稀有目标，收益进入贸易链。",
  },
  fishing: {
    id: "fishing",
    title: "潮汐垂钓",
    subtitle: "等待鱼咬钩，在指针进入绿区时收线。",
    scene: "island",
    scenes: ["island", "farm"],
    energy: 3,
    clockMinutes: 35,
    duration: 26,
    action: "点击/轻触或按空格收线；绿区中心是完美判定。",
    rewardNote: "每收获一条鱼都会进入现有库存与市场。",
  },
  mining: {
    id: "mining",
    title: "旧矿脉采样",
    subtitle: "看准摆动的吊钩，把矿脉拖上来。越深的矿价值越高。",
    scene: "quarry",
    energy: 5,
    clockMinutes: 45,
    duration: 30,
    action: "点击/轻触或按空格放下吊钩；每次采掘都有时间成本。",
    rewardNote: "矿铜会进入贸易航线；空钩和坍塌风险会浪费一次机会。",
  },
  delivery: {
    id: "delivery",
    title: "限时运货",
    subtitle: "把已备齐的港口订单沿潮汐公路送到码头。",
    scene: "port",
    energy: 4,
    clockMinutes: 20,
    duration: 18,
    action: "点击/轻触左右半屏或按 A/D、方向键躲避路障。",
    rewardNote: "成功会完成一份已接订单；碰撞会损失时间，失败会降低声誉。",
  },
};

export const TRADE_CONTRACTS = [
  {
    id: "harbor-breakfast",
    title: "港口早餐会",
    client: "河港市餐厅联盟",
    requirements: { egg: 3, milk: 1 },
    reward: 196,
    reputation: 4,
    description: "早班船靠岸前，需要一批新鲜早餐。",
  },
  {
    id: "island-kitchen",
    title: "海岛厨房",
    client: "蓝潮旅店",
    requirements: { seaweed: 3, coconut: 2 },
    reward: 312,
    reputation: 6,
    description: "旅店想把海岛风味留在每一张餐桌上。",
  },
  {
    id: "winter-stores",
    title: "冬储车队",
    client: "上游村合作仓",
    requirements: { potato: 3, turnip: 4 },
    reward: 348,
    reputation: 7,
    description: "合作仓愿意为稳定交付支付溢价。",
  },
  {
    id: "weavers-choice",
    title: "织坊的颜色",
    client: "河港市旧织坊",
    requirements: { wool: 2, coral: 1 },
    reward: 388,
    reputation: 8,
    description: "织坊需要羊毛和赤潮珊瑚做一批节庆染料。",
  },
  {
    id: "museum-pearl",
    title: "博物馆的月光",
    client: "河港市地方博物馆",
    requirements: { pearl: 1 },
    reward: 520,
    reputation: 10,
    description: "博物馆想收藏一枚来自旧海路的月光珍珠。",
  },
];

export const MARKET_TIERS = [
  { level: 0, name: "合作社线", bonus: 0 },
  { level: 1, name: "近海航线", bonus: 0.08 },
  { level: 2, name: "远洋契约", bonus: 0.16 },
  { level: 3, name: "共同体航线", bonus: 0.24 },
];

export const CITY_PROJECTS = {
  marketHall: {
    id: "marketHall",
    title: "港口市场",
    icon: "▤",
    cost: 180,
    description: "增加远方买家的报价，贸易订单每天多一条。",
  },
  ferry: {
    id: "ferry",
    title: "蓝潮渡轮",
    icon: "⌁",
    cost: 220,
    description: "修复旧码头，解锁蓝潮海岛与潮汐资源。",
  },
  clinic: {
    id: "clinic",
    title: "社区诊所",
    icon: "＋",
    cost: 220,
    description: "最大体力提高 10，雨天恢复更稳定。",
  },
  civicCenter: {
    id: "civicCenter",
    title: "市民议事厅",
    icon: "⌂",
    cost: 160,
    description: "每次市民议事额外获得 2 公民点。",
  },
};

// 大城市科研与金融系统。研究成果会直接作用于牧场生产，形成可持续的升级循环。
export const METROPOLIS_RESEARCH = {
  machine: {
    id: "machine",
    title: "农机研发中心",
    icon: "⚙",
    cost: 520,
    description: "研发模块化播种、滴灌与收获组件，让自动化农机每天多处理 2 格地块。",
    reward: "automationCapacity",
  },
  seeds: {
    id: "seeds",
    title: "大学种子实验室",
    icon: "✿",
    cost: 460,
    description: "培育高产作物种子，解锁一组跨季节优良品种。",
    reward: "seedVarieties",
  },
  breeds: {
    id: "breeds",
    title: "畜牧遗传学院",
    icon: "♜",
    cost: 620,
    description: "研究鸡、牛、羊的友好育种，解锁高品质畜产品。",
    reward: "animalVarieties",
  },
};

export const METROPOLIS_VARIETIES = [
  { id: "golden_turnip", name: "金冠萝卜", kind: "seed", crop: "turnip", season: "春", bonus: 0.18, description: "春季成熟更快，出货价提高 18%。" },
  { id: "tide_tomato", name: "潮光番茄", kind: "seed", crop: "tomato", season: "夏", bonus: 0.22, description: "夏季果实带有海风甜味，出货价提高 22%。" },
  { id: "moon_cabbage", name: "月霜卷心菜", kind: "seed", crop: "cabbage", season: "冬", bonus: 0.2, description: "冬季耐寒，浇水不足时仍能保持品质。" },
  { id: "blue_egg", name: "蓝潮蛋鸡", kind: "animal", animal: "chicken", bonus: 0.2, description: "产出蓝潮蛋，售价提高 20%。" },
  { id: "river_cow", name: "河湾奶牛", kind: "animal", animal: "cow", bonus: 0.2, description: "产出浓郁牛奶，售价提高 20%。" },
  { id: "cloud_sheep", name: "云岚绵羊", kind: "animal", animal: "sheep", bonus: 0.2, description: "羊毛更蓬松，售价提高 20%。" },
];

export const GOVERNMENT_POLICIES = {
  waterCharter: {
    id: "waterCharter",
    title: "共同水章",
    icon: "◒",
    cost: 2,
    coinCost: 40,
    description: "公开水量记录，水罐上限提高 3。需要公共维修预算。",
  },
  fairTrade: {
    id: "fairTrade",
    title: "公平贸易条例",
    icon: "↔",
    cost: 3,
    coinCost: 30,
    description: "订单声誉提高，动态价格的最低值上浮。由市场基金承担成本。",
  },
  islandSanctuary: {
    id: "islandSanctuary",
    title: "海岛保育区",
    icon: "❋",
    cost: 3,
    coinCost: 80,
    description: "海岛探索更容易发现稀有资源，生态韧性提高。需要保育经费。",
  },
  spriteCommons: {
    id: "spriteCommons",
    title: "精灵共居公约",
    icon: "✦",
    cost: 4,
    coinCost: 50,
    description: "所有小精灵友好度提高，自动劳动额外产生 1 点声誉。需要共居维护费。",
  },
};

export const SPRITE_DEFS = {
  seedling: {
    id: "seedling",
    name: "芽芽",
    icon: "❋",
    color: "#9fc477",
    role: "watering",
    cost: 0,
    talent: "每天悄悄给两块田留下露水。",
    unlockText: "初次进入小精灵工坊即可遇见。",
    visual: { skin: "#f3c99e", hair: "#6a4938", hairStyle: "leaf", outfit: "#8ab56b", accent: "#e9d58c", face: "bright", badge: "滴" },
  },
  sprout: {
    id: "sprout",
    name: "穗穗",
    icon: "✿",
    color: "#d1b36a",
    role: "planting",
    cost: 85,
    talent: "每天替你播下两颗当季种子，也会提醒哪块田还空着。",
    unlockText: "进入小精灵工坊后即可邀请。",
    visual: { skin: "#efbf8f", hair: "#8d5f35", hairStyle: "sprout", outfit: "#d2ad57", accent: "#6a8f58", face: "kind", badge: "芽" },
  },
  tide: {
    id: "tide",
    name: "潮潮",
    icon: "◒",
    color: "#71b8c4",
    role: "island",
    cost: 70,
    talent: "每天从潮间带带回一份海岛资源。",
    unlockText: "修好蓝潮渡轮后出现。",
    visual: { skin: "#d99d7b", hair: "#2f6370", hairStyle: "wave", outfit: "#5fa4b2", accent: "#d8f0dd", face: "calm", badge: "潮" },
  },
  angler: {
    id: "angler",
    name: "渔火",
    icon: "♢",
    color: "#72aeb8",
    role: "fishing",
    cost: 95,
    talent: "每天沿潮汐路线钓回一条鱼。",
    unlockText: "修好蓝潮渡轮后出现。",
    visual: { skin: "#f0c59b", hair: "#47636b", hairStyle: "wave", outfit: "#6b9fb0", accent: "#f0cf7a", face: "focused", badge: "钩" },
  },
  pondling: {
    id: "pondling",
    name: "泡泡",
    icon: "◌",
    color: "#8bc6b2",
    role: "fishery",
    cost: 110,
    talent: "照看牧场鱼塘，让鱼苗长大并留下鲜鱼。",
    unlockText: "修好蓝潮渡轮后出现。",
    visual: { skin: "#e5ad89", hair: "#4c7e68", hairStyle: "bubble", outfit: "#78b99e", accent: "#dbf2dc", face: "bright", badge: "鱼" },
  },
  golden: {
    id: "golden",
    name: "金穗",
    icon: "✦",
    color: "#e0ad5e",
    role: "trade",
    cost: 100,
    talent: "贸易订单声誉与售价小幅提高。",
    unlockText: "港口市场建成后出现。",
    visual: { skin: "#f2c49b", hair: "#6c4c31", hairStyle: "crown", outfit: "#d9a852", accent: "#fff0ae", face: "sharp", badge: "金" },
  },
  ember: {
    id: "ember",
    name: "烬烬",
    icon: "◇",
    color: "#d78467",
    role: "animals",
    cost: 90,
    talent: "每天替你照料全部牲畜，优先照顾心情最低的那只。",
    unlockText: "完成 3 份贸易订单后出现。",
    visual: { skin: "#d99b78", hair: "#6c3d35", hairStyle: "ember", outfit: "#c86f5c", accent: "#f4c47c", face: "kind", badge: "护" },
  },
};

export const WORKER_DEFS = {
  farmer: {
    id: "farmer",
    name: "周禾",
    role: "planting",
    wage: 14,
    hireCost: 120,
    talent: "每天尝试收获2格成熟作物、播种2格、浇水2格并照料牲畜，专长是按季节补种。",
    visual: {
      skin: "#d9a77d", hair: "#4b3428", hairStyle: "side", outfit: "#b8664d", accent: "#e7c37d",
      pants: "#405348", shoes: "#5a3e32", headwear: "straw", face: "freckles", badge: "✦",
    },
  },
  herder: {
    id: "herder",
    name: "林牧",
    role: "animals",
    wage: 16,
    hireCost: 140,
    talent: "每天参与收获、播种、浇水和基础喂养，分配到牲畜岗位后会陪伴、刷毛并放牧全部动物。",
    visual: {
      skin: "#c98f6d", hair: "#2f2525", hairStyle: "curly", outfit: "#718758", accent: "#d9b56b",
      pants: "#51483d", shoes: "#4a382f", headwear: "wool", face: "smile", badge: "♣",
    },
  },
  animalCaretaker: {
    id: "animalCaretaker",
    name: "顾安",
    role: "animals",
    wage: 15,
    hireCost: 130,
    talent: "每天参与农场基础劳动，分配到牲畜岗位后会采购饲料并完成喂养、陪伴、刷毛、放牧和健康记录。",
    visual: {
      skin: "#e4b58e", hair: "#6b3d35", hairStyle: "braid", outfit: "#8c6f82", accent: "#f0c982",
      pants: "#43566a", shoes: "#594238", headwear: "ribbon", face: "kind", badge: "♥",
    },
  },
  fisher: {
    id: "fisher",
    name: "江岚",
    role: "fishing",
    wage: 18,
    hireCost: 160,
    talent: "每天参与农场基础劳动，分配到钓鱼岗位后会带回1条潮汐银鱼，也可改派鱼塘岗位。",
    visual: {
      skin: "#d39a73", hair: "#223b48", hairStyle: "short", outfit: "#3e7281", accent: "#b7dfe0",
      pants: "#314b58", shoes: "#3e3734", headwear: "beanie", face: "freckles", badge: "≈",
    },
  },
  irrigator: {
    id: "irrigator",
    name: "沈露",
    role: "watering",
    wage: 13,
    hireCost: 105,
    talent: "每天尝试收获2格成熟作物、播种2格、浇水2格并照料牲畜，专长是稳定检查水罐和田垄。",
    visual: {
      skin: "#e0ad82", hair: "#3d3028", hairStyle: "ponytail", outfit: "#4e8790", accent: "#f0d27c",
      pants: "#3e5f59", shoes: "#5a4033", headwear: "bandana", face: "bright", badge: "◒",
    },
  },
  pondkeeper: {
    id: "pondkeeper",
    name: "许波",
    role: "fishery",
    wage: 15,
    hireCost: 125,
    talent: "每天参与农场基础劳动，分配到养鱼岗位后鱼塘成长2条，存鱼达到3条时收获1条鲜鱼。",
    visual: {
      skin: "#c98f70", hair: "#49322d", hairStyle: "bob", outfit: "#65a58d", accent: "#d9e9be",
      pants: "#3d5b57", shoes: "#4d3c35", headwear: "cap", face: "glasses", badge: "◌",
    },
  },
  trader: {
    id: "trader",
    name: "唐枝",
    role: "trade",
    wage: 17,
    hireCost: 135,
    talent: "每天参与农场基础劳动，分配到贸易岗位后整理订单并让航线声誉每日提高1点。",
    visual: {
      skin: "#d7a77f", hair: "#492d46", hairStyle: "slick", outfit: "#81556c", accent: "#f0c96f",
      pants: "#40394d", shoes: "#46313d", headwear: "ribbon", face: "sharp", badge: "▤",
    },
  },
  ranger: {
    id: "ranger",
    name: "叶青",
    role: "island",
    wage: 16,
    hireCost: 150,
    talent: "每天参与农场基础劳动，分配到海岛岗位后带回1份海岛资源，保育区政策下带回椰子。",
    visual: {
      skin: "#c88e6c", hair: "#2b3930", hairStyle: "braid", outfit: "#6f9464", accent: "#d3a95f",
      pants: "#394e42", shoes: "#4a382d", headwear: "hood", face: "calm", badge: "⌁",
    },
  },
};

export const ISLAND_SPOTS = {
  tidePool: {
    id: "tidePool",
    title: "潮声湾",
    icon: "≋",
    resource: "seaweed",
    amount: 3,
    energy: 4,
    description: "退潮后露出一圈柔软的蓝色海藻。",
  },
  silverBeach: {
    id: "silverBeach",
    title: "银沙滩",
    icon: "◒",
    resource: "coconut",
    amount: 2,
    energy: 5,
    description: "椰影落在沙上，远处的海鸟把一枚果实推到脚边。",
  },
  moonReef: {
    id: "moonReef",
    title: "月光礁",
    icon: "◇",
    resource: "pearl",
    amount: 1,
    energy: 10,
    chance: 0.45,
    description: "需要等潮汐最安静的时候，才能在礁缝里找到珍珠。",
  },
  redGarden: {
    id: "redGarden",
    title: "赤潮花园",
    icon: "❋",
    resource: "coral",
    amount: 1,
    energy: 9,
    chance: 0.5,
    description: "被阳光染红的珊瑚，适合做成节庆染料。",
  },
};

export const ISLAND_DAILY_LIMIT = 2;

export const ANIMAL_DEFS = [
  {
    id: "chicken",
    name: "小橘",
    species: "鸡",
    product: "egg",
    productEvery: 1,
    productText: "一枚温热的鸡蛋",
    canGraze: false,
    color: "#d88645",
    accent: "#f3c577",
    line: "小橘把脑袋歪向一边，像是在确认你今天有没有忘记什么。",
  },
  {
    id: "duck",
    name: "小灰",
    species: "鸭",
    product: "egg",
    productEvery: 1,
    productText: "一枚带着水汽的鸭蛋",
    canGraze: false,
    color: "#9aa69a",
    accent: "#e4c477",
    line: "小灰摇摇摆摆地走向水槽，叫声把草叶上的露水都惊动了。",
  },
  {
    id: "sheep",
    name: "云朵",
    species: "绵羊",
    product: "wool",
    productEvery: 2,
    productText: "一团蓬松的羊毛",
    canGraze: true,
    color: "#e6dfce",
    accent: "#b6a88d",
    line: "云朵安静地靠过来，身上的毛沾着一点干燥的草屑。",
  },
  {
    id: "cow",
    name: "栗子",
    species: "奶牛",
    product: "milk",
    productEvery: 1,
    productText: "一桶新鲜牛奶",
    canGraze: true,
    color: "#665447",
    accent: "#efe5cf",
    line: "栗子慢吞吞地甩了甩尾巴，似乎在催你快一点。",
  },
];

export const SHOP_SEEDS = Object.values(CROPS).map((crop) => ({
  id: crop.id,
  name: crop.seedName,
  price: crop.seedPrice,
  icon: crop.icon,
  seasons: SEASONAL_CROP_CALENDAR[crop.id]?.seasons || [],
  description: crop.isGrass
    ? `${crop.days} 天成熟 · 成熟后供牛羊放牧 · ${(SEASONAL_CROP_CALENDAR[crop.id]?.seasons || []).join("、")}季可播`
    : `${crop.days} 天成熟 · 售价 ${crop.sellPrice} 金 · ${(SEASONAL_CROP_CALENDAR[crop.id]?.seasons || []).join("、")}季可播`,
  kind: "seed",
}));

export const INTERACTIONS = [
  { id: "forage", x: 390, y: 246, radius: 58, label: "寻找雨后足迹", keycap: "E", forageNode: true },
  {
    id: "sleep",
    x: 145,
    y: 252,
    radius: 58,
    label: "睡觉，结束今天",
    keycap: "E",
  },
  {
    id: "house",
    x: 285,
    y: 252,
    radius: 58,
    label: "进入家里",
    keycap: "E",
  },
  {
    id: "farm_facility",
    x: 540,
    y: 208,
    radius: 54,
    label: "进入牧场综合作业屋",
    keycap: "E",
    facilityId: "farm",
  },
  {
    id: "worker_housing",
    x: 623,
    y: 214,
    radius: 54,
    label: "进入员工与小精灵宿舍",
    keycap: "E",
  },
  {
    id: "automation_machine",
    x: 148,
    y: 388,
    radius: 58,
    label: "管理自动化农机",
    keycap: "E",
  },
  {
    id: "ai",
    x: 442,
    y: 220,
    radius: 52,
    label: "使用牧心终端",
    keycap: "H",
  },
  {
    id: "feed",
    x: 842,
    y: 248,
    radius: 62,
    label: "照料牲畜",
    keycap: "E",
  },
  {
    id: "worker",
    x: 650,
    y: 310,
    radius: 46,
    label: "和老周聊聊",
    keycap: "E",
  },
  {
    id: "bin",
    x: 816,
    y: 371,
    radius: 55,
    label: "打开出货箱",
    keycap: "E",
  },
  {
    id: "shop",
    x: 188,
    y: 660,
    radius: 58,
    label: "在村集买卖",
    keycap: "E",
  },
  {
    id: "archive",
    x: 411,
    y: 659,
    radius: 52,
    label: "查阅地方档案",
    keycap: "E",
  },
  {
    id: "elder",
    x: 280,
    y: 675,
    radius: 54,
    label: "和阿婆谈谈",
    keycap: "E",
  },
  {
    id: "canal",
    x: 903,
    y: 524,
    radius: 65,
    label: "查看旧水渠",
    keycap: "E",
  },
  {
    id: "river_fishing",
    x: 1315,
    y: 620,
    radius: 62,
    label: "在鱼池外的河边垂钓",
    keycap: "E",
    minigame: "fishing",
  },
  {
    id: "investor",
    x: 684,
    y: 588,
    radius: 58,
    label: "和汇川农业谈谈",
    keycap: "E",
  },
];

export const STORY_OBJECTIVES = {
  meetSister: {
    kicker: "第一章 · 牧场",
    text: "去技术棚找妹妹彤彤",
    progress: () => "",
  },
  feedAnimals: {
    kicker: "第一章 · 牧场",
    text: "照料全部牲畜",
    progress: (state) => {
      const fed = state.animals.filter((animal) => animal.fed).length;
      return `${fed} / ${state.animals.length}`;
    },
  },
  plantSeeds: {
    kicker: "第一章 · 牧场",
    text: "种下 3 颗种子",
    progress: (state) => `${Math.min(state.story.plantedForStory, 3)} / 3`,
  },
  firstNight: {
    kicker: "第一章 · 牧场",
    text: "回屋休息，迎接明天",
    progress: () => "",
  },
  investigate: {
    kicker: "第二章 · 水渠",
    text: "寻找旧水渠的 3 条线索",
    progress: (state) => {
      const count = Object.values(state.story.clues).filter(Boolean).length;
      return `${count} / 3`;
    },
  },
  waterMeeting: {
    kicker: "第二章 · 水渠",
    text: "在旧水渠召集村会",
    progress: () => "",
  },
  waitForInvestor: {
    kicker: "第三章 · 市场",
    text: "休息一晚，等汇川农业来访",
    progress: () => "",
  },
  meetInvestor: {
    kicker: "第三章 · 市场",
    text: "去村口和投资人林屿谈谈",
    progress: () => "",
  },
  aiAudit: {
    kicker: "第三章 · 市场",
    text: "回牧心终端，决定它的权力",
    progress: () => "",
  },
  endingReady: {
    kicker: "尾声",
    text: "查看这段共同生活的结局",
    progress: () => "",
  },
  freeplay: {
    kicker: "共同生活",
    text: "继续经营牧场，写下自己的日子",
    progress: () => "",
  },
  postGame: {
    kicker: "后日谈 · 七天",
    text: "在修正牌的约束下完成一次短后记",
    progress: () => "",
  },
};

export const DAILY_TASK_POOL = [
  {
    id: "water",
    category: "care",
    scene: "farm",
    seasons: ["春", "夏"],
    bonus: 1,
    text: "给 3 块田浇水",
    counter: "watered",
    target: 3,
    reward: 18,
  },
  {
    id: "feed",
    category: "care",
    scene: "farm",
    seasons: ["秋", "冬"],
    bonus: 1,
    text: "照料牲畜",
    counter: "fed",
    target: 1,
    reward: 16,
  },
  {
    id: "harvest",
    category: "care",
    scene: "farm",
    seasons: ["春", "夏", "秋"],
    bonus: 1,
    text: "收获 1 份作物",
    counter: "harvested",
    target: 1,
    reward: 22,
  },
  {
    id: "talk",
    category: "social",
    scene: "city",
    seasons: ["春", "冬"],
    bonus: 1,
    text: "和村里的人聊聊",
    counter: "talked",
    target: 1,
    reward: 12,
  },
  {
    id: "ship",
    category: "trade",
    scene: "port",
    seasons: ["夏", "秋"],
    bonus: 1,
    text: "向出货箱交付 1 份产品",
    counter: "shipped",
    target: 1,
    reward: 18,
  },
  {
    id: "till",
    category: "care",
    scene: "farm",
    seasons: ["春", "秋"],
    bonus: 1,
    text: "开垦 2 块新土地",
    counter: "tilled",
    target: 2,
    reward: 16,
  },
  {
    id: "forage",
    category: "explore",
    scene: "farm",
    seasons: ["春", "夏", "秋", "冬"],
    bonus: 1,
    text: "采集 1 份当季山货",
    counter: "foraged",
    target: 1,
    reward: 24,
  },
  {
    id: "island",
    category: "explore",
    scene: "island",
    seasons: ["夏", "秋"],
    bonus: 1,
    text: "探索 1 个潮汐点",
    counter: "explored",
    target: 1,
    reward: 26,
  },
  {
    id: "market",
    category: "trade",
    scene: "port",
    seasons: ["夏", "秋", "冬"],
    bonus: 1,
    text: "完成 1 次市场交易",
    counter: "sold",
    target: 1,
    reward: 22,
  },
  {
    id: "contract",
    category: "trade",
    scene: "port",
    seasons: ["春", "秋"],
    bonus: 1,
    text: "完成 1 份贸易订单",
    counter: "contracts",
    target: 1,
    reward: 30,
  },
  {
    id: "talkAnimal",
    category: "social",
    scene: "farm",
    seasons: ["春", "夏", "秋", "冬"],
    bonus: 1,
    text: "和 1 只牲畜说说话",
    counter: "talkedAnimals",
    target: 1,
    reward: 14,
  },
  {
    id: "townHall",
    category: "social",
    scene: "council",
    seasons: ["春", "夏", "秋", "冬"],
    bonus: 1,
    text: "参加 1 次市民议事",
    counter: "townHall",
    target: 1,
    reward: 20,
  },
];

export const ELDER_DIALOGUE = [
  {
    speaker: "阿婆",
    avatar: "elder",
    role: "界河村的老水渠守闸人",
    text: "你外公在世时常说，水不是谁家的财产，是所有人一起欠下的一份责任。",
  },
  {
    speaker: "阿婆",
    avatar: "elder",
    role: "界河村的老水渠守闸人",
    text: "从前三个村子轮着放水。旱年也吵，可谁家都不能把闸口堵死。规矩写在石头上，也写在人的心里。",
  },
  {
    speaker: "阿婆",
    avatar: "elder",
    role: "界河村的老水渠守闸人",
    text: "你家的地契只写了田，没有写水。水从来不在那张纸上。",
  },
];

export const ARCHIVE_LORE = [
  {
    title: "民国二十三年 · 地契附页",
    text: "田亩可易主，沟渠不得私塞。凡受此渠水者，岁修三日，旱时共议。",
  },
  {
    title: "界河水利合作社 · 1956",
    text: "上游村出石，中游村出工，下游村护闸。水路按田亩与人口共同核定。",
  },
  {
    title: "地方志残页",
    text: "旧渠有三源、七闸、十二会。每逢水少，守闸人击木为号，各族人共至渠首议事。",
  },
];

export const CANAL_LORE = {
  title: "渠首残碑",
  lines: [
    "碑面被水磨得很浅，仍能认出三种不同的文字，反复写着同一个意思：",
    "「水行有次，人有其责；闸开之时，不得独断。」",
    "石刻没有写谁拥有水，只写了谁必须来维护它。",
  ],
};

export const ENDINGS = {
  common: {
    index: "ENDING 01 / 05",
    title: "共同地",
    text: "合作社接管了水渠与牧场。牧心保留了全部模型、数据与错误记录，任何村民都可以提出异议。技术没有替人们决定该怎样生活，却让那些曾经听不见的声音，第一次进入了会议室。",
    note: "水渠重新通水的那天，三个村子的老人一起敲响了闸门。",
  },
  company: {
    index: "ENDING 02 / 05",
    title: "企业城",
    text: "汇川农业把牧场建成了区域供应链中心。产量、股价和就业数字都很漂亮，村口却渐渐只剩下通勤车和自动分拣线。牧心仍在运行，只是它记住的人越来越少了。",
    note: "土地获得了更高的估值，社区失去了定价自己生活的能力。",
  },
  autonomy: {
    index: "ENDING 03 / 05",
    title: "无人的好天气",
    text: "牧心接管了水、种苗、运输与市场。旱灾损失被压到最低，城市几乎没有停摆。人类保留了最后的确认按钮，却越来越少有人知道该确认什么。",
    note: "系统记录：所有指标正常。没有人记录那天傍晚谁在渠边坐了很久。",
  },
  ecology: {
    index: "ENDING 04 / 05",
    title: "慢河",
    text: "牧场放弃了扩张，恢复古渠的漫流与湿地。收入增长变慢了，年轻人却开始回来修闸、种树、办集市。牧心成了公共的水文观测站，它最重要的任务，是提醒人们何时应该停下来。",
    note: "这条河不再全年满水，却重新养活了两岸的季节。",
  },
  split: {
    index: "ENDING 05 / 05",
    title: "分叉的田埂",
    text: "你试图让每个人满意，却没能让任何一方相信你会承担后果。水源、数据和土地被不同势力分割，旧渠重新埋进了荒草。牧心的日志里，最后一条记录只有一句：信任无法被平均分配。",
    note: "共同体不是没有冲突，而是有人愿意留下来处理冲突。",
  },
};

export const POST_GAME_MODIFIERS = [
  {
    id: "publicLedger",
    title: "公共账本",
    constraint: "订单收益降低 20%，市场不再只按最高出价结算。",
    boon: "选择时公民点 +2；每次把日结转为公共行动都计入牌面目标。",
    goal: { type: "publicActions", target: 3, label: "把 3 次日结转为公共行动" },
    durationDays: 7,
    epilogue: {
      title: "账本留在了议事厅",
      text: "七天后，订单利润没有回到旧水平，但每一笔让价都换来了可查的公共记录。村民开始用同一本账讨论水、道路和下一个季节。",
      note: "你失去了一部分效率，换来了一个可以追问的共同体。",
    },
    fail: {
      title: "账本没有被翻开",
      text: "订单仍然完成，公共行动却始终没有写进同一本账。市场恢复了速度，议事厅里留下的是一叠互不相认的收据。",
      note: "共享不是把数字放到一起，而是让人愿意在同一张桌前解释它们。",
    },
  },
  {
    id: "handCare",
    title: "手工周",
    constraint: "小精灵暂停自动工作，所有照料必须由你亲自完成。",
    boon: "选择时社区信任 +3；四个没有动物挨饿的日子会完成牌面目标。",
    goal: { type: "careDays", target: 4, label: "四个清晨没有动物挨饿" },
    durationDays: 7,
    epilogue: {
      title: "手心的温度",
      text: "你重新记住了每只动物早晨的叫声。小精灵没有消失，它们只是把工作交还给你，在旁边记录你怎样做出判断。",
      note: "自动化没有错，错的是让人忘记自己为什么照料。",
    },
    fail: {
      title: "空着的饲料桶",
      text: "自动化暂停后，忙碌仍然找到了缝隙。有几天牲畜棚里没有足够的食物，社区开始怀疑共同生活是否只是一句口号。",
      note: "照料不是效率的对立面，它是效率必须回答的问题。",
    },
  },
  {
    id: "drySeason",
    title: "旱季复演",
    constraint: "水罐上限降到 12，每一天都要重新分配有限的水。",
    boon: "选择时生态韧性 +3；连续七天社区信任不低于 50 会完成牌面目标。",
    goal: { type: "surviveDays", target: 7, label: "七天保住社区信任 ≥ 50" },
    durationDays: 7,
    epilogue: {
      title: "水少的时候",
      text: "第七天，渠水仍然很浅，但没有人把邻居的水口堵上。牧心记录下每一次让水，也记录下那些没有被算法量化的克制。",
      note: "共同体的韧性，不在水多的时候，而在水少的时候。",
    },
    fail: {
      title: "渠底的裂缝",
      text: "水罐见底之前，信任先见了底。每个群体都证明了自己的需求更紧急，旧渠只剩下被反复争抢的泥。",
      note: "旱季不会制造分裂，它只是让原本存在的裂缝显出来。",
    },
  },
];

export const BRIDGE_QUEST = {
  id: "canal_bridge",
  title: "旧渠木桥",
  description: "旧渠上的人行木桥断了。修好它，才能让上游的草料车重新进村。",
  deadlineDays: 7,
  retryDays: 7,
  signs: {
    farm: { x: 560, y: 620, label: "查看修桥路牌" },
    city: { x: 760, y: 590, label: "查看城市回报路牌" },
    port: { x: 840, y: 640, label: "查看港口交货路牌" },
    council: { x: 700, y: 620, label: "查看议事厅盖章路牌" },
  },
  steps: [
    {
      id: "repair",
      scene: "farm",
      x: 560,
      y: 620,
      label: "修整旧渠桥桩",
      actionLabel: "修桥",
      detail: "用 40 金和 2 份矿铜加固桥桩。矿铜会留在桥里，不会因订单失败而丢失。",
      cost: { coins: 40, ore: 2 },
    },
    {
      id: "deliver",
      scene: "port",
      x: 840,
      y: 640,
      label: "把桥板送到港口",
      actionLabel: "交付桥板",
      detail: "把 2 枚鸡蛋交给港口的木匠换桥板。桥板会留在货栈，等你回来继续。",
      cost: { egg: 2 },
    },
    {
      id: "council",
      scene: "council",
      x: 700,
      y: 620,
      label: "在议事厅为修桥盖章",
      actionLabel: "议事盖章",
      detail: "让议事厅确认修桥是公共工程，而不是某一家的私事。",
    },
    {
      id: "reward",
      scene: "city",
      x: 760,
      y: 590,
      label: "回城市路牌领取回报",
      actionLabel: "领取回报",
      detail: "桥修好后，城市会支付 90 金，并记下一次公共行动的信用。",
      reward: { coins: 90, civic: 1, community: 2 },
    },
  ],
};

export const WEEKLY_REQUEST_TEMPLATES = [
  {
    id: "school_soup",
    title: "学校汤锅",
    description: "村小学这周要给孩子和值夜家长准备热汤。",
    requirements: { turnip: 2, egg: 2 },
    reward: 120,
    civic: 1,
    reputation: 2,
  },
  {
    id: "clinic_milk",
    title: "诊所加餐",
    description: "诊所希望给恢复期的病人准备牛奶和根茎。",
    requirements: { milk: 1, potato: 2 },
    reward: 150,
    civic: 1,
    reputation: 2,
  },
  {
    id: "harbor_breakfast",
    title: "港口早班",
    description: "早班装卸工需要一份能带上船的早餐。",
    requirements: { egg: 1, milk: 1, turnip: 1 },
    reward: 135,
    civic: 1,
    reputation: 2,
  },
  {
    id: "weaver_straw",
    title: "织坊草料",
    description: "旧织坊要修补公共坐垫，收一些羊毛和干草。",
    requirements: { wool: 1, turnip: 1 },
    reward: 145,
    civic: 1,
    reputation: 2,
  },
];

export const SHIPPING_ROUTES = {
  cooperative: {
    id: "cooperative",
    name: "合作社慢船",
    shortName: "合作社",
    description: "每天上午 08:00 发船，价格稳定，手续费低。",
    departMinute: 8 * 60,
    arrivalDays: 1,
    feeRate: 0.02,
    priceMultiplier: 1,
    risk: 0,
  },
  coastal: {
    id: "coastal",
    name: "近海快线",
    shortName: "近海",
    description: "每天中午 12:00 发船，第二天到港，价格略高、手续费中等。",
    departMinute: 12 * 60,
    arrivalDays: 1,
    feeRate: 0.05,
    priceMultiplier: 1.12,
    risk: 0.08,
  },
  ocean: {
    id: "ocean",
    name: "远洋货轮",
    shortName: "远洋",
    description: "每天下午 16:00 发船，两天后到港，报价最高但会受市场波动影响。",
    departMinute: 16 * 60,
    arrivalDays: 2,
    feeRate: 0.08,
    priceMultiplier: 1.28,
    risk: 0.22,
  },
};

export const FESTIVALS = {
  tide_lantern: {
    id: "tide_lantern",
    name: "潮灯节",
    season: "夏",
    day: 14,
    scene: "port",
    description: "港口把灯船推到水面，摊位和临时订单只在这一天出现。",
    activities: [
      { id: "soup", x: 600, y: 560, label: "尝一碗节日汤", cost: { coins: 10 }, community: 1, detail: "给夜班船工留一碗热汤。" },
      { id: "lantern", x: 760, y: 560, label: "折一盏潮灯", cost: { turnip: 1 }, community: 1, detail: "把一盏写有村名的灯放上灯船。" },
      { id: "crate", x: 900, y: 560, label: "帮船工搬一箱货", cost: {}, reputation: 1, detail: "把临时订单搬上灯船，换来船工的信任。" },
    ],
    reward: { coins: 80, civic: 1, community: 2 },
  },
};

export const BIRTHDAYS = {
  mayor: { season: "春", day: 12 },
  merchant: { season: "夏", day: 8 },
  spriteKeeper: { season: "秋", day: 3 },
  islandChild: { season: "夏", day: 20 },
  quarryForeman: { season: "冬", day: 5 },
  farmerLuo: { season: "春", day: 24 },
  archivist: { season: "秋", day: 16 },
  cook: { season: "冬", day: 18 },
};

export const TIPS = [
  "浇水后的作物会在过夜时生长。雨天会自动浇灌所有田地。",
  "照料牲畜后，它们会在第二天留下鸡蛋、牛奶或羊毛。",
  "体力用尽时，回屋休息。这个游戏没有失败惩罚，只有不同选择的后果。",
  "牧心会根据你的行动生成记忆与预测。它记得的不一定就是全部事实。",
  "旧水渠的线索可以交叉核对。档案、老人和石碑，可能会给出不同的答案。",
];

export function getInteractionById(id) {
  return INTERACTIONS.find((interaction) => interaction.id === id) || null;
}

export function toolById(id) {
  return TOOLS.find((tool) => tool.id === id) || TOOLS[0];
}
