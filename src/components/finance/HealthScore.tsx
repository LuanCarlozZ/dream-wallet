import { motion } from "framer-motion";
import { getFinancialHealthScore } from "@/lib/finance-store";
import type { Transaction } from "@/lib/finance-store";

interface HealthScoreProps {
  transactions: Transaction[];
}

export function HealthScore({ transactions }: HealthScoreProps) {
  const score = getFinancialHealthScore(transactions);
  const label = score >= 75 ? "Excelente" : score >= 50 ? "Bom" : score >= 25 ? "Atenção" : "Crítico";
  const color = score >= 75 ? "text-income" : score >= 50 ? "text-primary" : score >= 25 ? "text-warning" : "text-expense";
  const ring = score >= 75 ? "hsl(160, 70%, 45%)" : score >= 50 ? "hsl(160, 70%, 45%)" : score >= 25 ? "hsl(38, 92%, 55%)" : "hsl(0, 72%, 55%)";

  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card p-5 flex flex-col items-center">
      <h3 className="font-semibold mb-4">Saúde Financeira</h3>
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(228, 15%, 20%)" strokeWidth="8" />
          <motion.circle cx="50" cy="50" r="40" fill="none" stroke={ring} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }} transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold font-mono ${color}`}>{score}</span>
        </div>
      </div>
      <span className={`mt-2 text-sm font-medium ${color}`}>{label}</span>
      <p className="text-xs text-muted-foreground text-center mt-1">
        Baseado na relação receitas/despesas
      </p>
    </div>
  );
}
