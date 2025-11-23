import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

export function useUser(userId: string | null) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await api.get(`/clients/${userId}`); // Endpoint que criamos no passo extra
      return data;
    },
    enabled: !!userId,
    refetchInterval: 5000, // Polling suave para atualizar saldo
  });
}

export function useTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ senderId, receiverPix, amount }: any) => {
      // 1. Buscar ID do recebedor pelo PIX
      const { data: receiver } = await api.get(`/clients/pix/${receiverPix}`);
      
      // 2. Gerar chave de idempotência
      const idempotencyKey = crypto.randomUUID();

      // 3. Enviar transferência
      const { data } = await api.post("/transactions", {
        senderId,
        receiverId: receiver.id,
        amount: Number(amount)
      }, {
        headers: { "Idempotency-Key": idempotencyKey }
      });
      
      return { data, receiverName: receiver.fullName };
    },
    onSuccess: (result) => {
      toast.success("Transferência Realizada", {
        description: `Enviado R$ ${result.data.amount} para ${result.receiverName}`
      });
      queryClient.invalidateQueries({ queryKey: ["user"] }); // Atualiza saldo na hora
    },
    onError: (error: any) => {
      toast.error("Falha na operação", {
        description: error.response?.data?.message || "Erro desconhecido"
      });
    }
  });
}


// Nova função para chamar o endpoint de criação
export const createClient = async (data: { fullName: string; email: string; pixKey: string }) => {
  const response = await api.post("/clients", data);
  return response.data;
};

// Novo Hook de Mutação
export function useCreateUser() {
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      toast.success("Conta Criada!", {
        description: "Bem-vindo ao Nexus. Você recebeu R$ 100.000 de bônus!"
      });
    },
    onError: (error: any) => {
      toast.error("Erro ao criar conta", {
        description: error.response?.data?.message || "Tente outro e-mail ou chave PIX."
      });
    }
  });
}

export function useTransactions(userId: string | null) {
  return useQuery({
    queryKey: ["transactions", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await api.get(`/transactions/${userId}`);
      return data;
    },
    enabled: !!userId,
    refetchInterval: 5000,
  });
}