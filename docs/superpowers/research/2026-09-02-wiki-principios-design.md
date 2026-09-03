# Síntese do wiki pessoal: princípios para painel, inserção de dados e arquitetura de analytics de R&S

*Brief produzido por agente em 02/09/2026 a partir do vault Obsidian (`wiki/`). O servidor MCP do Obsidian recusou conexão (app fechado); o vault foi lido direto do filesystem. `wiki/index.md` foi lido primeiro e integralmente; depois os wikilinks. Ao final, o que a wiki não cobre.*

## Princípios para o painel (leitura)

**1. Projete o painel como outdoor a 140 km/h: hierarquia visual e uma pergunta por tela.** Krug: pessoas escaneiam, não leem; escolhem o primeiro razoável (satisficing). Proeminência = importância, relação visual = relação lógica, aninhamento = pertencimento, áreas definidas, minimizar ruído. Aplicar: a visão executiva responde a uma pergunta com 1 métrica-norte e 3-4 KPIs; o resto vira drill-down. [[leis-de-krug]] · [[navegacao-web]] · [[leitura-tipografia]]

**2. Orçamento de memória de trabalho: no máximo 4±1 blocos por agrupamento.** Cowan (2001) corrige Miller; Mandler: recuperação cai de ~100% (1-3 itens) para ~80% (4-6) e ~20% (80). Aplicar: KPIs em linhas de até 4; etapas do funil em 3-4 macro-etapas. [[memoria-cognicao]] · [[matilha-ux-foundation]]

**3. Duas vistas para dois "eus": executiva (Remembering Self) vs operacional (Experiencing Self).** Kahneman: o Experiencing Self "responde a latência, fluidez"; o Remembering Self "responde a peaks, endings". Progressive disclosure: "mais clicks são melhores que mais pensamento". Não misture as duas na mesma tela. [[jtbd-positioning]] · [[cognicao-pensamento]]

**4. Processamento pré-atentivo com redundância de código: cor + forma + texto, nunca só cor.** Cor, tamanho, forma e movimento são processados em < 250 ms; ~9% dos homens têm daltonismo; Von Restorff; Weber-Fechner. Aplicar: semáforo de vaga com ícone e rótulo, um único destaque por tela. [[percepcao-visual]] · [[principios-cognitivos-produto]] · [[gravicode-frontend-neural-interface]]

**5. Sinal raro e importante precisa gritar; calibre misses vs falsos alarmes.** Inspetores do TSA perdem 70% das armas porque são raras; alarmes de hospital são ignorados por habituação. Aplicar: poucos alertas, distintos e escalonados. [[atencao-foco]]

**6. Cegueira à mudança e viés de confirmação: "o que mudou desde a última reunião" tem de ser explícito.** 50% não veem o gorila; "informação contradizendo o modelo mental precisa ser explicitamente destacada" (USS Vincennes). [[percepcao-visual]] · [[atencao-foco]] · [[principios-cognitivos-produto]]

**7. A reunião semanal começa com informação, não com opinião.** Mojzisch: 90% dos grupos começam por preferências; Anderson & Kilduff: em 94% das vezes a resposta final é a primeira proposta do mais dominante. Solução: escrita individual antes da discussão. Aplicar: 2 minutos de leitura silenciosa do painel; cada recrutador registra sua hipótese antes do debate. [[tomada-decisao]] · [[testes-usabilidade]]

**8. Anedotas convencem, mas confiança é visual primeiro.** Sillence: 83% das rejeições de trust são por design; "design abre a porta, conteúdo emocional convence". Aplicar: aparência sóbria; em cada número, a história por trás ao clicar. [[emocoes-sentimentos]] · [[reservatorio-boa-vontade]]

**9. Mostre o que falta, não o que foi feito; comece em 20%, não em 0%.** Goal gradient (Hull/Kivetz); "post-reward resetting". Aplicar: "faltam 3 contratações para a meta", e ao bater, role a próxima. [[motivacao-comportamento]] · [[padroes-implementacao]] · [[matilha-ux-foundation]]

