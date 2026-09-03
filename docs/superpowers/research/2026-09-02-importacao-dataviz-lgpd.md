# Pesquisa: importação de planilhas, entrada estruturada, visualização de funis e LGPD

*Brief produzido por agente de pesquisa em 02/09/2026 para o plano do módulo Atração & Seleção do Rheply. Alguns domínios bloqueiam fetch (docs.sheetjs.com, support-companies.gupy.io, conjur.com.br); nesses casos foram usados espelhos/READMEs oficiais ou resumos de busca, sinalizados no texto. Números entre colchetes referem-se à lista de fontes ao final.*

## A. Importação de planilhas: UX e engenharia

### A.1 Padrão de wizard (estado da arte)

Os importadores comerciais convergem para o mesmo fluxo. O Flatfile descreve três estágios: adicionar dados, casar cabeçalhos com o template de destino, validar e corrigir [1]; seu diferencial é memória de mapeamento ("remembers your previously chosen mappings"), salvo só após o mapeamento completo e por schema [2][3]. O Dromo recomenda: detectar encoding/delimitador/cabeçalho automaticamente; **propor o mapeamento e pedir confirmação**; usar o conteúdo das colunas, não só o header, para casar campos; e tratar a correção inline em grade como "the single biggest differentiator": "A user who can fix row 4,812 in place completes the import. A user who has to go back to Excel and guess opens a support ticket". Validação em quatro camadas: obrigatórios, tipos, formatos e **unicidade contra registros existentes** [4]. O OneSchema se destaca na resolução de erros: filtrar linhas com erro e excluí-las em lote sem sair do importador [5].

O open source `react-spreadsheet-import` (MIT, Chakra UI) implementa exatamente os cinco passos relevantes para o export Gupy com título na linha 1 e cabeçalho na linha 3: **Upload → Select Sheet → Select Header Row → Match Columns → Validate/Edit**, com `rowHook`/`tableHook` para validação, `autoMapHeaders`/`autoMapDistance`, `maxRecords`, `maxFileSize` [6]. Alternativas: `tableflowhq/csv-import` (MIT) [7][8] e `importcsv/importcsv` [9].

| Importador | Licença | Passos incluídos | Nota |
|---|---|---|---|
| react-spreadsheet-import [6] | MIT | 5 passos (inclui seleção de aba e linha de cabeçalho) | Depende de Chakra UI; mais próximo do caso Gupy |
| tableflow csv-import [7][8] | MIT | upload, mapeamento, validação | CSV/TSV/XLS/XLSX |
| Flatfile / Dromo / OneSchema [1][4][5] | Comercial | tudo + mapeamento aprendido + correção em grade | Referência de UX, não de custo |

**Histórico, reimportação e rollback.** HubSpot não permite desfazer importações como evento; permite ver a importação e excluir em massa os registros que vieram dela [10]. O Airtable faz merge por um campo único [11]. O Salesforce Data Import Wizard limita a 50.000 registros, casa duplicatas por ID/nome/e-mail e suporta insert/update/upsert [12]. Engenharia: upsert por chave natural com `INSERT ... ON CONFLICT DO UPDATE` [13]; deduplicar a origem antes do merge; hash do conteúdo por linha para detectar mudança (padrão SCD Tipo 2) [14][15]; identificador determinístico de execução para saber "qual importação produziu qual dado" [16].

### A.2 Bibliotecas de parsing

