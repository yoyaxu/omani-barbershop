'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle, MapPin, Clock, Instagram, Phone,
  ChevronDown, Menu, X, Scissors, Star, CalendarDays,
  CheckCircle2, ArrowRight
} from 'lucide-react'
import { DatePickerField } from '@/components/DatePickerField'

interface Service {
  id: string
  name: string
  price: number
  duration: number
  description?: string
}

interface GalleryImage {
  id: string
  url: string
  caption?: string
}

interface Shop {
  id: string
  name: string
  slug: string
  description?: string
  whatsappNumber: string
  instagram?: string
  facebook?: string
  address?: string
  googleMapsUrl?: string
  openingTime: string
  closingTime: string
  themeColor: string
  logoUrl?: string
  heroImageUrl?: string
}

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM'
]

export default function ShopPage() {
  const params = useParams()
  const slug = params.slug as string

  const [shop, setShop] = useState<Shop | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [gallery, setGallery] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Booking state
  const [selectedService, setSelectedService] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerNotes, setCustomerNotes] = useState('')
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  // Mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Fetch shop data
  useEffect(() => {
    async function loadShop() {
      try {
        const res = await fetch(`/api/shops/${slug}`)
        if (!res.ok) throw new Error('Barbería no encontrada')
        const data = await res.json()
        setShop(data.shop)
        setServices(data.services || [])
        setGallery(data.gallery || [])
      } catch (err: any) {
        setError(err.message || 'Error al cargar la barbería')
      } finally {
        setLoading(false)
      }
    }
    if (slug) loadShop()
  }, [slug])

  // Fetch availability when date changes
  useEffect(() => {
    async function checkAvailability() {
      if (!selectedDate || !shop) return
      try {
        const res = await fetch(`/api/appointments/availability?shopId=${shop.id}&date=${selectedDate}`)
        const data = await res.json()
        setBookedSlots(data.bookedSlots || [])
      } catch {
        setBookedSlots([])
      }
    }
    checkAvailability()
  }, [selectedDate, shop])

  const availableSlots = TIME_SLOTS.filter(t => !bookedSlots.includes(t))

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault()
    if (!shop || !selectedService || !selectedDate || !selectedTime || !customerName || !customerPhone) return

    setBookingStatus('submitting')
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: shop.id,
          name: customerName,
          phone: customerPhone,
          serviceId: selectedService,
          date: selectedDate,
          time: selectedTime,
          notes: customerNotes,
        }),
      })
      if (!res.ok) throw new Error('Error al crear la cita')
      setBookingStatus('success')
      setCustomerName('')
      setCustomerPhone('')
      setCustomerNotes('')
      setSelectedService('')
      setSelectedDate('')
      setSelectedTime('')
      // Refresh availability
      const availRes = await fetch(`/api/appointments/availability?shopId=${shop.id}&date=${selectedDate}`)
      const availData = await availRes.json()
      setBookedSlots(availData.bookedSlots || [])
    } catch {
      setBookingStatus('error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A853] mx-auto mb-4" />
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Scissors className="w-16 h-16 text-[#D4A853] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Barbería no encontrada</h1>
          <p className="text-gray-400">{error || 'La barbería que buscas no existe'}</p>
        </div>
      </div>
    )
  }

  const whatsappUrl = `https://wa.me/${shop.whatsappNumber.replace(/\D/g, '')}`
  const themeColor = shop.themeColor || '#D4A853'

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <Scissors className="w-6 h-6" style={{ color: themeColor }} />
            <span className="font-bold text-lg">{shop.name}</span>
          </a>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#inicio" className="hover:text-white/80 transition">Inicio</a>
            <a href="#servicios" className="hover:text-white/80 transition">Servicios</a>
            <a href="#galeria" className="hover:text-white/80 transition">Galería</a>
            <a href="#reservar" className="hover:text-white/80 transition">Reservar</a>
            <a href="#contacto" className="hover:text-white/80 transition">Contacto</a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-black"
              style={{ backgroundColor: themeColor }}
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#111] border-t border-white/10"
            >
              <div className="px-4 py-3 space-y-3">
                {['inicio', 'servicios', 'galeria', 'reservar', 'contacto'].map(item => (
                  <a key={item} href={`#${item}`} onClick={() => setMobileMenuOpen(false)}
                    className="block text-gray-300 hover:text-white capitalize">{item}</a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0a0a0a]" />
        <div className="absolute inset-0" style={{
          backgroundImage: shop.heroImageUrl ? `url(${shop.heroImageUrl})` : 'url(https://images.unsplash.com/photo-1585747860019-8e8ef5011890?w=1920)',
          backgroundSize: 'cover', backgroundPosition: 'center'
        }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Scissors className="w-16 h-16 mx-auto mb-6" style={{ color: themeColor }} />
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{shop.name}</h1>
            {shop.description && <p className="text-lg text-gray-300 mb-8">{shop.description}</p>}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#reservar" className="px-8 py-3 rounded-full font-semibold text-black flex items-center justify-center gap-2"
                style={{ backgroundColor: themeColor }}>
                <CalendarDays className="w-5 h-5" /> Reservar Cita
              </a>
              <a href={whatsappUrl} target="_blank"
                className="px-8 py-3 rounded-full font-semibold border border-white/30 hover:bg-white/10 flex items-center justify-center gap-2 transition">
                <MessageCircle className="w-5 h-5" /> WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </div>
      </section>

      {/* Services */}
      <section id="servicios" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Nuestros <span style={{ color: themeColor }}>Servicios</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true }}
                className="bg-[#111] rounded-2xl p-6 border border-white/10 hover:border-white/20 transition group">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${themeColor}20` }}>
                  <Scissors className="w-6 h-6" style={{ color: themeColor }} />
                </div>
                <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                {service.description && <p className="text-gray-400 text-sm mb-3">{service.description}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold" style={{ color: themeColor }}>RD${service.price}</span>
                  <span className="text-sm text-gray-500">{service.duration} min</span>
                </div>
              </motion.div>
            ))}
          </div>
          {services.length === 0 && (
            <p className="text-center text-gray-500">Próximamente nuestros servicios</p>
          )}
        </div>
      </section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <section id="galeria" className="py-20 px-4 bg-[#080808]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Nuestra <span style={{ color: themeColor }}>Galería</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((img, i) => (
                <motion.div key={img.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }} viewport={{ once: true }}
                  className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer">
                  <img src={img.url} alt={img.caption || shop.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    {shop.instagram && (
                      <a href={`https://instagram.com/${shop.instagram.replace('@', '')}`} target="_blank"
                        className="text-white flex items-center gap-2">
                        <Instagram className="w-6 h-6" /> Ver en Instagram
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Booking */}
      <section id="reservar" className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Reserva tu <span style={{ color: themeColor }}>Cita</span></h2>

          {bookingStatus === 'success' ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 bg-[#111] rounded-2xl border border-green-500/30">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">¡Cita Reservada!</h3>
              <p className="text-gray-400 mb-6">Te contactaremos para confirmar tu cita.</p>
              <button onClick={() => setBookingStatus('idle')}
                className="px-6 py-2 rounded-full font-medium text-black" style={{ backgroundColor: themeColor }}>
                Reservar otra cita
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleBooking} className="bg-[#111] rounded-2xl p-6 md:p-8 border border-white/10 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre completo</label>
                <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg focus:border-[#D4A853] focus:outline-none transition"
                  placeholder="Tu nombre" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Teléfono</label>
                <input type="tel" required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg focus:border-[#D4A853] focus:outline-none transition"
                  placeholder="809-000-0000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Servicio</label>
                <select required value={selectedService} onChange={e => setSelectedService(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg focus:border-[#D4A853] focus:outline-none transition">
                  <option value="">Selecciona un servicio</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - RD${s.price}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Fecha</label>
                <DatePickerField value={selectedDate} onChange={setSelectedDate} />
              </div>
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Hora</label>
                  {availableSlots.length === 0 ? (
                    <p className="text-yellow-500 text-sm">No hay horarios disponibles para esta fecha</p>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {availableSlots.map(time => (
                        <button key={time} type="button" onClick={() => setSelectedTime(time)}
                          className={`px-3 py-2 text-sm rounded-lg border transition ${selectedTime === time
                            ? 'text-black font-medium border-transparent'
                            : 'border-white/10 hover:border-white/30 text-gray-300'
                          }`}
                          style={selectedTime === time ? { backgroundColor: themeColor } : {}}>
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Notas (opcional)</label>
                <textarea value={customerNotes} onChange={e => setCustomerNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg focus:border-[#D4A853] focus:outline-none transition resize-none"
                  rows={3} placeholder="Algún detalle adicional..." />
              </div>
              <button type="submit" disabled={bookingStatus === 'submitting' || !selectedTime}
                className="w-full py-3 rounded-full font-semibold text-black flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: themeColor }}>
                {bookingStatus === 'submitting' ? (
                  <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black" /> Reservando...</>
                ) : (
                  <><CalendarDays className="w-5 h-5" /> Reservar Cita</>
                )}
              </button>
              {bookingStatus === 'error' && (
                <p className="text-red-400 text-sm text-center">Error al reservar. Intenta de nuevo.</p>
              )}
            </form>
          )}
        </div>
      </section>

      {/* Contact */}
      <section id="contacto" className="py-20 px-4 bg-[#080808]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Contáctanos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href={whatsappUrl} target="_blank"
              className="bg-[#111] rounded-2xl p-6 border border-white/10 hover:border-white/20 transition text-center group">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${themeColor}20` }}>
                <MessageCircle className="w-7 h-7" style={{ color: themeColor }} />
              </div>
              <h3 className="font-bold mb-1">WhatsApp</h3>
              <p className="text-gray-400 text-sm">{shop.whatsappNumber}</p>
            </a>
            {shop.address && (
              <a href={shop.googleMapsUrl || '#'} target="_blank"
                className="bg-[#111] rounded-2xl p-6 border border-white/10 hover:border-white/20 transition text-center group">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${themeColor}20` }}>
                  <MapPin className="w-7 h-7" style={{ color: themeColor }} />
                </div>
                <h3 className="font-bold mb-1">Ubicación</h3>
                <p className="text-gray-400 text-sm">{shop.address}</p>
              </a>
            )}
            <div className="bg-[#111] rounded-2xl p-6 border border-white/10 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${themeColor}20` }}>
                <Clock className="w-7 h-7" style={{ color: themeColor }} />
              </div>
              <h3 className="font-bold mb-1">Horario</h3>
              <p className="text-gray-400 text-sm">{shop.openingTime} - {shop.closingTime}</p>
              <p className="text-gray-500 text-xs mt-1">Lunes a Sábado</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5" style={{ color: themeColor }} />
            <span className="font-bold">{shop.name}</span>
          </div>
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} {shop.name}. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a href={whatsappUrl} target="_blank"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"
        style={{ backgroundColor: '#25D366' }}>
        <MessageCircle className="w-7 h-7 text-white" />
      </a>
    </div>
  )
}
