import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import type { Task, TaskStatus, TaskPriority } from '../types'
import { statusLabel } from '../i18n/translations'
import { Plus, LayoutGrid, List, Search, Pencil, Trash2 } from 'lucide-react'
import { cn } from '../lib/utils'

const statuses: TaskStatus[] = ['BACKLOG', 'READY', 'IN_PROGRESS', 'REVIEW', 'CEO_APPROVAL', 'DONE', 'BLOCKED']

const emptyForm = {
  title: '',
  description: '',
  status: 'BACKLOG' as TaskStatus,
  priority: 'MEDIUM' as TaskPriority,
  assigneeId: '',
  department: 'Operations',
  deadline: '',
}

export function Tasks() {
  const { t, language } = useTranslation()
  const tasks = useAppStore(s => s.tasks)
  const employees = useAppStore(s => s.employees)
  const updateTask = useAppStore(s => s.updateTask)
  const addTask = useAppStore(s => s.addTask)
  const deleteTask = useAppStore(s => s.deleteTask)
  const [view, setView] = useState<'kanban' | 'table'>('kanban')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyForm)

  const filtered = tasks.filter(task =>
    task.title.toLowerCase().includes(search.toLowerCase()) ||
    task.department.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (task: Task) => {
    setEditingId(task.id)
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId || '',
      department: task.department,
      deadline: task.deadline || '',
    })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.title.trim()) return
    if (editingId) {
      updateTask(editingId, {
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        assigneeId: form.assigneeId || null,
        department: form.department,
        deadline: form.deadline || null,
      })
    } else {
      addTask({
        ...form,
        assigneeId: form.assigneeId || null,
        deadline: form.deadline || null,
        isDemo: false,
      })
    }
    setShowModal(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirmDelete'))) deleteTask(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t('tasks')}</h1>
          <p className="text-slate-500 mt-1">{tasks.length} · {t('includingDemo')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="input pl-9 w-full sm:w-48"
              placeholder={t('search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              onClick={() => setView('kanban')}
              className={cn('p-2', view === 'kanban' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('table')}
              className={cn('p-2', view === 'table' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4" />
            {t('addTask')}
          </button>
        </div>
      </div>

      {view === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {statuses.map(status => {
            const columnTasks = filtered.filter(t => t.status === status)
            return (
              <div key={status} className="flex-shrink-0 w-[280px] sm:w-72">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm font-medium text-slate-700">{statusLabel(status, language)}</h3>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{columnTasks.length}</span>
                </div>
                <div className="space-y-3 min-h-[120px]">
                  {columnTasks.map(task => (
                    <div key={task.id} className="card p-4 card-hover">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium text-slate-800 line-clamp-2">{task.title}</p>
                        {task.isDemo && (
                          <span className="badge bg-amber-50 text-amber-700 text-[10px] flex-shrink-0">{t('demo')}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mb-3">{task.department}</p>
                      <div className="flex items-center justify-between gap-2">
                        <PriorityDot priority={task.priority} />
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(task)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500" title={t('edit')}>
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(task.id)} className="p-1.5 rounded hover:bg-rose-50 text-slate-500 hover:text-rose-600" title={t('delete')}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <select
                            className="text-xs border-0 bg-transparent text-slate-500 max-w-[100px]"
                            value={task.status}
                            onChange={e => updateTask(task.id, { status: e.target.value as TaskStatus })}
                          >
                            {statuses.map(s => (
                              <option key={s} value={s}>{statusLabel(s, language)}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">{t('title')}</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">{t('status')}</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">{t('priority')}</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">{t('department')}</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">{t('deadline')}</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(task => (
                <tr key={task.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">{task.title}</span>
                      {task.isDemo && <span className="badge bg-amber-50 text-amber-700 text-[10px]">{t('demo')}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="text-xs border border-slate-200 rounded px-2 py-1"
                      value={task.status}
                      onChange={e => updateTask(task.id, { status: e.target.value as TaskStatus })}
                    >
                      {statuses.map(s => <option key={s} value={s}>{statusLabel(s, language)}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3"><PriorityDot priority={task.priority} showLabel language={language} /></td>
                  <td className="px-4 py-3 text-slate-600">{task.department}</td>
                  <td className="px-4 py-3 text-slate-600">{task.deadline || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(task)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500 inline-flex">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(task.id)} className="p-1.5 rounded hover:bg-rose-50 text-slate-500 hover:text-rose-600 inline-flex">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40">
          <div className="bg-white rounded-t-xl sm:rounded-xl shadow-elevated w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold">{editingId ? t('editTask') : t('addTask')}</h2>
            <input className="input" placeholder={t('taskTitle')} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <textarea className="input min-h-[80px]" placeholder={t('taskDescription')} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as TaskPriority })}>
                <option value="LOW">{t('low')}</option>
                <option value="MEDIUM">{t('medium')}</option>
                <option value="HIGH">{t('high')}</option>
                <option value="CRITICAL">{t('critical')}</option>
              </select>
              <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as TaskStatus })}>
                {statuses.map(s => <option key={s} value={s}>{statusLabel(s, language)}</option>)}
              </select>
            </div>
            <select className="input" value={form.assigneeId} onChange={e => setForm({ ...form, assigneeId: e.target.value })}>
              <option value="">— {t('assignee')} —</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.role}</option>)}
            </select>
            <input className="input" placeholder={t('department')} value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
            <input type="date" className="input" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="btn-secondary">{t('cancel')}</button>
              <button onClick={handleSave} className="btn-primary">{t('save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PriorityDot({ priority, showLabel, language }: { priority: string; showLabel?: boolean; language?: 'ru' | 'en' }) {
  const colors: Record<string, string> = {
    LOW: 'bg-slate-300',
    MEDIUM: 'bg-blue-500',
    HIGH: 'bg-amber-500',
    CRITICAL: 'bg-rose-500',
  }
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${colors[priority]}`} />
      {showLabel && <span className="text-xs text-slate-600">{language ? statusLabel(priority, language) : priority}</span>}
    </div>
  )
}