**10. Sessão de leitura em 7-10 minutos, com fechamento (Peak-End).** "NUNCA terminar sessão com erro, loading screen, ou nada." Aplicar: a vista executiva termina com "resumo da semana + 3 decisões sugeridas". [[atencao-foco]] · [[peak-end-rule]]

**11. Proveniência e frescor sempre visíveis; esconder informação drena boa vontade.** Aplicar: carimbo "última planilha importada em … · N eventos manuais desde então"; skeleton em vez de tela em branco. [[reservatorio-boa-vontade]] · [[principios-cognitivos-produto]]

**12. Comportamento > autorrelato: o status deriva de eventos, não da opinião do recrutador.** "Observação comportamental e métricas são mais confiáveis que questionários." [[processamento-inconsciente]]

## Princípios para a inserção de dados (escrita)

**1. Não me faça pensar: cada dúvida no formulário drena o reservatório finito.** Uma única ação primária, rótulos na linguagem do recrutador, zero happy talk. [[leis-de-krug]] · [[reservatorio-boa-vontade]]

**2. Soft-strict e modelo mental da planilha.** "Parser deve aceitar variantes óbvias com warning, bloquear apenas ambiguidade real"; JTBD Forces: para vencer a força Habit, "onboarding que mimetiza patterns conhecidos, importação de dados". Importar a planilha atual no dia 1. [[matilha-ux-foundation]] · [[jtbd-positioning]] · [[frameworks-comportamentais]]

**3. Recognition > recall; nunca carregar informação entre telas.** Candidato, vaga e etapa selecionáveis de lista com busca; nunca digitar IDs; ao registrar um evento, mostrar o último evento daquele candidato. [[memoria-cognicao]] · [[matilha-ux-foundation]]

**4. Troque carga cognitiva por carga motora; Lei de Fitts.** "Aumente motor load para reduzir cognitive load." CTAs primárias grandes e próximas, destrutivas pequenas e distantes. [[cognicao-pensamento]] · [[principios-cognitivos-produto]]

**5. Peça o mínimo, e só depois de dar valor.** "Quanto mais pede, mais mente, menos submissões." Evento mínimo = candidato + etapa + data. [[reservatorio-boa-vontade]] · [[interacao-social]] · [[plg-estrategias-growth]]

**6. Defaults inteligentes e pré-preenchimento.** Data = hoje, recrutador = usuário logado, vaga = última usada, próxima etapa sugerida. [[principios-cognitivos-produto]] · [[tomada-decisao]]

**7. A melhor mensagem de erro é nenhuma; quando inevitável, as 5 regras; nunca vazar implementação.** "Zero zod errors, stack traces… toda mensagem é tradução humana." [[erros-usabilidade]] · [[matilha-ux-foundation]]

**8. Yerkes-Dodson: o recrutador preenche sob pressão; reduza a superfície.** "Tunnel action: sob stress alto, pessoas repetem a mesma ação que não funciona." Modo "atualização rápida", sem modais. [[erros-usabilidade]] · [[principios-cognitivos-produto]]

**9. Queijo suíço: camadas independentes antes de qualquer mutação; undo obrigatório.** Importação = preview → validação → diff → confirmação; desfazer um lote inteiro. [[erros-usabilidade]] · [[matilha-ux-foundation]]

**10. Hábito semanal por B=MAP + Tiny Habits: âncora no ritual que já existe.** "After I [ANCHOR], I will [TINY], then I [CELEBRATE]"; frequency caps obrigatórios. [[frameworks-comportamentais]] · [[padroes-implementacao]] · [[hook-model]]

**11. Antecipação > recompensa; o investimento fecha o ciclo.** "Dopamina não é prazer, é wanting/seeking"; Stored Value Moat. Ao salvar, mostrar a consequência na hora; streaks só com grace period. [[dopamina-comportamento]] · [[hook-model]] · [[padroes-implementacao]] · [[motivacao-comportamento]]

**12. Feedback contínuo e bookend.** "Toda operação > 500 ms imprime status por step. Zero silêncio"; "nunca termina em erro; termina em narrativa". [[cognicao-pensamento]] · [[matilha-ux-foundation]] · [[peak-end-rule]]

