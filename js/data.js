export const SAVE_KEY = "ranch-life-common-ground-save-v1";
export const SAVE_VERSION = 1;
export const DAY_LENGTH_MINUTES = 18 * 60;
export const DAY_START_MINUTES = 6 * 60;
export const NIGHT_MINUTES = 22 * 60;
export const REAL_SECONDS_PER_GAME_MINUTE = 0.22;

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
