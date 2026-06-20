const AUTH_KEY = 'parhad_admin_auth'
const ADMIN_PASSWORD = 'parhad2025'

export function isAuthenticated(): boolean {
  return localStorage.getItem(AUTH_KEY) === 'true'
}

export function login(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    localStorage.setItem(AUTH_KEY, 'true')
    return true
  }
  return false
}

export function logout() {
  localStorage.removeItem(AUTH_KEY)
}
