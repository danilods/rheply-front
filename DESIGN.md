---
name: Sistema Rheply
description: Uma tipografia e uma paleta para o produto inteiro, em claro e escuro, com a cor presa por lei ao estado anormal e à magnitude.
scope: "src/app/globals.css (camada --rh-*) é o sistema; src/app/(dashboard)/atracao-selecao/**, src/components/atracao-selecao/**, src/lib/rs/** são o primeiro consumidor. Os tokens HSL shadcn (--background, --primary, …) e a classe .light são a camada legada."
colors:
  fundo: "#eef1f5"
  superficie: "#ffffff"
  superficie-funda: "#e2e8f0"
  tinta: "#0f172a"
  tinta-2: "#475569"
  tinta-3: "#64748b"
  fio: "#cbd5e1"
  fio-forte: "#94a3b8"
  marca: "#0ea5a4"
  marca-2: "#3b82f6"
  alarme: "#b91c1c"
  atencao: "#d97706"
  atencao-texto: "#92400e"
  processo: "#0f766e"
  rampa-1: "#3b82f6"
  rampa-2: "#2563eb"
  rampa-3: "#1e40af"
  rampa-4: "#172554"
  nulo: "#94a3b8"
  foco: "#0ea5a4"
  escuro-fundo: "#020617"
  escuro-superficie: "#0f172a"
  escuro-superficie-funda: "#1e293b"
  escuro-tinta: "#f8fafc"
  escuro-tinta-2: "#cbd5e1"
  escuro-tinta-3: "#94a3b8"
  escuro-fio: "#334155"
  escuro-fio-forte: "#475569"
  escuro-alarme: "#f87171"
  escuro-atencao: "#fbbf24"
  escuro-atencao-texto: "#fbbf24"
  escuro-processo: "#2dd4bf"
  escuro-rampa-1: "#2563eb"
  escuro-rampa-2: "#3b82f6"
  escuro-rampa-3: "#60a5fa"
  escuro-rampa-4: "#bfdbfe"
  escuro-nulo: "#64748b"
  escuro-foco: "#2dd4bf"
typography:
  titulo:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "clamp(26px, 3vw, 34px)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.005em"
  leitura-grande:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "clamp(52px, 7vw, 78px)"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-0.01em"
    fontFeature: "tabular-nums"
  leitura-cartao:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "clamp(26px, 2.1vw, 31px)"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-0.01em"
    fontFeature: "tabular-nums"
  leitura:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-0.01em"
    fontFeature: "tabular-nums"
  cabeca:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "0.01em"
  corpo:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  apoio:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  rotulo:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.09em"
  rotulo-miudo:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.06em"
rounded:
  reto: "0"
  pilula: "999px"
spacing:
  u: "4px"
  u2: "8px"
  u3: "12px"
  u4: "16px"
  u7: "28px"
  u9: "36px"
components:
  botao:
    backgroundColor: "transparent"
    textColor: "{colors.tinta-2}"
    typography: "{typography.corpo}"
    rounded: "{rounded.reto}"
    padding: "0 13px"
    height: "34px"
  botao-hover:
    backgroundColor: "transparent"
    textColor: "{colors.tinta}"
  botao-forte:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.superficie}"
    typography: "{typography.corpo}"
    rounded: "{rounded.reto}"
    padding: "0 13px"
    height: "34px"
  botao-forte-hover:
    backgroundColor: "{colors.foco}"
    textColor: "{colors.superficie}"
  campo:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta}"
    typography: "{typography.corpo}"
    rounded: "{rounded.reto}"
    padding: "0 26px 0 9px"
    height: "34px"
  placa:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.reto}"
    padding: "16px 16px 14px"
  cartao:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.reto}"
    padding: "14px 16px 16px"
  aba:
    backgroundColor: "transparent"
    textColor: "{colors.tinta-2}"
    typography: "{typography.rotulo}"
    rounded: "{rounded.reto}"
    padding: "11px 16px"
  aba-ativa:
    backgroundColor: "{colors.superficie-funda}"
    textColor: "{colors.tinta}"
  dica:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.superficie}"
    typography: "{typography.corpo}"
    rounded: "{rounded.reto}"
    padding: "6px 9px"
---

# Design System: Sistema Rheply

## Overview

**Creative North Star: "O Quadro Sinóptico da Sala de Operação"**

O sistema tem uma tese só e ela é negativa: **cor é informação escassa**. A interface inteira é tinta sobre superfície neutra, e cada mancha de cor que aparece na tela tem obrigação de significar alguma coisa — ou um estado que saiu do normal, ou uma magnitude dentro de uma rampa ordenada. Não existe paleta categórica, não existe cor de enfeite, não existe uma cor por área do produto. A gramática vem do painel mímico de centro de operação (ISA-101, High Performance HMI), que é um padrão documentado, não um tema visual: se tudo tem cor, nada é alarme.

A partir desta versão o sistema deixou de ser do módulo e passou a ser do produto. `src/app/globals.css` carrega uma camada única de tokens `--rh-*` — tipografia, superfície, tinta, fio, marca, estado, rampa ordinal e a tinta companheira de cada preenchimento — definida em claro no `:root` e em escuro sob `[data-rh-tema="escuro"]`. O módulo Atração & Seleção é o primeiro consumidor dessa camada, não o dono dela. Os nomes `--rs-*` que o painel usa continuam existindo porque são o vocabulário do instrumento (fio, placa, alarme, rampa), mas cada um é hoje um **apelido** de um token `--rh-*`.

