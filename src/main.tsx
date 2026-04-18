import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import AdminLayout from './admin/AdminLayout.tsx'
import Login from './admin/pages/Login.tsx'
import Dashboard from './admin/pages/Dashboard.tsx'
import Posts from './admin/pages/Posts.tsx'
import PostEdit from './admin/pages/PostEdit.tsx'
import SitePages from './admin/pages/SitePages.tsx'
import PageEdit from './admin/pages/PageEdit.tsx'
import Media from './admin/pages/Media.tsx'
import Events from './admin/pages/Events.tsx'
import Bulletins from './admin/pages/Bulletins.tsx'
import ContentCards from './admin/pages/Pages.tsx'
import Navigation from './admin/pages/Navigation.tsx'
import Comments from './admin/pages/Comments.tsx'
import Users from './admin/pages/Users.tsx'
import Settings from './admin/pages/Settings.tsx'
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
        <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          {/* Yazılar */}
          <Route path="posts" element={<Posts />} />
          <Route path="posts/:id" element={<PostEdit />} />
          {/* Sayfalar */}
          <Route path="site-pages" element={<SitePages />} />
          <Route path="site-pages/:id" element={<PageEdit />} />
          {/* Medya */}
          <Route path="media" element={<Media />} />
          {/* Etkinlik & Bülten */}
          <Route path="events" element={<Events />} />
          <Route path="bulletins" element={<Bulletins />} />
          <Route path="content-cards" element={<ContentCards />} />
          {/* Yönetim */}
          <Route path="navigation" element={<Navigation />} />
          <Route path="comments" element={<Comments />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
