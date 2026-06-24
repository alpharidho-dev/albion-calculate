/**
 * AlbionCalculate — Game Constants
 * All Albion Online game data: cities, tiers, taxes, return rates, resources
 */

// === City Bonuses ===
export const CITIES = {
  'Fort Sterling': {
    id: 'fort-sterling',
    color: '#94A3B8',
    refiningBonus: 'ore',
    craftingBonus: ['plate_armor', 'tools', 'offhand_shields'],
    farmBonus: ['turnips'],
    dotClass: 'fort-sterling'
  },
  'Lymhurst': {
    id: 'lymhurst',
    color: '#22C55E',
    refiningBonus: 'fiber',
    craftingBonus: ['bows', 'leather_armor', 'leather_shoes'],
    farmBonus: ['pumpkins'],
    dotClass: 'lymhurst'
  },
  'Bridgewatch': {
    id: 'bridgewatch',
    color: '#F97316',
    refiningBonus: 'hide',
    craftingBonus: ['crossbows', 'cloth_armor', 'plate_boots'],
    farmBonus: ['corn'],
    dotClass: 'bridgewatch'
  },
  'Martlock': {
    id: 'martlock',
    color: '#3B82F6',
    refiningBonus: 'stone',
    craftingBonus: ['hammers', 'heavy_maces', 'plate_helmets'],
    farmBonus: ['potatoes'],
    dotClass: 'martlock'
  },
  'Thetford': {
    id: 'thetford',
    color: '#A855F7',
    refiningBonus: 'wood',
    craftingBonus: ['staves', 'cloth_robes', 'leather_hoods'],
    farmBonus: ['cabbages'],
    dotClass: 'thetford'
  },
  'Caerleon': {
    id: 'caerleon',
    color: '#EF4444',
    refiningBonus: null,
    craftingBonus: [],
    farmBonus: [],
    blackMarket: true,
    dotClass: 'caerleon'
  },
  'Brecilien': {
    id: 'brecilien',
    color: '#14B8A6',
    refiningBonus: null,
    craftingBonus: [],
    farmBonus: [],
    dotClass: 'brecilien'
  }
};

export const CITY_NAMES = Object.keys(CITIES);

// === Market Fees ===
export const MARKET_SETUP_FEE = 0.025;        // 2.5% listing fee (non-refundable)
export const MARKET_SALES_TAX_NORMAL = 0.08;   // 8% for non-premium or standard
export const MARKET_SALES_TAX_PREMIUM = 0.04;  // 4% with premium (50% reduction)
export const BLACK_MARKET_TAX = 0;             // Black market has no tax

// === Resource Return Rate ===
export const BASE_CRAFTING_RRR = 0.15;         // 15% base for crafting
export const BASE_REFINING_RRR = 0.15;         // 15% base for refining
export const CITY_REFINING_BONUS = 0.367;      // 36.7% bonus in correct city for refining
export const CITY_CRAFTING_BONUS = 0.15;       // 15% bonus in correct city for crafting
export const FOCUS_CRAFTING_RRR = 0.437;       // ~43.7% additional with focus (spec dependent)
export const FOCUS_REFINING_RRR = 0.437;       // ~43.7% additional with focus

// === Tiers ===
export const TIERS = [
  { value: 2, label: 'T2', name: 'Tier 2 - Novice' },
  { value: 3, label: 'T3', name: 'Tier 3 - Journeyman' },
  { value: 4, label: 'T4', name: 'Tier 4 - Adept' },
  { value: 5, label: 'T5', name: 'Tier 5 - Expert' },
  { value: 6, label: 'T6', name: 'Tier 6 - Master' },
  { value: 7, label: 'T7', name: 'Tier 7 - Grandmaster' },
  { value: 8, label: 'T8', name: 'Tier 8 - Elder' }
];

export const ENCHANTMENTS = [
  { value: 0, label: '.0', name: 'No Enchantment' },
  { value: 1, label: '.1', name: 'Enchantment 1' },
  { value: 2, label: '.2', name: 'Enchantment 2' },
  { value: 3, label: '.3', name: 'Enchantment 3' },
  { value: 4, label: '.4', name: 'Enchantment 4' }
];

