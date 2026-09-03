# Atração & Seleção no Rheply: análise dos insumos e proposta de plano

**Data:** 02/09/2026 · **Autor:** Claude (brainstorm com Danilo) · **Estado:** proposta para revisão, nada implementado

**Insumos analisados:** `ATRAÇÃO E SELEÇÃO teste.xlsx` (9 abas, 333 vagas, 492 contratações de 2026, 346 candidatos no funil), `painel_atracao_selecao (1).html` (painel estático de 3 abas em Chart.js), `processos_seletivos_2026-01-11.xlsx` (exportação do próprio Rheply) e o repositório `rheply-front`. Pesquisa web em quatro frentes (KPIs e benchmarks de R&S, API e relatórios da Gupy, importação de planilhas e visualização, LGPD) e consulta ao wiki pessoal (40 páginas).

## 1. Sumário executivo

**O problema não é a Gupy. É onde o funil acontece.** Cruzando as datas da própria exportação, 71% dos atendentes contratados em 2026 só foram inscritos na Gupy no dia do aceite da carta oferta (95% na carteira de uma das recrutadoras). O candidato é abordado por WhatsApp, indicação, presencial ou pelo pré-cadastro do Rheply, passa por todo o processo fora da plataforma, e só entra nela para gerar a admissão. Por isso os relatórios da Gupy nunca vão mostrar o funil desta operação, e por isso a analista precisou de uma planilha híbrida. A resposta é capturar o funil onde ele acontece, e o Rheply já está lá para parte dele.

**O que os dados mostram** (cálculo direto sobre a planilha):

- Operação de 333 vagas, 2.036 posições e 1.836 contratações desde março de 2024 (cerca de 63 por mês), dominada por dois funis opostos: Atendente I em ondas (81% das contratações de 2026) e Promotor de Vendas em reposição contínua (51% das vagas abertas).
- A abertura é rápida (criação → publicação em 8 dias na mediana); o gargalo é a seleção (aprovação → aceite da carta com mediana de 16 dias, mas p90 de 56 e cauda até 463) e a admissão (aceite → admissão com mediana de 16 dias).
- O funil vaza no comparecimento: 43% dos candidatos abordados não aparecem ou não respondem; só 8% são aprovados. O no-show vai de 11% em Teresina a 59% em Belém e 64% em Maceió.
- 75% das contratações são a R$ 1.621 (salário mínimo); "salário incompatível" é o segundo motivo de recusa. É restrição de remuneração, não de recrutamento.
- A planilha não consegue sustentar o que a gerência pede: as seis datas de etapa estão 100% vazias, o status está preenchido em 45% das linhas, 42% das contratações não têm origem, o congelamento global gera tempos negativos, e 492 registros com CPF, endereço e telefone circulam num arquivo.

**A proposta** é um módulo "Atração & Seleção" dentro do grupo `(dashboard)` do Rheply, construído sobre o que já existe (Next.js 14, shadcn/ui, recharts, react-hook-form + zod, o padrão de upload de currículo), com três movimentos: importar as exportações da Gupy de forma idempotente e com histórico; capturar o funil por eventos no ato (ações rápidas, grid de colagem na transição, integração com o pré-cadastro do Rheply); e projetar painéis para três públicos (visão FUP de uma página para a superintendência, telas de estoque, fluxo e funil para a equipe, operação e qualidade para a analista). O painel HTML atual é a especificação validada das duas primeiras telas.

**Plano em ondas**, cada uma com saída observável na rotina de sexta-feira:

| Onda | Entrega | Saída | Duração |
|---|---|---|---|
| 0 | Modelo de dados, endpoints de leitura e importação, regras de cálculo testadas contra a planilha | Um arquivo real entra sem PII e os totais batem | 1 semana |
| 1 | Assistente de importação, complemento da vaga, telas Vagas em aberto e Contratações, qualidade dos dados | A FUP de sexta sai do Rheply sem abrir a aba de vagas | 2 semanas |
| 2 | Candidaturas e eventos de etapa, ações rápidas, grid de colagem, funil e operação, tela da vaga | 80% das candidaturas novas com datas de etapa (hoje: 0%) | 2 a 3 semanas |
| 3 | Visão FUP de uma página, metas por cargo, "desde a última FUP", lembrete de sexta, papéis | A superintendência recebe a FUP gerada pelo Rheply | 2 semanas |
| 4 | Turnover por coorte, API da Gupy v2 + webhooks, PCD e cota, RI, custo, segunda diretoria | Itens 2, 4, 5, 9 e 12 da pauta | contínua |

**Achados da pesquisa que mudam o desenho:** os benchmarks (SHRM, Gem, Ashby, Gupy, Intera) confirmam mediana e p90 como medida, tempo bruto e líquido de congelamento como dois números oficiais, aging em faixas de 0–15 / 16–30 / 31–60 / 60+ dias para vagas operacionais, e limiares de alerta (tempo em etapa > 14 d, aceite < 75%, no-show > 10%); a legislação trabalhista (aviso prévio, exame admissional, eSocial, experiência de 90 dias) justifica sub-etapas de admissão e o no-show de dia 1; a Gupy tem API pública v2 (planos Scale/Enterprise) com histórico de etapas por candidatura, motivo de reprovação e até desligamentos, o que vira o canal 3 de ingestão na onda 4, sem eliminar a captura própria; hash simples de CPF é reversível (ANPD), então a chave de pessoa é o ID da Gupy e, se preciso, HMAC com chave em cofre; dados de PCD só com base em obrigação legal e só agregados; o gráfico de funil geométrico distorce e deve virar barras com conversão escrita; e o pacote `xlsx` do npm carrega CVEs sem correção.

**Dez decisões dependem de você ou da analista** (seção 8), entre elas a chave de pessoa, a regra de congelamento, a taxonomia de motivos, a retenção e quem implementa o backend. Cada uma vem com recomendação.

**Sumário do documento:** 2. Análise dos insumos · 3. Pesquisa · 4. Proposta · 5. Abordagens · 6. Plano em ondas · 7. Riscos · 8. Decisões em aberto · 9. Fontes · Apêndices A (mapa de colunas), B (taxonomia de motivos), C (estados e eventos).

## 2. Análise dos insumos

### 2.1 Anatomia da planilha: três naturezas de dado em um único arquivo

A planilha `ATRAÇÃO E SELEÇÃO teste.xlsx` tem 9 abas (4 visíveis, 5 ocultas). Ela mistura três naturezas de dado que, num sistema, precisam viver separadas:

| Aba | Natureza | O que contém | Linhas × colunas |
|---|---|---|---|
| `BASE GERAL VAGAS` (oculta) | **Exportação Gupy** + enriquecimento manual | Todas as vagas desde mar/2024, 59 colunas. As colunas AS–BF (tipo de abertura, centro de custo, qualificação, sugestão salarial, tipo de recrutamento, horário, motivo da abertura, nome da pessoa substituída) são digitadas à mão. | 333 × 59 |
| `1. VAGAS ABERTAS` | Exportação Gupy filtrada + **fórmulas** | Vagas em aberto em 01/09/2026, com 11 colunas calculadas de tempo (TM O&R, TM R&S, TM ciclo, dias acumulados, com e sem congelamento). | 45 × 49 |
| `2. POSIÇÕES FECHADAS` | Exportação Gupy de contratados + 1 fórmula | Uma linha por pessoa contratada em 2026, com dados pessoais completos (nome, CPF, e-mail, telefone, endereço, nascimento). A coluna A (data de aceite da carta) e a G (aprovação O&R) vêm "de outro relatório". | 492 × 45 |
| `3. FUNIL GERAL` | **Registro manual** por candidato | Uma linha por candidato por vaga: origem, 6 datas de etapa, status único, motivo, anotações. Alimentada a partir das fichas de entrevista. | 346 × 22 |
| `LISTA SUSPENSA` (oculta) | **Taxonomia** | Origem do candidato (14), etapa/status (14), motivo de reprovação/declínio (48 + 4 de admissão). | — |
| `PAUTA R&S`, `PAUTA FUP` (ocultas) | **Governança** | Pauta da FUP semanal com 12 itens, responsáveis, prazos. | 12 itens |
| `Formulas` (oculta) | **Documentação** | Explicação das colunas calculadas. | — |
| `VAGAS ABERTAS COM A CONSULTORIA` (oculta) | vazia | Intenção de separar vagas trabalhadas por consultoria externa. | 0 |

Três consequências dessa mistura:

1. **A exportação da Gupy é sobrescrita a cada semana.** O histórico só existe no que a analista lembra de guardar. Não há como responder "quantas vagas estavam abertas há 8 semanas?".
2. **As regras de negócio vivem em fórmulas com uma "Data Hoje" digitada.** Cada aba tem uma data de referência diferente (24/08, 27/08 e 01/09 no mesmo arquivo). As métricas de aging não são comparáveis entre abas.
3. **A taxonomia existe, mas não é imposta.** As listas suspensas são sugestões. Na prática, "Carta Oferta" aparece 29 vezes como *motivo* (é um status), e a coluna de anotações repete o motivo em texto livre ("Não compareceu a entrevista" 85 vezes, "AUSENTE" 27).

### 2.2 O que os dados dizem

Os números abaixo foram calculados diretamente das abas (valores em cache do Excel), não do painel HTML.

**Escala da operação (mar/2024 a ago/2026)**

| Indicador | Valor |
|---|---|
| Vagas (requisições Gupy) | 333 (2024: 119 · 2025: 123 · 2026 até ago: 91) |
| Posições | 2.036 (média 6,1 por vaga; máximo 40) |
| Contratações | 1.836 (≈ 63 por mês) |
| Inscritos na Gupy | 113.036 (mediana 55 por posição; p90 390; máximo 4.784) |
| Taxa de preenchimento das vagas encerradas | 91% (26 vagas encerradas sem nenhuma contratação) |
| Recrutadores / gestores / filiais / cargos | 5 / 29 / 14 / 30 |

**Dois funis com dinâmicas opostas.** Atendente I (call center de Teresina, Imperatriz e Porto Alegre) responde por 81% das contratações de 2026, em ondas (144 aceites em janeiro, 18 em abril, 90 em julho). Promotor de Vendas I (varejo de Belém, São Luís, Macapá) responde por 51% das vagas abertas, em fluxo contínuo de reposição. Qualquer painel que mostre só a média mistura os dois e erra para ambos.

**Salário é uma restrição estrutural, não de recrutamento.** 75% das contratações de 2026 foram a R$ 1.621, o salário mínimo. "Salário/pretensão incompatível" é o segundo motivo de recusa declarado no funil (25 casos). Isso é insumo para O&R, e o painel precisa deixar isso visível para a gerência.

**Tempos: a mediana conta outra história que a média.**

| Etapa | Mediana | Média | p90 | Máximo |
|---|---|---|---|---|
| Criação → aprovação (O&R) | 6 d | 10,3 d | 22 d | 114 d |
| Aprovação → publicação (R&S) | 2 d | 3,7 d | 9 d | 48 d |
| Criação → fechamento da vaga (encerradas) | 51 d | 77,6 d | 170 d | 721 d |
| Aprovação O&R → aceite da carta (por posição, 2026) | 16 d | 27,3 d | 56 d | 463 d |
| Aceite da carta → admissão (2026) | 16 d | 18,5 d | 32 d | 65 d |

A abertura é rápida (criação → publicação em ~8 dias na mediana). O gargalo está na seleção e na admissão. A cauda longa (vagas de 200 a 700 dias) puxa toda média para cima, por isso o painel deve trabalhar com mediana, percentis e faixas de aging, nunca só com a média.

O tempo de posição varia muito por praça e cargo: Imperatriz fecha em 2 dias na mediana (call center em onda), Teresina em 15, Belém em 37, Porto Alegre e Macapá em 48. Promotor de Vendas leva 38 dias na mediana contra 15 do Atendente.

**O funil vaza no comparecimento.** No piloto do funil (346 candidatos, 30 vagas, uma única analista):

| Desfecho | Candidatos | % |
|---|---|---|
| Não compareceu ou não respondeu (ghosting) | 148 | 43% |
| Sem motivo registrado | 75 | 22% |
| Candidato declinou (salário, mobilidade, outra proposta…) | 60 | 17% |
| Empresa reprovou (perfil, técnico, escolaridade) | 34 | 10% |
| Aprovado (carta oferta) | 29 | 8% |

O no-show é radicalmente desigual por praça: Belém 59%, Maceió 64%, Macapá 38%, São Luís 19%, Teresina 11%. Uma única vaga de Promotor em Belém consumiu 104 abordagens para 14 aprovações, com 79 faltas. Esse é o tipo de achado que o painel HTML já entregou e que gerou o impacto relatado.

**A Gupy não vê o funil.** Cruzando a data de inscrição na Gupy com a data de aceite da carta oferta: 71% dos Atendentes foram inscritos na Gupy no mesmo dia ou depois do aceite (na carteira de uma das recrutadoras, 95%). Para Promotor, 51%. Ou seja, o candidato é sourceado por WhatsApp, indicação, presencial ou pelo pré-cadastro do Rheply (Porto Alegre), passa por todo o processo fora da Gupy, e só é "inscrito" para gerar a admissão. Isso muda o diagnóstico: o problema não é "a Gupy falha nos relatórios", é que **o funil acontece fora dela**. Nenhuma integração com a Gupy resolve isso; a captura do funil precisa ser feita onde ele acontece.

**Outros fatos relevantes para o desenho**

- Origem da candidatura em branco em 42% das contratações. Entre as conhecidas: LinkedIn 29%, indicação 15%, Google 12%, Portal Gupy 12%, WhatsApp 11%, Instagram 10%.
- 83% das vagas são substituição; desligamento (involuntário ou pedido) explica 65% dos motivos de abertura. Recrutamento é, em grande parte, reflexo do turnover, o que conecta este projeto ao item 2 da pauta (turnover em até 1 ano).
- Recrutamento interno: 2 vagas em 322 (0,6%), mais 7 por meritocracia. O item 4 da pauta (RI) parte praticamente do zero.
- PCD: 27 contratações em 2026 (5,5%); 40 das 45 vagas abertas estão marcadas como elegíveis a PCD. A cota legal (Lei 8.213/91) é de 2% a 5% do quadro, então o indicador relevante é sobre o quadro, não sobre as contratações.
- 63% das contratações são de mulheres; idade mediana 26 anos.
- Indicação de colaborador: 24 confirmadas e 9 pendentes, com 43 contratações de origem "Indicação". O programa de indicação existe e não está sendo medido.

