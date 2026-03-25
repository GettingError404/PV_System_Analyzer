import { getSystemRecommendation } from "@/utils/recommendation";

export interface Appliance {
  id: string;
  name: string;
  power: number;
  hours: number;
}

export interface SystemSettings {
  sunlightHours: number;
  sunlightMode: "manual" | "location";
  locationCity: string;
  batteryType: "lead-acid" | "lithium";
  systemVoltage: 12 | 24 | 48;
  chargeControllerType: "pwm" | "mppt";
  backupDurationValue: number;
  backupDurationUnit: "hours" | "days";
  efficiencyMode: "simple" | "advanced";
  efficiencyPercent: number;
  panelLossPercent: number;
  inverterLossPercent: number;
  temperatureLossPercent: number;
  gridAvailability: "yes" | "no";
  usagePattern: "daytime-heavy" | "nighttime-heavy" | "balanced";
  budgetLevel: "low" | "medium" | "high";
  seasonalMode: "standard" | "conservative" | "optimized";
  futureLoadGrowthPercent: number;
  electricityRate: number;
}

export type SolarSystemType = "on-grid" | "off-grid" | "hybrid";

export interface CalculationResults {
  totalEnergyWh: number;
  adjustedTotalEnergyWh: number;
  futureLoadGrowthPercent: number;
  peakLoadW: number;
  panelSizeW: number;
  currentPanelSizeW: number;
  currentPanelSizeKW: number;
  panelSizeKW: number;
  backupHours: number;
  efficiency: number;
  effectiveSunlightHours: number;
  batteryCapacityAh: number;
  currentBatteryCapacityAh: number;
  batteryWh: number;
  currentBatteryWh: number;
  controllerCurrent: number;
  controllerRating: number;
  controllerType: "pwm" | "mppt";
  recommendedSystemType: SolarSystemType;
  recommendationReason: string;
  tiltAngleDeg: number;
  optimizationSuggestions: string[];
  inverterSizeW: number;
}

export interface Insight {
  type: "info" | "warning";
  message: string;
}

export interface ConfigurationProfileResult {
  label: "Low-Cost Setup" | "High-Efficiency Setup";
  costTag: string;
  results: CalculationResults;
}

export interface ConfigurationComparisonResults {
  lowCost: ConfigurationProfileResult;
  highEfficiency: ConfigurationProfileResult;
}

export interface CostEstimate {
  panelCost: number;
  batteryCost: number;
  inverterCost: number;
  controllerCost: number;
  totalCost: number;
  subsidy: number;
  finalCost: number;
}

export interface RoiEstimate {
  monthlyUnits: number;
  monthlySavings: number;
  annualSavings: number;
  paybackYears: number;
  recoveryPerYearPercent: number;
}

const DOD: Record<string, number> = {
  "lead-acid": 0.5,
  lithium: 0.8,
};

const CITY_SUNLIGHT_HOURS: Record<string, number> = {
  "india average": 5.25,
  delhi: 5.2,
  mumbai: 5.1,
  bengaluru: 5.4,
  chennai: 5.6,
  kolkata: 4.9,
  hyderabad: 5.5,
  pune: 5.3,
};

const CITY_TILT_ANGLE: Record<string, number> = {
  "india average": 25,
  delhi: 28,
  mumbai: 20,
  bengaluru: 13,
  chennai: 13,
  kolkata: 23,
  hyderabad: 17,
  pune: 19,
};

const STANDARD_INVERTER_SIZES = [500, 800, 1000, 1500, 2000, 3000, 4000, 5000, 6000, 8000, 10000];
const STANDARD_CONTROLLER_SIZES = [10, 20, 30, 40, 60];

function roundToStandardInverter(w: number): number {
  if (w <= 0) return 0;
  for (const size of STANDARD_INVERTER_SIZES) {
    if (size >= w) return size;
  }
  return Math.ceil(w / 1000) * 1000;
}

