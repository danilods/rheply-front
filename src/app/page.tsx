import Link from 'next/link';
import { Metadata } from 'next';
import {
  Upload,
  Sparkles,
  MousePointer,
  FileText,
  Search,
  MessageSquare,
  Users,
  Building2,
  Target,
  ArrowRight,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { JobSearchBar } from '@/components/public/job-search-bar';
import { JobCardPublic } from '@/components/public/job-card-public';
import { generateWebPageMetadata } from '@/lib/seo';

export const metadata: Metadata = generateWebPageMetadata({
  title: 'Chega de buraco negro nas candidaturas',
  description:
    'Crie seu Perfil Universal uma vez, candidate-se em qualquer lugar com 1 clique. Acompanhe suas candidaturas e receba feedback transparente.',
  url: 'https://rheply.com',
  keywords: [
    'vagas de emprego',
    'candidatura',
    'curriculo',
    'perfil universal',
    'recrutamento',
    'oportunidades',
  ],
});

// Mock featured jobs data
const featuredJobs = [
  {
    id: '1',
    slug: 'desenvolvedor-frontend-senior-techcorp',
    title: 'Desenvolvedor Frontend Senior',
    company: { name: 'TechCorp' },
    location: { city: 'Sao Paulo', state: 'SP', remote: true },
    type: 'CLT',
    level: 'Senior',
    salary: { min: 12000, max: 18000 },
    skills: ['React', 'TypeScript', 'Next.js', 'TailwindCSS', 'GraphQL'],
    postedAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: '2',
    slug: 'product-manager-innovatech',
    title: 'Product Manager',
    company: { name: 'InnovaTech' },
    location: { city: 'Rio de Janeiro', state: 'RJ', hybrid: true },
    type: 'CLT',
    level: 'Pleno',
    salary: { min: 15000, max: 22000 },
    skills: ['Product Strategy', 'Agile', 'Data Analysis', 'UX Research'],
    postedAt: new Date(Date.now() - 86400000 * 1),
  },
  {
    id: '3',
    slug: 'analista-dados-datadriven',
    title: 'Analista de Dados',
    company: { name: 'DataDriven' },
    location: { city: 'Belo Horizonte', state: 'MG', remote: false },
    type: 'CLT',
    level: 'Pleno',
    salary: { min: 8000, max: 12000 },
    skills: ['Python', 'SQL', 'Power BI', 'Machine Learning'],
    postedAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: '4',
    slug: 'ux-designer-creativelabs',
    title: 'UX Designer',
    company: { name: 'Creative Labs' },
    location: { city: 'Curitiba', state: 'PR', remote: true },
    type: 'PJ',
    level: 'Senior',
    salary: { min: 10000, max: 16000 },
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    postedAt: new Date(Date.now() - 86400000 * 4),
  },
  {
    id: '5',
    slug: 'devops-engineer-cloudtech',
    title: 'DevOps Engineer',
    company: { name: 'CloudTech' },
    location: { city: 'Porto Alegre', state: 'RS', hybrid: true },
    type: 'CLT',
    level: 'Senior',
    salary: { min: 14000, max: 20000 },
    skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD', 'Docker'],
    postedAt: new Date(Date.now() - 86400000 * 5),
  },
  {
    id: '6',
    slug: 'marketing-digital-growthco',
    title: 'Especialista em Marketing Digital',
    company: { name: 'GrowthCo' },
    location: { city: 'Sao Paulo', state: 'SP', remote: true },
    type: 'CLT',
    level: 'Pleno',
    salary: { min: 7000, max: 11000 },
    skills: ['SEO', 'Google Ads', 'Analytics', 'Social Media'],
    postedAt: new Date(Date.now() - 86400000 * 2),
  },
];

const testimonials = [
  {
    name: 'Marina Silva',
    role: 'Desenvolvedora Full Stack',
    image: '/testimonials/marina.jpg',
    text: 'Finalmente um lugar onde posso acompanhar minhas candidaturas. Consegui meu emprego atual em menos de 2 semanas!',
    rating: 5,
  },
  {
    name: 'Carlos Eduardo',
    role: 'Product Manager',
    image: '/testimonials/carlos.jpg',
    text: 'O Perfil Universal me poupou horas de retrabalho. Agora me candidato para vagas em segundos.',
    rating: 5,
  },
  {
    name: 'Ana Beatriz',
    role: 'Designer UX/UI',
    image: '/testimonials/ana.jpg',
    text: 'A transparencia no processo seletivo faz toda diferenca. Sei exatamente onde estou em cada candidatura.',
    rating: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              Chega de{' '}
              <span className="text-primary">buraco negro</span> nas
              candidaturas
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Crie seu Perfil Universal uma vez, candidate-se em qualquer lugar
              com <strong>1 clique</strong>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 py-6 h-auto">
                  Criar meu perfil gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/vagas">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 h-auto"
                >
                  Ver vagas disponiveis
                </Button>
              </Link>
            </div>

            {/* Job Search Bar */}
            <div className="max-w-3xl mx-auto">
              <JobSearchBar variant="hero" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                50.000+
              </div>
              <div className="text-muted-foreground">Candidatos ativos</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                1.200+
              </div>
              <div className="text-muted-foreground">Empresas parceiras</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                98%
              </div>
              <div className="text-muted-foreground">Precisao no parsing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Por que os candidatos amam o Rheply?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Desenvolvido para acabar com a frustracao dos processos seletivos
              tradicionais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Nunca mais redigite seu curriculo
                </h3>
                <p className="text-muted-foreground">
                  Envie seu CV uma vez e nossa IA extrai todos os dados
                  automaticamente. Seu perfil fica pronto em segundos.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Acompanhe todas suas candidaturas
                </h3>
                <p className="text-muted-foreground">
                  Dashboard centralizado mostrando o status de cada candidatura.
                  Chega de planilhas e emails perdidos.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Receba feedback transparente
                </h3>
                <p className="text-muted-foreground">
                  Saiba exatamente onde esta no processo e receba comunicacao
                  clara sobre cada etapa da selecao.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Como funciona
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Em 3 passos simples voce esta pronto para se candidatar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                  1
                </div>
                <Upload className="absolute -right-2 -bottom-2 h-8 w-8 text-primary bg-background rounded-full p-1" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload seu CV</h3>
              <p className="text-muted-foreground">
                Envie seu curriculo em PDF, Word ou simplesmente cole o texto.
                Aceita qualquer formato.
              </p>
            </div>

            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                  2
                </div>
                <Sparkles className="absolute -right-2 -bottom-2 h-8 w-8 text-primary bg-background rounded-full p-1" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                IA extrai os dados automaticamente
              </h3>
              <p className="text-muted-foreground">
                Nossa inteligencia artificial analisa e organiza todas suas
                informacoes em segundos com 98% de precisao.
              </p>
            </div>

            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                  3
                </div>
                <MousePointer className="absolute -right-2 -bottom-2 h-8 w-8 text-primary bg-background rounded-full p-1" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Candidate-se com 1 clique
              </h3>
              <p className="text-muted-foreground">
                Seu Perfil Universal esta pronto. Encontre vagas e candidate-se
                instantaneamente.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Comecar agora - e gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Vagas em destaque
              </h2>
              <p className="text-xl text-muted-foreground">
                Oportunidades selecionadas para voce
              </p>
            </div>
            <Link href="/vagas">
              <Button variant="outline" size="lg">
                Ver todas as vagas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <JobCardPublic key={job.id} {...job} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              O que dizem nossos candidatos
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Milhares de profissionais ja transformaram sua busca por emprego
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-background">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <span className="text-primary font-semibold">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">
                        {testimonial.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para encontrar seu proximo trabalho?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Junte-se a mais de 50.000 profissionais que ja simplificaram sua
            busca por emprego
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6 h-auto"
              >
                Criar meu perfil gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/vagas">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 h-auto bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Explorar vagas
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm opacity-80">
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              100% gratuito
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Sem cartao de credito
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Dados protegidos pela LGPD
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
