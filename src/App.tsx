import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import AppLayout from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import WritingProfile from '@/pages/WritingProfile'
import ContentGeneration from '@/pages/ContentGeneration'
import Calendar from '@/pages/Calendar'
import Analytics from '@/pages/Analytics'
import InspirationSources from '@/pages/InspirationSources'
import Settings from '@/pages/Settings'
import Team from '@/pages/Team'
import Billing from '@/pages/Billing'
import ScrapeTest from '@/pages/ScrapeTest'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/" element={<AppLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="writing-profile" element={<WritingProfile />} />
            <Route path="generate" element={<ContentGeneration />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="inspiration" element={<InspirationSources />} />
            <Route path="team" element={<Team />} />
            <Route path="settings" element={<Settings />} />
            <Route path="billing" element={<Billing />} />
            <Route path="scrape-test" element={<ScrapeTest />} />
          </Route>
        </Routes>
        <Toaster />
      </div>
    </Router>
  )
}

export default App