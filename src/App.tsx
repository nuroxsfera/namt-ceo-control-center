import { Routes, Route } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { Dashboard } from './pages/Dashboard'
import { AIEmployees } from './pages/AIEmployees'
import { Tasks } from './pages/Tasks'
import { Finance } from './pages/Finance'
import { Clients } from './pages/Clients'
import { Agency } from './pages/Agency'
import { Media } from './pages/Media'
import { Labs } from './pages/Labs'
import { Reports } from './pages/Reports'
import { CEODecisions } from './pages/CEODecisions'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ai-employees" element={<AIEmployees />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/agency" element={<Agency />} />
        <Route path="/media" element={<Media />} />
        <Route path="/labs" element={<Labs />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/ceo-decisions" element={<CEODecisions />} />
      </Route>
    </Routes>
  )
}

export default App