### 2.3 Qualidade de dados: o que a planilha não consegue garantir

Esses achados definem o que o sistema precisa **impedir**, não só exibir.

| Problema encontrado | Evidência | Efeito | O que o sistema faz diferente |
|---|---|---|---|
| Datas de etapa nunca preenchidas | As 6 colunas de data do funil (abordagem, retorno, entrevista RH, entrevista gestor, decisão, teste) estão 100% vazias nas 346 linhas | Não existe tempo em etapa; só desfecho | Data capturada no ato da ação, com padrão "hoje" e edição para retroativo |
| Status parcial | "Status Único" preenchido em 45%; "Motivo" em 78% | O painel HTML precisou derivar o resultado do motivo | Status é derivado do último evento; motivo é obrigatório só onde faz sentido |
| Status usado como motivo | "Carta Oferta" 29× na coluna Motivo | Mistura eixos | Taxonomia com eixos separados: etapa × resultado × motivo |
| Taxonomia redundante | 48 motivos, dos quais ~25 são variações de "perfil técnico não aderente" | Análise por motivo fica pulverizada | Taxonomia em dois níveis (categoria → motivo), ~20 motivos |
| Congelamento global | Só 32 de 333 vagas têm congelamento registrado na Gupy; uma data manual (25/06 → 01/09) foi aplicada a todas as 31 vagas "congeladas" | TM "com congelamento" negativo (−61, −64 d) nas vagas criadas depois de 25/06 | Períodos de congelamento por vaga, com origem (Gupy ou manual); o cálculo subtrai só a interseção com o ciclo |
| "Data Hoje" digitada | 24/08, 27/08 e 01/09 no mesmo arquivo | Aging inconsistente entre abas | Data de referência é a do snapshot importado ou a atual |
| Nomes livres | 12 grafias de "Atendente de Call Center"; "Estado" com valor "Solteiro(a)"; cidades em caixa mista | Filtros e agrupamentos quebram | Normalização na importação (cargo canônico, cidade/UF via IBGE já existente no Rheply) |
| Requisição interna em texto | "128 - 129 - 130 - 131 - 42640-6952497 Mapa Manual Teresina" | Relação posição ↔ vaga perdida | Campo estruturado de números de requisição por vaga |
| Horário de trabalho livre | 91 variantes ("180", "seg a sex 08:00 as 17:00 e sáb…") | Não agrupa | Lista controlada + texto opcional |
| Origem "Dai" | 15 candidatos no funil com origem "Dai" (não consta na lista) | Fonte desconhecida | Origem só por lista; "Outro" exige descrição |
| PII em circulação | CPF, endereço, telefone, e-mail e nascimento de 492 pessoas numa planilha compartilhada | Risco LGPD concreto | O importador descarta essas colunas por padrão (ver seção 4.8) |

### 2.4 O painel HTML: por que funcionou e o que falta

O arquivo `painel_atracao_selecao (1).html` é um painel estático de três abas (Vagas em aberto, Contratações, Funil), com Chart.js, dados embutidos em JSON, filtros por seção, seis KPIs, seis a oito gráficos, uma lista de insights e uma tabela pesquisável por aba.

**Por que teve impacto:**

1. Faz as três perguntas certas, em ordem: **estoque** (o que está aberto e há quanto tempo), **fluxo** (o que fechou e em quanto tempo), **vazamento** (onde e por que os candidatos somem).
2. Cada KPI tem uma sublinha de contexto ("mediana 16 d · 71% em até 30 d"; "5 vagas acima de 90 d"). Isso é o que transforma número em decisão.
3. Os filtros reescopam KPIs, gráficos e tabela ao mesmo tempo, então os números sempre batem entre si.
4. Os insights são frases com número, comparação e recomendação ("Belém 59% de no-show contra Teresina 11%: vale revisar convocação, horário e local").
5. A tabela permite auditar o número até a linha, sem expor dados pessoais.
6. Formatação pt-BR nativa, modo escuro e paleta categórica que passa no validador de daltonismo (rodei o validador do skill dataviz: as 8 cores passam nos dois temas; no tema claro, verde, âmbar e rosa ficam abaixo de 3:1 de contraste e exigem rótulo visível ou tabela).

**O que ele não consegue ser, por construção:**

| Limitação | Consequência |
|---|---|
| Snapshot embutido no HTML, regenerado à mão | Cada semana é um arquivo novo; não há tendência nem "o que mudou desde a última FUP" |
| Insights fixos, calculados fora | Ao filtrar, os insights ficam desatualizados (o próprio painel avisa) |
| Sem drill-down | Não dá para clicar numa vaga e ver seus candidatos e eventos |
| Sem captura de dados | Continua dependendo da planilha e da transcrição manual |
| Sem tempo em etapa | Porque as datas não existem na fonte |
| Sem metas ou SLA | Não há "vermelho" objetivo; a leitura depende da experiência de quem apresenta |
| Sem controle de acesso | O arquivo circula por e-mail; quem tem o arquivo tem tudo |
| Donuts para gênero e origem | Comparação de fatias próximas é difícil de ler; barras ou tiles funcionam melhor |

O painel é, portanto, a **especificação funcional validada** das duas primeiras telas do módulo. O plano abaixo o reproduz com dados vivos e acrescenta o que ele não pode ter.

### 2.5 Onde está a "energia excessiva": o ciclo semanal reconstruído

A pauta da FUP registra o diagnóstico da própria analista: *"Energia excessiva no preenchimento e construção da planilha"* (item 1) e a rotina *"toda sexta-feira até 12:00 atualizar as informações de vagas e funis"* (item 10). Reconstruindo o ciclo a partir da estrutura do arquivo:

| Passo semanal | Fonte | Natureza do trabalho | Automatizável? |
|---|---|---|---|
| 1. Exportar 2 a 3 relatórios da Gupy (vagas, contratados; aprovação O&R "de outro relatório") | Gupy | Mecânico | Sim: upload idempotente hoje; API se a Gupy disponibilizar |
| 2. Colar nas abas, reaplicar filtros e fórmulas, ajustar "Data Hoje" | Excel | Mecânico e frágil | Sim: importação com diff (novas, alteradas, ausentes) |
| 3. Enriquecer as vagas novas (tipo de abertura, centro de custo, qualificação, sugestão salarial, motivo, substituído) | Requisição interna, O&R | Consulta + digitação | Parcial: formulário curto por vaga com valores padrão por área/cargo e memória do último preenchimento |
| 4. Transcrever as fichas de entrevista para o funil (status, motivo, anotações) | Folhas de recrutamento | Transcrição a posteriori | Sim: registrar no ato, com ações rápidas; grid para lançamento em lote na transição |
| 5. Consolidar, calcular, montar a apresentação | Excel + HTML | Analítico e manual | Sim: painel vivo com "visão FUP" e modo apresentação |
| 6. Apresentar e registrar encaminhamentos | FUP | Humano | Apoiado: alertas e pendências geradas pelo sistema |

Os passos 1, 2, 4 e 5 concentram o esforço mecânico e são exatamente os que o módulo elimina. O passo 3 é reduzido, não eliminado, porque parte da informação (centro de custo, aprovação O&R) nasce fora do RH. O item 9 da pauta ("replicar o modelo para a Diretoria de Clientes e Serviços") indica que o módulo precisa nascer preparado para mais de uma diretoria.

### 2.6 A pauta da FUP como backlog de produto

| Item da pauta | Status na pauta | O que o módulo entrega | Quando |
|---|---|---|---|
| 1. Visão de vagas abertas/fechadas + funil | Em andamento | Painéis de estoque, fluxo e funil com dados vivos | Ondas 1 e 2 |
| 10. Rotina de alimentação (sexta 12:00) | Em andamento | Importação com diff, lembrete e indicador de frescor dos dados | Onda 1 |
| 11. Processo duplo interno/externo e vagas com consultoria | Concluído na planilha | Campos "tipo de publicação", "com consultoria" e "estratégica" na vaga | Onda 1 |
| 5. PCD: comitê semanal e cota | Concluído | Indicadores de contratação PCD e visão por vaga elegível | Onda 1 (contratações) |
| 2. Turnover em até 1 ano | Não iniciado; depende de base de O&R | Coorte de contratados × desligamentos por origem, recrutador, gestor, praça | Onda 4 (precisa da base de desligamentos) |
| 3. Perfil de sucesso por cargo | Não iniciado; depende do 2 | Cruzamento origem/avaliação × permanência | Depois do turnover |
| 4. Recrutamento interno (RI) | Em andamento | Indicador de taxa de RI e tipo de recrutamento por vaga | Onda 1 (campo) / Onda 3 (KPI) |
| 6. Vagas estratégicas com consultoria | Concluído | Flag por vaga e comparação consultoria × interno | Onda 1 |
| 9. Replicar para outra diretoria | Não iniciado | Modelo multi-diretoria desde o início | Onda 0 (modelo) / Onda 4 (rollout) |
| 12. Orçamento 2026 de R&S | Sem status | Custo por contratação (quando houver custos) | Futuro |

## 3. Pesquisa: o que o mercado, a Gupy, a engenharia, a lei e o wiki dizem

Quatro agentes de pesquisa trabalharam em paralelo (KPIs e benchmarks; Gupy; importação, visualização e LGPD; wiki pessoal). Os briefs completos, com todas as fontes, estão em `docs/superpowers/research/`. Aqui, o que muda o desenho.

### 3.1 KPIs canônicos e benchmarks

**Padrões.** A SHRM define *time-to-fill* como "dias corridos da abertura da requisição até o aceite da oferta, incluindo fins de semana e feriados", decomposto em sub-relógios (abertura → aprovação → publicação → triagem → entrevistas → oferta → aceite). O padrão ANSI/SHRM 06001.2012 define custo por contratação como custos internos + externos ÷ contratações. A ISO 30414 lista, para recrutamento: candidatos qualificados por posição, qualidade da contratação, tempo para preencher vagas e vagas críticas, % preenchidas internamente, turnover e motivos de saída; as especificações ISO/TS 30407, 30411, 30421 e 30430 detalham custo, qualidade, turnover e métricas de recrutamento.

**Congelamento.** Não há padrão para *hold*; a prática dos ATS (Hirebridge, SAP SuccessFactors) é publicar dois números: tempo bruto (comparável com o mercado) e tempo líquido (eficiência do R&S). A planilha já faz isso; o módulo formaliza.

| KPI | Definição e relógio | Benchmark | Fonte |
|---|---|---|---|
| Time-to-fill (mediana) | requisição aberta ou aprovada → aceite da oferta, dias corridos | SHRM não executivo: mediana 44 d (2021), 39 d (2026); Bersin: energia é o setor mais lento (67 d); Brasil: 39,6 d (Glassdoor), 42 d (Gupy, 2021) | SHRM, Bersin, Glassdoor, Gupy |
| Tempo de aprovação e publicação | criação → aprovação; aprovação → publicação | SHRM: mediana 7 d + 2 d | SHRM |
| Time-to-hire (do candidato) | 1º contato → aceite | Gem 2024: 41 d geral; atendimento 26 d, operações 25 d, vendas 35 d | Gem |
| SLA por nível (Brasil) | prazo-alvo de preenchimento | Gupy: operacionais 15 a 25 d; técnicas 25 a 35; gerenciais 40 a 50; triagem ≤ 5 dias úteis | Gupy |
| Tempo em etapa | entrada → saída da etapa (censurado se aberta) | < 7 d por etapa ativa; > 14 d é atrito | Metaview |
| Aging de vagas abertas | hoje − abertura, por faixa | Taleo usa 0–45 / 45–100 / 100–150 / 150+; para operacionais com SLA de 15 a 25 d, faixas de 0–15 / 16–30 / 31–60 / 60+ | Taleo, Gupy |
| Conversão por etapa (coorte de entrada) | avançaram ÷ entraram na etapa no período | Gem 2024: candidatura → contratação 0,5% (atendimento 0,7%, vendas 0,6%); Ashby: triagem 35%, presencial 24%, oferta 81% | Gem, Ashby |
| Aceite da oferta | aceites ÷ ofertas | Gem 84% (2024), 82% (2026); atendimento 90%, vendas 88%; alerta abaixo de 75% | Gem, Metaview |
| Recusa e desistência (Brasil) | ofertas recusadas ÷ ofertas | Intera 2021: 35,5% recusadas; motivos: contraproposta 36,7%, outro processo 26,3%, **salário 18,7%**; processos < 20 d têm 70% de aceite, > 30 d têm 50% de recusa. Sólides 2025: 44% desistem por salário abaixo da média | Intera, Sólides |
| No-show de entrevista | faltas ÷ entrevistas agendadas | Horistas: 30 a 50% típico; 8 a 12% nas melhores (lembretes por SMS em 48 h, manhã e 2 h antes; auto-agendamento); < 10% aceitável | CloudApper, KPI Depot |
| Turnover precoce | desligados ≤ 90 d ou ≤ 12 m ÷ admitidos da coorte | Mais de 1/3 dos novos contratados sai no 1º ano (Work Institute); varejo 20 a 30% em 90 d; Brasil: 48,3% dos primeiros empregos terminam ao fim da experiência de 90 d; rotatividade formal 33,6% (CAGED 2025), serviços 32,1% | Work Institute, IDados, CAGED |
| Carga por recrutador | vagas abertas ÷ recrutadores | SHRM: mediana 20 (p25 6, p75 50); alto volume 60+; contratações por recrutador em frontline: 25 a 40 por trimestre | SHRM, Metaview |
| Fonte de contratação | conversão por origem | Ashby: candidatura → entrevista: interno 42%, indicação 40%, agência 42%, inbound 3%; entrevista → oferta: interno 32%, indicação 16%, agência 8%, inbound 6% | Ashby |
| PCD (cota) | PCD ativos ÷ cota (2 a 5% do quadro por faixa, Lei 8.213/91) | Setor privado cumpre 55% da cota (eSocial 2025); Equatorial 2020 por distribuidora: MA 4,95%, PA 5,74%, PI 2,37%, AL 1,94%; multa 2026 de R$ 3.499,80 por vaga não preenchida; o TST só afasta a multa com prova de esforço (campanhas, candidaturas registradas) | CUT/eSocial, RS Equatorial 2020, Migalhas |
| Qualidade da contratação | desempenho pós-contratação vs. expectativa (ISO/TS 30411): aprovado na experiência, meta em 90/180 d, retenção, satisfação do gestor | Só 20% das empresas medem (SHRM 2025) | AIHR, SHRM |