A camada antiga continua de pé, intacta: os tokens HSL do shadcn (`--background`, `--primary`, `--secondary`, `--muted`, `--chart-1..5`) e a classe `.light` seguem sendo o que todas as outras rotas consomem. **Nenhuma tela existente mudou de aparência nesta passagem.** A migração é rota a rota, e a fronteira entre as duas camadas é explícita e documentada abaixo.

**Key Characteristics:**
- Uma família tipográfica em dois desenhos (Inter e Inter Tight), zero pareamento decorativo.
- Cor por lei fechada: três estados, uma rampa ordinal azul de quatro degraus, um cinza de dado ausente. Nada mais.
- Separação por fio, nunca por cartão. Raio zero em tudo que é instrumento.
- Claro e escuro são o mesmo sistema com dois valores; a forma, o espaçamento e a tipografia não mudam entre os dois.
- Tema claro é o padrão por fato do produto: o quadro é projetado numa sala com a luz acesa.
- A cor nunca informa sozinha — sempre acompanhada de forma e de palavra.

## Colors

Paleta neutra fria (família slate) como base absoluta, com a cor confinada a duas funções semânticas e nenhuma decorativa. Todos os valores vivem em `globals.css`; o módulo não declara nenhuma cor própria.

### Primary
- **Teal Rheply** (`{colors.marca}`): a cor da marca, herdada do gradiente do logo (`src/components/brand/logo.tsx`, teal → azul). Ela vive hoje em três lugares e só nesses três: `--rh-foco` (anel de foco, cursor de texto e hover do botão forte), o estado `--rh-processo` e o próprio logo. **O teal saiu da rampa de magnitude** e ficou onde uma valência positiva é apropriada: foco é bom, "em processo" é bom. Não é cor de preenchimento de superfície.
- **Azul Rheply** (`{colors.marca-2}`): a outra ponta do gradiente do logo e a matiz que passou a governar a rampa ordinal inteira. É exatamente o valor de `{colors.rampa-1}` no claro.

### Secondary
Não existe. Uma segunda cor de acento seria a primeira rachadura na lei; a rampa ordinal ocupa o espaço que um acento secundário ocuparia.

### Tertiary — a rampa ordinal de magnitude
Quatro degraus de **azul puro**, sem verde em nenhum deles: do azul médio ao navy no claro (`{colors.rampa-1}` → `{colors.rampa-4}`) e do azul fundo ao azul-gelo no escuro (`{colors.escuro-rampa-1}` → `{colors.escuro-rampa-4}`). A luminância é monotônica dentro de cada tema, com ΔL* ≥ 8 entre vizinhos e ≥ 3:1 de cada degrau contra a sua placa — reverificado programaticamente nos dois temas depois da troca de matiz.

**A rampa era teal→navy e passou a ser azul, e a razão é semântica, não estética.** Verde e teal afirmam "bom". Uma barra de volume não pode ter valência: ela mede quanto, não se está certo. Com a rampa em verde, o estoque parado e o não comparecimento apareciam sussurrando que estava tudo bem — o oposto da lei do quadro, que diz que o normal é silencioso e que cor de estado é a única cor que julga. O azul mede sem opinar. O teal recuou para `--rh-marca`, `--rh-foco` e `--rh-processo`, onde a valência positiva é o significado desejado.

**A direção da rampa inverte entre os temas, e isso é intencional:** no claro ela escurece do degrau 1 ao 4 (o degrau alto é o mais pesado sobre fundo claro); no escuro ela clareia (`{colors.escuro-rampa-1}` → `{colors.escuro-rampa-4}`). O que se mantém é a ordem percebida: degrau 4 é sempre o de maior contraste contra a placa.

O **degrau 2** é o preenchimento default de série única (`.rs-mk`): um gráfico de uma série só não tem magnitude a codificar, então fala num degrau médio da rampa e não na cor da marca.

- **`--rh-nulo` / `{colors.nulo}`** é a cor do **dado ausente**, não uma categoria. Um cinza dessaturado que sai da rampa de propósito: ele não tem posição na ordem.

### Neutral
- **Fundo do quadro** (`{colors.fundo}`) — o cinza-azulado da sala. Cinza e não branco puro: branco espalha o brilho do projetor.
- **Placa** (`{colors.superficie}`) — a superfície onde o dado vive.
- **Placa funda** (`{colors.superficie-funda}`) — cabeçalho de tabela colante, aba ativa, hover de linha.
- **Tinta / Tinta-2 / Tinta-3** (`{colors.tinta}`, `{colors.tinta-2}`, `{colors.tinta-3}`) — a escada de leitura, com contraste medido sobre a superfície do tema. Pisos verificados: **17,9 / 7,6 / 4,8:1 no claro** e **17,1 / 12,0 / 7,0:1 no escuro**. `tinta-3` é o piso do texto de corpo e nada desce abaixo dele.
- **Fio / Fio-forte** (`{colors.fio}`, `{colors.fio-forte}`) — a única ferramenta de separação. Fio de 1px divide dentro de um bloco; fio de 2px em `fio-forte` abre um bloco.

