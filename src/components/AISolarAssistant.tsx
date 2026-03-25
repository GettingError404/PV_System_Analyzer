import { useMemo, useState } from "react";
import { Bot, MessageCircle, Send, Sparkles, User, X } from "lucide-react";
import type { CalculationResults, CostEstimate, RoiEstimate, SystemSettings } from "@/utils/calculations";

type MessageRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
}

interface Props {
  results: CalculationResults;
  cost: CostEstimate;
  roi: RoiEstimate;
  settings: SystemSettings;
}

const QUICK_PROMPTS = ["Optimize my system", "Reduce cost", "Explain results"] as const;

const AISolarAssistant = ({ results, cost, roi, settings }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi, I am your AI Solar Assistant. Ask me about system choice, battery size, cost optimization, or results explanation.",
    },
  ]);

  const context = useMemo(
    () => ({
      totalWh: results.totalEnergyWh,
      panelW: results.panelSizeW,
      batteryAh: results.batteryCapacityAh,
      finalCost: cost.finalCost,
      payback: roi.paybackYears,
    }),
    [results, cost, roi]
  );

  const getAssistantResponse = (question: string) => {
    const q = question.toLowerCase();

    if (q.includes("what system") || q.includes("choose") || q.includes("which system")) {
      return `Based on your current profile, ${results.recommendedSystemType} is recommended because ${results.recommendationReason}`;
    }

    if (q.includes("battery") && (q.includes("high") || q.includes("large") || q.includes("big"))) {
      if (results.backupHours >= 6) {
        return "Your battery is large due to high backup requirement. Reducing backup hours will reduce required battery capacity.";
      }
      if (context.totalWh > 4000) {
        return "Your battery size is driven by high daily energy usage. Lowering heavy nighttime loads can reduce battery capacity.";
      }
      return "Battery capacity depends on backup duration, daily energy, voltage, and battery type DoD.";
    }

    if (q.includes("reduce cost") || q.includes("lower cost") || q.includes("cost")) {
      const tips: string[] = [];
      if (settings.batteryType === "lithium") {
        tips.push("switch to lead-acid for lower upfront battery cost");
      }
      if (results.backupHours > 4) {
        tips.push("reduce backup duration to lower battery size");
      }
      if (settings.chargeControllerType === "mppt") {
        tips.push("consider PWM for budget-focused setups (with lower efficiency)");
      }

      if (tips.length === 0) {
        tips.push("optimize appliance runtime and reduce peak backup loads");
      }

      return `To reduce cost, you can ${tips.join(", ")}. Current estimated final cost is ₹${context.finalCost.toLocaleString("en-IN")}.`;
    }

    if (q.includes("lithium")) {
      return "Lithium batteries improve efficiency and lifespan, and they allow deeper usable capacity compared to lead-acid.";
    }

    if (q.includes("optimize")) {
      return results.optimizationSuggestions.length > 0
        ? `Optimization tips: ${results.optimizationSuggestions.join(" ")}`
        : "Your system is already well optimized on the major checks. You can further tune sunlight assumptions and future load growth for precision.";
    }

    if (q.includes("explain") || q.includes("summary") || q.includes("results") || q.includes("system")) {
      return `System summary: Daily usage is ${context.totalWh.toLocaleString()} Wh, recommended panel size is ${context.panelW.toLocaleString()} W, battery is ${context.batteryAh.toLocaleString()} Ah, estimated final cost is ₹${context.finalCost.toLocaleString("en-IN")}, and estimated payback is ${context.payback.toFixed(1)} years.`;
    }

    return "I can help with system choice, battery sizing, cost reduction, and explaining your current results. Try asking: What system should I choose?";
  };

  const postUserMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    window.setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        text: getAssistantResponse(trimmed),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsThinking(false);
    }, 450);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 left-4 sm:left-auto sm:w-96">
      {isOpen && (
        <div className="mb-3 flex h-[70vh] max-h-[620px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 sm:h-[560px]">
          <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/15 via-accent/10 to-info/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">AI Solar Assistant</p>
                <p className="text-xs text-muted-foreground">Context-aware guidance</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-secondary hover:scale-105"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-border px-3 py-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => postUserMessage(prompt)}
                className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-all hover:-translate-y-0.5 hover:bg-muted"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm shadow-sm transition-all ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-secondary/40 text-foreground"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-1 text-[11px] opacity-80">
                    {message.role === "user" ? <User className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                    <span>{message.role === "user" ? "You" : "Assistant"}</span>
                  </div>
                  {message.text}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
                  Assistant is thinking...
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              postUserMessage(input);
            }}
            className="border-t border-border p-3"
          >
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about your system..."
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                className="rounded-xl bg-primary p-2 text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="group inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
          aria-label="Toggle AI assistant"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{isOpen ? "Close Assistant" : "AI Assistant"}</span>
        </button>
      </div>
    </div>
  );
};

export default AISolarAssistant;