// === Resource Types ===
export const RESOURCE_TYPES = {
  ore: {
    name: 'Ore / Metal',
    icon: '⛏️',
    raw: 'Ore',
    refined: 'Metal Bar',
    bonusCity: 'Fort Sterling',
    tiers: {
      2: { raw: 'T2_ORE', refined: 'T2_METALBAR' },
      3: { raw: 'T3_ORE', refined: 'T3_METALBAR' },
      4: { raw: 'T4_ORE', refined: 'T4_METALBAR' },
      5: { raw: 'T5_ORE', refined: 'T5_METALBAR' },
      6: { raw: 'T6_ORE', refined: 'T6_METALBAR' },
      7: { raw: 'T7_ORE', refined: 'T7_METALBAR' },
      8: { raw: 'T8_ORE', refined: 'T8_METALBAR' }
    }
  },
  fiber: {
    name: 'Fiber / Cloth',
    icon: '🧵',
    raw: 'Fiber',
    refined: 'Cloth',
    bonusCity: 'Lymhurst',
    tiers: {
      2: { raw: 'T2_FIBER', refined: 'T2_CLOTH' },
      3: { raw: 'T3_FIBER', refined: 'T3_CLOTH' },
      4: { raw: 'T4_FIBER', refined: 'T4_CLOTH' },
      5: { raw: 'T5_FIBER', refined: 'T5_CLOTH' },
      6: { raw: 'T6_FIBER', refined: 'T6_CLOTH' },
      7: { raw: 'T7_FIBER', refined: 'T7_CLOTH' },
      8: { raw: 'T8_FIBER', refined: 'T8_CLOTH' }
    }
  },
  hide: {
    name: 'Hide / Leather',
    icon: '🐄',
    raw: 'Hide',
    refined: 'Leather',
    bonusCity: 'Bridgewatch',
    tiers: {
      2: { raw: 'T2_HIDE', refined: 'T2_LEATHER' },
      3: { raw: 'T3_HIDE', refined: 'T3_LEATHER' },
      4: { raw: 'T4_HIDE', refined: 'T4_LEATHER' },
      5: { raw: 'T5_HIDE', refined: 'T5_LEATHER' },
      6: { raw: 'T6_HIDE', refined: 'T6_LEATHER' },
      7: { raw: 'T7_HIDE', refined: 'T7_LEATHER' },
      8: { raw: 'T8_HIDE', refined: 'T8_LEATHER' }
    }
  },
  stone: {
    name: 'Stone / Stone Block',
    icon: '🪨',
    raw: 'Stone',
    refined: 'Stone Block',
    bonusCity: 'Martlock',
    tiers: {
      2: { raw: 'T2_ROCK', refined: 'T2_STONEBLOCK' },
      3: { raw: 'T3_ROCK', refined: 'T3_STONEBLOCK' },
      4: { raw: 'T4_ROCK', refined: 'T4_STONEBLOCK' },
      5: { raw: 'T5_ROCK', refined: 'T5_STONEBLOCK' },
      6: { raw: 'T6_ROCK', refined: 'T6_STONEBLOCK' },
      7: { raw: 'T7_ROCK', refined: 'T7_STONEBLOCK' },
      8: { raw: 'T8_ROCK', refined: 'T8_STONEBLOCK' }
    }
  },
  wood: {
    name: 'Wood / Planks',
    icon: '🪵',
    raw: 'Wood',
    refined: 'Planks',
    bonusCity: 'Thetford',
    tiers: {
      2: { raw: 'T2_WOOD', refined: 'T2_PLANKS' },
      3: { raw: 'T3_WOOD', refined: 'T3_PLANKS' },
      4: { raw: 'T4_WOOD', refined: 'T4_PLANKS' },
      5: { raw: 'T5_WOOD', refined: 'T5_PLANKS' },
      6: { raw: 'T6_WOOD', refined: 'T6_PLANKS' },
      7: { raw: 'T7_WOOD', refined: 'T7_PLANKS' },
      8: { raw: 'T8_WOOD', refined: 'T8_PLANKS' }
    }
  }
};

// === Refining Ratios (raw needed per refined output) ===
// T2: 1 raw → 1 refined, T3+: 2 raw of same tier + 1 refined of previous tier
export const REFINING_RATIOS = {
  2: { sameTier: 1, prevTier: 0 },
  3: { sameTier: 2, prevTier: 1 },
  4: { sameTier: 2, prevTier: 1 },
  5: { sameTier: 3, prevTier: 1 },
  6: { sameTier: 4, prevTier: 1 },
  7: { sameTier: 5, prevTier: 1 },
  8: { sameTier: 5, prevTier: 1 }
};

// === Gathering Zones ===
export const ZONES = {
  blue: { name: 'Blue Zone', risk: 'Safe', multiplier: 1.0, color: '#3B82F6' },
  yellow: { name: 'Yellow Zone', risk: 'Low Risk', multiplier: 1.0, color: '#FBBF24' },
  red: { name: 'Red Zone', risk: 'Full Loot PvP', multiplier: 1.2, color: '#EF4444' },
  black: { name: 'Black Zone', risk: 'Full Loot PvP', multiplier: 1.5, color: '#1F2937' },
  mist: { name: 'Roads of Avalon', risk: 'Full Loot PvP', multiplier: 1.3, color: '#8B5CF6' }
};

