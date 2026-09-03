# Pesquisa: KPIs canônicos, benchmarks e desenho de dashboards de R&S

*Brief produzido por agente de pesquisa em 02/09/2026 para o plano do módulo Atração & Seleção do Rheply (contexto: Equatorial Serviços). Fontes numeradas em `[n]` ao final. Quando um número é de reportagem secundária ou não pôde ser verificado na fonte primária, isso está sinalizado.*

## 1. KPIs canônicos: definições, fórmulas, relógios

**Padrões de referência.** O ANSI/SHRM 06001.2012 padroniza custo por contratação como *(custos internos + custos externos) ÷ contratações no mesmo período*, com categorias internas (salários da equipe de R&S, tempo de gestor/entrevistador, ATS/sourcing, bônus de indicação) e externas (agências, job boards, background check/testes, eventos, relocação, sign-on); onboarding, treinamento e rampa ficam fora [2]. A ISO 30414 lista, no cluster "Recrutamento, mobilidade e turnover": nº de candidatos qualificados por posição, *quality per hire*, tempo médio para preencher vagas (e vagas críticas), % de posições preenchidas internamente, % de posições críticas preenchidas internamente, taxa de turnover (voluntário, involuntário, crítico), motivos de saída; e no cluster "Custos": custo por contratação, custos de recrutamento e de turnover [3][4]. Especificações companheiras: ISO/TS 30407 (custo por contratação), 30411 (qualidade da contratação), 30421 (turnover e retenção), 30430 (métricas de recrutamento) [5]. A definição SHRM de *time-to-fill*: "número de dias corridos desde a abertura da requisição até o aceite da oferta, incluindo fins de semana e feriados", decomposta em sub-relógios (abertura→aprovação, aprovação→publicação, publicação→início da triagem, triagem, entrevistas, decisão+oferta, oferta→aceite) [1].

