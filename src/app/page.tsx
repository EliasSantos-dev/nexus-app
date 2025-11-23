"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, ShieldCheck, UserPlus, LogIn } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import axios from "axios";
import { toast } from "sonner";
import { useCreateUser } from "@/hooks/useNexus"; // <--- Importe o novo hook

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); // Toggle entre Login e Cadastro

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />

      <motion.div 
        layout
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Nexus Web</h1>
          <p className="text-slate-400">
            {isLogin ? "Acesse sua conta digital" : "Abra sua conta e ganhe R$ 100k"}
          </p>
        </div>

        <Card>
          {/* Abas de Navegação */}
          <div className="flex p-1 bg-slate-800/50 rounded-xl mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                isLogin ? "bg-primary text-background shadow-lg" : "text-slate-400 hover:text-white"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                !isLogin ? "bg-primary text-background shadow-lg" : "text-slate-400 hover:text-white"
              }`}
            >
              Criar Conta
            </button>
          </div>

          <AnimatePresence mode="wait">
            {isLogin ? (
              <LoginForm key="login" />
            ) : (
              <RegisterForm key="register" onSuccess={() => setIsLogin(true)} />
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}

// --- FORMULÁRIO DE LOGIN ---
function LoginForm() {
  const [pix, setPix] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/clients/pix/${pix}`);
      localStorage.setItem("nexus_user_id", data.id);
      router.push("/dashboard");
    } catch (err) {
      toast.error("Chave PIX não encontrada", { description: "Verifique seus dados ou crie uma conta." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      onSubmit={handleLogin} className="space-y-6"
    >
      <Input 
        label="Sua Chave PIX" 
        placeholder="ex: elias@nexus.com" 
        value={pix}
        onChange={(e: any) => setPix(e.target.value)}
      />
      <button 
        disabled={loading || !pix}
        className="w-full bg-primary hover:bg-emerald-400 text-background font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" /> : <><LogIn size={18} /> Acessar Agora</>}
      </button>
    </motion.form>
  );
}

// --- FORMULÁRIO DE CADASTRO ---
function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({ fullName: "", email: "", pixKey: "" });
  const createUser = useCreateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate(form, {
      onSuccess: () => onSuccess() // Volta para login após criar
    });
  };

  return (
    <motion.form 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      onSubmit={handleSubmit} className="space-y-4"
    >
      <Input 
        label="Nome Completo" 
        placeholder="ex: Elias Santos" 
        value={form.fullName}
        onChange={(e: any) => setForm({ ...form, fullName: e.target.value })}
      />
      <Input 
        label="E-mail" 
        type="email"
        placeholder="ex: contato@elias.dev" 
        value={form.email}
        onChange={(e: any) => setForm({ ...form, email: e.target.value })}
      />
      <div className="space-y-1">
        <Input 
          label="Defina sua Chave PIX" 
          placeholder="ex: elias@pix" 
          value={form.pixKey}
          onChange={(e: any) => setForm({ ...form, pixKey: e.target.value })}
        />
        <p className="text-[10px] text-slate-500 ml-1">* Será usada para login e recebimento</p>
      </div>

      <button 
        disabled={createUser.isPending || !form.fullName || !form.pixKey}
        className="w-full bg-white hover:bg-slate-200 text-black font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {createUser.isPending ? <Loader2 className="animate-spin" /> : <><UserPlus size={18} /> Criar Conta Grátis</>}
      </button>
    </motion.form>
  );
}