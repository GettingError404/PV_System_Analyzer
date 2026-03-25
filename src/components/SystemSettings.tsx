import {
  getCitySunlightHours,
  getTiltAngleRecommendation,
  LOCATION_SUNLIGHT_PRESETS,
  type SystemSettings as Settings,
} from "@/utils/calculations";

interface Props {
  settings: Settings;
  onChange: (s: Settings) => void;
}

const SystemSettings = ({ settings, onChange }: Props) => {
  const currentCitySunlight = getCitySunlightHours(settings.locationCity);
  const tiltAngle = getTiltAngleRecommendation(settings.locationCity);

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-secondary/20 p-3.5">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Energy Inputs</h3>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Sunlight Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: "manual", label: "Manual Input", icon: "☀" },
                { value: "location", label: "Location-Based", icon: "📍" },
              ] as const).map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => onChange({ ...settings, sunlightMode: mode.value })}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    settings.sunlightMode === mode.value
                      ? "border-primary bg-solar-muted text-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <span className="mr-1">{mode.icon}</span>
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {settings.sunlightMode === "manual" ? (
            <div>
              <label htmlFor="sunlight-hours-input" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Sunlight Hours / Day
              </label>
              <input
                id="sunlight-hours-input"
                type="number"
                min={1}
                max={12}
                step={0.1}
                value={settings.sunlightHours}
                onChange={(e) => onChange({ ...settings, sunlightHours: Number(e.target.value) })}
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <label htmlFor="location-city-input" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  City Name
                </label>
                <input
                  id="location-city-input"
                  type="text"
                  list="sunlight-city-presets"
                  value={settings.locationCity}
                  onChange={(e) => onChange({ ...settings, locationCity: e.target.value })}
                  placeholder="e.g. Delhi"
                  className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <datalist id="sunlight-city-presets">
                  {LOCATION_SUNLIGHT_PRESETS.map((preset) => (
                    <option key={preset.city} value={preset.city}>
                      {preset.hours} h/day
                    </option>
                  ))}
                </datalist>
              </div>

              <p className="text-xs text-muted-foreground">
                Typical sunlight in India is 5-6 hours/day
              </p>
              <p className="text-xs font-medium text-foreground/80">
                Using: {(currentCitySunlight ?? 5.25).toFixed(2)} h/day
              </p>
            </div>
          )}

          <div>
            <label htmlFor="backup-duration-input" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Backup Duration
            </label>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                id="backup-duration-input"
                type="number"
                min={0.5}
                step={0.5}
                value={settings.backupDurationValue}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    backupDurationValue: Number(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-card p-1">
                {(["hours", "days"] as const).map((unit) => (
                  <button
                    key={unit}
                    onClick={() => onChange({ ...settings, backupDurationUnit: unit })}
                    className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${
                      settings.backupDurationUnit === unit
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {unit === "hours" ? "Hours" : "Days"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-secondary/20 p-3.5">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">System Configuration</h3>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Battery Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["lead-acid", "lithium"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => onChange({ ...settings, batteryType: type })}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    settings.batteryType === type
                      ? "border-primary bg-solar-muted text-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {type === "lead-acid" ? "Lead-Acid" : "Lithium"}
                  <span className="block text-[10px] font-normal opacity-70">
                    DoD {type === "lead-acid" ? "50%" : "80%"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              System Voltage
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([12, 24, 48] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => onChange({ ...settings, systemVoltage: v })}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    settings.systemVoltage === v
                      ? "border-primary bg-solar-muted text-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {v}V
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Charge Controller Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["pwm", "mppt"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => onChange({ ...settings, chargeControllerType: type })}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    settings.chargeControllerType === type
                      ? "border-primary bg-solar-muted text-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {type === "mppt" ? "MPPT" : "PWM"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Grid Availability
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: "yes", label: "Yes (Grid available)" },
                { value: "no", label: "No (No grid)" },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  onClick={() => onChange({ ...settings, gridAvailability: option.value })}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    settings.gridAvailability === option.value
                      ? "border-primary bg-solar-muted text-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Usage Pattern
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {([
                { value: "daytime-heavy", label: "Daytime heavy usage" },
                { value: "nighttime-heavy", label: "Nighttime heavy usage" },
                { value: "balanced", label: "Balanced usage" },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  onClick={() => onChange({ ...settings, usagePattern: option.value })}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    settings.usagePattern === option.value
                      ? "border-primary bg-solar-muted text-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Budget Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  onClick={() => onChange({ ...settings, budgetLevel: option.value })}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    settings.budgetLevel === option.value
                      ? "border-primary bg-solar-muted text-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-secondary/20 p-3.5">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Advanced Settings</h3>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Efficiency Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["simple", "advanced"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onChange({ ...settings, efficiencyMode: mode })}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    settings.efficiencyMode === mode
                      ? "border-primary bg-solar-muted text-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {mode === "simple" ? "Simple" : "Advanced"}
                </button>
              ))}
            </div>
          </div>

          {settings.efficiencyMode === "simple" ? (
            <div>
              <label htmlFor="efficiency-slider" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Efficiency: {settings.efficiencyPercent}%
              </label>
              <input
                id="efficiency-slider"
                type="range"
                min={60}
                max={90}
                step={1}
                value={settings.efficiencyPercent}
                onChange={(e) => onChange({ ...settings, efficiencyPercent: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label htmlFor="panel-loss-slider" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Panel loss: {settings.panelLossPercent}%
                </label>
                <input
                  id="panel-loss-slider"
                  type="range"
                  min={0}
                  max={20}
                  step={1}
                  value={settings.panelLossPercent}
                  onChange={(e) => onChange({ ...settings, panelLossPercent: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label htmlFor="inverter-loss-slider" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Inverter loss: {settings.inverterLossPercent}%
                </label>
                <input
                  id="inverter-loss-slider"
                  type="range"
                  min={0}
                  max={20}
                  step={1}
                  value={settings.inverterLossPercent}
                  onChange={(e) => onChange({ ...settings, inverterLossPercent: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label htmlFor="temperature-loss-slider" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Temperature loss: {settings.temperatureLossPercent}%
                </label>
                <input
                  id="temperature-loss-slider"
                  type="range"
                  min={0}
                  max={20}
                  step={1}
                  value={settings.temperatureLossPercent}
                  onChange={(e) => onChange({ ...settings, temperatureLossPercent: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Total efficiency is calculated automatically as 100% - (all losses).
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-secondary/20 p-3.5">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Smart Optimization</h3>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Seasonal Mode
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {([
                { value: "standard", label: "Standard" },
                { value: "conservative", label: "Conservative" },
                { value: "optimized", label: "Optimized" },
              ] as const).map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => onChange({ ...settings, seasonalMode: mode.value })}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    settings.seasonalMode === mode.value
                      ? "border-primary bg-solar-muted text-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="future-growth-input" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Future Load Growth (%)
            </label>
            <input
              id="future-growth-input"
              type="number"
              min={0}
              max={100}
              step={5}
              value={settings.futureLoadGrowthPercent}
              onChange={(e) =>
                onChange({
                  ...settings,
                  futureLoadGrowthPercent: Number(e.target.value),
                })
              }
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="electricity-rate-input" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Electricity Rate (₹/unit)
            </label>
            <input
              id="electricity-rate-input"
              type="number"
              min={5}
              max={12}
              step={0.5}
              value={settings.electricityRate}
              onChange={(e) =>
                onChange({
                  ...settings,
                  electricityRate: Number(e.target.value),
                })
              }
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="rounded-md border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground">
            Recommended Tilt Angle: {tiltAngle}°
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
