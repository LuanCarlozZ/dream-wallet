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
  date: string; // ISO
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO
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

export interface FinanceData {
  transactions: Transaction[];
  bills: Bill[];
  goals: SavingsGoal[];
}

const STORAGE_KEY = 'finance-data';

const generateId = () => crypto.randomUUID();

function getDefaultData(): FinanceData {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const transactions: Transaction[] = [
    { id: generateId(), type: 'income', amount: 5500, category: 'salary', description: 'Salário mensal', date: new Date(year, month, 5).toISOString() },
    { id: generateId(), type: 'income', amount: 1200, category: 'freelance', description: 'Projeto freelance', date: new Date(year, month, 12).toISOString() },
    { id: generateId(), type: 'expense', amount: 1800, category: 'housing', description: 'Aluguel', date: new Date(year, month, 1).toISOString() },
    { id: generateId(), type: 'expense', amount: 450, category: 'food', description: 'Supermercado', date: new Date(year, month, 3).toISOString() },
    { id: generateId(), type: 'expense', amount: 200, category: 'transport', description: 'Combustível', date: new Date(year, month, 7).toISOString() },
    { id: generateId(), type: 'expense', amount: 89.90, category: 'subscriptions', description: 'Streaming', date: new Date(year, month, 10).toISOString() },
    { id: generateId(), type: 'expense', amount: 350, category: 'entertainment', description: 'Jantar fora', date: new Date(year, month, 15).toISOString() },
    { id: generateId(), type: 'expense', amount: 150, category: 'health', description: 'Farmácia', date: new Date(year, month, 8).toISOString() },
    // Previous month
    { id: generateId(), type: 'income', amount: 5500, category: 'salary', description: 'Salário mensal', date: new Date(year, month - 1, 5).toISOString() },
    { id: generateId(), type: 'expense', amount: 1800, category: 'housing', description: 'Aluguel', date: new Date(year, month - 1, 1).toISOString() },
    { id: generateId(), type: 'expense', amount: 520, category: 'food', description: 'Supermercado', date: new Date(year, month - 1, 4).toISOString() },
    { id: generateId(), type: 'expense', amount: 180, category: 'transport', description: 'Uber', date: new Date(year, month - 1, 9).toISOString() },
  ];

  const nextMonth = new Date(year, month + 1);
  const bills: Bill[] = [
    { id: generateId(), name: 'Aluguel', amount: 1800, dueDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1).toISOString(), paid: false, category: 'housing' },
    { id: generateId(), name: 'Internet', amount: 120, dueDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 10).toISOString(), paid: false, category: 'bills' },
    { id: generateId(), name: 'Energia', amount: 280, dueDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 15).toISOString(), paid: false, category: 'bills' },
    { id: generateId(), name: 'Cartão de Crédito', amount: 1450, dueDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 20).toISOString(), paid: false, category: 'bills' },
    { id: generateId(), name: 'Streaming', amount: 89.90, dueDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 10).toISOString(), paid: true, category: 'subscriptions' },
  ];

  const goals: SavingsGoal[] = [
    { id: generateId(), name: 'Reserva de Emergência', targetAmount: 30000, currentAmount: 12500, icon: '🛡️' },
    { id: generateId(), name: 'Viagem', targetAmount: 8000, currentAmount: 3200, icon: '✈️' },
    { id: generateId(), name: 'Notebook Novo', targetAmount: 5000, currentAmount: 4100, icon: '💻' },
  ];

  return { transactions, bills, goals };
}

export function loadData(): FinanceData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const data = getDefaultData();
  saveData(data);
  return data;
}

export function saveData(data: FinanceData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addTransaction(data: FinanceData, t: Omit<Transaction, 'id'>): FinanceData {
  const updated = { ...data, transactions: [{ ...t, id: generateId() }, ...data.transactions] };
  saveData(updated);
  return updated;
}

export function deleteTransaction(data: FinanceData, id: string): FinanceData {
  const updated = { ...data, transactions: data.transactions.filter(t => t.id !== id) };
  saveData(updated);
  return updated;
}

export function addBill(data: FinanceData, b: Omit<Bill, 'id'>): FinanceData {
  const updated = { ...data, bills: [...data.bills, { ...b, id: generateId() }] };
  saveData(updated);
  return updated;
}

export function toggleBillPaid(data: FinanceData, id: string): FinanceData {
  const updated = { ...data, bills: data.bills.map(b => b.id === id ? { ...b, paid: !b.paid } : b) };
  saveData(updated);
  return updated;
}

export function deleteBill(data: FinanceData, id: string): FinanceData {
  const updated = { ...data, bills: data.bills.filter(b => b.id !== id) };
  saveData(updated);
  return updated;
}

export function addGoal(data: FinanceData, g: Omit<SavingsGoal, 'id'>): FinanceData {
  const updated = { ...data, goals: [...data.goals, { ...g, id: generateId() }] };
  saveData(updated);
  return updated;
}

export function deleteGoal(data: FinanceData, id: string): FinanceData {
  const updated = { ...data, goals: data.goals.filter(g => g.id !== id) };
  saveData(updated);
  return updated;
}

export function updateGoal(data: FinanceData, id: string, amount: number): FinanceData {
  const updated = { ...data, goals: data.goals.map(g => g.id === id ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) } : g) };
  saveData(updated);
  return updated;
}

// Helpers
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
