"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"

// Configuração da empresa - pode ser alterado para cada cliente
const EMPRESA_CONFIG = {
  nome: "RHeply",  // Nome genérico - será configurável por empresa
  vaga: "Atendente Call Center",
}
import {
  Loader2,
  Zap,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  MapPin,
  User,
  Phone,
  FileText,
  Clock,
  Users,
  Building,
  AlertTriangle,
  Search,
  X,
} from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { useLocalizacao } from "@/hooks/useLocalizacao"

interface FormData {
  cpf: string
  nomeCompleto: string
  telefone: string
  estado: string
  cidade: string
  bairro: string
  usaTransporte: string
  trabalhouGrupo: string
  trabalhouGrupoDetalhes: string
  possuiParente: string
  possuiParenteDetalhes: string
  disponibilidadeHorario: string[]
}

const HORARIOS = [
  { value: "manha", label: "Manhã", icon: "🌅" },
  { value: "tarde", label: "Tarde", icon: "☀️" },
  { value: "noite", label: "Noite", icon: "🌙" },
  { value: "madrugada", label: "Madrugada", icon: "🌃" },
]

// CPF mask function
function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, "")
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
}

// Phone mask function
function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, "")
  if (numbers.length <= 2) return numbers
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
}

// CPF validation
function validateCPF(cpf: string): boolean {
  const numbers = cpf.replace(/\D/g, "")
  if (numbers.length !== 11) return false
  if (/^(\d)\1+$/.test(numbers)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i)
  }
  let digit = (sum * 10) % 11
  if (digit === 10) digit = 0
  if (digit !== parseInt(numbers[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i)
  }
  digit = (sum * 10) % 11
  if (digit === 10) digit = 0
  if (digit !== parseInt(numbers[10])) return false

  return true
}

