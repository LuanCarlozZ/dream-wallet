import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Plus, X, Trash2 } from "lucide-react";
import { SavingsGoal } from "@/lib/finance-store";

interface GoalsProps {
  goals: SavingsGoal[];
  onAddFunds: (id: string, amount: number) => void;
  onAddGoal: (goal: Omit<SavingsGoal, "id">) => void;
  onDeleteGoal: (id: string) => void;
}

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const GOAL_ICONS = ["🎯", "✈️", "🏠", "🚗", "💻", "📱", "🎓", "💍", "🛡️", "🎸", "🏋️", "🎮"];

export function Goals({ goals, onAddFunds, onAddGoal, onDeleteGoal }: GoalsProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [customAmount, setCustomAmount] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target) return;
    onAddGoal({ name, targetAmount: parseFloat(target), currentAmount: 0, icon });
    setName(""); setTarget(""); setIcon("🎯");
    setShowForm(false);
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Metas de Economia</h3>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors">
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showForm && (
        <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="mb-4 space-y-2 p-3 rounded-lg bg-secondary/50 border border-border/50">
          <input type="text" placeholder="Nome da meta" value={name} onChange={e => setName(e.target.value)}
            className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="number" step="0.01" placeholder="Valor alvo (R$)" value={target} onChange={e => setTarget(e.target.value)}
            className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <div className="flex flex-wrap gap-1.5">
            {GOAL_ICONS.map(ic => (
              <button key={ic} type="button" onClick={() => setIcon(ic)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${
                  icon === ic ? "bg-primary/30 ring-1 ring-primary" : "bg-background/50 hover:bg-secondary"
                }`}>{ic}</button>
            ))}
          </div>
          <button type="submit"
            className="w-full bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
            Criar Meta
          </button>
        </motion.form>
      )}

      <div className="space-y-4">
        {goals.map((goal, i) => {
          const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
          return (
            <motion.div key={goal.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
              className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium">{goal.icon} {goal.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{pct}%</span>
                  <button onClick={() => onDeleteGoal(goal.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-expense transition-all">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
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
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="100"
                    value={customAmount[goal.id] || ""}
                    onChange={e => setCustomAmount(prev => ({ ...prev, [goal.id]: e.target.value }))}
                    className="w-16 bg-background/50 border border-border/50 rounded px-1.5 py-0.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button onClick={() => {
                    const val = parseFloat(customAmount[goal.id] || "100");
                    if (val > 0) onAddFunds(goal.id, val);
                    setCustomAmount(prev => ({ ...prev, [goal.id]: "" }));
                  }}
                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors whitespace-nowrap">
                    + Adicionar
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
        {!goals.length && <p className="text-muted-foreground text-sm text-center py-4">Nenhuma meta criada.</p>}
      </div>
    </div>
  );
}
