/**
 * AlbionCalculate — Item Database
 * Comprehensive item IDs for Albion Online resources, materials, and gear
 */

// === Resource Items ===
export const RESOURCE_ITEMS = [];

// Generate resource items for all tiers
const resourceDefs = [
  { type: 'ORE', name: 'Ore', category: 'Raw Resource', icon: '⛏️' },
  { type: 'METALBAR', name: 'Metal Bar', category: 'Refined Resource', icon: '⛏️' },
  { type: 'FIBER', name: 'Fiber', category: 'Raw Resource', icon: '🧵' },
  { type: 'CLOTH', name: 'Cloth', category: 'Refined Resource', icon: '🧵' },
  { type: 'HIDE', name: 'Hide', category: 'Raw Resource', icon: '🐄' },
  { type: 'LEATHER', name: 'Leather', category: 'Refined Resource', icon: '🐄' },
  { type: 'ROCK', name: 'Stone', category: 'Raw Resource', icon: '🪨' },
  { type: 'STONEBLOCK', name: 'Stone Block', category: 'Refined Resource', icon: '🪨' },
  { type: 'WOOD', name: 'Wood', category: 'Raw Resource', icon: '🪵' },
  { type: 'PLANKS', name: 'Planks', category: 'Refined Resource', icon: '🪵' },
];

const tierNames = {
  2: 'Novice', 3: 'Journeyman', 4: 'Adept',
  5: 'Expert', 6: 'Master', 7: 'Grandmaster', 8: 'Elder'
};

for (const def of resourceDefs) {
  for (let tier = 2; tier <= 8; tier++) {
    // Base item (no enchantment)
    RESOURCE_ITEMS.push({
      id: `T${tier}_${def.type}`,
      name: `T${tier} ${def.name}`,
      fullName: `T${tier} ${tierNames[tier]}'s ${def.name}`,
      tier,
      enchantment: 0,
      category: def.category,
      icon: def.icon
    });

    // Enchanted versions for T4+
    if (tier >= 4) {
      for (let ench = 1; ench <= 4; ench++) {
        RESOURCE_ITEMS.push({
          id: `T${tier}_${def.type}_LEVEL${ench}@${ench}`,
          name: `T${tier}.${ench} ${def.name}`,
          fullName: `T${tier}.${ench} ${tierNames[tier]}'s ${def.name}`,
          tier,
          enchantment: ench,
          category: def.category,
          icon: def.icon
        });
      }
    }
  }
}

