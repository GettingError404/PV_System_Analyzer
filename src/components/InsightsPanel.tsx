import { AlertTriangle, Info } from "lucide-react";
import type { Insight } from "@/utils/calculations";

interface Props {
  insights: Insight[];
}

const InsightsPanel = ({ insights }: Props) => {
  if (insights.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">System Insights</h3>
      {insights.map((insight, i) => (
        <div
          key={i}
          className={`flex items-start gap-3 rounded-lg border p-3.5 text-sm ${
            insight.type === "warning"
              ? "border-warning/30 bg-warning/5 text-foreground"
              : "border-info/30 bg-info/5 text-foreground"
          }`}
        >
          {insight.type === "warning" ? (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          ) : (
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
          )}
          <p>{insight.message}</p>
        </div>
      ))}
    </div>
  );
};

export default InsightsPanel;
