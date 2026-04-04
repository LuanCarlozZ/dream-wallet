import { supabase } from "@/integrations/supabase/client";

export type TransactionType = 'income' | 'expense';

export type Category =
  | 'salary' | 'freelance' | 'investments' | 'other_income'
  | 'food' | 'transport' | 'housing' | 'entertainment' | 'health'
  | 'education' | 'shopping' | 'bills' | 'subscriptions' | 'other';

export const CATEGORY_LABELS: Record<Category, string> = {
  salary: 'Salário', freelance: 'Freelance', investments: 'Investimentos', other_income: 'Outras Receitas',
  food: 'Alimentação', transport: 'Transporte', housing: 'Moradia', entertainment: 'Lazer',
  health: 'Saúde', education: 'Educação', shopping: 'Compras', bills: 'Contas',
  subscriptions: 'Assinaturas', other: 'Outros',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  salary: '💰', freelance: '💻', investments: '📈', other_income: '💵',
  food: '🍔', transport: '🚗', housing: '🏠', entertainment: '🎮',
  health: '🏥', education: '📚', shopping: '🛍️', bills: '📄',
  subscriptions: '📺', other: '📦',
};

export const INCOME_CATEGORIES: Category[] = ['salary', 'freelance', 'investments', 'other_income'];
export const EXPENSE_CATEGORIES: Category[] = ['food', 'transport', 'housing', 'entertainment', 'health', 'education', 'shopping', 'bills', 'subscriptions', 'other'];

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  description: string;
  date: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  category: Category;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
}

// ---- Supabase CRUD ----

export async function fetchTransactions(userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(r => ({
    id: r.id,
    type: r.type as TransactionType,
    amount: Number(r.amount),
    category: r.category as Category,
    description: r.description,
    date: r.date,
  }));
}

export async function addTransactionDB(userId: string, t: Omit<Transaction, "id">) {
  const { error } = await supabase.from("transactions").insert({
    user_id: userId,
    type: t.type,
    amount: t.amount,
    category: t.category,
    description: t.description,
    date: t.date,
  });
  if (error) throw error;
}

export async function deleteTransactionDB(id: string) {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchBills(userId: string): Promise<Bill[]> {
  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(r => ({
    id: r.id,
    name: r.name,
    amount: Number(r.amount),
    dueDate: r.due_date,
    paid: r.paid,
    category: r.category as Category,
  }));
}

export async function addBillDB(userId: string, b: Omit<Bill, "id">) {
  const { error } = await supabase.from("bills").insert({
    user_id: userId,
    name: b.name,
    amount: b.amount,
    due_date: b.dueDate,
    paid: b.paid,
    category: b.category,
  });
  if (error) throw error;
}

export async function toggleBillPaidDB(id: string, paid: boolean) {
  const { error } = await supabase.from("bills").update({ paid }).eq("id", id);
  if (error) throw error;
}

export async function deleteBillDB(id: string) {
  const { error } = await supabase.from("bills").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchGoals(userId: string): Promise<SavingsGoal[]> {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(r => ({
    id: r.id,
    name: r.name,
    targetAmount: Number(r.target_amount),
    currentAmount: Number(r.current_amount),
    icon: r.icon,
  }));
}

export async function addGoalDB(userId: string, g: Omit<SavingsGoal, "id">) {
  const { error } = await supabase.from("goals").insert({
    user_id: userId,
    name: g.name,
    target_amount: g.targetAmount,
    current_amount: g.currentAmount,
    icon: g.icon,
  });
  if (error) throw error;
}

export async function updateGoalDB(id: string, currentAmount: number) {
  const { error } = await supabase.from("goals").update({ current_amount: currentAmount }).eq("id", id);
  if (error) throw error;
}

export async function deleteGoalDB(id: string) {
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw error;
}

// ---- Helper functions (pure, no DB) ----

export function getMonthTransactions(transactions: Transaction[], date: Date = new Date()): Transaction[] {
  const month = date.getMonth();
  const year = date.getFullYear();
  return transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
}

export function getTotalByType(transactions: Transaction[], type: TransactionType): number {
  return transactions.filter(t => t.type === type).reduce((sum, t) => sum + t.amount, 0);
}

export function getExpensesByCategory(transactions: Transaction[]): { category: Category; amount: number; label: string }[] {
  const map = new Map<Category, number>();
  transactions.filter(t => t.type === 'expense').forEach(t => {
    map.set(t.category, (map.get(t.category) || 0) + t.amount);
  });
  return Array.from(map.entries())
    .map(([category, amount]) => ({ category, amount, label: CATEGORY_LABELS[category] }))
    .sort((a, b) => b.amount - a.amount);
}

export function getFinancialHealthScore(transactions: Transaction[]): number {
  const income = getTotalByType(transactions, 'income');
  const expenses = getTotalByType(transactions, 'expense');
  if (income === 0) return 0;
  const savingsRate = (income - expenses) / income;
  return Math.max(0, Math.min(100, Math.round(savingsRate * 100 + 50)));
}
