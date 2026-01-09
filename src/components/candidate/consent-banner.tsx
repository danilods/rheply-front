"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CookieConsent } from "@/types/lgpd";
import { getStoredConsent, saveConsent, hasConsented } from "@/lib/lgpd";
import { Cookie, Shield, X } from "lucide-react";

interface ConsentBannerProps {
  onConsentChange?: (consent: CookieConsent) => void;
}

export function ConsentBanner({ onConsentChange }: ConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>({
    essential: true, // Always required
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Check if user has already consented
    if (!hasConsented()) {
      setIsVisible(true);
    } else {
      const storedConsent = getStoredConsent();
      if (storedConsent) {
        setConsent(storedConsent);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const fullConsent: CookieConsent = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    saveConsent(fullConsent);
    onConsentChange?.(fullConsent);
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    const minimalConsent: CookieConsent = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    saveConsent(minimalConsent);
    onConsentChange?.(minimalConsent);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    saveConsent(consent);
    onConsentChange?.(consent);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
      <div className="container mx-auto p-4 md:p-6">
        {!showCustomize ? (
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Cookie className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold">Sua Privacidade</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Usamos cookies e tecnologias similares para melhorar sua experiencia,
                personalizar conteudo e analisar nosso trafego. Ao clicar em &quot;Aceitar
                Todos&quot;, voce concorda com o uso de cookies conforme nossa{" "}
                <a
                  href="/politica-privacidade"
                  className="text-primary underline hover:no-underline"
                >
                  Política de Privacidade
                </a>
                . Você pode personalizar suas preferências ou rejeitar cookies não
                essenciais.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomize(true)}
                className="text-xs"
              >
                Personalizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectNonEssential}
                className="text-xs"
              >
                Rejeitar Não Essenciais
              </Button>
              <Button size="sm" onClick={handleAcceptAll} className="text-xs">
                Aceitar Todos
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold">
                  Personalize suas Preferências de Cookies
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCustomize(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Essential Cookies */}
              <div className="flex items-start justify-between p-3 rounded-lg border bg-muted/50">
                <div className="space-y-1 pr-4">
                  <Label className="text-sm font-medium">Cookies Essenciais</Label>
                  <p className="text-xs text-muted-foreground">
                    Necessários para o funcionamento básico do site. Não podem ser
                    desativados.
                  </p>
                </div>
                <Switch checked={true} disabled />
              </div>

              {/* Functional Cookies */}
              <div className="flex items-start justify-between p-3 rounded-lg border">
                <div className="space-y-1 pr-4">
                  <Label className="text-sm font-medium">Cookies Funcionais</Label>
                  <p className="text-xs text-muted-foreground">
                    Permitem funcionalidades adicionais como preferências de idioma e
                    configurações personalizadas.
                  </p>
                </div>
                <Switch
                  checked={consent.functional}
                  onCheckedChange={(checked) =>
                    setConsent((prev) => ({ ...prev, functional: checked }))
                  }
                />
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between p-3 rounded-lg border">
                <div className="space-y-1 pr-4">
                  <Label className="text-sm font-medium">Cookies de Análise</Label>
                  <p className="text-xs text-muted-foreground">
                    Nos ajudam a entender como você usa o site para melhorar a experiência
                    de todos os usuários.
                  </p>
                </div>
                <Switch
                  checked={consent.analytics}
                  onCheckedChange={(checked) =>
                    setConsent((prev) => ({ ...prev, analytics: checked }))
                  }
                />
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between p-3 rounded-lg border">
                <div className="space-y-1 pr-4">
                  <Label className="text-sm font-medium">Cookies de Marketing</Label>
                  <p className="text-xs text-muted-foreground">
                    Usados para mostrar anúncios relevantes e medir a eficácia de
                    campanhas publicitárias.
                  </p>
                </div>
                <Switch
                  checked={consent.marketing}
                  onCheckedChange={(checked) =>
                    setConsent((prev) => ({ ...prev, marketing: checked }))
                  }
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={handleRejectNonEssential}>
                Rejeitar Todos
              </Button>
              <Button size="sm" onClick={handleSavePreferences}>
                Salvar Preferências
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
