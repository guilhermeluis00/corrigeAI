import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'CorrigeAI | Gestão e correção escolar', description: 'Plataforma para gestão de avaliações e correção de folhas de respostas.' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>
}
