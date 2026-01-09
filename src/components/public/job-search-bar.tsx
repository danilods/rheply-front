'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface JobSearchBarProps {
  className?: string;
  variant?: 'default' | 'hero';
  initialQuery?: string;
  initialLocation?: string;
  onSearch?: (query: string, location: string) => void;
}

const POPULAR_SEARCHES = [
  'Desenvolvedor Frontend',
  'Analista de Dados',
  'Product Manager',
  'UX Designer',
  'DevOps Engineer',
  'Marketing Digital',
  'Vendedor',
  'Analista Financeiro',
];

const POPULAR_LOCATIONS = [
  'Sao Paulo, SP',
  'Rio de Janeiro, RJ',
  'Belo Horizonte, MG',
  'Curitiba, PR',
  'Porto Alegre, RS',
  'Remoto',
  'Hibrido',
];

export function JobSearchBar({
  className,
  variant = 'default',
  initialQuery = '',
  initialLocation = '',
  onSearch,
}: JobSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [showQuerySuggestions, setShowQuerySuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [filteredQueries, setFilteredQueries] = useState<string[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);

  const queryRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = POPULAR_SEARCHES.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredQueries(filtered);
    } else {
      setFilteredQueries(POPULAR_SEARCHES);
    }
  }, [query]);

  useEffect(() => {
    if (location.length > 0) {
      const filtered = POPULAR_LOCATIONS.filter((item) =>
        item.toLowerCase().includes(location.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(POPULAR_LOCATIONS);
    }
  }, [location]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (queryRef.current && !queryRef.current.contains(event.target as Node)) {
        setShowQuerySuggestions(false);
      }
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setShowLocationSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (onSearch) {
      onSearch(query, location);
    } else {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (location) params.set('location', location);
      router.push(`/vagas?${params.toString()}`);
    }

    setShowQuerySuggestions(false);
    setShowLocationSuggestions(false);
  };

  const isHero = variant === 'hero';

  return (
    <form
      onSubmit={handleSearch}
      className={cn(
        'w-full',
        isHero && 'bg-background rounded-lg shadow-lg p-4 sm:p-6',
        className
      )}
    >
      <div
        className={cn(
          'flex flex-col gap-3',
          isHero ? 'md:flex-row md:gap-4' : 'sm:flex-row sm:gap-2'
        )}
      >
        {/* Query Input */}
        <div ref={queryRef} className="relative flex-1">
          <div className="relative">
            <Search
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground',
                isHero ? 'h-5 w-5' : 'h-4 w-4'
              )}
            />
            <Input
              type="text"
              placeholder="Cargo, habilidade ou empresa"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowQuerySuggestions(true)}
              className={cn(
                'pl-10',
                isHero && 'h-12 text-base',
                query && 'pr-10'
              )}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Query Suggestions */}
          {showQuerySuggestions && filteredQueries.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
              <div className="p-2">
                <p className="text-xs font-medium text-muted-foreground px-2 mb-2">
                  Pesquisas populares
                </p>
                {filteredQueries.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setQuery(suggestion);
                      setShowQuerySuggestions(false);
                    }}
                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Location Input */}
        <div ref={locationRef} className="relative flex-1">
          <div className="relative">
            <MapPin
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground',
                isHero ? 'h-5 w-5' : 'h-4 w-4'
              )}
            />
            <Input
              type="text"
              placeholder="Cidade, estado ou remoto"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={() => setShowLocationSuggestions(true)}
              className={cn(
                'pl-10',
                isHero && 'h-12 text-base',
                location && 'pr-10'
              )}
            />
            {location && (
              <button
                type="button"
                onClick={() => setLocation('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Location Suggestions */}
          {showLocationSuggestions && filteredLocations.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
              <div className="p-2">
                <p className="text-xs font-medium text-muted-foreground px-2 mb-2">
                  Locais populares
                </p>
                {filteredLocations.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setLocation(loc);
                      setShowLocationSuggestions(false);
                    }}
                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded transition-colors"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Button */}
        <Button
          type="submit"
          size={isHero ? 'lg' : 'default'}
          className={cn(
            isHero && 'h-12 px-8 text-base font-semibold',
            'shrink-0'
          )}
        >
          <Search className={cn('mr-2', isHero ? 'h-5 w-5' : 'h-4 w-4')} />
          Buscar
        </Button>
      </div>
    </form>
  );
}
