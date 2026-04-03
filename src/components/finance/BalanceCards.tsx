import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";

interface BalanceCardsProps {
  balance: number;
  income: number;
  expenses: number;
  savings: number;
}

const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function BalanceCards({ balance, income, expenses, savings }: BalanceCardsProps) {
  const cards = [
    { label: "Saldo Atual", value: balance, icon: Wallet, accent: "primary" as const },
    { label: "Receitas", value: income, icon: TrendingUp, accent: "income" as const },
    { label: "Despesas", value: expenses, icon: TrendingDown, accent: "expense" as const },
    { label: "Economia", value: savings, icon: PiggyBank, accent: "warning" as const },
  ];

  const accentClasses = {
    primary: "text-primary bg-primary/10",
    income: "text-income bg-income/10",
    expense: "text-expense bg-expense/10",
    warning: "text-warning bg-warning/10",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="glass-card p-5 relative overflow-hidden group hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground font-medium">{card.label}</span>
            <div className={`p-2 rounded-lg ${accentClasses[card.accent]}`}>
              <card.icon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono tracking-tight">{fmt(card.value)}</p>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
      ))}
    </div>
  );
}