**Especificidades brasileiras que explicam a "desistência na documentação"** e pedem sub-etapas próprias no funil: aviso prévio de 30 dias para quem está empregado (o candidato só entra ≥ 30 dias após o aceite); exame admissional obrigatório antes do início (CLT art. 168); eSocial S-2200 até o dia anterior ao início (ou S-2190 preliminar); contrato de experiência de até 90 dias com rescisão antecipada custando 50% dos dias restantes, o que concentra desligamentos nos dias 45 e 90. Por isso o modelo mede separadamente **aceite → documentação completa → admissão (eSocial) → dia 1**, monitora o **no-show de dia 1** (aceitou e não começou) e marca os cortes de 45 e 90 dias na coorte.

**Contexto setorial.** A Equatorial Serviços se apresenta como "primeira multisserviços do setor" (call center, vendas, back-office em MA, PA, PI, AL e RS); as vagas de Promotor de Vendas vendem seguros e assistências porta a porta para clientes das distribuidoras; o grupo abriu 37 vagas de televendas em Teresina em maio de 2025 com mais 100 previstas, o que explica as ondas de contratação. O Relatório de Sustentabilidade 2020 do grupo registra rotatividade de 21,4% e cinco frentes de atração (RI, externo, estágio, trainee, aprendiz); não há relatório 2023/2024 publicado. Não existe benchmark público de tempo de preenchimento ou conversão para promotor de vendas ou call center no Norte e Nordeste: o histórico da própria empresa (mediana 15 d para Atendente, 38 d para Promotor) é a referência.

**O que muda no desenho:**

1. Publicar sempre **mediana e p90**, com o tempo bruto como número oficial (comparável com SHRM) e o líquido como eficiência do R&S.
2. Faixas de aging calibradas ao SLA operacional da Gupy: **0–15 / 16–30 / 31–60 / mais de 60 dias**, em vez de 0–30 / 31–60 / 61–90 / mais de 90.
3. Limiares de alerta vindos do mercado: tempo em etapa > 14 d; aceite de oferta < 75%; salário como motivo de recusa > 30% dos motivos; no-show de entrevista > 10%; candidato sem retorno > 5 d (o prazo já usado pela equipe, alinhado ao dado do Ashby de que arquivar em 1 dia dá NPS 9 contra NPS 3 após 50 dias).
4. O funil ganha as sub-etapas de admissão (documentação, eSocial, dia 1) e o indicador de no-show de dia 1.
5. O indicador de PCD sobre o quadro precisa do headcount por filial (entrada manual mensal ou HRIS), e o registro de vagas afirmativas e candidaturas PCD vira **evidência jurídica** de esforço.
6. Conversão sempre por **coorte de entrada na etapa**, nunca por snapshot, como o Gem separa "Funnel view" de "Activity view".
7. Dois números de carga por recrutador (vagas abertas; contratações por trimestre) com as referências de 20 vagas e 25 a 40 contratações por trimestre em frontline.

### 3.2 O que a Gupy entrega e o que não entrega

A pesquisa leu a documentação oficial de desenvolvedores (developers.gupy.io) e o que foi possível dos artigos de suporte. Achados que mudam o desenho:

**Existe API pública, e ela é boa para BI.** Base `https://api.gupy.io/api/v2`, token Bearer gerado por administrador da conta (SETUP > Configurações Avançadas > Tokens), disponível nos planos Scale e Enterprise (antigos Premium/Enterprise). Limite de 500 requisições por minuto por IP. Uma empresa do porte da Equatorial muito provavelmente já tem o plano; falta apenas um administrador gerar o token.

| Dado | Disponível? | Onde |
|---|---|---|
| Vagas com status, datas (criação, aprovação, publicação, fechamento, cancelamento), posições, recrutador, gestor, motivo, salário | Sim | `GET /api/v2/jobs?updatedAfter=…&expand=positions,posting,recruiter,manager,…` |
| Último congelamento e descongelamento | Sim (só o último ciclo) | `lastFrozenAt`, `lastUnfrozenAt` |
| Todos os ciclos de congelamento | Só via webhook | `job.status-changed` (published → frozen → published…) |
| Motivo e autor do cancelamento | Sim (v1) | `cancelReason`, `canceledByEmail` |
| Trilha de aprovação (quem aprovou, quando) | **Não** | a própria Gupy documenta que dados de workflow não saem pela API |
| Candidaturas de todas as vagas, com `updatedAfter` | Sim (v2) | `GET /api/v2/applications` |
| **Histórico de etapas por candidatura com data de entrada e saída** | **Sim (v2)** | `expand=steps` → `{name, category, order, startDate, endDate}` |
| Motivo de reprovação por candidato, quem reprovou, se foi manual ou por pergunta eliminatória | Sim (v2) | `disqualification{reason, observation, trigger, disqualifiedBy}` |
| Datas de contratação, desistência e reprovação | Sim (v2) | `hiredAt`, `withdrawnAt`, `disqualifiedAt` |
| Origem da candidatura (60+ valores, inclui WhatsApp, chatbot, banco de talentos, inserção manual) | Sim (v2) | `source` |
| Indicação (indicante e status) | Sim | `referral{referrer, status}` |
| Salário e tipo de contratação | Sim (v1) | `GET /jobs/{id}/applications/{id}/hiring-information` |
| Diversidade (gênero, raça, PCD) anonimizada | Sim (v2) | `GET /api/v2/applications-diversity` |
| Resultados de testes de parceiros (MAPA) | Só relatório "Testes"; sem API do cliente | — |
| **Desligamentos e avaliação de desempenho pós-contratação** | Sim, se o RH registrar na Gupy | `GET /dismissals` (motivo, data, recontratado) e `GET /performance-evaluations` |
| Datas de entrevista com gestor, devolutiva, aceite da proposta, início real | **Não** | precisam ser capturados fora |

Webhooks disponíveis: `application.created`, `application.moved` (mas **não dispara para reprovação e desistência**), `candidate.hired`, `job.published`, `job.status-changed`, `pre-employee.moved` (Gupy Admissão). Entrega *at least once*, sem ordem, com retentativas por 2 horas; `application.created` pode atrasar mais de uma hora.

Relatórios nativos (planos Scale/Enterprise): Vagas, Histórico de status de vagas, Inscrições, Contratações, Indicações, Visão geral de etapas, Funil de etapas, Testes. Não há agendamento dos exports da plataforma; só os relatórios enviados pelo suporte têm periodicidade. Não há conector nativo de Power BI ou Google Sheets; o caminho oficial de BI é API → base própria → ferramenta.

Sobre o teste comportamental: "MAPA" é o teste de personalidade da Mapa HDS (48 traços), que se integra à Gupy como provedor de teste. O resultado chega pelo relatório de testes, não pela API do cliente.

**Consequências para o plano:**

1. O canal 3 (API) é viável e cobre mais do que as exportações: para as candidaturas que passam pela Gupy (varejo, parte dos supervisores e analistas), o histórico de etapas com datas vem pronto, o que dá tempo em etapa sem digitação.
2. Nada disso substitui o canal 2. Para o call center, 71% das pessoas só existem na Gupy no dia da contratação; o funil delas não deixa rastro lá.
3. Os ciclos completos de congelamento exigem assinar `job.status-changed` desde o início da integração; até lá, os snapshots semanais de importação são o histórico.
4. `GET /dismissals` é uma alternativa para o item 2 da pauta (turnover em até 1 ano) sem depender de outra área, desde que o RH registre desligamentos na Gupy.
5. As etapas da Gupy têm uma `category` padronizada (registration, screening, evaluation, pre-interview, interview, pre-hiring, offer, hiring). O modelo do Rheply mapeia por categoria, não por nome de etapa, para conciliar as duas fontes.
6. A lista exata de colunas dos relatórios nativos não pôde ser lida (central de ajuda protegida). Uma amostra de "Histórico de status de vagas" e "Funil de etapas" exportada pela analista fecha esse mapeamento.

### 3.3 Importação de planilhas: o que os melhores importadores fazem

Flatfile, Dromo e OneSchema convergem no mesmo fluxo: enviar → escolher aba e linha de cabeçalho → casar colunas (com proposta automática e memória do mapeamento anterior) → validar com correção em grade, na própria linha → confirmar. A frase do Dromo resume o porquê: *"quem consegue corrigir a linha 4.812 no lugar completa a importação; quem precisa voltar ao Excel abre um chamado"*. Validação em quatro camadas: obrigatórios, tipos, formatos e **unicidade contra registros existentes**. HubSpot e Salesforce mostram que "desfazer importação" na prática é "excluir os registros que vieram deste lote", o que exige guardar o lote de origem em cada registro.

Engenharia: upsert por chave natural (`INSERT … ON CONFLICT DO UPDATE`), hash das colunas rastreadas por linha para detectar mudança (padrão SCD tipo 2), identificador de lote em cada registro.

Bibliotecas de leitura, com uma ressalva importante: o pacote `xlsx` do npm (SheetJS) está parado na 0.18.5 há anos e carrega duas CVEs corrigidas só nas versões distribuídas pelo CDN próprio da SheetJS. Alternativas MIT: **ExcelJS** (xlsx e csv, leitor em streaming) e **read-excel-file** (xlsx, schema tipado com erro por linha e coluna, roda em Web Worker); **PapaParse** para CSV. Regras práticas: ler o `.xlsx` original em vez de CSV (evita problemas de encoding windows-1252 e delimitador `;`), converter datas seriais do Excel em data civil (AAAA-MM-DD) com fuso fixo em UTC, usar o valor em cache das células com fórmula e rejeitar células sem cache, e reconhecer abas ocultas (`Hidden` = 1 ou 2).

Sobre limites de upload na Vercel: a documentação de funções ainda cita 4,5 MB de corpo por requisição, enquanto a nota de plataforma desta sessão fala em 100 MB. As exportações da Gupy têm centenas de KB a poucos MB, e o backend do Rheply é um servidor separado, então o limite provavelmente não se aplica; se o upload passar por uma função Vercel, o caminho robusto é o upload direto do cliente para o Vercel Blob (store privado, região `gru1` em São Paulo) e processamento assíncrono.

Um importador React de código aberto (`react-spreadsheet-import`, MIT) implementa exatamente os cinco passos, mas depende de Chakra UI, o que conflita com o shadcn/ui do Rheply. A recomendação é reproduzir o fluxo com os componentes existentes, reaproveitando `parsing-preview` e `cv-uploader`.

Grids editáveis para o lançamento em lote: **react-data-grid** (MIT, colar do Excel, teclado) ou **Glide Data Grid** (MIT, canvas, `onPaste`). AG Grid Community não inclui área de transferência (recurso Enterprise) e Handsontable é pago. TanStack Table é headless e exige implementar tudo.

Evidência de UX que sustenta as escolhas: validação inline aumentou a taxa de sucesso em 22% e reduziu o tempo em 42% no estudo de Wroblewski; NN/g recomenda validar ao sair do campo, mensagem junto ao campo, calendário só para datas próximas; taxas de erro de digitação humana ficam entre 0,6% e 3,6% por campo, o que, em 346 linhas × 22 colunas, significa dezenas de erros silenciosos por versão da planilha.

### 3.4 Taxonomia de motivos e captura por eventos

Greenhouse, Ashby e Lever organizam o motivo em **tipo → motivo específico**: "a empresa reprovou", "o candidato recusou", "outro/administrativo". Ashby recomenda especificidade ("proposta recusada" não é acionável; "remuneração não competitiva" ou "aceitou proposta concorrente" são), monitorar a fração de "outro" como métrica de qualidade da própria taxonomia e usar motivos genéricos no início do funil e por critério nas etapas finais. A Gupy, na plataforma, torna o motivo obrigatório ao reprovar e expõe um enum próprio (`disapprovalReason`); alinhar rótulos ao enum da Gupy facilita a conciliação quando o canal 3 entrar.

Todos os ATS modernos guardam a etapa como **evento com data de entrada e saída** (Greenhouse `application_stages.entered_at/exited_at`; Ashby `applicationHistory`, com correção da hora de entrada permitida). Sem isso, o tempo por etapa "é digitado à mão e não serve para análise de gargalo". É a mesma conclusão do wiki: comportamento observado supera autorrelato ([[processamento-inconsciente]]).

### 3.5 Visualização de funis e painéis

A crítica ao gráfico de funil é consistente (Storytelling with Data, Peltier): as barras não compartilham linha de base, o desenho sugere que "afunila" mas não diz quanto, e o formato trapezoidal distorce a leitura de área. A alternativa é barra horizontal por etapa com a conversão entre etapas escrita, e diagrama de fluxo (Sankey) só para mostrar múltiplas saídas por etapa, com poucos nós. Para tempos, mediana e p90 com histograma, nunca só média (a média de mercado de 54 dias de tempo de preenchimento, SHRM 2022, diz pouco sem a distribuição). Para KPIs semanais, gráficos de comportamento de processo (XmR, Wheeler) separam sinal de ruído em vez de comparar só com a semana anterior. Para comparar praças e recrutadores, pequenos múltiplos (Tufte).

Layout (Few): uma tela; cada medida com contexto ("comparado com o quê? estamos no caminho?"); sem precisão excessiva; o mais importante no canto superior esquerdo; cor contida. Anatomia do tile de KPI: rótulo, valor, delta contra meta ou período com direção, mini-tendência sem eixos, faixas de limiar; bullet graph no lugar de velocímetro. Paleta: variar luminosidade, testar em simulador de daltonismo, Okabe-Ito como categórica segura.

