import { useTranslation } from '../hooks/useTranslation'

export function Labs() {
  const { t } = useTranslation()
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{t('labs')}</h1>
        <p className="text-slate-500 mt-1">NAMT Labs · AI-продукты и SaaS · DEMO</p>
      </div>
      
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-slate-900">NAMT Content AI</h2>
              <span className="badge bg-amber-50 text-amber-700 border border-amber-200">DEMO Product</span>
            </div>
            <p className="text-slate-600 mt-2 max-w-2xl">
              Первый концептуальный продукт Labs. AI-платформа для генерации, планирования и управления контентом 
              для медиа и бизнеса. Поддержка RU/EN, интеграция с каналами, сценарии видео и постов.
            </p>
          </div>
          <span className="badge bg-blue-50 text-blue-700">MVP Planning</span>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-slate-50">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Status</p>
            <p className="font-semibold text-slate-900 mt-1">Specification → MVP</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Version</p>
            <p className="font-semibold text-slate-900 mt-1">0.1 (concept)</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Owner</p>
            <p className="font-semibold text-slate-900 mt-1">AI CTO + AI PM</p>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="font-medium text-slate-900 mb-3">Roadmap (high-level)</h3>
          <div className="space-y-2">
            {['Product specification', 'Core content generation engine', 'RU/EN pipelines', 'Calendar & scheduling', 'Public MVP launch'].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  i < 2 ? 'bg-namt-100 text-namt-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {i + 1}
                </div>
                <span className={i < 2 ? 'text-slate-800' : 'text-slate-500'}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="card p-5">
        <h3 className="font-semibold text-slate-900 mb-2">Ideas pipeline</h3>
        <p className="text-sm text-slate-500">Новые продуктовые идеи будут появляться здесь. Пока пусто — место для будущего роста Labs.</p>
      </div>
    </div>
  )
}
