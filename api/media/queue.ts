import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getQueue, hasServerStore } from '../_lib/store'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const items = await getQueue()
  return res.status(200).json({
    items,
    serverStore: hasServerStore(),
  })
}
