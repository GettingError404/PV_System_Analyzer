import type { SolarSystemType, SystemSettings } from "@/utils/calculations";

export interface SystemRecommendation {
  type: SolarSystemType;
  reason: string;
}

export function getSystemRecommendation(settings: SystemSettings, backupHours: number): SystemRecommendation {
  let type: SolarSystemType;
  let reason: string;

  if (settings.gridAvailability === "no") {
    type = "off-grid";
    reason = "Off-grid system is ideal because grid power is not available.";
  } else if (backupHours <= 2) {
    type = "on-grid";
    reason = "On-grid system is ideal since you have grid access and low backup needs.";
  } else {
    type = "hybrid";
    reason = "Hybrid system is recommended because grid is available but backup demand is significant.";
  }

  if (settings.gridAvailability === "yes" && settings.usagePattern === "nighttime-heavy" && type === "on-grid") {
    if (settings.budgetLevel === "low") {
      reason = "On-grid is kept due to low budget, though nighttime-heavy usage may benefit from storage later.";
    } else {
      type = "hybrid";
      reason = "Hybrid system is better for nighttime-heavy usage so stored energy can support evening demand.";
    }
  }

  if (settings.gridAvailability === "yes" && settings.budgetLevel === "low" && type === "hybrid" && backupHours <= 4) {
    type = "on-grid";
    reason = "On-grid is preferred to reduce upfront cost with low budget and moderate backup requirement.";
  }

  if (settings.gridAvailability === "yes" && settings.budgetLevel === "high" && type === "on-grid" && settings.usagePattern !== "daytime-heavy") {
    type = "hybrid";
    reason = "Hybrid is recommended since your budget supports battery backup for better reliability.";
  }

  return { type, reason };
}
