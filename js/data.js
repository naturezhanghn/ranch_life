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
  turnip: { seasons: ["春", "秋"], regrowDays: 0, note: "凉爽季节作物" },
  potato: { seasons: ["春", "秋"], regrowDays: 0, note: "地下块茎" },
  strawberry: { seasons: ["春"], regrowDays: 3, note: "收获后 3 天再次结果" },
};
export const FORAGE_TABLE = {
  春: [{ id: "spring_herb", name: "春芽草", icon: "❋", price: 28, chance: 0.7 }],
  夏: [{ id: "summer_berry", name: "夏莓", icon: "●", price: 42, chance: 0.65 }],
  秋: [{ id: "autumn_mushroom", name: "秋野菇", icon: "◉", price: 68, chance: 0.58 }],
  冬: [{ id: "winter_root", name: "雪下根", icon: "◇", price: 82, chance: 0.45 }],
};
export const FORAGE_NODE_DEFS = [
  {
    id: "farm_rain_trail",
    interactionId: "forage",
    scene: "farm",
    x: 610,
    y: 180,
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
];
export const HOUSE_UPGRADES = [
  { level: 1, cost: 260, title: "增筑小屋", features: ["冰箱", "储物柜"], description: "解锁冰箱与额外储物空间。" },
  { level: 2, cost: 520, title: "厨房扩建", features: ["厨房", "料理台"], description: "解锁厨房料理，料理可恢复体力并提高关系。" },
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
  city: [
    { id: "city_market", x: 430, y: 275, radius: 62, label: "进入城市建设处", keycap: "E" },
    { id: "city_mayor", x: 474, y: 526, radius: 58, label: "和市政官聊聊", keycap: "E" },
    { id: "city_forage", x: 310, y: 520, radius: 58, label: "寻找村口山货", keycap: "E", forageNode: true },
    { id: "city_weekly", x: 700, y: 560, radius: 54, label: "查看本周公共请求", keycap: "E" },
  ],
  council: [
    { id: "council_government", x: 380, y: 364, radius: 64, label: "打开共同议政", keycap: "E" },
    { id: "council_water", x: 860, y: 366, radius: 64, label: "查看水章档案", keycap: "E" },
    { id: "council_clerk", x: 600, y: 566, radius: 54, label: "和议事员聊聊", keycap: "E" },
    { id: "council_weekly", x: 520, y: 620, radius: 54, label: "查看公共请求盖章台", keycap: "E" },
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
    { id: "island_patrol", x: 930, y: 500, radius: 58, label: "湿地巡护", keycap: "E", minigame: "hunt" },
    { id: "island_fishing", x: 1120, y: 570, radius: 58, label: "潮汐垂钓", keycap: "E", minigame: "fishing" },
  ],
  port: [
    { id: "port_trade", x: 490, y: 275, radius: 62, label: "查看贸易航线", keycap: "E" },
    { id: "port_ferry", x: 850, y: 278, radius: 64, label: "乘蓝潮渡轮", keycap: "E" },
    { id: "port_shipping", x: 1114, y: 286, radius: 58, label: "打开港口出货箱", keycap: "E" },
    { id: "port_sailor", x: 500, y: 542, radius: 54, label: "和渡轮长聊聊", keycap: "E" },
    { id: "port_delivery_run", x: 760, y: 520, radius: 58, label: "限时运货", keycap: "E", minigame: "delivery" },
    { id: "port_weekly", x: 900, y: 600, radius: 54, label: "查看本周收货牌", keycap: "E" },
  ],
  quarry: [
    { id: "quarry_vein", x: 620, y: 330, radius: 64, label: "旧矿脉采样", keycap: "E", minigame: "mining" },
  ],
};

export const SCENE_NPCS = [
  {
    id: "mayor",
    name: "市政官沈禾",
    role: "河港市公共事务协调员",
    speedRatio: 0.44,
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
    scenes: [
      { from: 6 * 60, to: 13 * 60, scene: "port", x: 500, y: 542, path: [{ x: 500, y: 542 }, { x: 640, y: 600 }] },
      { from: 13 * 60, to: 18 * 60, scene: "city", x: 430, y: 275, path: [{ x: 430, y: 275 }, { x: 560, y: 380 }] },
      { from: 18 * 60, to: 22 * 60, scene: "port", x: 500, y: 542, path: [{ x: 640, y: 600 }, { x: 500, y: 542 }] },
    ],
  },
  {
    id: "spriteKeeper",
    name: "精灵看守白露",
    role: "小精灵工坊的照看人",
    speedRatio: 0.39,
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
    scenes: [
      { from: 6 * 60, to: 12 * 60, scene: "quarry", x: 300, y: 560 },
      { from: 12 * 60, to: 17 * 60, scene: "city", x: 560, y: 580 },
      { from: 17 * 60, to: 22 * 60, scene: "quarry", x: 300, y: 560 },
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
};

export const MINIGAME_DEFS = {
  hunt: {
    id: "hunt",
    title: "湿地巡护",
    subtitle: "用声波脉冲驱离偷食谷物的斑翅雀，不伤害它们。",
    scene: "island",
    energy: 4,
    clockMinutes: 40,
    duration: 15,
    action: "点击/轻触鸟群；键盘用方向键移动准星，空格发射。金色候鸟稀有且只计入一次。",
    rewardNote: "普通驱离给补贴；每日最多捕获一次稀有候鸟，稀有收益进入贸易链。",
  },
  fishing: {
    id: "fishing",
    title: "潮汐垂钓",
    subtitle: "等待鱼咬钩，在指针进入绿区时收线。",
    scene: "island",
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
  { id: "forage", x: 610, y: 180, radius: 58, label: "寻找雨后足迹", keycap: "E", forageNode: true },
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
