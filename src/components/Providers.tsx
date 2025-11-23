"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner"; // Já aproveitamos para colocar o Toaster aqui

export default function Providers({ children }: { children: React.ReactNode }) {
  // O useState garante que o QueryClient seja criado apenas uma vez por sessão
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Configuração global dos Toasts (Notificações) */}
      <Toaster 
        theme="dark" 
        position="top-center" 
        toastOptions={{
          style: {
            background: "#0f172a",
            border: "1px solid #1e293b",
            color: "white",
          }
        }}
      />
    </QueryClientProvider>
  );
}