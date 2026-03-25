import type { RoiEstimate } from "@/utils/calculations";

interface Props {
  roi: RoiEstimate;
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const RoiPanel = ({ roi }: Props) => {
  const progressWidthClass =
    roi.recoveryPerYearPercent >= 95
      ? "w-full"
      : roi.recoveryPerYearPercent >= 90
        ? "w-11/12"
        : roi.recoveryPerYearPercent >= 80
          ? "w-10/12"
          : roi.recoveryPerYearPercent >= 70
            ? "w-9/12"
            : roi.recoveryPerYearPercent >= 60
              ? "w-8/12"
              : roi.recoveryPerYearPercent >= 50
                ? "w-7/12"
                : roi.recoveryPerYearPercent >= 40
                  ? "w-6/12"
                  : roi.recoveryPerYearPercent >= 30
                    ? "w-5/12"
                    : roi.recoveryPerYearPercent >= 20
                      ? "w-4/12"
                      : roi.recoveryPerYearPercent >= 10
                        ? "w-3/12"
                        : roi.recoveryPerYearPercent > 0
                          ? "w-2/12"
                          : "w-0";

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground">ROI & Savings</h3>
      <div className="mt-3 space-y-1.5 text-sm">
        <p className="flex items-center justify-between text-muted-foreground">
          <span>Monthly Energy Generation</span>
          <span className="font-medium text-foreground">{roi.monthlyUnits.toLocaleString(undefined, { maximumFractionDigits: 2 })} kWh</span>
        </p>
        <p className="flex items-center justify-between text-muted-foreground">
          <span>Monthly Savings</span>
          <span className="font-medium text-foreground">{inr.format(roi.monthlySavings)}</span>
        </p>
        <p className="flex items-center justify-between text-muted-foreground">
          <span>Annual Savings</span>
          <span className="font-medium text-foreground">{inr.format(roi.annualSavings)}</span>
        </p>
      </div>

      <div className="mt-3 rounded-lg border border-primary/30 bg-primary/10 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Payback Period</p>
        <p className="text-2xl font-bold text-primary">{roi.paybackYears.toFixed(1)} years</p>
      </div>

      <div className="mt-3">
        <p className="text-xs text-muted-foreground">Investment recovered in {roi.paybackYears.toFixed(1)} years</p>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
          <div className={`h-full bg-primary transition-all duration-500 ${progressWidthClass}`} />
        </div>
      </div>
    </div>
  );
};

export default RoiPanel;
