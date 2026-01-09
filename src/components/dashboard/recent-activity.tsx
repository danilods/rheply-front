"use client";

import { cn } from "@/lib/utils";
import {
  Briefcase,
  FileText,
  LucideIcon,
  UserCheck,
  UserPlus,
  Video,
} from "lucide-react";
import Link from "next/link";

type ActivityType =
  | "application"
  | "interview"
  | "hire"
  | "job_posted"
  | "candidate_added";

interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  link?: string;
}

const activityIcons: Record<ActivityType, LucideIcon> = {
  application: FileText,
  interview: Video,
  hire: UserCheck,
  job_posted: Briefcase,
  candidate_added: UserPlus,
};

const activityColors: Record<ActivityType, string> = {
  application: "bg-blue-500",
  interview: "bg-purple-500",
  hire: "bg-green-500",
  job_posted: "bg-orange-500",
  candidate_added: "bg-cyan-500",
};

interface RecentActivityProps {
  activities: Activity[];
  className?: string;
}

export function RecentActivity({
  activities,
  className,
}: RecentActivityProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-6 shadow-sm",
        className
      )}
    >
      <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
      <div className="space-y-1">
        {activities.map((activity, index) => {
          const Icon = activityIcons[activity.type];
          const colorClass = activityColors[activity.type];

          return (
            <div key={activity.id} className="relative flex gap-4 pb-4">
              {index !== activities.length - 1 && (
                <div className="absolute left-[15px] top-8 h-full w-px bg-border" />
              )}
              <div
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  colorClass
                )}
              >
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                {activity.link ? (
                  <Link
                    href={activity.link}
                    className="text-sm font-medium hover:underline"
                  >
                    {activity.description}
                  </Link>
                ) : (
                  <p className="text-sm font-medium">{activity.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