Bibliotecas: **Recharts 3** (já no Rheply; MIT; 144 KB gzip; Sankey e FunnelChart nativos; camada de acessibilidade por teclado ativa por padrão na v3) é suficiente; Nivo, visx e ECharts não trazem ganho que justifique a segunda biblioteca; Chart.js (a do painel HTML) é canvas e não tem SSR nem acessibilidade nativa.

### 3.6 LGPD aplicada a analytics de candidatos

| Tema | O que a pesquisa encontrou | Decisão no desenho |
|---|---|---|
| Base legal para dados de candidatos | Guia FGV (2023): procedimentos preliminares de contrato (art. 7, V) e legítimo interesse (art. 7, IX); consentimento é de difícil aplicação | Registrar no inventário; sem consentimento como base principal |
| Dados sensíveis | Procedimentos preliminares e legítimo interesse **não cobrem sensíveis**; deficiência é tratada como sensível; base para PCD é **obrigação legal** (cota, Lei 8.213/91, art. 11, II, a) | PCD só para acompanhamento da cota, agregado; gênero e raça só se houver consentimento já colhido na Gupy, e só agregados |
| Endereço, telefone, nascimento | FGV alerta que endereço pode gerar preterição; não têm papel em analytics | Descartados na importação |
| CPF como chave | CPF é identificador único (Lei 14.534/2023); ANPD (estudo de anonimização, 2023) diz que hash puro é reversível por força bruta porque o espaço de CPFs é enumerável; pseudonimizado continua dado pessoal | IDs da Gupy como chave; se precisar cruzar por CPF, HMAC com chave em gerenciador de segredos; nunca hash simples |
| Cortes pequenos | ANPD exemplifica k-anonimização | Suprimir células com menos de 5 pessoas em recortes sensíveis |
| Retenção | Fim da finalidade → eliminar (arts. 15/16); até 2 anos por analogia à prescrição trabalhista; agregados anonimizados podem ficar (art. 16, IV) | Nome anonimizado 12 meses após o último evento; eventos pseudonimizados por 24 meses; depois só agregados |
| Governança | Encarregado (Res. ANPD 18/2024); ROPA (art. 37); RIPD recomendado pelo volume e sensíveis; incidentes comunicados em 3 dias úteis (Res. 15/2024); transferência internacional exige cláusulas-padrão (Res. 19/2024) | Inventário versionado; se usar Vercel Blob ou banco gerenciado, região `gru1` (São Paulo) e DPA assinado |
| Decisão automatizada (art. 20) | Sistema não deve reprovar sozinho | O módulo registra e mede; nunca decide |

### 3.7 O que o wiki pessoal acrescenta

O agente que consultou o wiki (index, overview, 31 páginas de conceitos, 6 fontes e 4 análises) devolveu 32 princípios. Os que mais moldaram o desenho, com as páginas de origem:

- **Uma pergunta por tela, hierarquia de outdoor.** Pessoas escaneiam e escolhem o primeiro razoável; a visão executiva responde a uma pergunta com uma métrica-norte e até quatro KPIs. [[leis-de-krug]] · [[navegacao-web]]
- **Quatro, não sete.** Cowan corrige Miller: grupos de até 4 ± 1 itens; KPIs em linhas de quatro; etapas do funil agrupadas em macro-etapas. [[memoria-cognicao]] · [[matilha-ux-foundation]]
- **Dois "eus", duas vistas.** O eu que lembra (executivo) responde a picos e finais; o eu que vive (operacional) responde a latência e fluidez. Não misturar na mesma tela. [[jtbd-positioning]] · [[cognicao-pensamento]]
- **Cor + forma + texto, nunca só cor**; um único destaque por tela. [[percepcao-visual]] · [[principios-cognitivos-produto]]
- **Sinal raro precisa gritar; alarmes frequentes são ignorados.** Poucos alertas, escalonados. [[atencao-foco]]
- **"O que mudou desde a última reunião" tem de ser explícito**, destacando o que contradiz a narrativa corrente (cegueira à mudança). [[percepcao-visual]] · [[atencao-foco]]
- **A reunião começa com informação, não com opinião**: 90% dos grupos começam por preferências; a resposta final tende a ser a primeira proposta do mais dominante. Dois minutos de leitura silenciosa do painel antes do debate. [[tomada-decisao]]
- **Mostre o que falta, comece em 20%, evite o reset ao bater a meta.** [[motivacao-comportamento]] · [[padroes-implementacao]]
- **Sessão de 7 a 10 minutos com fechamento; nunca terminar em erro ou vazio.** [[atencao-foco]] · [[peak-end-rule]]
- **Proveniência e frescor sempre visíveis**; esconder informação drena o reservatório de boa vontade. [[reservatorio-boa-vontade]]
- **Status deriva de eventos, não da opinião de quem preenche.** [[processamento-inconsciente]]
- **Soft-strict na importação**: aceitar variantes óbvias com aviso, bloquear só ambiguidade real; importar a planilha atual no dia 1 para vencer a força do hábito. [[matilha-ux-foundation]] · [[jtbd-positioning]]
- **Peça o mínimo, dê valor antes de pedir**; evento mínimo = candidato + etapa + data. [[reservatorio-boa-vontade]] · [[interacao-social]]
- **Defaults inteligentes**: data de hoje, recrutador logado, vaga usada por último, próxima etapa sugerida. [[principios-cognitivos-produto]] · [[tomada-decisao]]
- **Queijo suíço**: prévia → validação → diff → confirmação → desfazer o lote. [[erros-usabilidade]]
- **Hábito semanal por B=MAP**: âncora no ritual que já existe (a FUP), comportamento mínimo (um lançamento), celebração imediata (a consequência do lançamento aparece na hora). [[frameworks-comportamentais]] · [[hook-model]]
- **Evento é a fonte da verdade; o painel é projeção reconstruível**; ingestão idempotente com hash e diff; máquina de estados explícita com fila de revisão. [[dual-write-event-sourcing]] · [[argos-architecture-design-v3]] · [[design-cases]]
- **AARRR diagnostica, North Star direciona, coortes provam.** [[aarrr-growth-metrics]]

O wiki não tem páginas dedicadas a grids editáveis, painéis executivos de BI ou análise de coortes como tema próprio; o mais próximo são o caso "Dashboard Top 10" em [[design-cases]] e os tokens do [[gravicode-frontend-neural-interface]].

## 4. Proposta: módulo "Atração & Seleção" no Rheply

### 4.1 Visão

O Rheply já é o ponto de entrada de parte dos candidatos (pré-cadastro público e teste de digitação para o call center; a exportação `processos_seletivos_2026-01-11.xlsx` mostra 81 candidatos de Porto Alegre passando por esse fluxo). O módulo estende o produto de "pré-triagem" para **sistema de registro do funil e painel de BI de R&S**, em três movimentos:

1. **Receber** as exportações da Gupy de forma idempotente, com histórico (snapshots) em vez de sobrescrita.
2. **Capturar** o funil onde ele acontece: no ato da abordagem, da entrevista, da decisão, e não numa transcrição de sexta-feira.
3. **Projetar** painéis para três públicos, a partir dos mesmos eventos.

O princípio de arquitetura é um só: **o evento é a fonte da verdade; o painel é uma projeção reconstruível** ([[dual-write-event-sourcing]]). Se um número parecer errado, recalcula-se a projeção; nunca se edita o número.

**Três públicos, três modos de leitura**

| Público | Pergunta que precisa responder | Superfície | Frequência |
|---|---|---|---|
| Superintendência e gerência | "Estamos preenchendo as posições no prazo? O que mudou desde a última FUP? Onde preciso decidir?" | Visão FUP (1 página) | Semanal |
| Gestor da vaga | "Quais candidatos aguardam minha entrevista ou decisão? Há quanto tempo?" | Minhas vagas | Diária/semanal |
| Recrutador e analista | "O que está parado? O que preciso lançar? Os dados estão completos?" | Operação, importações, qualidade | Diária |

### 4.2 Métrica-norte e árvore de métricas

Escrita como frase, como pede o skill `growth-north-star-metric`:

> **Posições preenchidas por semana dentro do prazo-alvo do cargo.**

Quando a base de desligamentos da O&R existir (item 2 da pauta), a métrica ganha o qualificador *"e cujo contratado permanece 90 dias"*, que é o proxy de qualidade da contratação.

A equação de crescimento decompõe a métrica em alavancas com dono:

```
posições preenchidas =
    posições aprovadas (O&R)
  × candidatos abordados por posição (R&S – sourcing)
  × taxa de comparecimento (R&S – convocação, praça)
  × taxa de aprovação RH × taxa de aprovação do gestor (perfil, SLA do gestor)
  × taxa de aceite da carta oferta (remuneração – O&R)
  × taxa de conclusão da admissão (DP – documentação)
```

Cada termo é um KPI do painel e aponta para quem pode movê-lo. É o que permite separar, na FUP, "parcela do recrutamento" de "parcela de outros processos", exatamente a pergunta do item 3 da pauta.

**Os 12 indicadores do módulo** (definições completas na seção 3.1):

| # | Indicador | Pergunta | Corte principal |
|---|---|---|---|
| 1 | Posições abertas e aging por faixa (0–15, 16–30, 31–60, > 60 dias, calibradas ao SLA operacional) | Quanto estoque e há quanto tempo? | Filial, cargo, recrutador |
| 2 | Tempo de preenchimento por posição (mediana e p90; bruto e líquido de congelamento) | Quanto demora? | Cargo, filial |
| 3 | Tempo de aprovação (O&R) e de publicação (R&S) | Onde a abertura trava? | Mês, área |
| 4 | Conversão por etapa (pass-through) | Onde o funil vaza? | Cargo, praça, origem |
| 5 | Taxa de no-show por praça e etapa | Quem não aparece, onde? | Praça, dia da semana, horário |
| 6 | Desistências por categoria de motivo | Por que declinam? | Cargo, praça, salário |
| 7 | Aceite da carta oferta, conclusão da admissão (aceite → documentação → eSocial → dia 1) e no-show de dia 1 | Perdemos depois de aprovar? | Filial, mês |
| 8 | Origem eficaz (contratações ÷ abordados por origem) | Qual canal converte? | Cargo, praça |
| 9 | Preenchimento no prazo (% de posições dentro do SLA do cargo) | Estamos cumprindo o combinado? | Cargo, recrutador |
| 10 | Carga por recrutador (vagas ativas, candidatos em processo, pendências) | Quem está sobrecarregado? | Recrutador |
| 11 | PCD (contratações e vagas elegíveis; cota sobre o quadro quando houver base) | Cumprimos a cota? | Filial |
| 12 | Recrutamento interno e consultoria (taxa de RI; preenchimento via consultoria × interno) | Como preenchemos? | Cargo |

Ficam para depois, por dependerem de dados que hoje não existem: turnover em 90 dias e em 1 ano por coorte, custo por contratação, perfil de sucesso.

### 4.3 Regras de cálculo (o que hoje está em fórmula)

| Regra | Definição | Diferença em relação à planilha |
|---|---|---|
| Data de referência | `hoje` para vagas abertas; data do snapshot para importações históricas | Substitui a "Data Hoje" digitada |
| Tempo de aprovação (O&R) | `dt_aprovacao − dt_criacao` | Igual |
| Tempo de publicação (R&S) | `dt_publicacao − dt_aprovacao` | Igual |
| Tempo de posição | `dt_aceite_carta − dt_aprovacao_or` por contratação | Igual; passa a ter mediana, p75, p90 além da média |
| Tempo de preenchimento da vaga | `dt_fechamento − dt_aprovacao` (e o bruto desde a criação) | Novo |
| Tempo líquido de congelamento | tempo bruto − soma das interseções dos períodos de congelamento com o ciclo da vaga | Corrige os valores negativos: só desconta congelamento que aconteceu dentro do ciclo |
| Aging | `hoje − dt_aprovacao`, líquido de congelamento, em faixas de 0–15, 16–30, 31–60 e mais de 60 dias | Substitui "dias acumulados"; faixas calibradas ao SLA operacional de 15 a 25 dias |
| Conversão por etapa | candidaturas que saíram da etapa com resultado positivo ÷ candidaturas que entraram na etapa, por **coorte de entrada** | Novo; evita o erro de dividir saídas de um período por entradas de outro |
| No-show | eventos `nao_compareceu` ÷ eventos `agendado` da etapa | Novo |
| Pendência | candidatura em etapa aberta há mais de 5 dias sem evento (prazo já usado pela equipe) | Novo |
| Alertas por limiar | tempo em etapa > 14 d; aceite de oferta < 75%; salário > 30% dos motivos de recusa; no-show de entrevista > 10%; vaga acima do prazo-alvo | Novo; limiares vindos dos benchmarks da seção 3.1, ajustáveis |
| Prazo-alvo (SLA) por cargo | valor inicial = mediana histórica do tempo de posição; alerta = p75 histórico; ajustável pela gerência | Novo; parte de dados, não de opinião |

### 4.4 Modelo de domínio

Um único bounded context ("Atração & Seleção"), com vocabulário da equipe ([[swarch-context-by-vocabulary]]): vaga, posição, requisição, candidatura, etapa, motivo, congelamento, FUP.

