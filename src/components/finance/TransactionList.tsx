import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Transaction, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/finance-store";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

export function TransactionList({ transactions, onDelete }: TransactionListProps) {
  if (!transactions.length) {
    return <p className="text-muted-foreground text-sm text-center py-8">Nenhuma transação ainda.</p>;
  }

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin pr-1">
      {transactions.slice(0, 20).map((t, i) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary group transition-colors"
        >
          <span className="text-xl">{CATEGORY_ICONS[t.category]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{t.description}</p>
            <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[t.category]} · {fmtDate(t.date)}</p>
          </div>
          <span className={`font-mono text-sm font-semibold ${t.type === "income" ? "text-income" : "text-expense"}`}>
            {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
          </span>
          <button onClick={() => onDelete(t.id)}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-expense transition-all p-1">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      ))}
    </div>
  );
}
