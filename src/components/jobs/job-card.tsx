"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapPin,
  Calendar,
  Users,
  MoreVertical,
  Eye,
  Pencil,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  postedDate: Date;
  applicantsCount: number;
  status: "open" | "closed" | "draft";
  employmentType: string;
  salaryRange?: {
    min: number;
    max: number;
  };
}

interface JobCardProps {
  job: Job;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onClose?: (id: string) => void;
}

const statusColors = {
  open: "success",
  closed: "destructive",
  draft: "secondary",
} as const;

const statusLabels = {
  open: "Open",
  closed: "Closed",
  draft: "Draft",
};

const departmentColors: Record<string, string> = {
  Engineering: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  Design: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  Marketing: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100",
  Sales: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  HR: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
  Finance: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  Operations: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100",
};

export function JobCard({ job, onView, onEdit, onClose }: JobCardProps) {
  return (
    <Card className="group transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Link
              href={`/jobs/${job.id}`}
              className="text-lg font-semibold hover:text-primary transition-colors"
            >
              {job.title}
            </Link>
            <div className="flex items-center gap-2">
              <Badge
                className={
                  departmentColors[job.department] ||
                  "bg-gray-100 text-gray-800"
                }
              >
                {job.department}
              </Badge>
              <Badge variant={statusColors[job.status]}>
                {statusLabels[job.status]}
              </Badge>
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
              <DropdownMenuItem onClick={() => onView?.(job.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(job.id)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {job.status === "open" && (
                <DropdownMenuItem
                  onClick={() => onClose?.(job.id)}
                  className="text-destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Close Job
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Posted {format(job.postedDate, "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              {job.applicantsCount}{" "}
              {job.applicantsCount === 1 ? "applicant" : "applicants"}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView?.(job.id)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit?.(job.id)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
