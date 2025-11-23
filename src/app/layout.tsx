import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers"; // <--- Importe aqui

// Fontes otimizadas
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "Nexus Web | Internet Banking",
  description: "Acesso seguro e rápido à sua conta Nexus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="bg-background text-white antialiased">
        {/* Envolvendo a aplicação com o Provider do React Query */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}