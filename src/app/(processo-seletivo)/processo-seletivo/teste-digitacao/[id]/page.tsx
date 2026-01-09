"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Timer, CheckCircle, RefreshCcw, AlertTriangle, Loader2 } from "lucide-react"
import { Logo } from "@/components/brand/logo"

const MAX_TIME = 300 // 5 minutes max

interface ProcessStatus {
  id: string
  status: string
  candidate_name: string | null
  typing_test_completed: boolean
  typing_test_score: number | null
  personal_data: {
    empresa?: string
    vaga?: string
    cidade?: string
    bairro?: string
  } | null
}

// Check if ID is a UUID (real process) vs special strings
const isUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

export default function TypingTestPage() {
  const params = useParams()
  const router = useRouter()
  const selectionProcessId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testText, setTestText] = useState("")
  const [userInput, setUserInput] = useState("")
  const [timeLeft, setTimeLeft] = useState(MAX_TIME)
  const [isActive, setIsActive] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [results, setResults] = useState({ wpm: 0, accuracy: 0, chars: 0, time: 0 })
  const [submitting, setSubmitting] = useState(false)
  const [processStatus, setProcessStatus] = useState<ProcessStatus | null>(null)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isDemo = selectionProcessId === "demo" || selectionProcessId === "demo-id"
  const isRealProcess = isUUID(selectionProcessId)
  const isAplicacaoLegacy = selectionProcessId === "aplicacao"

  // Load process status from API for real UUIDs
  useEffect(() => {
    const loadProcessStatus = async () => {
      if (!isRealProcess) return

      try {
        const response = await fetch(`/api/v1/selection/public/aplicacao/${selectionProcessId}/status`)
        if (response.ok) {
          const data = await response.json()
          setProcessStatus(data)

          // PILOTO: Verificacao de teste completado desativada para permitir retentativas
          // TODO: Reativar apos piloto
          // if (data.typing_test_completed) {
          //   setAlreadySubmitted(true)
          //   setError("Este teste já foi enviado anteriormente. Não é possível refazer.")
          // }
        }
      } catch (e) {
        console.error("Error loading process status:", e)
      }
    }

    loadProcessStatus()
  }, [selectionProcessId, isRealProcess])

  // Load test text on mount
  useEffect(() => {
    loadTestText()
  }, [selectionProcessId])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0 && isActive) {
      finishTest()
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft])

  const loadTestText = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/v1/selection/public/typing-test/${selectionProcessId}/text`
      )

      if (!response.ok) {
        throw new Error("Erro ao carregar texto do teste")
      }

      const data = await response.json()
      setTestText(data.text_sample)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  const startTest = () => {
    setIsActive(true)
    if (inputRef.current) inputRef.current.focus()
  }

  const calculateResults = () => {
    const timeElapsed = MAX_TIME - timeLeft
    const timeInMinutes = timeElapsed / 60
    const words = userInput.trim().length / 5 // Standard WPM calculation
    const wpm = timeInMinutes > 0 ? Math.round(words / timeInMinutes) : 0

    // Accuracy
    let correctChars = 0
    const minLength = Math.min(userInput.length, testText.length)
    for (let i = 0; i < minLength; i++) {
      if (userInput[i] === testText[i]) correctChars++
    }
    const accuracy =
      userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 100

    return { wpm, accuracy, chars: userInput.length, time: timeElapsed }
  }

  const finishTest = () => {
    setIsActive(false)
    setIsFinished(true)
    setResults(calculateResults())
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isActive && !isFinished) startTest()
    if (isFinished) return

    setUserInput(e.target.value)

    // Auto-finish if text matches perfectly
    if (e.target.value === testText) {
      finishTest()
    }
  }

  const renderText = () => {
    return testText.split("").map((char, index) => {
      let colorClass = "text-slate-500"
      if (index < userInput.length) {
        colorClass =
          userInput[index] === char
            ? "text-emerald-400"
            : "text-red-400 bg-red-900/20"
      }
      return (
        <span key={index} className={`${colorClass} transition-colors duration-75`}>
          {char}
        </span>
      )
    })
  }

  const handleSubmitResults = async () => {
    setSubmitting(true)
    try {
      // For demo mode, just show success
      if (isDemo) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        alert("Teste enviado com sucesso! Entraremos em contato.")
        router.push("/")
        return
      }

      // For real process IDs (UUIDs from database)
      if (isRealProcess) {
        const response = await fetch(
          `/api/v1/selection/public/aplicacao/${selectionProcessId}/submit-test`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              typed_text: userInput,
              duration_seconds: results.time,
              wpm: results.wpm,
              accuracy: results.accuracy,
              chars_typed: results.chars,
            }),
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || "Erro ao enviar teste")
        }

        // Clean up localStorage
        localStorage.removeItem("aplicacao_selection_process_id")
        localStorage.removeItem("aplicacao_candidate_name")

        router.push("/processo-seletivo/aplicacao/sucesso")
        return
      }

      // Legacy aplicacao flow (deprecated)
      if (isAplicacaoLegacy) {
        alert("Fluxo legado. Por favor, faça o cadastro novamente.")
        router.push("/processo-seletivo/aplicacao")
        return
      }

      // Generic selection process flow
      const response = await fetch(
        `/api/v1/selection/public/typing-test/${selectionProcessId}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            typed_text: userInput,
            duration_seconds: results.time,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Erro ao enviar teste")
      }

      alert("Teste enviado com sucesso! Entraremos em contato.")
      router.push("/")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao enviar. Por favor, tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetry = () => {
    setUserInput("")
    setTimeLeft(MAX_TIME)
    setIsActive(false)
    setIsFinished(false)
    setResults({ wpm: 0, accuracy: 0, chars: 0, time: 0 })
    loadTestText()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-slate-400">Carregando teste...</p>
        </div>
      </div>
    )
  }

  if (error || alreadySubmitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-2xl p-8 max-w-md text-center border border-slate-800">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            {alreadySubmitted ? "Teste já realizado" : "Erro ao carregar teste"}
          </h2>
          <p className="text-slate-400 mb-6">{error}</p>
          {alreadySubmitted && processStatus?.typing_test_score && (
            <div className="mb-6 p-4 bg-slate-800 rounded-xl">
              <p className="text-slate-300">Sua pontuação anterior:</p>
              <p className="text-3xl font-bold text-teal-400">{processStatus.typing_test_score} WPM</p>
            </div>
          )}
          {!alreadySubmitted && (
            <button
              onClick={loadTestText}
              className="px-6 py-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600"
            >
              Tentar Novamente
            </button>
          )}
          <button
            onClick={() => router.push("/")}
            className="mt-4 block w-full px-6 py-3 bg-slate-800 text-slate-300 font-medium rounded-xl hover:bg-slate-700"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
              <Logo size={32} showText={false} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Teste de Digitação</h1>
              <p className="text-slate-400 text-sm">
                {isRealProcess && processStatus ? (
                  <>
                    <span className="text-amber-400">{processStatus.personal_data?.empresa || "RHeply"}</span>
                    {" - "}
                    {processStatus.candidate_name}
                  </>
                ) : isDemo ? (
                  "Modo Demonstração"
                ) : isAplicacaoLegacy ? (
                  "RHeply"
                ) : (
                  `Processo: ${selectionProcessId.slice(0, 8)}...`
                )}
              </p>
            </div>
          </div>
          <div
            className={`flex items-center gap-2 text-xl font-mono font-bold px-4 py-2 rounded-lg ${
              timeLeft < 30 ? "bg-red-900/20 text-red-500" : "bg-slate-800"
            }`}
          >
            <Timer className="h-5 w-5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Test Area */}
        <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden relative border border-slate-800">
          {/* Progress Bar */}
          <div className="h-1 bg-slate-800 w-full">
            <div
              className="h-full bg-teal-500 transition-all duration-300"
              style={{ width: `${(userInput.length / testText.length) * 100}%` }}
            />
          </div>

          <div className="p-8">
            {/* Text Display */}
            <div className="text-xl md:text-2xl font-medium leading-relaxed mb-6 font-mono select-none pointer-events-none">
              {renderText()}
            </div>

            <textarea
              ref={inputRef}
              value={userInput}
              onChange={handleInputChange}
              disabled={isFinished}
              className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-lg md:text-xl focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none font-mono text-slate-200 placeholder:text-slate-600"
              placeholder={
                isActive
                  ? "Digite o texto acima..."
                  : "Clique aqui ou comece a digitar para iniciar..."
              }
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>

          {/* Manual Finish Button */}
          {isActive && userInput.length > 0 && (
            <div className="px-8 pb-8">
              <button
                onClick={finishTest}
                className="w-full py-3 bg-slate-800 border border-slate-700 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors"
              >
                Finalizar Teste
              </button>
            </div>
          )}
        </div>

        {/* Results Modal */}
        {isFinished && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-800">
              <div className="w-20 h-20 bg-emerald-900/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Teste Concluído!</h2>
              <p className="text-slate-400 mb-8">Aqui está o seu desempenho.</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                  <div className="text-4xl font-bold text-white">{results.wpm}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    WPM
                  </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                  <div className="text-4xl font-bold text-white">{results.accuracy}%</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Precisão
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                  <div className="text-xl font-bold text-white">{results.chars}</div>
                  <div className="text-xs text-slate-500">Caracteres</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                  <div className="text-xl font-bold text-white">
                    {formatTime(results.time)}
                  </div>
                  <div className="text-xs text-slate-500">Tempo</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRetry}
                  disabled={submitting}
                  className="flex-1 py-3 bg-slate-800 border border-slate-700 text-slate-300 font-bold rounded-xl hover:bg-slate-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCcw className="h-4 w-4" /> Tentar Novamente
                </button>
                <button
                  onClick={handleSubmitResults}
                  disabled={submitting}
                  className="flex-1 py-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 shadow-lg shadow-teal-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
                    </>
                  ) : (
                    "Enviar Resultado"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-8 flex items-center gap-3 justify-center text-slate-400 text-sm bg-slate-900/50 py-3 rounded-full w-fit mx-auto px-6 border border-slate-800">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span>O tempo começa a contar assim que você digitar a primeira letra.</span>
        </div>
      </div>
    </div>
  )
}
