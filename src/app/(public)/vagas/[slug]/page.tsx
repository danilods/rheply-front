'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Clock,
  Banknote,
  Share2,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Users,
  Briefcase,
  CheckCircle2,
  Circle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { JobCardPublic } from '@/components/public/job-card-public';
import { ApplyModal } from '@/components/public/apply-modal';
import { formatSalaryRange, generateJobPostingSchema } from '@/lib/seo';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mock job data
const JOB_DATA = {
  id: '1',
  slug: 'desenvolvedor-frontend-senior-techcorp',
  title: 'Desenvolvedor Frontend Senior',
  company: {
    name: 'TechCorp',
    logo: null,
    about:
      'A TechCorp e uma empresa lider em solucoes tecnologicas, com mais de 10 anos de experiencia no mercado brasileiro. Trabalhamos com grandes marcas nacionais e internacionais, entregando produtos digitais de alta qualidade.',
    size: '201-500 funcionarios',
    industry: 'Tecnologia da Informacao',
    culture: [
      'Ambiente colaborativo',
      'Home office flexivel',
      'Investimento em aprendizado',
      'Diversidade e inclusao',
    ],
    website: 'https://techcorp.com.br',
  },
  location: {
    city: 'Sao Paulo',
    state: 'SP',
    country: 'Brasil',
    remote: true,
    hybrid: false,
  },
  type: 'CLT',
  level: 'Senior',
  salary: {
    min: 12000,
    max: 18000,
    currency: 'BRL',
  },
  description: `
    <h3>Sobre a Vaga</h3>
    <p>Estamos em busca de um Desenvolvedor Frontend Senior para liderar o desenvolvimento de nossas aplicacoes web modernas. Voce sera responsavel por criar interfaces incriveis, manter a qualidade do codigo e mentorar desenvolvedores mais juniores.</p>

    <h3>Responsabilidades</h3>
    <ul>
      <li>Desenvolver e manter aplicacoes web utilizando React e Next.js</li>
      <li>Colaborar com equipes de design e backend para entregar features completas</li>
      <li>Participar de code reviews e contribuir para as melhores praticas</li>
      <li>Otimizar aplicacoes para performance e SEO</li>
      <li>Mentorar desenvolvedores juniores e plenos</li>
      <li>Participar de decisoes arquiteturais do frontend</li>
    </ul>

    <h3>O que oferecemos</h3>
    <p>Um ambiente de trabalho descontraido e inovador, com oportunidades reais de crescimento e impacto no produto.</p>
  `,
  requirements: {
    mustHave: [
      '5+ anos de experiencia com desenvolvimento frontend',
      'Dominio de React e TypeScript',
      'Experiencia com Next.js e SSR/SSG',
      'Conhecimento solido de HTML5, CSS3 e JavaScript ES6+',
      'Experiencia com testes unitarios e de integracao',
      'Ingles tecnico para leitura e escrita',
    ],
    niceToHave: [
      'Experiencia com GraphQL',
      'Conhecimento de Design Systems',
      'Experiencia com micro-frontends',
      'Contribuicoes open source',
      'Experiencia com monorepos',
    ],
  },
  benefits: [
    'Vale Refeicao/Alimentacao (R$ 1.200/mes)',
    'Plano de Saude e Odontologico',
    'Seguro de Vida',
    'Gympass',
    'Auxilio Home Office (R$ 200/mes)',
    'Budget para cursos e certificacoes',
    'Day off no aniversario',
    'PLR anual',
    'Stock Options',
    'Horario flexivel',
  ],
  skills: [
    'React',
    'TypeScript',
    'Next.js',
    'TailwindCSS',
    'GraphQL',
    'Jest',
    'Cypress',
    'Git',
  ],
  postedAt: new Date(Date.now() - 86400000 * 2),
  deadline: new Date(Date.now() + 86400000 * 30),
  applicants: 47,
};

const SIMILAR_JOBS = [
  {
    id: '2',
    slug: 'frontend-engineer-startup',
    title: 'Frontend Engineer',
    company: { name: 'StartupXYZ' },
    location: { city: 'Sao Paulo', state: 'SP', remote: true },
    type: 'CLT',
    level: 'Senior',
    salary: { min: 11000, max: 16000 },
    skills: ['React', 'Vue.js', 'TypeScript'],
    postedAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: '3',
    slug: 'react-developer-fintech',
    title: 'React Developer',
    company: { name: 'FinTech Pro' },
    location: { city: 'Remoto', state: '', remote: true },
    type: 'PJ',
    level: 'Senior',
    salary: { min: 15000, max: 20000 },
    skills: ['React', 'Redux', 'Node.js'],
    postedAt: new Date(Date.now() - 86400000 * 1),
  },
  {
    id: '4',
    slug: 'full-stack-developer-ecommerce',
    title: 'Full Stack Developer',
    company: { name: 'E-Commerce Brasil' },
    location: { city: 'Rio de Janeiro', state: 'RJ', hybrid: true },
    type: 'CLT',
    level: 'Pleno',
    salary: { min: 9000, max: 14000 },
    skills: ['React', 'Node.js', 'PostgreSQL'],
    postedAt: new Date(Date.now() - 86400000 * 5),
  },
];

