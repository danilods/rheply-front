import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
        className={`${inter.variable} font-sans antialiased min-h-screen bg-background`}
      >
        {children}
      </body>
    </html>
  );
}
