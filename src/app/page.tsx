"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import {
  Scissors,
  Clock,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Star,
  ChevronDown,
  MessageCircle,
  CalendarDays,
  User,
  CheckCircle2,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

// ─── Config ──────────────────────────────────────────────────────
const WHATSAPP_NUMBER = "18095551234"; // Update with real number
const INSTAGRAM_URL = "https://www.instagram.com/omani_barbershop/";
const FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=100054503348727";
const BARBERSHOP_NAME = "Omani Barbershop";

const SERVICES = [
  {
    id: "corte",
    name: "Corte de Cabello",
    price: "250",
    duration: "30 min",
    description:
      "Corte personalizado con el estilo que te identifica. Desde clásicos hasta los más modernos fades y diseños.",
    image: "/service-corte.jpg",
  },
  {
    id: "barba",
    name: "Afeitada & Barba",
    price: "200",
    duration: "25 min",
    description:
      "Perfilado y afeitada profesional con navaja y toalla caliente. Tu barba en las mejores manos.",
    image: "/service-barba.jpg",
  },
  {
    id: "styling",
    name: "Styling & Diseño",
    price: "300",
    duration: "40 min",
    description:
      "Diseños artísticos, lineups y estilismo con productos premium. Destaca con un look único.",
    image: "/service-styling.jpg",
  },
  {
    id: "combo",
    name: "Combo Corte + Barba",
    price: "400",
    duration: "50 min",
    description:
      "El paquete completo: corte de cabello más afeitada y perfilado de barba. La experiencia Omani completa.",
    image: "/service-facial.jpg",
  },
];

const GALLERY_IMAGES = [
  { src: "/gallery-1.jpg", alt: "Fade corte profesional" },
  { src: "/gallery-2.jpg", alt: "Diseño artístico de cabello" },
  { src: "/gallery-3.jpg", alt: "Perfilado de barba" },
  { src: "/gallery-4.jpg", alt: "Corte clásico caballero" },
  { src: "/gallery-5.jpg", alt: "Taper fade detallado" },
  { src: "/gallery-6.jpg", alt: "Corte para niños" },
];

const ALL_TIME_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
];

const REVIEWS = [
  {
    name: "Carlos M.",
    text: "El mejor barbero de la zona, siempre salgo satisfecho. 100% recomendado!",
    rating: 5,
  },
  {
    name: "Miguel R.",
    text: "Omani es un crack, el mejor corte que me han dado. Ambiente increíble.",
    rating: 5,
  },
  {
    name: "José L.",
    text: "Puntual, profesional y con un talento increíble. No cambio a Omani por nada.",
    rating: 5,
  },
];