// === Gathering Rates (approximate units per hour per tier) ===
export const GATHERING_RATES = {
  4: { base: 800, premium: 960 },
  5: { base: 600, premium: 720 },
  6: { base: 400, premium: 480 },
  7: { base: 250, premium: 300 },
  8: { base: 150, premium: 180 }
};

// === Labourer Types ===
export const LABOURER_TYPES = {
  blacksmith: { name: 'Blacksmith', resource: 'Metal Bar', journalPrefix: 'JOURNAL_WARRIOR' },
  tinker: { name: 'Tinker', resource: 'Metal Bar', journalPrefix: 'JOURNAL_TINKER' },
  fletcher: { name: 'Fletcher', resource: 'Planks', journalPrefix: 'JOURNAL_HUNTER' },
  imbuer: { name: 'Imbuer', resource: 'Cloth', journalPrefix: 'JOURNAL_MAGE' },
  gamekeeper: { name: 'Gamekeeper', resource: 'Leather', journalPrefix: 'JOURNAL_TOOLMAKER' },
  stonecutter: { name: 'Stonecutter', resource: 'Stone Block', journalPrefix: 'JOURNAL_STONECUTTER' },
  prospector: { name: 'Prospector', resource: 'Ore', journalPrefix: 'JOURNAL_ORE' },
  cropper: { name: 'Cropper', resource: 'Fiber', journalPrefix: 'JOURNAL_FIBER' },
  lumberjack: { name: 'Lumberjack', resource: 'Wood', journalPrefix: 'JOURNAL_WOOD' },
  quarrier: { name: 'Quarrier', resource: 'Stone', journalPrefix: 'JOURNAL_ROCK' },
  ranger: { name: 'Ranger', resource: 'Hide', journalPrefix: 'JOURNAL_HIDE' }
};

// === Labourer Returns per Tier (materials returned per full journal) ===
export const LABOURER_RETURNS = {
  2: 9, 3: 15, 4: 22, 5: 30, 6: 38, 7: 45, 8: 52
};

// === Farming Data ===
export const CROPS = {
  carrot: { name: 'Carrot', tier: 2, growTime: '22h', seedCost: 'T2_SEED_CARROT' },
  bean: { name: 'Bean', tier: 3, growTime: '22h', seedCost: 'T3_SEED_BEAN' },
  wheat: { name: 'Wheat', tier: 4, growTime: '22h', seedCost: 'T4_SEED_WHEAT' },
  turnip: { name: 'Turnip', tier: 5, growTime: '22h', seedCost: 'T5_SEED_TURNIP' },
  cabbage: { name: 'Cabbage', tier: 6, growTime: '22h', seedCost: 'T6_SEED_CABBAGE' },
  potato: { name: 'Potato', tier: 7, growTime: '22h', seedCost: 'T7_SEED_POTATO' },
  corn: { name: 'Corn', tier: 8, growTime: '22h', seedCost: 'T8_SEED_CORN' },
  pumpkin: { name: 'Pumpkin', tier: 9, growTime: '22h', seedCost: 'T9_SEED_PUMPKIN' }
};

export const HERBS = {
  agaric: { name: 'Agaric', tier: 2, growTime: '22h' },
  comfrey: { name: 'Comfrey', tier: 3, growTime: '22h' },
  burdock: { name: 'Burdock', tier: 4, growTime: '22h' },
  teasel: { name: 'Teasel', tier: 5, growTime: '22h' },
  foxglove: { name: 'Foxglove', tier: 6, growTime: '22h' },
  mullein: { name: 'Mullein', tier: 7, growTime: '22h' },
  yarrow: { name: 'Yarrow', tier: 8, growTime: '22h' }
};

// === Focus Points ===
export const DAILY_FOCUS = 10000;  // Focus regenerated per day with premium
export const MAX_FOCUS = 30000;    // Maximum focus cap

// === API Config ===
export const API_SERVERS = {
  west: { url: 'https://west.albion-online-data.com', label: 'West (Americas)' },
  east: { url: 'https://east.albion-online-data.com', label: 'East (Asia)' },
  europe: { url: 'https://europe.albion-online-data.com', label: 'Europe' }
};

export const DEFAULT_SERVER = 'east';

export const API_LOCATIONS = [
  'Caerleon', 'Bridgewatch', 'Fort Sterling', 'Lymhurst', 'Martlock', 'Thetford', 'Brecilien', 'Black Market'
];