function roundToStandardController(a: number): number {
  if (a <= 0) return 0;
  for (const size of STANDARD_CONTROLLER_SIZES) {
    if (size >= a) return size;
  }
  return Math.ceil(a / 10) * 10;
}

function getEffectiveSunlightHours(settings: SystemSettings): number {
  if (settings.sunlightMode === "location") {
    const cityKey = settings.locationCity.trim().toLowerCase();
    if (cityKey && CITY_SUNLIGHT_HOURS[cityKey]) {
      return CITY_SUNLIGHT_HOURS[cityKey];
    }
    return CITY_SUNLIGHT_HOURS["india average"];
  }
  return settings.sunlightHours;
}

function applySeasonalAdjustment(sunlightHours: number, mode: SystemSettings["seasonalMode"]): number {
  if (mode === "conservative") {
    return sunlightHours * 0.8;
  }

  if (mode === "optimized") {
    return sunlightHours * 1.1;
  }

  return sunlightHours;
}

function getEffectiveEfficiency(settings: SystemSettings): number {
  if (settings.efficiencyMode === "simple") {
    return settings.efficiencyPercent / 100;
  }

  const lossFraction =
    (settings.panelLossPercent + settings.inverterLossPercent + settings.temperatureLossPercent) / 100;
  const efficiency = 1 - lossFraction;
  return Math.max(0.6, Math.min(0.95, efficiency));
}

export function getCitySunlightHours(city: string): number | null {
  const key = city.trim().toLowerCase();
  if (!key) return null;
  return CITY_SUNLIGHT_HOURS[key] ?? null;
}

export const LOCATION_SUNLIGHT_PRESETS = Object.entries(CITY_SUNLIGHT_HOURS).map(([city, hours]) => ({
  city,
  hours,
}));

function getTiltAngleDeg(city: string): number {
  const key = city.trim().toLowerCase();
  return CITY_TILT_ANGLE[key] ?? CITY_TILT_ANGLE["india average"];
}

export function getTiltAngleRecommendation(city: string): number {
  return getTiltAngleDeg(city);
}

function buildOptimizationSuggestions(
  settings: SystemSettings,
  peakLoadW: number,
  panelSizeW: number,
  efficiency: number
): string[] {
  const suggestions: string[] = [];

  if (settings.systemVoltage === 12 && peakLoadW > 1000) {
    suggestions.push("Consider upgrading from 12V to 24V/48V for better efficiency.");
  }

  if (settings.batteryType === "lead-acid") {
    suggestions.push("Consider lithium batteries for improved lifespan and usable capacity.");
  }

  if (panelSizeW > 1000 && settings.chargeControllerType === "pwm") {
    suggestions.push("Use an MPPT charge controller for better performance on larger systems.");
  }

  if (efficiency < 0.75) {
    suggestions.push("Reduce system losses to improve overall efficiency.");
  }

  return suggestions;
}

