import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Trash2, CalendarClock, Plus, X } from "lucide-react";
import { Bill, CATEGORY_ICONS, EXPENSE_CATEGORIES, CATEGORY_LABELS, Category } from "@/lib/finance-store";

interface UpcomingBillsProps {
  bills: Bill[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (bill: Omit<Bill, "id">) => void;
}

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

export function UpcomingBills({ bills, onToggle, onDelete, onAdd }: UpcomingBillsProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState<Category>("bills");

  const sorted = [...bills].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const totalPending = sorted.filter(b => !b.paid).reduce((s, b) => s + b.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !dueDate) return;
    onAdd({ name, amount: parseFloat(amount), dueDate: new Date(dueDate).toISOString(), paid: false, category });
    setName(""); setAmount(""); setDueDate(""); setCategory("bills");
    setShowForm(false);
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-warning" />
          <h3 className="font-semibold">Contas a Pagar</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-warning">{fmt(totalPending)}</span>
          <button onClick={() => setShowForm(!showForm)}
            className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors">
            {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {showForm && (
        <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="mb-4 space-y-2 p-3 rounded-lg bg-secondary/50 border border-border/50">
          <input type="text" placeholder="Nome da conta" value={name} onChange={e => setName(e.target.value)}
            className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" step="0.01" placeholder="Valor" value={amount} onChange={e => setAmount(e.target.value)}
              className="bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
              className="bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value as Category)}
            className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
            {EXPENSE_CATEGORIES.map(c => (
              <option key={c} value={c}>{CATEGORY_ICONS[c]} {CATEGORY_LABELS[c]}</option>
            ))}
          </select>
          <button type="submit"
            className="w-full bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
            Adicionar Conta
          </button>
        </motion.form>
      )}

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
