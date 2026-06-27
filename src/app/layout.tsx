import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PlanProvider } from "@/context/PlanContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SkillPath AI — Rutas personalizadas para aprender idiomas",
  description:
    "Planes de estudio semana a semana generados por IA para español, inglés, francés, italiano, griego antiguo y latín. Se adaptan a tu feedback.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} h-full`}>
      <body className="min-h-full antialiased">
        <PlanProvider>{children}</PlanProvider>
      </body>
    </html>
  );
}