export function calculateSystem(
  appliances: Appliance[],
  settings: SystemSettings
): CalculationResults {
  const totalEnergyWh = appliances.reduce((sum, a) => sum + a.power * a.hours, 0);
  const adjustedTotalEnergyWh = totalEnergyWh * (1 + settings.futureLoadGrowthPercent / 100);
  const peakLoadW = appliances.reduce((sum, a) => sum + a.power, 0);
  const baseSunlightHours = getEffectiveSunlightHours(settings);
  const effectiveSunlightHours = applySeasonalAdjustment(baseSunlightHours, settings.seasonalMode);
  const efficiency = getEffectiveEfficiency(settings);
  const backupHours =
    settings.backupDurationUnit === "days"
      ? settings.backupDurationValue * 24
      : settings.backupDurationValue;
  const currentPanelSizeWRaw = effectiveSunlightHours > 0 && efficiency > 0
    ? totalEnergyWh / (effectiveSunlightHours * efficiency)
    : 0;
  const panelSizeW = effectiveSunlightHours > 0 && efficiency > 0
    ? adjustedTotalEnergyWh / (effectiveSunlightHours * efficiency)
    : 0;
  const dod = DOD[settings.batteryType];
  const currentBatteryCapacityAhRaw = settings.systemVoltage > 0 && dod > 0
    ? (totalEnergyWh * backupHours) / (settings.systemVoltage * dod)
    : 0;
  const batteryCapacityAh = settings.systemVoltage > 0 && dod > 0
    ? (adjustedTotalEnergyWh * backupHours) / (settings.systemVoltage * dod)
    : 0;
  const roundedCurrentBatteryCapacityAh = Math.ceil(currentBatteryCapacityAhRaw);
  const roundedBatteryCapacityAh = Math.ceil(batteryCapacityAh);
  const batteryWh = settings.systemVoltage * roundedBatteryCapacityAh;
  const currentBatteryWh = settings.systemVoltage * roundedCurrentBatteryCapacityAh;
  const currentPanelSizeWRounded = Math.ceil(currentPanelSizeWRaw);
  const panelSizeWRounded = Math.ceil(panelSizeW);
  const controllerCurrent = settings.systemVoltage > 0 ? panelSizeWRounded / settings.systemVoltage : 0;
  const controllerRatingRaw = controllerCurrent * 1.25;
  const recommendation = getSystemRecommendation(settings, backupHours);
  const tiltAngleDeg = getTiltAngleDeg(settings.locationCity);
  const optimizationSuggestions = buildOptimizationSuggestions(
    settings,
    peakLoadW,
    panelSizeWRounded,
    efficiency
  );
  const inverterRaw = peakLoadW * 1.25;

  return {
    totalEnergyWh: Math.round(totalEnergyWh),
    adjustedTotalEnergyWh: Math.round(adjustedTotalEnergyWh),
    futureLoadGrowthPercent: settings.futureLoadGrowthPercent,
    peakLoadW: Math.round(peakLoadW),
    currentPanelSizeW: currentPanelSizeWRounded,
    currentPanelSizeKW: Math.round(currentPanelSizeWRounded / 10) / 100,
    panelSizeW: panelSizeWRounded,
    panelSizeKW: Math.round(panelSizeWRounded / 10) / 100,
    backupHours: Math.round(backupHours * 100) / 100,
    efficiency: Math.round(efficiency * 10000) / 10000,
    effectiveSunlightHours: Math.round(effectiveSunlightHours * 100) / 100,
    currentBatteryCapacityAh: roundedCurrentBatteryCapacityAh,
    batteryCapacityAh: roundedBatteryCapacityAh,
    batteryWh,
    currentBatteryWh,
    controllerCurrent: Math.round(controllerCurrent * 100) / 100,
    controllerRating: roundToStandardController(controllerRatingRaw),
    controllerType: settings.chargeControllerType,
    recommendedSystemType: recommendation.type,
    recommendationReason: recommendation.reason,
    tiltAngleDeg,
    optimizationSuggestions,
    inverterSizeW: roundToStandardInverter(inverterRaw),
  };
}

export function calculatePanelCount(panelSizeW: number, panelRating: number): number {
  if (panelRating <= 0 || panelSizeW <= 0) return 0;
  return Math.ceil(panelSizeW / panelRating);
}

export function calculateConfigurationComparison(
  appliances: Appliance[],
  settings: SystemSettings
): ConfigurationComparisonResults {
  const lowCostSettings: SystemSettings = {
    ...settings,
    batteryType: "lead-acid",
    chargeControllerType: "pwm",
    efficiencyMode: "simple",
    efficiencyPercent: 70,
  };

  const highEfficiencySettings: SystemSettings = {
    ...settings,
    batteryType: "lithium",
    chargeControllerType: "mppt",
    efficiencyMode: "simple",
    efficiencyPercent: 85,
  };

  return {
    lowCost: {
      label: "Low-Cost Setup",
      costTag: "₹",
      results: calculateSystem(appliances, lowCostSettings),
    },
    highEfficiency: {
      label: "High-Efficiency Setup",
      costTag: "₹₹₹",
      results: calculateSystem(appliances, highEfficiencySettings),
    },
  };
}

