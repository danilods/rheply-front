"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X, Save, Send } from "lucide-react";

const jobFormSchema = z.object({
  title: z.string().min(3, "Titulo deve ter pelo menos 3 caracteres"),
  department: z.string().min(1, "Selecione um departamento"),
  location: z.string().min(2, "Localizacao e obrigatoria"),
  employmentType: z.string().min(1, "Selecione o tipo de contrato"),
  salaryMin: z.coerce.number().min(0, "Salario minimo deve ser positivo"),
  salaryMax: z.coerce.number().min(0, "Salario maximo deve ser positivo"),
  description: z.string().min(50, "Descricao deve ter pelo menos 50 caracteres"),
  requirements: z.array(z.string()).min(1, "Adicione pelo menos um requisito"),
  skills: z.array(z.string()).min(1, "Adicione pelo menos uma habilidade"),
});

type JobFormData = z.infer<typeof jobFormSchema>;

const departments = [
  "Atendimento",
  "Administrativo",
  "Comercial",
  "Financeiro",
  "Recursos Humanos",
  "TI",
  "Operacoes",
];

const employmentTypes = ["CLT", "Temporario", "PJ", "Estagio"];

export default function CreateJobPage() {
  const router = useRouter();
  const [requirements, setRequirements] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      department: "",
      location: "",
      employmentType: "",
      salaryMin: 0,
      salaryMax: 0,
      description: "",
      requirements: [],
      skills: [],
    },
  });

  const addRequirement = () => {
    if (newRequirement.trim()) {
      const updated = [...requirements, newRequirement.trim()];
      setRequirements(updated);
      setValue("requirements", updated);
      setNewRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    const updated = requirements.filter((_, i) => i !== index);
    setRequirements(updated);
    setValue("requirements", updated);
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updated = [...skills, newSkill.trim()];
      setSkills(updated);
      setValue("skills", updated);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    const updated = skills.filter((s) => s !== skill);
    setSkills(updated);
    setValue("skills", updated);
  };

  const onSubmit = async (data: JobFormData, isDraft: boolean = false) => {
    setIsSubmitting(true);
    try {
      console.log("Submitting job:", { ...data, status: isDraft ? "draft" : "open" });
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/jobs");
    } catch (error) {
      console.error("Error creating job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Vagas
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Criar Nova Vaga</h1>
          <p className="text-muted-foreground">
            Preencha os detalhes para criar uma nova vaga
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit((data) => onSubmit(data, false))}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informacoes Basicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titulo da Vaga *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Operador de Call Center"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento *</Label>
                    <Select
                      onValueChange={(value) => setValue("department", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.department && (
                      <p className="text-sm text-destructive">
                        {errors.department.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employmentType">Tipo de Contrato *</Label>
                    <Select
                      onValueChange={(value) => setValue("employmentType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {employmentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.employmentType && (
                      <p className="text-sm text-destructive">
                        {errors.employmentType.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Localizacao *</Label>
                  <Input
                    id="location"
                    placeholder="Ex: Remoto, Sao Paulo, SP"
                    {...register("location")}
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive">
                      {errors.location.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Salario Minimo (R$) *</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      placeholder="1800"
                      {...register("salaryMin")}
                    />
                    {errors.salaryMin && (
                      <p className="text-sm text-destructive">
                        {errors.salaryMin.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Salario Maximo (R$) *</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      placeholder="3500"
                      {...register("salaryMax")}
                    />
                    {errors.salaryMax && (
                      <p className="text-sm text-destructive">
                        {errors.salaryMax.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Descricao */}
            <Card>
              <CardHeader>
                <CardTitle>Descricao da Vaga</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="description">Descricao *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva a funcao, responsabilidades e o que torna esta oportunidade atraente..."
                    className="min-h-[200px]"
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Requisitos */}
            <Card>
              <CardHeader>
                <CardTitle>Requisitos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar requisito"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addRequirement();
                      }
                    }}
                  />
                  <Button type="button" onClick={addRequirement} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.requirements && (
                  <p className="text-sm text-destructive">
                    {errors.requirements.message}
                  </p>
                )}
                {requirements.length > 0 && (
                  <ul className="space-y-2">
                    {requirements.map((req, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between rounded-md border bg-muted/50 p-3"
                      >
                        <span className="text-sm">{req}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeRequirement(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Habilidades */}
            <Card>
              <CardHeader>
                <CardTitle>Habilidades Requeridas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar habilidade"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <Button type="button" onClick={addSkill} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.skills && (
                  <p className="text-sm text-destructive">
                    {errors.skills.message}
                  </p>
                )}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeSkill(skill)}
                      >
                        {skill}
                        <X className="ml-1 h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Acoes */}
            <Card>
              <CardHeader>
                <CardTitle>Acoes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Publicando..." : "Publicar Vaga"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isSubmitting}
                  onClick={handleSubmit((data) => onSubmit(data, true))}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Rascunho
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Visualizacao</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Titulo:</span>{" "}
                    {watch("title") || "Nao definido"}
                  </div>
                  <div>
                    <span className="font-medium">Departamento:</span>{" "}
                    {watch("department") || "Nao definido"}
                  </div>
                  <div>
                    <span className="font-medium">Localizacao:</span>{" "}
                    {watch("location") || "Nao definido"}
                  </div>
                  <div>
                    <span className="font-medium">Tipo:</span>{" "}
                    {watch("employmentType") || "Nao definido"}
                  </div>
                  <div>
                    <span className="font-medium">Salario:</span>{" "}
                    {watch("salaryMin") && watch("salaryMax")
                      ? `R$ ${watch("salaryMin").toLocaleString()} - R$ ${watch("salaryMax").toLocaleString()}`
                      : "Nao definido"}
                  </div>
                  <div>
                    <span className="font-medium">Requisitos:</span>{" "}
                    {requirements.length}
                  </div>
                  <div>
                    <span className="font-medium">Habilidades:</span> {skills.length}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
