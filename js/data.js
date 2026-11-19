export const SAVE_KEY = "ranch-life-common-ground-save-v1";
export const SAVE_VERSION = 2;
export const DAY_LENGTH_MINUTES = 18 * 60;
export const DAY_START_MINUTES = 6 * 60;
export const NIGHT_MINUTES = 22 * 60;
export const REAL_SECONDS_PER_GAME_MINUTE = 0.22;

export const REGION_ORDER = ["farm", "city", "island", "trade", "government", "sprites"];

export const REGION_SCENE_MAP = {
  farm: "farm",
  city: "city",
  island: "island",
  trade: "port",
  government: "council",
  sprites: "workshop",
};

export const SCENE_REGION_MAP = Object.fromEntries(
  Object.entries(REGION_SCENE_MAP).map(([regionId, sceneId]) => [sceneId, regionId]),
);

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
  width: 1280,
  height: 720,
  bounds: { left: 62, top: 72, right: 1218, bottom: 698 },
  field: { x: 390, y: 326, cols: 7, rows: 3, tile: 56 },
  house: { x: 90, y: 50, w: 250, h: 175 },
  aiShed: { x: 355, y: 68, w: 170, h: 132 },
  pasture: { x: 780, y: 75, w: 420, h: 235 },
  pond: { x: 1035, y: 620, rx: 170, ry: 70 },
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

export const SCENE_INTERACTIONS = {
  city: [
    { id: "city_market", x: 430, y: 275, radius: 62, label: "进入城市建设处", keycap: "E" },
    { id: "city_council", x: 770, y: 275, radius: 62, label: "进入共同议事厅", keycap: "E" },
    { id: "city_workshop", x: 1080, y: 274, radius: 62, label: "进入小精灵工坊", keycap: "E" },
    { id: "city_mayor", x: 474, y: 526, radius: 58, label: "和市政官聊聊", keycap: "E" },
  ],
  port: [
    { id: "port_trade", x: 490, y: 275, radius: 62, label: "查看贸易航线", keycap: "E" },
    { id: "port_ferry", x: 850, y: 278, radius: 64, label: "乘蓝潮渡轮", keycap: "E" },
    { id: "port_shipping", x: 1114, y: 286, radius: 58, label: "打开港口出货箱", keycap: "E" },
    { id: "port_sailor", x: 500, y: 542, radius: 54, label: "和渡轮长聊聊", keycap: "E" },
  ],
  council: [
    { id: "council_government", x: 380, y: 364, radius: 64, label: "打开共同议政", keycap: "E" },
    { id: "council_water", x: 860, y: 366, radius: 64, label: "查看水章档案", keycap: "E" },
    { id: "council_clerk", x: 600, y: 566, radius: 54, label: "和议事员聊聊", keycap: "E" },
  ],
  workshop: [
    { id: "workshop_sprites", x: 234, y: 318, radius: 64, label: "打开小精灵工坊", keycap: "E" },
    { id: "workshop_garden", x: 640, y: 318, radius: 64, label: "查看精灵花园", keycap: "E" },
    { id: "workshop_keeper", x: 760, y: 566, radius: 54, label: "和精灵看守聊聊", keycap: "E" },
  ],
  island: [
    { id: "island_tidePool", x: 372, y: 342, radius: 60, label: "探索潮声湾", keycap: "E", spot: "tidePool" },
    { id: "island_silverBeach", x: 760, y: 342, radius: 60, label: "探索银沙滩", keycap: "E", spot: "silverBeach" },
    { id: "island_moonReef", x: 1100, y: 350, radius: 60, label: "探索月光礁", keycap: "E", spot: "moonReef" },
    { id: "island_redGarden", x: 590, y: 590, radius: 60, label: "探索赤潮花园", keycap: "E", spot: "redGarden" },
  ],
};

export const SCENE_NPCS = [
  {
    id: "mayor",
    name: "市政官沈禾",
    role: "河港市公共事务协调员",
    scenes: [
      { from: 6 * 60, to: 11 * 60, scene: "city", x: 474, y: 526 },
      { from: 11 * 60, to: 15 * 60, scene: "council", x: 600, y: 566 },
      { from: 15 * 60, to: 22 * 60, scene: "city", x: 474, y: 526 },
    ],
  },
  {
    id: "merchant",
    name: "港口商人岑岑",
    role: "贸易航线经纪人",
    scenes: [
      { from: 6 * 60, to: 13 * 60, scene: "port", x: 500, y: 542 },
      { from: 13 * 60, to: 18 * 60, scene: "city", x: 430, y: 275 },
      { from: 18 * 60, to: 22 * 60, scene: "port", x: 500, y: 542 },
    ],
  },
  {
    id: "spriteKeeper",
    name: "精灵看守白露",
    role: "小精灵工坊的照看人",
    scenes: [
      { from: 6 * 60, to: 10 * 60, scene: "workshop", x: 760, y: 566 },
      { from: 10 * 60, to: 16 * 60, scene: "island", x: 760, y: 342 },
      { from: 16 * 60, to: 22 * 60, scene: "workshop", x: 760, y: 566 },
    ],
  },
];

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
};

export const PRODUCTS = {
  turnip: { id: "turnip", name: "白萝卜", icon: "◒", sellPrice: 52, kind: "crop" },
  potato: { id: "potato", name: "土豆", icon: "◉", sellPrice: 84, kind: "crop" },
  strawberry: { id: "strawberry", name: "草莓", icon: "♥", sellPrice: 142, kind: "crop" },
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
  },
  ember: {
    id: "ember",
    name: "烬烬",
    icon: "◇",
    color: "#d78467",
    role: "animals",
    cost: 90,
    talent: "每天替你照料一只牲畜，优先照顾心情最低的那只。",
    unlockText: "完成 3 份贸易订单后出现。",
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
    color: "#d88645",
    accent: "#f3c577",
    line: "小橘把脑袋歪向一边，像是在确认你今天有没有忘记什么。",
  },
  {
    id: "sheep",
    name: "云朵",
    species: "绵羊",
    product: "wool",
    productEvery: 2,
    productText: "一团蓬松的羊毛",
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
  description: `${crop.days} 天成熟 · 售价 ${crop.sellPrice} 金`,
  kind: "seed",
}));

export const INTERACTIONS = [
  {
    id: "sleep",
    x: 216,
    y: 252,
    radius: 58,
    label: "回屋休息",
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
    x: 749,
    y: 250,
    radius: 52,
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
    text: "去技术棚找妹妹林澈",
    progress: () => "",
  },
  feedAnimals: {
    kicker: "第一章 · 牧场",
    text: "照料三只牲畜",
    progress: (state) => {
      const fed = state.animals.filter((animal) => animal.fed).length;
      return `${fed} / 3`;
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
};

export const DAILY_TASK_POOL = [
  {
    id: "water",
    text: "给 3 块田浇水",
    counter: "watered",
    target: 3,
    reward: 18,
  },
  {
    id: "feed",
    text: "照料牲畜",
    counter: "fed",
    target: 1,
    reward: 16,
  },
  {
    id: "harvest",
    text: "收获 1 份作物",
    counter: "harvested",
    target: 1,
    reward: 22,
  },
  {
    id: "talk",
    text: "和村里的人聊聊",
    counter: "talked",
    target: 1,
    reward: 12,
  },
  {
    id: "ship",
    text: "向出货箱交付 1 份产品",
    counter: "shipped",
    target: 1,
    reward: 18,
  },
  {
    id: "till",
    text: "开垦 2 块新土地",
    counter: "tilled",
    target: 2,
    reward: 16,
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
