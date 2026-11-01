# NAMT CEO Control Center

Corporate control plane for NAMT Group (React + Vite SPA) with **real Telegram publishing** via Vercel serverless API.

## Telegram autonomous launch (one channel)

### 1. Deploy
Connect the GitHub repo to Vercel and deploy `main`.

### 2. Create bot & channel (CEO)
1. Telegram → **@BotFather** → `/newbot` → save token  
2. Create channel **NAMT AI**  
3. Add the bot as **administrator** with **Post messages**  
4. Note channel `@username` or numeric id  

### 3. Vercel env (required)
| Variable | Purpose |
|----------|---------|
| `TELEGRAM_BOT_TOKEN` | BotFather token |
| `TELEGRAM_CHANNEL_ID` | `@channel` or `-100…` |

Optional:
| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` or `XAI_API_KEY` | AI draft generation |
| `ENABLE_IMAGE_GEN=true` | DALL·E covers (needs OpenAI) |
| `UPSTASH_REDIS_REST_URL` + `TOKEN` | Scheduled posts + daily cron queue |
| `CRON_SECRET` | Protect cron routes |

Redeploy after setting env.

### 4. Publish first post today
1. Open **Media → Channels** → confirm connection (green)  
2. **AI Media Manager** → Generate draft (if AI key) **or** Manual draft  
3. **Approval Queue** → review text/image/sources  
4. **Approve & Publish** → message appears in Telegram  

Nothing is published without CEO approval.

### API routes
- `GET /api/telegram/status`
- `POST /api/telegram/publish`
- `POST /api/media/generate`
- `GET/POST /api/media/queue`
- `GET /api/cron/publish-scheduled` (every 15 min)
- `GET /api/cron/daily-media` (06:00 UTC)

### Local UI
```bash
npm install
npm run dev
```
API routes require Vercel (or `vercel dev`) for Telegram calls.
