'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Filter,
  ArrowUpDown,
  Map,
  Grid3X3,
  Bell,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { JobSearchBar } from '@/components/public/job-search-bar';
import { JobCardPublic } from '@/components/public/job-card-public';

// Mock data for jobs
const ALL_JOBS = [
  {
    id: '1',
    slug: 'desenvolvedor-frontend-senior-techcorp',
    title: 'Desenvolvedor Frontend Senior',
    company: { name: 'TechCorp' },
    location: { city: 'Sao Paulo', state: 'SP', remote: true },
    type: 'CLT',
    level: 'Senior',
    area: 'Tecnologia',
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
    area: 'Produto',
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
    area: 'Tecnologia',
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
    area: 'Design',
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
    area: 'Tecnologia',
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
    area: 'Marketing',
    salary: { min: 7000, max: 11000 },
    skills: ['SEO', 'Google Ads', 'Analytics', 'Social Media'],
    postedAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: '7',
    slug: 'vendedor-interno-salesforce',
    title: 'Vendedor Interno',
    company: { name: 'SalesForce BR' },
    location: { city: 'Sao Paulo', state: 'SP', remote: false },
    type: 'CLT',
    level: 'Junior',
    area: 'Vendas',
    salary: { min: 3500, max: 6000 },
    skills: ['CRM', 'Negociacao', 'Prospeccao', 'Inside Sales'],
    postedAt: new Date(Date.now() - 86400000 * 1),
  },
  {
    id: '8',
    slug: 'analista-financeiro-fintech',
    title: 'Analista Financeiro',
    company: { name: 'FinTech Solutions' },
    location: { city: 'Sao Paulo', state: 'SP', hybrid: true },
    type: 'CLT',
    level: 'Pleno',
    area: 'Financeiro',
    salary: { min: 6000, max: 9000 },
    skills: ['Excel Avancado', 'Power BI', 'Analise Financeira', 'SAP'],
    postedAt: new Date(Date.now() - 86400000 * 6),
  },
  {
    id: '9',
    slug: 'estagiario-desenvolvimento-startup',
    title: 'Estagiario de Desenvolvimento',
    company: { name: 'Startup Hub' },
    location: { city: 'Florianopolis', state: 'SC', remote: true },
    type: 'Estagio',
    level: 'Estagio',
    area: 'Tecnologia',
    salary: { min: 1800, max: 2500 },
    skills: ['JavaScript', 'React', 'Git', 'Node.js'],
    postedAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: '10',
    slug: 'gerente-rh-corporate',
    title: 'Gerente de RH',
    company: { name: 'Corporate Solutions' },
    location: { city: 'Rio de Janeiro', state: 'RJ', remote: false },
    type: 'CLT',
    level: 'Gerente',
    area: 'RH',
    salary: { min: 12000, max: 18000 },
    skills: ['Gestao de Pessoas', 'Recrutamento', 'Treinamento', 'DP'],
    postedAt: new Date(Date.now() - 86400000 * 7),
  },
];

const AREAS = [
  'Tecnologia',
  'Marketing',
  'Vendas',
  'Financeiro',
  'RH',
  'Design',
  'Produto',
  'Operacoes',
];

const LEVELS = ['Estagio', 'Junior', 'Pleno', 'Senior', 'Gerente', 'Diretor'];

const TYPES = ['CLT', 'PJ', 'Estagio', 'Temporario'];

