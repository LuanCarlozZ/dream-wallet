import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Landmark } from "lucide-react";
import {
  loadData, addTransaction, deleteTransaction, toggleBillPaid, deleteBill, addBill, updateGoal, addGoal, deleteGoal,
  getMonthTransactions, getTotalByType, FinanceData,
} from "@/lib/finance-store";
import { BalanceCards } from "@/components/finance/BalanceCards";
import { TransactionForm } from "@/components/finance/TransactionForm";
import { TransactionList } from "@/components/finance/TransactionList";
import { UpcomingBills } from "@/components/finance/UpcomingBills";
import { FinancialCharts } from "@/components/finance/FinancialCharts";
import { Goals } from "@/components/finance/Goals";
import { HealthScore } from "@/components/finance/HealthScore";

const Index = () => {
  const [data, setData] = useState<FinanceData>(loadData);

  const monthTxns = getMonthTransactions(data.transactions);
  const income = getTotalByType(monthTxns, "income");
  const expenses = getTotalByType(monthTxns, "expense");
  const balance = income - expenses;
  const savings = Math.max(0, balance);

  const handleAdd = useCallback((t: Parameters<typeof addTransaction>[1]) => {
    setData(prev => addTransaction(prev, t));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setData(prev => deleteTransaction(prev, id));
  }, []);

  const handleToggleBill = useCallback((id: string) => {
    setData(prev => toggleBillPaid(prev, id));
  }, []);

  const handleDeleteBill = useCallback((id: string) => {
    setData(prev => deleteBill(prev, id));
  }, []);

  const handleAddBill = useCallback((b: Parameters<typeof addBill>[1]) => {
    setData(prev => addBill(prev, b));
  }, []);

  const handleAddFunds = useCallback((id: string, amount: number) => {
    setData(prev => updateGoal(prev, id, amount));
  }, []);

  const handleAddGoal = useCallback((g: Parameters<typeof addGoal>[1]) => {
    setData(prev => addGoal(prev, g));
  }, []);

  const handleDeleteGoal = useCallback((id: string) => {
    setData(prev => deleteGoal(prev, id));
  }, []);

  const now = new Date();
  const monthLabel = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">FinControl</h1>
              <p className="text-xs text-muted-foreground capitalize">{monthLabel}</p>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <BalanceCards balance={balance} income={income} expenses={expenses} savings={savings} />

        <FinancialCharts transactions={monthTxns} allTransactions={data.transactions} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Transactions */}
          <div className="lg:col-span-2 space-y-4">
            <TransactionForm onAdd={handleAdd} />
            <div className="glass-card p-5">
              <h3 className="font-semibold mb-3">Transações Recentes</h3>
              <TransactionList
                transactions={monthTxns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
                onDelete={handleDelete}
              />
            </div>
          </div>

          {/* Right: Bills, Goals, Score */}
          <div className="space-y-4">
            <HealthScore transactions={monthTxns} />
            <UpcomingBills bills={data.bills} onToggle={handleToggleBill} onDelete={handleDeleteBill} onAdd={handleAddBill} />
            <Goals goals={data.goals} onAddFunds={handleAddFunds} onAddGoal={handleAddGoal} onDeleteGoal={handleDeleteGoal} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
