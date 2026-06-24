/**
 * AlbionCalculate — Core Calculation Engine
 * All profit/loss formulas for Albion Online economy
 */

import {
  MARKET_SETUP_FEE,
  MARKET_SALES_TAX_NORMAL,
  MARKET_SALES_TAX_PREMIUM,
  BASE_CRAFTING_RRR,
  BASE_REFINING_RRR,
  CITY_REFINING_BONUS,
  CITY_CRAFTING_BONUS,
  FOCUS_CRAFTING_RRR,
  FOCUS_REFINING_RRR,
  REFINING_RATIOS
} from './constants.js';

/**
 * Calculate effective Resource Return Rate
 * @param {string} type - 'crafting' or 'refining'
 * @param {boolean} isBonusCity - Whether crafting/refining in the correct bonus city
 * @param {boolean} useFocus - Whether using focus
 * @param {number} specLevel - Specialization level (0-100, affects focus efficiency)
 * @returns {number} Effective return rate (0-1)
 */
export function calcEffectiveRRR(type, isBonusCity, useFocus, specLevel = 0) {
  let base = type === 'crafting' ? BASE_CRAFTING_RRR : BASE_REFINING_RRR;
  let cityBonus = 0;
  let focusBonus = 0;

  if (isBonusCity) {
    cityBonus = type === 'crafting' ? CITY_CRAFTING_BONUS : CITY_REFINING_BONUS;
  }

  if (useFocus) {
    // Focus RRR scales with spec level. At max spec, it's about 43.7%
    const focusBase = type === 'crafting' ? FOCUS_CRAFTING_RRR : FOCUS_REFINING_RRR;
    // Scale focus bonus with specialization (minimum 50% of max)
    const specMultiplier = 0.5 + (specLevel / 100) * 0.5;
    focusBonus = focusBase * specMultiplier;
  }

  const totalRRR = base + cityBonus + focusBonus;
  // Cap at 0.8 (80% max return rate in practice)
  return Math.min(totalRRR, 0.8);
}

/**
 * Calculate the effective material cost after resource returns
 * Using geometric series: effectiveCost = baseCost * (1 / (1 + RRR + RRR² + ...)) = baseCost * (1 - RRR)
 * @param {number} baseMaterialCost - Total cost of materials for one craft
 * @param {number} returnRate - Resource return rate (0-1)
 * @returns {number} Effective material cost
 */
export function calcEffectiveMaterialCost(baseMaterialCost, returnRate) {
  if (returnRate <= 0 || returnRate >= 1) return baseMaterialCost;
  // Geometric series formula: real cost = base * (1 - RRR)
  return baseMaterialCost * (1 - returnRate);
}

/**
 * Calculate total production cost for crafting
 * @param {Array<{price: number, quantity: number}>} materials - List of materials needed
 * @param {number} returnRate - Resource return rate
 * @param {number} stationFee - Crafting station usage fee (silver)
 * @param {number} focusCost - Focus points used (0 if not using focus)
 * @returns {object} {baseCost, effectiveCost, stationFee, totalCost}
 */
export function calcCraftingCost(materials, returnRate, stationFee = 0, focusCost = 0) {
  const baseCost = materials.reduce((sum, m) => sum + (m.price * m.quantity), 0);
  const effectiveCost = calcEffectiveMaterialCost(baseCost, returnRate);

  return {
    baseCost: Math.round(baseCost),
    effectiveCost: Math.round(effectiveCost),
    materialSaved: Math.round(baseCost - effectiveCost),
    stationFee: Math.round(stationFee),
    totalCost: Math.round(effectiveCost + stationFee),
    focusCost
  };
}

/**
 * Calculate market profit after selling
 * @param {number} sellPrice - Sell price per unit
 * @param {number} quantity - Number of units sold
 * @param {number} totalCost - Total production cost
 * @param {boolean} isPremium - Whether player has premium (reduces tax)
 * @returns {object} Profit breakdown
 */
