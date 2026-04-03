import { motion } from "framer-motion";
import { Check, Trash2, CalendarClock } from "lucide-react";
import { Bill, CATEGORY_ICONS } from "@/lib/finance-store";

interface UpcomingBillsProps {
  bills: Bill[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

export function UpcomingBills({ bills, onToggle, onDelete }: UpcomingBillsProps) {
  const sorted = [...bills].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const totalPending = sorted.filter(b => !b.paid).reduce((s, b) => s + b.amount, 0);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-warning" />
          <h3 className="font-semibold">Contas a Pagar</h3>
        </div>
        <span className="text-sm font-mono text-warning">{fmt(totalPending)}</span>
      </div>
      <div className="space-y-2">
        {sorted.map((bill, i) => (
          <motion.div
            key={bill.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 p-3 rounded-lg group transition-colors ${
              bill.paid ? "bg-income/5 border border-income/20" : "bg-secondary/50 hover:bg-secondary"
            }`}
          >
            <button onClick={() => onToggle(bill.id)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                bill.paid ? "border-income bg-income text-income-foreground" : "border-muted-foreground hover:border-primary"
              }`}
            >
              {bill.paid && <Check className="w-3.5 h-3.5" />}
            </button>
            <span className="text-lg">{CATEGORY_ICONS[bill.category]}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${bill.paid ? "line-through text-muted-foreground" : ""}`}>{bill.name}</p>
              <p className="text-xs text-muted-foreground">Vence {fmtDate(bill.dueDate)}</p>
            </div>
            <span className="font-mono text-sm font-semibold text-expense">{fmt(bill.amount)}</span>
            <button onClick={() => onDelete(bill.id)}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-expense transition-all p-1">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
        {!bills.length && <p className="text-muted-foreground text-sm text-center py-4">Nenhuma conta cadastrada.</p>}
      </div>
    </div>
  );
}
