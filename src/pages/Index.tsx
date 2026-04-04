import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Landmark, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import {
  fetchTransactions, addTransactionDB, deleteTransactionDB,
  fetchBills, addBillDB, toggleBillPaidDB, deleteBillDB,
  fetchGoals, addGoalDB, updateGoalDB, deleteGoalDB,
  getMonthTransactions, getTotalByType,
  Transaction, Bill, SavingsGoal,
} from "@/lib/finance-store";
import { BalanceCards } from "@/components/finance/BalanceCards";
import { TransactionForm } from "@/components/finance/TransactionForm";
import { TransactionList } from "@/components/finance/TransactionList";
import { UpcomingBills } from "@/components/finance/UpcomingBills";
import { FinancialCharts } from "@/components/finance/FinancialCharts";
import { Goals } from "@/components/finance/Goals";
import { HealthScore } from "@/components/finance/HealthScore";
import { toast } from "sonner";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setDataLoading(true);
    Promise.all([
      fetchTransactions(user.id),
      fetchBills(user.id),
      fetchGoals(user.id),
    ]).then(([t, b, g]) => {
      setTransactions(t);
      setBills(b);
      setGoals(g);
    }).catch(() => toast.error("Erro ao carregar dados"))
      .finally(() => setDataLoading(false));
  }, [user]);

  const monthTxns = getMonthTransactions(transactions);
  const income = getTotalByType(monthTxns, "income");
  const expenses = getTotalByType(monthTxns, "expense");
  const balance = income - expenses;
  const savings = Math.max(0, balance);

  const handleAdd = useCallback(async (t: Parameters<typeof addTransactionDB>[1]) => {
    if (!user) return;
    try {
      await addTransactionDB(user.id, t);
      setTransactions(await fetchTransactions(user.id));
      toast.success("Transação adicionada!");
    } catch { toast.error("Erro ao adicionar transação"); }
  }, [user]);

  const handleDelete = useCallback(async (id: string) => {
    if (!user) return;
    try {
      await deleteTransactionDB(id);
      setTransactions(await fetchTransactions(user.id));
    } catch { toast.error("Erro ao deletar"); }
  }, [user]);

  const handleToggleBill = useCallback(async (id: string) => {
    if (!user) return;
    const bill = bills.find(b => b.id === id);
    if (!bill) return;
    try {
      await toggleBillPaidDB(id, !bill.paid);
      setBills(await fetchBills(user.id));
    } catch { toast.error("Erro ao atualizar conta"); }
  }, [user, bills]);

  const handleDeleteBill = useCallback(async (id: string) => {
    if (!user) return;
    try {
      await deleteBillDB(id);
      setBills(await fetchBills(user.id));
    } catch { toast.error("Erro ao deletar conta"); }
  }, [user]);

  const handleAddBill = useCallback(async (b: Omit<Bill, "id">) => {
    if (!user) return;
    try {
      await addBillDB(user.id, b);
      setBills(await fetchBills(user.id));
      toast.success("Conta adicionada!");
    } catch { toast.error("Erro ao adicionar conta"); }
  }, [user]);

  const handleAddFunds = useCallback(async (id: string, amount: number) => {
    if (!user) return;
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    try {
      await updateGoalDB(id, Math.min(goal.targetAmount, goal.currentAmount + amount));
      setGoals(await fetchGoals(user.id));
      toast.success("Valor adicionado à meta!");
    } catch { toast.error("Erro ao atualizar meta"); }
  }, [user, goals]);

  const handleAddGoal = useCallback(async (g: Omit<SavingsGoal, "id">) => {
    if (!user) return;
    try {
      await addGoalDB(user.id, g);
      setGoals(await fetchGoals(user.id));
      toast.success("Meta criada!");
    } catch { toast.error("Erro ao criar meta"); }
  }, [user]);

  const handleDeleteGoal = useCallback(async (id: string) => {
    if (!user) return;
    try {
      await deleteGoalDB(id);
      setGoals(await fetchGoals(user.id));
    } catch { toast.error("Erro ao deletar meta"); }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const now = new Date();
  const monthLabel = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-background">
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
          <button onClick={signOut}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {dataLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <BalanceCards balance={balance} income={income} expenses={expenses} savings={savings} />
            <FinancialCharts transactions={monthTxns} allTransactions={transactions} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <div className="space-y-4">
                <HealthScore transactions={monthTxns} />
                <UpcomingBills bills={bills} onToggle={handleToggleBill} onDelete={handleDeleteBill} onAdd={handleAddBill} />
                <Goals goals={goals} onAddFunds={handleAddFunds} onAddGoal={handleAddGoal} onDeleteGoal={handleDeleteGoal} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
