import { useMemo, useState } from "react";
import { Check, Pencil, Trash2, X, Zap } from "lucide-react";
import type { Appliance } from "@/utils/calculations";

interface Props {
  appliances: Appliance[];
  onUpdate: (id: string, updates: Pick<Appliance, "name" | "power" | "hours">) => void;
  onRemove: (id: string) => void;
  onAddFirst: () => void;
}

const ApplianceList = ({ appliances, onUpdate, onRemove, onAddFirst }: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftPower, setDraftPower] = useState("");
  const [draftHours, setDraftHours] = useState("");
  const [editError, setEditError] = useState("");
  const [exitingIds, setExitingIds] = useState<string[]>([]);

  const totalPower = useMemo(
    () => appliances.reduce((sum, appliance) => sum + appliance.power, 0),
    [appliances]
  );
  const totalEnergy = useMemo(
    () => appliances.reduce((sum, appliance) => sum + appliance.power * appliance.hours, 0),
    [appliances]
  );
  const totalEnergyKWh = useMemo(() => totalEnergy / 1000, [totalEnergy]);
  const applianceRows = useMemo(
    () =>
      appliances.map((appliance) => ({
        ...appliance,
        totalWh: appliance.power * appliance.hours,
      })),
    [appliances]
  );

  const startEditing = (appliance: Appliance) => {
    setEditingId(appliance.id);
    setDraftName(appliance.name);
    setDraftPower(String(appliance.power));
    setDraftHours(String(appliance.hours));
    setEditError("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditError("");
  };

  const saveEditing = () => {
    if (!editingId) return;

    const trimmedName = draftName.trim();
    const power = Number(draftPower);
    const hours = Number(draftHours);

    if (!trimmedName) {
      setEditError("Name cannot be empty.");
      return;
    }
    if (Number.isNaN(power) || power <= 0 || Number.isNaN(hours) || hours <= 0) {
      setEditError("Power and hours must be greater than 0.");
      return;
    }

    onUpdate(editingId, { name: trimmedName, power, hours });
    setEditingId(null);
    setEditError("");
  };

  const removeWithAnimation = (id: string) => {
    setExitingIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    window.setTimeout(() => {
      onRemove(id);
      setExitingIds((prev) => prev.filter((exitingId) => exitingId !== id));
    }, 180);
  };

  if (appliances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/20 py-10 text-center">
        <Zap className="mb-3 h-10 w-10 text-primary/70" />
        <p className="text-sm font-medium text-foreground">
          Start by adding appliances to calculate your solar system
        </p>
        <button
          onClick={onAddFirst}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.02] hover:opacity-90"
        >
          Add First Appliance
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="hidden grid-cols-4 gap-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
        <span>Name</span>
        <span>Watts</span>
        <span>Hours</span>
        <span>Total Wh</span>
      </div>

      {applianceRows.map((a) => (
        <div
          key={a.id}
          className={`rounded-xl border border-border bg-secondary/50 px-4 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-secondary hover:shadow-md ${
            exitingIds.includes(a.id)
              ? "animate-out fade-out slide-out-to-right-2 duration-200"
              : "animate-in fade-in slide-in-from-bottom-1 duration-300"
          }`}
        >
          {editingId === a.id ? (
            <div className="w-full space-y-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                <input
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const parent = e.currentTarget.parentElement;
                      const nextInput = parent?.querySelectorAll("input")?.[1];
                      if (nextInput instanceof HTMLInputElement) {
                        nextInput.focus();
                      }
                    }
                    if (e.key === "Escape") {
                      cancelEditing();
                    }
                  }}
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                  placeholder="Name"
                />
                <input
                  type="number"
                  min={1}
                  value={draftPower}
                  onChange={(e) => setDraftPower(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const parent = e.currentTarget.parentElement;
                      const nextInput = parent?.querySelectorAll("input")?.[2];
                      if (nextInput instanceof HTMLInputElement) {
                        nextInput.focus();
                      }
                    }
                  }}
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                  placeholder="Watts"
                />
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={draftHours}
                  onChange={(e) => setDraftHours(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      saveEditing();
                    }
                  }}
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                  placeholder="Hours"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={saveEditing}
                    className="rounded-md p-2 text-emerald-600 transition-colors hover:bg-emerald-100"
                    aria-label="Save appliance"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted"
                    aria-label="Cancel edit"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {editError && <p className="text-xs text-destructive">{editError}</p>}
            </div>
          ) : (
            <div className="flex w-full items-center gap-3">
              <button
                onClick={() => startEditing(a)}
                className="grid flex-1 grid-cols-2 gap-3 text-left sm:grid-cols-4"
                title="Click to quick edit"
              >
                <span className="truncate text-sm font-medium text-card-foreground">{a.name}</span>
                <span className="text-sm text-muted-foreground">{a.power} W</span>
                <span className="text-sm text-muted-foreground">{a.hours} h</span>
                <span className="text-sm font-semibold text-foreground">{a.totalWh.toLocaleString()} Wh</span>
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEditing(a)}
                  className="rounded-md p-1.5 text-muted-foreground transition-all hover:scale-105 hover:bg-primary/10 hover:text-primary"
                  aria-label={`Edit ${a.name}`}
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeWithAnimation(a.id)}
                  className="rounded-md p-1.5 text-muted-foreground transition-all hover:scale-105 hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Delete ${a.name}`}
                  title="Delete appliance 🗑"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="rounded-lg border border-border bg-card p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Power</span>
          <span className="font-semibold text-foreground">{totalPower.toLocaleString()} W</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Energy</span>
          <span className="font-semibold text-foreground">
            {totalEnergy.toLocaleString()} Wh/day ({totalEnergyKWh.toFixed(2)} kWh/day)
          </span>
        </div>
      </div>
    </div>
  );
};

export default ApplianceList;