| Entidade | Chave natural | Origem | Papel |
|---|---|---|---|
| `Diretoria` | slug | manual | Multi-diretoria desde o início (item 9 da pauta); toda entidade abaixo pertence a uma diretoria |
| `Vaga` | `codigo_gupy` | importação Gupy | Requisição com datas, status, posições, responsáveis |
| `VagaSnapshot` | `codigo_gupy + data_snapshot` | importação Gupy | Estado da vaga em cada importação (posições abertas, inscritos, status). É o que permite tendência semanal |
| `VagaComplemento` | `codigo_gupy` | formulário | As colunas manuais (tipo de abertura, centro de custo, qualificação, salário sugerido, tipo de recrutamento, escala, motivo da abertura, substituído, com consultoria, estratégica) |
| `Congelamento` | `codigo_gupy + inicio` | Gupy ou manual | Períodos, com origem e motivo |
| `Candidatura` | id interno (+ `id_inscricao_gupy` quando existir) | formulário, pré-cadastro Rheply, importação do funil legado | Candidato × vaga, origem, recrutador responsável |
| `EventoEtapa` | id | formulário (ações rápidas), importação legada | Fato imutável: etapa, resultado, data, motivo, nota, autor. Status é derivado |
| `Motivo` | código | seed (apêndice B) | Taxonomia em dois níveis, com etapas aplicáveis |
| `Contratacao` | `id_inscricao_gupy` | importação Gupy | Aceite, admissão, salário, origem, gênero, PCD, faixa etária; sem PII direta |
| `ImportacaoLote` | id | upload | Arquivo (hash), tipo, usuário, data, contagens (lidas, novas, alteradas, ausentes, rejeitadas), estado |
| `ImportacaoRejeicao` | lote + linha | upload | Linha rejeitada, coluna, motivo legível, valor original |
| `MetaCargo` | cargo (+ filial) | manual | Prazo-alvo e alerta |
| `Desligamento` (onda 4) | `pessoa_hash` ou matrícula | importação O&R | Data de admissão, data de desligamento, motivo; habilita turnover por coorte |

Decisões de simplicidade ([[sweng-kiss-antidote-overengineering]]): a Gupy não exporta códigos de posição (a coluna vem vazia), então **posição não é entidade**; é contagem na `Vaga` mais as `Contratacao` ligadas a ela. Se um dia a Gupy expuser posições, a entidade nasce do segundo caso real, não da antecipação. Também não há motor de regras: as regras da seção 4.3 são funções puras no serviço de métricas, testadas unitariamente.

### 4.5 Ingestão: três canais, um contrato

**Canal 1: upload das exportações da Gupy** (ondas 1 e 2)

Assistente em cinco passos, reaproveitando o padrão que o Rheply já tem para currículos (`use-cv-upload` + `cv-uploader` + `parsing-preview`):

1. **Enviar** o arquivo (`.xlsx`/`.csv`, arrastar ou selecionar). O sistema calcula o hash: arquivo idêntico a um já importado é reconhecido e não gera nada ("Este arquivo já foi importado em 29/08 às 11:40").
2. **Reconhecer** a planilha: detecta o tipo pela assinatura de cabeçalhos ("Código da vaga" + "Posições Abertas" = vagas; "ID da inscrição" + "Data de contratação" = contratados; "Status Único" = funil legado), a linha do cabeçalho (título na linha 1, cabeçalho na linha 3) e as abas ocultas. Mapeamento salvo por tipo; a analista só intervém se um cabeçalho novo aparecer.
3. **Validar** linha a linha, com a política *soft-strict* ([[matilha-ux-foundation]]): aceita variantes óbvias com aviso (grafias de cargo, cidade em caixa alta, datas em formatos diferentes) e bloqueia só ambiguidade real (código de vaga vazio, data impossível). Cada erro diz o que aconteceu, onde e como corrigir, com exemplo, e pode ser corrigido na própria célula.
4. **Prever o diff**: quantas vagas novas, alteradas (com os campos que mudaram), inalteradas e **ausentes** no snapshot (uma vaga que sumiu da exportação de "abertas" não é apagada; é marcada como "não presente no snapshot de 05/09", o que normalmente significa que fechou).
5. **Confirmar**. O lote é aplicado em transação; o arquivo original fica guardado para reprocessamento; o resultado termina em narrativa ("45 vagas lidas · 3 novas · 12 alteradas · 30 inalteradas · 2 linhas para revisar") e um botão **Desfazer este lote** fica disponível ([[erros-usabilidade]], modelo do queijo suíço).

Colunas de dado pessoal (nome, CPF, e-mail, telefone, endereço, CEP, nascimento, indicante) são listadas como **"colunas ignoradas"** no passo 2, por padrão. A data de nascimento vira faixa etária na importação e é descartada.

Leitura do arquivo: **ExcelJS** ou **read-excel-file** (ambas MIT) para `.xlsx`, **PapaParse** para CSV; o pacote `xlsx` do npm fica de fora (parado na 0.18.5, com duas CVEs corrigidas só no CDN da SheetJS). O parser roda no backend com fuso fixo em UTC, converte datas seriais em data civil (AAAA-MM-DD), usa o valor em cache das células com fórmula e reconhece abas ocultas. Os arquivos da Gupy têm centenas de KB a poucos MB; se o upload passar por uma função Vercel, verificar o limite de corpo (a documentação ainda cita 4,5 MB) ou usar upload direto para o Vercel Blob em store privado na região `gru1`.

**Canal 2: captura do funil no ato** (onda 2)

A tela da vaga lista as candidaturas como cartões ou linhas com **ações rápidas**, cada uma gerando um `EventoEtapa` com a data de hoje (editável para lançamento retroativo):

- Abordagem: "Abordado", "Respondeu", "Sem retorno"
- Entrevista RH e gestor: "Agendar (data/hora)", "Compareceu", "Não compareceu", "Aprovar", "Reprovar (motivo)"
- Teste comportamental: "Enviado", "Concluído", "Reprovado"
- Carta oferta: "Enviada", "Aceita", "Recusada (motivo)"
- Admissão: "Documentação recebida", "eSocial enviado", "Admitido (dia 1)", "Não compareceu no dia 1", "Desistiu (motivo)"

Regras de desenho vindas dos packs e do wiki: evento mínimo = candidato + etapa + resultado, data já preenchida ([[reservatorio-boa-vontade]]); motivo só quando o resultado exige, em dois níveis (categoria → motivo), lista com busca ([[memoria-cognicao]], reconhecimento em vez de recordação); o último evento do candidato aparece ao lado da ação ([[cog-cognitive-load]]); desfazer o último lançamento em um toque; layout que funciona no celular, porque parte das entrevistas acontece na praça (Belém, Macapá).

Para a transição, um **grid de lançamento em lote** (colar do Excel, uma linha por candidato, colunas fixas: vaga, nome, origem, etapa, resultado, data, motivo) cobre o caso "tenho 30 fichas da semana passada". É o mesmo motor de validação do canal 1. Biblioteca candidata: `react-data-grid` (MIT, colar do Excel, navegação por teclado) ou Glide Data Grid (MIT, canvas); AG Grid Community não inclui área de transferência e Handsontable é pago. Lançamento retroativo (data anterior a hoje) pede uma justificativa curta, como faz o Ashby.

Candidatos que fazem o pré-cadastro e o teste de digitação no Rheply entram no funil automaticamente, com origem "Rheply pré-cadastro" e a nota de digitação anexada à candidatura. Esse é o primeiro caso em que o Rheply fecha o ciclo sem nenhuma digitação.

**Canal 3: API da Gupy v2 + webhooks** (onda 4)

A pesquisa (seção 3.2) confirmou que a API pública existe, é self-service para clientes Scale/Enterprise e entrega vagas, candidaturas de todas as vagas com `updatedAfter`, **histórico de etapas com data de entrada e saída**, motivo de reprovação por candidato, contratações com salário, e até desligamentos. O canal 3 substitui o canal 1 mantendo o mesmo contrato de dados (o serviço de importação recebe linhas normalizadas, venham de arquivo ou de API) e assina `job.status-changed` para reconstruir todos os ciclos de congelamento. Mesmo com a API, o canal 2 continua necessário, porque 71% dos atendentes só existem na Gupy no dia da contratação. As etapas da Gupy são mapeadas pela `category` padronizada (screening, interview, offer, hiring…), não pelo nome.

**Idempotência e reconstrução** ([[sysdesign-idempotency-patterns]], `swarch-projection-rebuild-discipline`): chaves naturais (`codigo_gupy`, `id_inscricao_gupy`, hash de linha normalizada) garantem que reenviar é inofensivo; toda métrica é recalculável a partir de `VagaSnapshot` + `EventoEtapa` + `Contratacao`; um comando "recalcular projeções" existe desde a onda 1 e é testado antes de ir para produção. O painel exibe sempre o carimbo de frescor: "Gupy importada em 05/09 11:40 · 27 eventos manuais desde então".

### 4.6 Painéis: arquitetura de informação

Rota base `/atracao-selecao` no grupo `(dashboard)`, entrada "Atração e Seleção" no grupo **Recrutamento** da barra lateral. Uma barra de filtros única acima de tudo (período primeiro, com atalhos "esta semana", "últimas 4 semanas", "trimestre"; depois diretoria, filial, cargo, recrutador, gestor); os filtros reescopam KPIs, gráficos e tabelas ao mesmo tempo ([dataviz: interaction]).

| Tela | Público | Pergunta | Onda |
|---|---|---|---|
| **Visão FUP** | superintendência, gerência | Estamos no prazo? O que mudou? Onde decidir? | 3 |
| **Vagas em aberto** | todos | Estoque e aging | 1 |
| **Contratações** | todos | Fluxo e tempos | 1 |
| **Funil de seleção** | R&S, gestores | Vazamentos e motivos | 2 |
| **Vaga** (drill-down) | todos | A história de uma vaga: linha do tempo, candidaturas, eventos | 2 |
| **Operação** (pendências) | recrutador, gestor | O que está parado, o que lançar | 2 |
| **Importações e qualidade** | analista | Frescor, completude, rejeições, pendências de enriquecimento | 1 |
| Turnover por coorte · PCD e cota · RI · Custo por contratação | gerência | Itens 2, 5, 4 e 12 da pauta | 4 |

**Visão FUP (uma página, consumida em menos de 10 minutos)** ([[atencao-foco]], [[peak-end-rule]])

- Número-herói: posições preenchidas na semana contra a meta, escrito como "faltam 4 para a meta" enquanto não atinge e "meta batida, próxima semana: 12" quando atinge ([[motivacao-comportamento]], gradiente de meta sem reset).
- Uma linha de 4 tiles: posições abertas (com "> 90 dias" na sublinha), tempo de posição mediano (com p90), no-show da semana (com a pior praça), pendências de gestores (entrevistas e decisões aguardando mais de 5 dias). Cada tile com delta em relação à semana anterior e mini-tendência de 12 semanas.
- Bloco fixo **"Desde a última FUP"**: o que mudou, em frases com número, e destacando o que contradiz a narrativa corrente ([[percepcao-visual]], cegueira à mudança). Gerado por regras (limiares e comparações), não por texto livre.
- Alertas escalonados e poucos: vagas acima do prazo-alvo, candidatos sem retorno, gestores com decisão pendente ([[atencao-foco]]: sinal raro precisa gritar; nunca um mar de vermelho).
- Fechamento: "3 decisões sugeridas para a reunião". A página nunca termina em vazio ou erro.
- Modo apresentação (tela cheia, fonte maior) e exportação em PDF com os mesmos filtros.

**Vagas em aberto e Contratações** reproduzem as duas primeiras abas do painel HTML, com dados vivos, com estas mudanças de forma (escolhidas pela tarefa do leitor, conforme `dataviz/choosing-a-form`): aging em barras por faixa em vez de média de dias; tempo de posição por filial como distribuição (mediana com faixa p25–p75) em vez de média; gênero e PCD como tiles com números em vez de donuts; origem em barras horizontais com "não informado" sempre visível e em cinza; status da vaga como barras empilhadas em vez de donut; tendência mensal como colunas com substituição e aumento de quadro empilhados. Toda tela tem a tabela auditável, sem dado pessoal, com ordenação, busca e exportação.

**Funil de seleção**: barras horizontais por etapa com a conversão entre etapas escrita entre as barras (não um gráfico de funil geométrico, que distorce proporções); desfecho por categoria (aprovado, reprovado, declinou, no-show, sem contato) em barras empilhadas por praça (pequenos múltiplos quando houver mais de 6 praças); motivos em dois níveis (categoria; clique abre os motivos); tempo mediano em cada etapa quando os eventos existirem; no-show por dia da semana e horário assim que houver agendamentos com hora. Um diagrama de fluxo (Sankey) de etapa → desfecho entra depois, quando houver volume de eventos que o justifique.

**Vaga (drill-down)**: linha do tempo (criação, aprovação, publicação, congelamentos, fechamento), posições (total, abertas, fechadas) ao longo dos snapshots, candidaturas com status derivado e eventos, tempos calculados, complemento manual editável na própria página.

**Importações e qualidade**: lista de lotes (data, tipo, autor, contagens, desfazer), rejeições por corrigir, completude por campo ("origem informada em 58% das contratações do mês"), pendências de enriquecimento ("7 vagas novas sem centro de custo"), carimbo de frescor.

### 4.7 Desenho visual e dataviz

Modo **Operate** (o painel serve a tarefa; a marca vive nos detalhes). Decisões:

- **Sistema existente**: tokens do `globals.css` (slate/teal, dark-first), shadcn/ui, Inter, `recharts` já instalado. Nenhuma biblioteca de gráfico nova.
- **Paleta categórica** de 6 posições em ordem fixa, validada com o validador do skill dataviz nos dois temas antes de entrar no código (o validador roda em segundos; a paleta do painel HTML passou e serve de ponto de partida, com ajuste de contraste em verde, âmbar e rosa no tema claro). Cores de status (aprovado, atenção, crítico, neutro) reservadas e sempre acompanhadas de ícone e rótulo.
- **Uma cor por série; sequencial para magnitude; ênfase (uma série colorida, o resto cinza) quando a história é "esta praça"**.
- **Tile de indicador** com contrato fixo: rótulo, valor (proporcional, não tabular), delta com sinal e período nomeado, mini-tendência. Tabelas com `tabular-nums`.
- **Marcas finas**, barras de no máximo 24 px com ponta arredondada, grades em linha fina sólida, rótulos diretos só nos pontos que importam, tooltip em todos os gráficos e **tabela gêmea** de cada gráfico (o valor nunca depende do hover).
- **Estados**: esqueleto no primeiro carregamento; ao refiltrar, mantém o gráfico anterior com opacidade reduzida (sem salto de layout); vazio que ensina ("Nenhum evento nesta vaga. Registre a primeira abordagem"); erro com ação.
- **Formatação pt-BR** via `Intl` (já há formatadores em `analytics-api.ts`); datas por `date-fns` com `ptBR`.
- **Acessibilidade**: identidade nunca só por cor; contraste mínimo 3:1 nas marcas e 4,5:1 no texto; navegação por teclado nas ações rápidas; textura opcional para impressão.