| KPI | Definição | Fórmula | Clock start / stop | Benchmark | Fonte |
|---|---|---|---|---|---|
| Time-to-fill (TTF) | Velocidade de fechamento da vaga | Σ dias / vagas fechadas (usar **mediana**) | Requisição aberta (ou aprovada) → aceite da oferta; dias corridos | SHRM não-exec: mediana 44 d (P25 28, P75 73) em 2021; mediana 39 d em 2026; Greenhouse meta 45 d | [1][6][7] |
| Time-to-approve (O&R) | Tempo do ciclo interno de aprovação | data aprovação − data criação | Criação → aprovação; SHRM mede "open→approved-to-fill" (mediana 7 d) e "approved→posted" (mediana 2 d) | SHRM 2021: 7 d + 2 d | [1] |
| Time-to-hire (TTH) | Velocidade do candidato no funil | data aceite − data entrada do candidato | 1º contato/candidatura → aceite | Gem: 41 d (2024); Ashby negócios 32 d; Customer Service 26 d, Ops 25 d, Sales 35 d | [8][9][10] |
| TTF "líquido" (sem congelamento) | TTF descontando dias em hold | TTF bruto − dias em hold | Igual ao TTF, excluindo congelamento | Hirebridge reporta gross e net; SAP SF tem opção "excluir tempo em hold" | [11][12] |
| Time-in-stage | Dias em cada etapa | leftStageAt − enteredStageAt | Entrada → saída (censurado se ainda na etapa) | Metaview: < 7 d por etapa ativa; > 14 d = atrito | [13][14] |
| Aging de requisições abertas | Idade das vagas abertas (evita viés de sobrevivência) | hoje − abertura, por faixa | Abertura → hoje | Taleo: 0-45 / 45-100 / 100-150 / 150+ d | [15][13] |
| Pass-through (conversão por etapa) | % que avança | avançaram ÷ **entraram na etapa no período** (coorte) | Coorte por data de entrada | Gem 2024: app→pré-onsite 6%, pré-onsite→onsite 20%, onsite→oferta 35% (inbound); app→contratação 0,5% (CS 0,7%, Ops 0,8%, Sales 0,6%) | [8][16] |
| Yield ratio | Razões acumuladas | ex.: 1:15 candidaturas→triagem | — | AIHR | [17] |
| Offer acceptance rate | Aceites ÷ ofertas | aceites ÷ ofertas | Oferta → resolvida | Gem 84% (2024), 82% (2026); CS 90%, Sales 88%; SHRM não-exec 90% | [8][18][9][1] |
| Source of hire / efetividade | Contratações por origem e conversão | hires(fonte) ÷ candidaturas(fonte) | Candidatura → contratação | Ashby: app→entrevista interno 42%, indicação 40%, agência 42%, inbound 3%; entrevista→oferta interno 32%, indicação 16%, agência 8%, inbound 6% | [19] |
| Custo por contratação | (interno + externo) ÷ contratações | — | Período fechado | SHRM 2025: US$ 5.475 não-exec; frontline alto volume US$ 4-5k | [2][20][13] |
| Quality of hire | Desempenho pós-contratação vs. expectativa (ISO/TS 30411) | média de indicadores (desempenho, retenção 90d/1a, satisfação do gestor, rampa) | 30/90/180 d e 1 ano | ≥ 75% "atende/excede"; só 20% das empresas medem | [21][13][20] |
| Turnover precoce (90 d / 1º ano) | Desligados da coorte | desligados ≤ 90 d (ou ≤ 12 m) ÷ admitidos | Admissão → desligamento | > 1/3 dos novos saem no 1º ano; retail 20-30% em 90 d; Brasil: 48,3% dos 1ºs empregos encerrados ao fim da experiência | [22][23][24] |
| Fill rate / vacancy rate | Entrega vs. plano | preenchidas ÷ abertas; vagas ÷ posições aprovadas | Período | — | [17][25] |
| Requisições por recrutador | Capacidade | vagas abertas ÷ recrutadores | Snapshot | SHRM 2021: mediana 20 (P25 6, P75 50); Gem 14; alto volume: 60+ | [1][8][18][26] |
| Contratações por recrutador | Produtividade | hires ÷ recrutadores ÷ trimestre | Trimestre | Gem/Ashby ~7/trim; frontline 25-40/trim | [27][13] |
| HM NPS | Satisfação do gestor | %promotores − %detratores | Ao fechar / 90 d | ≥ 30 ou ≥ 4,0/5 | [13] |
| cNPS | Experiência do candidato | idem | Por etapa | Starred 2024: reprovado após candidatura −14, após entrevista +1, contratado +82 | [28][29] |
| Interview-to-offer | Entrevistas por oferta | entrevistas ÷ ofertas | — | 3-4; Gem: CS 9, Ops 11, Sales 21 entrevistas/hire | [13][8] |
| No-show | Faltas | no-shows ÷ agendadas | Agendamento → data | Horistas: 30-50% típico, 8-12% best-in-class; < 10% aceitável | [30][31] |
| Drop-off por etapa e motivo | Saídas pelo candidato | desistências(etapa, motivo) ÷ entraram | Coorte | declínio de oferta < 15%; salário < 30% dos motivos | [13] |
| PCD compliance | Lei 8.213/91 | PCD ativos ÷ cota (2-5%) | Snapshot mensal | Setor privado cumpre 55,17% da cota (eSocial jun/2025) | [32][33] |

**Congelamento no TTF.** Não há padrão ANSI para hold; a prática é reportar TTF bruto e líquido [11][12]. O Greenhouse trata congelamento como fechamento da opening com close reason ("Budget Frozen") e reabertura manual, o que zera o relógio; por isso o ideal é manter o evento de hold explícito e calcular ambos [34][35].

## 2. Benchmarks globais e brasileiros

### Globais (alto volume / vendas / atendimento)

