"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, FileDown, Eye, CheckCircle, XCircle, Clock } from "lucide-react"
import { useAuthStore } from "@/store/auth"

interface SelectionProcess {
  id: string
  candidate_id: string
  candidate_name: string | null
  candidate_email: string | null
  candidate_phone: string | null
  status: string
  typing_test_score: number | null
  typing_test_completed: boolean
  has_family_in_company: boolean
  was_previous_employee: boolean
  created_at: string
  updated_at: string
  notes: string | null
  personal_data: any
  availability_schedule: any
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "outline" },
  form_completed: { label: "Formulário Completo", variant: "secondary" },
  test_scheduled: { label: "Teste Agendado", variant: "default" },
  test_in_progress: { label: "Teste em Andamento", variant: "default" },
  test_completed: { label: "Teste Concluído", variant: "default" },
  approved: { label: "Aprovado", variant: "default" },
  rejected: { label: "Rejeitado", variant: "destructive" },
  cancelled: { label: "Cancelado", variant: "outline" },
}

export default function SelecaoPage() {
  const [processes, setProcesses] = useState<SelectionProcess[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedProcess, setSelectedProcess] = useState<SelectionProcess | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Get token from auth store
  const { token, _hasHydrated } = useAuthStore()

  // Pagination
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const pageSize = 50

  // Helper to get auth headers
  const getAuthHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
    return headers
  }, [token])

  const loadProcesses = useCallback(async () => {
    if (!token) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString(),
      })

      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      if (searchTerm) {
        params.append("search", searchTerm)
      }

      const response = await fetch(`/api/v1/selection/processes?${params.toString()}`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || "Erro ao carregar processos seletivos")
      }

      const data = await response.json()
      setProcesses(data.items)
      setTotal(data.total)
      setPages(data.pages)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, searchTerm, token, getAuthHeaders])

  useEffect(() => {
    if (_hasHydrated && token) {
      loadProcesses()
    }
  }, [_hasHydrated, token, loadProcesses])

  const updateProcessStatus = async (processId: string, newStatus: string, notes?: string) => {
    try {
      const response = await fetch(`/api/v1/selection/processes/${processId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: newStatus,
          notes: notes,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || "Erro ao atualizar processo")
      }

      loadProcesses()
      setIsDetailsOpen(false)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const exportToExcel = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      const response = await fetch(`/api/v1/selection/export/excel?${params.toString()}`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || "Erro ao exportar dados")
      }

      // Download file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `processos_seletivos_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const viewDetails = (process: SelectionProcess) => {
    setSelectedProcess(process)
    setIsDetailsOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getAvailabilityText = (schedule: any) => {
    if (!schedule) return "Não informado"

    // Handle new format with shifts array
    if (schedule.shifts && Array.isArray(schedule.shifts)) {
      return schedule.shifts.length > 0 ? schedule.shifts.join(", ") : "Não informado"
    }

    // Handle old format with boolean fields
    const shifts = []
    if (schedule.morning) shifts.push("Manhã")
    if (schedule.afternoon) shifts.push("Tarde")
    if (schedule.evening) shifts.push("Noite")
    if (schedule.night) shifts.push("Madrugada")
    if (schedule.weekends) shifts.push("Finais de semana")

    return shifts.length > 0 ? shifts.join(", ") : "Não informado"
  }

  // Show loading while hydrating
  if (!_hasHydrated) {
    return (
      <div className="container mx-auto py-6">
        <p className="text-center py-8">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Processos Seletivos</h1>
          <p className="text-muted-foreground">
            Gerencie candidatos e acompanhe os processos de seleção
          </p>
        </div>
        <Button onClick={exportToExcel} disabled={loading}>
          <FileDown className="mr-2 h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="form_completed">Formulário Completo</SelectItem>
                  <SelectItem value="test_completed">Teste Concluído</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Candidatos ({total})</CardTitle>
          <CardDescription>
            Lista de todos os candidatos no processo seletivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <p className="text-center py-8">Carregando...</p>
          ) : processes.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Nenhum processo seletivo encontrado
            </p>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidato</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Teste</TableHead>
                      <TableHead className="text-center">Familiar</TableHead>
                      <TableHead className="text-center">Ex-Func.</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processes.map((process) => (
                      <TableRow key={process.id}>
                        <TableCell className="font-medium">
                          {process.candidate_name || "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div>{process.candidate_email}</div>
                            <div className="text-muted-foreground">
                              {process.candidate_phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusMap[process.status]?.variant || "outline"}>
                            {statusMap[process.status]?.label || process.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {process.typing_test_completed ? (
                            <div className="space-y-1">
                              <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                              <div className="text-xs font-medium">
                                {process.typing_test_score?.toFixed(0)} WPM
                              </div>
                            </div>
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-500 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {process.has_family_in_company ? (
                            <CheckCircle className="h-5 w-5 text-blue-500 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {process.was_previous_employee ? (
                            <CheckCircle className="h-5 w-5 text-blue-500 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(process.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewDetails(process)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {page} de {pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === pages}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Candidato</DialogTitle>
            <DialogDescription>
              Informações completas do processo seletivo
            </DialogDescription>
          </DialogHeader>

          {selectedProcess && (
            <div className="space-y-6">
              {/* Candidate Info */}
              <div className="space-y-3">
                <h3 className="font-semibold">Informações do Candidato</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nome:</span>
                    <p className="font-medium">{selectedProcess.candidate_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{selectedProcess.candidate_email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Telefone:</span>
                    <p className="font-medium">{selectedProcess.candidate_phone}</p>
                  </div>
                  {selectedProcess.personal_data?.cpf && (
                    <div>
                      <span className="text-muted-foreground">CPF:</span>
                      <p className="font-medium">
                        {selectedProcess.personal_data.cpf_formatted || selectedProcess.personal_data.cpf}
                      </p>
                    </div>
                  )}
                  {selectedProcess.personal_data?.cidade && (
                    <div>
                      <span className="text-muted-foreground">Cidade:</span>
                      <p className="font-medium">
                        {selectedProcess.personal_data.cidade}
                        {selectedProcess.personal_data.estado && ` - ${selectedProcess.personal_data.estado}`}
                      </p>
                    </div>
                  )}
                  {selectedProcess.personal_data?.bairro && (
                    <div>
                      <span className="text-muted-foreground">Bairro:</span>
                      <p className="font-medium">{selectedProcess.personal_data.bairro}</p>
                    </div>
                  )}
                  {selectedProcess.personal_data?.vaga && (
                    <div>
                      <span className="text-muted-foreground">Vaga:</span>
                      <p className="font-medium">{selectedProcess.personal_data.vaga}</p>
                    </div>
                  )}
                  {selectedProcess.personal_data?.empresa && (
                    <div>
                      <span className="text-muted-foreground">Empresa:</span>
                      <p className="font-medium">{selectedProcess.personal_data.empresa}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-3">
                <h3 className="font-semibold">Disponibilidade de Horário</h3>
                <p className="text-sm">{getAvailabilityText(selectedProcess.availability_schedule)}</p>
                {selectedProcess.availability_schedule?.uses_company_transport && (
                  <p className="text-sm text-muted-foreground">Utiliza transporte da empresa</p>
                )}
              </div>

              {/* Family & Previous Employment */}
              {selectedProcess.has_family_in_company && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Familiar na Empresa</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedProcess.personal_data?.family_details || selectedProcess.notes || "Não informado"}
                  </p>
                </div>
              )}

              {selectedProcess.was_previous_employee && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Ex-Funcionário</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedProcess.personal_data?.previous_employment_details || "Não informado"}
                  </p>
                </div>
              )}

              {/* Typing Test */}
              {selectedProcess.typing_test_completed && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Resultado do Teste de Digitação</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-2xl font-bold">
                      {selectedProcess.typing_test_score?.toFixed(0)} WPM
                    </p>
                    <p className="text-sm text-muted-foreground">Palavras por minuto</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Observações da Analista</Label>
                <Textarea
                  id="notes"
                  defaultValue={selectedProcess.notes || ""}
                  rows={4}
                  placeholder="Adicione observações sobre o candidato..."
                />
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Label>Alterar Status</Label>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    onClick={() => updateProcessStatus(selectedProcess.id, "approved")}
                  >
                    Aprovar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => updateProcessStatus(selectedProcess.id, "rejected")}
                  >
                    Rejeitar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailsOpen(false)}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
