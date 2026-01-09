import { Metadata } from 'next';
import Link from 'next/link';
import {
  Target,
  Users,
  Building2,
  Heart,
  Lightbulb,
  Shield,
  CheckCircle2,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { generateWebPageMetadata } from '@/lib/seo';

export const metadata: Metadata = generateWebPageMetadata({
  title: 'Sobre Nos',
  description:
    'Conheca o Rheply: nossa missao e eliminar o buraco negro do recrutamento, conectando talentos a oportunidades com transparencia.',
  url: 'https://rheply.com/sobre',
  keywords: [
    'sobre rheply',
    'missao',
    'recrutamento transparente',
    'plataforma de empregos',
  ],
});

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-8">
              <Target className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Eliminando o{' '}
              <span className="text-primary">buraco negro</span> do recrutamento
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Acreditamos que todo profissional merece transparencia, respeito e
              feedback durante sua busca por emprego. E que toda empresa merece
              encontrar os melhores talentos de forma eficiente.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Nossa Historia
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="text-lg leading-relaxed mb-6">
                O Rheply nasceu da frustracao. Frustracao de profissionais
                qualificados que enviavam dezenas de curriculos e nunca recebiam
                sequer uma resposta. Frustracao de recrutadores sobrecarregados
                com pilhas de CVs para analisar manualmente.
              </p>
              <p className="text-lg leading-relaxed mb-6">
                Fundado em 2023, nossa missao desde o primeiro dia foi criar
                uma ponte de comunicacao transparente entre candidatos e
                empresas. Utilizamos inteligencia artificial nao para substituir
                o humano, mas para eliminar o trabalho repetitivo e permitir que
                as pessoas se concentrem no que realmente importa: conexoes
                genuinas.
              </p>
              <p className="text-lg leading-relaxed">
                Hoje, mais de 50.000 profissionais confiam no Rheply para
                gerenciar suas candidaturas, e mais de 1.200 empresas utilizam
                nossa plataforma para encontrar os talentos ideais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
            Nossos Valores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-background">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Transparencia</h3>
                <p className="text-muted-foreground">
                  Candidatos merecem saber onde estao no processo. Empresas
                  merecem candidatos honestos. Nada de jogos.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Inovacao</h3>
                <p className="text-muted-foreground">
                  Usamos tecnologia de ponta para simplificar processos, nao
                  para complicar. IA a servico das pessoas.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Privacidade</h3>
                <p className="text-muted-foreground">
                  Seus dados sao seus. Seguimos rigorosamente a LGPD e voce tem
                  controle total sobre suas informacoes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits for Candidates */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <div className="inline-flex items-center space-x-2 text-primary mb-4">
                <Users className="h-5 w-5" />
                <span className="font-medium">Para Candidatos</span>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Sua busca por emprego simplificada
              </h2>
              <div className="space-y-4">
                {[
                  'Perfil Universal: crie uma vez, use em todas candidaturas',
                  'Parsing automatico: envie seu CV e deixe a IA organizar',
                  'Dashboard centralizado: acompanhe todas suas candidaturas',
                  'Feedback transparente: saiba o status de cada processo',
                  'Alertas inteligentes: receba vagas que combinam com voce',
                  'Candidatura com 1 clique: nunca mais redigite formularios',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              <Link href="/register" className="mt-8 inline-block">
                <Button size="lg">
                  Criar conta gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="bg-muted/50 rounded-2xl p-8 lg:p-12">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    50K+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Candidatos ativos
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    98%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Precisao no parsing
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    85%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Recebem feedback
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    3x
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Mais rapido para aplicar
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits for Companies */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="order-2 lg:order-1 bg-background rounded-2xl p-8 lg:p-12">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    1.2K+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Empresas parceiras
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    60%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Reducao no time-to-hire
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    45%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Menos turnover
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    4.8/5
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Satisfacao dos RHs
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center space-x-2 text-primary mb-4">
                <Building2 className="h-5 w-5" />
                <span className="font-medium">Para Empresas</span>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Recrutamento eficiente e humanizado
              </h2>
              <div className="space-y-4">
                {[
                  'ATS moderno e intuitivo: gerencie vagas com facilidade',
                  'Triagem inteligente: IA pre-seleciona candidatos qualificados',
                  'Perfis padronizados: compare candidatos de forma justa',
                  'Comunicacao automatizada: mantenha candidatos informados',
                  'Analytics avancado: tome decisoes baseadas em dados',
                  'Employer branding: construa sua marca empregadora',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              <Link href="/empresas/demo" className="mt-8 inline-block">
                <Button size="lg">
                  Solicitar demonstracao
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              Entre em Contato
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              Estamos aqui para ajudar. Fale conosco para tirar duvidas ou saber
              mais sobre nossa plataforma.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Email</h3>
                  <a
                    href="mailto:contato@rheply.com"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    contato@rheply.com
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Telefone</h3>
                  <a
                    href="tel:+551140028922"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    (11) 4002-8922
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Endereco</h3>
                  <p className="text-muted-foreground">
                    Av. Paulista, 1234
                    <br />
                    Sao Paulo, SP
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para transformar sua experiencia?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de profissionais e empresas que ja descobriram
            um novo jeito de fazer recrutamento.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Sou candidato
              </Button>
            </Link>
            <Link href="/empresas">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Sou empresa
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
