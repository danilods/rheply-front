import Link from 'next/link';
import { Briefcase, Linkedin, Twitter, Instagram } from 'lucide-react';

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link
              href="/"
              className="flex items-center space-x-2 text-xl font-bold text-primary mb-4"
            >
              <Briefcase className="h-6 w-6" />
              <span>Rheply</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Eliminando o buraco negro do recrutamento. Conectando talentos a
              oportunidades com transparencia e eficiencia.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Para Candidatos */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              Para Candidatos
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/vagas"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Buscar Vagas
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Criar Perfil Universal
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Acessar Conta
                </Link>
              </li>
              <li>
                <Link
                  href="/sobre"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Como Funciona
                </Link>
              </li>
            </ul>
          </div>

          {/* Para Empresas */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              Para Empresas
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/empresas"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Publicar Vagas
                </Link>
              </li>
              <li>
                <Link
                  href="/empresas/planos"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Planos e Precos
                </Link>
              </li>
              <li>
                <Link
                  href="/empresas/demo"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Solicitar Demo
                </Link>
              </li>
              <li>
                <Link
                  href="/empresas/cases"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Cases de Sucesso
                </Link>
              </li>
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              Institucional
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/sobre"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Sobre Nos
                </Link>
              </li>
              <li>
                <Link
                  href="/termos"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidade"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Politica de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidade#lgpd"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  LGPD
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>&copy; {currentYear} Rheply. Todos os direitos reservados.</p>
            <p className="mt-2 md:mt-0">
              Feito com dedicacao para transformar o recrutamento no Brasil
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