- **Funil (Gem, 31M+ candidaturas, 2024):** aplicação→contratação caiu de 1,6% (2021) para 0,5%; sourced converte 2,0% vs. 0,4% inbound; 20 entrevistas/hire; TTH 41 d. **Customer Service** 0,7% app→hire, 26 d, 9 entrevistas, 90% de aceite; **Operations** 0,8%, 25 d, 11 entrevistas; **Sales** 0,6%, 35 d, 21 entrevistas, 88% [8]. 2026: só 8% passam da triagem, 0,5% recebem oferta, 82% aceitam; indicações convertem 11x e mobilidade interna 32x o inbound [18].
- **Ashby (54M candidaturas):** pass-through screen 35%, onsite 24%, oferta 81%; TTF 60 d (negócios), 52 d (júnior); aceite 84% negócios vs. 73% técnico; tempo até arquivar candidato não entrevistado: mediana 6 d; arquivar em 1 dia dá NPS 9 vs. NPS 3 após 50+ dias [9][10][19].
- **SHRM (2.371 empresas, 2025):** CPH não-exec US$ 5.475; triagem 8-9 d e entrevistas 8-9 d; recrutamento = 26% do orçamento de RH; apenas 20% medem qualidade [20]. 2026: TTF não-exec mediana 39 d; 97% das contratações não-exec são externas [7].
- **Bersin/AMS:** TTH global 44 d (1T2023); energia & defesa 67 d (setor mais lento); LATAM "muito atrás" [36]. HR.com 2025: não-exemptos 30-60 d, 25% acima de 90 d [37].
- **Turnover precoce:** "mais de 1/3 dos novos contratados sai no 1º ano" (Work Institute); 75% das saídas são evitáveis [22][38]; 90 dias em retail/hospitality 20-30% [23]. Call center (global): 30-45% a.a., permanência 13-15 meses [39] — sem série brasileira equivalente pública.

### Brasil

- **Duração do processo:** Brasil tem os processos mais longos entre 25 países: 39,6 d (Glassdoor 2017) [40]; média 2021 de 42 d entre 1ª entrevista e contratação (Gupy) [41]; Catho: ~34 d [42]; Robert Half opera SLA ~30 d [43].
- **SLA por nível (Gupy):** operacionais 15-25 d; técnicas/administrativas 25-35; gerenciais 40-50; executivas 60-90; triagem ≤ 5 dias úteis, entrevistas iniciais ≤ 10 d, avaliação técnica+oferta ≤ 15 d [44]. Métricas nativas Gupy: tempo médio de fechamento de posição (inscrição → etapa de contratação), de fechamento de vaga (publicação → encerramento) e na etapa [45].
- **Recusas e desistências:** Intera (900 candidatos, 150 empresas, 2021): 35,5% das ofertas recusadas; contraproposta 36,7%, outro processo 26,3%, **salário abaixo do esperado 18,7%**; processos < 20 d têm 70% de aceite, > 30 d têm 50% de recusa [46]. Sólides 2025: **44% desistem por salário abaixo da média**, 32% por falta de transparência [47]. Robert Half 2026: 61% pretendem trocar de emprego; remuneração motiva 42% [48].
- **Turnover:** rotatividade formal (CAGED) 32,8% (2024) → 33,6% (2025); comércio 35,4%, serviços 32,1% [49][50]. DIEESE (2015): rotatividade global celetista 54,8%, descontada 41%; 39,6% dos vínculos têm ≤ 1 ano [51]. Voluntárias = 48% dos desligamentos (2021) [52]; 39% dos desligamentos de qualificados foram a pedido (2023) [53]. Primeiro emprego: 48,3% desligados ao término da experiência de 90 d, permanência média 4,3 meses [24].
- **Norte/Nordeste:** Nordeste gerou 19,5% dos empregos formais de 2024 [54]. Contratações de PCD por região (Gupy 2024): Sudeste 59%, Sul 17%, **Nordeste 13%, Norte 3,3%** [55]; admissões PCD 1S2025 (eSocial): Nordeste 8.438, Norte 2.698 [32]. *Não há benchmark público de TTF/conversão para NE/N ou para promotor de vendas.*
- **Especificidades legais que explicam "desistiu na documentação/admissão":** aviso prévio de 30 d (+3 d/ano até 90 d para o empregador; o empregado que pede demissão deve 30 d), logo o candidato empregado entra ≥ 30 d após o aceite [56]; exame admissional obrigatório (CLT art. 168; ASO válido 135 d) [57]; eSocial S-2200 até o dia anterior ao início, ou S-2190 preliminar [58][59]; contrato de experiência ≤ 90 d com uma prorrogação, rescisão antecipada custa 50% dos dias restantes (art. 479), concentrando desligamentos nos dias 45 e 90 [60]. Medir separadamente **aceite → documentação → admissão (eSocial) → dia 1** e monitorar o *no-show de dia 1*.

## 3. Dashboards por audiência

