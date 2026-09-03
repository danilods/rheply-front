# Pesquisa: o que dá para extrair da Gupy (R&S) automaticamente vs. o que precisa ser carregado à mão

*Brief produzido por agente de pesquisa em 02/09/2026 para o plano do módulo Atração & Seleção do Rheply. Toda a documentação de desenvolvedor (developers.gupy.io) foi lida diretamente, incluindo os esquemas OpenAPI. A central de ajuda atual (suporte.gupy.io) é renderizada por JavaScript com CAPTCHA e não pôde ser aberta; os artigos antigos do Zendesk devolvem 404. Onde a evidência veio apenas de trechos indexados, isso está sinalizado como "(trecho indexado)".*

## 1. API pública da Gupy R&S

**Existe, é self-service para clientes e cobre bem vagas/candidaturas/contratações.**

- **Nome/portal:** "API Pública da Gupy" / Gupy API, documentada em https://developers.gupy.io/ (índice completo de endpoints em https://developers.gupy.io/llms.txt).
- **Base URL:** `https://api.gupy.io/api/v1` (v1) e `https://api.gupy.io/api/v2` (v2).
- **Autenticação:** `Authorization: Bearer <token>`; tokens de R&S "não expiram"; gerados em *SETUP > Configurações Avançadas > Geração de Tokens*, por perfil master/administrador com permissão "Gerenciar Tokens de API Pública"; cada token tem escopo por endpoint, e para usar v2 é preciso habilitar todos os endpoints v1 e v2 — https://developers.gupy.io/docs/autentica%C3%A7%C3%A3o-recrutamento-sele%C3%A7%C3%A3o
- **Gating por plano:** "Para obter um token de acesso às APIs da Gupy, você precisa adquirir nosso plano Premium ou Enterprise" (https://developers.gupy.io/docs/autentica%C3%A7%C3%A3o). A página de preços atual nomeia os planos como Scale e Enterprise e lista "API pública para extração de dados" em ambos; integrações com parceiros são "complemento pago disponível no plano Enterprise" (https://www.gupy.io/precos).
- **Rate limit:** 500 requisições/minuto **por IP**, janela de 5 min, HTTP 429 com header `WAF: Rate-Limit`, "sujeito a mudança sem aviso" — https://developers.gupy.io/reference/rate-limiting. Boas práticas: backoff exponencial (máx. 5 tentativas) e filtros `updatedAfter`/`updatedBefore` — https://developers.gupy.io/docs/guia-de-boas-pr%C3%A1ticas-no-consumo-de-api
- **Paginação:** v1 usa `page`/`perPage` (máx. 100) com `totalResults`/`totalPages` — https://developers.gupy.io/reference/pagination; v2 usa cursor (`maxPageSize` + `pageToken`/`nextPageToken`).

**Recursos v1 relevantes:** `GET/POST /jobs`, `PATCH /jobs/{id}`, `GET /jobs/{id}/steps`, `GET /jobs/{id}/custom-fields`, `GET /applications` (por vaga), `PATCH /applications/{id}` (mover/reprovar), tags, `GET /applications/{id}/hiring-information`, comments, rating-criteria, job-offers, `/vacancy-codes`, `/career-pages`, departments/roles/branches/users, `/webhooks`, e — importante — `GET /dismissals` e `GET /performance-evaluations` (categoria "Post Hiring").

**Campos de vaga (v1 `GET /jobs?fields=all`, https://developers.gupy.io/reference/findjobs):** `status` (draft, waiting_approval, approved, disapproved, published, frozen, closed, canceled), `createdAt/updatedAt/publishedAt/approvedAt/disapprovedAt/closedAt/cancelAt`, **`lastFreezeDate`/`lastUnFreezeDate`**, `numVacancies`, `vacancyCodes[]` (id, code, status valid/invalid/error/waiting), `reason` (staff_increase / staff_replacement), `salary{currency,startsAt,endsAt}`, `hiringDeadline`, `applicationDeadline`, `workplaceType`, `disabilities`, department/role/branch, `careerPageId/Name`, manager/recruiter/creator (id, nome, e-mail), **`cancelReason`** (staff_increase_or_substitution_postponed, cancellation_requested_by_manager, internal_transfer, organizational_restructuring, budget_review, other), `cancelReasonNotes`, `canceledByEmail`, `customFields[]`, `approvers[]` (ids), `workflowRequestMethod` (all_at_once / in_order), `publicationType` (**só external/internal**).

**Campos de candidatura v1 (`GET /applications?jobId=`, https://developers.gupy.io/reference/findapplications):** exige `jobId`, **não tem `updatedAfter`**; `status` (in_process, give_up, reproved, hired); `disapprovalReason` (27 valores enumerados) + `disapprovalReasonNotes`; `hiringDate`, `hiringType` (employee_admission, readmission, reintegration, unrelated_worker_hiring, internal_transfer); `vacancyCode.code`; `source` (autodeclarado: google, facebook, instagram, linkedin, **whatsapp**, indeed, catho, company_website, referral, university, github, telegram, other) e `partnerName` (canal técnico); `referred/referredBy/referralStatus` (pending, confirmed, rejected, unknown); `tags`; `score`; `matching`; `isCompanyEmployee`; PCD/tipos de deficiência; `additionalQuestions`. Sem histórico de etapas e sem `disapprovedAt`. Salário de contratação vem de `GET /jobs/{jobId}/applications/{applicationId}/hiring-information` — https://developers.gupy.io/reference/findhiringinformation

**v2 é a API certa para analytics (https://developers.gupy.io/v2.0/reference/applicationscontroller_getall e https://developers.gupy.io/v2.0/reference/jobscontroller_getall):**

- `GET /api/v2/applications`: `jobId` **opcional** (lista todas as vagas), `updatedAfter`, cursor; `status` (in_progress, hired, disqualified, withdrawn) com **`hiredAt`, `disqualifiedAt`, `withdrawnAt`**; `affinity`; `source` com 60+ valores (inclui `whatsapp_chatbot`, `sharing_whatsapp`, `linkedin_rsc`, `manual_insertion`, `assigned_from_talent_pool`, `internal_mobility`, `public_api`); `referral{referrer{name,email},status}`; `admission{type,date,salary{amount,currency},positionId}`; `disqualification{reason, observation, trigger (manual | eleminatoryQuestion), feedbackSentAt, disqualifiedBy}`; e **`expand=steps` devolve o histórico de etapas da candidatura**: `ApplicationStepsExpand {id, name, category, order, startDate: "Step entry date", endDate: "Step exit date"}`.
- `GET /api/v2/jobs`: `updatedAfter`, `status` (inclui `template`), `quickApply`, `numPositions`, `reason`, `lastFrozenAt/lastUnfrozenAt/canceledAt`, `expand=positions,posting,jobSteps,recruiter,manager,creator,department,branch,role,careerPage`; `posting.publicationType` com **external, confidential, unlisted, internal, internal_mobility**.
- `GET /api/v2/candidates` (`updatedAfter` default = 6 meses); `GET /api/v2/applications-diversity` (anonimizado: gênero, raça/cor, orientação, PCD).
- O guia oficial "Fluxo de Extração de dados para fins de BI" prescreve a ordem jobs → applications → candidates → diversity, usa `updatedAfter`, avisa que "APIs trabalham por padrão em GMT 0", que **"nem todos os campos da v1 estão na v2"** e que **dados de workflow (aprovação) não estão disponíveis via API** — https://developers.gupy.io/docs/fluxo-de-extra%C3%A7%C3%A3o-de-dados-para-fins-de-bi

**Webhooks (https://developers.gupy.io/reference/webhooks):** eventos `application.created`, `application.completed`, `application.moved`, `application.assigned`, `application.pre-hiring-information-filled`, `candidate.hired`, `job.published`, `job.status-changed`, `job.changed`, `pre-employee.moved` (+ `application.evaluation`). Configuração via `POST /api/v1/webhooks`. Garantias: entrega *at least once* (deduplicar por `id`), sem ordem (usar `date`), timeout 30 s, retentativas 1/5/15/30 min por 2 h, desativação automática após 7 dias com 100% de erro, IPs de origem fixos, HTTPS obrigatório. Ressalvas: `application.created/completed` passam por fila com atraso "podendo ultrapassar 1 hora"; **`application.moved` não dispara para reprovação/desistência**; há relato de payload malformado em `job.*`. `job.status-changed` traz `currentStatus`/`previousStatus` (ex.: published → frozen). `candidate.hired` dispara quando os dados de pré-contratação são salvos e traz hiringDate, hiringType, salary, vacancyCode e o usuário que moveu.

## 2. Relatórios e analytics nativos

- **Aba Relatórios (via plataforma)** — trecho indexado: Vagas, **Histórico de status de vagas**, Inscrições, Contratações, Indicações, Visão geral de etapas, Funil de etapas, Testes e Interações; "restritos a clientes dos planos Premium e Enterprise"; campos customizados podem sair agrupados ou em colunas separadas — https://support-companies.gupy.io/hc/pt-br/articles/11206249633307-Relat%C3%B3rios-via-plataforma
- **Relatórios via suporte** (por e-mail, com periodicidade agendável): Candidatos por Empresa/Vaga, Resultados de Testes, Funil de Etapas por Empresa/Vaga, Gestão de Etapas por Empresa, Cargos/Áreas/Filiais, Indicações — https://support-companies.gupy.io/hc/pt-br/articles/1260803123490 (trecho indexado).
- **Dashboards nativos:** "Vagas", "Taxa de Conversão", "Inscrições e Candidatos" e "Experiência", com "tempo médio de fechamento de vaga", "tempo médio na etapa" e fontes de inscrição — https://www.gupy.io/blog/analise-de-dados-no-recrutamento · https://www.gupy.io/dados-e-analytics
- **Agendamento de export da aba Relatórios:** não encontrei evidência; o agendamento documentado é só para os relatórios enviados pelo suporte.

**Histórico de etapas com timestamps por candidato:** sim via API v2 (`expand=steps`); nos exports, não encontrei relatório por candidato com data de entrada/saída de cada etapa. **Motivo de reprovação por candidato:** sim via API; não encontrei coluna equivalente nos exports.

**Limitações consolidadas:** v1 não lista candidaturas entre vagas nem por `updatedAfter`; v1 não tem `disapprovedAt`; v1 reduz os 4 tipos de publicação a 2; a API guarda só o **último** ciclo de congelamento — "Tempo Congelada" acumulado precisa ser calculado a partir de `job.status-changed` ou de snapshots; histórico de aprovação não vem pela API; webhook de movimentação não cobre reprovação; `application.created` pode atrasar mais de 1 h.

## 3. Conceitos que o modelo de dados precisa refletir

- **Requisição e workflow de aprovação:** draft → waiting_approval | approved | disapproved; waiting_approval → approved; approved → published; published → frozen | closed | canceled; frozen → canceled | closed; cancelar exige `cancelReason` e "não é permitido com contratados" — https://developers.gupy.io/docs/fluxo-de-atualizacao-status-vagas. O "Novo Workflow" define níveis de aprovação por cargo, somente sequencial. A API expõe `approvers[]`/`workflowRequestMethod` e `approvedAt`, mas não a trilha por aprovador.
- **Motivo (Substituição / Aumento de quadro):** enum `reason` = staff_replacement / staff_increase.
- **Congelamento:** status `frozen`; para o candidato "a candidatura segue ativa". Cada ciclo emite `job.status-changed`.
- **Posições dentro da vaga:** `numVacancies`/`numPositions` + códigos de posição (`POST /api/v1/jobs/{jobId}/vacancies`, recurso ativado por feature flag). A contratação aponta para a posição via `jobVacancyCodeId`/`admission.positionId`.
- **Tipo de publicação:** UI tem "pública, interna, confidencial e não-listada"; v1 mapeia para external/internal; v2 traz unlisted/confidential/internal_mobility.
- **Candidatura Rápida:** inscrição reduzida; complemento pago; flag `quickApply`.
- **Banco de talentos:** tipo de vaga `talent_pool`; candidaturas originadas dele aparecem com `source=assigned_from_talent_pool`.
- **Etapas:** `GET /jobs/{jobId}/steps` → `type` (registration, online, offline, hiring), `category` (registration, screening, evaluation, pre-interview, interview, pre-hiring, offer, hiring). Só "Cadastro" e "Contratação" são fixas. **Normalize etapas por `category`, não por nome.**
- **Origem da aplicação:** três campos distintos (`source` autodeclarado, `partnerName` do canal, `source` v2 unificado) — use v2 e mantenha dicionário de-para.
- **Indicação:** `referred`, `referredBy`, `referralStatus`.
- **Matching/Ranking (Gaia):** afinidade 0-100; `score`/`affinity`, `matching`.
- **Tags:** palavras-chave livres por candidatura.

## 4. Ecossistema de integrações

- **Hub oficial:** "40+ integrações" (folha, BI, mensageria, WhatsApp, testes externos) — https://www.gupy.io/hub-de-integracoes
- **Folha/HRIS:** RM TOTVS, Protheus, Senior, ADP, Metadados (via Gupy Admissão). SAP SuccessFactors: não encontrei integração padronizada.
- **BI:** sem conector Power BI/Sheets nativo; caminho oficial: API → data lake → ferramenta. Zapier/Make/Pluga/n8n: não encontrei conector oficial.
- **Testes/assessments:** contrato aberto para provedores. **MAPA = Teste de Personalidade MAPA da Mapa HDS** (48 traços), que declara integração com Gupy — https://www.mapahds.com/recrutamento-e-selecao. Não encontrei endpoint da API do cliente que devolva resultados de testes de parceiros; o caminho é o relatório "Testes".
- **Gupy Admissão:** webhook `pre-employee.moved`.
- **Pós-contratação:** `GET /dismissals` (applicationId, date, reason: no_cause_employer_dismissal, contract_termination, early_termination_by_employer, voluntary, other; isRehired) e `GET /performance-evaluations` (applicationId, date, value high/medium/low). Permite turnover e qualidade da contratação **se** o RH registrar esses dados na Gupy.

## 5. Recomendação prática

| Opção | Viabilidade | Esforço | Riscos |
|---|---|---|---|
| **(a) API v2 + webhooks** | Alta | Médio (token admin, ETL incremental por `updatedAfter`, dedupe de webhooks) | 500 req/min por IP; campos só na v1; trilha de aprovação ausente; `application.moved` ignora reprovação; atrasos/duplicatas |
| **(b) Exports agendados por e-mail** | Média | Médio | Layout muda sem aviso; depende do suporte |
| **(c) Upload manual de XLSX** | Alta | Baixo | Retrabalho, atraso, erro humano; colunas variam |
| **(d) Extensão/RPA** | Baixa | Alto | Quebra a cada release; risco contratual e LGPD |

**Ordem sugerida:** começar com (c) como MVP, migrar o núcleo para (a) em seguida, manter (c) para o que a API não entrega, descartar (d).

**Feed mínimo de "vaga":** `GET /api/v2/jobs?updatedAfter=…&expand=positions,posting,recruiter,manager,creator,department,branch,role,careerPage` + complemento v1 `GET /jobs?fields=all` + webhook `job.status-changed`.

**Feed mínimo de "contratação":** `GET /api/v2/applications?updatedAfter=…&expand=steps,position,candidate` + v1 `hiring-information` + webhook `candidate.hired`; opcionalmente `dismissals`/`performance-evaluations`.

**O que precisa ser capturado fora da Gupy:** datas de touchpoints com o gestor, aprovação de O&R/salário, justificativas qualitativas de congelamento/cancelamento, decisão e data de aceite da proposta, data real de início, metas de SLA por etapa, resultados do MAPA quando não exportados, headcount/estrutura do HRIS.

## Tabela: dado | disponível? | fonte

| Dado | API / Export / Não | Fonte |
|---|---|---|
| Status da vaga e datas | API v1/v2 + Export | findjobs; jobscontroller_getall |
| Último congelamento/descongelamento | API (last*); ciclos completos só via webhook | findjobs; webhooks |
| Tempo total congelada | Não (calcular) | fluxo-de-atualizacao-status-vagas |
| Motivo e autor do cancelamento | API v1 + Export | findjobs |
| Requisição: aprovadores/método | API v1 | findjobs |
| Trilha de aprovação (quem/quando) | Não | fluxo-de-extração-para-BI |
| Posições e códigos de posição | API + Export | criando-uma-vaga-com-código-de-posição |
| Tipo de publicação (4 tipos) | API v2; v1 só 2 | jobscontroller_getall |
| Salário da vaga / da contratação | API + Export | findhiringinformation |
| Histórico de etapas com datas por candidato | API v2 `expand=steps` | applicationscontroller_getall |
| Motivo de reprovação + quem reprovou | API | findapplications; applicationscontroller_getall |
| Origem da aplicação | API + Export | findapplications |
| Indicação | API + Export | findapplications |
| Dados de diversidade | API v2 (anonimizado) | applicationsdiversitycontroller |
| Resultados de testes (MAPA) | Export "Testes"; API do cliente: não encontrei | integração-com-testes |
| Desligamentos / avaliação pós-contratação | API v1 | getdismissals; getperformanceevaluations |
| Status de admissão | API/webhook Gupy Admissão + Export | pre-employee-moved-event |
| Datas de touchpoints com gestor, aceite da proposta, início real | Não | — |

## Fontes

- https://developers.gupy.io/ · https://developers.gupy.io/llms.txt · https://developers.gupy.io/docs/produto-gupy-rs
- https://developers.gupy.io/docs/autentica%C3%A7%C3%A3o · https://developers.gupy.io/docs/autentica%C3%A7%C3%A3o-recrutamento-sele%C3%A7%C3%A3o
- https://developers.gupy.io/reference/rate-limiting · https://developers.gupy.io/reference/pagination · https://developers.gupy.io/docs/guia-de-boas-pr%C3%A1ticas-no-consumo-de-api
- https://developers.gupy.io/reference/findjobs · https://developers.gupy.io/reference/findapplications · https://developers.gupy.io/reference/findsteps · https://developers.gupy.io/reference/findhiringinformation · https://developers.gupy.io/reference/patchapplication
- https://developers.gupy.io/v2.0/reference/jobscontroller_getall · https://developers.gupy.io/v2.0/reference/applicationscontroller_getall · https://developers.gupy.io/v2.0/reference/talentscontroller_getall · https://developers.gupy.io/v2.0/reference/applicationsdiversitycontroller_getalldiversity
- https://developers.gupy.io/docs/fluxo-de-extra%C3%A7%C3%A3o-de-dados-para-fins-de-bi · https://www.gupy.io/integracao/fluxo-extracao-dados-fins-bi · https://developers.gupy.io/docs/fluxo-de-dados-de-diversidade-para-bi
- https://developers.gupy.io/reference/webhooks · https://developers.gupy.io/docs/configurando-webhooks-e-obtendo-payloads-reais- · https://developers.gupy.io/reference/application-moved-event · https://developers.gupy.io/reference/job-status-changed · https://developers.gupy.io/docs/candidate-hired · https://developers.gupy.io/reference/pre-employee-moved-event
- https://developers.gupy.io/v2.0/discuss/698c8ebf9c15990ea106638d · https://developers.gupy.io/v2.0/discuss/65c51d0974aa420040f4bd10
- https://developers.gupy.io/docs/fluxo-de-atualizacao-status-vagas · https://developers.gupy.io/docs/creating-a-job · https://developers.gupy.io/docs/criando-uma-vaga-padr%C3%A3o-com-c%C3%B3digo-de-posi%C3%A7%C3%A3o · https://developers.gupy.io/docs/criando-uma-vaga-com-candidatura-r%C3%A1pida · https://developers.gupy.io/docs/fluxo-recrutamento-interno
- https://developers.gupy.io/reference/getdismissals · https://developers.gupy.io/reference/getperformanceevaluations
- https://developers.gupy.io/docs/integra%C3%A7%C3%A3o-com-testes-de-provedores-externos · https://developers.gupy.io/docs/integra%C3%A7%C3%B5es-com-folha-de-pagamento
- https://www.gupy.io/precos · https://www.gupy.io/hub-de-integracoes · https://www.gupy.io/dados-e-analytics · https://www.gupy.io/teste-comportamental
- https://www.gupy.io/blog/analise-de-dados-no-recrutamento · https://www.gupy.io/blog/gaia-inteligencia-artificial-gupy · https://www.gupy.io/blog/banco-de-talentos-crm-gupy · https://www.gupy.io/blog/quantas-etapas-um-processo-seletivo-deve-possuir · https://www.gupy.io/integracao/fluxo-insercao-tags
- https://info.gupy.io/hubfs/Materiais%20para%20clientes%20-%20Recrutamento%20e%20Sele%C3%A7%C3%A3o/%5BExplicativo%5D%20Lan%C3%A7amento_%20Novo%20Workflow.pdf
- (trechos indexados) https://support-companies.gupy.io/hc/pt-br/articles/11206249633307-Relat%C3%B3rios-via-plataforma · https://support-companies.gupy.io/hc/pt-br/articles/1260803123490 · https://suporte.gupy.io/s/suporte/article/O-que-sao-vagas-de-Candidatura-Rapida
- https://www.mapahds.com/recrutamento-e-selecao · https://suporte.mindsight.com.br/hc/en-us/articles/4413171442715-03-How-to-open-a-vacancy-with-Mindsight-tests

**Lacuna:** a lista exata de colunas de cada relatório da aba "Relatórios" (help center protegido). Uma amostra exportada de "Histórico de status de vagas" e "Funil de etapas" fecha o mapeamento.
