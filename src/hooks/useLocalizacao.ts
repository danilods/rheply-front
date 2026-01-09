/**
 * Hook para gerenciar estados e cidades do Brasil
 */

import { useState, useEffect, useCallback } from "react";
import {
  ESTADOS_ORDENADOS,
  getCidadesPorEstado,
  type Estado,
  type Cidade,
} from "@/data/brasil";

interface UseLocalizacaoReturn {
  estados: Estado[];
  cidades: Cidade[];
  loading: boolean;
  error: string | null;
  estadoSelecionado: string;
  cidadeSelecionada: string;
  setEstado: (uf: string) => void;
  setCidade: (cidade: string) => void;
  reset: () => void;
}

export function useLocalizacao(
  estadoInicial?: string,
  cidadeInicial?: string
): UseLocalizacaoReturn {
  const [estados] = useState<Estado[]>(ESTADOS_ORDENADOS);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estadoSelecionado, setEstadoSelecionado] = useState(estadoInicial || "");
  const [cidadeSelecionada, setCidadeSelecionada] = useState(cidadeInicial || "");

  // Buscar cidades quando o estado mudar
  const carregarCidades = useCallback(async (uf: string) => {
    if (!uf) {
      setCidades([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cidadesDoEstado = await getCidadesPorEstado(uf);
      setCidades(cidadesDoEstado);
    } catch (err) {
      setError("Erro ao carregar cidades. Tente novamente.");
      setCidades([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar cidades quando estado mudar
  useEffect(() => {
    if (estadoSelecionado) {
      carregarCidades(estadoSelecionado);
    } else {
      setCidades([]);
    }
  }, [estadoSelecionado, carregarCidades]);

  // Função para setar estado (limpa cidade selecionada)
  const setEstado = useCallback((uf: string) => {
    setEstadoSelecionado(uf);
    setCidadeSelecionada(""); // Limpar cidade ao mudar estado
  }, []);

  // Função para setar cidade
  const setCidade = useCallback((cidade: string) => {
    setCidadeSelecionada(cidade);
  }, []);

  // Função para resetar
  const reset = useCallback(() => {
    setEstadoSelecionado("");
    setCidadeSelecionada("");
    setCidades([]);
    setError(null);
  }, []);

  return {
    estados,
    cidades,
    loading,
    error,
    estadoSelecionado,
    cidadeSelecionada,
    setEstado,
    setCidade,
    reset,
  };
}