| Audiência | Cadência | Conteúdo | Cortes |
|---|---|---|---|
| **Superintendência (1 página)** | Semanal + tendência 12 m | Contratações vs. plano (fill rate), vagas abertas por faixa de aging, TTF mediana bruto/líquido, aceite de oferta, turnover 90 d/1º ano, PCD (ativos ÷ cota), custo vs. meta | Estado/filial, cargo, motivo de abertura, origem (interno/externo/consultoria) |
| **Gerência** | Semanal/mensal | Funil por etapa com pass-through e time-in-stage; gargalos por gestor (tempo de retorno, feedback pendente); vagas em risco (RYG) | Gestor, recrutador, filial, cargo, fonte |
| **Recrutador (worklist)** | Diário | Candidatos parados > N dias, retornos vencidos (SLA 5 dias), entrevistas do dia + confirmações, documentação pendente, no-shows | Recrutador, vaga |

Padrões dos ATS: Greenhouse (pipeline history & pass-through, snapshots, close reasons, metas de SLA "time to review", "time in stage goal attainment") [64][65][35]; Gem distingue *Funnel view* (coorte) de *Activity view* (snapshot) e destaca o pass-through *recruiter screen → onsite* como termômetro de alinhamento com o gestor [16][66]; Lever separa Pipeline e Recruiter Operations [67][68]; Taleo publica aging em faixas com semáforo [15]. Reunião semanal: seis pilares (impacto financeiro, service reporting, urgências, performance, follow-up, riscos) com a linha *Meta → Real → Variação → Impacto → Causa → Plano* [71]; revisar o pipeline do estágio de oferta para trás [72]; "red-flag dashboard" de candidatos sem movimentação por 7-10 dias úteis [63].

## 4. Analytics para a agenda aberta

- **Turnover no 1º ano por coorte (sobrevivência).** Cada admissão com `tenure` e `evento` (1 = desligou; 0 = censurado); curvas Kaplan-Meier por coorte, fonte, recrutador, gestor, filial e cargo; log-rank; Cox para fatores de risco. Quedas típicas nos dias 5-15 (onboarding) e 60-90 (fim da experiência) [23][74]. Separar *managed* de *unmanaged* [17]. Marcar cortes 45/90 d [60].
- **"Perfil de sucesso" por cargo.** ISO/TS 30411: média de aprovado na experiência, meta em 90/180 d, retenção 90 d/1 ano, satisfação do gestor, Net Hiring Score [21]. Cruzar com fonte, escolaridade, resultado MAPA, experiência em vendas, distância/mobilidade.
- **Recrutamento interno.** ISO: % preenchidas internamente [3]. SHRM não-exec mediana 8% (média 16%) [1]; candidatos internos convertem 32x o inbound [18]; retenção 60% maior em empresas com contratação interna [75].
- **Consultoria vs. in-house.** Agências cobram 20-30% do salário anual; in-house fica mais barato a partir de 6-8 contratações/ano [76]; candidatos de agência passam bem na triagem (42%) mas convertem menos em oferta (8%) que indicações (16%) [19]. Exigir da consultoria os mesmos eventos.
- **Motivos de recusa → loop de remuneração.** Taxonomia fixa; investigar quando declínios por salário superam 30% ou aceite cai abaixo de 75% [13][77]; publicar faixa salarial no anúncio [78].
- **No-show/ghosting.** < 10% aceitável [31]; horistas chegam a 8-12% com lembretes multi-toque (48 h, manhã, 2 h antes), auto-agendamento, contato em 24 h; lembretes reduzem no-shows em até 40-50% [30][79]. Ashby: links de agendamento direto colocam 72% das entrevistas em 1 dia [80]. Medir também *no-show de dia 1* [22].

## 5. Modelo de dados