### Estado
- **Alarme** (`{colors.alarme}` / `{colors.escuro-alarme}`) — o que estourou o prazo, o limiar em gráfico, a borda de erro. 6,5:1 nos dois temas.
- **Atenção, em duas vozes.** `{colors.atencao}` / `{colors.escuro-atencao}` é **preenchimento e marca** — barra, fio de topo de placa, losango de estado —, onde vale o piso de 3:1 de objeto gráfico (mede 3,2:1 no claro). `{colors.atencao-texto}` / `{colors.escuro-atencao-texto}` é a **mesma atenção em texto**, e mede 7,1:1 no claro. `.rs-estado--atencao` e `.rs-etiqueta--atencao` — que pintam palavra em 12 e 13px — consomem a voz de texto. No escuro as duas vozes coincidem no mesmo valor, porque `#fbbf24` já mede 10,7:1 e não precisa de par.
- **Processo** (`{colors.processo}` / `{colors.escuro-processo}`) — o que está em movimento normal, mas em movimento. 5,5:1 no claro, 9,6:1 no escuro.
- **Normal não tem cor.** É `tinta-2`. O estado normal é a ausência de cor, não uma cor verde.

Os três estados foram separados sob protanopia, deuteranopia e tritanopia simuladas, com ΔE ≥ 15 entre cada par nos três casos.

### A tinta que vai por cima
Cada preenchimento do sistema traz junto a sua tinta companheira: `--rh-sobre-rampa-1..4`, `--rh-sobre-nulo`, `--rh-sobre-alarme`, `--rh-sobre-atencao`, `--rh-sobre-processo`. As tintas da rampa foram **re-derivadas** junto com a troca de matiz: no claro os quatro degraus são escuros o bastante para tinta branca; no escuro a virada acontece entre o degrau 2 e o 3, e os dois degraus claros pedem tinta escura (`#0f172a`). O componente não adivinha nada por luminância em tempo de execução (era assim antes, e `TINTA_SOBRE` em `graficos.tsx` substituiu essa adivinhação por consulta ao token). Adivinhar acertaria num tema e erraria no outro, porque no escuro é o preenchimento claro que pede tinta escura.

### Named Rules

**A Regra da Lei Fechada.** Existem exatamente três cores de estado (alarme, atenção, processo), uma rampa ordinal de quatro degraus e um cinza de dado ausente. Uma cor nova só entra no produto se substituir uma dessas. Não se cria cor por categoria, por área, por autor ou por gosto.

**A Regra do Normal Sem Cor.** O curso normal do processo é tinta, nunca uma cor. `COR_DESFECHO` em `metricas.ts` é a prova de aplicação: aprovado, em processo e reprovado ficam na rampa fria e calam; só não-comparecimento (alarme) e declínio (atenção) acendem. Nenhuma categoria ordinária gasta vermelho.

**A Regra da Quarentena.** A cor do dado vive presa dentro da moldura da placa. Fora dela — casca, navegação, régua de filtros, tabela — a interface é tinta sobre neutro. É essa quarentena que impede o produto de virar mosaico.

**A Regra da Rampa Sem Valência.** A rampa de magnitude é azul e não pode ganhar verde, âmbar ou vermelho em nenhum degrau. Uma escala que mede quantidade não tem o direito de dizer se a quantidade é boa; julgamento é privilégio das três cores de estado. Verde numa barra de volume é uma afirmação que ninguém autorizou.

**A Regra das Duas Vozes da Atenção.** Toda cor de estado que não alcança 4,5:1 sobre a placa tem duas entradas: uma para preenchimento e marca (piso de 3:1) e outra, mais escura, para texto. Pintar palavra pequena com a voz de preenchimento é defeito, não licença poética.

**A Regra do Ausente Fora da Ordem.** `--rh-nulo` nunca participa de uma rampa nem de uma legenda ordenada. Dado que falta não tem posição.

**A Regra da Tinta Declarada.** Todo preenchimento colorido consome a sua tinta companheira `--rh-sobre-*`. Calcular contraste em runtime está proibido: o valor certo já está no token e vira com o tema.

## Typography

**Display / Instrumento:** Inter Tight (via `next/font`, exposta como `--font-inter-tight`, pesos 500/600/700).
**Corpo / Interface:** Inter (via `next/font`, exposta como `--font-inter`).
**Fonte mono:** não existe. Números tabulares (`font-variant-numeric: tabular-nums`) resolvem o alinhamento sem uma terceira família.

**Character:** não é um par de fontes convivendo. É a mesma letra em dois desenhos. Inter carrega prosa e interface; Inter Tight é o mesmo tipo num traçado mais estreito e serve rótulo em caixa alta, cabeçalho de tabela, título e leitura de instrumento — onde a largura é o recurso escasso. O produto tem, na prática, uma tipografia só.

### A escada, como está declarada

O módulo declara exatamente estes corpos, e nada entre eles: **12 · 13 · 14 · 15 · 19 · 26 · 40 px**, mais três `clamp`: `clamp(26px, 3vw, 34px)` no título de tela, `clamp(26px, 2.1vw, 31px)` no numeral do cartão e `clamp(52px, 7vw, 78px)` na maior leitura. Não há meio pixel em lugar nenhum: `.rs-t-valor` desceu de 14,5 para 14px e `.rs-t-marca` subiu de 12,5 para 13px, porque meio pixel nunca foi um degrau de escada — era resíduo de ajustar um tamanho de cada vez, e peso mais tinta já separam o valor de um gráfico do rótulo dele.

