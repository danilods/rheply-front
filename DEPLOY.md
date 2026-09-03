# Subir o módulo Atração & Seleção

Este documento cobre só o que **este trabalho** acrescentou. O deploy geral já
existia e continua valendo: `easy-rh/deploy/scp-deploy.sh` faz rsync, roda
`alembic upgrade head`, sobe o `docker compose` e mostra o estado.

---

## 1. Backend — `easy-rh`, via SSH/SCP

O script existente já contempla o que foi feito aqui. **Antes de rodar**, três
coisas precisam estar certas no servidor.

### 1.1 A migração nova

`api/alembic/versions/009_rs_links_publicos.py` cria a tabela dos links de
leitura pública. Ela entra sozinha no `alembic upgrade head` que o script já
executa. Sobe e desce limpa (verificado nos dois sentidos).

Se o servidor estiver numa revisão anterior a 008, confira antes:

```bash
ssh root@45.55.56.231 "cd /opt/rheply && docker compose exec -T api alembic current"
```

### 1.2 CORS precisa conhecer o domínio da Vercel

Em `/opt/rheply/deploy/.env.api`, `CORS_ORIGINS` é **lista JSON**, não CSV — o
pydantic-settings rejeita CSV e a API não sobe:

```
CORS_ORIGINS=["https://SEU-APP.vercel.app","https://painel.suaempresa.com.br"]
```

Isso só importa se o front chamar a API direto do navegador. Se `NEXT_PUBLIC_API_URL`
ficar vazio na Vercel, o Next faz o proxy por `/api/v1/*` (ver `next.config.mjs`)
e o navegador nunca fala com o backend — CORS deixa de existir como problema.
**É o caminho mais simples e o recomendado.**

### 1.3 Segredos

`deploy/.env` e `deploy/.env.api` guardam `SECRET_KEY` e `JWT_SECRET_KEY`.
A pasta `deploy/` está fora do versionamento, e o `.gitignore` foi ajustado
neste trabalho para cobrir `deploy/.env.*` — antes a regra `.env` **não**
pegava `.env.api`, e um `git add deploy/` teria publicado as duas chaves.

### 1.4 Rodar

```bash
cd ~/Documents/Projetos/easy-rh/deploy
./scp-deploy.sh          # rsync → migrations → docker compose up -d --build
```

---

## 2. Frontend — `rheply-front`, na Vercel

### 2.1 Variáveis de ambiente

| Variável | Valor | Por quê |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | *(vazio)* | Deixe em branco para o Next fazer proxy por `/api/v1/*` e dispensar CORS. Preencha com a URL absoluta da API só se quiser chamada direta do navegador — e aí o item 1.2 vira obrigatório. |

### 2.2 Deploy

O projeto é Next.js padrão e a Vercel reconhece sozinha. `vercel.json` já traz
`framework: nextjs` e os cabeçalhos de segurança.

```bash
git push origin main      # a Vercel constrói e publica a partir da main
```

Build verificado localmente: `npx next build` → **Compiled successfully**, sem erro.

### 2.3 O que este trabalho acrescentou ao build

- `/painel/[token]` — a rota pública, renderizada sob demanda.
- Em `vercel.json`, cabeçalhos só para `/painel/*`:
  `X-Robots-Tag: noindex, nofollow, noarchive`, `Referrer-Policy: no-referrer`
  e `Cache-Control: private, no-store`. O token vive no caminho da URL; sem
  `no-referrer` ele vazaria no cabeçalho `Referer` de qualquer link de saída.
- O middleware libera `/painel/*` do guarda de sessão — quem abre o link não
  tem conta, e passar pelo guarda faria o link só funcionar para quem já
  estivesse logado.

---

## 3. Depois de subir, conferir nesta ordem

```bash
# 1. a API responde
curl -s -o /dev/null -w "%{http_code}\n" https://API/api/v1/auth/me       # 401 esperado

# 2. a migração entrou
ssh root@45.55.56.231 "cd /opt/rheply && docker compose exec -T api alembic current"   # 009

# 3. sessão renova em vez de cair
#    Entre no painel, espere passar de 30 min, atualize a página.
#    Tem de continuar dentro. Se cair para o login, o refresh não está indo.

# 4. o link público
#    Aba "Importar e conferir" → Links de leitura → Gerar link.
#    Abra numa janela anônima: tem de mostrar o painel sem pedir login.
#    Revogue e recarregue: tem de mostrar "Link expirado ou revogado".
```

---

## 4. Sobre os links públicos

São **credencial portadora**: quem tem a URL tem o acesso, sem senha.

- O token não fica no banco — só o SHA-256 dele. Um vazamento do banco entrega
  hashes, não links que funcionam.
- Todo link nasce com prazo (padrão 7 dias, teto 90) e pode ser revogado na hora.
- A listagem mostra aberturas e último acesso, para responder "alguém ainda usa
  isto?" antes de revogar.
- Vencido, revogado e inexistente devolvem o mesmo 404, sem distinção: dizer
  qual dos três foi entrega ao portador a informação de que o token já valeu.

**A página pública mostra nomes de recrutadoras e gestores**, por decisão do
produto. É dado pessoal de funcionário circulando fora do perímetro autenticado.
Vale combinar com quem recebe que o link não deve ser repassado, e revogar
quando a pessoa deixar de precisar.

---

## 5. Dívida de segurança conhecida

Duas coisas foram corrigidas depois do primeiro deploy, e uma continua aberta
por ser estrutural.

### Corrigido

- **Cookie de sessão sem `Secure`.** Agora leva `Secure` em qualquer origem que
  não seja `localhost`. Sem ele, o cookie viajava em claro no primeiro salto
  HTTP, antes de qualquer redirecionamento para HTTPS.
- **Token do link público na query string.** Ia como `?token=…`, o que o
  gravava no log de acesso do nginx e em qualquer proxy do caminho. Agora vai
  no cabeçalho `X-Painel-Token`. A query segue aceita e marcada como obsoleta,
  para não quebrar link já distribuído — **remova esse fallback** quando os
  links da primeira leva tiverem expirado.

### Aberto: token de sessão em `localStorage`

O access token e o refresh token são persistidos em `localStorage`. Qualquer
XSS na aplicação lê os dois, e o refresh vale sete dias — antes deste trabalho
a exposição era de trinta minutos, então a correção da sessão aumentou o que
está em jogo.

A correção certa é o backend emitir os dois como cookie `HttpOnly` + `Secure` +
`SameSite=Strict`, que o JavaScript não consegue ler. Isso muda o contrato de
autenticação inteiro — todo o `apiClient`, o middleware e o `authStore` —, e é
trabalho de uma sessão dedicada, não de um remendo.

Enquanto não for feito, o que reduz o risco é o de sempre: não injetar HTML de
terceiros nas telas autenticadas e manter as dependências de front atualizadas.
