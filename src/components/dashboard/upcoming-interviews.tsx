"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, Video } from "lucide-react";

interface Interview {
  id: string;
  candidateName: string;
  candidateAvatar?: string;
  jobTitle: string;
  dateTime: string;
  meetingLink?: string;
}

interface UpcomingInterviewsProps {
  interviews: Interview[];
  className?: string;
}

export function UpcomingInterviews({
  interviews,
  className,
}: UpcomingInterviewsProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-6 shadow-sm",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Upcoming Interviews</h3>
        <Calendar className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="space-y-4">
        {interviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No upcoming interviews scheduled
          </p>
        ) : (
          interviews.map((interview) => (
            <div
              key={interview.id}
              className="flex items-center justify-between gap-4 rounded-md border bg-muted/30 p-3"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={interview.candidateAvatar} />
                  <AvatarFallback>
                    {getInitials(interview.candidateName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{interview.candidateName}</p>
                  <p className="text-sm text-muted-foreground">
                    {interview.jobTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {interview.dateTime}
                  </p>
                </div>
              </div>
              {interview.meetingLink && (
                <Button size="sm" variant="outline" asChild>
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Join
                  </a>
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