**14px é o degrau dominante: onze declarações, mais que qualquer outro corpo.** Ele é o piso do texto de apoio dentro de instrumento, fixado quando se estabeleceu que nada dentro do quadro pode ficar abaixo dele — o painel é lido projetado a dois ou três metros. Rótulo de gráfico, valor de gráfico, nota, subtítulo de placa, corpo de tabela, controle e campo estão todos aqui.

### Hierarchy
- **Leitura grande** (`{typography.leitura-grande}`): o número que domina a tela. Tabular, entrelinha abaixo de 1, uma por tela no máximo.
- **Leitura** (`{typography.leitura}`), leitura de cartão (`{typography.leitura-cartao}`) e a variante miúda (26px): valores de instrumento em placa, em cartão e em barra de estado.
- **Título** (`{typography.titulo}`): o nome da tela, uma vez por rota, com `text-wrap: balance`.
- **Cabeça** (`{typography.cabeca}`): título de placa e de tabela.
- **Corpo** (`{typography.corpo}`): prosa da interface. Cai para 14px abaixo de 640px. Prosa limitada a **68ch** (`.rs-prosa`); subtítulo de placa a 62ch.
- **Apoio** (`{typography.apoio}`): o degrau de trabalho do quadro e o piso do texto dentro de instrumento — rótulo e valor de gráfico, nota, subtítulo de placa, corpo de tabela, campo, botão e prazo. É o corpo mais frequente do módulo, não uma exceção.
- **Rótulo** (`{typography.rotulo}`): caixa alta, entreletra 0.09em, em Inter Tight. É o silkscreen do painel — nome de equipamento, nome de campo, aba.
- **Rótulo miúdo** (`{typography.rotulo-miudo}`): etiqueta de estado (12px/0.06em) e cabeçalho de tabela (12px/0.07em). É o piso; nada em caixa alta desce abaixo de 12px.

### Named Rules

**A Regra da Letra Única.** Uma família, dois desenhos. Uma terceira fonte no produto é um defeito, não uma decisão. Nenhuma fonte de sistema (`Georgia`, `Times`, `-apple-system` como display) entra como face de exibição — `system-ui` só existe como fallback na pilha.

**A Regra do Número Tabular.** Todo número que pode ser comparado verticalmente — coluna, leitura, prazo, contagem — usa `tabular-nums`. Coluna numérica alinha à direita.

**A Regra do Piso de Apoio.** Dentro de um instrumento, texto de apoio não desce abaixo de **14px**. O quadro é lido projetado a dois ou três metros; 13px e 12px existem só para caixa alta com entreletra, que se lê pela silhueta da palavra.

**A Regra do Degrau Inteiro.** Todo corpo declarado é um número inteiro de pixels e pertence à escada. Meio pixel não é um degrau: se dois textos precisam se distinguir e um degrau inteiro é demais, quem separa é o peso e a tinta, não 0,5px.

**A Regra do Piso de Legibilidade.** Rótulo em caixa alta não encolhe abaixo de 12px para caber. Se não cabe, muda a forma do layout (foi o que a régua unifilar fez ao virar lista numerada abaixo de 720px), não o corpo da letra.

## Layout

Grade de **12 colunas** (`.rs-grade`) com goteira de 16px (`--rs-u` × 4) e `align-items: start` — cada placa termina onde o dado dela termina, porque esticar tudo até a altura da linha abre vão morto embaixo do instrumento mais curto, e num quadro de operação vão morto lê-se como dado faltando. Vãos usados: 4, 5, 6, 7, 8 e 12 colunas.

**Ritmo:** unidade base de **4px** (`--rs-u`). Todo espaçamento é múltiplo dela: 12px (u×3) dentro de bloco, 16px (u×4) entre placas e goteira, 28px (u×7) entre colunas de leitura, 36px (u×9) acima de uma seção. Uma seção sempre tem mais ar acima do título do que abaixo.

**Respiro do quadro:** 16px lateral no telefone, 28/32px a partir de 768px, e 40/56px de fundo.

**Rupturas — três larguras de grade, não duas.** Havia um salto único que empilhava tudo numa coluna só a partir de 1100px, e uma placa de gráfico com 1000px de largura para mostrar seis barras desperdiça tela tanto quanto texto cortado. A faixa intermediária existe para isso:

| Ruptura | Grade | O que mais muda |
|---|---|---|
| acima de 1100px | vãos autorados (4, 5, 6, 7, 8, 12 colunas) | — |
| ≤ 1100px | `.rs-c4` / `.rs-c5` / `.rs-c6` → **span 6**; `.rs-c7` / `.rs-c8` **permanecem span 12**; `grid-auto-flow: row dense` | os instrumentos largos não sobrevivem a meia largura aqui (o unifilar tem cinco etapas em régua posicionada); a compactação faz uma placa estreita preencher a meia fileira que uma larga deixaria vazia |
| ≤ 780px | tudo → **span 12** | goteira cai de 16px para 12px |
| ≤ 720px | — | régua unifilar abandona a posição absoluta e vira lista numerada; abas afrouxam para 10px 12px |
| ≤ 640px | — | corpo cai para 14px; placa comprime para 12px; cartões apertam para `minmax(144px, 1fr)`, com o numeral encolhendo pelo próprio `clamp`; célula de estado passa a linha inteira |

