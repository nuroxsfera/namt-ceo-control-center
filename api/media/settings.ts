import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSettings, saveSettings } from '../_lib/credentials'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const settings = await getSettings()
    return res.status(200).json({ settings })
  }
  if (req.method === 'POST') {
    const settings = await saveSettings(req.body || {})
    return res.status(200).json({ settings })
  }
  return res.status(405).json({ error: 'Method not allowed' })
}
