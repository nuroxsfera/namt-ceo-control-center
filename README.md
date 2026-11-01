# NAMT CEO Control Center

## Telegram autopilot (platform connect)

### One-time Vercel setup
1. Deploy from GitHub `main`
2. Create free [Upstash Redis](https://upstash.com) → copy REST URL + TOKEN into Vercel env:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
3. Add AI key (required for writing posts):
   - `OPENAI_API_KEY` or `XAI_API_KEY`
4. Optional covers: `ENABLE_IMAGE_GEN=true` (needs OpenAI)
5. Redeploy

### Connect channel in the app
Media → **Каналы**:
1. @BotFather → create bot → token
2. Create channel → add bot as admin (Post messages)
3. Paste token + `@channel` → **Подключить канал**

Token is stored **only on the server** (Upstash), never in GitHub/localStorage.

### Autopilot
- Toggle **Автопилот** in AI Media Manager (default ON)
- Cron publishes ~07:00 / 12:00 / 16:00 UTC
- Or press **Выложить пост сейчас**
- **No CEO approval queue** — agent publishes itself

### Telegram limits
Custom fonts are **not supported** by Telegram Bot API. Formatting = HTML structure, bold/italic, spacing, emoji, optional cover image.
