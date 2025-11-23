"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import axios from "axios";
import { toast } from "sonner";

export default function Login() {
  const [pix, setPix] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Busca simples para "logar"
      const { data } = await axios.get(`http://localhost:3001/api/clients/pix/${pix}`);
      localStorage.setItem("nexus_user_id", data.id); // Persistência simples
      router.push("/dashboard");
    } catch (err) {
      toast.error("Chave PIX não encontrada");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Nexus Web</h1>
          <p className="text-slate-400">Acesso seguro via Chave PIX</p>
        </div>

        <Card>
          <form onSubmit={handleLogin} className="space-y-6">
            <Input 
              label="Chave PIX" 
              placeholder="ex: email@nexus.com" 
              value={pix}
              onChange={(e: any) => setPix(e.target.value)}
            />
            <button 
              disabled={loading}
              className="w-full bg-primary hover:bg-emerald-400 text-background font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Acessar Conta"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}