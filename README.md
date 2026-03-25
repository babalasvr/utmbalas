# Ads Dashboard

Dashboard de anúncios em tempo real com webhooks de Cakto, Woovi e Stripe + integração com Meta Ads API.

## Instalação

```bash
npm install
cp .env.example .env
# edite o .env com seus valores
node server.js
```

## Variáveis de ambiente (.env)

| Variável | Descrição |
|---|---|
| `WEBHOOK_SECRET` | Token secreto para validar webhooks (ex: `minha_senha_123`) |
| `META_APP_ID` | ID do App no [Meta for Developers](https://developers.facebook.com) |
| `META_APP_SECRET` | Secret do App Meta |
| `BASE_URL` | URL pública do servidor (ex: `https://seudominio.com`) |
| `PORT` | Porta do servidor (padrão: `3000`) |

## URLs dos Webhooks

Cole essas URLs no painel de cada plataforma (substitua `SEU_TOKEN` pelo valor de `WEBHOOK_SECRET`):

### Cakto
```
https://seudominio.com/webhook/cakto?token=SEU_TOKEN
```
Eventos suportados: `purchase.approved`, `purchase.refunded`, `purchase.pending`

### Woovi
```
https://seudominio.com/webhook/woovi?token=SEU_TOKEN
```
Eventos suportados: `OPENPIX:CHARGE_COMPLETED`

### Stripe
```
https://seudominio.com/webhook/stripe?token=SEU_TOKEN
```
Eventos suportados: `charge.succeeded`, `charge.refunded`

## Conectar Meta Ads

1. Acesse `http://localhost:3000/api/meta/auth`
2. Faça login com sua conta Facebook/Meta
3. Autorize o acesso às campanhas
4. Pronto — o dashboard passará a exibir gastos e métricas de campanha

O sync com a Meta Ads API roda automaticamente a cada 30 minutos.

## Endpoints da API

| Método | Path | Descrição |
|---|---|---|
| `POST` | `/webhook/cakto` | Recebe eventos da Cakto |
| `POST` | `/webhook/woovi` | Recebe pagamentos Pix da Woovi |
| `POST` | `/webhook/stripe` | Recebe eventos do Stripe |
| `GET` | `/api/metrics?period=hoje\|7d\|30d` | Métricas agregadas |
| `GET` | `/api/campaigns?period=hoje\|7d\|30d` | Campanhas com métricas cruzadas |
| `GET` | `/api/meta/auth` | Inicia OAuth do Meta |
| `GET` | `/api/meta/callback` | Callback OAuth do Meta |

## Banco de dados

O arquivo `dashboard.db` (SQLite) é criado automaticamente na primeira execução. Não requer nenhuma configuração adicional.
