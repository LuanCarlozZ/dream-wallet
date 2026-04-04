import { useState } from "react";
import { motion } from "framer-motion";
import { Landmark, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || password.length < 6) {
      setError("Email e senha (mín. 6 caracteres) são obrigatórios.");
      setSubmitting(false);
      return;
    }

    if (isLogin) {
      const { error } = await signIn(trimmedEmail, password);
      if (error) setError(translateError(error));
    } else {
      const { error } = await signUp(trimmedEmail, password);
      if (error) {
        setError(translateError(error));
      } else {
        setSuccessMsg("Conta criada! Verifique seu email para confirmar.");
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-3">
            <Landmark className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">FinControl</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLogin ? "Entre na sua conta" : "Crie sua conta"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="pl-10 bg-secondary border-border"
              required
              maxLength={255}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Senha (mín. 6 caracteres)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="pl-10 pr-10 bg-secondary border-border"
              required
              minLength={6}
              maxLength={72}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-expense bg-expense/10 rounded-lg p-2 text-center">{error}</p>
          )}
          {successMsg && (
            <p className="text-sm text-income bg-income/10 rounded-lg p-2 text-center">{successMsg}</p>
          )}

          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={submitting}>
            {submitting ? "Aguarde..." : isLogin ? "Entrar" : "Criar Conta"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(null); setSuccessMsg(null); }}
            className="text-primary hover:underline font-medium"
          >
            {isLogin ? "Cadastre-se" : "Faça login"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

function translateError(msg: string): string {
  if (msg.includes("Invalid login")) return "Email ou senha incorretos.";
  if (msg.includes("already registered")) return "Este email já está cadastrado.";
  if (msg.includes("Email not confirmed")) return "Confirme seu email antes de entrar.";
  if (msg.includes("Password should be")) return "A senha deve ter pelo menos 6 caracteres.";
  return msg;
}