## Princípios de arquitetura/analytics

**1. Eventos imutáveis são a fonte da verdade; o painel é projeção reconstruível.** "Estado atual = replay de todos eventos. Audit trail completo." [[dual-write-event-sourcing]] · [[scaling-databases]]

**2. Upload como ingestão idempotente: hash de conteúdo + diff + checkpoint com replay.** Argos: SHA-256 no texto extraído; checkpoints para "replay de qualquer estágio"; "idempotência: sempre parecem overkill até falharem em prod". [[argos-architecture-design-v3]] · [[design-cases]] · [[common-services]]

**3. Máquina de estados explícita; reprocessar = mudar status; fila de revisão para o que falha.** `bulk-approve` "transforma horas de revisão manual em minutos". [[argos-arquitetura]] · [[argos-architecture-design-v3]] · [[design-cases]]

**4. Duas stores com responsabilidades distintas; consistência escolhida, não acidental.** Escrita do recrutador fortemente consistente; painéis eventualmente consistentes com carimbo de frescor; planilha = batch, eventos manuais = streaming. [[nfr-system-design]] · [[argos-architecture-design-v3]] · [[scaling-databases]]

**5. Consumers por cadência e histórico como linha do tempo.** Projeção em tempo real para a vista operacional; batch semanal para a executiva. [[dual-write-event-sourcing]] · [[argos-architecture-design-v3]]

**6. AARRR diagnostica, North Star direciona, coortes provam.** "Consertar o mais fraco ANTES de otimizar outros"; NSM candidata: "contratações qualificadas dentro do SLA por semana". [[aarrr-growth-metrics]] · [[plg-estrategias-growth]]

**7. Instrumente o próprio módulo: métricas de uso, 4 golden signals, alarmes com runbook.** "% de recrutadores que atualizaram antes da reunião"; alarme "sem eventos há 7 dias". [[padroes-implementacao]] · [[nfr-system-design]] · [[argos-architecture-design-v3]] · [[common-services]]

**8. Contrato de evento versionado; downstream faz pull.** `schema_version`; cada relatório novo é um consumer novo. [[argos-architecture-design-v3]] · [[scaling-databases]]

## O que a wiki NÃO cobre

- Idempotency keys e snapshots vs event sourcing como trade-off nomeado: só menções esparsas.
- Grids editáveis / UX de planilha e dashboards de BI para executivos como tema próprio: o mais próximo é o caso "Dashboard Top 10" em [[design-cases]] e os tokens do [[gravicode-frontend-neural-interface]].
- Metodologia de análise de coortes: só citada dentro de [[aarrr-growth-metrics]].

## Páginas consultadas

Integralmente: wiki/index.md · wiki/overview.md · concepts: atencao-foco, memoria-cognicao, cognicao-pensamento, percepcao-visual, leitura-tipografia, processamento-inconsciente, tomada-decisao, emocoes-sentimentos, interacao-social, erros-usabilidade, motivacao-comportamento, dopamina-comportamento, leis-de-krug, navegacao-web, reservatorio-boa-vontade, testes-usabilidade, frameworks-comportamentais, hook-model, peak-end-rule, principios-cognitivos-produto, padroes-implementacao, aarrr-growth-metrics, plg-estrategias-growth, jtbd-positioning, dual-write-event-sourcing, scaling-databases, nfr-system-design, common-services, design-cases, argos-arquitetura, gravicode-frontend-neural-interface · sources: 100-things-every-designer, nao-me-faca-pensar, acing-system-design, neuro-experience-skill, product-growth-hacking, product-htrategy · analyses: matilha-ux-foundation, argos-architecture-design-v3, 2026-04-14-adedonha-engagement-blueprint, 2026-07-08-fluency-humanizacao-chat-doutrina.

Por trecho: wiki/methodology/principios-transversais.md · 10-prd.md · 00-mapeamento-problema.md · 60-deploy-infra.md · wiki/concepts/gravicode-passa-plantao.md
