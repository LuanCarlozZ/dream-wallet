import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { SavingsGoal } from "@/lib/finance-store";

interface GoalsProps {
  goals: SavingsGoal[];
  onAddFunds: (id: string, amount: number) => void;
}

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function Goals({ goals, onAddFunds }: GoalsProps) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Metas de Economia</h3>
      </div>
      <div className="space-y-4">
        {goals.map((goal, i) => {
          const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
          return (
            <motion.div key={goal.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium">{goal.icon} {goal.name}</span>
                <span className="text-xs font-mono text-muted-foreground">{pct}%</span>
              </div>
              <div className="h-2.5 bg-secondary rounded-full overflow-hidden mb-1">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: pct >= 80 ? "hsl(160, 70%, 45%)" : pct >= 40 ? "hsl(38, 92%, 55%)" : "hsl(200, 70%, 55%)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{fmt(goal.currentAmount)} / {fmt(goal.targetAmount)}</span>
                <button onClick={() => onAddFunds(goal.id, 100)}
                  className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                  + R$ 100
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
