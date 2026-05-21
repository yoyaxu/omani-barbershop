import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Omani Barbershop | Tu Barbero de Confianza",
  description:
    "Omani Barbershop - Barbería profesional con los mejores cortes, afeitadas y servicios de grooming. Reserva tu cita ahora.",
  keywords: [
    "barbería",
    "barbershop",
    "corte de pelo",
    "afeitada",
    "barba",
    "grooming",
    "Omani",
    "barbero",
  ],
  authors: [{ name: "Omani Barbershop" }],
  icons: {
    icon: "/logo-omani.png",
  },
  openGraph: {
    title: "Omani Barbershop | Tu Barbero de Confianza",
    description:
      "Barbería profesional con los mejores cortes, afeitadas y servicios de grooming.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
