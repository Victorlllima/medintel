import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/providers/QueryProvider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MedIntel - Sistema de Gestão de Consultas Médicas',
  description: 'Sistema inteligente para gestão e análise de consultas médicas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <QueryProvider>
          <main className="min-h-screen bg-background">
            {children}
          </main>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}
