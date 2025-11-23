"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Send, RefreshCw, LogOut, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useUser, useTransfer } from "@/hooks/useNexus";

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  
  // Estado do Formulário de Transferência
  const [toPix, setToPix] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("nexus_user_id");
    if (!id) router.push("/");
    else setUserId(id);
  }, [router]);

  const { data: user, isLoading } = useUser(userId);
  const transfer = useTransfer();

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    transfer.mutate({ senderId: userId, receiverPix: toPix, amount });
    setAmount(""); // Limpa valor
    // Não limpa PIX para facilitar envios seguidos (UX)
  };

  if (isLoading || !userId) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background text-white font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Olá, {user?.fullName?.split(" ")[0]}</h2>
            <p className="text-sm text-slate-400">Conta Digital Premium</p>
          </div>
          <button onClick={() => { localStorage.removeItem("nexus_user_id"); router.push("/") }} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-red-400">
            <LogOut size={20} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cartão de Saldo (Destaque) */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="lg:col-span-2 relative h-64 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-8 flex flex-col justify-between overflow-hidden group"
          >
            <div className="absolute right-[-50px] top-[-50px] w-64 h-64 bg-primary/20 blur-[100px] group-hover:bg-primary/30 transition-all duration-500" />
            
            <div className="flex justify-between items-start relative z-10">
              <div className="p-3 bg-primary/20 rounded-2xl text-primary backdrop-blur-md">
                <Wallet size={32} />
              </div>
              <span className="font-mono text-xs tracking-[0.2em] text-primary/60">NEXUS CARD</span>
            </div>

            <div className="relative z-10">
              <p className="text-slate-400 font-medium mb-1">Saldo Disponível</p>
              <h3 className="text-5xl font-bold tracking-tighter text-white">
                R$ {Number(user?.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </motion.div>

          {/* Área de Transferência Rápida */}
          <Card className="flex flex-col justify-center">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full" />
              Transferência Pix
            </h3>

            <form onSubmit={handleTransfer} className="space-y-4">
              <Input 
                label="Para quem?" 
                placeholder="Chave PIX (CPF/Email)" 
                value={toPix}
                onChange={(e: any) => setToPix(e.target.value)}
              />
              
              <div className="relative">
                <Input 
                  label="Valor (R$)" 
                  type="number" 
                  placeholder="0,00" 
                  value={amount}
                  onChange={(e: any) => setAmount(e.target.value)}
                  className="text-xl font-bold text-primary"
                />
              </div>

              <button 
                disabled={transfer.isPending || !amount || !toPix}
                className="w-full bg-white text-black font-bold py-3.5 rounded-xl mt-2 hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {transfer.isPending ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Enviar Agora</>}
              </button>
            </form>
          </Card>

        </div>

        {/* Histórico (Skeleton ou Lista) */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-400">Últimas Atividades</h3>
          {/* Aqui você pode implementar uma lista de transações depois */}
          <div className="space-y-3">
             {[1,2,3].map(i => (
               <div key={i} className="h-16 w-full bg-surface-highlight/30 rounded-xl animate-pulse" />
             ))}
          </div>
        </div>

      </div>
    </div>
  );
}