export function calculateCostEstimate(results: CalculationResults, settings: SystemSettings): CostEstimate {
  const panelCost = results.panelSizeKW * 55000;
  const batteryRate = settings.batteryType === "lithium" ? 25 : 12;
  const batteryCost = results.batteryCapacityAh * batteryRate;
  const inverterCost = results.inverterSizeW * 8;
  const controllerCost = results.controllerRating * 500;
  const totalCost = panelCost + batteryCost + inverterCost + controllerCost;
  const subsidy = Math.min(results.panelSizeKW * 18000, 78000);
  const finalCost = Math.max(totalCost - subsidy, 0);

  return {
    panelCost: Math.round(panelCost),
    batteryCost: Math.round(batteryCost),
    inverterCost: Math.round(inverterCost),
    controllerCost: Math.round(controllerCost),
    totalCost: Math.round(totalCost),
    subsidy: Math.round(subsidy),
    finalCost: Math.round(finalCost),
  };
}

export function calculateRoiEstimate(
  results: CalculationResults,
  settings: SystemSettings,
  cost: CostEstimate
): RoiEstimate {
  const monthlyUnits = (results.panelSizeW * results.effectiveSunlightHours * 30 * results.efficiency) / 1000;
  const monthlySavings = monthlyUnits * settings.electricityRate;
  const annualSavings = monthlySavings * 12;
  const paybackYears = annualSavings > 0 ? cost.finalCost / annualSavings : 0;
  const recoveryPerYearPercent = cost.finalCost > 0 ? Math.min((annualSavings / cost.finalCost) * 100, 100) : 0;

  return {
    monthlyUnits: Math.round(monthlyUnits * 100) / 100,
    monthlySavings: Math.round(monthlySavings),
    annualSavings: Math.round(annualSavings),
    paybackYears: Math.round(paybackYears * 10) / 10,
    recoveryPerYearPercent: Math.round(recoveryPerYearPercent * 10) / 10,
  };
}