### 4.8 LGPD e segurança

O sistema passa a ser um repositório de dados de candidatos, o que a planilha já é hoje, sem controle. O desenho segue o skill `swsec-lgpd-operational-basics`: LGPD como engenharia de minimização com prazo.

| Medida | Como |
|---|---|
| **Minimização na entrada** | O importador descarta por padrão nome, CPF, e-mail, telefone, endereço, CEP, data de nascimento e dados do indicante das exportações da Gupy. Faixa etária substitui a data de nascimento. |
| **Chave de pessoa** | Identidade do contratado = `id_inscricao_gupy` (e ID Gupy do candidato), que a Gupy mantém estáveis. Para cruzar com desligamentos no futuro, a opção é `pessoa_hash = HMAC(CPF, chave em gerenciador de segredos)` calculado na importação (decisão D1). Hash simples de CPF não serve: o espaço de CPFs é enumerável e a ANPD o considera reversível. |
| **Dado sensível** (PCD, tipo de deficiência, gênero) | Só em agregados; qualquer recorte com menos de 5 pessoas mostra "< 5" em vez do número. Não aparece em tabela por pessoa. |
| **Nome do candidato no funil** | Necessário para operar; visível só ao papel recrutador; anonimizado ao fim do prazo de retenção (candidaturas não contratadas) por job agendado, não por lembrete. |
| **Notas livres** | Campo curto, com aviso "não registre dados pessoais"; varredura simples de padrões (CPF, telefone) antes de salvar. |
| **Papéis** | `analista_rs` (importa, edita, vê tudo da diretoria), `recrutador` (opera suas vagas), `gestor` (vê suas vagas e decide), `gerencia` (vê agregados), `admin`. O JWT já carrega `role`; falta a autorização no backend ([[swsec-backend-authorization-layer]]). |
| **Trilha de auditoria** | Todo lote de importação, todo evento e toda edição de complemento guardam autor e data. Leitura de nome de candidato gera registro de acesso. |
| **Retenção** | Proposta inicial (decisão D7): nome do candidato anonimizado 12 meses após o último evento; eventos pseudonimizados mantidos por 24 meses (prazo da prescrição trabalhista); depois só agregados; contratações mantidas enquanto durar a finalidade de gestão de R&S; arquivos importados guardados 90 dias. Tudo executado por job agendado com métrica de execução. |
| **Base legal** | Candidatos: procedimentos preliminares de contrato e legítimo interesse (art. 7, V e IX), com teste de balanceamento documentado; contratados: execução do contrato; PCD: obrigação legal da cota (art. 11, II, a), com finalidade restrita ao acompanhamento da cota; gênero e raça só se houver consentimento específico já colhido na Gupy, e só em agregados. Registrar tudo no inventário de dados do módulo. O módulo nunca reprova ninguém automaticamente (art. 20). |
| **Inventário de dados pessoais** | Arquivo versionado no repositório com campo, finalidade, base legal, prazo e job responsável. |

### 4.9 Requisitos não funcionais

Seguindo `sysdesign-nfr-clarification`: números ou "assumido", nunca adjetivos. Eixos duros: **privacidade** e **simplicidade/custo**. Os demais são negociáveis.

| # | NFR | Valor | Status |
|---|---|---|---|
| 1 | Escala | 5 a 10 usuários que editam; até 30 que leem; ~350 vagas, ~2.000 posições, ~2.000 candidaturas e ~10.000 eventos por ano por diretoria; até 5 diretorias | assumido a partir dos dados |
| 2 | Disponibilidade | 99,5% em horário comercial; sexta de manhã é o período crítico | assumido |
| 3 | Latência | painel < 2 s no p95 com agregados pré-calculados; importação de 500 linhas < 30 s; ação rápida < 500 ms | assumido |
| 4 | Consistência | forte para eventos (o recrutador vê o que acabou de registrar); eventual (< 1 min) entre importação e painel | decidido |
| 5 | Custo | sem infraestrutura nova: Vercel para o front, o backend e o banco atuais; nenhum warehouse (o volume cabe em tabelas relacionais com agregação sob demanda); se entrar armazenamento de arquivos gerenciado, região `gru1` (São Paulo) | decidido |
| 6 | Acurácia | contagens exatas; percentuais com uma casa; medianas e percentis calculados, não estimados | decidido |
| 7 | Segurança | JWT existente + autorização por papel e por diretoria no backend; TLS; segredo do HMAC em gerenciador de segredos | decidido |
| 8 | Privacidade | minimização na importação; dado sensível só agregado; retenção executada por job; trilha de auditoria | duro |
| 9 | Complexidade | reusar `apiClient`, shadcn, `recharts`, RHF + zod, zustand; zero bibliotecas de estado ou de gráficos novas; parser de planilha é a única dependência nova no front | duro |
| 10 | Tolerância a falhas | importação transacional por lote com desfazer; painel degrada para "última atualização em…" se o backend falhar; projeções reconstruíveis por comando | decidido |

### 4.10 Encaixe no Rheply existente

| Camada | O que entra | Exemplar a seguir |
|---|---|---|
| Rotas | `src/app/(dashboard)/atracao-selecao/{page,vagas,contratacoes,funil,vagas/[codigo],operacao,importacoes}` com `loading.tsx` | `(dashboard)/selecao/page.tsx`, `(dashboard)/dashboard/avaliacoes/page.tsx` |
| Serviço | `src/services/atracao-selecao-api.ts` com `PATHS`, funções tipadas e formatadores pt-BR | `src/services/analytics-api.ts` (que já está tipado e sem uso; parte dos tipos, como `FunnelStage` e `SourceEffectiveness`, pode ser reaproveitada) |
| Tipos | `src/types/atracao-selecao.ts` | `src/types/typing-test.ts` (mapeamento snake_case → camelCase) |
| Hooks | `use-vagas`, `use-contratacoes`, `use-funil`, `use-importacao` com `{data, isLoading, error, refresh}` | `src/hooks/use-applications.ts`, `src/hooks/use-cv-upload.ts` |
| Componentes | `src/components/atracao-selecao/` (tiles, filtros, gráficos, ações rápidas, assistente de importação) | `components/dashboard/stats-card.tsx`, `components/analytics/*`, `candidate-auth/cv-uploader.tsx`, `parsing-preview.tsx` |
| Validação | `src/lib/validations/atracao-selecao.ts` (zod) | `src/lib/validations/candidate.ts` |
| Navegação | item "Atração e Seleção" no grupo Recrutamento; `/atracao-selecao` adicionado a `isProtectedRoute` no middleware | `components/layout/sidebar.tsx`, `src/middleware.ts` |
| Testes | `src/__tests__/{hooks,components}/atracao-selecao/*` com o setup existente; regras de cálculo da seção 4.3 como funções puras com testes unitários | `src/__tests__/stores/auth.test.ts` |

Dois ajustes no que já existe: (1) o `auth` store precisa carregar `company_id` e `diretoria` a partir do JWT, porque o serviço de analytics já exige `company_id` e hoje só há `companyName`; (2) o padrão visual das páginas de dashboard (`bg-slate-900` fixo) e dos componentes antigos (tokens semânticos) divergem; o módulo novo usa tokens semânticos e serve de referência para unificar.

**Contrato mínimo do backend** (o repositório é só o front; o backend em `NEXT_PUBLIC_API_URL` é separado e precisa expor):

```
POST   /v1/rs/importacoes                 multipart (arquivo) → {lote_id, tipo_detectado, preview}
POST   /v1/rs/importacoes/{id}/confirmar  → {novas, alteradas, ausentes, rejeitadas}
POST   /v1/rs/importacoes/{id}/desfazer
GET    /v1/rs/importacoes?diretoria=
GET    /v1/rs/vagas?status=&filial=&cargo=&recrutador=&periodo=      (+ /vagas/{codigo}, /vagas/{codigo}/snapshots)
PUT    /v1/rs/vagas/{codigo}/complemento
POST   /v1/rs/vagas/{codigo}/congelamentos
GET    /v1/rs/contratacoes?…
GET    /v1/rs/candidaturas?vaga=&etapa=&pendentes=       POST /v1/rs/candidaturas
POST   /v1/rs/candidaturas/{id}/eventos                  DELETE /v1/rs/eventos/{id}  (desfazer)
GET    /v1/rs/motivos
GET    /v1/rs/metricas/{estoque|fluxo|funil|fup}?filtros  (agregados prontos para os tiles e gráficos)
POST   /v1/rs/metricas/recalcular
GET    /v1/rs/qualidade
```

A pasta `src/services/analytics-api.ts` cita um "PRD Module 2.4" com ClickHouse; para este volume, tabelas relacionais e agregação sob demanda bastam (NFR 5). Se o backend já tiver o módulo de analytics, os endpoints acima podem ser adaptados a ele.

## 5. Abordagens consideradas

| Abordagem | O que é | Prós | Contras | Veredito |
|---|---|---|---|---|
| **A. Painel por upload, sem persistência** | Reproduzir o HTML dentro do Rheply: a analista sobe a planilha, o navegador calcula e exibe | Pronto em 1 a 2 semanas; zero backend; zero PII no servidor | Não elimina a planilha nem a transcrição; sem histórico, sem tendência, sem captura de eventos; dado pessoal continua circulando em arquivo | Serve como **plano B** para a onda 1 se o backend não puder mudar no prazo. O parser e a prévia construídos aqui são reaproveitados no assistente de importação |
| **B. Módulo completo com persistência e captura de eventos** | Importação idempotente com histórico, funil registrado no ato, painéis por público | Elimina os passos mecânicos do ciclo semanal; cria a base para turnover, PCD, RI e custo; controla acesso e PII | Exige endpoints novos no backend; mais ondas; adoção pela equipe | **Recomendada**, faseada para entregar valor na onda 1 |
| **C. Integração com a API da Gupy primeiro** | Puxar vagas, candidaturas e histórico de etapas pela API v2 e webhooks | Automatiza a maior parte do que hoje é exportação; dá tempo em etapa para o que está na Gupy; a API existe e é documentada (seção 3.2) | Depende de token (plano Scale/Enterprise, administrador da conta) e de aprovação da empresa; não vê o funil que acontece fora da Gupy (71% dos atendentes); trilha de aprovação não sai pela API; ciclos completos de congelamento exigem webhooks desde o início | Não como primeiro passo. Entra como **canal 3** depois que o modelo de dados estiver validado pelos uploads, com um spike curto na onda 1 para medir a viabilidade |

## 6. Plano de execução em ondas

Cada onda termina com um critério de saída observável na rotina de sexta-feira, não com "código pronto". Estimativas assumem um desenvolvedor no front e acesso ao backend; valem como ordem de grandeza.

### Onda 0: fundação (1 semana)

- Modelo de dados e migrações: `Diretoria`, `Vaga`, `VagaSnapshot`, `VagaComplemento`, `Congelamento`, `Contratacao`, `ImportacaoLote`, `ImportacaoRejeicao`, `Motivo` (seed do apêndice B), `MetaCargo`.
- Endpoints de leitura de vagas e contratações e de importação (contrato da seção 4.10).
- Front: rota `/atracao-selecao`, item na barra lateral, serviço, tipos, hooks, `company_id`/`diretoria` no store de autenticação, proteção no middleware.
- Regras de cálculo da seção 4.3 como funções puras, com testes unitários que reproduzem os números da planilha (mediana 16 dias de tempo de posição em 2026, 5 vagas acima de 90 dias, etc.). Esse teste é o que prova que o sistema substitui a planilha sem mudar os números.
- `nfrs.md` e inventário de dados pessoais versionados no repositório.
- Paleta categórica validada com o validador do dataviz nos dois temas.

Saída: importação de um arquivo real chega ao banco sem PII e os totais batem com a planilha.

### Onda 1: substituir a planilha de vagas (2 semanas)

- Assistente de importação (5 passos) para os dois exports da Gupy, com detecção de tipo, mapeamento salvo, validação *soft-strict*, diff, confirmação e desfazer.
- Formulário de complemento da vaga com valores sugeridos (centro de custo e qualificação da última vaga da mesma área e filial) e lista de "vagas novas sem complemento".
- Congelamentos por vaga (importados da Gupy e manuais).
- Telas **Vagas em aberto** e **Contratações** com os KPIs, gráficos e tabelas da seção 4.6, e a barra de filtros única.
- Tela **Importações e qualidade** com carimbo de frescor, completude por campo e rejeições.
- Spike de um dia: obter token da API da Gupy com o administrador da conta e testar `GET /api/v2/jobs` e `GET /api/v2/applications?expand=steps`; registrar o resultado na decisão D5.

Saída: a analista faz a FUP de sexta a partir do Rheply sem abrir a aba de vagas da planilha. As colunas de PII nunca chegaram ao servidor.

### Onda 2: funil vivo (2 a 3 semanas)

- `Candidatura` e `EventoEtapa` com ações rápidas na tela da vaga; motivo em dois níveis; desfazer; lançamento retroativo; layout para celular.
- Grid de lançamento em lote (colar do Excel) com o mesmo validador da importação; importação única da aba `FUNIL GERAL` para preservar o histórico do piloto (status e motivo viram eventos com data desconhecida marcada como "importado").
- Integração com o pré-cadastro e o teste de digitação do Rheply: candidato vira `Candidatura` automaticamente.
- Tela **Funil de seleção** (conversão por etapa, desfechos por praça, motivos, no-show) e tela **Operação** (pendências por recrutador e por gestor: sem retorno há mais de 5 dias, entrevistas agendadas, decisões pendentes).
- Tela **Vaga** com linha do tempo e candidaturas.

Saída: pelo menos uma analista registra o funil no ato durante duas semanas; 80% das candidaturas novas têm data de abordagem e de entrevista preenchidas (hoje: 0%).

### Onda 3: visão FUP (2 semanas)

