"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Mail,
  MoreVertical,
  Eye,
  MessageSquare,
  Calendar,
  Trash2,
} from "lucide-react";
import { MatchScore } from "./match-score";
import Link from "next/link";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  currentPosition: string;
  avatarUrl?: string;
  skills: string[];
  matchScore: number;
  status: "new" | "screened" | "interviewed" | "offered" | "hired" | "rejected";
  source?: string;
  appliedDate?: Date;
}

interface CandidateCardProps {
  candidate: Candidate;
  onView?: (id: string) => void;
  onContact?: (id: string) => void;
  onSchedule?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusColors = {
  new: "info",
  screened: "warning",
  interviewed: "secondary",
  offered: "success",
  hired: "success",
  rejected: "destructive",
} as const;

const statusLabels = {
  new: "New",
  screened: "Screened",
  interviewed: "Interviewed",
  offered: "Offered",
  hired: "Hired",
  rejected: "Rejected",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function CandidateCard({
  candidate,
  onView,
  onContact,
  onSchedule,
  onDelete,
}: CandidateCardProps) {
  const displayedSkills = candidate.skills.slice(0, 3);
  const remainingSkillsCount = candidate.skills.length - 3;

  return (
    <Card className="group transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={candidate.avatarUrl} alt={candidate.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(candidate.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link
                href={`/candidates/${candidate.id}`}
                className="font-semibold hover:text-primary transition-colors"
              >
                {candidate.name}
              </Link>
              <p className="text-sm text-muted-foreground">
                {candidate.currentPosition}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(candidate.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onContact?.(candidate.id)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSchedule?.(candidate.id)}>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Interview
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(candidate.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{candidate.email}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {displayedSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="text-xs font-normal"
                >
                  {skill}
                </Badge>
              ))}
              {remainingSkillsCount > 0 && (
                <Badge
                  variant="outline"
                  className="text-xs font-normal bg-muted"
                >
                  +{remainingSkillsCount}
                </Badge>
              )}
            </div>
            <Badge variant={statusColors[candidate.status]}>
              {statusLabels[candidate.status]}
            </Badge>
          </div>
          <MatchScore score={candidate.matchScore} size="md" />
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView?.(candidate.id)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onContact?.(candidate.id)}
          >
            <Mail className="mr-2 h-4 w-4" />
            Contact
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