export function calcMarketProfit(sellPrice, quantity, totalCost, isPremium = false) {
  const grossRevenue = sellPrice * quantity;
  const setupFee = Math.round(grossRevenue * MARKET_SETUP_FEE);
  const salesTaxRate = isPremium ? MARKET_SALES_TAX_PREMIUM : MARKET_SALES_TAX_NORMAL;
  const salesTax = Math.round(grossRevenue * salesTaxRate);
  const netRevenue = grossRevenue - setupFee - salesTax;
  const netProfit = netRevenue - totalCost;
  const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
  const profitPerUnit = quantity > 0 ? Math.round(netProfit / quantity) : 0;

  return {
    grossRevenue: Math.round(grossRevenue),
    setupFee,
    salesTax,
    salesTaxRate,
    netRevenue: Math.round(netRevenue),
    totalCost: Math.round(totalCost),
    netProfit: Math.round(netProfit),
    profitMargin: Math.round(profitMargin * 100) / 100,
    profitPerUnit,
    isProfit: netProfit > 0
  };
}

/**
 * Calculate Break Even Price — minimum sell price to not lose silver
 * @param {number} totalCost - Total production cost
 * @param {number} quantity - Number of items
 * @param {boolean} isPremium - Premium status
 * @returns {number} Minimum sell price per unit
 */
export function calcBreakEven(totalCost, quantity = 1, isPremium = false) {
  const taxRate = isPremium ? MARKET_SALES_TAX_PREMIUM : MARKET_SALES_TAX_NORMAL;
  // sellPrice - (sellPrice * setupFee) - (sellPrice * salesTax) = cost/quantity
  // sellPrice * (1 - setupFee - salesTax) = cost/quantity
  const costPerUnit = totalCost / quantity;
  const breakEven = costPerUnit / (1 - MARKET_SETUP_FEE - taxRate);
  return Math.ceil(breakEven);
}

/**
 * Calculate focus efficiency (silver earned per focus point)
 * @param {number} profitWithFocus - Net profit when using focus
 * @param {number} profitWithoutFocus - Net profit when NOT using focus
 * @param {number} focusCost - Focus points consumed
 * @returns {number} Silver per focus point
 */
export function calcFocusEfficiency(profitWithFocus, profitWithoutFocus, focusCost) {
  if (focusCost <= 0) return 0;
  return Math.round((profitWithFocus - profitWithoutFocus) / focusCost * 100) / 100;
}

/**
 * Calculate refining profit
 * @param {number} tier - Resource tier (2-8)
 * @param {number} rawPrice - Price of raw resource (same tier)
 * @param {number} prevRefinedPrice - Price of refined resource of previous tier (0 for T2)
 * @param {number} refinedPrice - Price of refined resource output
 * @param {number} returnRate - Resource return rate
 * @param {number} quantity - Number of refined items to produce
 * @param {boolean} isPremium - Premium status
 * @returns {object} Refining profit breakdown
 */
export function calcRefiningProfit(tier, rawPrice, prevRefinedPrice, refinedPrice, returnRate, quantity = 1, isPremium = false) {
  const ratio = REFINING_RATIOS[tier];
  if (!ratio) return null;

  // Cost per 1 refined item (before return rate)
  const rawCostPerUnit = rawPrice * ratio.sameTier + prevRefinedPrice * ratio.prevTier;
  // Effective cost with return rate
  const effectiveCostPerUnit = rawCostPerUnit * (1 - returnRate);
  const totalCost = effectiveCostPerUnit * quantity;

  // Profit from selling
  const result = calcMarketProfit(refinedPrice, quantity, totalCost, isPremium);

  // Comparison: sell raw vs sell refined
  const rawSellRevenue = rawPrice * ratio.sameTier * quantity;
  const rawSetupFee = Math.round(rawSellRevenue * MARKET_SETUP_FEE);
  const rawTaxRate = isPremium ? MARKET_SALES_TAX_PREMIUM : MARKET_SALES_TAX_NORMAL;
  const rawSalesTax = Math.round(rawSellRevenue * rawTaxRate);
  const rawNetRevenue = rawSellRevenue - rawSetupFee - rawSalesTax;

  return {
    ...result,
    rawCostPerUnit: Math.round(rawCostPerUnit),
    effectiveCostPerUnit: Math.round(effectiveCostPerUnit),
    rawNeeded: ratio.sameTier * quantity,
    prevRefinedNeeded: ratio.prevTier * quantity,
    materialSaved: Math.round((rawCostPerUnit - effectiveCostPerUnit) * quantity),
    sellRawProfit: Math.round(rawNetRevenue),
    refineBenefit: Math.round(result.netRevenue - rawNetRevenue)
  };
}