(Acima, em `min-width`: 768px sobe o respiro lateral do quadro de 16px para 28/32px.)

**A grade de cartões é a exceção que não tem ruptura:** `.rs-cartoes` é `repeat(auto-fit, minmax(172px, 1fr))` e se reacomoda sozinha de seis a uma coluna, sem media query, porque a largura de um cartão de leitura é dada pelo número que ele carrega e não pela largura da tela.

**Sangramento escopado:** o módulo anula o padding e o teto de 1280px do console do dashboard por `:has()` — `main:has(> div > .rs-painel) { padding: 0 }` e `main > div:has(> .rs-painel) { max-width: none }`. A regra fica presa a esta rota: nenhuma outra tela do dashboard enxerga a mudança, e onde `:has()` não existe o painel volta ao comportamento antigo. Um quadro lido a três metros não pode jogar fora um terço da largura da sala.

### Named Rules

**A Regra do Sangramento Escopado.** Escapar do contêiner do console é legítimo apenas para uma superfície projetada, e apenas via `:has()` ancorado na classe raiz da própria rota. Nenhuma rota altera o shell globalmente.

**A Regra do Vão que Não Encolhe.** Um instrumento largo (`.rs-c7`, `.rs-c8`) não vira meia largura: ou tem a linha inteira, ou tem a largura autorada. Reduzir pela metade uma régua de cinco etapas posicionadas quebra o instrumento em vez de adaptá-lo. Quem cede espaço é a placa estreita, e `row dense` garante que o espaço cedido seja ocupado.

**A Regra do Ar Assimétrico.** Título recebe mais espaço acima do que abaixo. O título pertence ao que vem depois dele.

## Elevation & Depth

**Este sistema não tem elevação.** Não há escala de sombra, não há camada suspensa, não há vidro. A profundidade é feita por **fio e por tom**: `fio` (1px) divide dentro de um bloco, `fio-forte` (2px, no topo) abre um bloco, e `superficie-funda` recua um cabeçalho de tabela ou uma aba ativa. Cartão empilhado com sombra é exatamente o contêiner preguiçoso que fazia tudo competir por atenção na versão anterior do painel, e está descartado.

### Shadow Vocabulary
- **Dica flutuante** (`--rh-sombra`): a única sombra do sistema, e existe apenas porque o tooltip é `position: fixed` e precisa se destacar de conteúdo arbitrário embaixo dele. É um **token por tema**, não um literal: `0 3px 14px -4px rgb(15 23 42 / 38%)` no claro e `0 3px 16px -3px rgb(2 6 23 / 72%)` no escuro — no escuro a sombra precisa ser mais funda e mais opaca para existir sobre uma placa quase preta. Nenhuma superfície em fluxo recebe sombra.

### Named Rules

**A Regra do Fio, Não do Cartão.** Superfícies são separadas por linha e por tom, nunca por sombra. Um elemento só recebe sombra se ele flutua fora do fluxo do documento.

**A Regra da Superfície Plana.** Nenhum `border-radius` + `box-shadow` + `background` combinados formando "card". Se um bloco precisa ser distinguido, ele ganha um fio de 2px no topo.

## Shapes

**Raio zero em tudo que é instrumento.** Placa, botão, campo, select, tabela, dica, aba: `border-radius: 0`. O raio existe em exatamente dois lugares e ambos são geometria, não decoração: `999px` no polegar da barra de rolagem, e `50%` nas marcas circulares de estado.

**A forma carrega o estado antes da cor.** Quatro marcas de 11px (9px na etiqueta), todas em `currentColor`:
- **Quadrado** (`--alarme`): raio 0, preenchido.
- **Losango** (`--atencao`): quadrado rotacionado 45°.
- **Círculo cheio** (`--processo`): preenchido.
- **Círculo vazado** (`--normal`): fundo transparente, borda de 2px.

Quem não distingue as cores continua lendo o quadro. Bordas: sempre 1px ou 2px sólidos, cor de fio ou de tinta. Nada tracejado, nada pontilhado.

### Named Rules

**A Regra da Forma Antes da Cor.** Todo estado tem forma própria **e** palavra própria. Cor é o terceiro canal, nunca o primeiro nem o único. Uma legenda de cor sem forma e sem texto não é entregável.

**A Regra do Canto Reto.** Instrumento não tem raio. `border-radius` diferente de 0 precisa de justificativa geométrica (um círculo é redondo; um botão não).

## Components

### Botões
- **Shape:** retangular puro (raio 0), altura fixa de 34px.
- **Padrão** (`{components.botao}`): fundo transparente, fio de 1px em `fio-forte`, tinta-2. É a forma default: o botão é uma moldura, não uma mancha.
- **Hover:** fio e texto sobem para `tinta`. Sem transição de cor animada, sem deslocamento.
- **Forte** (`{components.botao-forte}`): fundo `tinta`, texto na cor da placa, peso 500. Um por tela, no máximo. Hover troca o fundo para `foco`.
- **Disabled:** `opacity: 0.45` e `cursor: not-allowed`.
- **Foco:** `outline: 2px solid var(--rs-foco)` com `outline-offset: 2px`, herdado de `.rs-painel :focus-visible` — vale para todo elemento focável do quadro, não só para botões.