- Uma linha por candidato × vaga mais **eventos de transição de etapa** com `enteredStageAt`/`leftStageAt`, etapa, ator e motivo (modelo Ashby `application.listHistory`, `archiveReason` tipado) [81][82]. Greenhouse: `applications`, `offers`, activity feed; Fivetran materializa `application_history` com time-in-stage [83][84]. Datapeople: "uma linha por candidato por vaga, transições em tempo real, incluindo os que desistiram" [86]. Snapshots diários para "quantos estavam em cada etapa no dia X" [87][64].
- **Requisição × posições:** Greenhouse modela *job* → *openings[]* (opening_id, opened_at, closed_at, close_reason, application_id) [83][88]. Requisições *evergreen* distorcem TTF [89][90].
- **Congelamento:** eventos `hold_start/hold_end` na requisição (não fechar/reabrir) [11][34].
- **Cohorting:** TTF por coorte de fechamento + aging por coorte de abertura (viés de sobrevivência) [13][91]; pass-through por coorte de entrada na etapa [16].

## 6. Contexto setorial

- **Equatorial Serviços:** "primeira multisserviços do setor": call center, vendas, back-office em MA, PA, PI, AL e RS [92]. Maio/2025: 37 vagas de televendas em Teresina com mais 100 previstas [93]; junho/2025: 24 vagas de Assistente Comercial com reserva PCD [94]. Promotor de Vendas vende seguros porta a porta [95]; Equatorial Seguros mira 1 milhão de segurados até 2026 [96]. O grupo usa Gupy e roda programas de trainee/Novos Talentos [97][98].
- **Relatórios do Grupo Equatorial:** RS 2020: cinco frentes de atração (RI, externo, estágio, trainee, aprendiz), rotatividade 21,36%; PCD por distribuidora: MA 4,95%, PA 5,74%, PI 2,37%, AL 1,94%; call center MA com 335 atendentes [99]. RS 2019: PCD 5,16% (MA) [100]. **Não há RS 2023/2024 publicado** [102].
- **Pares:** Neoenergia 2024: 15.528 empregados, rotatividade 8,1% (homens) e 10,6% (mulheres), Escola de Eletricistas contratou 268 [103]. Enel Brasil 2023: 77% da cota PCD [104]. CPFL 2017: rotatividade 17% [105].
- **PCD (Lei 8.213/91):** 2% (100-200), 3% (201-500), 4% (501-1.000), 5% (1.001+); base = empregados ativos da empresa inteira; aprendizes excluídos; fração arredondada para cima; dispensa de PCD condicionada a substituto [33][108]. Multa 2026: R$ 3.499,80 por vaga [109]. O TST só afasta a multa com prova robusta de esforço [110]. **Aprendiz (Lei 10.097/2000):** 5-15% das funções que exigem formação [112].

## Top 12 KPIs recomendados (ranqueados)

1. Contratações vs. plano (fill rate) por filial/cargo [17][71]
2. TTF mediana bruto e líquido, decomposto O&R → publicação → R&S → admissão [1][7][11]
3. Aging de vagas abertas por faixa (0-15/16-30/31-60/60+) [15][13][44]
4. Pass-through por etapa (coorte) e time-in-stage, por recrutador e gestor [16][8]
5. Turnover 90 d e 1º ano por coorte × fonte × recrutador × gestor [23][24][60]
6. Aceite de oferta + declínio codificado (salário, contraproposta, mobilidade) [13][46][47]
7. No-show de entrevista e de dia 1 [30][31][22]
8. Desistência na documentação/admissão (aceite → eSocial → dia 1) [56][57][58]
9. PCD: ativos ÷ cota, vagas afirmativas e conversão de candidatos PCD [33][110]
10. Fonte de contratação: conversão e retenção por origem [19][76]
11. Carga e produtividade por recrutador [1][13]
12. Quality of hire por cargo [21][13]

## Fontes

