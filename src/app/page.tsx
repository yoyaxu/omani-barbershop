'use client'

import { motion } from 'framer-motion'
import { Scissors, MessageCircle, CalendarDays, Settings, Globe, Shield, ArrowRight, Star } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Shop {
  id: string
  name: string
  slug: string
  description?: string
  whatsappNumber: string
  themeColor: string
  isActive: boolean
}

export default function PlatformLanding() {
  const [shops, setShops] = useState<Shop[]>([])

  useEffect(() => {
    // Load public shop list
    fetch('/api/shops/public')
      .then(res => res.ok ? res.json() : { shops: [] })
      .then(data => setShops(data.shops || []))
      .catch(() => setShops([]))
  }, [])

  const features = [
    {
      icon: CalendarDays,
      title: 'Reservas Online',
      desc: 'Tus clientes reservan 24/7 desde tu página web. Sin llamadas, sin esperas.',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Integrado',
      desc: 'Notificaciones automáticas por WhatsApp cuando alguien reserva una cita.',
    },
    {
      icon: Settings,
      title: 'Panel Administrativo',
      desc: 'Gestiona citas, servicios, horarios y configuración desde cualquier dispositivo.',
    },
    {
      icon: Globe,
      title: 'Tu Propio Dominio',
      desc: 'Usa tu dominio personalizado o un subdominio de nuestra plataforma.',
    },
    {
      icon: Shield,
      title: 'Datos Protegidos',
      desc: 'Base de datos propia y segura. Tus datos y los de tus clientes están protegidos.',
    },
    {
      icon: Star,
      title: 'Sin Comisiones',
      desc: 'Paga una sola vez. Sin comisiones por reserva, sin suscripciones mensuales.',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-7 h-7 text-[#D4A853]" />
            <span className="font-bold text-xl">BarberDo</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#barberias" className="hidden md:block text-sm text-gray-300 hover:text-white transition">Barberías</a>
            <a href="#caracteristicas" className="hidden md:block text-sm text-gray-300 hover:text-white transition">Características</a>
            <a href="#precios" className="hidden md:block text-sm text-gray-300 hover:text-white transition">Precios</a>
            <a href="/super-admin" className="text-sm text-gray-400 hover:text-white transition">Admin</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-[#D4A853]/5 via-transparent to-[#0a0a0a]" />
        <div className="relative z-10 text-center max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Scissors className="w-20 h-20 mx-auto mb-8 text-[#D4A853]" />
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              Tu barbería<br />
              <span className="text-[#D4A853]">en línea</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Página web profesional con reservas online, WhatsApp integrado y panel administrativo.
              Hecho en República Dominicana, para barberías dominicanas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#precios" className="px-8 py-4 rounded-full font-semibold text-black bg-[#D4A853] hover:bg-[#c49a48] transition flex items-center justify-center gap-2">
                Comenzar ahora <ArrowRight className="w-5 h-5" />
              </a>
              <a href="#barberias" className="px-8 py-4 rounded-full font-semibold border border-white/20 hover:bg-white/5 transition flex items-center justify-center gap-2">
                Ver barberías
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="caracteristicas" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Todo lo que tu barbería <span className="text-[#D4A853]">necesita</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div key={feat.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true }}
                className="bg-[#111] rounded-2xl p-6 border border-white/10 hover:border-[#D4A853]/30 transition">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#D4A853]/10">
                  <feat.icon className="w-6 h-6 text-[#D4A853]" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
                <p className="text-gray-400 text-sm">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Shops */}
      {shops.length > 0 && (
        <section id="barberias" className="py-20 px-4 bg-[#080808]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Barberías en <span className="text-[#D4A853]">la plataforma</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops.filter(s => s.isActive).map(shop => (
                <a key={shop.id} href={`/shop/${shop.slug}`}
                  className="bg-[#111] rounded-2xl p-6 border border-white/10 hover:border-white/20 transition group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${shop.themeColor}20` }}>
                      <Scissors className="w-5 h-5" style={{ color: shop.themeColor }} />
                    </div>
                    <h3 className="font-bold">{shop.name}</h3>
                  </div>
                  {shop.description && <p className="text-gray-400 text-sm mb-3">{shop.description}</p>}
                  <span className="text-[#D4A853] text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    Ver barbería <ArrowRight className="w-4 h-4" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      <section id="precios" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Precio <span className="text-[#D4A853]">único</span>
          </h2>
          <p className="text-gray-400 text-center mb-12">Sin suscripciones. Sin comisiones. Pagas una vez y es tuyo.</p>
          <div className="bg-[#111] rounded-2xl border border-[#D4A853]/30 p-8 md:p-10 text-center">
            <div className="mb-6">
              <span className="text-gray-400 text-sm uppercase tracking-wider">Sitio Web Completo</span>
              <div className="mt-2">
                <span className="text-5xl md:text-6xl font-bold text-[#D4A853]">RD$45,000</span>
              </div>
              <p className="text-gray-500 text-sm mt-1">Pago único · Incluye todo</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-8 max-w-md mx-auto">
              {[
                'Página web personalizada',
                'Sistema de reservas online',
                'WhatsApp integrado',
                'Panel administrativo',
                'Hasta 10 servicios',
                'Galería de fotos',
                'Tu propio dominio',
                'Soporte incluido',
              ].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <div className="w-5 h-5 rounded-full bg-[#D4A853]/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#D4A853]" />
                  </div>
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>
            <a href="https://wa.me/8293196108" target="_blank"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-black bg-[#D4A853] hover:bg-[#c49a48] transition">
              <MessageCircle className="w-5 h-5" /> Contáctanos por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#D4A853]" />
            <span className="font-bold">BarberDo</span>
          </div>
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} BarberDo. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
