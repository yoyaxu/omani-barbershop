'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Scissors, Phone, Mail, MapPin, Clock, Instagram, Facebook,
  ChevronRight, ChevronLeft, Calendar, Check, X, Menu,
  Shield, Users, DollarSign, TrendingUp, AlertCircle,
  Trash2, Eye, UserPlus, ChevronDown, Star, Sparkles,
  MessageCircle, RotateCcw, Sun, Moon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar as ShadcnCalendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'
import { es } from 'date-fns/locale/es'

// Theme mode (dark/light)
type ThemeMode = 'dark' | 'light'

function useThemeMode() {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('omani-mode')
      if (saved === 'light' || saved === 'dark') return saved
    }
    return 'dark'
  })

  const applyMode = (m: ThemeMode) => {
    const root = document.documentElement
    root.setAttribute('data-mode', m)

    let styleEl = document.getElementById('omani-mode-override') as HTMLStyleElement | null
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = 'omani-mode-override'
      document.head.appendChild(styleEl)
    }

    if (m === 'light') {
      styleEl.textContent = `
        /* Light mode overrides */
        [data-mode="light"] body { background-color: #f5f5f0 !important; }

        /* Main backgrounds */
        [data-mode="light"] [class*="bg-[#0a0a0a]"] { background-color: #f5f5f0 !important; }
        [data-mode="light"] [class*="bg-[#0f0f0f]"] { background-color: #eeeee8 !important; }
        [data-mode="light"] [class*="bg-[#1f1f1f]"] { background-color: #ffffff !important; }

        /* Borders */
        [data-mode="light"] [class*="border-[#2a2a2a]"] { border-color: #e0e0d8 !important; }
        [data-mode="light"] [class*="border-[#3a3a3a]"] { border-color: #d0d0c8 !important; }

        /* Primary text */
        [data-mode="light"] [class*="text-[#f5f5f5]"] { color: #1a1a1a !important; }

        /* Secondary text */
        [data-mode="light"] [class*="text-[#a0a0a0]"] { color: #5a5a5a !important; }

        /* Muted text */
        [data-mode="light"] [class*="text-[#3a3a3a]"] { color: #b0b0a8 !important; }

        /* Gold accents stay the same - but adjust subtle variants */
        [data-mode="light"] [class*="bg-[#d4a039]/5"] { background-color: rgba(212,160,57,0.08) !important; }
        [data-mode="light"] [class*="bg-[#d4a039]/3"] { background-color: rgba(212,160,57,0.05) !important; }

        /* Header backdrop */
        [data-mode="light"] [class*="bg-[#0a0a0a]/95"] { background-color: rgba(245,245,240,0.95) !important; }

        /* Hover states */
        [data-mode="light"] [class*="hover:bg-[#2a2a2a]"]:hover { background-color: rgba(0,0,0,0.06) !important; }

        /* Hero overlay */
        [data-mode="light"] [class*="from-[#0a0a0a]/80"] { --tw-gradient-from: rgba(245,245,240,0.85) !important; }
        [data-mode="light"] [class*="via-[#0a0a0a]/70"] { --tw-gradient-via: rgba(245,245,240,0.75) !important; }
        [data-mode="light"] [class*="to-[#0a0a0a]"] { --tw-gradient-to: #f5f5f0 !important; }

        /* Badge backgrounds in admin */
        [data-mode="light"] .bg-yellow-500\/20 { background-color: rgba(234,179,8,0.15) !important; }
        [data-mode="light"] .bg-green-500\/20 { background-color: rgba(34,197,94,0.15) !important; }
        [data-mode="light"] .bg-blue-500\/20 { background-color: rgba(59,130,246,0.15) !important; }
        [data-mode="light"] .bg-red-500\/20 { background-color: rgba(239,68,68,0.15) !important; }

        /* Sheet / Dialog backgrounds */
        [data-mode="light"] [class*="bg-[#0a0a0a]"] { background-color: #f5f5f0 !important; }

        /* Input backgrounds */
        [data-mode="light"] input, [data-mode="light"] textarea { background-color: #ffffff !important; color: #1a1a1a !important; border-color: #e0e0d8 !important; }
        [data-mode="light"] select { background-color: #ffffff !important; color: #1a1a1a !important; }

        /* Calendar in light mode */
        [data-mode="light"] .rdp { --rdp-background-color: rgba(212,160,57,0.1) !important; }

        /* Gold text class */
        [data-mode="light"] .gold-text { color: #b8882e !important; }

        /* Scroll area */
        [data-mode="light"] [data-radix-scroll-area-viewport] { background-color: transparent !important; }
      `
    } else {
      styleEl.textContent = ''
    }
  }

  const setMode = (m: ThemeMode) => {
    setModeState(m)
    localStorage.setItem('omani-mode', m)
    applyMode(m)
  }

  const toggleMode = () => {
    setMode(mode === 'dark' ? 'light' : 'dark')
  }

  useEffect(() => {
    applyMode(mode)
  }, [mode])

  return { mode, setMode, toggleMode }
}

// Types
interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  category: string
  active: boolean
  order: number
}

interface AppointmentService {
  id: string
  serviceId: string
  price: number
  service: Service
}

interface Appointment {
  id: string
  customerName: string
  customerPhone: string
  customerEmail: string
  date: string
  time: string
  numberOfPeople: number
  totalPrice: number
  totalDuration: number
  status: string
  notes: string | null
  createdAt: string
  services: AppointmentService[]
}

interface TimeSlot {
  time: string
  available: boolean
}

type View = 'home' | 'booking' | 'admin'
type BookingStep = 'services' | 'datetime' | 'info' | 'confirm'

// Service category icons
const categoryIcons: Record<string, string> = {
  corte: '✂️',
  combo: '👑',
  barba: '🪒',
  detalle: '👁️',
  tratamiento: '💆',
  facial: '🧖',
  styling: '💇',
}

// Format price
function formatPrice(price: number): string {
  return `$${price.toLocaleString()} DOP`
}

// Format time from 24h to 12h
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