| Biblioteca | Licença | Formatos | Datas | Fórmulas | Observações |
|---|---|---|---|---|---|
| SheetJS CE [17][18][19] | Apache-2.0 | xls, xlsx, xlsb, csv… | `cellDates`, `date1904`, `dateNF`; assume fuso local | `cell.f` + `cell.v` (valor em cache); CE não recalcula | npm `xlsx` parado em 0.18.5 há ~4 anos; versões novas só em cdn.sheetjs.com |
| ExcelJS [20] | MIT | xlsx, csv (sem xls) | `Date` JS; opção 1904 | `cell.value = {formula, result}` | leitor streaming; relato de OOM com xlsx de 6 M linhas [21] |
| read-excel-file [22] | MIT | xlsx (lança `XLS_FILE_NOT_SUPPORTED`) | `dateFormat` | não | `schema` tipado com erros por linha/coluna; Web Worker no browser |
| PapaParse [23] | MIT | csv/tsv | — | — | auto-detecção de delimitador, `worker`, streaming, `header`, `dynamicTyping` |

**CVEs e versão do SheetJS.** CVE-2023-30533 (prototype pollution, corrigido em 0.19.3) e CVE-2024-22363 (ReDoS, corrigido em 0.20.2) atingem justamente a versão do npm [24][25]; a instalação correta é `npm i https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz` [18][19]. Espere alertas de Dependabot se qualquer transitiva puxar `xlsx@0.18.5` [26].

**Datas seriais.** Excel guarda datas como número de dias desde 1900 (ou 1904 em arquivos criados no Mac), com o bug herdado do Lotus 1-2-3 em que o serial 60 vale 29/02/1900 [27][28]; SheetJS trata datas relativas ao fuso local [17]. Há bugs conhecidos no ExcelJS com "1/1/1900" [29] e com xlsx em modo Strict [30]. Regra prática: parsear no servidor com `TZ=UTC` fixo, converter para data civil (YYYY-MM-DD) e nunca para timestamp.

**Cabeçalho na linha 3, abas ocultas, fórmulas.** `sheet_to_json` aceita `range`, `header`, `defval`, `blankrows`, `raw`, e `sheetRows` limita a leitura [17][31][32]. Visibilidade: `wb.Workbook.Sheets[i].Hidden` = 0 visível, 1 oculta, 2 "very hidden" [33]. Fórmulas: usar o valor em cache e sinalizar células sem cache como erro.

**Encoding pt-BR.** CSVs gerados pelo Excel no Windows costumam vir em windows-1252 e delimitador `;` [34]; PapaParse tem a opção `encoding`, mas há issue aberta para cp1252 [35]. Prefira o `.xlsx` original e, para CSV, leia como `ArrayBuffer`, detecte BOM e decodifique com `TextDecoder('windows-1252')`.

### A.3 Next.js + Vercel: limites reais

A premissa "corpo de 100 MB" **não se confirma** na documentação de funções (atualizada em 24/08/2026): o limite de payload de request/response continua **4,5 MB** (erro 413 `FUNCTION_PAYLOAD_TOO_LARGE`) [36][37]. Duração com Fluid compute: 300 s padrão, 800 s máximo em Pro/Enterprise; memória 2 GB padrão / 4 GB máx. [36]. Server Actions têm `bodySizeLimit` padrão de 1 MB [38]. Route Handlers leem `request.formData()` [39].

Arquitetura recomendada pela Vercel para arquivos > 4,5 MB: **client upload direto para o Vercel Blob** via `upload()` + `handleUpload`, autenticando em `onBeforeGenerateToken` e recebendo `onUploadCompleted` [40]. O Blob aceita stores **privados**, AES-256 em repouso e escolha de região (inclui **gru1 São Paulo**; imutável após criação) [41][42][43]. Para processamento: Vercel Workflows (`'use workflow'`/`'use step'`, resumável, sobrevive a deploys) e Queues (at-least-once, consumidor idempotente) [36][44][45]. Alternativas: Inngest, Trigger.dev [46].

### Recomendações (A)

1. Fluxo: upload → parsing → preview/diff → commit; UI com os 5 passos e mapeamentos salvos por "template Gupy" versionado.
2. Chave natural = IDs do Gupy; upsert + hash de linha; tabela `import_batch` (arquivo, hash SHA-256, usuário, contagens) e "desfazer" = reverter registros do batch.
3. Erros: grade editável com filtro "só linhas com erro", exportar erros, importação parcial explícita; nunca falha silenciosa.
4. ExcelJS ou read-excel-file (ou SheetJS 0.20.x via CDN); parse com `TZ=UTC`; rejeitar células com fórmula sem cache.