1. https://www.shrm.org/content/dam/en/shrm/executive-network/insights/Talent-Access-Report-TOTAL.pdf
2. https://truestephr.com/sources/cost-per-hire · https://x0pa.com/calculators/cost-per-hire/
3. https://www.conference-board.org/pdf_free/Overview-of-ISO-30414-Human-Capita-Reporting-Standards-Conference-Board.pdf
4. https://www.iso.org/news/ref2689.html · https://www.hcmmetrics.co.uk/wp-content/uploads/2020/06/ISO30414-2018-11-Core-Areas.pdf
5. https://www.enterpriseengagement.org/articles/content/8634811/iso-issues-calculations-for-key-human-capital-metrics/
6. https://www.greenhouse.com/resources/glossary/what-is-time-to-fill
7. https://www.shrm.org/topics-tools/research/recruiting-benchmarking
8. https://lp.gem.com/rs/972-IVV-330/images/2025%20Recruiting%20Benchmarks%20-%20Gem.pdf · https://www.gem.com/blog/10-takeaways-from-the-2025-recruiting-benchmarks-report
9. https://www.ashbyhq.com/talent-trends-report/reports/2023-trends-report-offer-acceptance-rates
10. https://www.ashbyhq.com/talent-trends-report/reports/recruiting-operations-benchmarks-talent-trends
11. https://hirebridge.zendesk.com/hc/en-us/articles/360027300071-Updated-Time-To-Fill
12. https://userapps.support.sap.com/sap/support/knowledge/en/2434963
13. https://www.metaview.ai/resources/blog/recruiting-benchmarks
14. https://developers.ashbyhq.com/reference/applicationlisthistory
15. https://docs.oracle.com/en/cloud/saas/taleo-enterprise/22a/obopc/c-recruitingopenreqaging.html
16. https://help.gem.com/external/the-pipeline-analytics-dashboard
17. https://www.aihr.com/blog/recruiting-metrics/
18. https://www.gem.com/blog/key-takeaways-from-the-2026-recruiting-benchmarks-report
19. https://www.ashbyhq.com/talent-trends-report/reports/referrals
20. https://www.shrm.org/about/press-room/shrm-releases-2025-benchmarking-reports--how-does-your-organizat
21. https://www.aihr.com/blog/quality-of-hire/
22. https://boostpoint.com/first-90-days-turnover/
23. https://www.peoplepilot.io/blog/infant-attrition-(first-90-days)-using-survival-analysis-and-logistic-regression
24. https://www.correiobraziliense.com.br/app/noticia/economia/2019/07/08/internas_economia,768973/primeiro-emprego-pesquisa-diz-que-43-nao-passam-do-periodo-de-experi.shtml
25. https://www.qandle.com/glossary-vacancy-rate · https://www.socialtalent.com/glossary/fill-rate
26. https://www.shrm.org/topics-tools/news/talent-acquisition/how-many-open-reqs-house-recruiters · https://www.pin.com/blog/recruiter-capacity-benchmarks/
27. https://www.prnewswire.com/news-releases/new-data-from-ashby-reveals-surge-in-applications-rising-selectivity-and-shifting-recruiter-workloads-302765846.html
28. https://www.starred.com/blog/candidate-nps-benchmarks-what-are-they
29. https://survale.com/candidate-satisfaction-net-promoter-score/
30. https://www.cloudapper.ai/talent-acquisition/how-to-eliminate-interview-no-shows-in-high-volume-hourly-recruiting/
31. https://kpidepot.com/kpi/interview-no-show-rate
32. https://www.cut.org.br/noticias/lei-de-cotas-para-pessoas-com-deficiencia-completa-34-anos-com-avancos-e-desafio-f7c4
33. https://www.pcd.com.br/percentual-e-calculo-da-cota-de-empregados-com-deficiencia-pcd___300.html
34. https://support.greenhouse.io/hc/en-us/articles/11335352504603-HRIS-Link-and-frozen-requisitions
35. https://support.greenhouse.io/hc/en-us/articles/213351483-Close-reasons-for-job-openings
36. https://www.hrdive.com/news/time-to-hire-rates-increasing-significantly-for-almost-all-roles/652449/ · https://joshbersin.com/time-to-hire-benchmark-factbook/
37. https://mitratech.com/resource-hub/blog/what-2025-time-to-fill-benchmarks-reveal-about-hiring-agility-and-risk/
38. https://workinstitute.com/blog/9th-annual-retention-report-is-now-available/
39. https://portalcustomer.com.br/atendimento-ao-cliente-em-numeros-2026
40. https://www.infomoney.com.br/carreira/brasil-e-o-pais-onde-processos-seletivos-sao-os-mais-longos-confira-ranking-completo/
41. https://www.gupy.io/blog/reduzir-o-tempo-de-preenchimento-de-vagas
42. https://paraempresas.catho.com.br/tempo-de-contratacao/
43. https://www.roberthalf.com/br/pt/insights/buscar-recolocacao/depois-da-entrevista-quanto-tempo-devo-esperar-por-uma-resposta-de-um-headhunter
44. https://www.gupy.io/blog/sla-de-vagas
45. https://www.gupy.io/blog/analise-de-dados-no-recrutamento · https://www.gupy.io/blog/indicadores-de-recrutamento-e-selecao
46. https://forbes.com.br/carreira/2022/06/pesquisa-mostra-os-motivos-que-levam-candidatos-a-recusar-ofertas-de-emprego/
47. https://diariodocomercio.com.br/gestao/salarios-abaixo-media-afastam-candidatos-durante-processo-seletivo/
48. https://www.roberthalf.com/br/pt/sobre-robert-half/imprensa/novoemprego26
49. https://solides.com.br/blog/media-de-turnover-aceitavel/
50. https://contec.org.br/novo-caged-brasil-encerra-2025-com-saldo-positivo-de-127-milhao-de-empregos-formais/
51. https://www.dieese.org.br/livro/2017/rotatividade.pdf
52. https://www.roberthalf.com/br/pt/insights/carreira/turnover-em-alta-principais-motivos-e-como-evitar
53. https://www.roberthalf.com/br/pt/sobre-robert-half/imprensa/39-dos-desligamentos-entre-qualificados-foram-pedido-do-colaborador
54. https://agenciagov.ebc.com.br/noticias/202501/em-2024-nordeste-foi-gerou-19-5-dos-empregos-do-pais
55. https://athosgls.com.br/diversidade-e-inclusao-no-mercado-de-trabalho-relatorio-da-gupy-aponta-avancos-desafios-e-acoes/ · https://exame.com/esg/em-meio-a-adeus-global-para-a-diversidade-vagas-afirmativas-cresceram-37-no-brasil-em-2024/
56. https://www.trt4.jus.br/portais/escola/modulos/noticias/415842
57. https://www.soc.com.br/blog-de-sst/prazo-para-admissao-apos-exame-admissional-esocial/
58. https://blog.lugarh.com.br/admissao-esocial-saiba-quais-sao-os-prazos/
59. https://aprendo.iob.com.br/ajudaonline/artigo.aspx?artigo=9425
60. https://blog.convenia.com.br/demissao-no-contrato-de-experiencia/
61. https://www.aihr.com/blog/recruitment-dashboard/
62. https://cadient.ai/article/recruitment-analytics-dashboard-essential-metrics-and-reporting-frameworks
63. https://www.manatal.com/blog/recruitment-dashboard
64. https://support.greenhouse.io/hc/en-us/articles/360034704071-Essential-reports-overview
65. https://support.greenhouse.io/hc/en-us/articles/204636795-Pipeline-history-and-pass-through-rates-report
66. https://lp.gem.com/rs/972-IVV-330/images/Talent%20Leader%E2%80%99s%20Guide%20to%20Reporting.pdf
67. https://help.lever.co/hc/en-us/articles/20087349143581-Visual-Insights-Pipeline-dashboard
68. https://lever-old.zendesk.com/hc/en-us/articles/4416495829389-Visual-Insights-Recruiter-Operations-dashboard
69. https://indzara.com/recruitment-tracker-free-recruitment-template-in-power-bi/
70. https://www.boldbi.com/dashboard-examples/hr/hr-recruitment-dashboard/
71. https://www.headcount365.com/blog/guide-to-weekly-exec-meeting
72. https://www.range.co/templates/hiring-pipeline-meeting-agenda
73. https://harver.com/resources/white-paper/weekly-recruiting-scorecard-template/
74. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8507922/
75. https://www.linkedin.com/business/talent/blog/learning-and-development/takeaways-from-global-talent-trends-report
76. https://www.dover.com/blog/cost-of-hiring-agency-vs-in-house-vs-embedded-recruiting
77. https://www.getdianahr.com/blog/hr-metrics-why-job-offers-rejected
78. https://www.shrm.org/topics-tools/news/talent-acquisition/how-to-prevent-rejected-job-offers
79. https://cadienttalent.com/interview-scheduling-software-reduces-no-shows/
80. https://www.ashbyhq.com/talent-trends-report/reports/recruiting-coordination?partner=zinc
81. https://developers.ashbyhq.com/reference/applicationlisthistory
82. https://developers.ashbyhq.com/reference/archivereasonlist
83. https://docs.greenhouse.io/harvest.html
84. https://fivetran.com/docs/transformations/data-models/greenhouse-data-model
85. https://docs.merge.dev/use-cases/candidate-journey/
86. https://datapeople.io/blog/recruiting-analytics-basics/
87. https://support.teamtailor.com/en/articles/3461401-overview-recruitment-reports
88. https://support.greenhouse.io/hc/en-us/articles/115002277586-Common-Greenhouse-definitions
89. https://doc.workday.com/admin-guide/en-us/human-capital-management/recruiting/evergreen-requisitions/san1437780247341.html.html
90. https://eddy.com/hr-encyclopedia/evergreen-requisition/
91. https://www.pin.com/blog/time-to-hire-metrics-ai/
92. https://equatorialservicos.gupy.io/
93. https://a10mais.com/noticias/geral/grupo-equatorial-abre-diversas-oportunidades-de-emprego-para-call-center-de-teresina-30814.html
94. https://empregospiaui.com/noticia/6710/equatorial-abre-24-vagas-para-assistente-comercial-teresina-piaui
95. https://equatorialservicos.gupy.io/jobs/8455808?jobBoardSource=gupy_public_page
96. https://eqseguros.com.br/uploads/Relat%C3%B3rio%20de%20Sustentabilidade%20-%202024%20-%20Grupo%20Equatorial.pdf
97. https://www.equatorialenergia.com.br/trabalhe-conosco/
98. https://www.equatorialenergia.com.br/grupo-equatorial-energia-esta-com-inscricoes-abertas-para-programas-de-trainee-e-novos-talentos-2023/
99. https://api.mziq.com/mzfilemanager/v2/d/62b21cba-838c-49a4-aaef-e0fb2350c169/9b7f018c-c7bb-57d8-ea14-9b74165ef1b3?origin=1
100. https://www.equatorialenergia.com.br/wp-content/uploads/2020/08/Relat%C3%B3rio-de-Sustentabilidade-Grupo-Equatorial-Energia-2019_Portugu%C3%AAs_compressed.pdf
101. https://www.equatorialenergia.com.br/wp-content/themes/equatorial-pai/img/relatorio_2018.pdf
102. https://www.equatorialenergia.com.br/sustentabilidade/download/
103. https://www.neoenergia.com/documents/d/guest/relatorio-integrado-2024
104. https://www.enel.com.br/content/dam/enel-br/quemsomos/relatorios-anuais/2023/Relat%C3%B3rio%20de%20Sustentabilidade%20Enel%20Brasil%202023.pdf
105. https://www.grupocpfl.com.br/sites/default/files/2021-12/relatorio-anual-2017_0.pdf
106. https://ri.energisa.com.br/noticias_cpt/grupo-energisa-destaca-avancos-em-sustentabilidade-inovacao-e-impacto-social-no-relatorio-de-sustentabilidade-2024/
107. https://www.neoenergia.com/web/bahia/w/neoenergia-coelba-possui-vagas-abertas-para-municipios-baianos
108. https://www.gupy.io/blog/cotas-para-deficientes-nas-empresas
109. https://caltrab.com/calculadoras/calculadora-de-multa-por-descumprimento-da-cota-de-pcd/
110. https://www.migalhas.com.br/depeso/450046/pcd-no-art-93-da-lei-8-213-91-jurisprudencia-do-tst
111. https://www2.unicamp.br/estatico-2023/ju/noticias/2022/09/30/mais-de-80-das-empresas-paulistas-descumpriram-cota-para-contratacao-de/
112. https://www.ciadeestagios.com.br/conteudos-para-rh/cota-jovem-aprendiz-perguntas/
113. https://www.hunterdegrandi.com.br/post/processo-seletivo-longo-afasta-talentos-o-que-os-dados-mostram-sobre-o-tempo-de-contrata%C3%A7%C3%A3o

**Lacunas e incertezas:** (i) não existe benchmark público de TTF/conversão para promotor de vendas ou call center no Norte/Nordeste; (ii) a pesquisa Gupy "200+ empresas" e o HM NPS "+73" apareceram apenas em agregadores; (iii) o Grupo Equatorial não publica RS 2023/2024; (iv) o "56%" da Robert Half é percepção de aumento de turnover, não taxa.