export default function AplicacaoRegistrationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cidadeSearch, setCidadeSearch] = useState("")
  const [showCidadeDropdown, setShowCidadeDropdown] = useState(false)
  const cidadeInputRef = useRef<HTMLInputElement>(null)
  const cidadeDropdownRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState<FormData>({
    cpf: "",
    nomeCompleto: "",
    telefone: "",
    estado: "",
    cidade: "",
    bairro: "",
    usaTransporte: "",
    trabalhouGrupo: "",
    trabalhouGrupoDetalhes: "",
    possuiParente: "",
    possuiParenteDetalhes: "",
    disponibilidadeHorario: [],
  })

  // Hook para carregar estados e cidades
  const {
    estados,
    cidades,
    loading: loadingCidades,
    estadoSelecionado,
    setEstado,
    setCidade,
  } = useLocalizacao()

  // Sincronizar estado do hook com formData
  useEffect(() => {
    if (estadoSelecionado !== formData.estado) {
      setFormData((prev) => ({ ...prev, estado: estadoSelecionado, cidade: "" }))
      setCidadeSearch("")
    }
  }, [estadoSelecionado, formData.estado])

  // Filtrar cidades baseado na busca
  const cidadesFiltradas = useMemo(() => {
    if (!cidadeSearch.trim()) return cidades
    const searchLower = cidadeSearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    return cidades.filter((cidade) => {
      const cidadeNorm = cidade.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      return cidadeNorm.includes(searchLower)
    })
  }, [cidades, cidadeSearch])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cidadeDropdownRef.current &&
        !cidadeDropdownRef.current.contains(event.target as Node) &&
        cidadeInputRef.current &&
        !cidadeInputRef.current.contains(event.target as Node)
      ) {
        setShowCidadeDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setFormData((prev) => ({ ...prev, cpf: formatted }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData((prev) => ({ ...prev, telefone: formatted }))
  }

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const uf = e.target.value
    setEstado(uf)
    setFormData((prev) => ({ ...prev, estado: uf, cidade: "" }))
  }

  const handleCidadeSelect = (cidadeNome: string) => {
    setCidade(cidadeNome)
    setFormData((prev) => ({ ...prev, cidade: cidadeNome }))
    setCidadeSearch(cidadeNome)
    setShowCidadeDropdown(false)
  }

  const handleCidadeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCidadeSearch(value)
    setShowCidadeDropdown(true)
    // Se limpar o campo, limpa a cidade selecionada
    if (!value.trim()) {
      setFormData((prev) => ({ ...prev, cidade: "" }))
    }
  }

  const clearCidade = () => {
    setCidadeSearch("")
    setFormData((prev) => ({ ...prev, cidade: "" }))
    cidadeInputRef.current?.focus()
  }

  const handleCheckboxChange = (value: string) => {
    setFormData((prev) => {
      const current = prev.disponibilidadeHorario
      if (current.includes(value)) {
        return { ...prev, disponibilidadeHorario: current.filter((v) => v !== value) }
      }
      return { ...prev, disponibilidadeHorario: [...current, value] }
    })
  }

  const validateForm = () => {
    if (!formData.cpf.trim()) return "CPF é obrigatório"
    if (!validateCPF(formData.cpf)) return "CPF inválido. Verifique os números digitados"
    if (!formData.nomeCompleto.trim()) return "Nome completo é obrigatório"
    if (formData.nomeCompleto.trim().split(" ").length < 2) return "Digite seu nome completo (nome e sobrenome)"
    if (!formData.estado) return "Selecione o estado"
    if (!formData.cidade) return "Selecione a cidade"
    if (!formData.bairro.trim()) return "Bairro é obrigatório"
    if (!formData.usaTransporte) return "Informe se utilizará o transporte da empresa"
    if (!formData.trabalhouGrupo) return "Informe se já trabalhou no Grupo"
    if (!formData.possuiParente) return "Informe se possui parentes na empresa"
    if (formData.disponibilidadeHorario.length === 0) return "Selecione pelo menos uma disponibilidade de horário"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    setLoading(true)
    setError(null)

    try {
      const registrationData = {
        ...formData,
        empresa: EMPRESA_CONFIG.nome,
        vaga: EMPRESA_CONFIG.vaga,
        dataRegistro: new Date().toISOString(),
      }

      const response = await fetch("/api/v1/selection/public/aplicacao/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || "Erro ao registrar candidato")
      }

      const data = await response.json()

      // Store the selection process ID for the typing test
      localStorage.setItem("aplicacao_selection_process_id", data.selection_process_id)
      localStorage.setItem("aplicacao_candidate_name", data.candidate_name)

      // Check if test was already completed
      if (data.test_completed) {
        router.push("/processo-seletivo/aplicacao/sucesso?already_done=true")
        return
      }

      // Redirect to typing test
      router.push(`/processo-seletivo/teste-digitacao/${data.selection_process_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar cadastro. Tente novamente.")
      window.scrollTo({ top: 0, behavior: "smooth" })
    } finally {
      setLoading(false)
    }
  }

  // Calculate form progress
  const calculateProgress = () => {
    let filled = 0
    const total = 8
    if (formData.cpf && validateCPF(formData.cpf)) filled++
    if (formData.nomeCompleto.trim().split(" ").length >= 2) filled++
    if (formData.estado && formData.cidade) filled++
    if (formData.bairro.trim()) filled++
    if (formData.usaTransporte) filled++
    if (formData.trabalhouGrupo) filled++
    if (formData.possuiParente) filled++
    if (formData.disponibilidadeHorario.length > 0) filled++
    return Math.round((filled / total) * 100)
  }

  const progress = calculateProgress()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={36} showText={false} />
            <div>
              <h1 className="text-lg font-bold text-white">Processo Seletivo</h1>
              <p className="text-sm text-slate-400">{EMPRESA_CONFIG.nome}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-full">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium hidden sm:inline">{EMPRESA_CONFIG.vaga}</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Form Card */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-amber-500/10 px-6 py-6 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Formulário de Cadastro</h2>
                <p className="text-slate-400 text-sm">
                  Preencha seus dados para iniciar o teste de digitação
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-teal-400">{progress}%</div>
                <div className="text-xs text-slate-500">completo</div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 animate-shake">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Erro no formulário</p>
                  <p className="text-sm mt-1 text-red-400/80">{error}</p>
                </div>
              </div>
            )}

            {/* Section: Identificação */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <User className="h-5 w-5 text-teal-400" />
                <span>Identificação</span>
              </div>

              {/* CPF */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  CPF <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  maxLength={14}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="000.000.000-00"
                />
                {formData.cpf && !validateCPF(formData.cpf) && formData.cpf.length === 14 && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> CPF inválido
                  </p>
                )}
                {formData.cpf && validateCPF(formData.cpf) && (
                  <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> CPF válido
                  </p>
                )}
              </div>

              {/* Nome Completo */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome Completo <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="nomeCompleto"
                  value={formData.nomeCompleto}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Digite seu nome completo"
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Telefone/WhatsApp
                </label>
                <input
                  type="text"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handlePhoneChange}
                  maxLength={15}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            {/* Section: Localização */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <MapPin className="h-5 w-5 text-teal-400" />
                <span>Localização</span>
              </div>

              {/* Estado e Cidade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Estado (UF) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleEstadoChange}
                      className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none cursor-pointer transition-all"
                    >
                      <option value="" className="bg-slate-900">Selecione...</option>
                      {estados.map((estado) => (
                        <option key={estado.sigla} value={estado.sigla} className="bg-slate-900">
                          {estado.nome} ({estado.sigla})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Cidade <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
                    <input
                      ref={cidadeInputRef}
                      type="text"
                      value={cidadeSearch}
                      onChange={handleCidadeInputChange}
                      onFocus={() => formData.estado && setShowCidadeDropdown(true)}
                      disabled={!formData.estado || loadingCidades}
                      placeholder={
                        loadingCidades
                          ? "Carregando..."
                          : !formData.estado
                          ? "Selecione o estado primeiro"
                          : "Digite para buscar..."
                      }
                      className="w-full pl-11 pr-10 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    />
                    {loadingCidades ? (
                      <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-teal-500 animate-spin" />
                    ) : cidadeSearch && formData.estado ? (
                      <button
                        type="button"
                        onClick={clearCidade}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    ) : null}

                    {/* Dropdown de cidades */}
                    {showCidadeDropdown && formData.estado && !loadingCidades && (
                      <div
                        ref={cidadeDropdownRef}
                        className="absolute z-50 w-full mt-2 max-h-60 overflow-auto bg-slate-900 border border-slate-700 rounded-xl shadow-xl"
                      >
                        {cidadesFiltradas.length === 0 ? (
                          <div className="px-4 py-3 text-slate-400 text-sm">
                            Nenhuma cidade encontrada
                          </div>
                        ) : (
                          cidadesFiltradas.slice(0, 50).map((cidade) => (
                            <button
                              key={cidade.id}
                              type="button"
                              onClick={() => handleCidadeSelect(cidade.nome)}
                              className={`w-full px-4 py-3 text-left hover:bg-teal-500/10 transition-colors ${
                                formData.cidade === cidade.nome
                                  ? "bg-teal-500/10 text-teal-400"
                                  : "text-slate-300"
                              }`}
                            >
                              {cidade.nome}
                            </button>
                          ))
                        )}
                        {cidadesFiltradas.length > 50 && (
                          <div className="px-4 py-2 text-xs text-slate-500 border-t border-slate-800">
                            Digite mais para refinar a busca...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {formData.cidade && (
                    <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> {formData.cidade} selecionada
                    </p>
                  )}
                </div>
              </div>

              {/* Bairro */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bairro <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Digite seu bairro"
                />
              </div>
            </div>

            {/* Section: Transporte */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <Building className="h-5 w-5 text-teal-400" />
                <span>Transporte</span>
              </div>

              <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Vai utilizar o serviço de transporte da empresa (Van noturna)? <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-4">
                  {["sim", "nao"].map((option) => (
                    <label
                      key={option}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                        formData.usaTransporte === option
                          ? "bg-teal-500/10 border-teal-500 text-teal-400"
                          : "bg-slate-950/50 border-slate-700 text-slate-300 hover:border-slate-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="usaTransporte"
                        value={option}
                        checked={formData.usaTransporte === option}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      {option === "sim" ? "Sim" : "Não"}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Section: Histórico */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <FileText className="h-5 w-5 text-teal-400" />
                <span>Histórico</span>
              </div>

              {/* Trabalhou no Grupo */}
              <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Você já trabalhou em alguma empresa do Grupo e/ou em uma empresa parceira antes? <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-4 mb-3">
                  {["sim", "nao"].map((option) => (
                    <label
                      key={option}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                        formData.trabalhouGrupo === option
                          ? "bg-teal-500/10 border-teal-500 text-teal-400"
                          : "bg-slate-950/50 border-slate-700 text-slate-300 hover:border-slate-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="trabalhouGrupo"
                        value={option}
                        checked={formData.trabalhouGrupo === option}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      {option === "sim" ? "Sim" : "Não"}
                    </label>
                  ))}
                </div>
                {formData.trabalhouGrupo === "sim" && (
                  <textarea
                    name="trabalhouGrupoDetalhes"
                    value={formData.trabalhouGrupoDetalhes}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none transition-all"
                    rows={2}
                    placeholder="Informe qual empresa e período"
                  />
                )}
              </div>

              {/* Possui Parente */}
              <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  Você possui parente(s) trabalhando nesta empresa? <span className="text-red-400">*</span>
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  (cônjuge, companheiro(a), pais, filhos, irmãos, avós, netos, tios, sobrinhos, primos, sogros, cunhados)
                </p>
                <div className="flex gap-4 mb-3">
                  {["sim", "nao"].map((option) => (
                    <label
                      key={option}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                        formData.possuiParente === option
                          ? "bg-teal-500/10 border-teal-500 text-teal-400"
                          : "bg-slate-950/50 border-slate-700 text-slate-300 hover:border-slate-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="possuiParente"
                        value={option}
                        checked={formData.possuiParente === option}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      {option === "sim" ? "Sim" : "Não"}
                    </label>
                  ))}
                </div>
                {formData.possuiParente === "sim" && (
                  <textarea
                    name="possuiParenteDetalhes"
                    value={formData.possuiParenteDetalhes}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none transition-all"
                    rows={2}
                    placeholder="Informe o nome e grau de parentesco"
                  />
                )}
              </div>
            </div>

            {/* Section: Disponibilidade */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <Clock className="h-5 w-5 text-teal-400" />
                <span>Disponibilidade de Horário</span>
                <span className="text-red-400">*</span>
              </div>

              {/* Instrução clara para seleção múltipla */}
              <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <AlertCircle className="h-4 w-4 text-blue-400 shrink-0" />
                <p className="text-sm text-blue-300">
                  <strong>Você pode marcar mais de uma opção!</strong> Selecione todos os horários em que você tem disponibilidade.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {HORARIOS.map((horario) => {
                  const isSelected = formData.disponibilidadeHorario.includes(horario.value)
                  return (
                    <label
                      key={horario.value}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-teal-500/10 border-teal-500 text-teal-400 shadow-lg shadow-teal-500/10"
                          : "bg-slate-950/50 border-slate-700 text-slate-300 hover:border-slate-600"
                      }`}
                    >
                      {/* Checkbox visual */}
                      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? "bg-teal-500 border-teal-500"
                          : "border-slate-500 bg-slate-900"
                      }`}>
                        {isSelected && (
                          <CheckCircle className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCheckboxChange(horario.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">{horario.icon}</span>
                        <span className="font-medium">{horario.label}</span>
                      </div>
                    </label>
                  )
                })}
              </div>

              {formData.disponibilidadeHorario.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-teal-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>{formData.disponibilidadeHorario.length} turno(s) selecionado(s)</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || progress < 100}
                className="w-full py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-700 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Continuar para o Teste de Digitação
                  </>
                )}
              </button>
              {progress < 100 && (
                <p className="text-center text-xs text-slate-500 mt-2">
                  Preencha todos os campos obrigatórios para continuar
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-slate-500 text-sm">
          <p>Ao prosseguir, você concorda com os termos do processo seletivo.</p>
          <p className="mt-1">Em caso de dúvidas, entre em contato com o RH.</p>
        </div>
      </main>
    </div>
  )
}
