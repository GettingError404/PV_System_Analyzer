import type { ReactNode } from "react";

interface Props {
  label: string;
  value: string | number;
  unit: string;
  icon: ReactNode;
  primary?: boolean;
  note?: string;
}

const SummaryCard = ({ label, value, unit, icon, primary, note }: Props) => {
  return (
    <div
      className={`rounded-xl border p-5 transition-all duration-300 ${
        primary
          ? "border-primary bg-primary text-primary-foreground shadow-lg animate-pulse-glow"
          : "border-border bg-card text-card-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5"
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className={primary ? "text-primary-foreground/80" : "text-muted-foreground"}>
          {icon}
        </span>
        <span className={`text-xs font-medium uppercase tracking-wider ${primary ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold font-display transition-all duration-300">
          {value}
        </span>
        <span className={`text-sm font-medium ${primary ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
          {unit}
        </span>
      </div>
      {note && (
        <p className={`mt-1.5 text-xs ${primary ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
          {note}
        </p>
      )}
    </div>
  );
};

export default SummaryCard;