## B. Entrada estruturada de dados para recrutadores

### B.1 Taxonomia de motivos

Greenhouse: "We rejected them" (Duplicate, Lacking skills/qualifications, Not a cultural fit, Preferred another candidate, Spam, Other), "They rejected us" (Didn't like offer, Wasn't available, Wasn't interested, Other), "Security concern" e "None specified"; a exigência de motivo é configurável e o Rejection Reasons Report filtra por vaga, etapa, recrutador [47][48][49]. Ashby: Rejected by Organization / Rejected by Candidate / Other; recomenda especificidade ("Offer declined" não é acionável; prefira "compensation not competitive" ou "accepted competing offer"), monitorar a fração de "other/withdrew" como métrica de qualidade, motivos genéricos no início e por critério nas etapas finais [50]. Lever: archive reason type rejected by org / by candidate / other / hired [51][52].

A API do Gupy usa `status` ∈ {in_process, give_up, reproved, hired}, `disapprovalReason`, `disapprovalReasonNotes` e `endedAt` [53]; ao reprovar na plataforma, o motivo é obrigatório [54]. Espinha dorsal MECE:

| Tipo (excludente) | Exemplos da lista atual | Etapa típica |
|---|---|---|
| Empresa reprovou | escolaridade, sem mobilidade, reprovado avaliação técnica/comportamental | triagem, testes, entrevistas |
| Candidato desistiu/declinou | salário incompatível, aceitou outra proposta, desistiu na documentação | retorno, proposta, documentação |
| No-show | não compareceu (entrevista RH/gestor/teste) | qualquer etapa agendada |
| Encerramento administrativo | vaga cancelada/congelada, duplicidade | qualquer |

Cada motivo deve ter `tipo`, `etapa_aplicável` e `ativo`; "Outro" exige nota livre e vira indicador de qualidade [50].

### B.2 Padrões de entrada rápida

| Grid | Licença | Copiar/colar do Excel | Acessibilidade | Nota |
|---|---|---|---|---|
| TanStack Table [55][56] | MIT (headless) | você implementa | você implementa | máximo controle, mais trabalho |
| react-data-grid (adazzle) [57] | MIT | sim, com fill handle | DOM nativo | "Excel-like grid… keyboard navigation, copy & paste" |
| Glide Data Grid [58][59] | MIT | `onPaste: true` | canvas com DOM oculto/ARIA | melhor performance em canvas |
| AG Grid Community [60][61] | MIT | **clipboard é Enterprise** | boa | edição básica |
| Handsontable [62][63][64] | comercial (≈ US$ 790–999+/dev/ano) | sim | WCAG 2.1 AA desde v14 | melhor "planilha", mas paga |

Evidências de UX: validação inline aumentou a taxa de sucesso em 22%, reduziu erros em 22%, elevou satisfação em 31% e cortou o tempo em 42% (Wroblewski) [65]. NN/g: placeholders como rótulo aumentam erros [66]; validar no blur, mensagem junto ao campo [67][68]; formulários que seguem as diretrizes têm 78% de envios corretos na primeira tentativa [69]; calendário só para datas próximas [70]. Erro humano em digitação: 0,55%–3,6% (Barchard & Pace, 2011); dupla digitação atingiu 77,4% de acurácia perfeita contra 17,1% da checagem visual [71][72].

**Kanban com timestamp automático** é o padrão dos ATS: Greenhouse guarda `application_stages` com `entered_at`/`exited_at` [73]; Ashby mantém `applicationHistory` e permite corrigir a hora de entrada [74]; sem auto-timestamp, o tempo por etapa "is manually entered, making it unreliable for bottleneck analysis" [75].

### Recomendações (B)

1. Modelo por **eventos de etapa** (etapa, entrou_em, saiu_em, resultado, motivo_id, autor); mover etapa gera o evento com `now()` e data editável, com justificativa quando retroativa.
2. Grade tipo planilha só para carga inicial/backfill; operação diária via kanban + ações rápidas que exigem `tipo → motivo` em dois cliques, com busca e motivos recentes no topo.
3. Motivo obrigatório em qualquer saída, "Outro" com nota e meta de < 10% do total; alinhar rótulos ao `disapprovalReason` do Gupy.
4. Mobile: mesmas quatro ações rápidas, sem grade.

## C. Visualização de funis e dashboards de TA

### C.1 Crítica ao funil e alternativas

Storytelling with Data: funis são centralizados, "the bars don't share a consistent baseline", falham quando o topo é > 10× a base [76]. Peltier: "the whole funnel chart rationale is based on a faulty analogy" [77]. O funil "reliably conveys 'this process narrows' but unreliably conveys 'by how much'" [78][79]. Sankey serve para fluxos com múltiplas saídas por etapa, mas comparar larguras é difícil e muitos nós sobrecarregam [80][81][82].

Para tempo de preenchimento, a mediana é a prática em contratações em massa [83]; a média de mercado (SHRM 2022) é 54 dias, o que diz pouco sem distribuição [84]. Para KPIs semanais, gráficos de comportamento de processo (XmR, Wheeler) separam sinal de ruído [85][86]. Comparações por região/recrutador: pequenos múltiplos (Tufte) [87].

### C.2 Layout e tiles

Few (13 pitfalls): uma única tela; contexto para cada medida; sem precisão excessiva; barra > pizza; dados mais importantes no topo-esquerdo; cor contida ("we exclude the 10% of males and 1% of females who are color blind") [88]. Bullet graph substitui gauges e combina com sparklines [89][90]. NN/g: comprimento e posição 2D são os atributos pré-atentivos mais precisos [91]. Anatomia de KPI card: rótulo, valor grande, delta com direção, sparkline sem eixos, faixas de limiar [92][93]. Cores: variar luminosidade; testar daltonismo [94][95]; Okabe-Ito como paleta segura [96]. pt-BR com `Intl` [97] e `date-fns/locale/pt-BR` [98].

### C.3 Bibliotecas React

| Biblioteca | Licença | Tamanho (min/gzip) | SSR | Acessibilidade | Sankey/Funil |
|---|---|---|---|---|---|
| Recharts 3.x [99][100][101][102] | MIT | 548 KB / 144 KB | SVG | `accessibilityLayer` padrão na v3 | Sankey e FunnelChart nativos |
| Nivo 0.99 [103][104][105] | MIT | @nivo/bar 239 KB / 78 KB por pacote | SVG + renderização estática | ARIA/teclado | @nivo/sankey, @nivo/funnel |
| visx 3.12 [106][107] | MIT | modular | SVG | por sua conta | @visx/sankey |
| ECharts 6.1 [108][109][110][111] | Apache-2.0 | 1,06 MB / 359 KB | `renderToSVGString` | `aria.show` + decal | nativos |
| Chart.js 4.5 [112][113][114][115] | MIT | 196 KB / 67 KB | canvas (sem SSR) | canvas não é acessível | plugins |
| Plotly.js [116][117] | MIT | 4,6 MB / 1,4 MB | não | fraca | nativos |
| shadcn/ui charts [118][119] | MIT | = Recharts | idem | lacunas | não |
| Tremor [120][121] | Apache-2.0/MIT (Vercel) | = Recharts | idem | idem | não |

### Recomendações (C)

1. Recharts 3 (+ shadcn/ui charts) como padrão: barras horizontais por etapa com % de conversão; Sankey só na visão "destino por etapa".
2. Tiles: valor + delta vs meta/período + sparkline (8–13 semanas) + bullet para meta; XmR para vagas abertas/semana.
3. Tempo: mediana/P90 e histograma; buckets de aging por etapa; pequenos múltiplos por regional.
4. Paleta semântica fixa (avançou/reprovado/desistiu/no-show) testada; nunca só cor.

## D. LGPD e segurança

### D.1 Bases legais

O guia da FGV (v2.0, out/2023) lista as quatro bases usuais em seleção: **procedimentos preliminares de contrato (art. 7º, V)**, obrigação legal (arts. 7º, II e 11, II, "a"), legítimo interesse (art. 7º, IX) e, excepcionalmente, consentimento; e alerta que "as bases legais de execução de procedimentos preliminares… e de interesses legítimos **não se estendem para o tratamento de dados pessoais sensíveis**" [122, p. 11]. Cotas PcD (Lei 8.213/91, art. 93) fundamentam o dado de deficiência em **art. 11, II, "a"** [122]; para cota e eSocial, obrigação legal é a base mais sólida [123]. O legítimo interesse (Guia ANPD, fev/2024) exige finalidade concreta, teste de balanceamento e não vale para sensíveis [124]. O Gupy usa consentimento para PcD e "dados de diversidade", com "prefiro não responder" e revogação [125].

Dado de deficiência: a FGV o trata como dado de saúde; Migalhas argumenta que é sensível pelo potencial de discriminação [126]. Minimização: a FGV cita que endereço "pode gerar preterição… caso resida em zona de periferia" [122, p. 16].

### D.2 Retenção, direitos e governança

| Cenário | Orientação | Fonte |
|---|---|---|
| Fim do processo | finalidade cumprida → eliminar (arts. 15/16) | FGV p. 24–25 [122] |
| Defesa em ação trabalhista | até 2 anos por analogia à prescrição | Migalhas [127]; Quickin [128] |
| Banco de talentos | consentimento separado, prazo informado | FGV p. 19; Quickin [128] |
| Agregados anonimizados | podem ser mantidos (art. 16, IV) | ANPD estudo §54 [129] |
| Gupy | questiona após 1 ano de inatividade; AWS Virgínia | Aviso Gupy [125] |

Encarregado: art. 41 + Resolução CD/ANPD 18/2024 [130]. ROPA: art. 37 [131]. Incidentes: Resolução 15/2024, 3 dias úteis [132]. Transferência internacional: Resolução 19/2024, cláusulas-padrão obrigatórias desde 23/08/2025 [133][134]; região padrão das Vercel Functions é iad1 (EUA) [43]; use gru1 [41][43] e assine o DPA da Vercel [135]. RIPD (art. 38) recomendável; ANPD sugere HSM e logs de uso de chaves [129, §84]. Decisão automatizada (art. 20): o módulo não deve reprovar automaticamente [136]. Segurança: art. 46; guia da ANPD [137].

### D.3 CPF, pseudonimização e agregação

O export/API do Gupy já traz `candidate.id`, `application.id` e `job.id` [53]. **CPF não é necessário como chave.** O CPF é identificador único (Lei 14.534/2023) [129][138]; o estudo preliminar da ANPD (dez/2023) afirma que hash é "sujeita a ataques de força bruta e de dicionário… quando se conhece os candidatos aos dados em claro" [129, p. 37]: o espaço de CPFs é enumerável, então SHA-256 puro é reversível; a ANPD lista salting, tokenização e cifração com chave separada, e lembra que pseudonimizado **continua dado pessoal** [129, p. 21–22]. Mascarar CPF deixa a máscara válida para 100.000 titulares [129, p. 32]. Para cortes por PcD/gênero em grupos pequenos, k-anonimização (≥ k registros) [129, p. 40].

### Recomendações (D)

1. **Descartar CPF, endereço, telefone e data de nascimento na importação** (allowlist de colunas); chave = IDs Gupy; se preciso, HMAC-SHA-256(CPF, chave em KMS); nunca hash sem chave.
2. Bases legais no ROPA: funil = procedimentos preliminares + legítimo interesse; PcD = obrigação legal (cota); diversidade = só com consentimento já colhido no Gupy, e agregada.
3. Dashboards de gestores **somente agregados**, supressão de células < 5; PII nominal só para recrutadores autenticados, com RBAC e auditoria; retenção do arquivo bruto ≤ 90 dias.
4. Retenção: eventos pseudonimizados por até 2 anos, depois agregados; exclusão via IDs Gupy; encarregado e RIPD antes do go-live; gru1 + DPA.

## Fontes

1. https://support.flatfile.com/articles/7763163677-importing-data-with-flatfile-overview
2. https://flatfile.com/product/mapping/
3. https://support.flatfile.com/articles/8421984657-how-does-flatfile-ensure-mapping-is-as-accurate-as-possible
4. https://dromo.io/blog/building-a-seamless-csv-importer
5. https://dromo.io/blog/oneschema-vs-dromo-comparison-2026
6. https://github.com/UgnisSoftware/react-spreadsheet-import/blob/master/README.md
7. https://github.com/tableflowhq/csv-import
8. https://github.com/tableflowhq/csv-import/blob/main/LICENSE
9. https://github.com/importcsv/importcsv
10. https://community.hubspot.com/t5/Data-Hub/Undo-bulk-import-and-deletion/m-p/1249849
11. https://support.airtable.com/docs/csv-import-extension
12. https://help.salesforce.com/s/articleView?language=en_US&id=import_limits.htm&type=0
13. https://www.postgresql.org/docs/current/sql-insert.html
14. https://medium.com/@nripapathak/implementing-a-type-2-slowly-changing-dimension-scd-with-a-hash-value-cd5d80051d53
15. https://www.mssqltips.com/sqlservertip/5640/
16. https://fawadhs.dev/blog/idempotent-data-pipeline-design-safe-rerun
17. https://deno.land/x/sheetjs@v0.18.3/README.md
18. https://cdn.sheetjs.com/xlsx/
19. https://www.npmjs.com/package/xlsx
20. https://raw.githubusercontent.com/exceljs/exceljs/master/README.md
21. https://github.com/exceljs/exceljs/issues/355
22. https://github.com/catamphetamine/read-excel-file
23. https://github.com/mholt/PapaParse
24. https://cdn.sheetjs.com/advisories/CVE-2023-30533
25. https://cdn.sheetjs.com/advisories/CVE-2024-22363
26. https://github.com/memvid/memvid/issues/198
27. https://gist.github.com/christopherscott/2782634
28. https://github.com/SheetJS/sheetjs/issues/17
29. https://github.com/exceljs/exceljs/issues/1928
30. https://github.com/exceljs/exceljs/issues/2695
31. https://deno.land/x/sheetjs@v0.18.3/docbits/82_util.md
32. https://git.sheetjs.com/sheetjs/sheetjs/issues/947
33. https://docs.sheetjs.com/docs/csf/features/visibility/
34. https://xlork.com/blog/csv-encoding-issues-utf8-windows1252
35. https://github.com/mholt/PapaParse/issues/750
36. https://vercel.com/docs/functions/limitations
37. https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions
38. https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions
39. https://nextjs.org/docs/app/api-reference/file-conventions/route
40. https://vercel.com/docs/vercel-blob/client-upload
41. https://vercel.com/docs/vercel-blob
42. https://vercel.com/docs/vercel-blob/security
43. https://vercel.com/docs/regions
44. https://vercel.com/docs/workflows
45. https://vercel.com/kb/guide/how-to-run-background-jobs-in-nextjs-on-vercel
46. https://www.pkgpulse.com/guides/inngest-vs-triggerdev-vs-qstash-serverless-durable-2026
47. https://support.greenhouse.io/hc/en-us/articles/207305363-Rejection-reasons-overview
48. https://support.greenhouse.io/hc/en-us/articles/360038321491-Rejection-reason-requirement
49. https://support.greenhouse.io/hc/en-us/articles/203941409-Rejection-reasons-report
50. https://docs.ashbyhq.com/best-practices-managing-and-analyzing-archive-reasons
51. https://docs.ashbyhq.com/lever-subject-and-field-definitions
52. https://help.lever.co/hc/en-us/sections/20087177666333-Pipeline-and-Archive-Reasons
53. https://developers.gupy.io/docs/listing-applications
54. https://support-companies.gupy.io/hc/pt-br/articles/11168542239003
55. https://github.com/TanStack/table
56. https://tanstack.com/table/v8/docs/framework/react/examples/editable-data
57. https://www.simple-table.com/blog/handsontable-alternatives-free-react
58. https://github.com/glideapps/glide-data-grid
59. https://docs.grid.glideapps.com/extended-quickstart-guide/copy-and-paste-support
60. https://coreui.io/compare/ag-grid-alternative/
61. https://www.ag-grid.com/react-data-grid/clipboard/
62. https://handsontable.com/docs/javascript-data-grid/license-key/
63. https://www.componentsource.com/product/handsontable/prices
64. https://handsontable.com/blog/whats-new-in-handsontable-14-improvements-to-accessibility
65. https://alistapart.com/article/inline-validation-in-web-forms/
66. https://www.nngroup.com/articles/form-design-placeholders/
67. https://www.nngroup.com/articles/error-message-guidelines/
68. https://www.nngroup.com/articles/errors-forms-design-guidelines/
69. https://www.nngroup.com/articles/web-form-design/
70. https://www.nngroup.com/articles/date-input/
71. https://www.sciencedirect.com/science/article/abs/pii/S0747563211000707
72. https://link.springer.com/article/10.3758/s13428-019-01207-3
73. https://harvestdocs.greenhouse.io/reference/get_v3-application-stages
74. https://developers.ashbyhq.com/reference/applicationupdatehistory
75. https://count.co/metric/opportunity-stage-analysis
76. https://www.storytellingwithdata.com/blog/swdchallenge-funnel-chart
77. https://peltiertech.com/bad-graphics-funnel-chart/
78. https://graphtelling.com/blog/funnel-chart-alternatives/
79. https://www.atlassian.com/data/charts/funnel-chart-complete-guide
80. https://www.storytellingwithdata.com/blog/what-is-a-sankey-diagram
81. https://www.unixdaemon.net/career/visualise-recruitment-process-sankey/
82. https://ubidy.com/from-basic-to-advanced-recruitment-pipeline-visualisation-with-sankey/
83. https://resources.workable.com/tutorial/faq-time-to-fill-hire
84. https://www.icims.com/blog/time-to-fill-vs-time-to-hire-key-metrics-explained/
85. https://commoncog.com/process-behaviour-charts-more-than-you-need/
86. https://www.staceybarr.com/measure-up/interview-donald-wheeler-on-interpreting-signals-from-our-kpis/
87. https://www.forumone.com/insights/blog/good-data-visualization-practice-small-multiples/
88. https://www.perceptualedge.com/articles/Whitepapers/Common_Pitfalls.pdf
89. https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf
90. https://www.perceptualedge.com/blog/?p=217
91. https://www.nngroup.com/articles/dashboards-preattentive/
92. https://nastengraph.substack.com/p/anatomy-of-the-kpi-card
93. https://community.qlik.com/t5/Member-Articles/KPI-Cards-on-a-Dashboard-What-Types-Exist/ta-p/2543950
94. https://www.datawrapper.de/blog/colorblind-check
95. https://www.datawrapper.de/academy/what-to-consider-when-choosing-colors-for-data-visualization
96. https://thenode.biologists.com/data-visualization-with-flying-colors/research/
97. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
98. https://date-fns.org/docs/I18n
99. https://bundlephobia.com/api/size?package=recharts
100. https://github.com/recharts/recharts/wiki/Recharts-and-accessibility
101. https://recharts.github.io/en-US/api/Sankey/
102. https://github.com/recharts/recharts/wiki/3.0-migration-guide
103. https://bundlephobia.com/api/size?package=@nivo/bar
104. https://nivo.rocks/sankey/api/
105. https://www.pkgpulse.com/guides/recharts-vs-chartjs-vs-nivo-vs-visx-react-charting-2026
106. https://www.npmjs.com/package/@visx/sankey
107. https://blog.logrocket.com/best-react-chart-libraries-2026/
108. https://bundlephobia.com/api/size?package=echarts
109. https://apache.github.io/echarts-handbook/en/how-to/cross-platform/server/
110. https://apache.github.io/echarts-handbook/en/best-practices/aria/
111. https://github.com/hustcc/echarts-for-react
112. https://bundlephobia.com/api/size?package=chart.js
113. https://www.chartjs.org/docs/latest/general/accessibility.html
114. https://www.npmjs.com/package/chartjs-chart-sankey
115. https://github.com/sgratzl/chartjs-chart-funnel
116. https://github.com/plotly/plotly.js/blob/master/dist/README.md
117. https://github.com/plotly/react-plotly.js/
118. https://ui.shadcn.com/docs/components/base/chart
119. https://ashleemboyer.com/blog/a-quick-ish-accessibility-review-shadcn-ui-charts/
120. https://vercel.com/blog/vercel-acquires-tremor
121. https://github.com/tremorlabs/tremor
122. https://portal.fgv.br/sites/default/files/uploads/recursos_humanos.pdf
123. https://legale.com.br/blog/lgpd-dados-sensiveis-consentimento-e-bases-legais-seguras/
124. https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-lanca-guia-orientativo-sobre-legitimo-interesse
125. https://www.gupy.io/hubfs/LGPD/RS%20Candidatos/5%20versao/AVI_PRI_PT_Plataforma%20de%20Recrutamento%20e%20Sele%C3%A7%C3%A3o__v.5_07%20dezembro%202022.pdf
126. https://www.migalhas.com.br/depeso/380682/dados-de-pessoas-com-deficiencia-sao-dados-pessoais-sensiveis
127. https://www.migalhas.com.br/depeso/363808/o-tratamento-dos-curriculos-na-lgpd
128. https://www.quickin.io/post/por-quanto-tempo-guardar-dados-de-candidato-reprovado-o-que-a-lgpd-determina
129. https://www.gov.br/participamaisbrasil/blob/baixar/37060 (ANPD, Estudo Preliminar: Anonimização e Pseudonimização, v1.0, dez/2023)
130. https://www.tjba.jus.br/extrajudicial/wp-content/uploads/2024/08/RESOLUCAO-ANPD-No-18-Encarregado-de-Dados.pdf
131. https://confidata.com.br/blog/como-criar-ropa
132. https://www.legisweb.com.br/legislacao/?id=458235
133. https://www.irib.org.br/resolucao-cd-anpd-n-19-de-23-de-agosto-de-2024/
134. https://www.mayerbrown.com/pt/insights/publications/2025/08/end-of-grace-period-implementation-of-brazils-standard-contractual-clauses-in-international-transfers-of-personal-data
135. https://vercel.com/legal/dpa
136. https://www.migalhas.com.br/depeso/342521/a-lgpd-e-os-processos-seletivos-de-funcionarios
137. https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/guia-vf.pdf
138. https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14534.htm

**Lacunas conhecidas:** jurisprudência trabalhista específica sobre retenção de dados de candidatos, apps mobile de ATS e a versão final do guia de anonimização da ANPD não foram cobertos; as páginas de suporte do Gupy sobre relatórios não puderam ser lidas diretamente.