export default function JobDetailPage({
  params: _params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const job = JOB_DATA; // In production, fetch by _params.slug

  const timeAgo = formatDistanceToNow(job.postedAt, {
    addSuffix: true,
    locale: ptBR,
  });

  const deadlineFormatted = format(job.deadline, "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  const getLocationString = () => {
    if (job.location.remote) return 'Remoto';
    if (job.location.hybrid)
      return `${job.location.city}, ${job.location.state} (Hibrido)`;
    return `${job.location.city}, ${job.location.state}`;
  };

  const handleApply = () => {
    // Check if user is logged in (mock check)
    const isLoggedIn = false;
    if (isLoggedIn) {
      router.push(`/candidatar/${job.id}`);
    } else {
      setShowApplyModal(true);
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Vaga: ${job.title} na ${job.company.name}`;

    switch (platform) {
      case 'whatsapp':
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
          '_blank'
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'email':
        window.open(
          `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`Confira esta vaga: ${url}`)}`,
          '_blank'
        );
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copiado!');
        break;
    }
    setShowShareMenu(false);
  };

  // Generate structured data for SEO
  const jobSchema = generateJobPostingSchema({
    title: job.title,
    description: job.description.replace(/<[^>]*>/g, ''),
    company: {
      name: job.company.name,
      sameAs: job.company.website,
    },
    location: job.location,
    salary: {
      min: job.salary.min,
      max: job.salary.max,
      currency: job.salary.currency,
      period: 'MONTH',
    },
    employmentType: 'FULL_TIME',
    datePosted: job.postedAt.toISOString(),
    validThrough: job.deadline.toISOString(),
    skills: job.skills,
    url: `https://rheply.com/vagas/${job.slug}`,
  });

  return (
    <>
      {/* JSON-LD for Google Jobs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobSchema) }}
      />

      <div className="min-h-screen bg-muted/20">
        {/* Header */}
        <div className="bg-background border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/vagas"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para busca
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center shrink-0">
                        {job.company.logo ? (
                          <img
                            src={job.company.logo}
                            alt={job.company.name}
                            className="w-14 h-14 object-contain"
                          />
                        ) : (
                          <Building2 className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">
                          {job.title}
                        </h1>
                        <p className="text-lg text-muted-foreground">
                          {job.company.name}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowShareMenu(!showShareMenu)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        {showShareMenu && (
                          <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-50">
                            <div className="py-1">
                              <button
                                onClick={() => handleShare('whatsapp')}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
                              >
                                WhatsApp
                              </button>
                              <button
                                onClick={() => handleShare('linkedin')}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
                              >
                                LinkedIn
                              </button>
                              <button
                                onClick={() => handleShare('twitter')}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
                              >
                                Twitter
                              </button>
                              <button
                                onClick={() => handleShare('email')}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
                              >
                                Email
                              </button>
                              <button
                                onClick={() => handleShare('copy')}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
                              >
                                Copiar link
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsSaved(!isSaved)}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Key Info */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="text-sm">
                      <MapPin className="h-3 w-3 mr-1" />
                      {getLocationString()}
                    </Badge>
                    <Badge variant="secondary" className="text-sm">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {job.type}
                    </Badge>
                    <Badge variant="secondary" className="text-sm">
                      {job.level}
                    </Badge>
                    {job.location.remote && (
                      <Badge className="bg-green-100 text-green-800">
                        Remoto
                      </Badge>
                    )}
                  </div>

                  {/* Salary */}
                  <div className="flex items-center text-lg font-semibold text-foreground mb-4">
                    <Banknote className="h-5 w-5 mr-2 text-green-600" />
                    {formatSalaryRange(job.salary.min, job.salary.max)}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      /mes
                    </span>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Publicada {timeAgo}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {job.applicants} candidatos
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Encerra em {deadlineFormatted}
                    </div>
                  </div>

                  {/* Apply Button - Mobile */}
                  <Button
                    size="lg"
                    className="w-full mt-6 lg:hidden"
                    onClick={handleApply}
                  >
                    Candidatar-se
                  </Button>
                </CardContent>
              </Card>

              {/* Job Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Descricao da Vaga</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm max-w-none text-foreground"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle>Requisitos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">
                      Obrigatorios
                    </h4>
                    <ul className="space-y-2">
                      {job.requirements.mustHave.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">
                      Desejaveis
                    </h4>
                    <ul className="space-y-2">
                      {job.requirements.niceToHave.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <Circle className="h-5 w-5 text-muted-foreground mr-2 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle>Beneficios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {job.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-primary mr-2 shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Habilidades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply Card - Desktop */}
              <Card className="hidden lg:block sticky top-24">
                <CardContent className="p-6">
                  <Button
                    size="lg"
                    className="w-full mb-4"
                    onClick={handleApply}
                  >
                    Candidatar-se
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Seu Perfil Universal sera enviado automaticamente
                  </p>
                </CardContent>
              </Card>

              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Sobre a Empresa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      {job.company.logo ? (
                        <img
                          src={job.company.logo}
                          alt={job.company.name}
                          className="w-10 h-10 object-contain"
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{job.company.name}</h4>
                      <a
                        href={job.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center"
                      >
                        Visitar site
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {job.company.about}
                  </p>

                  <Separator />

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Tamanho</p>
                      <p className="text-sm font-medium">{job.company.size}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Setor</p>
                      <p className="text-sm font-medium">
                        {job.company.industry}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Cultura
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {job.company.culture.map((item) => (
                        <Badge key={item} variant="secondary" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Similar Jobs */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Vagas similares
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SIMILAR_JOBS.map((similarJob) => (
                <JobCardPublic key={similarJob.id} {...similarJob} />
              ))}
            </div>
          </div>
        </div>

        {/* Apply Modal */}
        <ApplyModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          jobTitle={job.title}
          companyName={job.company.name}
          onRegisterSuccess={() => {
            router.push(`/candidatar/${job.id}`);
          }}
        />
      </div>
    </>
  );
}
