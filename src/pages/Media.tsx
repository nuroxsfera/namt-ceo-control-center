import { useTranslation } from '../hooks/useTranslation'

const platforms = ['YouTube', 'TikTok', 'Instagram', 'Telegram', 'VK']

const contentItems = [
  { title: 'AI Trends 2026 — Deep Dive', platform: 'YouTube', lang: 'EN', status: 'Scheduled', date: '2026-11-05' },
  { title: 'Как мы строим AI-холдинг', platform: 'Telegram', lang: 'RU', status: 'Published', date: '2026-10-28' },
  { title: 'Behind the scenes: NAMT Labs', platform: 'Instagram', lang: 'EN', status: 'Draft', date: '2026-11-02' },
  { title: 'Короткий разбор AI-агентов', platform: 'TikTok', lang: 'RU', status: 'In Review', date: '2026-11-01' },
  { title: 'Weekly AI Digest #12', platform: 'VK', lang: 'RU', status: 'Idea', date: '—' },
]

export function Media() {
  const { t } = useTranslation()
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{t('media')}</h1>
        <p className="text-slate-500 mt-1">NAMT Media · Контент и каналы · DEMO (без реальных подключений)</p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {platforms.map(p => (
          <div key={p} className="card px-4 py-2 text-sm font-medium text-slate-700">
            {p}
          </div>
        ))}
      </div>
      
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 font-medium text-slate-900">Content Calendar / Pipeline</div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Title</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Platform</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Lang</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {contentItems.map((item, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{item.title} <span className="badge bg-amber-50 text-amber-700 text-[10px] ml-1">DEMO</span></td>
                <td className="px-4 py-3">{item.platform}</td>
                <td className="px-4 py-3">{item.lang}</td>
                <td className="px-4 py-3"><span className="badge bg-slate-100 text-slate-700">{item.status}</span></td>
                <td className="px-4 py-3 text-slate-500">{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
