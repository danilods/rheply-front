"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { MatchScore } from "@/components/candidates/match-score";
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageSquare,
  Linkedin,
  Github,
  Download,
  Plus,
  Calendar,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { format } from "date-fns";

// Mock candidate data
const mockCandidateData = {
  id: "1",
  name: "Alex Thompson",
  email: "alex.t@email.com",
  phone: "+1 (555) 123-4567",
  whatsapp: "+1 (555) 123-4567",
  linkedinUrl: "https://linkedin.com/in/alexthompson",
  githubUrl: "https://github.com/alexthompson",
  currentPosition: "Senior Frontend Developer",
  company: "Tech Corp Inc.",
  avatarUrl: "",
  matchScore: 92,
  status: "interviewed" as const,
  source: "LinkedIn",
  appliedDate: new Date("2024-03-10"),
  summary: `Passionate frontend developer with 6+ years of experience building scalable web applications. Expert in React ecosystem and modern JavaScript. Strong focus on performance optimization, accessibility, and user experience. Team player with excellent communication skills and a track record of delivering high-quality projects on time.`,
  experience: [
    {
      id: "1",
      title: "Senior Frontend Developer",
      company: "Tech Corp Inc.",
      location: "San Francisco, CA",
      startDate: new Date("2021-03-01"),
      endDate: null,
      current: true,
      description:
        "Lead frontend development for the main product. Architected and implemented new features using React, TypeScript, and GraphQL. Mentored junior developers and established coding standards.",
    },
    {
      id: "2",
      title: "Frontend Developer",
      company: "StartupXYZ",
      location: "Remote",
      startDate: new Date("2019-01-01"),
      endDate: new Date("2021-02-28"),
      current: false,
      description:
        "Built and maintained multiple React applications. Collaborated with designers to implement pixel-perfect UIs. Improved application performance by 40% through code optimization.",
    },
    {
      id: "3",
      title: "Junior Web Developer",
      company: "Digital Agency",
      location: "New York, NY",
      startDate: new Date("2017-06-01"),
      endDate: new Date("2018-12-31"),
      current: false,
      description:
        "Developed responsive websites using HTML, CSS, and JavaScript. Learned React and started contributing to SPA projects. Participated in client meetings and requirement gathering.",
    },
  ],
  education: [
    {
      id: "1",
      degree: "Bachelor of Science in Computer Science",
      institution: "University of California, Berkeley",
      graduationYear: 2017,
      gpa: "3.8",
    },
  ],
  skills: [
    { name: "React", proficiency: 95 },
    { name: "TypeScript", proficiency: 90 },
    { name: "Next.js", proficiency: 85 },
    { name: "GraphQL", proficiency: 80 },
    { name: "TailwindCSS", proficiency: 90 },
    { name: "Node.js", proficiency: 70 },
    { name: "Git", proficiency: 85 },
    { name: "Jest", proficiency: 75 },
  ],
  languages: [
    { name: "English", level: "Native" },
    { name: "Spanish", level: "Intermediate" },
  ],
  cvUrl: "/cvs/alex-thompson-cv.pdf",
};

interface Note {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
}

const mockNotes: Note[] = [
  {
    id: "1",
    content:
      "Great technical skills demonstrated during the coding challenge. Very clean code structure and good problem-solving approach.",
    author: "Jane Smith (Hiring Manager)",
    createdAt: new Date("2024-03-12T10:30:00"),
  },
  {
    id: "2",
    content:
      "Phone screening went well. Candidate shows strong communication skills and enthusiasm for the role. Recommended for technical interview.",
    author: "HR Team",
    createdAt: new Date("2024-03-11T14:15:00"),
  },
];

interface TimelineEvent {
  id: string;
  type: "application" | "screening" | "interview" | "note" | "status_change";
  title: string;
  description: string;
  date: Date;
}

