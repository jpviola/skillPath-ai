import type { Metadata } from "next";
import { Inter, Sniglet } from "next/font/google";
import "./globals.css";
import { PlanProvider } from "@/context/PlanContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sniglet = Sniglet({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "LIANGO — De Pekín a Madrid en un solo zigzag",
  description:
    "PIEZAS, ZIGZAGS Y IDIOMAS. Planes de estudio semanales generados por IA para español, inglés, francés, italiano, alemán y más. Se adaptan a tu ritmo.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} ${sniglet.variable} h-full`}>
      <body className="min-h-full antialiased">
        <PlanProvider>{children}</PlanProvider>
      </body>
    </html>
  );
}
