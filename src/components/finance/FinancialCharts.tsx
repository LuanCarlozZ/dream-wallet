import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Transaction, getExpensesByCategory, getTotalByType } from "@/lib/finance-store";

const COLORS = [
  "hsl(160, 70%, 45%)", "hsl(200, 70%, 55%)", "hsl(38, 92%, 55%)",
  "hsl(280, 60%, 55%)", "hsl(0, 72%, 55%)", "hsl(120, 50%, 50%)",
  "hsl(45, 80%, 55%)", "hsl(320, 60%, 55%)",
];

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface FinancialChartsProps {
  transactions: Transaction[];
  allTransactions: Transaction[];
}

export function FinancialCharts({ transactions, allTransactions }: FinancialChartsProps) {
  const byCategory = getExpensesByCategory(transactions);

  // Monthly overview (last 6 months)
  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthTxns = allTransactions.filter(t => {
      const td = new Date(t.date);
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
    });
    return {
      month: d.toLocaleDateString("pt-BR", { month: "short" }),
      receitas: getTotalByType(monthTxns, "income"),
      despesas: getTotalByType(monthTxns, "expense"),
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Pie - Expenses by category */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4">Gastos por Categoria</h3>
        {byCategory.length ? (
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byCategory} dataKey="amount" nameKey="label" cx="50%" cy="50%"
                  innerRadius={55} outerRadius={90} strokeWidth={2} stroke="hsl(228, 18%, 14%)">
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => fmt(v)}
                  contentStyle={{ background: "hsl(228, 18%, 14%)", border: "1px solid hsl(228, 15%, 20%)", borderRadius: "8px", color: "hsl(210, 20%, 95%)" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {byCategory.slice(0, 6).map((c, i) => (
                <span key={c.category} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {c.label}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-12">Sem dados ainda.</p>
        )}
      </div>

      {/* Bar - Monthly overview */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4">Evolução Mensal</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 15%, 20%)" />
            <XAxis dataKey="month" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => fmt(v)}
              contentStyle={{ background: "hsl(228, 18%, 14%)", border: "1px solid hsl(228, 15%, 20%)", borderRadius: "8px", color: "hsl(210, 20%, 95%)" }} />
            <Bar dataKey="receitas" fill="hsl(160, 70%, 45%)" radius={[4, 4, 0, 0]} name="Receitas" />
            <Bar dataKey="despesas" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} name="Despesas" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
