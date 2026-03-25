import { useState, useMemo, useEffect, useRef, type ReactNode } from "react";
import { LayoutGrid, Info } from "lucide-react";
import jsPDF from "jspdf";
import type {
  Appliance,
  CalculationResults,
  ConfigurationComparisonResults,
  CostEstimate,
  RoiEstimate,
  SystemSettings,
} from "@/utils/calculations";
import { calculatePanelCount } from "@/utils/calculations";
import ComparisonPanel from "@/components/ComparisonPanel";

interface Props {
  appliances: Appliance[];
  settings: SystemSettings;
  results: CalculationResults;
  comparison: ConfigurationComparisonResults;
  cost: CostEstimate;
  roi: RoiEstimate;
}

const ResultsPanel = ({ appliances, settings, results, comparison, cost, roi }: Props) => {
  const [panelRating, setPanelRating] = useState(550);
  const [actionMessage, setActionMessage] = useState("");

  const inr = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }),
    []
  );

  const panelCount = useMemo(
    () => calculatePanelCount(results.panelSizeW, panelRating),
    [results.panelSizeW, panelRating]
  );
  const totalEnergyKWh = useMemo(
    () => results.totalEnergyWh / 1000,
    [results.totalEnergyWh]
  );
  const formattedEnergyKWh = useMemo(
    () => totalEnergyKWh.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    [totalEnergyKWh]
  );
  const batteryDodPercent = settings.batteryType === "lead-acid" ? 50 : 80;

  const AnimatedNumber = ({
    value,
    formatter,
  }: {
    value: number;
    formatter: (value: number) => string;
  }) => {
    const [displayValue, setDisplayValue] = useState(value);
    const previousValueRef = useRef(value);

    useEffect(() => {
      const duration = 450;
      const start = performance.now();
      const from = previousValueRef.current;
      let frame = 0;

      const tick = (time: number) => {
        const elapsed = time - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(from + (value - from) * eased);
        if (progress < 1) {
          frame = window.requestAnimationFrame(tick);
        }
      };

      frame = window.requestAnimationFrame(tick);
      return () => {
        previousValueRef.current = value;
        window.cancelAnimationFrame(frame);
      };
    }, [value]);

    return <>{formatter(displayValue)}</>;
  };

  const addPdfSection = (
    doc: jsPDF,
    y: number,
    heading: string,
    lines: string[]
  ): number => {
    let cursor = y;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(heading, 14, cursor);
    cursor += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    lines.forEach((line) => {
      const wrapped = doc.splitTextToSize(line, 180);
      wrapped.forEach((wrappedLine: string) => {
        if (cursor > 285) {
          doc.addPage();
          cursor = 16;
        }
        doc.text(wrappedLine, 16, cursor);
        cursor += 5;
      });
    });

    return cursor + 4;
  };

  const onDownloadReport = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Solar System Report", 14, 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    let y = 30;

    const applianceLines =
      appliances.length === 0
        ? ["No appliances added."]
        : appliances.map(
            (appliance, index) =>
              `${index + 1}. ${appliance.name} - ${appliance.power} W, ${appliance.hours} h/day`
          );

    y = addPdfSection(doc, y, "SECTION 1: USER INPUTS", [
      ...applianceLines,
      `Total energy: ${results.totalEnergyWh.toLocaleString()} Wh/day (${formattedEnergyKWh} kWh/day)`,
    ]);

    y = addPdfSection(doc, y, "SECTION 2: SYSTEM CONFIGURATION", [
      `Sunlight hours: ${results.effectiveSunlightHours.toFixed(2)} h/day`,
      `Battery type: ${settings.batteryType}`,
      `Voltage: ${settings.systemVoltage} V`,
      `Backup duration: ${settings.backupDurationValue} ${settings.backupDurationUnit} (${results.backupHours.toFixed(2)} hours effective)`,
      `Efficiency: ${(results.efficiency * 100).toFixed(1)}%`,
    ]);

    y = addPdfSection(doc, y, "SECTION 3: SYSTEM RESULTS", [
      `Solar panel size: ${results.panelSizeW.toLocaleString()} W (${results.panelSizeKW.toFixed(2)} kW)`,
      `Battery capacity: ${results.batteryCapacityAh.toLocaleString()} Ah (${results.batteryWh.toLocaleString()} Wh)`,
      `Inverter size: ${results.inverterSizeW.toLocaleString()} W`,
      `Charge controller: ${results.controllerRating.toLocaleString()} A`,
    ]);

    y = addPdfSection(doc, y, "SECTION 4: SYSTEM TYPE", [
      `Recommended system: ${results.recommendedSystemType}`,
      `Explanation: ${results.recommendationReason}`,
    ]);

    y = addPdfSection(doc, y, "SECTION 5: COST ESTIMATION", [
      `Panel cost: ${inr.format(cost.panelCost)}`,
      `Battery cost: ${inr.format(cost.batteryCost)}`,
      `Inverter cost: ${inr.format(cost.inverterCost)}`,
      `Controller cost: ${inr.format(cost.controllerCost)}`,
      `Total cost: ${inr.format(cost.totalCost)}`,
      `Subsidy: ${inr.format(cost.subsidy)}`,
      `Final cost: ${inr.format(cost.finalCost)}`,
    ]);

    y = addPdfSection(doc, y, "SECTION 6: ROI", [
      `Monthly savings: ${inr.format(roi.monthlySavings)}`,
      `Annual savings: ${inr.format(roi.annualSavings)}`,
      `Payback period: ${roi.paybackYears.toFixed(1)} years`,
    ]);

    y = addPdfSection(doc, y, "SECTION 7: ASSUMPTIONS", [
      `Sunlight hours used: ${results.effectiveSunlightHours.toFixed(2)} h/day`,
      `Efficiency used: ${(results.efficiency * 100).toFixed(1)}%`,
      `Battery DoD used: ${batteryDodPercent}%`,
      `Seasonal mode: ${settings.seasonalMode}`,
      "All calculations are estimates and may vary based on installation conditions and location.",
    ]);

    if (y > 285) {
      doc.addPage();
      y = 16;
    }
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text("All calculations are estimates and may vary based on installation conditions and location.", 14, y);

    doc.save("solar-system-report.pdf");
    setActionMessage("Report downloaded");
  };

  const onShare = async () => {
    const summary = [
      "PV System Summary",
      `System Size: ${results.panelSizeW.toLocaleString()} W (${results.panelSizeKW.toFixed(2)} kW)`,
      `Estimated Final Cost: ${inr.format(cost.finalCost)}`,
      `Estimated Payback: ${roi.paybackYears.toFixed(1)} years`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      setActionMessage("Summary copied to clipboard");
    } catch {
      setActionMessage("Could not copy to clipboard in this browser context");
    }
  };

  const SectionCard = ({
    title,
    icon,
    children,
  }: {
    title: string;
    icon: string;
    children: ReactNode;
  }) => (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
      <h3 className="text-sm font-semibold text-foreground">
        <span className="mr-1.5" aria-hidden="true">
          {icon}
        </span>
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </div>
  );

  const Metric = ({
    label,
    value,
    numericValue,
    numericFormatter,
    helper,
    highlight,
  }: {
    label: string;
    value?: string;
    numericValue?: number;
    numericFormatter?: (value: number) => string;
    helper?: string;
    highlight?: boolean;
  }) => (
    <div
      className={`rounded-lg border p-3 transition-all duration-300 ${
        highlight
          ? "border-primary/40 bg-primary/10"
          : "border-border bg-secondary/20"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        key={value ?? numericValue}
        className={`mt-1 animate-fade-in font-display transition-all duration-500 ${
          highlight ? "text-2xl font-bold text-primary" : "text-lg font-semibold text-foreground"
        }`}
      >
        {typeof numericValue === "number" && numericFormatter
          ? <AnimatedNumber value={numericValue} formatter={numericFormatter} />
          : value}
      </p>
      {helper && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
    </div>
  );

  const recommendationTheme = useMemo(() => {
    if (results.recommendedSystemType === "on-grid") {
      return {
        label: "On-grid",
        icon: "\u26A1",
        className: "border-emerald-200 bg-emerald-50 text-emerald-900",
      };
    }

    if (results.recommendedSystemType === "hybrid") {
      return {
        label: "Hybrid",
        icon: "\u21C4",
        className: "border-orange-200 bg-orange-50 text-orange-900",
      };
    }

    return {
      label: "Off-grid",
      icon: "\u{1F50B}",
      className: "border-sky-200 bg-sky-50 text-sky-900",
    };
  }, [results.recommendedSystemType]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-lg transition-all duration-300">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Report & Sharing</p>
            <p className="text-xs text-muted-foreground">Generate a downloadable summary or share key metrics.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onDownloadReport}
              className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              Download Report
            </button>
            <button
              type="button"
              onClick={onShare}
              className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted"
            >
              Share
            </button>
          </div>
        </div>
        {actionMessage && <p className="mt-2 text-xs text-muted-foreground">{actionMessage}</p>}
      </div>

      <div className={`rounded-2xl border p-4 shadow-lg transition-all duration-300 ${recommendationTheme.className}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">
              {recommendationTheme.icon}
            </span>
            <p className="text-xs font-semibold uppercase tracking-wide">Recommended System Type</p>
          </div>
          <button
            type="button"
            title="On-grid uses utility grid with minimal battery. Hybrid combines grid + battery backup. Off-grid runs independently with battery storage."
            className="rounded-md p-1 text-current/80 transition-colors hover:bg-black/5"
            aria-label="About system types"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-xl font-bold">{recommendationTheme.label}</p>
        <p className="mt-1 text-sm opacity-90">{results.recommendationReason}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionCard title="SECTION A: ENERGY OVERVIEW" icon="⚡">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Metric
              label="Total Energy"
              numericValue={results.totalEnergyWh}
              numericFormatter={(value) => `${Math.round(value).toLocaleString()} Wh/day`}
            />
            <Metric
              label="Total Energy"
              numericValue={totalEnergyKWh}
              numericFormatter={(value) => `${value.toFixed(2)} kWh/day`}
            />
            <div className="sm:col-span-2">
              <Metric
                label="Peak Load"
                numericValue={results.peakLoadW}
                numericFormatter={(value) => `${Math.round(value).toLocaleString()} W`}
                helper="Connected peak load across all appliances"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="SECTION B: SYSTEM SIZE" icon="☀">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Metric
                label="Solar Panel Size"
                numericValue={results.panelSizeW}
                numericFormatter={(value) => `${Math.round(value).toLocaleString()} W`}
                helper={`${results.panelSizeKW.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kW`}
                highlight
              />
            </div>
            <Metric
              label="Battery Capacity"
              numericValue={results.batteryCapacityAh}
              numericFormatter={(value) => `${Math.round(value).toLocaleString()} Ah`}
              helper={`${results.batteryWh.toLocaleString()} Wh`}
            />
            <Metric
              label="Inverter Size"
              numericValue={results.inverterSizeW}
              numericFormatter={(value) => `${Math.round(value).toLocaleString()} W`}
            />
            <Metric
              label="Charge Controller"
              numericValue={results.controllerRating}
              numericFormatter={(value) => `${Math.round(value).toLocaleString()} A`}
              helper={`${results.controllerType.toUpperCase()} • ${results.controllerCurrent.toFixed(2)} A current`}
            />
          </div>
        </SectionCard>

        <SectionCard title="SECTION C: SYSTEM TYPE" icon="🔋">
          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Recommended System</p>
            <p key={recommendationTheme.label} className="mt-1 animate-fade-in text-2xl font-bold text-foreground transition-all duration-500">
              {recommendationTheme.label}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{results.recommendationReason}</p>
          </div>
        </SectionCard>

        <SectionCard title="SECTION D: COST SUMMARY" icon="💰">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Metric label="Panel Cost" numericValue={cost.panelCost} numericFormatter={(value) => inr.format(Math.round(value))} />
            <Metric label="Battery Cost" numericValue={cost.batteryCost} numericFormatter={(value) => inr.format(Math.round(value))} />
            <Metric label="Inverter Cost" numericValue={cost.inverterCost} numericFormatter={(value) => inr.format(Math.round(value))} />
            <Metric label="Controller Cost" numericValue={cost.controllerCost} numericFormatter={(value) => inr.format(Math.round(value))} />
            <Metric label="Total Cost" numericValue={cost.totalCost} numericFormatter={(value) => inr.format(Math.round(value))} />
            <Metric label="Subsidy" numericValue={cost.subsidy} numericFormatter={(value) => `- ${inr.format(Math.round(value))}`} />
            <div className="sm:col-span-2">
              <Metric
                label="Final Cost"
                numericValue={cost.finalCost}
                numericFormatter={(value) => inr.format(Math.round(value))}
                highlight
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="SECTION E: ROI SUMMARY" icon="📊">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Metric label="Monthly Savings" numericValue={roi.monthlySavings} numericFormatter={(value) => inr.format(Math.round(value))} />
            <Metric label="Annual Savings" numericValue={roi.annualSavings} numericFormatter={(value) => inr.format(Math.round(value))} />
            <div className="sm:col-span-2">
              <Metric
                label="Payback Period"
                numericValue={roi.paybackYears}
                numericFormatter={(value) => `${value.toFixed(1)} years`}
                helper={`~${roi.recoveryPerYearPercent.toFixed(1)}% investment recovery per year`}
                highlight
              />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Panel count */}
      <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-solar-muted p-4 shadow-lg transition-all duration-300 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            You need approximately{" "}
            <span className="text-lg font-bold text-primary">{panelCount}</span>{" "}
            solar panel{panelCount !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground whitespace-nowrap">Panel rating:</label>
          <input
            type="number"
            min={100}
            max={1000}
            step={50}
            value={panelRating}
            onChange={(e) => setPanelRating(Number(e.target.value))}
            aria-label="Solar panel rating in watts"
            className="w-20 rounded-lg border border-border bg-card px-2 py-1.5 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <span className="text-xs text-muted-foreground">W</span>
        </div>
      </div>

      <ComparisonPanel comparison={comparison} />

      <div className="rounded-2xl border border-border bg-card p-4 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
        <h3 className="text-sm font-semibold text-foreground">Future Expansion Impact</h3>
        <div className="mt-2 space-y-1 text-sm">
          <p className="text-muted-foreground">
            Current system size: <span className="font-semibold text-foreground">{results.currentPanelSizeW.toLocaleString()} W ({results.currentPanelSizeKW} kW)</span>
          </p>
          <p className="text-muted-foreground">
            Future-ready system size: <span className="font-semibold text-foreground">{results.panelSizeW.toLocaleString()} W ({results.panelSizeKW} kW)</span>
          </p>
          <p className="text-muted-foreground">
            Current battery: <span className="font-semibold text-foreground">{results.currentBatteryCapacityAh.toLocaleString()} Ah</span>
          </p>
          <p className="text-muted-foreground">
            Future-ready battery: <span className="font-semibold text-foreground">{results.batteryCapacityAh.toLocaleString()} Ah</span>
          </p>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Recommended system includes {results.futureLoadGrowthPercent}% extra capacity for future expansion.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
        <h3 className="text-sm font-semibold text-foreground">Optimization Suggestions</h3>
        <p className="mt-1 text-xs text-muted-foreground">Recommended Tilt Angle: {results.tiltAngleDeg}°</p>
        <ul className="mt-3 space-y-2">
          {results.optimizationSuggestions.length === 0 ? (
            <li className="text-sm text-muted-foreground">All major optimization checks look good.</li>
          ) : (
            results.optimizationSuggestions.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-0.5 text-emerald-600">☑</span>
                <span>{item}</span>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
        <h3 className="text-sm font-semibold text-foreground">System Assumptions</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sunlight Hours Used</p>
              <button
                type="button"
                title="Average daily solar radiation"
                className="text-muted-foreground"
                aria-label="Sunlight hours explanation"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-1 text-lg font-semibold text-foreground">{results.effectiveSunlightHours.toFixed(2)} h/day</p>
          </div>

          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Efficiency</p>
              <button
                type="button"
                title="System losses including inverter, temperature, wiring"
                className="text-muted-foreground"
                aria-label="Efficiency explanation"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-1 text-lg font-semibold text-foreground">{(results.efficiency * 100).toFixed(1)}%</p>
          </div>

          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Battery DoD</p>
              <button
                type="button"
                title="Maximum usable battery capacity"
                className="text-muted-foreground"
                aria-label="Depth of discharge explanation"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-1 text-lg font-semibold text-foreground">{batteryDodPercent}% ({settings.batteryType})</p>
          </div>

          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Backup Duration</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{results.backupHours.toFixed(2)} hours</p>
          </div>

          <div className="rounded-lg border border-border bg-secondary/20 p-3 sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">System Voltage</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{settings.systemVoltage} V</p>
            <p className="mt-2 text-xs text-muted-foreground">
              All calculations are estimates and may vary based on installation conditions and location.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPanel;