export function generateInsights(
  results: CalculationResults,
  settings: SystemSettings
): Insight[] {
  const insights: Insight[] = [];
  const effectiveSunlightHours = getEffectiveSunlightHours(settings);
  const costEstimate = calculateCostEstimate(results, settings);
  const roi = calculateRoiEstimate(results, settings, costEstimate);

  if (results.totalEnergyWh === 0) {
    insights.push({
      type: "info",
      message: "Add appliances to start calculating your solar system requirements.",
    });
    return insights;
  }

  if (settings.gridAvailability === "yes") {
    insights.push({
      type: "info",
      message: "Grid is available, so battery is optional",
    });
  }

  if (settings.gridAvailability === "yes" && results.backupHours > 2) {
    insights.push({
      type: "info",
      message: "High backup requirement suggests hybrid system",
    });
  }

  if (settings.gridAvailability === "no") {
    insights.push({
      type: "warning",
      message: "No grid -> off-grid system required",
    });
  }

  if (results.inverterSizeW > 0 && results.inverterSizeW < results.peakLoadW * 1.3) {
    insights.push({
      type: "warning",
      message: "Inverter size is very close to peak load. Consider a larger inverter for safety margin.",
    });
  }

  if (results.batteryCapacityAh > 400 && settings.batteryType === "lead-acid") {
    insights.push({
      type: "info",
      message: "Battery capacity is very high. Consider switching to lithium batteries for better depth of discharge and longer lifespan.",
    });
  }

  if (effectiveSunlightHours < 4) {
    insights.push({
      type: "warning",
      message: "Low sunlight region-consider larger system",
    });
  }

  if (settings.seasonalMode === "conservative") {
    insights.push({
      type: "info",
      message: "Winter conditions may reduce solar output",
    });
  }

  insights.push({
    type: "info",
    message: "Tilt optimization can improve efficiency by 5-15%",
  });

  if (settings.futureLoadGrowthPercent > 0) {
    insights.push({
      type: "info",
      message: "Planning for future load prevents system upgrade costs",
    });
  }

  if (roi.paybackYears > 0 && roi.paybackYears < 4) {
    insights.push({
      type: "info",
      message: "Excellent investment",
    });
  } else if (roi.paybackYears >= 4 && roi.paybackYears <= 6) {
    insights.push({
      type: "info",
      message: "Good investment",
    });
  } else if (roi.paybackYears > 6) {
    insights.push({
      type: "info",
      message: "Long-term investment",
    });
  }

  if (results.backupHours > 8) {
    insights.push({
      type: "warning",
      message: "High backup requirement increases battery cost significantly",
    });
  }

  if (results.efficiency < 0.7) {
    insights.push({
      type: "warning",
      message: "Low efficiency increases required panel size",
    });
  }

  if (results.totalEnergyWh > 5000) {
    insights.push({
      type: "info",
      message: "High energy consumption. A 48V system is recommended for better efficiency and lower current.",
    });
  }

  if (results.panelSizeW > 1000) {
    if (settings.chargeControllerType === "pwm") {
      insights.push({
        type: "warning",
        message: "PWM may reduce system efficiency. Consider MPPT",
      });
    } else {
      insights.push({
        type: "info",
        message: "MPPT is recommended for higher efficiency in larger systems",
      });
    }
  }

  if (results.panelSizeW > 3000) {
    insights.push({
      type: "info",
      message: "This is a large system. Consider professional installation.",
    });
  }

  if (settings.systemVoltage === 12 && results.peakLoadW > 1000) {
    insights.push({
      type: "warning",
      message: "Consider upgrading to 24V or 48V for efficiency with this load.",
    });
  }

  if (settings.batteryType === "lithium") {
    insights.push({
      type: "info",
      message: "Lithium batteries offer better efficiency and lifespan.",
    });
  }

  return insights;
}

export const PRESETS: Record<string, Appliance[]> = {
  "Small Home": [
    { id: "p1", name: "LED Lights (x5)", power: 50, hours: 8 },
    { id: "p2", name: "Ceiling Fan", power: 75, hours: 10 },
    { id: "p3", name: "TV", power: 120, hours: 5 },
    { id: "p4", name: "Phone Charger", power: 10, hours: 3 },
    { id: "p5", name: "WiFi Router", power: 15, hours: 24 },
  ],
  Office: [
    { id: "p1", name: "Desktop Computer", power: 200, hours: 8 },
    { id: "p2", name: "Monitor", power: 40, hours: 8 },
    { id: "p3", name: "LED Lights (x10)", power: 100, hours: 10 },
    { id: "p4", name: "Printer", power: 150, hours: 2 },
    { id: "p5", name: "AC Unit", power: 1500, hours: 8 },
  ],
  Shop: [
    { id: "p1", name: "LED Lights (x8)", power: 80, hours: 12 },
    { id: "p2", name: "Refrigerator", power: 150, hours: 24 },
    { id: "p3", name: "POS System", power: 50, hours: 12 },
    { id: "p4", name: "Ceiling Fan (x2)", power: 150, hours: 12 },
  ],
};

export const POWER_HINTS: { name: string; watts: number }[] = [
  { name: "LED Light", watts: 10 },
  { name: "Fan", watts: 70 },
  { name: "TV", watts: 120 },
  { name: "Fridge", watts: 150 },
  { name: "AC", watts: 1500 },
  { name: "Washing Machine", watts: 500 },
  { name: "Laptop", watts: 65 },
  { name: "Microwave", watts: 1000 },
];
