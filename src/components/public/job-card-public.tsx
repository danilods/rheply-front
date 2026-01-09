'use client';

import Link from 'next/link';
import {
  MapPin,
  Building2,
  Clock,
  Bookmark,
  BookmarkCheck,
  Banknote,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatSalaryRange } from '@/lib/seo';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface PublicJobCardProps {
  id: string;
  slug: string;
  title: string;
  company: {
    name: string;
    logo?: string;
  };
  location: {
    city?: string;
    state?: string;
    remote?: boolean;
    hybrid?: boolean;
  };
  type: string; // CLT, PJ, etc.
  level: string; // Junior, Mid, Senior
  salary?: {
    min?: number;
    max?: number;
  };
  skills: string[];
  postedAt: Date;
  isSaved?: boolean;
  onSave?: (id: string) => void;
  className?: string;
}

export function JobCardPublic({
  id,
  slug,
  title,
  company,
  location,
  type,
  level,
  salary,
  skills,
  postedAt,
  isSaved = false,
  onSave,
  className,
}: PublicJobCardProps) {
  const getLocationString = () => {
    const parts = [];
    if (location.city && location.state) {
      parts.push(`${location.city}, ${location.state}`);
    } else if (location.city) {
      parts.push(location.city);
    } else if (location.state) {
      parts.push(location.state);
    }

    if (location.remote) {
      parts.push('Remoto');
    } else if (location.hybrid) {
      parts.push('Hibrido');
    }

    return parts.join(' - ') || 'Nao especificado';
  };

  const timeAgo = formatDistanceToNow(postedAt, {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <Card
      className={cn(
        'group hover:shadow-md transition-all duration-200 hover:border-primary/50',
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start space-x-4">
            {/* Company Logo */}
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center shrink-0">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <Building2 className="w-6 h-6 text-muted-foreground" />
              )}
            </div>

            <div>
              <Link
                href={`/vagas/${slug}`}
                className="block group-hover:text-primary transition-colors"
              >
                <h3 className="font-semibold text-lg leading-tight mb-1">
                  {title}
                </h3>
              </Link>
              <p className="text-muted-foreground text-sm">{company.name}</p>
            </div>
          </div>

          {/* Save Button */}
          {onSave && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSave(id)}
              className={cn(
                'shrink-0',
                isSaved && 'text-primary hover:text-primary'
              )}
            >
              {isSaved ? (
                <BookmarkCheck className="h-5 w-5" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>

        {/* Location and Time */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {getLocationString()}
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {timeAgo}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">{type}</Badge>
          <Badge variant="outline">{level}</Badge>
          {location.remote && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              Remoto
            </Badge>
          )}
          {location.hybrid && (
            <Badge variant="default" className="bg-blue-100 text-blue-800">
              Hibrido
            </Badge>
          )}
        </div>

        {/* Salary */}
        {salary && (salary.min || salary.max) && (
          <div className="flex items-center text-sm font-medium text-foreground mb-4">
            <Banknote className="h-4 w-4 mr-2 text-green-600" />
            {formatSalaryRange(salary.min, salary.max)}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground"
              >
                {skill}
              </span>
            ))}
            {skills.length > 5 && (
              <span className="text-xs text-muted-foreground px-2 py-1">
                +{skills.length - 5}
              </span>
            )}
          </div>
        )}

        {/* View More Link */}
        <div className="mt-4 pt-4 border-t border-border">
          <Link
            href={`/vagas/${slug}`}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Ver detalhes da vaga
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
