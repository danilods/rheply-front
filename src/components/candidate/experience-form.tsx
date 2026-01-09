"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Experience } from "@/store/candidate";

const experienceSchema = z.object({
  company: z.string().min(1, "Nome da empresa e obrigatorio"),
  title: z.string().min(1, "Cargo e obrigatorio"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Data de inicio e obrigatoria"),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().min(10, "Descricao deve ter pelo menos 10 caracteres"),
  skills: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

interface ExperienceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Experience) => void;
  initialData?: Experience;
  mode: "add" | "edit";
}

export function ExperienceForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: ExperienceFormProps) {
  const [skillInput, setSkillInput] = useState("");
  const [achievementInput, setAchievementInput] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: initialData
      ? {
          company: initialData.company,
          title: initialData.title,
          location: initialData.location || "",
          startDate: initialData.startDate,
          endDate: initialData.endDate || "",
          isCurrent: initialData.isCurrent,
          description: initialData.description,
          skills: initialData.skills,
          achievements: initialData.achievements,
        }
      : {
          company: "",
          title: "",
          location: "",
          startDate: "",
          endDate: "",
          isCurrent: false,
          description: "",
          skills: [],
          achievements: [],
        },
  });

  const isCurrent = watch("isCurrent");
  const skills = watch("skills");
  const achievements = watch("achievements");

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setValue("skills", [...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setValue(
      "skills",
      skills.filter((s) => s !== skill)
    );
  };

  const addAchievement = () => {
    if (achievementInput.trim()) {
      setValue("achievements", [...achievements, achievementInput.trim()]);
      setAchievementInput("");
    }
  };

  const removeAchievement = (index: number) => {
    setValue(
      "achievements",
      achievements.filter((_, i) => i !== index)
    );
  };

  const handleFormSubmit = (data: ExperienceFormData) => {
    const experience: Experience = {
      id: initialData?.id || crypto.randomUUID(),
      company: data.company,
      title: data.title,
      location: data.location,
      startDate: data.startDate,
      endDate: data.isCurrent ? undefined : data.endDate,
      isCurrent: data.isCurrent,
      description: data.description,
      skills: data.skills,
      achievements: data.achievements,
    };
    onSubmit(experience);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Adicionar Experiencia" : "Editar Experiencia"}
          </DialogTitle>
          <DialogDescription>
            Preencha as informacoes sobre sua experiencia profissional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Empresa *</Label>
              <Input
                id="company"
                placeholder="Nome da empresa"
                {...register("company")}
              />
              {errors.company && (
                <p className="text-sm text-destructive">{errors.company.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Cargo *</Label>
              <Input
                id="title"
                placeholder="Seu cargo"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Localizacao</Label>
            <Input
              id="location"
              placeholder="Cidade, Estado ou Remoto"
              {...register("location")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Inicio *</Label>
              <Input
                id="startDate"
                type="month"
                {...register("startDate")}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Termino</Label>
              <Input
                id="endDate"
                type="month"
                disabled={isCurrent}
                {...register("endDate")}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isCurrent"
              checked={isCurrent}
              onCheckedChange={(checked) => setValue("isCurrent", checked as boolean)}
            />
            <Label htmlFor="isCurrent" className="text-sm font-normal">
              Trabalho atual
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descricao *</Label>
            <Textarea
              id="description"
              placeholder="Descreva suas responsabilidades e atividades principais..."
              rows={4}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Habilidades Utilizadas</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Adicione uma habilidade"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addSkill}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => removeSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Conquistas</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Adicione uma conquista ou resultado"
                value={achievementInput}
                onChange={(e) => setAchievementInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAchievement();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addAchievement}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {achievements.length > 0 && (
              <ul className="space-y-2 mt-2">
                {achievements.map((achievement, index) => (
                  <li
                    key={index}
                    className="flex items-start justify-between bg-muted/50 p-2 rounded text-sm"
                  >
                    <span className="flex-1">{achievement}</span>
                    <X
                      className="h-4 w-4 cursor-pointer hover:text-destructive ml-2 flex-shrink-0"
                      onClick={() => removeAchievement(index)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {mode === "add" ? "Adicionar" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
