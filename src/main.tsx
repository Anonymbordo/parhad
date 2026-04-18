import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import AdminLayout from './admin/AdminLayout.tsx'
import Login from './admin/pages/Login.tsx'
import Dashboard from './admin/pages/Dashboard.tsx'
import Events from './admin/pages/Events.tsx'
import Bulletins from './admin/pages/Bulletins.tsx'
import Pages from './admin/pages/Pages.tsx'
import Navigation from './admin/pages/Navigation.tsx'
import { isAuthenticated } from './admin/useAuth.ts'

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin"
          element={<RequireAuth><AdminLayout /></RequireAuth>}
        >
          <Route index element={<Dashboard />} />
          <Route path="events" element={<Events />} />
          <Route path="bulletins" element={<Bulletins />} />
          <Route path="pages" element={<Pages />} />
          <Route path="navigation" element={<Navigation />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
