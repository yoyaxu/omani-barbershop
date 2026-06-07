import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aflow Barbershop | Tu Estilo, Nuestra Pasión",
  description: "La mejor experiencia de barbería en Santo Domingo. Cortes de cabello, afeitado, tratamientos capilares y más. Reserva tu cita en línea.",
  keywords: ["barbería", "barbershop", "corte de cabello", "afeitado", "Santo Domingo", "Aflow", "reserva cita"],
  authors: [{ name: "Aflow Barbershop" }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💈</text></svg>",
  },
  openGraph: {
    title: "Aflow Barbershop | Tu Estilo, Nuestra Pasión",
    description: "La mejor experiencia de barbería en Santo Domingo",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
