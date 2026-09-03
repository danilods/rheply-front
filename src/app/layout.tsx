import type { Metadata } from 'next';
import { Inter, Inter_Tight } from 'next/font/google';
import './globals.css';

/**
 * Uma família só, dois desenhos.
 *
 * Inter carrega prosa e interface. Inter Tight é a mesma tipografia num
 * traçado mais estreito: serve rótulo em caixa alta, cabeçalho de tabela e
 * leitura de instrumento, onde a largura é o recurso escasso. Não é uma
 * segunda fonte convivendo com a primeira — é a mesma letra, apertada.
 */
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

const interTight = Inter_Tight({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700'],
  variable: '--font-inter-tight',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RHeply | Plataforma de Recrutamento',
  description: 'Plataforma inteligente de recrutamento e selecao para empresas modernas',
  keywords: ['recrutamento', 'selecao', 'RH', 'candidatos', 'vagas', 'teste digitacao'],
  authors: [{ name: 'RHeply Team' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'RHeply | Plataforma de Recrutamento',
    description: 'Plataforma inteligente de recrutamento e selecao para empresas modernas',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${interTight.variable} font-sans antialiased min-h-screen bg-background`}
      >
        {children}
      </body>
    </html>
  );
}
