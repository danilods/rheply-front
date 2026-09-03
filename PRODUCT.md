# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

O usuário primário é a **analista de Recrutamento e Seleção da Equatorial Serviços**, que
assessora a gerência e a superintendência do braço de serviços comerciais do Grupo
Equatorial Energia. Ela mantém a base, prepara a leitura semanal e apresenta.

O público que decide é a **gerência**, que revisa a leitura e cobra prazos: quem está
atrasado, o que travou, quem responde por quê. A superintendência aparece em pautas
específicas.

A operação é distribuída: call center em Teresina, Imperatriz e Porto Alegre; varejo e
promotores em Belém, São Luís, Macapá, Maceió. Cinco recrutadores, vinte e nove gestores
de vaga, quatorze filiais.

## Product Purpose

O Rheply substitui a planilha híbrida de acompanhamento de R&S por um sistema que recebe
as exportações da Gupy, captura o funil que acontece fora dela e projeta a leitura da
reunião semanal.

Sucesso é a analista chegar na sexta-feira sem ter montado nada à mão, e a gerência sair
da reunião com prazo combinado sobre o que travou.

## Positioning

O funil real não acontece na Gupy. Cruzando a data de inscrição com a data de aceite da
carta oferta, 71% dos atendentes contratados em 2026 só foram inscritos na Gupy no dia do
aceite; o candidato é abordado por WhatsApp, indicação, presencial ou pelo pré-cadastro do
próprio Rheply, e só entra na plataforma para gerar a admissão.

Nenhum relatório da Gupy mostra esse funil, porque ele acontece fora dela. O Rheply captura
o processo onde ele existe e devolve a leitura que a gerência cobra.

## Operating Context

**O ritual.** FUP semanal. A rotina de alimentação da base é toda sexta até as 12:00. A
pauta tem doze itens recorrentes, entre eles turnover no primeiro ano, perfil de sucesso,
recrutamento interno e cota PCD.

**A cena de leitura, e é ela que manda no desenho.** O painel é **projetado numa sala com
a luz acesa**, lido a dois ou três metros por várias pessoas ao mesmo tempo. Isso é um
fato do produto, não uma preferência: projetor lava preto, e luz ambiente destrói contraste
em fundo escuro. Fundo claro, tipos grandes e pouca informação por tela não são escolhas
de gosto aqui, são requisitos de legibilidade.

**A conversa é de cobrança.** A gerência não navega: ela pergunta o que atrasou, de quem é,
e até quando. O painel precisa responder essas três perguntas antes de qualquer outra.

**As fontes.** Exportações da Gupy (vagas, contratados), uma base histórica e um funil
consolidado alimentado à mão a partir de fichas de entrevista.

## Capabilities and Constraints

Seis telas: visão executiva, vagas em aberto, contratações, funil de seleção, histórico e
importação. Importação de planilha com prévia, diff e desfazer. Filtros compartilhados
entre as telas.

**Volume real:** 48 vagas em aberto, 98 posições a preencher, 492 contratações em 2026,
346 candidatos no funil, 335 vagas no histórico desde março de 2024.

**Vocabulário da casa**, que o produto não traduz: FUP, O&R (a área que aprova a
requisição), R&S, vaga congelada, posição, carta oferta, requisição, filial, praça,
aumento de quadro, substituição.

**Medida:** mediana e percentil 90, nunca só média. A cauda de vagas antigas distorce
qualquer média. O tempo bruto é o número oficial e comparável; o tempo líquido de
congelamento entra como contexto.

**Restrição técnica:** Next.js 14 App Router, TypeScript estrito, Tailwind, shadcn/ui.
Backend FastAPI separado. Gráficos em SVG próprio, sem biblioteca de chart, para manter
controle sobre a espessura das marcas e as folgas.

## Brand Commitments

O Rheply tem marca própria e nenhum compromisso com a identidade visual da Equatorial. O
verde-azulado atual não é vinculante e pode ser substituído.

## Evidence on Hand

Dados reais carregados, sem nenhum dado pessoal de candidato: nome, CPF, e-mail, telefone,
endereço e data de nascimento são descartados na importação, e a idade aparece apenas em
faixa.

Achados verificados que o painel precisa carregar: 43% dos candidatos abordados não
comparecem ou somem, com Belém em 59% contra Teresina em 11%; 31 das 48 vagas em aberto
estão congeladas; 75% das contratações são no piso salarial; uma recrutadora responde por
57% das contratações; um gestor concentra 45 dos 46 candidatos parados aguardando decisão.

Referências de mercado usadas como régua: SHRM, Gem, Ashby e Gupy, com fonte registrada em
`docs/superpowers/research/`.

Não existem ainda: base de desligamentos, headcount por filial para medir a cota PCD, e
custos para calcular custo por contratação. Nada disso pode ser inventado.

## Product Principles

1. **Número sem contexto não vira decisão.** Todo valor exibido carrega a comparação, a
   referência de mercado ou o delta que o torna acionável.
2. **A cena de leitura manda.** Projetado, em sala clara, a três metros. O que não é
   legível nessa condição não existe.
3. **A cobrança é o enredo.** O que atrasou, de quem é, até quando. Nessa ordem.
4. **O dado incompleto é declarado, nunca escondido.** Um gráfico bonito sobre um campo
   preenchido pela metade parece um fato e não é.
5. **Mediana, não média.** E o método fica visível para quem quiser auditar.

## Accessibility & Inclusion

Contraste calibrado para projeção com luz ambiente, que é mais exigente que a norma de
tela: texto de corpo bem acima do mínimo WCAG AA.

Cor nunca carrega significado sozinha: todo estado tem forma e texto junto. A paleta de
séries é validada para as três formas de daltonismo.

Todo gráfico tem tabela equivalente, para que nenhum valor dependa de passar o mouse.
