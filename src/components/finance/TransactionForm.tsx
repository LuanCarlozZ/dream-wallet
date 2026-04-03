import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Category, TransactionType, INCOME_CATEGORIES, EXPENSE_CATEGORIES,
  CATEGORY_LABELS, CATEGORY_ICONS,
} from "@/lib/finance-store";

interface TransactionFormProps {
  onAdd: (t: { type: TransactionType; amount: number; category: Category; description: string; date: string }) => void;
}

export function TransactionForm({ onAdd }: TransactionFormProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("food");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0 || !description.trim()) return;
    onAdd({ type, amount: parsedAmount, category, description: description.trim().slice(0, 100), date: new Date(date).toISOString() });
    setAmount(""); setDescription(""); setOpen(false);
  };

  return (
    <div>
      <AnimatePresence>
        {!open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button onClick={() => setOpen(true)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" /> Nova Transação
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <motion.form
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit} className="glass-card p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Nova Transação</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              {(["income", "expense"] as TransactionType[]).map(t => (
                <button key={t} type="button" onClick={() => { setType(t); setCategory(t === "income" ? "salary" : "food"); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    type === t
                      ? t === "income" ? "bg-income/20 text-income" : "bg-expense/20 text-expense"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "income" ? "Receita" : "Despesa"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
                <Input type="number" step="0.01" min="0.01" max="9999999" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="0,00" className="bg-secondary border-border font-mono" required />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Data</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-secondary border-border" required />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Categoria</Label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-1">
                {categories.map(c => (
                  <button key={c} type="button" onClick={() => setCategory(c)}
                    className={`text-xs py-2 px-1 rounded-lg transition-colors text-center ${
                      category === c ? "bg-primary/20 text-primary border border-primary/30" : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="block text-base mb-0.5">{CATEGORY_ICONS[c]}</span>
                    {CATEGORY_LABELS[c]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Descrição</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} maxLength={100}
                placeholder="Ex: Supermercado" className="bg-secondary border-border" required />
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Adicionar
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
