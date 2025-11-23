"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wallet, Send, LogOut, Loader2, ArrowUpRight, ArrowDownLeft, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useUser, useTransfer, useTransactions } from "@/hooks/useNexus";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [toPix, setToPix] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("nexus_user_id");
    if (!id) router.push("/");
    else setUserId(id);
  }, [router]);

  const { data: user, isLoading: loadingUser } = useUser(userId);
  const { data: transactions, isLoading: loadingTrans } = useTransactions(userId);
  const transfer = useTransfer();

  // Processamento dos dados para o Gráfico
 const chartData = useMemo(() => {
    // 1. Cria os últimos 7 dias (Array de datas) para garantir que o eixo X sempre exista
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i); // De 6 dias atrás até hoje
      return format(d, "dd/MM", { locale: ptBR });
    });

    // 2. Inicializa o mapa com valores zerados
    const stats = last7Days.reduce((acc, date) => {
      acc[date] = { name: date, entrada: 0, saida: 0 };
      return acc;
    }, {} as Record<string, any>);

    // 3. Preenche com as transações reais (se houver)
    if (transactions) {
      transactions.forEach((t: any) => {
        const date = format(new Date(t.createdAt), "dd/MM", { locale: ptBR });
        
        // Só soma se a data estiver no nosso intervalo de 7 dias
        if (stats[date]) {
          const val = Number(t.amount);
          if (t.receiverId === userId) {
            stats[date].entrada += val;
          } else {
            stats[date].saida += val;
          }
        }
      });
    }

    // Retorna o array garantido de 7 itens
    return Object.values(stats);
  }, [transactions, userId]);
  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    transfer.mutate({ senderId: userId, receiverPix: toPix, amount });
    setAmount("");
  };

  if (loadingUser || !userId) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background text-white font-sans p-4 md:p-8 pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold font-mono">Olá, {user?.fullName?.split(" ")[0]}</h2>
            <p className="text-sm text-slate-400">Conta Digital Premium</p>
          </div>
          <button onClick={() => { localStorage.removeItem("nexus_user_id"); router.push("/") }} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-red-400">
            <LogOut size={20} />
          </button>
        </header>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Coluna Esquerda (Saldo + Transferência) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card de Saldo */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="relative h-56 rounded-3xl bg-gradient-to-br from-emerald-900/80 to-slate-900 border border-emerald-500/20 p-8 flex flex-col justify-between overflow-hidden group"
            >
              <div className="absolute right-[-50px] top-[-50px] w-64 h-64 bg-emerald-500/10 blur-[80px] group-hover:bg-emerald-500/20 transition-all duration-500" />
              <div className="flex justify-between items-start relative z-10">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 backdrop-blur-md border border-emerald-500/10">
                  <Wallet size={28} />
                </div>
                <span className="font-mono text-xs tracking-[0.2em] text-emerald-400/60">NEXUS CARD</span>
              </div>
              <div className="relative z-10">
                <p className="text-slate-400 font-medium mb-1 text-sm">Saldo Disponível</p>
                <h3 className="text-4xl font-bold tracking-tighter text-white">
                  R$ {Number(user?.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
              </div>
            </motion.div>

            {/* Área Pix */}
            <Card>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary rounded-full" />
                Nova Transferência
              </h3>
              <form onSubmit={handleTransfer} className="space-y-4">
                <Input 
                  label="Para quem?" 
                  placeholder="Chave PIX" 
                  value={toPix}
                  onChange={(e: any) => setToPix(e.target.value)}
                />
                <Input 
                  label="Valor (R$)" 
                  type="number" 
                  placeholder="0,00" 
                  value={amount}
                  onChange={(e: any) => setAmount(e.target.value)}
                  className="text-xl font-bold text-emerald-400" // Cor de destaque
                />
                <button 
                  disabled={transfer.isPending || !amount || !toPix}
                  className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {transfer.isPending ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Enviar Pix</>}
                </button>
              </form>
            </Card>
          </div>

          {/* Coluna Direita (Gráfico + Extrato) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Gráfico de Fluxo */}
            <Card className="h-[300px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp size={20} className="text-emerald-400" />
                  Fluxo de Caixa
                </h3>
                <div className="flex gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1 text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-400"/>Entrada</span>
                  <span className="flex items-center gap-1 text-rose-400"><div className="w-2 h-2 rounded-full bg-rose-400"/>Saída</span>
                </div>
              </div>
              
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barGap={8}>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      dy={10}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    />
                    <Bar dataKey="entrada" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="saida" fill="#fb7185" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Lista de Transações (Funcionando!) */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-400">Últimas Transações</h3>
              <div className="space-y-3">
                {loadingTrans ? (
                  [1,2,3].map(i => <div key={i} className="h-20 w-full bg-slate-800/50 rounded-2xl animate-pulse" />)
                ) : transactions?.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">Nenhuma transação encontrada.</div>
                ) : (
                  transactions?.map((t: any) => {
                    const isReceived = t.receiverId === userId;
                    return (
                      <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-white/5 hover:border-white/10 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-full ${isReceived ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {isReceived ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                          </div>
                          <div>
                            <p className="font-bold text-white">
                              {isReceived ? t.sender.fullName : t.receiver.fullName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {format(new Date(t.createdAt), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <span className={`font-mono font-bold text-lg ${isReceived ? 'text-emerald-400' : 'text-white'}`}>
                          {isReceived ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}