- Página executiva de uma tela: número-herói contra a meta, quatro tiles com delta e tendência de 12 semanas, bloco "Desde a última FUP" gerado por regras, alertas escalonados, três decisões sugeridas, modo apresentação e PDF.
- `MetaCargo` com valores iniciais calculados da mediana histórica e edição pela gerência.
- Lembrete de sexta (e-mail ou WhatsApp, reaproveitando o que o Rheply já tem) com o que falta antes da FUP: "3 vagas sem complemento, 12 candidatos sem evento há 5 dias".
- Papéis e autorização por diretoria no backend; gestor vê só suas vagas.

Saída: a superintendência recebe a FUP gerada pelo Rheply; a analista deixa de montar apresentação.

### Onda 4: expansão (contínua)

- **Turnover em até 1 ano por coorte**: importação da base de desligamentos da O&R (ou `GET /dismissals` da Gupy, se o RH passar a registrar lá), cruzada por `pessoa_hash` ou matrícula; sobrevivência em 90 dias e 1 ano por origem, recrutador, gestor, praça e cargo. Responde ao item 2 da pauta e habilita o qualificador da métrica-norte.
- **Canal 3: API da Gupy v2 + webhooks** (`job.status-changed` para ciclos completos de congelamento, `candidate.hired`, `application.moved`), substituindo o upload de vagas e contratações e trazendo o histórico de etapas do que acontece na Gupy.
- **PCD e cota** sobre o quadro (precisa do headcount por filial), **RI**, **consultoria × interno**, **custo por contratação** (item 12).
- **Segunda diretoria** (item 9): mesma estrutura, dados isolados por `Diretoria`.
- **Insights assistidos por IA** sobre os agregados (nunca sobre dados pessoais), gerando o rascunho do "Desde a última FUP" para a analista revisar.
- Diagrama de fluxo etapa → desfecho (Sankey) quando houver volume de eventos.

## 7. Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Backend não disponível no prazo | média | alto | Abordagem A como plano B na onda 1: parser e prévia no cliente, painéis alimentados pelo arquivo; o mesmo código migra para o assistente quando o backend chegar |
| Exportação da Gupy muda de layout | média | médio | Detecção por assinatura de cabeçalhos, mapeamento editável e salvo, arquivo original guardado para reprocessar |
| Equipe volta à planilha (adoção) | alta | alto | Onda 1 elimina trabalho antes de pedir trabalho novo; grid de colagem na transição; lembrete ancorado no ritual de sexta ([[frameworks-comportamentais]]); mostrar a consequência de cada lançamento na hora |
| Gestores não registram entrevista e decisão | alta | médio | Recrutador registra em nome do gestor na onda 2; gestor recebe lista de pendências na onda 3; SLA visível na FUP cria pressão social positiva |
| Números divergem da planilha na transição | média | alto | Testes unitários que reproduzem os números conhecidos; período de duas semanas com os dois em paralelo; tela de qualidade explica cada diferença (ex.: congelamento líquido × global) |
| PII entra por notas ou por arquivo errado | média | alto | Descarte de colunas por padrão; varredura de padrões em notas; papéis; trilha de acesso; retenção por job |
| Dependência de token da Gupy para o canal 3 | média | baixo | Canal 3 é fast-follow; o módulo entrega valor sem ele |
| Escopo cresce com a pauta (turnover, perfil de sucesso, orçamento) | alta | médio | Cada item da pauta tem onda definida; nada entra na onda 1 além de estoque, fluxo e importação |

## 8. Decisões em aberto

Estas decisões mudam o desenho e precisam de você ou da analista. Cada uma vem com a recomendação.

| # | Decisão | Opções | Recomendação |
|---|---|---|---|
| D1 | **Chave de pessoa** para cruzar contratação com desligamento no futuro | (a) só ID de inscrição/candidato da Gupy; (b) `pessoa_hash = HMAC(CPF)` calculado na importação; (c) matrícula do colaborador, quando existir | (b) até que exista matrícula na base de desligamentos; o CPF nunca é armazenado em claro |
| D2 | **Regra de congelamento** para tempo líquido | (a) só congelamentos registrados na Gupy; (b) períodos manuais por vaga; (c) manter o congelamento global da planilha como período manual aplicado a todas | (b), importando (a) automaticamente e registrando o congelamento global de 25/06 a 01/09 como período manual **só nas vagas que existiam em 25/06** |
| D3 | **Taxonomia de motivos** (apêndice B) | validar os 22 motivos com a analista; decidir se "reprovado em teste MAPA" e "sem interesse" ficam separados | Validar em 30 minutos com a analista antes da onda 2; a taxonomia é dado (seed), não código |
| D4 | **Prazo-alvo por cargo** | (a) mediana histórica como meta; (b) meta definida pela gerência | (a) como valor inicial, editável por (b); o painel mostra a origem do número |
| D5 | **API da Gupy** | (a) pedir token agora; (b) só depois da onda 2 | (a) pedir agora, porque o pedido depende de terceiros; usar só na onda 4 |
| D6 | **Nome do candidato no funil** | (a) armazenar; (b) usar só iniciais + ID; (c) armazenar com acesso restrito e anonimização por prazo | (c); (b) inviabiliza a operação diária |
| D7 | **Retenção** | nome do candidato não contratado: 6, 12 ou 24 meses após o último evento; eventos pseudonimizados: 12 ou 24 meses | Nome anonimizado em 12 meses; eventos por 24 meses (prescrição trabalhista); depois só agregados. Validar com o jurídico e o encarregado da empresa; executado por job, não por lembrete |
| D8 | **Backend** | quem implementa os endpoints e em que stack; existe o "módulo analytics 2.4" citado em `analytics-api.ts`? | Confirmar antes da onda 0; o contrato da seção 4.10 é neutro em relação à stack |
| D9 | **Abordagem A como plano B** | construir o parser no cliente já na onda 1 | Sim: o parser é necessário de qualquer forma para a prévia do assistente |
| D10 | **Origem "Dai"** e outros valores fora da lista | o que significa "Dai" nos 15 registros do funil? | Perguntar à analista; o sistema passa a exigir origem da lista |

## 9. Fontes

Os briefs completos da pesquisa, com todas as URLs consultadas, estão em `docs/superpowers/research/2026-09-02-*.md`. Abaixo, as fontes que sustentam diretamente as decisões deste documento.

**Gupy (API, relatórios, conceitos)**

- Portal de desenvolvedores: https://developers.gupy.io/ · índice de endpoints: https://developers.gupy.io/llms.txt
- Autenticação e planos: https://developers.gupy.io/docs/autentica%C3%A7%C3%A3o · https://www.gupy.io/precos
- Limites: https://developers.gupy.io/reference/rate-limiting · boas práticas: https://developers.gupy.io/docs/guia-de-boas-pr%C3%A1ticas-no-consumo-de-api
- Vagas v1/v2: https://developers.gupy.io/reference/findjobs · https://developers.gupy.io/v2.0/reference/jobscontroller_getall
- Candidaturas v2 (histórico de etapas, desqualificação, origem): https://developers.gupy.io/v2.0/reference/applicationscontroller_getall
- Fluxo oficial de extração para BI: https://developers.gupy.io/docs/fluxo-de-extra%C3%A7%C3%A3o-de-dados-para-fins-de-bi
- Webhooks: https://developers.gupy.io/reference/webhooks · https://developers.gupy.io/reference/job-status-changed · https://developers.gupy.io/docs/candidate-hired
- Status e workflow de vagas: https://developers.gupy.io/docs/fluxo-de-atualizacao-status-vagas
- Desligamentos e avaliação pós-contratação: https://developers.gupy.io/reference/getdismissals · https://developers.gupy.io/reference/getperformanceevaluations
- Testes de parceiros: https://developers.gupy.io/docs/integra%C3%A7%C3%A3o-com-testes-de-provedores-externos · MAPA (Mapa HDS): https://www.mapahds.com/recrutamento-e-selecao
- Relatórios via plataforma (trecho indexado; página protegida): https://support-companies.gupy.io/hc/pt-br/articles/11206249633307-Relat%C3%B3rios-via-plataforma

**Importação de planilhas e engenharia**

- Flatfile: https://support.flatfile.com/articles/7763163677-importing-data-with-flatfile-overview · Dromo: https://dromo.io/blog/building-a-seamless-csv-importer · OneSchema × Dromo: https://dromo.io/blog/oneschema-vs-dromo-comparison-2026
- react-spreadsheet-import (MIT): https://github.com/UgnisSoftware/react-spreadsheet-import
- SheetJS CVEs: https://cdn.sheetjs.com/advisories/CVE-2023-30533 · https://cdn.sheetjs.com/advisories/CVE-2024-22363 · ExcelJS: https://github.com/exceljs/exceljs · read-excel-file: https://github.com/catamphetamine/read-excel-file · PapaParse: https://github.com/mholt/PapaParse
- Datas seriais do Excel: https://gist.github.com/christopherscott/2782634
- Upsert e SCD tipo 2: https://www.postgresql.org/docs/current/sql-insert.html · https://medium.com/@nripapathak/implementing-a-type-2-slowly-changing-dimension-scd-with-a-hash-value-cd5d80051d53
- Vercel: limites de funções https://vercel.com/docs/functions/limitations · Blob (upload direto, regiões) https://vercel.com/docs/vercel-blob · https://vercel.com/docs/vercel-blob/client-upload · Workflows https://vercel.com/docs/workflows
- Grids: react-data-grid https://github.com/adazzle/react-data-grid · Glide Data Grid https://github.com/glideapps/glide-data-grid · AG Grid clipboard (Enterprise) https://www.ag-grid.com/react-data-grid/clipboard/ · Handsontable licença https://handsontable.com/docs/javascript-data-grid/license-key/

**Taxonomia de motivos e captura por eventos**

- Greenhouse: https://support.greenhouse.io/hc/en-us/articles/207305363-Rejection-reasons-overview · https://support.greenhouse.io/hc/en-us/articles/203941409-Rejection-reasons-report
- Ashby: https://docs.ashbyhq.com/best-practices-managing-and-analyzing-archive-reasons · https://developers.ashbyhq.com/reference/applicationupdatehistory
- Greenhouse application stages: https://harvestdocs.greenhouse.io/reference/get_v3-application-stages
- Validação inline (Wroblewski): https://alistapart.com/article/inline-validation-in-web-forms/ · NN/g formulários: https://www.nngroup.com/articles/errors-forms-design-guidelines/ · https://www.nngroup.com/articles/date-input/
- Erro de digitação (Barchard & Pace): https://www.sciencedirect.com/science/article/abs/pii/S0747563211000707

**Visualização**

- Funil: https://www.storytellingwithdata.com/blog/swdchallenge-funnel-chart · https://peltiertech.com/bad-graphics-funnel-chart/ · Sankey: https://www.storytellingwithdata.com/blog/what-is-a-sankey-diagram
- Few, 13 armadilhas de dashboards: https://www.perceptualedge.com/articles/Whitepapers/Common_Pitfalls.pdf · bullet graph: https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf
- NN/g atributos pré-atentivos: https://www.nngroup.com/articles/dashboards-preattentive/ · Datawrapper daltonismo: https://www.datawrapper.de/blog/colorblind-check
- XmR (Wheeler): https://commoncog.com/process-behaviour-charts-more-than-you-need/ · pequenos múltiplos: https://www.forumone.com/insights/blog/good-data-visualization-practice-small-multiples/
- Recharts 3 (acessibilidade, Sankey): https://github.com/recharts/recharts/wiki/Recharts-and-accessibility · https://recharts.github.io/en-US/api/Sankey/ · shadcn charts: https://ui.shadcn.com/docs/components/base/chart
- Tempo de preenchimento, mediana: https://resources.workable.com/tutorial/faq-time-to-fill-hire · https://www.icims.com/blog/time-to-fill-vs-time-to-hire-key-metrics-explained/

**LGPD**

- Guia FGV de LGPD para RH (2023): https://portal.fgv.br/sites/default/files/uploads/recursos_humanos.pdf
- ANPD, estudo preliminar de anonimização e pseudonimização (2023): https://www.gov.br/participamaisbrasil/blob/baixar/37060 · guia de legítimo interesse: https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-lanca-guia-orientativo-sobre-legitimo-interesse · guia de segurança: https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/guia-vf.pdf
- Lei 13.709/2018 (LGPD): https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm · Lei 14.534/2023 (CPF): https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14534.htm
- Dados de PCD como sensíveis: https://www.migalhas.com.br/depeso/380682/dados-de-pessoas-com-deficiencia-sao-dados-pessoais-sensiveis · retenção de currículos: https://www.migalhas.com.br/depeso/363808/o-tratamento-dos-curriculos-na-lgpd · https://www.quickin.io/post/por-quanto-tempo-guardar-dados-de-candidato-reprovado-o-que-a-lgpd-determina
- Resoluções ANPD 15/2024 (incidentes), 18/2024 (encarregado), 19/2024 (transferência internacional): https://www.legisweb.com.br/legislacao/?id=458235 · https://www.tjba.jus.br/extrajudicial/wp-content/uploads/2024/08/RESOLUCAO-ANPD-No-18-Encarregado-de-Dados.pdf · https://www.irib.org.br/resolucao-cd-anpd-n-19-de-23-de-agosto-de-2024/
- Aviso de privacidade da Gupy (candidatos): https://www.gupy.io/hubfs/LGPD/RS%20Candidatos/5%20versao/AVI_PRI_PT_Plataforma%20de%20Recrutamento%20e%20Sele%C3%A7%C3%A3o__v.5_07%20dezembro%202022.pdf · DPA da Vercel: https://vercel.com/legal/dpa

**Wiki pessoal (vault Obsidian, `wiki/`)**

- [[leis-de-krug]] · [[memoria-cognicao]] · [[atencao-foco]] · [[percepcao-visual]] · [[cognicao-pensamento]] · [[tomada-decisao]] · [[erros-usabilidade]] · [[motivacao-comportamento]] · [[dopamina-comportamento]] · [[reservatorio-boa-vontade]] · [[peak-end-rule]] · [[frameworks-comportamentais]] · [[hook-model]] · [[principios-cognitivos-produto]] · [[padroes-implementacao]] · [[jtbd-positioning]] · [[aarrr-growth-metrics]] · [[dual-write-event-sourcing]] · [[nfr-system-design]] · [[design-cases]] · [[argos-architecture-design-v3]] · [[matilha-ux-foundation]] · [[processamento-inconsciente]]

