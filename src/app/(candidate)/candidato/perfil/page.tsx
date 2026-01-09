"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfileCompletion } from "@/components/candidate/profile-completion";
import { ExperienceForm } from "@/components/candidate/experience-form";
import { SkillInput } from "@/components/candidate/skill-input";
import { DownloadCVButton } from "@/components/candidate/download-cv-button";
import { useCandidateStore, Experience, Education, Language, Certification, Project } from "@/store/candidate";
import {
  Edit,
  Plus,
  Trash2,
  Linkedin,
  Upload,
  Camera,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Award,
  Code,
  Languages,
  Eye,
  EyeOff,
} from "lucide-react";

export default function ProfilePage() {
  const {
    profile,
    experiences,
    education,
    skills,
    languages,
    certifications,
    projects,
    setProfile,
    updateProfile,
    toggleProfileVisibility,
    addExperience,
    updateExperience,
    deleteExperience,
    addEducation,
    deleteEducation,
    addSkill,
    updateSkillProficiency,
    deleteSkill,
    addLanguage,
    deleteLanguage,
    addCertification,
    deleteCertification,
    addProject,
    deleteProject,
  } = useCandidateStore();

  const [isClient, setIsClient] = useState(false);
  const [isExperienceFormOpen, setIsExperienceFormOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddEducationOpen, setIsAddEducationOpen] = useState(false);
  const [isAddLanguageOpen, setIsAddLanguageOpen] = useState(false);
  const [isAddCertificationOpen, setIsAddCertificationOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    headline: "",
    location: "",
    phone: "",
    summary: "",
  });

  const [educationForm, setEducationForm] = useState({
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    description: "",
  });

  const [languageForm, setLanguageForm] = useState({
    name: "",
    proficiency: "basico" as Language["proficiency"],
  });

  const [certificationForm, setCertificationForm] = useState({
    name: "",
    issuer: "",
    issueDate: "",
    expiryDate: "",
    credentialUrl: "",
  });

  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    url: "",
    technologies: "",
  });

  useEffect(() => {
    setIsClient(true);

    // Initialize with demo data if empty
    if (!profile) {
      setProfile({
        id: "demo-user",
        firstName: "Maria",
        lastName: "Silva",
        email: "maria.silva@email.com",
        phone: "(11) 99999-9999",
        headline: "Desenvolvedora Full Stack",
        location: "Sao Paulo, SP",
        avatar: "",
        summary:
          "Desenvolvedora apaixonada por criar solucoes web modernas e eficientes. Com mais de 5 anos de experiencia em desenvolvimento full stack, tenho expertise em React, Node.js e arquiteturas cloud. Focada em entregar produtos de alta qualidade que resolvem problemas reais.",
        isProfileVisible: true,
        linkedInConnected: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [profile, setProfile]);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        headline: profile.headline || "",
        location: profile.location || "",
        phone: profile.phone || "",
        summary: profile.summary || "",
      });
    }
  }, [profile]);

  const handleSaveProfile = () => {
    updateProfile(profileForm);
    setIsEditingProfile(false);
  };

  const handleAddEducation = () => {
    const newEducation: Education = {
      id: crypto.randomUUID(),
      institution: educationForm.institution,
      degree: educationForm.degree,
      fieldOfStudy: educationForm.fieldOfStudy,
      startDate: educationForm.startDate,
      endDate: educationForm.isCurrent ? undefined : educationForm.endDate,
      isCurrent: educationForm.isCurrent,
      description: educationForm.description,
    };
    addEducation(newEducation);
    setEducationForm({
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
    });
    setIsAddEducationOpen(false);
  };

  const handleAddLanguage = () => {
    const newLanguage: Language = {
      id: crypto.randomUUID(),
      name: languageForm.name,
      proficiency: languageForm.proficiency,
    };
    addLanguage(newLanguage);
    setLanguageForm({ name: "", proficiency: "basico" });
    setIsAddLanguageOpen(false);
  };

  const handleAddCertification = () => {
    const newCertification: Certification = {
      id: crypto.randomUUID(),
      name: certificationForm.name,
      issuer: certificationForm.issuer,
      issueDate: certificationForm.issueDate,
      expiryDate: certificationForm.expiryDate || undefined,
      credentialUrl: certificationForm.credentialUrl || undefined,
    };
    addCertification(newCertification);
    setCertificationForm({
      name: "",
      issuer: "",
      issueDate: "",
      expiryDate: "",
      credentialUrl: "",
    });
    setIsAddCertificationOpen(false);
  };

  const handleAddProject = () => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: projectForm.name,
      description: projectForm.description,
      url: projectForm.url || undefined,
      technologies: projectForm.technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    addProject(newProject);
    setProjectForm({
      name: "",
      description: "",
      url: "",
      technologies: "",
    });
    setIsAddProjectOpen(false);
  };

  const getProficiencyLabel = (proficiency: Language["proficiency"]) => {
    const labels = {
      basico: "Basico",
      intermediario: "Intermediario",
      avancado: "Avancado",
      fluente: "Fluente",
      nativo: "Nativo",
    };
    return labels[proficiency];
  };

  if (!isClient || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="flex-1">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="text-2xl">
                    {profile.firstName?.[0]}
                    {profile.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">
                      {profile.firstName} {profile.lastName}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      {profile.headline || "Adicione seu titulo profissional"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>

                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </span>
                  {profile.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {profile.phone}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <DownloadCVButton variant="default" size="sm" />
                  <Button variant="outline" size="sm">
                    <Linkedin className="h-4 w-4 mr-2" />
                    {profile.linkedInConnected
                      ? "LinkedIn Conectado"
                      : "Conectar LinkedIn"}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Atualizar CV
                  </Button>
                </div>
              </div>
            </div>

            {/* Privacy Toggle */}
            <div className="flex items-center justify-between mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                {profile.isProfileVisible ? (
                  <Eye className="h-5 w-5 text-green-500" />
                ) : (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">Perfil visivel para recrutadores</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.isProfileVisible
                      ? "Recrutadores podem encontrar seu perfil nas buscas"
                      : "Seu perfil esta oculto para recrutadores"}
                  </p>
                </div>
              </div>
              <Switch
                checked={profile.isProfileVisible}
                onCheckedChange={toggleProfileVisibility}
              />
            </div>
          </CardContent>
        </Card>

        <div className="w-full lg:w-80">
          <ProfileCompletion />
        </div>
      </div>

      {/* About Me */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Sobre Mim
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingProfile(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile.summary ? (
            <p className="text-muted-foreground leading-relaxed">
              {profile.summary}
            </p>
          ) : (
            <p className="text-muted-foreground italic">
              Adicione um resumo sobre voce e suas experiencias...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Professional Experiences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Experiencias Profissionais
            </span>
            <Button
              size="sm"
              onClick={() => {
                setEditingExperience(null);
                setIsExperienceFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {experiences.length > 0 ? (
            <div className="space-y-6">
              {experiences.map((exp, index) => (
                <div key={exp.id}>
                  {index > 0 && <Separator className="mb-6" />}
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{exp.title}</h4>
                      <p className="text-muted-foreground">{exp.company}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {exp.startDate} -{" "}
                          {exp.isCurrent ? "Presente" : exp.endDate}
                        </span>
                        {exp.location && (
                          <>
                            <span className="mx-2">|</span>
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{exp.location}</span>
                          </>
                        )}
                      </div>
                      <p className="mt-3 text-sm">{exp.description}</p>
                      {exp.achievements.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {exp.achievements.map((achievement, i) => (
                            <li
                              key={i}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <span className="text-primary">•</span>
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      )}
                      {exp.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {exp.skills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingExperience(exp);
                          setIsExperienceFormOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteExperience(exp.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma experiencia adicionada ainda.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Formacao Academica
            </span>
            <Button size="sm" onClick={() => setIsAddEducationOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {education.length > 0 ? (
            <div className="space-y-4">
              {education.map((edu) => (
                <div
                  key={edu.id}
                  className="flex justify-between p-4 bg-muted/30 rounded-lg"
                >
                  <div>
                    <h4 className="font-semibold">
                      {edu.degree} em {edu.fieldOfStudy}
                    </h4>
                    <p className="text-muted-foreground">{edu.institution}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {edu.startDate} - {edu.isCurrent ? "Presente" : edu.endDate}
                    </p>
                    {edu.description && (
                      <p className="text-sm mt-2">{edu.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteEducation(edu.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma formacao adicionada ainda.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Technical Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Habilidades Tecnicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SkillInput
            skills={skills}
            onAddSkill={addSkill}
            onUpdateSkillProficiency={updateSkillProficiency}
            onDeleteSkill={deleteSkill}
            suggestedSkills={["Docker", "Kubernetes", "AWS", "GraphQL", "Redis"]}
          />
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Idiomas
            </span>
            <Button size="sm" onClick={() => setIsAddLanguageOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {languages.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {languages.map((lang) => (
                <div
                  key={lang.id}
                  className="flex items-center gap-2 bg-secondary/50 rounded-lg px-4 py-2 group"
                >
                  <span className="font-medium">{lang.name}</span>
                  <Badge variant="outline">{getProficiencyLabel(lang.proficiency)}</Badge>
                  <button
                    onClick={() => deleteLanguage(lang.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum idioma adicionado ainda.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certificacoes
            </span>
            <Button size="sm" onClick={() => setIsAddCertificationOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {certifications.length > 0 ? (
            <div className="space-y-3">
              {certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="flex justify-between p-4 bg-muted/30 rounded-lg"
                >
                  <div>
                    <h4 className="font-semibold">{cert.name}</h4>
                    <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Emitido em: {cert.issueDate}
                    </p>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
                      >
                        Ver credencial
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCertification(cert.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma certificacao adicionada ainda.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Projects/Portfolio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Projetos / Portfolio
            </span>
            <Button size="sm" onClick={() => setIsAddProjectOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 bg-muted/30 rounded-lg group relative"
                >
                  <h4 className="font-semibold">{project.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {project.description}
                  </p>
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1 mt-3"
                    >
                      Ver projeto
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteProject(project.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum projeto adicionado ainda.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Experience Form Dialog */}
      <ExperienceForm
        open={isExperienceFormOpen}
        onOpenChange={setIsExperienceFormOpen}
        onSubmit={(exp) => {
          if (editingExperience) {
            updateExperience(editingExperience.id, exp);
          } else {
            addExperience(exp);
          }
        }}
        initialData={editingExperience || undefined}
        mode={editingExperience ? "edit" : "add"}
      />

      {/* Edit Profile Dialog */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Atualize suas informacoes pessoais.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  value={profileForm.firstName}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input
                  id="lastName"
                  value={profileForm.lastName}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="headline">Titulo Profissional</Label>
              <Input
                id="headline"
                value={profileForm.headline}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, headline: e.target.value }))
                }
                placeholder="Ex: Desenvolvedor Full Stack Senior"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localizacao</Label>
              <Input
                id="location"
                value={profileForm.location}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="Ex: Sao Paulo, SP"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={profileForm.phone}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Resumo Profissional</Label>
              <Textarea
                id="summary"
                value={profileForm.summary}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, summary: e.target.value }))
                }
                rows={5}
                placeholder="Conte sobre sua trajetoria profissional..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveProfile}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Education Dialog */}
      <Dialog open={isAddEducationOpen} onOpenChange={setIsAddEducationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Formacao</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Instituicao</Label>
              <Input
                value={educationForm.institution}
                onChange={(e) =>
                  setEducationForm((prev) => ({
                    ...prev,
                    institution: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Grau</Label>
              <Input
                value={educationForm.degree}
                onChange={(e) =>
                  setEducationForm((prev) => ({ ...prev, degree: e.target.value }))
                }
                placeholder="Ex: Bacharelado, Mestrado, MBA"
              />
            </div>
            <div className="space-y-2">
              <Label>Area de Estudo</Label>
              <Input
                value={educationForm.fieldOfStudy}
                onChange={(e) =>
                  setEducationForm((prev) => ({
                    ...prev,
                    fieldOfStudy: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Inicio</Label>
                <Input
                  type="month"
                  value={educationForm.startDate}
                  onChange={(e) =>
                    setEducationForm((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Termino</Label>
                <Input
                  type="month"
                  value={educationForm.endDate}
                  onChange={(e) =>
                    setEducationForm((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  disabled={educationForm.isCurrent}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEducationOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddEducation}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Language Dialog */}
      <Dialog open={isAddLanguageOpen} onOpenChange={setIsAddLanguageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Idioma</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Idioma</Label>
              <Input
                value={languageForm.name}
                onChange={(e) =>
                  setLanguageForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Ex: Ingles, Espanhol"
              />
            </div>
            <div className="space-y-2">
              <Label>Proficiencia</Label>
              <Select
                value={languageForm.proficiency}
                onValueChange={(value) =>
                  setLanguageForm((prev) => ({
                    ...prev,
                    proficiency: value as Language["proficiency"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basico">Basico</SelectItem>
                  <SelectItem value="intermediario">Intermediario</SelectItem>
                  <SelectItem value="avancado">Avancado</SelectItem>
                  <SelectItem value="fluente">Fluente</SelectItem>
                  <SelectItem value="nativo">Nativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddLanguageOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddLanguage}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Certification Dialog */}
      <Dialog
        open={isAddCertificationOpen}
        onOpenChange={setIsAddCertificationOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Certificacao</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Certificacao</Label>
              <Input
                value={certificationForm.name}
                onChange={(e) =>
                  setCertificationForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Emissor</Label>
              <Input
                value={certificationForm.issuer}
                onChange={(e) =>
                  setCertificationForm((prev) => ({
                    ...prev,
                    issuer: e.target.value,
                  }))
                }
                placeholder="Ex: AWS, Google, Microsoft"
              />
            </div>
            <div className="space-y-2">
              <Label>Data de Emissao</Label>
              <Input
                type="month"
                value={certificationForm.issueDate}
                onChange={(e) =>
                  setCertificationForm((prev) => ({
                    ...prev,
                    issueDate: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>URL da Credencial (opcional)</Label>
              <Input
                value={certificationForm.credentialUrl}
                onChange={(e) =>
                  setCertificationForm((prev) => ({
                    ...prev,
                    credentialUrl: e.target.value,
                  }))
                }
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddCertificationOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddCertification}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Project Dialog */}
      <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Projeto</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Projeto</Label>
              <Input
                value={projectForm.name}
                onChange={(e) =>
                  setProjectForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Descricao</Label>
              <Textarea
                value={projectForm.description}
                onChange={(e) =>
                  setProjectForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Tecnologias (separadas por virgula)</Label>
              <Input
                value={projectForm.technologies}
                onChange={(e) =>
                  setProjectForm((prev) => ({
                    ...prev,
                    technologies: e.target.value,
                  }))
                }
                placeholder="React, Node.js, PostgreSQL"
              />
            </div>
            <div className="space-y-2">
              <Label>URL do Projeto (opcional)</Label>
              <Input
                value={projectForm.url}
                onChange={(e) =>
                  setProjectForm((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddProjectOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddProject}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
