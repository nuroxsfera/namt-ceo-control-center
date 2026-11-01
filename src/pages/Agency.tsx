import { useTranslation } from '../hooks/useTranslation'

const services = [
  { name: 'AI Automation', price: 'from 250 000 ₽', status: 'Active' },
  { name: 'AI Chatbots', price: 'from 180 000 ₽', status: 'Active' },
  { name: 'AI Assistants', price: 'from 320 000 ₽', status: 'Active' },
  { name: 'AI Content Creation', price: 'from 150 000 ₽', status: 'Active' },
  { name: 'Business Process Automation', price: 'from 400 000 ₽', status: 'Active' },
  { name: 'AI Consulting', price: 'from 120 000 ₽', status: 'Active' },
]

const demoProjects = [
  { name: 'TechNova — AI Automation', client: 'TechNova Group', status: 'In Progress', revenue: '850 000 ₽' },
  { name: 'Nordic AI Labs — Chatbots', client: 'Nordic AI Labs', status: 'Negotiation', revenue: '—' },
  { name: 'Horizon Media — Content AI', client: 'Horizon Media', status: 'Proposal', revenue: '—' },
]

export function Agency() {
  const { t } = useTranslation()
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{t('agency')}</h1>
        <p className="text-slate-500 mt-1">NAMT Agency · Управление услугами и проектами · DEMO</p>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {services.map(s => (
            <div key={s.name} className="card p-5 card-hover">
              <h3 className="font-semibold text-slate-900">{s.name}</h3>
              <p className="text-namt-600 font-medium mt-2">{s.price}</p>
              <span className="badge bg-emerald-50 text-emerald-700 mt-3">{s.status}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Demo Projects</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Project</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Client</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {demoProjects.map(p => (
                <tr key={p.name} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{p.name} <span className="badge bg-amber-50 text-amber-700 text-[10px] ml-2">DEMO</span></td>
                  <td className="px-4 py-3 text-slate-600">{p.client}</td>
                  <td className="px-4 py-3"><span className="badge bg-blue-50 text-blue-700">{p.status}</span></td>
                  <td className="px-4 py-3 text-right">{p.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
