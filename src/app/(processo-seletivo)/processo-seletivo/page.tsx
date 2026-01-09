"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

export default function ProcessoSeletivoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    whatsapp_optin: true,
    cpf: "",
    rg: "",
    birth_date: "",
    address: {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zip_code: "",
    },
    availability_schedule: {
      morning: false,
      afternoon: false,
      evening: false,
      night: false,
      weekends: false,
    },
    has_family_in_company: false,
    family_details: "",
    was_previous_employee: false,
    previous_employment_details: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1]
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
      }))
    }
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    if (name.startsWith("availability_schedule.")) {
      const scheduleField = name.split(".")[1]
      setFormData(prev => ({
        ...prev,
        availability_schedule: {
          ...prev.availability_schedule,
          [scheduleField]: checked
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/v1/selection/public/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Erro ao enviar formulário")
      }

      // Redirect to typing test
      router.push(`/processo-seletivo/teste-digitacao/${data.selection_process_id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Processo Seletivo - Cadastro</CardTitle>
          <CardDescription>
            Preencha o formulário abaixo para iniciar seu processo seletivo.
            Após o cadastro, você será direcionado para o teste de digitação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados Pessoais</h3>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo *</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="João da Silva"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="joao@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(11) 98765-4321"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    name="rg"
                    value={formData.rg}
                    onChange={handleInputChange}
                    placeholder="00.000.000-0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth_date">Data de Nascimento</Label>
                  <Input
                    id="birth_date"
                    name="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whatsapp_optin"
                  checked={formData.whatsapp_optin}
                  onCheckedChange={(checked) => handleCheckboxChange("whatsapp_optin", checked as boolean)}
                />
                <Label htmlFor="whatsapp_optin" className="text-sm font-normal">
                  Aceito receber notificações via WhatsApp
                </Label>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Endereço</h3>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address.zip_code">CEP</Label>
                  <Input
                    id="address.zip_code"
                    name="address.zip_code"
                    value={formData.address.zip_code}
                    onChange={handleInputChange}
                    placeholder="00000-000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.street">Rua</Label>
                  <Input
                    id="address.street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.number">Número</Label>
                  <Input
                    id="address.number"
                    name="address.number"
                    value={formData.address.number}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.complement">Complemento</Label>
                  <Input
                    id="address.complement"
                    name="address.complement"
                    value={formData.address.complement}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.neighborhood">Bairro</Label>
                  <Input
                    id="address.neighborhood"
                    name="address.neighborhood"
                    value={formData.address.neighborhood}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.city">Cidade</Label>
                  <Input
                    id="address.city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.state">Estado</Label>
                  <Input
                    id="address.state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    placeholder="SP"
                  />
                </div>
              </div>
            </div>

            {/* Disponibilidade de Horário */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Disponibilidade de Horário</h3>
              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="morning"
                    checked={formData.availability_schedule.morning}
                    onCheckedChange={(checked) => handleCheckboxChange("availability_schedule.morning", checked as boolean)}
                  />
                  <Label htmlFor="morning" className="font-normal">Manhã</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="afternoon"
                    checked={formData.availability_schedule.afternoon}
                    onCheckedChange={(checked) => handleCheckboxChange("availability_schedule.afternoon", checked as boolean)}
                  />
                  <Label htmlFor="afternoon" className="font-normal">Tarde</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="evening"
                    checked={formData.availability_schedule.evening}
                    onCheckedChange={(checked) => handleCheckboxChange("availability_schedule.evening", checked as boolean)}
                  />
                  <Label htmlFor="evening" className="font-normal">Noite</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="night"
                    checked={formData.availability_schedule.night}
                    onCheckedChange={(checked) => handleCheckboxChange("availability_schedule.night", checked as boolean)}
                  />
                  <Label htmlFor="night" className="font-normal">Madrugada</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="weekends"
                    checked={formData.availability_schedule.weekends}
                    onCheckedChange={(checked) => handleCheckboxChange("availability_schedule.weekends", checked as boolean)}
                  />
                  <Label htmlFor="weekends" className="font-normal">Finais de Semana</Label>
                </div>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações Adicionais</h3>
              <Separator />

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_family_in_company"
                    checked={formData.has_family_in_company}
                    onCheckedChange={(checked) => handleCheckboxChange("has_family_in_company", checked as boolean)}
                  />
                  <Label htmlFor="has_family_in_company" className="font-normal">
                    Possui familiar trabalhando na empresa?
                  </Label>
                </div>

                {formData.has_family_in_company && (
                  <div className="space-y-2">
                    <Label htmlFor="family_details">Detalhes do Familiar</Label>
                    <Textarea
                      id="family_details"
                      name="family_details"
                      value={formData.family_details}
                      onChange={handleInputChange}
                      placeholder="Nome, grau de parentesco e setor do familiar"
                      rows={3}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="was_previous_employee"
                    checked={formData.was_previous_employee}
                    onCheckedChange={(checked) => handleCheckboxChange("was_previous_employee", checked as boolean)}
                  />
                  <Label htmlFor="was_previous_employee" className="font-normal">
                    Já foi funcionário(a) da empresa anteriormente?
                  </Label>
                </div>

                {formData.was_previous_employee && (
                  <div className="space-y-2">
                    <Label htmlFor="previous_employment_details">Detalhes do Emprego Anterior</Label>
                    <Textarea
                      id="previous_employment_details"
                      name="previous_employment_details"
                      value={formData.previous_employment_details}
                      onChange={handleInputChange}
                      placeholder="Cargo anterior, período de trabalho e motivo da saída"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enviando..." : "Continuar para o Teste de Digitação"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