### Cards / Containers — a Placa
- **Corner Style:** reto (0).
- **Background:** `superficie`. **Border:** apenas `border-top: 2px solid` em `fio-forte`. Não há borda lateral nem inferior; a placa é aberta por uma linha, não fechada por uma caixa.
- **Shadow:** nenhuma (ver Elevation & Depth).
- **Internal Padding:** 16px 16px 14px (u×4 / u×4 / u×3.5); 12px abaixo de 640px.
- É `flex-column`, de modo que o instrumento se centra verticalmente e a legenda e a tabela gêmea ficam ancoradas na base.

### Cartões de leitura
A faixa de leituras do topo do quadro (`FaixaLeituras`) é uma **grade de cartões** (`.rs-cartoes` / `.rs-cartao`), não uma faixa de valores separados por fio. Foi assim que ficou depois de as duas formas terem sido construídas e comparadas lado a lado: quem decide viu as duas e escolheu a peça fechada.

- **Cartão aqui quer dizer superfície delimitada, não canto redondo com sombra.** Raio 0, sombra nenhuma, fundo `superficie` e fio de 2px em `fio-forte` no topo: exatamente o vocabulário da placa, na escala de uma leitura. A Regra da Superfície Plana continua valendo sem exceção.
- **Grade:** `repeat(auto-fit, minmax(172px, 1fr))` com goteira de 12px (144px e 8px abaixo de 640px). De seis a uma coluna sem media query.
- **Anatomia, sempre nesta ordem:** rótulo em caixa alta, número, linha de referência (o que o número significa). O número é `leitura` reduzida a 31px (28px no compacto).
- **O rótulo reserva duas linhas mesmo quando ocupa uma** (`min-height: 2.4em`). Sem isso os numerais dos cartões vizinhos param em alturas diferentes e a fileira deixa de ser comparável de relance — que é a única razão de existir um cartão.

### Inputs / Fields
- **Style:** altura 34px, raio 0, fundo `superficie`, fio de 1px em `fio-forte`, corpo em Inter 14px. `appearance: none` no select, com chevron em SVG.
- **O chevron é a única duplicação deliberada do sistema:** são dois data-URIs, um por tema, cada um traçado na tinta secundária do seu (`#475569` no claro, `#cbd5e1` no escuro, o segundo sob `[data-rh-tema="escuro"]`). Um data-URI não enxerga variável CSS — não há como escrever `var(--rs-tinta-2)` dentro do SVG embutido —, então tokenizar é impossível e duplicar é a saída correta. Antes havia um cinza fixo só, que sumia no escuro.
- **Rótulo:** sempre presente, em rótulo caixa-alta acima do campo, com `htmlFor`.
- **Hover:** fio sobe para `tinta-2`.
- **Focus:** anel de foco global de 2px em `foco`, com offset. Sem glow, sem mudança de fundo.
- **Largura:** mínimo 132px, máximo 230px (busca: mínimo 210px). Um campo não estica pela linha inteira.

### Navigation — a régua de abas
- **Style:** faixa horizontal sobre `superficie`, aberta por 2px de `fio-forte` no topo e fechada por 1px de `fio` embaixo. Sem espaço entre abas: as células se tocam.
- **Typography:** rótulo caixa alta (Inter Tight 13px / 0.09em).
- **Ativa:** fundo `superficie-funda`, texto `tinta`, e um sublinhado de 3px por `inset box-shadow` na cor da tinta. Marcada também por `aria-current="page"`.
- **Mobile:** as abas **quebram linha** (`flex-wrap`), nunca rolam horizontalmente. Rolagem lateral esconde metade da navegação sem sinal de que havia mais.

### Barra de estado
**A barra continua sendo faixa, e não virou cartão — isso é decisão, não pendência.** A barra de estado é a partição de **um único todo**: as classes somam o mesmo universo de candidatos, e a faixa contínua dividida por 1px de folga é a forma que diz "isto é um bolo repartido". Os cartões da faixa de leituras são **leituras independentes** — prazo médio, taxa de conversão, posições abertas — que não somam nada entre si, e por isso cada uma ganha sua peça fechada. Essa é a regra que decide qual das duas usar.

Células de largura flexível (`flex: 1 1 150px`) separadas por 1px de **folga** deixando o fundo aparecer — não por borda, porque com borda a primeira célula de cada fileira nova carrega um fio pendurado à esquerda quando a barra quebra no telefone. Cada célula traz marca de forma + palavra + contagem em leitura miúda + o prazo. A cor entra por `currentColor` na célula inteira, e o valor volta para `tinta`.

### Tabela
- Cabeçalho colante (`position: sticky`) sobre `superficie-funda`, com o rótulo dentro de um `<button>` que ordena e expõe `aria-sort`.
- Linhas separadas por fio de 1px; hover pinta a linha com `superficie-funda`.
- Coluna numérica alinha à direita com `tabular-nums` e sobe para `tinta`; texto comum fica em `tinta-2`.
- Corpo com `white-space: nowrap` por padrão; só colunas marcadas quebram (160–300px).
- Paginação por "Mostrar mais" (40 + 60), com a contagem visível/total sempre à vista.

