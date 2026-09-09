"use client";

/**
 * O invólucro React em volta do ECharts.
 *
 * Mora num módulo à parte de motor.tsx por peso: aqui estão os únicos imports
 * de runtime da biblioteca, e é esta fronteira que permite carregá-la depois da
 * primeira pintura. Quem só precisa da paleta ou dos tipos importa de motor.tsx
 * e não paga nada por isso.
 */

import { useEffect, useRef } from "react";

import * as echarts from "echarts/core";
import { BarChart, CustomChart, FunnelChart } from "echarts/charts";
import {
  AxisPointerComponent,
  DataZoomComponent,
  GridComponent,
  MarkLineComponent,
  TooltipComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";

/*
 * Registro explícito, não o pacote inteiro.
 *
 * `import * as echarts from "echarts"` traz mapa, calendário, 3D e todo o resto
 * — cerca de um megabyte que este painel nunca desenha. Declarando só o que os
 * seis instrumentos usam, o empacotador descarta o resto.
 *
 * O renderizador é SVG, e não Canvas, por causa da cena de leitura: o quadro é
 * projetado, e projetor reescala. Canvas reescalado borra o texto; SVG não. O
 * mesmo motivo pelo qual o desenho manuscrito era SVG continua valendo.
 */
echarts.use([
  BarChart,
  CustomChart,
  FunnelChart,
  GridComponent,
  TooltipComponent,
  AxisPointerComponent,
  DataZoomComponent,
  MarkLineComponent,
  SVGRenderer,
]);


/* ------------------------------------------------------------------ *
 * O invólucro React
 * ------------------------------------------------------------------ */

export function Grafico({
  option,
  altura,
  aria,
  aoClicar,
  className = "",
}: {
  option: EChartsOption;
  /** Altura em pixels, ou "auto" quando o próprio instrumento calcula. */
  altura: number;
  /** Descrição para quem não vê o desenho. A tabela gêmea continua sendo a via principal. */
  aria: string;
  aoClicar?: (chave: string) => void;
  className?: string;
}) {
  const alvo = useRef<HTMLDivElement>(null);
  const instancia = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    const el = alvo.current;
    if (!el) return;
    const g = echarts.init(el, undefined, { renderer: "svg" });
    instancia.current = g;

    /* O ECharts não escuta o contêiner, só a janela. Numa grade que reflui
       quando a régua de filtros muda de altura, a janela não dispara evento
       nenhum e o gráfico fica com a largura antiga até alguém redimensionar. */
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => g.resize()) : null;
    ro?.observe(el);

    return () => {
      ro?.disconnect();
      g.dispose();
      instancia.current = null;
    };
  }, []);

  useEffect(() => {
    const g = instancia.current;
    if (!g) return;
    /* `true` substitui as opções em vez de mesclar. Sem isso, uma série que
       some do recorte fica desenhada na tela, porque a mesclagem preserva o
       índice antigo. */
    g.setOption(option, true);
  }, [option]);

  useEffect(() => {
    const g = instancia.current;
    if (!g || !aoClicar) return;
    const mao = (p: { name?: string }) => {
      if (p.name) aoClicar(p.name);
    };
    g.on("click", mao);
    return () => {
      g.off("click", mao);
    };
  }, [aoClicar]);

  return (
    <div
      ref={alvo}
      className={`rs-grafico ${className}`}
      style={{ height: altura, width: "100%" }}
      role="img"
      aria-label={aria}
    />
  );
}

