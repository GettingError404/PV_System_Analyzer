import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { POWER_HINTS } from "@/utils/calculations";

interface Props {
  onAdd: (name: string, power: number, hours: number) => void;
}

const ApplianceForm = ({ onAdd }: Props) => {
  const [name, setName] = useState("");
  const [power, setPower] = useState("");
  const [hours, setHours] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    power?: string;
    hours?: string;
  }>({});

  const nameRef = useRef<HTMLInputElement>(null);
  const powerRef = useRef<HTMLInputElement>(null);
  const hoursRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: { name?: string; power?: string; hours?: string } = {};
    const trimmedName = name.trim();
    const powerNum = Number(power);
    const hoursNum = Number(hours);

    if (!trimmedName) {
      nextErrors.name = "Appliance name is required.";
    }
    if (!power || Number.isNaN(powerNum) || powerNum <= 0) {
      nextErrors.power = "Power must be greater than 0.";
    }
    if (!hours || Number.isNaN(hoursNum) || hoursNum <= 0) {
      nextErrors.hours = "Hours must be greater than 0.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.name) {
        nameRef.current?.focus();
      } else if (nextErrors.power) {
        powerRef.current?.focus();
      } else {
        hoursRef.current?.focus();
      }
      return;
    }

    onAdd(trimmedName, powerNum, hoursNum);
    setName("");
    setPower("");
    setHours("");
    setErrors({});
    nameRef.current?.focus();
  };

  const applyHint = (hint: { name: string; watts: number }) => {
    setName(hint.name);
    setPower(String(hint.watts));
    setErrors((prev) => ({ ...prev, name: undefined, power: undefined }));
    hoursRef.current?.focus();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          id="appliance-name-input"
          ref={nameRef}
          type="text"
          placeholder="Appliance name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) {
              setErrors((prev) => ({ ...prev, name: undefined }));
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              powerRef.current?.focus();
            }
          }}
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        <div className="grid grid-cols-2 gap-3">
          <input
            ref={powerRef}
            type="number"
            placeholder="Power (W)"
            value={power}
            onChange={(e) => {
              setPower(e.target.value);
              if (errors.power) {
                setErrors((prev) => ({ ...prev, power: undefined }));
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                hoursRef.current?.focus();
              }
            }}
            min={1}
            className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            ref={hoursRef}
            type="number"
            placeholder="Hours/day"
            value={hours}
            onChange={(e) => {
              setHours(e.target.value);
              if (errors.hours) {
                setErrors((prev) => ({ ...prev, hours: undefined }));
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleSubmit(e);
              }
            }}
            min={1}
            max={24}
            className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {(errors.power || errors.hours) && (
          <div className="space-y-1">
            {errors.power && <p className="text-xs text-destructive">{errors.power}</p>}
            {errors.hours && <p className="text-xs text-destructive">{errors.hours}</p>}
          </div>
        )}
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Appliance
        </button>
      </form>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Quick add:</p>
        <div className="flex flex-wrap gap-1.5">
          {POWER_HINTS.map((h) => (
            <button
              key={h.name}
              onClick={() => applyHint(h)}
              className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs text-secondary-foreground transition-colors hover:bg-muted"
            >
              {h.name} ≈ {h.watts}W
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApplianceForm;
