import { useState, useMemo } from "react";
import type { ConfigurationComparisonResults } from "@/utils/calculations";

interface Props {
  comparison: ConfigurationComparisonResults;
}

const ComparisonPanel = ({ comparison }: Props) => {
  const [showComparison, setShowComparison] = useState(false);

  const panelWinner = useMemo(() => {
    if (comparison.lowCost.results.panelSizeW < comparison.highEfficiency.results.panelSizeW) {
      return "low-cost";
    }
    if (comparison.highEfficiency.results.panelSizeW < comparison.lowCost.results.panelSizeW) {
      return "high-efficiency";
    }
    return "tie";
  }, [comparison]);

  const batteryWinner = useMemo(() => {
    if (comparison.lowCost.results.batteryCapacityAh < comparison.highEfficiency.results.batteryCapacityAh) {
      return "low-cost";
    }
    if (comparison.highEfficiency.results.batteryCapacityAh < comparison.lowCost.results.batteryCapacityAh) {
      return "high-efficiency";
    }
    return "tie";
  }, [comparison]);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">System Comparison</h3>
        <button
          type="button"
          onClick={() => setShowComparison((prev) => !prev)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            showComparison
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-secondary text-secondary-foreground hover:bg-muted"
          }`}
        >
          {showComparison ? "Hide Comparison" : "Show Comparison"}
        </button>
      </div>

      {showComparison && (
        <>
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-secondary/20 p-3">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">{comparison.lowCost.label}</h4>
                <span className="text-xs font-medium text-muted-foreground">Cost: {comparison.lowCost.costTag}</span>
              </div>
              <div className="space-y-1.5 text-sm">
                <p className={panelWinner === "low-cost" ? "font-semibold text-emerald-700" : "text-muted-foreground"}>
                  Solar Panel Size: {comparison.lowCost.results.panelSizeKW.toLocaleString(undefined, { maximumFractionDigits: 2 })} kW
                </p>
                <p className={batteryWinner === "low-cost" ? "font-semibold text-emerald-700" : "text-muted-foreground"}>
                  Battery Capacity: {comparison.lowCost.results.batteryCapacityAh.toLocaleString()} Ah
                </p>
                <p className="text-muted-foreground">Inverter Size: {comparison.lowCost.results.inverterSizeW.toLocaleString()} W</p>
                <p className="text-muted-foreground">Efficiency: {(comparison.lowCost.results.efficiency * 100).toFixed(0)}%</p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-secondary/20 p-3">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">{comparison.highEfficiency.label}</h4>
                <span className="text-xs font-medium text-muted-foreground">Cost: {comparison.highEfficiency.costTag}</span>
              </div>
              <div className="space-y-1.5 text-sm">
                <p className={panelWinner === "high-efficiency" ? "font-semibold text-emerald-700" : "text-muted-foreground"}>
                  Solar Panel Size: {comparison.highEfficiency.results.panelSizeKW.toLocaleString(undefined, { maximumFractionDigits: 2 })} kW
                </p>
                <p className={batteryWinner === "high-efficiency" ? "font-semibold text-emerald-700" : "text-muted-foreground"}>
                  Battery Capacity: {comparison.highEfficiency.results.batteryCapacityAh.toLocaleString()} Ah
                </p>
                <p className="text-muted-foreground">Inverter Size: {comparison.highEfficiency.results.inverterSizeW.toLocaleString()} W</p>
                <p className="text-muted-foreground">Efficiency: {(comparison.highEfficiency.results.efficiency * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            <p>Low-cost setup saves upfront cost but reduces efficiency.</p>
            <p className="mt-1">High-efficiency setup reduces energy loss and battery size.</p>
          </div>
        </>
      )}
    </div>
  );
};

export default ComparisonPanel;