function JobSearchPageContent() {
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState(ALL_JOBS);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 9;

  // Filter states
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(
    searchParams.get('location') || ''
  );
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [hybridOnly, setHybridOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  // Apply filters
  useEffect(() => {
    let filtered = [...ALL_JOBS];

    // Text search
    if (query) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm) ||
          job.company.name.toLowerCase().includes(searchTerm) ||
          job.skills.some((skill) => skill.toLowerCase().includes(searchTerm))
      );
    }

    // Location search
    if (location) {
      const locationTerm = location.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.location.city?.toLowerCase().includes(locationTerm) ||
          job.location.state?.toLowerCase().includes(locationTerm) ||
          (locationTerm.includes('remoto') && job.location.remote) ||
          (locationTerm.includes('hibrido') && job.location.hybrid)
      );
    }

    // Area filter
    if (selectedAreas.length > 0) {
      filtered = filtered.filter((job) => selectedAreas.includes(job.area));
    }

    // Level filter
    if (selectedLevels.length > 0) {
      filtered = filtered.filter((job) => selectedLevels.includes(job.level));
    }

    // Type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((job) => selectedTypes.includes(job.type));
    }

    // Location filter
    if (selectedLocations.length > 0) {
      filtered = filtered.filter((job) => {
        if (selectedLocations.includes('Remoto') && job.location.remote)
          return true;
        return selectedLocations.some(
          (loc) =>
            job.location.city?.includes(loc) ||
            job.location.state?.includes(loc)
        );
      });
    }

    // Remote only
    if (remoteOnly) {
      filtered = filtered.filter((job) => job.location.remote);
    }

    // Hybrid only
    if (hybridOnly) {
      filtered = filtered.filter((job) => job.location.hybrid);
    }

    // Salary filter
    if (salaryMin) {
      filtered = filtered.filter(
        (job) => job.salary && job.salary.min >= parseInt(salaryMin)
      );
    }
    if (salaryMax) {
      filtered = filtered.filter(
        (job) => job.salary && job.salary.max <= parseInt(salaryMax)
      );
    }

    // Sorting
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime());
        break;
      case 'salary_high':
        filtered.sort((a, b) => (b.salary?.max || 0) - (a.salary?.max || 0));
        break;
      case 'salary_low':
        filtered.sort((a, b) => (a.salary?.min || 0) - (b.salary?.min || 0));
        break;
    }

    setJobs(filtered);
    setCurrentPage(1);
  }, [
    query,
    location,
    selectedAreas,
    selectedLevels,
    selectedTypes,
    selectedLocations,
    salaryMin,
    salaryMax,
    remoteOnly,
    hybridOnly,
    sortBy,
  ]);

  const handleSearch = (newQuery: string, newLocation: string) => {
    setQuery(newQuery);
    setLocation(newLocation);
  };

  const handleSaveJob = (jobId: string) => {
    setSavedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  const clearAllFilters = () => {
    setQuery('');
    setLocation('');
    setSelectedAreas([]);
    setSelectedLevels([]);
    setSelectedTypes([]);
    setSelectedLocations([]);
    setSalaryMin('');
    setSalaryMax('');
    setRemoteOnly(false);
    setHybridOnly(false);
    setSortBy('recent');
  };

  const activeFiltersCount =
    selectedAreas.length +
    selectedLevels.length +
    selectedTypes.length +
    selectedLocations.length +
    (salaryMin ? 1 : 0) +
    (salaryMax ? 1 : 0) +
    (remoteOnly ? 1 : 0) +
    (hybridOnly ? 1 : 0);

  // Pagination
  const totalPages = Math.ceil(jobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const paginatedJobs = jobs.slice(startIndex, startIndex + jobsPerPage);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Search Header */}
      <div className="bg-background border-b border-border py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <JobSearchBar
            initialQuery={query}
            initialLocation={location}
            onSearch={handleSearch}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filtros</CardTitle>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                    >
                      Limpar ({activeFiltersCount})
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Area Filter */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Area/Departamento
                  </Label>
                  <div className="space-y-2">
                    {AREAS.map((area) => (
                      <div key={area} className="flex items-center space-x-2">
                        <Checkbox
                          id={`area-${area}`}
                          checked={selectedAreas.includes(area)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAreas([...selectedAreas, area]);
                            } else {
                              setSelectedAreas(
                                selectedAreas.filter((a) => a !== area)
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={`area-${area}`}
                          className="text-sm font-normal"
                        >
                          {area}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Level Filter */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Nivel
                  </Label>
                  <div className="space-y-2">
                    {LEVELS.map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox
                          id={`level-${level}`}
                          checked={selectedLevels.includes(level)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedLevels([...selectedLevels, level]);
                            } else {
                              setSelectedLevels(
                                selectedLevels.filter((l) => l !== level)
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={`level-${level}`}
                          className="text-sm font-normal"
                        >
                          {level}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Type Filter */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Tipo de Contrato
                  </Label>
                  <div className="space-y-2">
                    {TYPES.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTypes([...selectedTypes, type]);
                            } else {
                              setSelectedTypes(
                                selectedTypes.filter((t) => t !== type)
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={`type-${type}`}
                          className="text-sm font-normal"
                        >
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Work Mode */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Modelo de Trabalho
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remote"
                        checked={remoteOnly}
                        onCheckedChange={(checked) =>
                          setRemoteOnly(checked as boolean)
                        }
                      />
                      <Label htmlFor="remote" className="text-sm font-normal">
                        Apenas Remoto
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hybrid"
                        checked={hybridOnly}
                        onCheckedChange={(checked) =>
                          setHybridOnly(checked as boolean)
                        }
                      />
                      <Label htmlFor="hybrid" className="text-sm font-normal">
                        Apenas Hibrido
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Salary Range */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Faixa Salarial (R$)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(e.target.value)}
                      className="h-9"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {jobs.length} vagas encontradas
                </h1>
                {(query || location) && (
                  <p className="text-muted-foreground mt-1">
                    {query && `"${query}"`}
                    {query && location && ' em '}
                    {location && `${location}`}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Mais recentes</SelectItem>
                    <SelectItem value="salary_high">Maior salario</SelectItem>
                    <SelectItem value="salary_low">Menor salario</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="hidden sm:flex border border-border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('map')}
                    className="rounded-l-none"
                  >
                    <Map className="h-4 w-4" />
                  </Button>
                </div>

                {/* Save Search */}
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Criar alerta
                </Button>
              </div>
            </div>

            {/* Active Filters Tags */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedAreas.map((area) => (
                  <Badge
                    key={area}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedAreas(selectedAreas.filter((a) => a !== area))
                    }
                  >
                    {area}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                {selectedLevels.map((level) => (
                  <Badge
                    key={level}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedLevels(
                        selectedLevels.filter((l) => l !== level)
                      )
                    }
                  >
                    {level}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                {selectedTypes.map((type) => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedTypes(selectedTypes.filter((t) => t !== type))
                    }
                  >
                    {type}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                {remoteOnly && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setRemoteOnly(false)}
                  >
                    Remoto
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
                {hybridOnly && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setHybridOnly(false)}
                  >
                    Hibrido
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
                {salaryMin && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setSalaryMin('')}
                  >
                    Min: R${salaryMin}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
                {salaryMax && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setSalaryMax('')}
                  >
                    Max: R${salaryMax}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
              </div>
            )}

            {/* Jobs Grid */}
            {paginatedJobs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedJobs.map((job) => (
                    <JobCardPublic
                      key={job.id}
                      {...job}
                      isSaved={savedJobs.includes(job.id)}
                      onSave={handleSaveJob}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="text-muted-foreground mb-4">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">
                      Nenhuma vaga encontrada
                    </h3>
                    <p>Tente ajustar os filtros ou buscar por outros termos</p>
                  </div>
                  <Button variant="outline" onClick={clearAllFilters}>
                    Limpar filtros
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function JobSearchLoading() {
  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Carregando vagas...</p>
      </div>
    </div>
  );
}

export default function JobSearchPage() {
  return (
    <Suspense fallback={<JobSearchLoading />}>
      <JobSearchPageContent />
    </Suspense>
  );
}
