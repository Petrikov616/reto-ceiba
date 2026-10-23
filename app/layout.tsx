import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/app/components/Sidebar";
import ToastContainer from "@/app/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BUK ATS — Middleware LinkedIn | Ceiba",
  description: "Puente de integración entre LinkedIn y BUK ATS para gestión de postulantes — Proyecto Ceiba",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-[#F8FAFC]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
          {children}
        </div>
        <ToastContainer />
      </body>
    </html>
  );
}