// ─── Animated Section Wrapper ────────────────────────────────────
function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function HomePage() {
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [whatsappNotifyUrl, setWhatsappNotifyUrl] = useState<string | null>(null);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    service: "",
    date: "",
    time: "",
    notes: "",
  });

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Fetch available time slots when date changes
  const fetchAvailability = useCallback(async (date: string) => {
    if (!date) {
      setBookedTimes([]);
      return;
    }
    setLoadingAvailability(true);
    try {
      const res = await fetch(`/api/appointments/availability?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setBookedTimes(data.bookedTimes || []);
      }
    } catch {
      setBookedTimes([]);
    } finally {
      setLoadingAvailability(false);
    }
  }, []);

  useEffect(() => {
    if (form.date) {
      fetchAvailability(form.date);
      // Reset time if it's now booked
      setForm((prev) => {
        if (prev.time && bookedTimes.includes(prev.time)) {
          return { ...prev, time: "" };
        }
        return prev;
      });
    } else {
      setBookedTimes([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date, fetchAvailability]);

  // Filter available time slots
  const availableTimeSlots = ALL_TIME_SLOTS.filter(
    (t) => !bookedTimes.includes(t)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.service || !form.date || !form.time) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al reservar");
      const data = await res.json();
      setSubmitted(true);
      // Store WhatsApp notification URL for the owner
      if (data.whatsappNotificationUrl) {
        setWhatsappNotifyUrl(data.whatsappNotificationUrl);
      }
      toast({
        title: "Cita reservada",
        description: "Tu cita ha sido reservada exitosamente. Te contactaremos para confirmar.",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo reservar la cita. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}`, "_blank");
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  // Get today's date for min date
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Navbar ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => scrollTo("inicio")}
              className="flex items-center gap-2"
            >
              <Image
                src="/logo-omani.png"
                alt="Omani Barbershop Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-lg font-bold gold-text">
                {BARBERSHOP_NAME}
              </span>
            </button>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              {[
                { label: "Inicio", id: "inicio" },
                { label: "Servicios", id: "servicios" },
                { label: "Galería", id: "galeria" },
                { label: "Reservar", id: "reservar" },
                { label: "Contacto", id: "contacto" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <Button
                onClick={openWhatsApp}
                size="sm"
                className="bg-[#25D366] hover:bg-[#20bd5a] text-white"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                WhatsApp
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-foreground"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-md border-b border-border"
          >
            <div className="px-4 py-3 space-y-2">
              {[
                { label: "Inicio", id: "inicio" },
                { label: "Servicios", id: "servicios" },
                { label: "Galería", id: "galeria" },
                { label: "Reservar", id: "reservar" },
                { label: "Contacto", id: "contacto" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="block w-full text-left py-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <Button
                onClick={openWhatsApp}
                size="sm"
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white mt-2"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                WhatsApp
              </Button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ─── Hero Section ────────────────────────────────────────── */}
      <section
        id="inicio"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/hero-barbershop.jpg"
            alt="Omani Barbershop Interior"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          <div className="hero-overlay absolute inset-0" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Image
              src="/logo-omani.png"
              alt="Omani Barbershop"
              width={120}
              height={120}
              className="mx-auto mb-6 rounded-full border-2 border-primary/30 shadow-lg shadow-primary/20"
            />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 tracking-tight"
          >
            <span className="gold-text">{BARBERSHOP_NAME}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Tu barbería de confianza. Estilo, precisión y profesionalismo en cada
            corte.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 py-6"
                >
                  <CalendarDays className="w-5 h-5 mr-2" />
                  Reservar Cita
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-card border-border max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="gold-text text-2xl">
                    Reservar Cita
                  </DialogTitle>
                </DialogHeader>
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CheckCircle2 className="w-16 h-16 text-primary mb-4" />
                    <h3 className="text-xl font-bold mb-2">
                      Cita Reservada Exitosamente
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Te contactaremos para confirmar tu cita. También puedes
                      escribirnos por WhatsApp.
                    </p>
                    <Button
                      onClick={() => {
                        openWhatsApp();
                      }}
                      className="bg-[#25D366] hover:bg-[#20bd5a] text-white"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Confirmar por WhatsApp
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          name="name"
                          placeholder="Tu nombre"
                          value={form.name}
                          onChange={handleFormChange}
                          className="pl-10 bg-secondary border-border"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="(809) 555-1234"
                          value={form.phone}
                          onChange={handleFormChange}
                          className="pl-10 bg-secondary border-border"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service">Servicio *</Label>
                      <Select
                        value={form.service}
                        onValueChange={(value) =>
                          setForm((prev) => ({ ...prev, service: value }))
                        }
                      >
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue placeholder="Selecciona un servicio" />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICES.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name} - RD${s.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Fecha *</Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        min={today}
                        value={form.date}
                        onChange={handleFormChange}
                        className="bg-secondary border-border"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">
                        Hora *{" "}
                        {form.date && loadingAvailability && (
                          <span className="text-muted-foreground text-xs">(Verificando...)</span>
                        )}
                      </Label>
                      <Select
                        value={form.time}
                        onValueChange={(value) =>
                          setForm((prev) => ({ ...prev, time: value }))
                        }
                        disabled={!form.date || loadingAvailability}
                      >
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue
                            placeholder={
                              !form.date
                                ? "Selecciona una fecha primero"
                                : availableTimeSlots.length === 0
                                ? "No hay horarios disponibles"
                                : "Selecciona la hora"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTimeSlots.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                              No hay horarios disponibles para esta fecha
                            </div>
                          ) : (
                            availableTimeSlots.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {form.date && bookedTimes.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {bookedTimes.length} horario{bookedTimes.length > 1 ? "s" : ""} ya reservado{bookedTimes.length > 1 ? "s" : ""} • {availableTimeSlots.length} disponible{availableTimeSlots.length > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notas (opcional)</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        placeholder="Algo que debamos saber..."
                        value={form.notes}
                        onChange={handleFormChange}
                        className="bg-secondary border-border"
                        rows={3}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                      disabled={submitting || (form.date && availableTimeSlots.length === 0)}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Reservando...
                        </>
                      ) : (
                        <>
                          <CalendarDays className="w-4 h-4 mr-2" />
                          Confirmar Cita
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </DialogContent>
            </Dialog>

            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 font-semibold text-lg px-8 py-6"
              onClick={openWhatsApp}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp
            </Button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <button
              onClick={() => scrollTo("servicios")}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronDown className="w-8 h-8 animate-bounce" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── Services Section ────────────────────────────────────── */}
      <section id="servicios" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Nuestros <span className="gold-text">Servicios</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ofrecemos una variedad de servicios profesionales para que salgas
              luciendo y sintiéndote increíble.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((service, i) => (
              <AnimatedSection key={service.id} delay={i * 0.1}>
                <div className="service-card group rounded-xl border border-border bg-card overflow-hidden">
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-primary font-bold text-xl">
                        RD${service.price}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-white/80">
                        <Clock className="w-3.5 h-3.5" />
                        {service.duration}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-primary" />
                      {service.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {service.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Gallery Section ─────────────────────────────────────── */}
      <section id="galeria" className="py-20 px-4 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Nuestra <span className="gold-text">Galería</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Mira nuestros últimos trabajos y transformaciones. Cada corte es una
              obra de arte.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {GALLERY_IMAGES.map((img, i) => (
              <AnimatedSection key={img.src} delay={i * 0.1}>
                <div className="gallery-item relative aspect-[3/4] rounded-xl overflow-hidden group cursor-pointer">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                    <Instagram className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="text-center mt-10">
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
              onClick={() => window.open(INSTAGRAM_URL, "_blank")}
            >
              <Instagram className="w-4 h-4 mr-2" />
              Ver más en Instagram
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Reviews Section ─────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Lo que dicen nuestros <span className="gold-text">Clientes</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              La satisfacción de nuestros clientes es nuestra mayor motivación.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((review, i) => (
              <AnimatedSection key={review.name} delay={i * 0.15}>
                <div className="bg-card border border-border rounded-xl p-6 h-full flex flex-col">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Star
                        key={j}
                        className="w-5 h-5 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground flex-1 mb-4 italic">
                    &ldquo;{review.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-semibold text-sm">{review.name}</span>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Booking Section ─────────────────────────────────────── */}
      <section id="reservar" className="py-20 px-4 bg-secondary/30">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Reserva tu <span className="gold-text">Cita</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Agenda tu cita en minutos. Selecciona el servicio, fecha y hora que
              más te convenga.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="w-16 h-16 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">
                    Cita Reservada Exitosamente
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Te contactaremos para confirmar tu cita. También puedes
                    escribirnos por WhatsApp.
                  </p>
                  <Button
                    onClick={openWhatsApp}
                    className="bg-[#25D366] hover:bg-[#20bd5a] text-white"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Confirmar por WhatsApp
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="booking-name">Nombre *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="booking-name"
                          name="name"
                          placeholder="Tu nombre completo"
                          value={form.name}
                          onChange={handleFormChange}
                          className="pl-10 bg-secondary border-border"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="booking-phone">Teléfono *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="booking-phone"
                          name="phone"
                          type="tel"
                          placeholder="(809) 555-1234"
                          value={form.phone}
                          onChange={handleFormChange}
                          className="pl-10 bg-secondary border-border"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="booking-service">Servicio *</Label>
                    <Select
                      value={form.service}
                      onValueChange={(value) =>
                        setForm((prev) => ({ ...prev, service: value }))
                      }
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Selecciona un servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICES.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} - RD${s.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="booking-date">Fecha *</Label>
                      <Input
                        id="booking-date"
                        name="date"
                        type="date"
                        min={today}
                        value={form.date}
                        onChange={handleFormChange}
                        className="bg-secondary border-border"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="booking-time">
                        Hora *{" "}
                        {form.date && loadingAvailability && (
                          <span className="text-muted-foreground text-xs">(Verificando...)</span>
                        )}
                      </Label>
                      <Select
                        value={form.time}
                        onValueChange={(value) =>
                          setForm((prev) => ({ ...prev, time: value }))
                        }
                        disabled={!form.date || loadingAvailability}
                      >
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue
                            placeholder={
                              !form.date
                                ? "Selecciona una fecha primero"
                                : availableTimeSlots.length === 0
                                ? "No hay horarios disponibles"
                                : "Selecciona la hora"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTimeSlots.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                              No hay horarios disponibles para esta fecha
                            </div>
                          ) : (
                            availableTimeSlots.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {form.date && bookedTimes.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {bookedTimes.length} horario{bookedTimes.length > 1 ? "s" : ""} ya reservado{bookedTimes.length > 1 ? "s" : ""} • {availableTimeSlots.length} disponible{availableTimeSlots.length > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="booking-notes">
                      Notas adicionales (opcional)
                    </Label>
                    <Textarea
                      id="booking-notes"
                      name="notes"
                      placeholder="Ej: Prefiero un fade bajo, tengo el pelo rizado..."
                      value={form.notes}
                      onChange={handleFormChange}
                      className="bg-secondary border-border"
                      rows={3}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="submit"
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
                      disabled={submitting || (form.date && availableTimeSlots.length === 0)}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Reservando...
                        </>
                      ) : (
                        <>
                          <CalendarDays className="w-4 h-4 mr-2" />
                          Confirmar Cita
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 py-6"
                      onClick={openWhatsApp}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Reservar por WhatsApp
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Contact Section ─────────────────────────────────────── */}
      <section id="contacto" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              <span className="gold-text">Contáctanos</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Estamos aquí para ti. Escríbenos, llámanos o visítanos.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* WhatsApp */}
              <button
                onClick={openWhatsApp}
                className="bg-card border border-border rounded-xl p-6 text-left hover:border-[#25D366] transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-[#25D366]/20 flex items-center justify-center mb-4 group-hover:bg-[#25D366]/30 transition-colors">
                  <MessageCircle className="w-6 h-6 text-[#25D366]" />
                </div>
                <h3 className="font-bold text-lg mb-1">WhatsApp</h3>
                <p className="text-muted-foreground text-sm">
                  Escríbenos para agendar tu cita o hacer cualquier consulta.
                </p>
              </button>

              {/* Location */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-1">Ubicación</h3>
                <p className="text-muted-foreground text-sm">
                  República Dominicana
                </p>
              </div>

              {/* Hours */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-1">Horario</h3>
                <p className="text-muted-foreground text-sm">
                  Lunes a Sábado: 9:00 AM - 8:00 PM
                  <br />
                  Domingo: Cerrado
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Social Media */}
          <AnimatedSection className="mt-10">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                className="border-border hover:border-pink-500 hover:text-pink-500"
                onClick={() => window.open(INSTAGRAM_URL, "_blank")}
              >
                <Instagram className="w-4 h-4 mr-2" />
                Instagram
              </Button>
              <Button
                variant="outline"
                className="border-border hover:border-blue-500 hover:text-blue-500"
                onClick={() => window.open(FACEBOOK_URL, "_blank")}
              >
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-secondary/50 border-t border-border py-8 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-omani.png"
              alt="Omani Barbershop"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="font-bold gold-text">{BARBERSHOP_NAME}</span>
          </div>
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} {BARBERSHOP_NAME}. Todos los
            derechos reservados.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open(INSTAGRAM_URL, "_blank")}
              className="text-muted-foreground hover:text-pink-500 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.open(FACEBOOK_URL, "_blank")}
              className="text-muted-foreground hover:text-blue-500 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </button>
            <button
              onClick={openWhatsApp}
              className="text-muted-foreground hover:text-[#25D366] transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </footer>

      {/* ─── Floating WhatsApp Button ─────────────────────────────── */}
      <button
        onClick={openWhatsApp}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] rounded-full flex items-center justify-center shadow-lg whatsapp-pulse transition-colors"
        aria-label="WhatsApp"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}