### Instrumentos (gráficos)
Componente assinatura do sistema. SVG desenhado à mão, sem biblioteca de gráfico.
- Grade em fio sólido, eixo em `fio-forte`, ambos com `shape-rendering: crispEdges`.
- Série única fala no segundo degrau da rampa (`--rs-rampa-2`, azul médio) e **não** na cor da marca; os demais degraus só aparecem quando carregam magnitude.
- Segmentos empilhados são separados por **2px de folga na cor da superfície** — a superfície separa, não um traço.
- Limiar de referência é a única linha em `alarme`, com o seu rótulo na mesma cor.
- **Toda placa de gráfico entrega a tabela gêmea** atrás de um `<details>` ("Os números"), com rolagem própria. Nenhum valor depende de passar o mouse.
- Rótulo comprido é cortado **pelo meio**, preservando a cauda que distingue ("Promotor(a) de Vendas · Belém" e "… · Macapá" cortados pela ponta viram duas linhas idênticas).
- Escala de eixo escolhe primeiro um passo redondo (1, 2, 2.5 ou 5 × potência de dez) e deriva o teto disso, para que as marcas caiam em inteiros legíveis a três metros.

### Dica (tooltip)
Fundo `tinta`, texto na cor da placa, raio 0, máximo 280px, `pointer-events: none`, `role="status"` com `aria-live="polite"`. É complemento, nunca a única via para um valor.

### Troca de tema
Botão padrão na casca do módulo, com ícone SVG inline (lua no claro, sol no escuro) e `aria-pressed`. O estado vive em `data-rh-tema` na raiz `.rs-painel` e é gravado em `localStorage` sob a chave `rs-tema`, dentro de `try/catch` — navegador com armazenamento bloqueado fica no padrão claro e a troca ainda vale para a sessão.

### Named Rules

**A Regra da Parte e do Todo.** Números que particionam um mesmo total vivem numa faixa contínua, separados por folga. Números independentes entre si vivem em cartões separados. Nunca se escolhe entre as duas por gosto visual: escolhe-se perguntando se somar as células significa alguma coisa.

**A Regra do Padrão Claro.** O tema claro é o padrão do quadro e isso é fato de produto, não preferência: o painel é projetado numa sala com a luz acesa durante a FUP semanal, e projetor lava o preto. O escuro existe para quem lê na mesa e é lembrado por leitor.

**A Regra da Tabela Gêmea.** Todo gráfico publica os seus números em tabela, na mesma placa. Um instrumento sem tabela não está pronto.

**A Regra da Procedência à Vista.** Data de referência, data da última carga e o destino do dado pessoal ("descartado na carga", por LGPD) ficam na face do quadro, sempre visíveis. Esconder de quando é o dado é a forma mais rápida de perder quem decide.

### Motion
Um único momento autorado: `rs-reassentar`, **420ms** em `cubic-bezier(0.16, 1, 0.3, 1)`, aplicado aos filhos diretos de `.rs-reassenta` com escalonamento de 40ms até o sexto item. Parte de um estado já visível (`translateY(3px)`, `opacity: 0.55`) e desacelera — é o reassentamento da folha quando um filtro reescopa tudo, não uma entrada. Sob `prefers-reduced-motion: reduce`, toda animação e toda transição do quadro são desligadas com `!important`.

**A Regra do Movimento Único.** O quadro tem um movimento e ele responde a uma ação do usuário. Nada anima ao carregar, nada pulsa, nada chama atenção sozinho.

## Do's and Don'ts

### Do:
- **Do** consumir a camada `--rh-*` de `globals.css` em toda superfície nova. Um valor de cor literal em componente é defeito.
- **Do** declarar a tinta companheira do preenchimento (`--rh-sobre-*`) sempre que um texto for cair sobre cor.
- **Do** dar a todo estado uma forma e uma palavra além da cor (quadrado/losango/círculo cheio/círculo vazado).
- **Do** usar `tabular-nums` em qualquer número comparável e alinhar coluna numérica à direita.
- **Do** separar por fio de 1px dentro do bloco e abrir bloco com 2px de `fio-forte` no topo.
- **Do** manter o ritmo em múltiplos de 4px (`--rs-u`).
- **Do** publicar a tabela gêmea de todo gráfico atrás de `<details>`.
- **Do** usar a voz de texto da cor de estado (`--rh-atencao-texto`) sempre que a cor for pintar palavra, e a voz de preenchimento apenas em barra, fio e marca.
- **Do** escolher entre faixa e cartão pela pergunta da soma: partição de um todo é faixa, leituras independentes são cartões.
- **Do** deixar `.rs-c7` e `.rs-c8` em largura inteira abaixo de 1100px, e contar com `row dense` para fechar a meia fileira.
- **Do** mudar a forma do layout quando o texto não cabe, em vez de encolher a letra abaixo de 12px.
- **Do** manter o padrão claro em superfícies projetadas e persistir a escolha do leitor em `localStorage` com `try/catch`.

