"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skill } from "@/store/candidate";
import { Plus, X, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Common skills database for autocomplete
const skillsDatabase = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Vue.js",
  "Angular",
  "Node.js",
  "Python",
  "Django",
  "Flask",
  "Java",
  "Spring Boot",
  "C#",
  ".NET",
  "Ruby",
  "Ruby on Rails",
  "PHP",
  "Laravel",
  "Go",
  "Rust",
  "Swift",
  "Kotlin",
  "SQL",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "Git",
  "CI/CD",
  "Agile",
  "Scrum",
  "REST API",
  "GraphQL",
  "HTML",
  "CSS",
  "Sass",
  "Tailwind CSS",
  "Bootstrap",
  "Figma",
  "Adobe XD",
  "UI/UX Design",
  "Machine Learning",
  "Data Analysis",
  "Power BI",
  "Excel",
  "Project Management",
  "Communication",
  "Leadership",
  "Problem Solving",
  "Critical Thinking",
  "Teamwork",
];

interface SkillInputProps {
  skills: Skill[];
  onAddSkill: (skill: Skill) => void;
  onUpdateSkillProficiency: (id: string, proficiency: number) => void;
  onDeleteSkill: (id: string) => void;
  suggestedSkills?: string[];
}

export function SkillInput({
  skills,
  onAddSkill,
  onUpdateSkillProficiency,
  onDeleteSkill,
  suggestedSkills = [],
}: SkillInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedProficiency, setSelectedProficiency] = useState(3);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (input.trim()) {
      const filtered = skillsDatabase
        .filter(
          (skill) =>
            skill.toLowerCase().includes(input.toLowerCase()) &&
            !skills.find((s) => s.name.toLowerCase() === skill.toLowerCase())
        )
        .slice(0, 8);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [input, skills]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddSkill = (skillName?: string) => {
    const name = skillName || input.trim();
    if (name && !skills.find((s) => s.name.toLowerCase() === name.toLowerCase())) {
      const newSkill: Skill = {
        id: crypto.randomUUID(),
        name,
        proficiency: selectedProficiency,
      };
      onAddSkill(newSkill);
      setInput("");
      setShowSuggestions(false);
      setSelectedProficiency(3);
    }
  };

  const renderStars = (proficiency: number, editable: boolean = false, skillId?: string) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4 transition-colors",
              star <= proficiency
                ? "fill-yellow-400 text-yellow-400"
                : "fill-none text-muted-foreground",
              editable && "cursor-pointer hover:text-yellow-400"
            )}
            onClick={() => {
              if (editable && skillId) {
                onUpdateSkillProficiency(skillId, star);
              } else if (editable) {
                setSelectedProficiency(star);
              }
            }}
          />
        ))}
      </div>
    );
  };

  const getProficiencyLabel = (proficiency: number) => {
    const labels = ["", "Basico", "Intermediario", "Avancado", "Especialista", "Expert"];
    return labels[proficiency];
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              placeholder="Digite uma habilidade..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              onFocus={() => {
                if (input.trim() && filteredSuggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
            />
            {showSuggestions && (
              <Card
                ref={suggestionsRef}
                className="absolute z-50 w-full mt-1 shadow-lg"
              >
                <CardContent className="p-2">
                  {filteredSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent transition-colors"
                      onClick={() => handleAddSkill(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
          <div className="flex items-center gap-2 bg-muted/50 rounded-md px-3">
            {renderStars(selectedProficiency, true)}
          </div>
          <Button type="button" onClick={() => handleAddSkill()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Nivel selecionado: {getProficiencyLabel(selectedProficiency)}
        </p>
      </div>

      {skills.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Suas habilidades ({skills.length}):
          </p>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2 group"
              >
                <span className="text-sm font-medium">{skill.name}</span>
                {renderStars(skill.proficiency, true, skill.id)}
                <button
                  type="button"
                  onClick={() => onDeleteSkill(skill.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {suggestedSkills.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-border">
          <p className="text-sm font-medium text-muted-foreground">
            Habilidades sugeridas baseadas na sua experiencia:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedSkills
              .filter((s) => !skills.find((sk) => sk.name.toLowerCase() === s.toLowerCase()))
              .slice(0, 6)
              .map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleAddSkill(suggestion)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {suggestion}
                </Badge>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
