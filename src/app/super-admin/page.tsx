'use client'

import { useEffect, useState } from 'react'
import { Scissors, Plus, LogOut, Eye, Trash2, RefreshCw, Settings } from 'lucide-react'

interface Shop {
  id: string
  name: string
  slug: string
  whatsappNumber: string
  isActive: boolean
  createdAt: string
  owner: { id: string; name: string; email: string }
  _count: { services: number; appointments: number }
}

interface User {
  id: string
  name: string
  email: string
  role: string
  shopId?: string | null
}

export default function SuperAdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // Create shop form
  const [showCreate, setShowCreate] = useState(false)
  const [newShop, setNewShop] = useState({
    name: '', slug: '', whatsappNumber: '', description: '',
    ownerName: '', ownerEmail: '', ownerPassword: '',
    openingTime: '9:00 AM', closingTime: '7:00 PM',
  })
  const [creating, setCreating] = useState(false)

  // Check auth on load
  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth')
      const data = await res.json()
      if (data.authenticated && data.user?.role === 'super_admin') {
        setUser(data.user)
        setShowLogin(false)
        loadShops()
      } else {
        setShowLogin(true)
      }
    } catch {
      setShowLogin(true)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setLoginError(data.error || 'Error al iniciar sesión')
        return
      }
      if (data.user?.role !== 'super_admin') {
        setLoginError('No tienes permisos de super administrador')
        await fetch('/api/auth', { method: 'DELETE' })
        return
      }
      setUser(data.user)
      setShowLogin(false)
      loadShops()
    } catch {
      setLoginError('Error de conexión')
    }
  }

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    setUser(null)
    setShowLogin(true)
  }

  async function loadShops() {
    try {
      const res = await fetch('/api/shops')
      if (res.ok) {
        const data = await res.json()
        setShops(data.shops || [])
      }
    } catch { /* ignore */ }
  }

  async function handleCreateShop(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShop),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Error al crear barbería')
        return
      }
      alert('¡Barbería creada exitosamente!')
      setShowCreate(false)
      setNewShop({ name: '', slug: '', whatsappNumber: '', description: '', ownerName: '', ownerEmail: '', ownerPassword: '', openingTime: '9:00 AM', closingTime: '7:00 PM' })
      loadShops()
    } catch {
      alert('Error al crear barbería')
    } finally {
      setCreating(false)
    }
  }

  function generateSlug(name: string) {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 30)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A853]" />
      </div>
    )
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="bg-[#111] rounded-2xl p-8 border border-white/10 w-full max-w-md">
          <div className="text-center mb-8">
            <Scissors className="w-12 h-12 text-[#D4A853] mx-auto mb-3" />
            <h1 className="text-2xl font-bold">BarberDo Admin</h1>
            <p className="text-gray-400 text-sm mt-1">Super Administrador</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg focus:border-[#D4A853] focus:outline-none"
                placeholder="admin@barberdo.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg focus:border-[#D4A853] focus:outline-none" />
            </div>
            {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
            <button type="submit"
              className="w-full py-3 rounded-full font-semibold text-black bg-[#D4A853] hover:bg-[#c49a48] transition">
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="bg-[#111] border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-6 h-6 text-[#D4A853]" />
            <span className="font-bold">BarberDo</span>
            <span className="text-xs bg-[#D4A853]/20 text-[#D4A853] px-2 py-0.5 rounded-full">Super Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user?.name}</span>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white transition flex items-center gap-1 text-sm">
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111] rounded-xl p-4 border border-white/10">
            <p className="text-2xl font-bold text-[#D4A853]">{shops.length}</p>
            <p className="text-gray-400 text-sm">Barberías</p>
          </div>
          <div className="bg-[#111] rounded-xl p-4 border border-white/10">
            <p className="text-2xl font-bold text-[#D4A853]">{shops.filter(s => s.isActive).length}</p>
            <p className="text-gray-400 text-sm">Activas</p>
          </div>
          <div className="bg-[#111] rounded-xl p-4 border border-white/10">
            <p className="text-2xl font-bold text-[#D4A853]">{shops.reduce((sum, s) => sum + s._count.appointments, 0)}</p>
            <p className="text-gray-400 text-sm">Citas Totales</p>
          </div>
          <div className="bg-[#111] rounded-xl p-4 border border-white/10">
            <p className="text-2xl font-bold text-[#D4A853]">{shops.reduce((sum, s) => sum + s._count.services, 0)}</p>
            <p className="text-gray-400 text-sm">Servicios</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Barberías</h2>
          <div className="flex gap-2">
            <button onClick={loadShops} className="px-3 py-2 text-sm border border-white/10 rounded-lg hover:bg-white/5 transition flex items-center gap-1">
              <RefreshCw className="w-4 h-4" /> Actualizar
            </button>
            <button onClick={() => setShowCreate(true)}
              className="px-4 py-2 text-sm rounded-lg font-medium text-black bg-[#D4A853] hover:bg-[#c49a48] transition flex items-center gap-1">
              <Plus className="w-4 h-4" /> Nueva Barbería
            </button>
          </div>
        </div>

        {/* Shops list */}
        {shops.length === 0 ? (
          <div className="bg-[#111] rounded-xl border border-white/10 p-12 text-center">
            <Scissors className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No hay barberías aún. Crea la primera.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {shops.map(shop => (
              <div key={shop.id} className="bg-[#111] rounded-xl border border-white/10 p-4 flex items-center justify-between hover:border-white/20 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#D4A853]/10">
                    <Scissors className="w-5 h-5 text-[#D4A853]" />
                  </div>
                  <div>
                    <h3 className="font-bold">{shop.name}</h3>
                    <p className="text-gray-400 text-xs">
                      {shop.slug} · WhatsApp: {shop.whatsappNumber || 'No configurado'} · {shop._count.services} servicios · {shop._count.appointments} citas
                    </p>
                    <p className="text-gray-500 text-xs">Dueño: {shop.owner?.name} ({shop.owner?.email})</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${shop.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {shop.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                  <a href={`/shop/${shop.slug}`} target="_blank"
                    className="p-2 text-gray-400 hover:text-white transition" title="Ver página">
                    <Eye className="w-4 h-4" />
                  </a>
                  <a href={`/shop/${shop.slug}/admin`} target="_blank"
                    className="p-2 text-gray-400 hover:text-[#D4A853] transition" title="Admin de la barbería">
                    <Settings className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Shop Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Nueva Barbería</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateShop} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nombre de la barbería *</label>
                <input type="text" required value={newShop.name}
                  onChange={e => setNewShop(prev => ({ ...prev, name: e.target.value, slug: generateSlug(e.target.value) }))}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg focus:border-[#D4A853] focus:outline-none"
                  placeholder="Omani Barbershop" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Slug (URL) *</label>
                <input type="text" required value={newShop.slug}
                  onChange={e => setNewShop(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg focus:border-[#D4A853] focus:outline-none"
                  placeholder="omani" />
                <p className="text-gray-500 text-xs mt-1">Será: {newShop.slug}.barberdo.com</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">WhatsApp</label>
                <input type="text" value={newShop.whatsappNumber}
                  onChange={e => setNewShop(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg focus:border-[#D4A853] focus:outline-none"
                  placeholder="8293196108" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
                <textarea value={newShop.description}
                  onChange={e => setNewShop(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg focus:border-[#D4A853] focus:outline-none resize-none"
                  rows={2} placeholder="Tu barbería de confianza..." />
              </div>

              <div className="border-t border-white/10 pt-4 mt-4">
                <h3 className="font-semibold mb-3">Datos del dueño</h3>
                <div className="space-y-3">
                  <input type="text" required value={newShop.ownerName}
                    onChange={e => setNewShop(prev => ({ ...prev, ownerName: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg focus:border-[#D4A853] focus:outline-none"
                    placeholder="Nombre del dueño *" />
                  <input type="email" required value={newShop.ownerEmail}
                    onChange={e => setNewShop(prev => ({ ...prev, ownerEmail: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg focus:border-[#D4A853] focus:outline-none"
                    placeholder="Email del dueño *" />
                  <input type="password" required value={newShop.ownerPassword}
                    onChange={e => setNewShop(prev => ({ ...prev, ownerPassword: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg focus:border-[#D4A853] focus:outline-none"
                    placeholder="Contraseña del dueño *" />
                </div>
              </div>

              <button type="submit" disabled={creating}
                className="w-full py-3 rounded-full font-semibold text-black bg-[#D4A853] hover:bg-[#c49a48] transition disabled:opacity-50">
                {creating ? 'Creando...' : 'Crear Barbería'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
