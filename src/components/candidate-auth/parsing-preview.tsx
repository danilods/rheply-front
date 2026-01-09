"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Code,
  CheckCircle2,
  Edit2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ParsedCVData } from "@/types/candidate";
import { cn } from "@/lib/utils";

interface ParsingPreviewProps {
  data: ParsedCVData;
  onEdit?: (section: string) => void;
}

export function ParsingPreview({ data, onEdit }: ParsingPreviewProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "basic",
    "skills",
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600 bg-green-100";
    if (confidence >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-orange-600 bg-orange-100";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 90) return "Alta";
    if (confidence >= 70) return "Media";
    return "Baixa";
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Overall Confidence */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">
                  Curriculo analisado com sucesso!
                </p>
                <p className="text-sm text-green-700">
                  Esta correto? Voce pode editar depois
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "text-lg px-3 py-1",
                getConfidenceColor(data.confidence)
              )}
            >
              {data.confidence}% precisao
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleSection("basic")}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>Informacoes Basicas</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit("basic");
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              {expandedSections.includes("basic") ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </div>
        </CardHeader>
        {expandedSections.includes("basic") && (
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{data.fullName}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{data.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{data.phone}</span>
              </div>
              {data.location && (
                <div className="text-sm text-muted-foreground">
                  {data.location}
                </div>
              )}
              {data.summary && (
                <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                  {data.summary}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Work Experience */}
      {data.experiences.length > 0 && (
        <Card>
          <CardHeader
            className="cursor-pointer"
            onClick={() => toggleSection("experiences")}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <span>Experiencia Profissional</span>
                <Badge variant="secondary">{data.experiences.length}</Badge>
              </CardTitle>
              <div className="flex items-center space-x-2">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit("experiences");
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                {expandedSections.includes("experiences") ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </div>
          </CardHeader>
          {expandedSections.includes("experiences") && (
            <CardContent className="pt-0">
              <div className="space-y-4">
                {data.experiences.map((exp, index) => (
                  <div key={exp.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{exp.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {exp.company}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            getConfidenceColor(exp.confidence)
                          )}
                        >
                          {getConfidenceLabel(exp.confidence)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(exp.startDate)} -{" "}
                        {exp.isCurrent
                          ? "Presente"
                          : exp.endDate
                          ? formatDate(exp.endDate)
                          : ""}
                      </p>
                      {exp.description && (
                        <p className="text-sm text-muted-foreground">
                          {exp.description}
                        </p>
                      )}
                      {exp.achievements.length > 0 && (
                        <ul className="text-sm space-y-1 ml-4">
                          {exp.achievements.slice(0, 3).map((achievement, i) => (
                            <li
                              key={i}
                              className="list-disc text-muted-foreground"
                            >
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <Card>
          <CardHeader
            className="cursor-pointer"
            onClick={() => toggleSection("education")}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span>Formacao Academica</span>
                <Badge variant="secondary">{data.education.length}</Badge>
              </CardTitle>
              <div className="flex items-center space-x-2">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit("education");
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                {expandedSections.includes("education") ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </div>
          </CardHeader>
          {expandedSections.includes("education") && (
            <CardContent className="pt-0">
              <div className="space-y-4">
                {data.education.map((edu, index) => (
                  <div key={edu.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{edu.degree}</h4>
                          <p className="text-sm text-muted-foreground">
                            {edu.fieldOfStudy}
                          </p>
                          <p className="text-sm">{edu.institution}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            getConfidenceColor(edu.confidence)
                          )}
                        >
                          {getConfidenceLabel(edu.confidence)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(edu.startDate)} -{" "}
                        {edu.isCurrent
                          ? "Em andamento"
                          : edu.endDate
                          ? formatDate(edu.endDate)
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <Card>
          <CardHeader
            className="cursor-pointer"
            onClick={() => toggleSection("skills")}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center space-x-2">
                <Code className="h-5 w-5 text-primary" />
                <span>Competencias</span>
                <Badge variant="secondary">{data.skills.length}</Badge>
              </CardTitle>
              <div className="flex items-center space-x-2">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit("skills");
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                {expandedSections.includes("skills") ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </div>
          </CardHeader>
          {expandedSections.includes("skills") && (
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="secondary"
                    className={cn(
                      "text-sm py-1",
                      skill.confidence >= 90 && "bg-green-100 text-green-800",
                      skill.confidence >= 70 &&
                        skill.confidence < 90 &&
                        "bg-blue-100 text-blue-800",
                      skill.confidence < 70 && "bg-gray-100 text-gray-800"
                    )}
                  >
                    {skill.name}
                    {skill.level && (
                      <span className="ml-1 opacity-70">
                        ({skill.level})
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
