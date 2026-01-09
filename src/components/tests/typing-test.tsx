"use client";

/**
 * Typing Test Component - Componente principal do teste de digitação.
 *
 * Este componente renderiza a interface do teste de digitação,
 * incluindo o texto a ser digitado, área de input, timer,
 * métricas em tempo real e detecção de fraudes.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Clock,
  Keyboard,
  Target,
  AlertTriangle,
  Play,
  Square,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DIFFICULTY_LABELS,
  TypingTestStartResponse,
} from "@/types/typing-test";
import { useTypingTestStore } from "@/store/typing-test-store";

// ============================================================================
// Interfaces
// ============================================================================

interface TypingTestProps {
  testData: TypingTestStartResponse;
  onComplete: (data: {
    typedText: string;
    durationSeconds: number;
    pasteAttempts: number;
    focusLostCount: number;
  }) => void;
  onCancel?: () => void;
}

// ============================================================================
// Componente Principal
// ============================================================================

export function TypingTest({ testData, onComplete, onCancel }: TypingTestProps) {
  // State
  const [typedText, setTypedText] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [pasteAttempts, setPasteAttempts] = useState(0);
  const [focusLostCount, setFocusLostCount] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Store
  const { calculateWPM, calculateAccuracy } = useTypingTestStore();

  // Métricas calculadas
  const wpm = calculateWPM(typedText, elapsedSeconds);
  const accuracy = calculateAccuracy(testData.textSample, typedText);
  const progress = Math.min(
    100,
    (typedText.length / testData.textSample.length) * 100
  );

  // ============================================================================
  // Efeitos
  // ============================================================================

  // Timer
  useEffect(() => {
    if (isRunning && startTime) {
      timerRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedSeconds(elapsed);
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, startTime]);

  // Detecção de perda de foco
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        setFocusLostCount((prev) => prev + 1);
      }
    };

    const handleBlur = () => {
      if (isRunning) {
        setFocusLostCount((prev) => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isRunning]);

  // Auto-complete quando terminar de digitar
  useEffect(() => {
    if (typedText.length >= testData.textSample.length && isRunning) {
      handleFinish();
    }
  }, [typedText, testData.textSample.length, isRunning]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleStart = useCallback(() => {
    setIsRunning(true);
    setStartTime(new Date());
    textareaRef.current?.focus();
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    setPasteAttempts((prev) => prev + 1);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isRunning) {
      handleStart();
    }
    setTypedText(e.target.value);
  }, [isRunning, handleStart]);

  const handleFinish = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    onComplete({
      typedText,
      durationSeconds: elapsedSeconds,
      pasteAttempts,
      focusLostCount,
    });
  }, [typedText, elapsedSeconds, pasteAttempts, focusLostCount, onComplete]);

  const handleCancel = useCallback(() => {
    setShowConfirmDialog(true);
  }, []);

  const confirmCancel = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onCancel?.();
  }, [onCancel]);

  const handleReset = useCallback(() => {
    setTypedText("");
    setIsRunning(false);
    setStartTime(null);
    setElapsedSeconds(0);
    setPasteAttempts(0);
    setFocusLostCount(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  // ============================================================================
  // Formatação
  // ============================================================================

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Renderiza texto com destaque de erros
  const renderHighlightedText = () => {
    const original = testData.textSample;
    const typed = typedText;

    return (
      <div className="font-mono text-lg leading-relaxed whitespace-pre-wrap">
        {original.split("").map((char, index) => {
          let className = "text-gray-400"; // Não digitado

          if (index < typed.length) {
            if (typed[index] === char) {
              className = "text-green-600 bg-green-50"; // Correto
            } else {
              className = "text-red-600 bg-red-100"; // Erro
            }
          } else if (index === typed.length) {
            className = "bg-blue-200 text-gray-800"; // Cursor
          }

          return (
            <span key={index} className={className}>
              {char}
            </span>
          );
        })}
      </div>
    );
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header com métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Timer */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tempo</p>
              <p className="text-2xl font-bold font-mono">
                {formatTime(elapsedSeconds)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* WPM */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Keyboard className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">WPM</p>
              <p className="text-2xl font-bold">{Math.round(wpm)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Precisão */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Precisão</p>
              <p className="text-2xl font-bold">{accuracy.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg",
                pasteAttempts > 0 || focusLostCount > 3
                  ? "bg-red-100"
                  : "bg-gray-100"
              )}
            >
              <AlertTriangle
                className={cn(
                  "h-5 w-5",
                  pasteAttempts > 0 || focusLostCount > 3
                    ? "text-red-600"
                    : "text-gray-400"
                )}
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Alertas</p>
              <p className="text-2xl font-bold">
                {pasteAttempts + Math.floor(focusLostCount / 3)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de progresso */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Área do teste */}
      <Card className="border-2 border-primary/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Texto para Digitação</CardTitle>
            <Badge variant="outline">
              {DIFFICULTY_LABELS[testData.difficulty]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Texto original com destaque */}
          <div className="p-4 bg-muted/30 rounded-lg min-h-[150px] select-none">
            {renderHighlightedText()}
          </div>

          {/* Área de digitação */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Digite o texto acima:</label>
            <Textarea
              ref={textareaRef}
              value={typedText}
              onChange={handleChange}
              onPaste={handlePaste}
              placeholder={
                isRunning
                  ? "Continue digitando..."
                  : "Clique aqui e comece a digitar para iniciar o teste"
              }
              className="min-h-[150px] font-mono text-lg resize-none"
              disabled={!isRunning && elapsedSeconds > 0}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botões de ação */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {!isRunning && elapsedSeconds === 0 && (
            <Button onClick={handleStart} className="gap-2">
              <Play className="h-4 w-4" />
              Iniciar Teste
            </Button>
          )}

          {isRunning && (
            <Button
              onClick={handleFinish}
              variant="default"
              className="gap-2"
            >
              <Square className="h-4 w-4" />
              Finalizar
            </Button>
          )}

          <Button onClick={handleReset} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reiniciar
          </Button>
        </div>

        {onCancel && (
          <Button onClick={handleCancel} variant="ghost">
            Cancelar
          </Button>
        )}
      </div>

      {/* Aviso de fraude */}
      {(pasteAttempts > 0 || focusLostCount > 3) && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">Atenção</p>
            <p className="text-sm text-yellow-700">
              {pasteAttempts > 0 && (
                <span>
                  Detectamos {pasteAttempts} tentativa(s) de colar texto.{" "}
                </span>
              )}
              {focusLostCount > 3 && (
                <span>
                  A janela perdeu foco {focusLostCount} vezes.{" "}
                </span>
              )}
              Isso pode afetar sua avaliação.
            </p>
          </div>
        </div>
      )}

      {/* Dialog de confirmação de cancelamento */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar teste?</AlertDialogTitle>
            <AlertDialogDescription>
              Seu progresso será perdido e você precisará iniciar um novo teste.
              Deseja realmente cancelar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar Teste</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>
              Sim, Cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default TypingTest;
