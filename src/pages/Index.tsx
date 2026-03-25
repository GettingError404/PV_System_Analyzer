import { useState, useMemo, useEffect } from "react";
import ApplianceForm from "@/components/ApplianceForm";
import ApplianceList from "@/components/ApplianceList";
import SystemSettings from "@/components/SystemSettings";
import ResultsPanel from "@/components/ResultsPanel";
import InsightsPanel from "@/components/InsightsPanel";
import ServiceFinderMap from "@/components/ServiceFinderMap";
import CustomerReviewsSection from "@/components/CustomerReviewsSection";
import AISolarAssistant from "@/components/AISolarAssistant";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import {
  calculateCostEstimate,
  calculateRoiEstimate,
  calculateSystem,
  calculateConfigurationComparison,
  generateInsights,
  PRESETS,
  type ConfigurationComparisonResults,
  type Appliance,
  type SystemSettings as Settings,
} from "@/utils/calculations";

let idCounter = 0;

const Index = () => {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    sunlightHours: 5,
    sunlightMode: "manual",
    locationCity: "India Average",
    batteryType: "lead-acid",
    systemVoltage: 24,
    chargeControllerType: "mppt",
    backupDurationValue: 4,
    backupDurationUnit: "hours",
    efficiencyMode: "simple",
    efficiencyPercent: 75,
    panelLossPercent: 10,
    inverterLossPercent: 8,
    temperatureLossPercent: 7,
    gridAvailability: "yes",
    usagePattern: "balanced",
    budgetLevel: "medium",
    seasonalMode: "standard",
    futureLoadGrowthPercent: 20,
    electricityRate: 8,
  });

  const addAppliance = (name: string, power: number, hours: number) => {
    setAppliances((prev) => [
      ...prev,
      { id: String(++idCounter), name, power, hours },
    ]);
  };

  const removeAppliance = (id: string) => {
    setAppliances((prev) => prev.filter((a) => a.id !== id));
  };

  const updateAppliance = (
    id: string,
    updates: Pick<Appliance, "name" | "power" | "hours">
  ) => {
    setAppliances((prev) =>
      prev.map((appliance) =>
        appliance.id === id ? { ...appliance, ...updates } : appliance
      )
    );
  };

  const focusAddForm = () => {
    const input = document.getElementById("appliance-name-input");
    if (input instanceof HTMLInputElement) {
      input.focus();
    }
  };

  const loadPreset = (key: string) => {
    idCounter += 100;
    setAppliances(
      PRESETS[key].map((a, i) => ({ ...a, id: String(idCounter + i) }))
    );
  };

  const results = useMemo(
    () => calculateSystem(appliances, settings),
    [appliances, settings]
  );

  const comparison = useMemo<ConfigurationComparisonResults>(
    () => calculateConfigurationComparison(appliances, settings),
    [appliances, settings]
  );

  const cost = useMemo(
    () => calculateCostEstimate(results, settings),
    [results, settings]
  );

  const roi = useMemo(
    () => calculateRoiEstimate(results, settings, cost),
    [results, settings, cost]
  );

  const insights = useMemo(
    () => generateInsights(results, settings),
    [results, settings]
  );

  useEffect(() => {
    setIsUpdating(true);
    const timer = window.setTimeout(() => setIsUpdating(false), 250);
    return () => window.clearTimeout(timer);
  }, [appliances, settings]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-background">
      <button
        type="button"
        onClick={() => setIsDarkMode((prev) => !prev)}
        className="fixed right-4 top-4 z-50 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
      >
        {isDarkMode ? "Light" : "Dark"} Mode
      </button>

      <HeroSection />

      <main id="calculator" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14 scroll-mt-4">
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left Column — Inputs */}
          <div className="space-y-6 lg:col-span-2">
            {/* Presets */}
            <section className="animate-fade-in rounded-2xl border border-border bg-card p-5 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                Preset Configurations
              </h2>
              <div className="flex flex-wrap gap-2">
                {Object.keys(PRESETS).map((key) => (
                  <button
                    key={key}
                    onClick={() => loadPreset(key)}
                    className="rounded-lg border border-border bg-secondary px-3.5 py-2 text-sm font-medium text-secondary-foreground transition-all hover:scale-[1.02] hover:bg-muted hover:shadow-sm hover:-translate-y-0.5"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </section>

            {/* Add Appliance */}
            <section className="animate-fade-in rounded-2xl border border-border bg-card p-5 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                Add Appliance
              </h2>
              <ApplianceForm onAdd={addAppliance} />
            </section>

            {/* Appliance List */}
            <section className="animate-fade-in rounded-2xl border border-border bg-card p-5 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">
                  Appliances ({appliances.length})
                </h2>
                {appliances.length > 0 && (
                  <button
                    onClick={() => setAppliances([])}
                    className="text-xs text-muted-foreground transition-colors hover:text-destructive"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <ApplianceList
                appliances={appliances}
                onUpdate={updateAppliance}
                onRemove={removeAppliance}
                onAddFirst={focusAddForm}
              />
            </section>

            {/* System Settings */}
            <section className="animate-fade-in rounded-2xl border border-border bg-card p-5 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                System Settings
              </h2>
              <SystemSettings settings={settings} onChange={setSettings} />
            </section>
          </div>

          {/* Right Column — Results */}
          <div className="space-y-6 lg:col-span-3">
            <section className="animate-fade-in rounded-2xl border border-border bg-card p-5 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-foreground">System Requirements</h2>
                {isUpdating && (
                  <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent animate-pulse">
                    Updating calculations...
                  </span>
                )}
              </div>
              <ResultsPanel
                appliances={appliances}
                settings={settings}
                results={results}
                comparison={comparison}
                cost={cost}
                roi={roi}
              />
            </section>

            <section className="animate-fade-in">
              <ServiceFinderMap />
            </section>

            <CustomerReviewsSection />

            <section className="animate-fade-in rounded-2xl border border-border bg-card p-5 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
              <InsightsPanel insights={insights} />
            </section>
          </div>
        </div>
      </main>

      <AISolarAssistant results={results} cost={cost} roi={roi} settings={settings} />

      <Footer />
    </div>
  );
};

export default Index;
