import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getQueue, saveQueue, hasServerStore, type ProductionItem } from '../_lib/store'
import { assertMediaWriteAuth } from '../_lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const items = await getQueue()
    return res.status(200).json({
      items,
      serverStore: hasServerStore(),
      note: hasServerStore()
        ? undefined
        : 'UPSTASH not configured — server queue empty; use client store + publish now',
    })
  }

  if (req.method === 'POST') {
    const auth = assertMediaWriteAuth(req as unknown as Request)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    if (!hasServerStore()) {
      return res.status(503).json({ error: 'Server store not configured (Upstash Redis)' })
    }

    const action = req.body?.action
    const id = req.body?.id ? String(req.body.id) : ''
    const items = await getQueue()

    if (action === 'upsert' && req.body?.item) {
      const item = req.body.item as ProductionItem
      const idx = items.findIndex((x) => x.id === item.id)
      if (idx >= 0) items[idx] = item
      else items.unshift(item)
      await saveQueue(items)
      return res.status(200).json({ ok: true, items })
    }

    if (action === 'status' && id) {
      const status = String(req.body.status || '')
      const idx = items.findIndex((x) => x.id === id)
      if (idx < 0) return res.status(404).json({ error: 'not found' })
      items[idx] = { ...items[idx], status: status as ProductionItem['status'] }
      await saveQueue(items)
      return res.status(200).json({ ok: true, item: items[idx] })
    }

    return res.status(400).json({ error: 'Unknown action' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
