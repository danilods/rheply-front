'use client';

import { useState, useEffect } from 'react';
import { PublicHeader } from '@/components/public/header';
import { PublicFooter } from '@/components/public/footer';
import { Button } from '@/components/ui/button';
import { X, Cookie } from 'lucide-react';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check if user has already accepted cookies
    const hasAcceptedCookies = localStorage.getItem('cookiesAccepted');
    if (!hasAcceptedCookies) {
      setShowCookieBanner(true);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setShowCookieBanner(false);
  };

  const handleDeclineCookies = () => {
    localStorage.setItem('cookiesAccepted', 'false');
    setShowCookieBanner(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1">{children}</main>

      <PublicFooter />

      {/* LGPD Cookie Consent Banner */}
      {isClient && showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <Cookie className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">
                    Utilizamos cookies
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Usamos cookies e tecnologias semelhantes para melhorar sua
                    experiencia, personalizar conteudo e analisar nosso trafego.
                    Ao continuar navegando, voce concorda com nossa{' '}
                    <a
                      href="/privacidade"
                      className="text-primary hover:underline"
                    >
                      Politica de Privacidade
                    </a>{' '}
                    e uso de cookies conforme a LGPD.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeclineCookies}
                >
                  Recusar
                </Button>
                <Button size="sm" onClick={handleAcceptCookies}>
                  Aceitar todos
                </Button>
                <button
                  onClick={handleDeclineCookies}
                  className="text-muted-foreground hover:text-foreground p-1"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
