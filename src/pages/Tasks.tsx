import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import type { TaskStatus, TaskPriority } from '../types'
import { Plus, LayoutGrid, List, Search } from 'lucide-react'
import { cn } from '../lib/utils'

const statuses: TaskStatus[] = ['BACKLOG', 'READY', 'IN_PROGRESS', 'REVIEW', 'CEO_APPROVAL', 'DONE', 'BLOCKED']

export function Tasks() {
  const { t } = useTranslation()
  const tasks = useAppStore(s => s.tasks)
  const employees = useAppStore(s => s.employees)
  const updateTask = useAppStore(s => s.updateTask)
  const addTask = useAppStore(s => s.addTask)
  const [view, setView] = useState<'kanban' | 'table'>('kanban')
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'BACKLOG' as TaskStatus,
    priority: 'MEDIUM' as TaskPriority,
    assigneeId: '',
    department: 'Operations',
    deadline: '',
  })
  
  const filtered = tasks.filter(task => 
    task.title.toLowerCase().includes(search.toLowerCase()) ||
    task.department.toLowerCase().includes(search.toLowerCase())
  )
  
  const handleCreate = () => {
    if (!form.title.trim()) return
    addTask({
      ...form,
      assigneeId: form.assigneeId || null,
      deadline: form.deadline || null,
      isDemo: false,
    })
    setForm({
      title: '',
      description: '',
      status: 'BACKLOG',
      priority: 'MEDIUM',
      assigneeId: '',
      department: 'Operations',
      deadline: '',
    })
    setShowModal(false)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t('tasks')}</h1>
          <p className="text-slate-500 mt-1">{tasks.length} задач · включая DEMO</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              className="input pl-9 w-48" 
              placeholder={t('search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <button 
              onClick={() => setView('kanban')}
              className={cn("p-2", view === 'kanban' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setView('table')}
              className={cn("p-2", view === 'table' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            {t('addTask')}
          </button>
        </div>
      </div>
      
      {view === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statuses.map(status => {
            const columnTasks = filtered.filter(t => t.status === status)
            return (
              <div key={status} className="flex-shrink-0 w-72">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm font-medium text-slate-700">
                    {status.replace('_', ' ')}
                  </h3>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="space-y-3 min-h-[200px]">
                  {columnTasks.map(task => (
                    <div key={task.id} className="card p-4 card-hover cursor-pointer">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium text-slate-800 line-clamp-2">{task.title}</p>
                        {task.isDemo && (
                          <span className="badge bg-amber-50 text-amber-700 text-[10px] flex-shrink-0">DEMO</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mb-3">{task.department}</p>
                      <div className="flex items-center justify-between">
                        <PriorityDot priority={task.priority} />
                        <select
                          className="text-xs border-0 bg-transparent text-slate-500 focus:ring-0 cursor-pointer"
                          value={task.status}
                          onChange={e => updateTask(task.id, { status: e.target.value as TaskStatus })}
                        >
                          {statuses.map(s => (
                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Priority</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Department</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(task => (
                <tr key={task.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">{task.title}</span>
                      {task.isDemo && <span className="badge bg-amber-50 text-amber-700 text-[10px]">DEMO</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="text-xs border border-slate-200 rounded px-2 py-1"
                      value={task.status}
                      onChange={e => updateTask(task.id, { status: e.target.value as TaskStatus })}
                    >
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3"><PriorityDot priority={task.priority} showLabel /></td>
                  <td className="px-4 py-3 text-slate-600">{task.department}</td>
                  <td className="px-4 py-3 text-slate-600">{task.deadline || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-elevated w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">{t('addTask')}</h2>
            <input
              className="input"
              placeholder={t('taskTitle')}
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              className="input min-h-[80px]"
              placeholder={t('taskDescription')}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                className="input"
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value as TaskPriority })}
              >
                <option value="LOW">{t('low')}</option>
                <option value="MEDIUM">{t('medium')}</option>
                <option value="HIGH">{t('high')}</option>
                <option value="CRITICAL">{t('critical')}</option>
              </select>
              <select
                className="input"
                value={form.assigneeId}
                onChange={e => setForm({ ...form, assigneeId: e.target.value })}
              >
                <option value="">— Assignee —</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.role}</option>
                ))}
              </select>
            </div>
            <input
              type="date"
              className="input"
              value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })}
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="btn-secondary">{t('cancel')}</button>
              <button onClick={handleCreate} className="btn-primary">{t('create')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PriorityDot({ priority, showLabel }: { priority: string, showLabel?: boolean }) {
  const colors: Record<string, string> = {
    LOW: 'bg-slate-300',
    MEDIUM: 'bg-blue-500',
    HIGH: 'bg-amber-500',
    CRITICAL: 'bg-rose-500',
  }
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${colors[priority]}`} />
      {showLabel && <span className="text-xs text-slate-600">{priority}</span>}
    </div>
  )
}