**Skills aplicadas nesta análise**

- `impeccable` (shape, modo Operate) · `dataviz` (escolha de forma, anti-padrões, validador de paleta) · `matilha-ux-pack` (cog-cognitive-load, cog-progressive-disclosure, ux-swiss-cheese-errors) · `matilha-security-pack` (swsec-lgpd-operational-basics) · `matilha-sysdesign-pack` (sysdesign-nfr-clarification) · `matilha-software-arch-pack` (swarch-projection-rebuild-discipline) · `matilha-software-eng-pack` (sweng-kiss-antidote-overengineering) · `matilha-growth-pack` (growth-north-star-metric)

## Apêndice A. Mapa de colunas da planilha → entidades do módulo

Legenda: **G** = vem da exportação Gupy · **M** = digitado pela analista · **F** = fórmula (passa a ser calculado pelo sistema) · **PII** = dado pessoal que o importador descarta por padrão.

### A.1 `BASE GERAL VAGAS` e `1. VAGAS ABERTAS` → `Vaga` + `VagaComplemento`

| Coluna na planilha | Origem | Entidade.campo | Observação |
|---|---|---|---|
| Código da vaga | G | `Vaga.codigo_gupy` | **Chave natural** da vaga (idempotência) |
| Requisição / Requisição ATÉ 26-08 | G+M | `Vaga.requisicoes_internas[]` | Extrair os números (128, 129…) para lista estruturada; guardar o texto original |
| Tipo de vaga, Vaga, Cargo, Área, Filial, Cidade da Vaga | G | `Vaga.tipo`, `titulo`, `cargo`, `area`, `filial`, `cidade`, `uf` | Título e cargo normalizados para um dicionário canônico (12 grafias de "Atendente de Call Center") |
| Status da Vaga | G | `Vaga.status_gupy` | Publicada, Congelada, Encerrada, Cancelada, Em aprovação, Aprovada |
| Vaga PCD, Tipo de Publicação, Página de Carreiras, Vaga remota?, Candidatura Rápida | G | `Vaga.elegivel_pcd`, `tipo_publicacao`, `pagina_carreiras`, `remota`, `candidatura_rapida` | |
| Motivo | G | `Vaga.motivo_requisicao` | Substituição de pessoal / Aumento de quadro |
| Salário (faixa inicial/final) | G | `Vaga.salario_min`, `salario_max` | Faixa final sempre vazia hoje |
| Posições, Posições Abertas, Posições Fechadas | G | `Vaga.posicoes_total`, `posicoes_abertas`, `posicoes_fechadas` | Snapshot por importação (histórico de estoque) |
| Candidatos Aprovado | G | `Vaga.candidatos_aprovados` | Snapshot |
| Recrutador(a), Gerente, Criador(a) (+ e-mails) | G | `Vaga.recrutador`, `gestor`, `criador` → referência a `Pessoa interna` | E-mails corporativos servem como chave de pessoa interna; não são PII de candidato |
| Data de Criação, Aprovação, Publicação, Expiração, Fechamento, Última Modificação, Cancelamento, Limite de inscrições | G | `Vaga.dt_*` | |
| Última Data do Congelamento / Descongelamento, Tempo Congelada | G | `Congelamento{inicio, fim, origem='gupy'}` | Vira lista de períodos; a analista pode adicionar períodos manuais |
| Número de Inscritos, Número de Contratados | G | `Vaga.inscritos`, `contratados` | Snapshot |
| Contratados CPF, Contratados ID Gupy | G / PII | `Contratacao.candidato_ref` | Só o **ID Gupy** é importado; o CPF é descartado (ou convertido em hash, ver decisão D1) |
| Motivo de cancelamento, Vaga cancelada por | G | `Vaga.cancelamento_motivo`, `cancelado_por` | |
| TIPO DE ABERTURA | M | `VagaComplemento.tipo_abertura` | Substituição imediata / futura, Aumento de quadro, Adequação ao contrato, Transferência |
| CENTRO DE CUSTO | M | `VagaComplemento.centro_custo` | Sugerir a partir de área + filial da última vaga igual |
| QUALIFICAÇÃO | M | `VagaComplemento.qualificacao` | Lista controlada (34 valores hoje) |
| SUGESTÃO SALARIAL PARA A VAGA | M | `VagaComplemento.salario_sugerido` | |
| TIPO DE RECRUTAMENTO (QUANDO CONCLUÍDO) | M | `VagaComplemento.tipo_recrutamento` | Externo / Interno / Meritocracia; alimenta o KPI de RI |
| HORÁRIO DE TRABALHO | M | `VagaComplemento.escala` + `escala_obs` | Lista controlada + texto livre opcional |
| MOTIVO DA ABERTURA | M | `VagaComplemento.motivo_abertura` | Desligamento, Pedido de desligamento, Necessidade da área, Meritocracia, Transferência, Licença… |
| Nome completo da pessoa substituída (1..7) | M / PII | `VagaComplemento.substituido_matricula` | Guardar matrícula ou ID interno, não nome, para permitir cruzar com desligamentos |
| DATA DE APROVAÇÃO O&R (dado de outro relatório) | M | `Vaga.dt_aprovacao_or` | Se diferente da aprovação Gupy |
| TM O&R, TM R&S, TM ciclo, TM fechamento, Dias acumulados, TM com/sem congelamento, Data Hoje | F | calculado | Ver regras na seção 4.3 |
| (novo) | M | `VagaComplemento.com_consultoria`, `estrategica`, `diretoria` | Itens 6, 9 e 11 da pauta |

### A.2 `2. POSIÇÕES FECHADAS` → `Contratacao`

| Coluna | Origem | Entidade.campo | Observação |
|---|---|---|---|
| ID da inscrição | G | `Contratacao.id_inscricao_gupy` | **Chave natural** da contratação |
| ID da vaga, Código da vaga | G | `Contratacao.vaga` → `Vaga.codigo_gupy` | |
| DATA DE MOVIMENTAÇÃO PARA CONTRATAÇÃO (aceite da carta) | G (outro relatório) | `Contratacao.dt_aceite_carta` | Evento `carta_oferta.aceita` |
| Data de inscrição, Data de contratação | G | `Contratacao.dt_inscricao`, `dt_admissao` | Admissão pode ser futura (planejada) |
| Origem da aplicação | G | `Contratacao.origem` | 42% vazio hoje; o painel mostra "não informado" explicitamente |
| Interno | G | `Contratacao.interno` | KPI de RI |
| Recrutador, Gerente da vaga | G | referência a pessoa interna | |
| Salário cadastrado na vaga / na contratação, Tipo de contratação, Motivo da requisição, Cargo | G | `Contratacao.salario_vaga`, `salario_contratacao`, `tipo`, `motivo_requisicao`, `cargo` | |
| Gênero, PcD, Tipo de deficiência | G / sensível | `Contratacao.genero`, `pcd`, `tipo_deficiencia` | Só em agregados; ocultar quando o grupo filtrado tiver menos de 5 pessoas |
| Data de nascimento | G / PII | `Contratacao.faixa_etaria` | Converter em faixa (18–24, 25–34, 35–44, 45+) na importação e descartar a data |
| Cidade, Estado, País, CEP | G / PII parcial | `Contratacao.cidade_residencia`, `uf_residencia` | CEP descartado |
| Nome completo, E-mail, Celular, Telefone, Endereço, CPF | G / PII | **descartados** | Se a decisão D1 for por hash, `pessoa_hash = HMAC(CPF)` |
| Nome do indicante, E-mail do indicante, Status da indicação | G / PII parcial | `Contratacao.indicacao = {houve, status}` | Guardar apenas se houve indicação e o status; identidade do indicante só se o programa de indicação exigir |
| Tags, Ranking, Matching | G | `Contratacao.tags[]`, `ranking_gupy` | Ranking e Matching quase sempre vazios |
| TEMPO MÉDIO DE POSIÇÃO | F | calculado | `dt_aceite_carta − dt_aprovacao_or` |

### A.3 `3. FUNIL GERAL` → `Candidatura` + `EventoEtapa`

| Coluna | Entidade.campo | Observação |
|---|---|---|
| Vaga (código) | `Candidatura.vaga` | Chave para a `Vaga` |
| LOCALIDADE, ANALISTA, Posição, Gerência, Gestor, Vaga (empresa) | derivados da `Vaga` | Deixam de ser digitados por linha |
| Data abertura, Data do congelamento, DTA HOJE, TM/EXPURGO | derivados / calculados | |
| Nome do candidato | `Candidatura.candidato_nome` (PII mínima) | Necessário para operar o funil; acesso restrito ao papel recrutador; anonimizado após retenção |
| Origem do candidato | `Candidatura.origem` | Lista controlada (14 valores da aba LISTA SUSPENSA + "Rheply pré-cadastro") |
| Data da abordagem, retorno, entrevista RH, entrevista gestor, aprovação/reprovação gestor, envio do teste MAPA | `EventoEtapa{etapa, resultado, data}` | Cada data vira um evento; o sistema registra a data no ato |
| Status Único | derivado do último `EventoEtapa` | Não é mais digitado |
| Motivo | `EventoEtapa.motivo` | Obrigatório apenas em resultados `reprovado`, `desistiu`, `nao_compareceu` |
| Anotações | `EventoEtapa.nota` (curta) | Aviso na tela: não registrar dados pessoais na nota |

## Apêndice B. Taxonomia de motivos proposta (dois níveis)

Consolida os 48 + 4 motivos da aba `LISTA SUSPENSA` em 4 categorias e 22 motivos. Cada motivo indica em quais etapas pode ser usado. A lista é uma proposta para validação com a analista (decisão D3).

**A. Empresa não seguiu com o candidato (reprovação)**

| Código | Motivo | Etapas | Absorve da lista atual |
|---|---|---|---|
| A1 | Escolaridade abaixo do exigido | triagem, entrevista RH | P19 |
| A2 | Requisito obrigatório não atendido (CNH, registro, disponibilidade de escala exigida) | triagem, entrevista RH | P29 |
| A3 | Experiência ou conhecimento técnico insuficiente para a função | entrevista RH, entrevista gestor, teste técnico | P25–P28, P30–P32, P35–P36, P38–P49 |
| A4 | Reprovado em teste ou avaliação técnica | teste técnico | P22, P37 |
| A5 | Reprovado em avaliação comportamental | teste comportamental (MAPA) | P21 |
| A6 | Desempenho insuficiente na entrevista | entrevista RH, entrevista gestor | P23, P33, P34 |
| A7 | Perfil aderente a outra posição (banco de talentos) | qualquer | P24 |

**B. Candidato declinou (desistência)**

| Código | Motivo | Etapas | Absorve |
|---|---|---|---|
| B1 | Salário ou pretensão incompatível | qualquer | P4 |
| B2 | Benefícios incompatíveis | qualquer | P5 |
| B3 | Horário ou escala incompatível | qualquer | P6 |
| B4 | Localização, distância ou transporte | qualquer | P7, P9 |
| B5 | Sem mobilidade ou disponibilidade para viagens | qualquer | P8 |
| B6 | Mudança de cidade | qualquer | P10 |
| B7 | Aceitou outra proposta | qualquer | P3 |
| B8 | Sem interesse na vaga ou na empresa | qualquer | P11, P12 |
| B9 | Mudou de área, retomou estudos ou motivos pessoais | qualquer | P13, P14, P15 |
| B10 | Desistiu sem informar o motivo | qualquer | P2 |
| B11 | Desistiu na admissão (documentação, data, burocracia) | carta oferta, documentação, admissão | S3, S5, S6, P20 |

**C. Sem comparecimento ou sem contato**

| Código | Motivo | Etapas | Absorve |
|---|---|---|---|
| C1 | Não compareceu à entrevista | entrevista RH, entrevista gestor | P16 |
| C2 | Não compareceu ao teste | teste | P17 |
| C3 | Não respondeu aos contatos (após o prazo de 5 dias) | abordagem, retorno | P18 |
| C4 | Não compareceu à admissão | admissão | S4 |

**D. Processo encerrado pela empresa (não é sobre o candidato)**

| Código | Motivo | Etapas |
|---|---|---|
| D1 | Vaga cancelada ou congelada | qualquer |
| D2 | Posições preenchidas por outros candidatos | qualquer |
| D3 | Vaga preenchida por recrutamento interno ou transferência | qualquer |

## Apêndice C. Estados e eventos do funil

Etapas (em ordem): `abordagem` → `retorno` → `entrevista_rh` → `entrevista_gestor` → `decisao_gestor` → `teste_comportamental` → `carta_oferta` → `documentacao` → `esocial` → `admissao` (dia 1). As três últimas existem porque a legislação brasileira (aviso prévio, exame admissional, eSocial S-2200, contrato de experiência) concentra desistências entre o aceite e o primeiro dia.

Resultados possíveis por evento: `agendado`, `realizado`, `aprovado`, `reprovado`, `nao_compareceu`, `desistiu`, `sem_retorno`, `cancelado`.

Regras:

- Um evento com resultado `reprovado`, `desistiu`, `nao_compareceu` ou `cancelado` exige `motivo` (apêndice B) e encerra a candidatura, exceto `nao_compareceu`, que permite reagendar uma vez.
- O status único da candidatura é o par (última etapa, último resultado). É calculado, não digitado.
- Tempo em etapa = diferença entre o evento que abriu a etapa e o que a encerrou. Enquanto a etapa está aberta, o tempo corre até hoje e alimenta a lista de pendências ("sem retorno há 6 dias").
- Uma candidatura que chega a `carta_oferta.aprovado` é ligada à `Contratacao` da exportação Gupy pelo ID de inscrição; se a Gupy ainda não tiver o registro, a ligação fica pendente e o painel de qualidade avisa.
- Candidatos vindos do pré-cadastro do Rheply (processo seletivo com teste de digitação) entram automaticamente como `Candidatura` com origem "Rheply pré-cadastro" e evento `abordagem.realizado` na data do cadastro.
