import type { Metadata } from "next";
import "./globals.css";
import { JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Rally",
  description:
    "Eleve seu jogo com o Rally - O aplicativo definitivo para análise de partidas de vôlei. Acesse estatísticas detalhadas, gráficos interativos e insights personalizados para aprimorar seu desempenho e estratégia. Transforme seus dados em vitórias com o Rally.",
};

const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='pt-BR' suppressHydrationWarning>
      <body className={cn("antialiased", mono.className)}>
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
