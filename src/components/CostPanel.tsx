import type { CostEstimate } from "@/utils/calculations";

interface Props {
  cost: CostEstimate;
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const CostPanel = ({ cost }: Props) => {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground">Cost Estimation (India)</h3>
      <div className="mt-3 space-y-1.5 text-sm">
        <p className="flex items-center justify-between text-muted-foreground">
          <span>Panel cost</span>
          <span className="font-medium text-foreground">{inr.format(cost.panelCost)}</span>
        </p>
        <p className="flex items-center justify-between text-muted-foreground">
          <span>Battery cost</span>
          <span className="font-medium text-foreground">{inr.format(cost.batteryCost)}</span>
        </p>
        <p className="flex items-center justify-between text-muted-foreground">
          <span>Inverter cost</span>
          <span className="font-medium text-foreground">{inr.format(cost.inverterCost)}</span>
        </p>
        <p className="flex items-center justify-between text-muted-foreground">
          <span>Controller cost</span>
          <span className="font-medium text-foreground">{inr.format(cost.controllerCost)}</span>
        </p>
        <p className="mt-2 flex items-center justify-between border-t border-border pt-2 text-muted-foreground">
          <span>Total cost</span>
          <span className="font-semibold text-foreground">{inr.format(cost.totalCost)}</span>
        </p>
        <p className="flex items-center justify-between text-emerald-700">
          <span>Subsidy</span>
          <span className="font-semibold">- {inr.format(cost.subsidy)}</span>
        </p>
      </div>
      <div className="mt-3 rounded-lg border border-primary/30 bg-primary/10 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Final Estimated Cost</p>
        <p className="text-xl font-bold text-primary">{inr.format(cost.finalCost)}</p>
      </div>
    </div>
  );
};

export default CostPanel;