### Don't:
- **Don't** criar cor nova. Três estados, quatro degraus de rampa, um nulo. Uma paleta categórica (uma cor por etapa, por área, por autor) está proibida.
- **Don't** colocar verde, teal ou qualquer matiz de valência positiva na rampa de magnitude. Ela mede, não julga.
- **Don't** pintar texto pequeno com `--rh-atencao`; essa é a voz de preenchimento e mede 3,2:1 no claro.
- **Don't** gastar `alarme` em categoria ordinária. Vermelho é para o que estourou, não para "reprovado".
- **Don't** usar `--rh-nulo` como se fosse um degrau da rampa ou uma categoria.
- **Don't** adivinhar contraste por luminância em tempo de execução. O token já traz a tinta certa e ela vira com o tema.
- **Don't** empilhar cartões com sombra e raio. "Cartão" neste sistema é superfície delimitada por fio de topo; superfície em fluxo não recebe `box-shadow` nem `border-radius`.
- **Don't** arredondar cantos de instrumento. Raio 0, salvo geometria (círculo, polegar de rolagem).
- **Don't** deixar um valor acessível só por hover ou tooltip.
- **Don't** fazer navegação rolar horizontalmente no telefone; ela quebra linha.
- **Don't** alterar o shell do dashboard globalmente para acomodar uma rota — escope por `:has()` ancorado na classe da própria rota.
- **Don't** introduzir uma terceira família tipográfica, nem uma face de exibição de sistema.

---

## Apêndice: a fronteira entre as duas camadas

Esta seção não é normativa para telas novas; ela existe para que ninguém confunda o que é sistema com o que é herança.

| | Camada atual (**usar**) | Camada legada (**não estender**) |
|---|---|---|
| Onde | `globals.css`, bloco `--rh-*` no topo | `globals.css`, `@layer base` com `--background`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--ring`, `--chart-1..5` |
| Tema | `[data-rh-tema="escuro"]` no elemento da rota | `.light` como classe, com escuro no `:root`; `darkMode: ['class']` no Tailwind |
| Consumo | `var(--rh-*)`, ou os apelidos `--rs-*` no módulo | utilitários Tailwind `bg-background`, `text-foreground`, `bg-primary`… |
| Estado | migrar rota a rota | congelado; **nenhuma tela existente mudou de aparência nesta passagem** |

As escalas `slate`, `blue`, `emerald` e `teal` escritas à mão em `tailwind.config.ts` pertencem à camada legada. `teal` está comentada como a cor da marca e é de onde vêm os hexes da marca; as outras três são resíduo. Superfície nova não consome nenhuma delas.

## Apêndice: onde a fonte discorda das notas

O código é a verdade; o que segue é registrado porque diverge da descrição do sistema.

1. **Os dois literais cegos ao tema foram corrigidos e saíram desta lista.** A seta do select virou dois data-URIs, um por tema (a duplicação é forçada: data-URI não lê variável CSS — ver Inputs/Fields); a sombra da dica virou `--rh-sombra`, definida com um valor em cada tema. Nenhum hex da paleta antiga sobrou no módulo.
2. **O piso de contraste da atenção em texto foi corrigido e saiu desta lista.** `--rh-atencao-texto` (`#92400e`, 7,1:1) existe e é o que `.rs-estado--atencao` e `.rs-etiqueta--atencao` consomem. O valor de 3,2:1 permanece registrado apenas como o que é: piso de objeto gráfico para preenchimento e marca.
3. **`--rh-marca` e `--rh-marca-2` continuam declarados e não consumidos por ninguém.** O logo (`logo.tsx`) segue com `#0ea5a4` e `#3b82f6` escritos direto no `linearGradient`. Os tokens são a intenção do sistema; a ligação ainda não foi feita.
4. **A família `font-tight` do Tailwind continua sem uso em `src/`.** Inter Tight chega ao módulo por `--rh-fonte-estreita` em CSS puro. A entrada em `tailwind.config.ts` está correta e disponível, mas é um caminho não trilhado.
5. **O comentário da rampa em `globals.css` cita "aba ativa" entre os lugares onde o teal recuou; a aba ativa não usa teal.** Em `layout.tsx` ela é `--rs-placa-funda` com texto em `--rs-tinta` e sublinhado de 3px também em tinta. O teal sobrevive de fato em `--rh-foco`, em `--rh-processo` e no logo. O código manda: a lista boa é essa, e é a que está na seção Colors.
6. **O comentário de `FaixaLeituras` em `ui.tsx` ainda descreve "uma placa só, dividida por fio".** O JSX ao lado renderiza `.rs-cartoes` / `.rs-cartao`. O que a tela mostra é a grade de cartões; o comentário é resíduo da forma anterior.
7. **~~Três corpos distintos dentro de uma faixa de cinco pixels — 26, 28 e 31px.~~ Consolidado.** Eram o valor da barra de estado (`--peq`, 26px), o numeral do cartão no telefone (28px) e o numeral do cartão no desktop (31px), com razões de 1,08 e 1,11 — abaixo do limiar em que o olho lê hierarquia. Os dois numerais de cartão viraram um degrau só, `clamp(26px, 2.1vw, 31px)`, e o override de telefone saiu. Restam dois corpos nessa faixa, que é o que a escada comportava.

8. **~~O comentário acima de `.rs-mk` ainda diz "série única fala na cor da marca".~~ Corrigido.** O comentário agora diz que a série única fala no segundo degrau da rampa, e por quê.

9. **~~A dica consome `var(--rh-sombra)` diretamente, sem apelido `--rs-`.~~ Corrigido.** O painel passou a declarar `--rs-sombra: var(--rh-sombra)` junto dos demais apelidos, e a dica consome o apelido. Nenhuma propriedade do módulo fura mais o vocabulário `--rs-*`.