// Format date for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('es-DO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Status badge helper
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pendiente', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    confirmed: { label: 'Confirmada', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
    completed: { label: 'Completada', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    cancelled: { label: 'Cancelada', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  }
  const c = config[status] || config.pending
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

// ==================== HEADER ====================
function Header({ currentView, setView, mode, toggleMode }: { currentView: View; setView: (v: View) => void; mode: ThemeMode; toggleMode: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { key: 'home' as View, label: 'Inicio' },
    { key: 'booking' as View, label: 'Reservar Cita' },
    { key: 'admin' as View, label: 'Admin' },
  ]

  const handleNav = (v: View) => {
    setView(v)
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#2a2a2a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#d4a039] to-[#b8882e] flex items-center justify-center">
              <Scissors className="w-4 h-4 sm:w-5 sm:h-5 text-[#0a0a0a] rotate-[-45deg]" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold tracking-wider gold-text">OMANI</span>
              <span className="hidden sm:block text-[10px] tracking-[0.3em] text-[#a0a0a0] uppercase -mt-1">Barbershop</span>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === item.key
                    ? 'text-[#d4a039] bg-[#d4a039]/10'
                    : 'text-[#a0a0a0] hover:text-[#f5f5f5] hover:bg-[#2a2a2a]'
                }`}
              >
                {item.label}
              </button>
            ))}
            {/* Theme toggle */}
            <button
              onClick={toggleMode}
              className="ml-2 p-2 rounded-lg text-[#a0a0a0] hover:text-[#d4a039] hover:bg-[#d4a039]/10 transition-all duration-200"
              title={mode === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </nav>

          {/* Mobile: theme toggle + menu */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={toggleMode}
              className="p-2 rounded-lg text-[#a0a0a0] hover:text-[#d4a039] transition-all"
              title={mode === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-[#f5f5f5]">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#0a0a0a] border-[#2a2a2a] w-72">
                <SheetTitle className="text-[#f5f5f5]">Menú</SheetTitle>
                <div className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => handleNav(item.key)}
                      className={`px-4 py-3 rounded-lg text-left font-medium transition-all ${
                        currentView === item.key
                          ? 'text-[#d4a039] bg-[#d4a039]/10'
                          : 'text-[#a0a0a0] hover:text-[#f5f5f5] hover:bg-[#2a2a2a]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                  <Button
                    onClick={() => handleNav('booking')}
                    className="mt-4 bg-gradient-to-r from-[#d4a039] to-[#b8882e] text-[#0a0a0a] font-bold"
                  >
                    Reservar Cita
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

// ==================== HOME VIEW ====================
function HomeView({ setView }: { setView: (v: View) => void }) {
  const [services, setServices] = useState<Service[]>([])
  const [servicesLoaded, setServicesLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((data) => {
        setServices(data)
        setServicesLoaded(true)
      })
      .catch(() => setServicesLoaded(true))
  }, [])

  // Seed on first load if no services
  useEffect(() => {
    if (servicesLoaded && services.length === 0) {
      fetch('/api/seed', { method: 'POST' })
        .then((r) => r.json())
        .then(() => {
          return fetch('/api/services').then((r) => r.json())
        })
        .then((data) => setServices(data))
        .catch(console.error)
    }
  }, [servicesLoaded, services.length])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/hero-bg.png')" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-[#0a0a0a]/70 to-[#0a0a0a]" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#d4a039]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-[#d4a039]/3 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 lg:py-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#d4a039] to-[#b8882e] flex items-center justify-center shadow-lg shadow-[#d4a039]/20">
                <Scissors className="w-8 h-8 sm:w-10 sm:h-10 text-[#0a0a0a] rotate-[-45deg]" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6">
              <span className="gold-text">Tu Estilo,</span>{' '}
              <span className="text-[#f5f5f5]">Nuestra Pasión</span>
            </h1>
            <p className="text-lg sm:text-xl text-[#a0a0a0] max-w-2xl mx-auto mb-8 sm:mb-10">
              La mejor experiencia de barbería en Santo Domingo Norte.
              Profesionales dedicados a realzar tu estilo único.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setView('booking')}
                size="lg"
                className="bg-gradient-to-r from-[#d4a039] to-[#b8882e] text-[#0a0a0a] font-bold text-lg px-8 py-6 hover:from-[#e8b94a] hover:to-[#d4a039] transition-all shadow-lg shadow-[#d4a039]/20"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Reservar Cita
              </Button>
              <Button
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                size="lg"
                variant="outline"
                className="border-[#d4a039]/50 text-[#d4a039] hover:bg-[#d4a039]/10 text-lg px-8 py-6"
              >
                Sobre Nosotros
              </Button>
              <Button
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                size="lg"
                variant="outline"
                className="border-[#d4a039]/30 text-[#d4a039] hover:bg-[#d4a039]/10 text-lg px-8 py-6"
              >
                Ver Servicios
              </Button>
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 sm:mt-20 grid grid-cols-3 gap-4 sm:gap-8 max-w-xl mx-auto"
          >
            {[
              { num: '10+', label: 'Servicios' },
              { num: '5+', label: 'Años' },
              { num: '1000+', label: 'Clientes' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold gold-text">{stat.num}</p>
                <p className="text-xs sm:text-sm text-[#a0a0a0] mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 sm:py-24 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="gold-text">Nuestros</span> Servicios
            </h2>
            <p className="text-[#a0a0a0] max-w-xl mx-auto">
              Ofrecemos una amplia variedad de servicios para que salgas luciendo increíble
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 stagger-children">
            {services.map((service) => (
              <Card
                key={service.id}
                className="bg-[#1f1f1f] border-[#2a2a2a] hover:border-[#d4a039]/50 transition-all duration-300 group cursor-pointer hover:shadow-lg hover:shadow-[#d4a039]/5"
                onClick={() => setView('booking')}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl mb-3">
                    {categoryIcons[service.category] || '✂️'}
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-[#f5f5f5] mb-1 group-hover:text-[#d4a039] transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-xs text-[#a0a0a0] mb-3 line-clamp-2">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#d4a039] font-bold text-sm sm:text-base">
                      {formatPrice(service.price)}
                    </span>
                    <span className="text-xs text-[#a0a0a0] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {service.duration} min
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-24 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                <span className="gold-text">Sobre</span> Nosotros
              </h2>
              <p className="text-[#a0a0a0] mb-4 leading-relaxed">
                En Omani Barbershop, nos dedicamos a ofrecer más que un simple corte de cabello.
                Creemos en la experiencia completa: desde el momento que entras hasta que sales
                luciendo tu mejor versión.
              </p>
              <p className="text-[#a0a0a0] mb-6 leading-relaxed">
                Nuestro equipo de barberos profesionales está comprometido con la excelencia,
                usando técnicas modernas y productos de primera calidad para garantizarte
                resultados impecables.
              </p>
              <div className="flex items-center gap-2 text-[#d4a039]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#d4a039]" />
                ))}
                <span className="text-sm text-[#a0a0a0] ml-2">+1000 clientes satisfechos</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
                <CardContent className="p-4 sm:p-6 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#d4a039]/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-[#d4a039]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#f5f5f5] mb-2">Horario de Atención</h3>
                    <div className="space-y-1 text-sm text-[#a0a0a0]">
                      <p>Miércoles a Lunes: 8:00 AM - 8:00 PM</p>
                      <p>Martes: Cerrado</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
                <CardContent className="p-4 sm:p-6 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#d4a039]/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#d4a039]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#f5f5f5] mb-2">Ubicación</h3>
                    <p className="text-sm text-[#a0a0a0]">
                      Calle Marcos del Rosario, esquina C. José Martí, Santo Domingo Norte
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
                <CardContent className="p-4 sm:p-6 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#d4a039]/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-[#d4a039]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#f5f5f5] mb-2">¿Por qué elegirnos?</h3>
                    <p className="text-sm text-[#a0a0a0]">
                      Ambiente profesional, productos premium y barberos con años de experiencia.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 sm:py-24 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="gold-text">Contáctanos</span>
            </h2>
            <p className="text-[#a0a0a0] max-w-xl mx-auto">
              Estamos aquí para atenderte. Contáctanos por cualquier medio
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <Card className="bg-[#1f1f1f] border-[#2a2a2a] hover:border-[#d4a039]/50 transition-all group">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-[#d4a039]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#d4a039]/20 transition-colors">
                  <Phone className="w-5 h-5 text-[#d4a039]" />
                </div>
                <h3 className="font-bold text-[#f5f5f5] text-sm mb-1">Teléfono</h3>
                <a href="tel:8296576185" className="text-[#a0a0a0] text-sm hover:text-[#d4a039] transition-colors">
                  (829) 657-6185
                </a>
              </CardContent>
            </Card>

            <Card className="bg-[#1f1f1f] border-[#2a2a2a] hover:border-[#d4a039]/50 transition-all group">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-[#d4a039]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#d4a039]/20 transition-colors">
                  <Mail className="w-5 h-5 text-[#d4a039]" />
                </div>
                <h3 className="font-bold text-[#f5f5f5] text-sm mb-1">Email</h3>
                <a href="mailto:abreuomani@gmail.com" className="text-[#a0a0a0] text-xs sm:text-sm hover:text-[#d4a039] transition-colors break-all">
                  abreuomani@gmail.com
                </a>
              </CardContent>
            </Card>

            <Card className="bg-[#1f1f1f] border-[#2a2a2a] hover:border-[#d4a039]/50 transition-all group">
              <CardContent className="p-4 sm:p-6 text-center">
                <a href="https://instagram.com/omani_barbershop" target="_blank" rel="noopener noreferrer" className="block">
                  <div className="w-12 h-12 rounded-full bg-[#d4a039]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#d4a039]/20 transition-colors">
                    <Instagram className="w-5 h-5 text-[#d4a039]" />
                  </div>
                  <h3 className="font-bold text-[#f5f5f5] text-sm mb-1">Instagram</h3>
                  <p className="text-[#a0a0a0] text-sm">@omani_barbershop</p>
                </a>
              </CardContent>
            </Card>

            <Card className="bg-[#1f1f1f] border-[#2a2a2a] hover:border-[#d4a039]/50 transition-all group">
              <CardContent className="p-4 sm:p-6 text-center">
                <a href="https://facebook.com/profile.php?id=100054503348727" target="_blank" rel="noopener noreferrer" className="block">
                  <div className="w-12 h-12 rounded-full bg-[#d4a039]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#d4a039]/20 transition-colors">
                    <Facebook className="w-5 h-5 text-[#d4a039]" />
                  </div>
                  <h3 className="font-bold text-[#f5f5f5] text-sm mb-1">Facebook</h3>
                  <p className="text-[#a0a0a0] text-sm">Omani Barbershop</p>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Instagram Gallery */}
      <section className="py-16 sm:py-24 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">
              <span className="gold-text">Síguenos</span> en Instagram
            </h2>
            <a
              href="https://instagram.com/omani_barbershop"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#d4a039] hover:text-[#e8b94a] transition-colors text-lg inline-flex items-center gap-2"
            >
              <Instagram className="w-5 h-5" />
              @omani_barbershop
            </a>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {['/instagram/insta1.png', '/instagram/insta2.png', '/instagram/insta3.png', '/instagram/insta4.png', '/instagram/insta5.png', '/instagram/insta6.png'].map((src, i) => (
              <motion.a
                key={i}
                href="https://instagram.com/omani_barbershop"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative group overflow-hidden rounded-xl aspect-square cursor-pointer"
              >
                <img
                  src={src}
                  alt={`Omani Barbershop - ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                  <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#0a0a0a] border-t border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-[#d4a039] rotate-[-45deg]" />
              <span className="text-sm font-bold gold-text">OMANI</span>
              <span className="text-sm text-[#a0a0a0]">Barbershop</span>
            </div>
            <p className="text-xs text-[#a0a0a0]">
              © {new Date().getFullYear()} Omani Barbershop. Todos los derechos reservados.
            </p>
            <button
              onClick={() => setView('admin')}
              className="text-xs text-[#3a3a3a] hover:text-[#a0a0a0] transition-colors flex items-center gap-1"
            >
              <Shield className="w-3 h-3" />
              Admin
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ==================== BOOKING VIEW ====================
function BookingView({ setView }: { setView: (v: View) => void }) {
  const [step, setStep] = useState<BookingStep>('services')
  const [services, setServices] = useState<Service[]>([])
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set())
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [numberOfPeople, setNumberOfPeople] = useState('1')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [completedAppointment, setCompletedAppointment] = useState<Appointment | null>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Fetch services
  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length === 0) {
          return fetch('/api/seed', { method: 'POST' }).then(() =>
            fetch('/api/services').then((r) => r.json())
          )
        }
        return data
      })
      .then((data) => setServices(data))
      .catch(console.error)
  }, [])

  // Fetch available time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      fetch(`/api/appointments/available-slots?date=${selectedDate}`)
        .then((r) => r.json())
        .then((data) => setTimeSlots(data))
        .catch(console.error)
    }
  }, [selectedDate])

  const toggleService = (id: string) => {
    const next = new Set(selectedServices)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedServices(next)
  }

  const selectedServicesList = services.filter((s) => selectedServices.has(s.id))
  const totalPrice = selectedServicesList.reduce((sum, s) => sum + s.price, 0)
  const totalDuration = selectedServicesList.reduce((sum, s) => sum + s.duration, 0)

  const steps: { key: BookingStep; num: number; label: string }[] = [
    { key: 'services', num: 1, label: 'Servicios' },
    { key: 'datetime', num: 2, label: 'Fecha y Hora' },
    { key: 'info', num: 3, label: 'Tus Datos' },
    { key: 'confirm', num: 4, label: 'Confirmar' },
  ]

  const currentStepIdx = steps.findIndex((s) => s.key === step)

  // Calendar helpers
  const isCalendarDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    return checkDate < today || date.getDay() === 2 // Closed on Tuesdays, today is allowed
  }

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) return
    const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    setSelectedDate(dateStr)
    setSelectedTime('')
    setCalendarOpen(false)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          date: selectedDate,
          time: selectedTime,
          numberOfPeople: parseInt(numberOfPeople),
          serviceIds: Array.from(selectedServices),
          notes,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Error al crear la cita')
        return
      }

      setCompletedAppointment(data)
      setBookingComplete(true)
      toast.success('¡Cita reservada exitosamente!')
    } catch {
      toast.error('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Booking success screen
  if (bookingComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="bg-[#1f1f1f] border-[#d4a039]/30">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-[#f5f5f5] mb-2">¡Cita Reservada!</h2>
              <p className="text-[#a0a0a0] mb-6">
                Tu cita ha sido registrada exitosamente
              </p>

              {completedAppointment && (
                <div className="text-left space-y-3 bg-[#0a0a0a] rounded-lg p-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-[#a0a0a0] text-sm">Nombre:</span>
                    <span className="text-[#f5f5f5] text-sm font-medium">{completedAppointment.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a0a0a0] text-sm">Fecha:</span>
                    <span className="text-[#f5f5f5] text-sm font-medium">{formatDate(completedAppointment.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a0a0a0] text-sm">Hora:</span>
                    <span className="text-[#f5f5f5] text-sm font-medium">{formatTime(completedAppointment.time)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a0a0a0] text-sm">Servicios:</span>
                    <span className="text-[#f5f5f5] text-sm font-medium">
                      {completedAppointment.services.map((s) => s.service.name).join(', ')}
                    </span>
                  </div>
                  <Separator className="bg-[#2a2a2a]" />
                  <div className="flex justify-between">
                    <span className="text-[#d4a039] font-bold">Total:</span>
                    <span className="text-[#d4a039] font-bold">{formatPrice(completedAppointment.totalPrice)}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => setView('home')}
                  variant="outline"
                  className="flex-1 border-[#2a2a2a] text-[#a0a0a0] hover:text-[#f5f5f5]"
                >
                  Inicio
                </Button>
                <Button
                  onClick={() => {
                    setBookingComplete(false)
                    setStep('services')
                    setSelectedServices(new Set())
                    setSelectedDate('')
                    setSelectedTime('')
                    setCustomerName('')
                    setCustomerPhone('')
                    setCustomerEmail('')
                    setNumberOfPeople('1')
                    setNotes('')
                  }}
                  className="flex-1 bg-gradient-to-r from-[#d4a039] to-[#b8882e] text-[#0a0a0a] font-bold"
                >
                  Nueva Cita
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
        {/* Back button */}
        <button
          onClick={() => setView('home')}
          className="flex items-center gap-2 text-[#a0a0a0] hover:text-[#d4a039] transition-colors mb-6 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al inicio
        </button>

        {/* Steps indicator */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, i) => (
            <React.Fragment key={s.key}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    i <= currentStepIdx
                      ? 'bg-[#d4a039] text-[#0a0a0a]'
                      : 'bg-[#2a2a2a] text-[#a0a0a0]'
                  }`}
                >
                  {i < currentStepIdx ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span className={`hidden sm:block text-sm font-medium ${
                  i <= currentStepIdx ? 'text-[#d4a039]' : 'text-[#a0a0a0]'
                }`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  i < currentStepIdx ? 'bg-[#d4a039]' : 'bg-[#2a2a2a]'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Select Services */}
          {step === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="lg:flex lg:gap-6">
                {/* Services List */}
                <div className="lg:flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#f5f5f5] mb-2">Selecciona tus Servicios</h2>
                  <p className="text-[#a0a0a0] text-sm mb-6">Elige uno o más servicios para tu cita</p>

                  <div className="space-y-3 mb-6">
                    {services.map((service) => {
                      const isSelected = selectedServices.has(service.id)
                      return (
                        <Card
                          key={service.id}
                          className={`cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'bg-[#1f1f1f] border-[#d4a039] shadow-md shadow-[#d4a039]/10'
                              : 'bg-[#1f1f1f] border-[#2a2a2a] hover:border-[#3a3a3a]'
                          }`}
                          onClick={() => toggleService(service.id)}
                        >
                          <CardContent className="p-4 flex items-center gap-3 sm:gap-4">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleService(service.id)}
                              className={isSelected ? 'border-[#d4a039] bg-[#d4a039] text-[#0a0a0a]' : ''}
                            />
                            <div className="text-xl shrink-0">
                              {categoryIcons[service.category] || '✂️'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className={`font-bold text-sm sm:text-base ${isSelected ? 'text-[#d4a039]' : 'text-[#f5f5f5]'}`}>
                                {service.name}
                              </h3>
                              <p className="text-xs text-[#a0a0a0] line-clamp-1">{service.description}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={`font-bold text-sm ${isSelected ? 'text-[#d4a039]' : 'text-[#f5f5f5]'}`}>
                                {formatPrice(service.price)}
                              </p>
                              <p className="text-xs text-[#a0a0a0]">{service.duration} min</p>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>

                  {/* Mobile total bar */}
                  {selectedServices.size > 0 && (
                    <Card className="bg-[#1f1f1f] border-[#d4a039]/30 mb-6 lg:hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-[#a0a0a0]">
                              {selectedServices.size} servicio{selectedServices.size > 1 ? 's' : ''} seleccionado{selectedServices.size > 1 ? 's' : ''}
                            </p>
                            <div className="flex gap-4 mt-1">
                              <span className="text-[#d4a039] font-bold">{formatPrice(totalPrice)}</span>
                              <span className="text-[#a0a0a0] text-sm flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {totalDuration} min
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={() => setStep('datetime')}
                            className="bg-gradient-to-r from-[#d4a039] to-[#b8882e] text-[#0a0a0a] font-bold"
                          >
                            Continuar
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Desktop Side Summary Panel */}
                <div className="hidden lg:block lg:w-80">
                  <div className="sticky top-24">
                    <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-[#f5f5f5] text-base">Tu Reserva</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {selectedServicesList.length === 0 ? (
                          <p className="text-[#a0a0a0] text-sm text-center py-4">
                            Selecciona servicios para ver el resumen
                          </p>
                        ) : (
                          <>
                            {selectedServicesList.map((service) => (
                              <div key={service.id} className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-sm">{categoryIcons[service.category] || '✂️'}</span>
                                  <span className="text-[#f5f5f5] text-sm truncate">{service.name}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => toggleService(service.id)}
                                    className="text-[#a0a0a0] hover:text-red-400 transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-[#d4a039] text-sm font-bold">{formatPrice(service.price)}</span>
                                </div>
                              </div>
                            ))}
                            <Separator className="bg-[#2a2a2a]" />
                            <div className="flex justify-between items-center">
                              <span className="text-[#a0a0a0] text-sm">Duración total</span>
                              <span className="text-[#f5f5f5] text-sm flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {totalDuration} min
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[#d4a039] font-bold">Total</span>
                              <span className="text-[#d4a039] font-bold text-lg">{formatPrice(totalPrice)}</span>
                            </div>
                            <Button
                              onClick={() => setStep('datetime')}
                              className="w-full bg-gradient-to-r from-[#d4a039] to-[#b8882e] text-[#0a0a0a] font-bold mt-2"
                            >
                              Continuar
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Date & Time */}
          {step === 'datetime' && (
            <motion.div
              key="datetime"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#f5f5f5] mb-2">Selecciona Fecha y Hora</h2>
              <p className="text-[#a0a0a0] text-sm mb-6">Elige el día y horario que prefieras</p>

              {/* Date Picker */}
              <div className="mb-6">
                <Label className="text-[#f5f5f5] mb-2 block">Fecha</Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal bg-[#0a0a0a] border-[#2a2a2a] hover:bg-[#1f1f1f] hover:border-[#d4a039]/50 ${
                        selectedDate ? 'text-[#f5f5f5]' : 'text-[#3a3a3a]'
                      }`}
                    >
                      <Calendar className="w-4 h-4 mr-2 text-[#d4a039]" />
                      {selectedDate ? formatDate(selectedDate) : 'Selecciona una fecha...'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#1f1f1f] border-[#2a2a2a]" align="start">
                    <ShadcnCalendar
                      mode="single"
                      selected={selectedDate ? new Date(selectedDate + 'T12:00:00') : undefined}
                      onSelect={handleCalendarSelect}
                      disabled={isCalendarDateDisabled}
                      locale={es}
                      classNames={{
                        months: 'flex gap-4 flex-col',
                        month: 'flex flex-col w-full gap-4',
                        month_caption: 'flex items-center justify-center h-9 w-full px-8',
                        caption_label: 'text-sm font-medium text-[#f5f5f5]',
                        nav: 'flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between px-1',
                        button_previous: 'size-9 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md text-[#a0a0a0] hover:text-[#f5f5f5] hover:bg-[#2a2a2a]',
                        button_next: 'size-9 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md text-[#a0a0a0] hover:text-[#f5f5f5] hover:bg-[#2a2a2a]',
                        weekdays: 'flex',
                        weekday: 'text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none text-[#a0a0a0]',
                        week: 'flex w-full mt-2',
                        day: 'relative w-full h-full p-0 text-center aspect-square select-none group/day',
                        day_button: 'size-auto w-full min-w-8 flex aspect-square flex-col gap-1 leading-none font-normal rounded-lg text-[#a0a0a0] hover:bg-[#2a2a2a] hover:text-[#f5f5f5] transition-all',
                        selected: 'bg-[#d4a039] text-[#0a0a0a] rounded-lg hover:bg-[#c49030] hover:text-[#0a0a0a] font-bold',
                        today: 'bg-[#2a2a2a] text-[#d4a039] rounded-md',
                        disabled: 'text-[#3a3a3a] opacity-50 cursor-not-allowed hover:bg-transparent hover:text-[#3a3a3a]',
                        outside: 'text-[#3a3a3a] aria-selected:text-[#3a3a3a]',
                        hidden: 'invisible',
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time slots */}
              {selectedDate && (
                <Card className="bg-[#1f1f1f] border-[#2a2a2a] mb-6">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-bold text-[#f5f5f5] mb-4">
                      Horarios disponibles - {formatDate(selectedDate)}
                    </h3>
                    {timeSlots.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => slot.available && setSelectedTime(slot.time)}
                            disabled={!slot.available}
                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                              selectedTime === slot.time
                                ? 'bg-[#d4a039] text-[#0a0a0a]'
                                : slot.available
                                ? 'bg-[#2a2a2a] text-[#a0a0a0] hover:bg-[#3a3a3a] hover:text-[#f5f5f5]'
                                : 'bg-[#1a1a1a] text-[#3a3a3a] cursor-not-allowed line-through'
                            }`}
                          >
                            {formatTime(slot.time)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-[#a0a0a0]">
                        <div className="animate-spin w-5 h-5 border-2 border-[#d4a039] border-t-transparent rounded-full mr-2" />
                        Cargando horarios...
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('services')}
                  variant="outline"
                  className="border-[#2a2a2a] text-[#a0a0a0] hover:text-[#f5f5f5]"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Atrás
                </Button>
                <Button
                  onClick={() => setStep('info')}
                  disabled={!selectedDate || !selectedTime}
                  className="flex-1 bg-gradient-to-r from-[#d4a039] to-[#b8882e] text-[#0a0a0a] font-bold disabled:opacity-50"
                >
                  Continuar
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Personal Info */}
          {step === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#f5f5f5] mb-2">Tus Datos</h2>
              <p className="text-[#a0a0a0] text-sm mb-6">Ingresa tu información de contacto</p>

              <Card className="bg-[#1f1f1f] border-[#2a2a2a] mb-6">
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-[#f5f5f5] mb-2 block">Nombre completo *</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Tu nombre"
                      className="bg-[#0a0a0a] border-[#2a2a2a] text-[#f5f5f5] placeholder:text-[#3a3a3a] focus:border-[#d4a039]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-[#f5f5f5] mb-2 block">Teléfono *</Label>
                    <Input
                      id="phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(829) 000-0000"
                      className="bg-[#0a0a0a] border-[#2a2a2a] text-[#f5f5f5] placeholder:text-[#3a3a3a] focus:border-[#d4a039]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-[#f5f5f5] mb-2 block">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="bg-[#0a0a0a] border-[#2a2a2a] text-[#f5f5f5] placeholder:text-[#3a3a3a] focus:border-[#d4a039]"
                    />
                  </div>
                  <div>
                    <Label className="text-[#f5f5f5] mb-2 block">Número de personas</Label>
                    <Select value={numberOfPeople} onValueChange={setNumberOfPeople}>
                      <SelectTrigger className="bg-[#0a0a0a] border-[#2a2a2a] text-[#f5f5f5]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1f1f1f] border-[#2a2a2a]">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={n.toString()} className="text-[#f5f5f5] focus:bg-[#2a2a2a]">
                            {n} {n === 1 ? 'persona' : 'personas'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notes" className="text-[#f5f5f5] mb-2 block">Notas especiales (opcional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Algún detalle o preferencia especial..."
                      className="bg-[#0a0a0a] border-[#2a2a2a] text-[#f5f5f5] placeholder:text-[#3a3a3a] focus:border-[#d4a039] min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('datetime')}
                  variant="outline"
                  className="border-[#2a2a2a] text-[#a0a0a0] hover:text-[#f5f5f5]"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Atrás
                </Button>
                <Button
                  onClick={() => setStep('confirm')}
                  disabled={!customerName || !customerPhone || !customerEmail}
                  className="flex-1 bg-gradient-to-r from-[#d4a039] to-[#b8882e] text-[#0a0a0a] font-bold disabled:opacity-50"
                >
                  Continuar
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#f5f5f5] mb-2">Confirmar tu Cita</h2>
              <p className="text-[#a0a0a0] text-sm mb-6">Revisa los detalles antes de confirmar</p>

              <Card className="bg-[#1f1f1f] border-[#d4a039]/30 mb-6">
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-[#a0a0a0] mb-2">Servicios</h3>
                    <div className="space-y-2">
                      {selectedServicesList.map((s) => (
                        <div key={s.id} className="flex justify-between items-center">
                          <span className="text-[#f5f5f5] text-sm">{s.name}</span>
                          <span className="text-[#d4a039] text-sm font-medium">{formatPrice(s.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-[#2a2a2a]" />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#a0a0a0]">Fecha</p>
                      <p className="text-[#f5f5f5] font-medium text-sm">{formatDate(selectedDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#a0a0a0]">Hora</p>
                      <p className="text-[#f5f5f5] font-medium text-sm">{formatTime(selectedTime)}</p>
                    </div>
                  </div>

                  <Separator className="bg-[#2a2a2a]" />

                  <div>
                    <h3 className="text-sm font-medium text-[#a0a0a0] mb-2">Datos de contacto</h3>
                    <div className="space-y-1">
                      <p className="text-[#f5f5f5] text-sm">{customerName}</p>
                      <p className="text-[#a0a0a0] text-sm">{customerPhone}</p>
                      <p className="text-[#a0a0a0] text-sm">{customerEmail}</p>
                      <p className="text-[#a0a0a0] text-sm">{numberOfPeople} {parseInt(numberOfPeople) === 1 ? 'persona' : 'personas'}</p>
                      {notes && <p className="text-[#a0a0a0] text-sm italic">Nota: {notes}</p>}
                    </div>
                  </div>

                  <Separator className="bg-[#2a2a2a]" />

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-[#a0a0a0]">Duración total: {totalDuration} min</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#a0a0a0]">Total</p>
                      <p className="text-xl font-bold text-[#d4a039]">{formatPrice(totalPrice)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('info')}
                  variant="outline"
                  className="border-[#2a2a2a] text-[#a0a0a0] hover:text-[#f5f5f5]"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Atrás
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#d4a039] to-[#b8882e] text-[#0a0a0a] font-bold text-lg py-6"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-[#0a0a0a] border-t-transparent rounded-full" />
                      Procesando...
                    </div>
                  ) : (
                    <>
                      Confirmar Cita
                      <Check className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ==================== ADMIN VIEW ====================
function AdminView({ setView }: { setView: (v: View) => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [adminCalendarOpen, setAdminCalendarOpen] = useState(false)

  const fetchAppointments = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filterDate) params.set('date', filterDate)
      if (filterStatus !== 'all') params.set('status', filterStatus)

      const res = await fetch(`/api/appointments?${params.toString()}`)
      const data = await res.json()
      setAppointments(data)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }, [filterDate, filterStatus])

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments()
    }
  }, [isAuthenticated, fetchAppointments])

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const statusLabels: Record<string, string> = {
          confirmed: 'confirmada',
          completed: 'completada',
          cancelled: 'cancelada',
          pending: 'reactivada',
        }
        toast.success(`Cita ${statusLabels[status] || 'actualizada'}`)
        // Update selectedAppointment if detail dialog is open
        if (selectedAppointment?.id === id) {
          setSelectedAppointment((prev) => prev ? { ...prev, status } : null)
        }
        fetchAppointments()
      }
    } catch {
      toast.error('Error al actualizar la cita')
    }
  }

  const sendWhatsApp = (appointment: Appointment) => {
    const servicesList = appointment.services.map((s) => s.service.name).join(', ')
    const message = `¡Hola ${appointment.customerName}! 👋\n\nTe confirmamos tu cita en *Omani Barbershop*:\n\n📅 *Fecha:* ${formatDate(appointment.date)}\n🕐 *Hora:* ${formatTime(appointment.time)}\n✂️ *Servicios:* ${servicesList}\n💰 *Total:* ${formatPrice(appointment.totalPrice)}\n👥 *Personas:* ${appointment.numberOfPeople}\n\n¡Te esperamos! 🙏\n\n📍 Calle Marcos del Rosario, esq. C. José Martí, Santo Domingo Norte`
    const phone = appointment.customerPhone.replace(/\D/g, '')
    const waNumber = phone.startsWith('1') ? phone : `1${phone}`
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const deleteAppointment = async (id: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Cita eliminada')
        fetchAppointments()
        setDetailOpen(false)
      }
    } catch {
      toast.error('Error al eliminar la cita')
    }
  }

  // Stats
  const today = new Date().toISOString().split('T')[0]
  const now = new Date()
  const monthStart = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-01`
  const todayAppointments = appointments.filter((a) => a.date === today)
  const monthAppointments = appointments.filter((a) => a.date >= monthStart && a.date <= today)
  const pendingCount = appointments.filter((a) => a.status === 'pending').length
  const completedCount = appointments.filter((a) => a.status === 'completed').length
  const todayRevenue = todayAppointments
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => sum + a.totalPrice, 0)
  const monthlyRevenue = monthAppointments
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => sum + a.totalPrice, 0)

  // Auth screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full"
        >
          <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-[#d4a039]/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-[#d4a039]" />
              </div>
              <h2 className="text-xl font-bold text-[#f5f5f5] mb-2">Panel de Administración</h2>
              <p className="text-[#a0a0a0] text-sm mb-6">Ingresa la contraseña para acceder</p>

              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && password === 'aflow2024') {
                    setIsAuthenticated(true)
                  }
                }}
                placeholder="Contraseña"
                className="bg-[#0a0a0a] border-[#2a2a2a] text-[#f5f5f5] placeholder:text-[#3a3a3a] focus:border-[#d4a039] mb-4"
              />

              <Button
                onClick={() => {
                  if (password === 'aflow2024') {
                    setIsAuthenticated(true)
                  } else {
                    toast.error('Contraseña incorrecta')
                  }
                }}
                className="w-full bg-gradient-to-r from-[#d4a039] to-[#b8882e] text-[#0a0a0a] font-bold"
              >
                Ingresar
              </Button>

              <button
                onClick={() => setView('home')}
                className="text-sm text-[#a0a0a0] hover:text-[#d4a039] mt-4 block mx-auto transition-colors"
              >
                Volver al inicio
              </button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#f5f5f5]">Panel de Administración</h1>
            <p className="text-sm text-[#a0a0a0]">Gestiona las citas de Omani Barbershop</p>
          </div>
          <Button
            onClick={() => setView('home')}
            variant="outline"
            size="sm"
            className="border-[#2a2a2a] text-[#a0a0a0] hover:text-[#f5f5f5]"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Inicio
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#d4a039]/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#d4a039]" />
                </div>
                <div>
                  <p className="text-xs text-[#a0a0a0]">Citas hoy</p>
                  <p className="text-xl font-bold text-[#f5f5f5]">{todayAppointments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-[#a0a0a0]">Pendientes</p>
                  <p className="text-xl font-bold text-[#f5f5f5]">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-[#a0a0a0]">Completadas</p>
                  <p className="text-xl font-bold text-[#f5f5f5]">{completedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#d4a039]/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-[#d4a039]" />
                </div>
                <div>
                  <p className="text-xs text-[#a0a0a0]">Ingresos hoy</p>
                  <p className="text-xl font-bold text-[#d4a039]">{formatPrice(todayRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-[#a0a0a0]">Ingresos del mes</p>
                  <p className="text-xl font-bold text-emerald-400">{formatPrice(monthlyRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-[#1f1f1f] border-[#2a2a2a] mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Popover open={adminCalendarOpen} onOpenChange={setAdminCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal bg-[#0a0a0a] border-[#2a2a2a] hover:bg-[#1f1f1f] hover:border-[#d4a039]/50 ${
                        filterDate ? 'text-[#f5f5f5]' : 'text-[#3a3a3a]'
                      }`}
                    >
                      <Calendar className="w-4 h-4 mr-2 text-[#d4a039]" />
                      {filterDate ? formatDate(filterDate) : 'Filtrar por fecha...'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#1f1f1f] border-[#2a2a2a]" align="start">
                    <ShadcnCalendar
                      mode="single"
                      selected={filterDate ? new Date(filterDate + 'T12:00:00') : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
                          setFilterDate(dateStr)
                        } else {
                          setFilterDate('')
                        }
                        setAdminCalendarOpen(false)
                      }}
                      locale={es}
                      classNames={{
                        months: 'flex gap-4 flex-col',
                        month: 'flex flex-col w-full gap-4',
                        month_caption: 'flex items-center justify-center h-9 w-full px-8',
                        caption_label: 'text-sm font-medium text-[#f5f5f5]',
                        nav: 'flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between px-1',
                        button_previous: 'size-9 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md text-[#a0a0a0] hover:text-[#f5f5f5] hover:bg-[#2a2a2a]',
                        button_next: 'size-9 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md text-[#a0a0a0] hover:text-[#f5f5f5] hover:bg-[#2a2a2a]',
                        weekdays: 'flex',
                        weekday: 'text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none text-[#a0a0a0]',
                        week: 'flex w-full mt-2',
                        day: 'relative w-full h-full p-0 text-center aspect-square select-none group/day',
                        day_button: 'size-auto w-full min-w-8 flex aspect-square flex-col gap-1 leading-none font-normal rounded-lg text-[#a0a0a0] hover:bg-[#2a2a2a] hover:text-[#f5f5f5] transition-all',
                        selected: 'bg-[#d4a039] text-[#0a0a0a] rounded-lg hover:bg-[#c49030] hover:text-[#0a0a0a] font-bold',
                        today: 'bg-[#2a2a2a] text-[#d4a039] rounded-md',
                        disabled: 'text-[#3a3a3a] opacity-50 cursor-not-allowed hover:bg-transparent hover:text-[#3a3a3a]',
                        outside: 'text-[#3a3a3a] aria-selected:text-[#3a3a3a]',
                        hidden: 'invisible',
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-[#0a0a0a] border-[#2a2a2a] text-[#f5f5f5] w-full sm:w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="bg-[#1f1f1f] border-[#2a2a2a]">
                  <SelectItem value="all" className="text-[#f5f5f5]">Todos</SelectItem>
                  <SelectItem value="pending" className="text-[#f5f5f5]">Pendiente</SelectItem>
                  <SelectItem value="confirmed" className="text-[#f5f5f5]">Confirmada</SelectItem>
                  <SelectItem value="completed" className="text-[#f5f5f5]">Completada</SelectItem>
                  <SelectItem value="cancelled" className="text-[#f5f5f5]">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => { setFilterDate(''); setFilterStatus('all') }}
                variant="outline"
                size="sm"
                className="border-[#2a2a2a] text-[#a0a0a0] hover:text-[#f5f5f5]"
              >
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#f5f5f5] text-lg">Citas ({appointments.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-[#a0a0a0]">
                <div className="animate-spin w-6 h-6 border-2 border-[#d4a039] border-t-transparent rounded-full mx-auto mb-2" />
                Cargando citas...
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-8 text-center text-[#a0a0a0]">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No hay citas registradas</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[500px]">
                <div className="divide-y divide-[#2a2a2a]">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-4 hover:bg-[#2a2a2a]/30 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-[#f5f5f5] text-sm truncate">{apt.customerName}</p>
                            <StatusBadge status={apt.status} />
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#a0a0a0]">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {apt.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(apt.time)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {apt.customerPhone}
                            </span>
                          </div>
                          <div className="text-xs text-[#a0a0a0] mt-1">
                            {apt.services.map((s) => s.service.name).join(', ')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[#d4a039] font-bold text-sm">{formatPrice(apt.totalPrice)}</span>
                          <Dialog open={detailOpen && selectedAppointment?.id === apt.id} onOpenChange={(open) => {
                            if (!open) setDetailOpen(false)
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-[#a0a0a0] hover:text-[#f5f5f5]"
                                onClick={() => { setSelectedAppointment(apt); setDetailOpen(true) }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#1f1f1f] border-[#2a2a2a] max-w-md">
                              <DialogHeader>
                                <DialogTitle className="text-[#f5f5f5]">Detalle de Cita</DialogTitle>
                              </DialogHeader>
                              {selectedAppointment && (
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2">
                                    <StatusBadge status={selectedAppointment.status} />
                                  </div>
                                  <div className="space-y-3 bg-[#0a0a0a] rounded-lg p-4">
                                    <div className="flex justify-between">
                                      <span className="text-[#a0a0a0] text-sm">Cliente</span>
                                      <span className="text-[#f5f5f5] text-sm font-medium">{selectedAppointment.customerName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[#a0a0a0] text-sm">Teléfono</span>
                                      <span className="text-[#f5f5f5] text-sm font-medium">{selectedAppointment.customerPhone}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[#a0a0a0] text-sm">Email</span>
                                      <span className="text-[#f5f5f5] text-sm font-medium break-all">{selectedAppointment.customerEmail}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[#a0a0a0] text-sm">Fecha</span>
                                      <span className="text-[#f5f5f5] text-sm font-medium">{formatDate(selectedAppointment.date)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[#a0a0a0] text-sm">Hora</span>
                                      <span className="text-[#f5f5f5] text-sm font-medium">{formatTime(selectedAppointment.time)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[#a0a0a0] text-sm">Personas</span>
                                      <span className="text-[#f5f5f5] text-sm font-medium">{selectedAppointment.numberOfPeople}</span>
                                    </div>
                                    <Separator className="bg-[#2a2a2a]" />
                                    <div>
                                      <span className="text-[#a0a0a0] text-sm">Servicios</span>
                                      <div className="mt-2 space-y-1">
                                        {selectedAppointment.services.map((s) => (
                                          <div key={s.id} className="flex justify-between">
                                            <span className="text-[#f5f5f5] text-sm">{s.service.name}</span>
                                            <span className="text-[#d4a039] text-sm">{formatPrice(s.price)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <Separator className="bg-[#2a2a2a]" />
                                    <div className="flex justify-between">
                                      <span className="text-[#d4a039] font-bold">Total</span>
                                      <span className="text-[#d4a039] font-bold">{formatPrice(selectedAppointment.totalPrice)}</span>
                                    </div>
                                    {selectedAppointment.notes && (
                                      <>
                                        <Separator className="bg-[#2a2a2a]" />
                                        <div>
                                          <span className="text-[#a0a0a0] text-sm">Notas</span>
                                          <p className="text-[#f5f5f5] text-sm mt-1">{selectedAppointment.notes}</p>
                                        </div>
                                      </>
                                    )}
                                  </div>

                                  {/* Actions */}
                                  <div className="flex flex-wrap gap-2">
                                    {selectedAppointment.status !== 'pending' && (
                                      <Button
                                        onClick={() => updateStatus(selectedAppointment.id, 'pending')}
                                        size="sm"
                                        variant="outline"
                                        className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                                      >
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        Pendiente
                                      </Button>
                                    )}
                                    {selectedAppointment.status !== 'confirmed' && (
                                      <Button
                                        onClick={() => updateStatus(selectedAppointment.id, 'confirmed')}
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        <Check className="w-4 h-4 mr-1" />
                                        Confirmar
                                      </Button>
                                    )}
                                    {selectedAppointment.status !== 'completed' && (
                                      <Button
                                        onClick={() => updateStatus(selectedAppointment.id, 'completed')}
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                      >
                                        <TrendingUp className="w-4 h-4 mr-1" />
                                        Completar
                                      </Button>
                                    )}
                                    {selectedAppointment.status !== 'cancelled' && (
                                      <Button
                                        onClick={() => updateStatus(selectedAppointment.id, 'cancelled')}
                                        size="sm"
                                        variant="outline"
                                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                      >
                                        <X className="w-4 h-4 mr-1" />
                                        Cancelar
                                      </Button>
                                    )}
                                    <Button
                                      onClick={() => sendWhatsApp(selectedAppointment)}
                                      size="sm"
                                      className="bg-green-500 hover:bg-green-600 text-white"
                                    >
                                      <MessageCircle className="w-4 h-4 mr-1" />
                                      WhatsApp
                                    </Button>
                                    <Button
                                      onClick={() => deleteAppointment(selectedAppointment.id)}
                                      size="sm"
                                      variant="outline"
                                      className="border-[#2a2a2a] text-[#a0a0a0] hover:text-red-400 hover:border-red-500/30"
                                    >
                                      <Trash2 className="w-4 h-4 mr-1" />
                                      Eliminar
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {/* Quick actions */}
                          {apt.status !== 'pending' && (
                            <Button
                              onClick={() => updateStatus(apt.id, 'pending')}
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                              title="Pendiente"
                            >
                              <AlertCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {apt.status !== 'confirmed' && (
                            <Button
                              onClick={() => updateStatus(apt.id, 'confirmed')}
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                              title="Confirmar"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          {apt.status !== 'completed' && (
                            <Button
                              onClick={() => updateStatus(apt.id, 'completed')}
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                              title="Completar"
                            >
                              <TrendingUp className="w-4 h-4" />
                            </Button>
                          )}
                          {apt.status !== 'cancelled' && (
                            <Button
                              onClick={() => updateStatus(apt.id, 'cancelled')}
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            onClick={() => sendWhatsApp(apt)}
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ==================== MAIN PAGE ====================
export default function Home() {
  const [currentView, setCurrentView] = useState<View>('home')
  const { mode, toggleMode } = useThemeMode()

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header currentView={currentView} setView={setCurrentView} mode={mode} toggleMode={toggleMode} />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <HomeView setView={setCurrentView} />
            </motion.div>
          )}
          {currentView === 'booking' && (
            <motion.div
              key="booking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <BookingView setView={setCurrentView} />
            </motion.div>
          )}
          {currentView === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AdminView setView={setCurrentView} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