const mockTimeline: TimelineEvent[] = [
  {
    id: "1",
    type: "interview",
    title: "Technical Interview Completed",
    description: "Completed 1-hour technical interview with engineering team",
    date: new Date("2024-03-14T15:00:00"),
  },
  {
    id: "2",
    type: "note",
    title: "Note Added",
    description: "Recruiter added performance notes",
    date: new Date("2024-03-12T10:30:00"),
  },
  {
    id: "3",
    type: "screening",
    title: "Phone Screening",
    description: "Initial phone screening with HR",
    date: new Date("2024-03-11T14:15:00"),
  },
  {
    id: "4",
    type: "status_change",
    title: "Status Changed to Screened",
    description: "Candidate moved to screening stage",
    date: new Date("2024-03-11T14:00:00"),
  },
  {
    id: "5",
    type: "application",
    title: "Application Received",
    description: "Candidate applied for Senior Frontend Developer position",
    date: new Date("2024-03-10T09:00:00"),
  },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
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

export default function CandidateProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState(mockNotes);

  const candidate = mockCandidateData;

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: String(Date.now()),
        content: newNote,
        author: "Current User",
        createdAt: new Date(),
      };
      setNotes([note, ...notes]);
      setNewNote("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Candidates
      </Button>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <Avatar className="h-24 w-24">
              <AvatarImage src={candidate.avatarUrl} alt={candidate.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
                {getInitials(candidate.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">
                    {candidate.name}
                  </h1>
                  <Badge variant={statusColors[candidate.status]}>
                    {statusLabels[candidate.status]}
                  </Badge>
                </div>
                <p className="mt-1 text-lg text-muted-foreground">
                  {candidate.currentPosition} at {candidate.company}
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <a
                  href={`mailto:${candidate.email}`}
                  className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  {candidate.email}
                </a>
                <a
                  href={`tel:${candidate.phone}`}
                  className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  {candidate.phone}
                </a>
                {candidate.whatsapp && (
                  <a
                    href={`https://wa.me/${candidate.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                    WhatsApp
                  </a>
                )}
                {candidate.linkedinUrl && (
                  <a
                    href={candidate.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
                {candidate.githubUrl && (
                  <a
                    href={candidate.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <MatchScore score={candidate.matchScore} size="lg" />
              <Button variant="outline" asChild>
                <a href={candidate.cvUrl} download>
                  <Download className="mr-2 h-4 w-4" />
                  Download CV
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{candidate.summary}</p>
                </CardContent>
              </Card>

              {/* Experience */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {candidate.experience.map((exp, index) => (
                      <div key={exp.id} className="relative pl-6">
                        {index !== candidate.experience.length - 1 && (
                          <div className="absolute left-[11px] top-6 h-full w-0.5 bg-border" />
                        )}
                        <div className="absolute left-0 top-1.5 h-[22px] w-[22px] rounded-full border-2 border-primary bg-background" />
                        <div>
                          <h4 className="font-semibold">{exp.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {exp.company} - {exp.location}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(exp.startDate, "MMM yyyy")} -{" "}
                            {exp.current
                              ? "Present"
                              : format(exp.endDate!, "MMM yyyy")}
                          </p>
                          <p className="mt-2 text-sm">{exp.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {candidate.education.map((edu) => (
                      <div key={edu.id}>
                        <h4 className="font-semibold">{edu.degree}</h4>
                        <p className="text-sm text-muted-foreground">
                          {edu.institution}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Graduated {edu.graduationYear} - GPA: {edu.gpa}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {candidate.skills.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex items-center justify-between text-sm">
                        <span>{skill.name}</span>
                        <span className="text-muted-foreground">
                          {skill.proficiency}%
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${skill.proficiency}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Languages */}
              <Card>
                <CardHeader>
                  <CardTitle>Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {candidate.languages.map((lang) => (
                      <div
                        key={lang.name}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>{lang.name}</span>
                        <Badge variant="outline">{lang.level}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Senior Frontend Developer</p>
                    <p className="text-sm text-muted-foreground">
                      Applied {format(candidate.appliedDate, "MMMM d, yyyy")}
                    </p>
                  </div>
                  <Badge variant={statusColors[candidate.status]}>
                    {statusLabels[candidate.status]}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add a note about this candidate..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[100px]"
              />
              <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Note
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="rounded-lg border p-4">
                    <p className="text-sm">{note.content}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{note.author}</span>
                      <span>{format(note.createdAt, "MMM d, yyyy h:mm a")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockTimeline.map((event, index) => (
                  <div key={event.id} className="relative pl-6">
                    {index !== mockTimeline.length - 1 && (
                      <div className="absolute left-[11px] top-6 h-full w-0.5 bg-border" />
                    )}
                    <div className="absolute left-0 top-1.5 h-[22px] w-[22px] rounded-full border-2 border-primary bg-background flex items-center justify-center">
                      <Calendar className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {format(event.date, "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