/**
 * Calculate gathering profit per hour
 * @param {number} resourcePrice - Market price per resource unit
 * @param {number} gatherRate - Units gathered per hour
 * @param {number} toolCost - Cost of gathering tool
 * @param {number} toolDurability - Number of gathers before tool breaks
 * @param {number} foodCost - Cost of food per hour
 * @param {number} mountCost - Cost of mount (amortized over expected lifespan hours)
 * @param {boolean} isPremium - Premium status
 * @returns {object} Gathering profit breakdown
 */
export function calcGatheringProfit(resourcePrice, gatherRate, toolCost = 0, toolDurability = 6000, foodCost = 0, mountCost = 0, isPremium = false) {
  const grossIncomePerHour = resourcePrice * gatherRate;
  const taxRate = isPremium ? MARKET_SALES_TAX_PREMIUM : MARKET_SALES_TAX_NORMAL;
  const taxes = grossIncomePerHour * (MARKET_SETUP_FEE + taxRate);
  const toolCostPerHour = toolDurability > 0 ? (toolCost / toolDurability) * gatherRate : 0;

  const totalCostsPerHour = toolCostPerHour + foodCost + mountCost;
  const netProfitPerHour = grossIncomePerHour - taxes - totalCostsPerHour;

  // Hours to pay off tool
  const hoursToPayOff = netProfitPerHour > 0 ? toolCost / netProfitPerHour : Infinity;

  return {
    grossIncomePerHour: Math.round(grossIncomePerHour),
    taxes: Math.round(taxes),
    toolCostPerHour: Math.round(toolCostPerHour),
    foodCost: Math.round(foodCost),
    mountCost: Math.round(mountCost),
    totalCosts: Math.round(totalCostsPerHour),
    netProfitPerHour: Math.round(netProfitPerHour),
    hoursToPayOff: Math.round(hoursToPayOff * 10) / 10,
    isProfit: netProfitPerHour > 0
  };
}

/**
 * Calculate market flipping margin
 * @param {number} buyPrice - Buy order price
 * @param {number} sellPrice - Sell order price
 * @param {number} quantity - Number of items
 * @param {boolean} isPremium - Premium status
 * @returns {object} Flipping profit breakdown
 */
export function calcFlippingProfit(buyPrice, sellPrice, quantity, isPremium = false) {
  const taxRate = isPremium ? MARKET_SALES_TAX_PREMIUM : MARKET_SALES_TAX_NORMAL;

  // Buying costs
  const totalBuyCost = buyPrice * quantity;
  const buySetupFee = Math.round(totalBuyCost * MARKET_SETUP_FEE);

  // Selling revenue
  const grossSellRevenue = sellPrice * quantity;
  const sellSetupFee = Math.round(grossSellRevenue * MARKET_SETUP_FEE);
  const salesTax = Math.round(grossSellRevenue * taxRate);

  const totalInvestment = totalBuyCost + buySetupFee;
  const netSellRevenue = grossSellRevenue - sellSetupFee - salesTax;
  const netProfit = netSellRevenue - totalInvestment;
  const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
  const marginPerUnit = quantity > 0 ? Math.round(netProfit / quantity) : 0;

  return {
    totalBuyCost: Math.round(totalBuyCost),
    buySetupFee,
    totalInvestment: Math.round(totalInvestment),
    grossSellRevenue: Math.round(grossSellRevenue),
    sellSetupFee,
    salesTax,
    netSellRevenue: Math.round(netSellRevenue),
    netProfit: Math.round(netProfit),
    roi: Math.round(roi * 100) / 100,
    marginPerUnit,
    isProfit: netProfit > 0
  };
}

/**
 * Calculate farming profit per cycle
 * @param {number} seedCost - Cost of seeds/babies
 * @param {number} seedQuantity - Number of seeds planted
 * @param {number} feedCost - Cost of food/water per cycle
 * @param {number} harvestPrice - Market price of harvest
 * @param {number} baseYield - Base yield per seed
 * @param {number} bonusYieldChance - Chance of bonus yield (0-1)
 * @param {boolean} useFocus - Using focus
 * @param {boolean} isPremium - Premium status
 * @returns {object} Farming profit breakdown
 */