// === Common Crafted Items ===
export const CRAFTED_ITEMS = [
  // Bags
  { id: 'T4_BAG', name: 'T4 Bag', tier: 4, category: 'Accessory', icon: '🎒',
    materials: [{ id: 'T4_LEATHER', qty: 8 }] },
  { id: 'T5_BAG', name: 'T5 Bag', tier: 5, category: 'Accessory', icon: '🎒',
    materials: [{ id: 'T5_LEATHER', qty: 16 }] },
  { id: 'T6_BAG', name: 'T6 Bag', tier: 6, category: 'Accessory', icon: '🎒',
    materials: [{ id: 'T6_LEATHER', qty: 32 }] },
  { id: 'T7_BAG', name: 'T7 Bag', tier: 7, category: 'Accessory', icon: '🎒',
    materials: [{ id: 'T7_LEATHER', qty: 32 }] },
  { id: 'T8_BAG', name: 'T8 Bag', tier: 8, category: 'Accessory', icon: '🎒',
    materials: [{ id: 'T8_LEATHER', qty: 32 }] },

  // Capes
  { id: 'T4_CAPE', name: 'T4 Cape', tier: 4, category: 'Accessory', icon: '🧣',
    materials: [{ id: 'T4_CLOTH', qty: 4 }, { id: 'T4_LEATHER', qty: 4 }] },

  // Plate Armor (examples)
  { id: 'T4_HEAD_PLATE_SET1', name: 'T4 Soldier Helmet', tier: 4, category: 'Plate Armor', icon: '🪖',
    materials: [{ id: 'T4_METALBAR', qty: 16 }] },
  { id: 'T4_ARMOR_PLATE_SET1', name: 'T4 Soldier Armor', tier: 4, category: 'Plate Armor', icon: '🛡️',
    materials: [{ id: 'T4_METALBAR', qty: 32 }] },
  { id: 'T4_SHOES_PLATE_SET1', name: 'T4 Soldier Boots', tier: 4, category: 'Plate Armor', icon: '👢',
    materials: [{ id: 'T4_METALBAR', qty: 16 }] },

  // Leather Armor (examples)
  { id: 'T4_HEAD_LEATHER_SET1', name: 'T4 Mercenary Hood', tier: 4, category: 'Leather Armor', icon: '🪖',
    materials: [{ id: 'T4_LEATHER', qty: 16 }] },
  { id: 'T4_ARMOR_LEATHER_SET1', name: 'T4 Mercenary Jacket', tier: 4, category: 'Leather Armor', icon: '🦺',
    materials: [{ id: 'T4_LEATHER', qty: 32 }] },

  // Cloth Armor (examples)
  { id: 'T4_HEAD_CLOTH_SET1', name: 'T4 Scholar Cowl', tier: 4, category: 'Cloth Armor', icon: '🎩',
    materials: [{ id: 'T4_CLOTH', qty: 16 }] },
  { id: 'T4_ARMOR_CLOTH_SET1', name: 'T4 Scholar Robe', tier: 4, category: 'Cloth Armor', icon: '👘',
    materials: [{ id: 'T4_CLOTH', qty: 32 }] },

  // Weapons (examples)
  { id: 'T4_MAIN_SWORD', name: 'T4 Broadsword', tier: 4, category: 'Weapon', icon: '⚔️',
    materials: [{ id: 'T4_METALBAR', qty: 16 }] },
  { id: 'T4_2H_CLAYMORE', name: 'T4 Claymore', tier: 4, category: 'Weapon', icon: '⚔️',
    materials: [{ id: 'T4_METALBAR', qty: 32 }] },
  { id: 'T4_MAIN_BOW', name: 'T4 Bow', tier: 4, category: 'Weapon', icon: '🏹',
    materials: [{ id: 'T4_PLANKS', qty: 16 }] },
  { id: 'T4_MAIN_FIRESTAFF', name: 'T4 Fire Staff', tier: 4, category: 'Weapon', icon: '🔥',
    materials: [{ id: 'T4_PLANKS', qty: 16 }] },

  // Tools
  { id: 'T4_TOOL_PICKAXE', name: 'T4 Pickaxe', tier: 4, category: 'Tool', icon: '⛏️',
    materials: [{ id: 'T4_METALBAR', qty: 8 }, { id: 'T4_PLANKS', qty: 4 }] },
  { id: 'T5_TOOL_PICKAXE', name: 'T5 Pickaxe', tier: 5, category: 'Tool', icon: '⛏️',
    materials: [{ id: 'T5_METALBAR', qty: 8 }, { id: 'T5_PLANKS', qty: 4 }] },
  { id: 'T6_TOOL_PICKAXE', name: 'T6 Pickaxe', tier: 6, category: 'Tool', icon: '⛏️',
    materials: [{ id: 'T6_METALBAR', qty: 8 }, { id: 'T6_PLANKS', qty: 4 }] },
  { id: 'T4_TOOL_SICKLE', name: 'T4 Sickle', tier: 4, category: 'Tool', icon: '🌾',
    materials: [{ id: 'T4_METALBAR', qty: 8 }, { id: 'T4_PLANKS', qty: 4 }] },
  { id: 'T4_TOOL_AXE', name: 'T4 Lumber Axe', tier: 4, category: 'Tool', icon: '🪓',
    materials: [{ id: 'T4_METALBAR', qty: 8 }, { id: 'T4_PLANKS', qty: 4 }] },
  { id: 'T4_TOOL_HAMMER', name: 'T4 Stone Hammer', tier: 4, category: 'Tool', icon: '🔨',
    materials: [{ id: 'T4_METALBAR', qty: 8 }, { id: 'T4_PLANKS', qty: 4 }] },
  { id: 'T4_TOOL_KNIFE', name: 'T4 Skinning Knife', tier: 4, category: 'Tool', icon: '🔪',
    materials: [{ id: 'T4_METALBAR', qty: 8 }, { id: 'T4_PLANKS', qty: 4 }] },
];

// === All Items Combined ===
export const ALL_ITEMS = [...RESOURCE_ITEMS, ...CRAFTED_ITEMS];

/**
 * Search items by name (fuzzy)
 * @param {string} query - Search term
 * @param {number} limit - Max results
 * @returns {Array} Matching items
 */
export function searchItems(query, limit = 20) {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase().trim();

  // Score-based matching
  const scored = ALL_ITEMS
    .map(item => {
      const name = item.name.toLowerCase();
      const fullName = (item.fullName || item.name).toLowerCase();
      let score = 0;

      if (name === q) score = 100;
      else if (name.startsWith(q)) score = 80;
      else if (fullName.startsWith(q)) score = 70;
      else if (name.includes(q)) score = 50;
      else if (fullName.includes(q)) score = 40;
      else if (item.id.toLowerCase().includes(q)) score = 30;
      else if (item.category.toLowerCase().includes(q)) score = 20;

      return { ...item, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.tier - b.tier);

  return scored.slice(0, limit);
}

/**
 * Get item by ID
 * @param {string} id - Item ID
 * @returns {object|null}
 */
export function getItemById(id) {
  return ALL_ITEMS.find(item => item.id === id) || null;
}

/**
 * Get items by category
 * @param {string} category
 * @returns {Array}
 */
export function getItemsByCategory(category) {
  return ALL_ITEMS.filter(item => item.category === category);
}

/**
 * Get all categories
 * @returns {string[]}
 */
export function getCategories() {
  return [...new Set(ALL_ITEMS.map(item => item.category))];
}