export function calcFarmingProfit(seedCost, seedQuantity, feedCost, harvestPrice, baseYield, bonusYieldChance = 0, useFocus = false, isPremium = false) {
  const totalSeedCost = seedCost * seedQuantity;
  const totalFeedCost = feedCost * seedQuantity;
  const totalInvestment = totalSeedCost + totalFeedCost;

  // Calculate expected harvest
  let expectedYield = baseYield * seedQuantity;
  if (useFocus) {
    bonusYieldChance += 0.3; // Focus adds ~30% extra yield chance
  }
  expectedYield *= (1 + bonusYieldChance);

  // Expected seed returns (usually ~1 seed per plant for sustainability)
  const expectedSeedReturn = seedQuantity * (useFocus ? 1.5 : 1.0);
  const seedReturnValue = expectedSeedReturn * seedCost;

  // Revenue from selling
  const grossRevenue = Math.round(expectedYield) * harvestPrice;
  const taxRate = isPremium ? MARKET_SALES_TAX_PREMIUM : MARKET_SALES_TAX_NORMAL;
  const taxes = Math.round(grossRevenue * (MARKET_SETUP_FEE + taxRate));
  const netRevenue = grossRevenue - taxes + seedReturnValue;
  const netProfit = netRevenue - totalInvestment;

  return {
    totalInvestment: Math.round(totalInvestment),
    totalSeedCost: Math.round(totalSeedCost),
    totalFeedCost: Math.round(totalFeedCost),
    expectedYield: Math.round(expectedYield),
    expectedSeedReturn: Math.round(expectedSeedReturn),
    grossRevenue: Math.round(grossRevenue),
    taxes: Math.round(taxes),
    netRevenue: Math.round(netRevenue),
    netProfit: Math.round(netProfit),
    isProfit: netProfit > 0
  };
}

/**
 * Calculate labourer journal profit
 * @param {number} emptyJournalCost - Cost to buy empty journal
 * @param {number} fullJournalSellPrice - Price to sell full journal
 * @param {number} materialReturnValue - Value of materials returned
 * @param {number} materialCount - Number of materials returned
 * @param {number} happiness - Labourer happiness (0-1)
 * @returns {object} Labourer profit breakdown
 */
export function calcLabourerProfit(emptyJournalCost, fullJournalSellPrice, materialReturnValue, materialCount, happiness = 1.0) {
  const adjustedReturn = Math.round(materialCount * happiness);
  const returnValue = adjustedReturn * materialReturnValue;
  const totalIncome = returnValue;
  const netProfit = totalIncome - emptyJournalCost;
  // Alternative: sell full journal instead of using
  const journalFlipProfit = fullJournalSellPrice - emptyJournalCost;

  return {
    emptyJournalCost: Math.round(emptyJournalCost),
    adjustedReturn,
    returnValue: Math.round(returnValue),
    netProfit: Math.round(netProfit),
    journalFlipProfit: Math.round(journalFlipProfit),
    bestOption: netProfit > journalFlipProfit ? 'use' : 'sell',
    isProfit: netProfit > 0
  };
}

/**
 * Calculate transmutation profit
 * @param {number} sourceCost - Cost of source material
 * @param {number} transmuteFee - Silver cost of transmutation
 * @param {number} targetPrice - Market price of target material
 * @param {number} quantity - Number of transmutations
 * @param {boolean} isPremium - Premium status
 * @returns {object} Transmutation profit breakdown
 */
export function calcTransmutationProfit(sourceCost, transmuteFee, targetPrice, quantity = 1, isPremium = false) {
  const totalInputCost = (sourceCost + transmuteFee) * quantity;
  const grossRevenue = targetPrice * quantity;
  const taxRate = isPremium ? MARKET_SALES_TAX_PREMIUM : MARKET_SALES_TAX_NORMAL;
  const taxes = Math.round(grossRevenue * (MARKET_SETUP_FEE + taxRate));
  const netRevenue = grossRevenue - taxes;
  const netProfit = netRevenue - totalInputCost;

  // Compare with just selling source material
  const sellDirectTaxes = Math.round((sourceCost * quantity) * (MARKET_SETUP_FEE + taxRate));
  const sellDirectProfit = (sourceCost * quantity) - sellDirectTaxes;

  return {
    totalInputCost: Math.round(totalInputCost),
    sourceCostTotal: Math.round(sourceCost * quantity),
    transmuteFeeTotal: Math.round(transmuteFee * quantity),
    grossRevenue: Math.round(grossRevenue),
    taxes: Math.round(taxes),
    netRevenue: Math.round(netRevenue),
    netProfit: Math.round(netProfit),
    sellDirectProfit: Math.round(sellDirectProfit),
    recommendation: netProfit > sellDirectProfit ? 'transmute' : 'sell_direct',
    isProfit: netProfit > 0
  };
}
