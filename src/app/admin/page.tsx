"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CalendarCheck,
  User,
  Phone,
  Scissors,
  Clock,
  MessageCircle,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  ShieldCheck,
  LogOut,
  Pencil,
  Save,
  X,
  Plus,
  CalendarPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import Image from "next/image";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────
interface Appointment {
  id: string;
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes: string | null;
  status: string;
  createdAt: string;
}

const SERVICE_NAMES: Record<string, string> = {
  corte: "Corte de Cabello",
  barba: "Afeitada & Barba",
  styling: "Styling & Diseño",
  combo: "Combo Corte + Barba",
};

const SERVICES_LIST = [
  { id: "corte", name: "Corte de Cabello" },
  { id: "barba", name: "Afeitada & Barba" },
  { id: "styling", name: "Styling & Diseño" },
  { id: "combo", name: "Combo Corte + Barba" },
];

const TIME_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM",
];

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pendiente",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  confirmed: {
    label: "Confirmada",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  completed: {
    label: "Completada",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  cancelled: {
    label: "Cancelada",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

// ─── Login Component ──────────────────────────────────────────────
function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
        return;
      }

      onLogin();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image
            src="/logo-omani.png"
            alt="Omani Barbershop"
            width={80}
            height={80}
            className="mx-auto mb-4 rounded-full border-2 border-primary/30"
          />
          <h1 className="text-2xl font-bold gold-text mb-1">
            Admin Panel
          </h1>
          <p className="text-muted-foreground text-sm">
            Omani Barbershop - Panel de Administración
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-secondary border-border"
              required
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Contraseña por defecto: <code className="text-primary">omani2024</code>
        </p>
      </div>
    </div>
  );
}

// ─── Create Appointment Component ─────────────────────────────────
function CreateAppointmentForm({
  onSave,
  onCancel,
}: {
  onSave: (data: Omit<Appointment, "id" | "status" | "createdAt">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    service: "",
    date: "",
    time: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  // Fetch availability when date changes
  useEffect(() => {
    if (form.date) {
      fetch(`/api/appointments/availability?date=${form.date}`)
        .then((res) => res.json())
        .then((data) => setBookedTimes(data.bookedTimes || []))
        .catch(() => setBookedTimes([]));
    } else {
      setBookedTimes([]);
    }
  }, [form.date]);

  const availableSlots = TIME_SLOTS.filter((t) => !bookedTimes.includes(t));

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.service || !form.date || !form.time) {
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-card border border-primary/30 rounded-xl p-5 space-y-4">
      <h3 className="text-base font-bold text-primary flex items-center gap-2">
        <CalendarPlus className="w-4 h-4" />
        Agendar Cita Manualmente
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Nombre *</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Nombre del cliente"
            className="h-9 text-sm bg-secondary border-border"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Teléfono *</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            placeholder="(809) 555-1234"
            type="tel"
            className="h-9 text-sm bg-secondary border-border"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Servicio *</Label>
        <Select
          value={form.service}
          onValueChange={(v) => setForm((p) => ({ ...p, service: v }))}
        >
          <SelectTrigger className="h-9 text-sm bg-secondary border-border">
            <SelectValue placeholder="Selecciona un servicio" />
          </SelectTrigger>
          <SelectContent>
            {SERVICES_LIST.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Fecha *</Label>
          <Input
            type="date"
            min={today}
            value={form.date}
            onChange={(e) => {
              setForm((p) => ({ ...p, date: e.target.value, time: "" }));
            }}
            className="h-9 text-sm bg-secondary border-border"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Hora *</Label>
          <Select
            value={form.time}
            onValueChange={(v) => setForm((p) => ({ ...p, time: v }))}
            disabled={!form.date}
          >
            <SelectTrigger className="h-9 text-sm bg-secondary border-border">
              <SelectValue
                placeholder={
                  !form.date
                    ? "Fecha primero"
                    : availableSlots.length === 0
                    ? "Sin disponibilidad"
                    : "Selecciona hora"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {availableSlots.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                  No hay horarios disponibles
                </div>
              ) : (
                availableSlots.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {form.date && bookedTimes.length > 0 && (
            <p className="text-[10px] text-muted-foreground">
              {availableSlots.length} disponible{availableSlots.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Notas</Label>
        <Textarea
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          className="text-sm bg-secondary border-border"
          rows={2}
          placeholder="Notas opcionales..."
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={handleSave}
          disabled={saving || !form.name || !form.phone || !form.service || !form.date || !form.time}
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5 mr-1" />
          )}
          Crear Cita
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-muted-foreground"
          onClick={onCancel}
        >
          <X className="w-3.5 h-3.5 mr-1" />
          Cancelar
        </Button>
      </div>
    </div>
  );
}

// ─── Edit Appointment Component ───────────────────────────────────
function EditAppointmentForm({
  appointment,
  onSave,
  onCancel,
}: {
  appointment: Appointment;
  onSave: (data: Partial<Appointment>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: appointment.name,
    phone: appointment.phone,
    service: appointment.service,
    date: appointment.date,
    time: appointment.time,
    notes: appointment.notes || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-background/50 border border-primary/20 rounded-xl p-4 space-y-3">
      <h4 className="text-sm font-bold text-primary flex items-center gap-1">
        <Pencil className="w-3.5 h-3.5" />
        Editar Cita
      </h4>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Nombre</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="h-8 text-sm bg-secondary border-border"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Teléfono</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            className="h-8 text-sm bg-secondary border-border"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Servicio</Label>
        <Select
          value={form.service}
          onValueChange={(v) => setForm((p) => ({ ...p, service: v }))}
        >
          <SelectTrigger className="h-8 text-sm bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SERVICES_LIST.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Fecha</Label>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            className="h-8 text-sm bg-secondary border-border"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Hora</Label>
          <Select
            value={form.time}
            onValueChange={(v) => setForm((p) => ({ ...p, time: v }))}
          >
            <SelectTrigger className="h-8 text-sm bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Notas</Label>
        <Textarea
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          className="text-sm bg-secondary border-border"
          rows={2}
        />
      </div>
      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-1" />
          )}
          Guardar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-muted-foreground"
          onClick={onCancel}
        >
          <X className="w-3.5 h-3.5 mr-1" />
          Cancelar
        </Button>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments");
      if (res.status === 401) {
        onLogout();
        return;
      }
      if (!res.ok) throw new Error("Error fetching");
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) throw new Error("Error updating");
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status } : apt))
      );
    } catch (err) {
      console.error("Error updating appointment:", err);
    }
  };

  const updateAppointment = async (id: string, data: Partial<Appointment>) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) throw new Error("Error updating");
      const result = await res.json();
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? result.appointment : apt))
      );
      setEditingId(null);
    } catch (err) {
      console.error("Error updating appointment:", err);
    }
  };

  const createAppointment = async (data: Omit<Appointment, "id" | "status" | "createdAt">) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error creating");
      const result = await res.json();
      setAppointments((prev) => [result.appointment, ...prev]);
      setShowCreateForm(false);
    } catch (err) {
      console.error("Error creating appointment:", err);
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta cita?")) return;
    try {
      const res = await fetch(`/api/appointments?id=${id}`, {
        method: "DELETE",
      });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) throw new Error("Error deleting");
      setAppointments((prev) => prev.filter((apt) => apt.id !== id));
    } catch (err) {
      console.error("Error deleting appointment:", err);
    }
  };

  const openWhatsAppClient = (apt: Appointment) => {
    const serviceName = SERVICE_NAMES[apt.service] || apt.service;
    const msg = encodeURIComponent(
      `Hola ${apt.name}, te escribimos de Omani Barbershop para confirmar tu cita:\n\n` +
        `Servicio: ${serviceName}\n` +
        `Fecha: ${apt.date}\n` +
        `Hora: ${apt.time}\n\n` +
        `¿Confirma su asistencia?`
    );
    const cleanPhone = apt.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
    } catch {}
    onLogout();
  };

  const filtered =
    filter === "all"
      ? appointments
      : appointments.filter((apt) => apt.status === filter);

  const counts = {
    all: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + "T00:00:00");
      return date.toLocaleDateString("es-DO", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatCreatedAt = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString("es-DO", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-omani.png"
              alt="Omani"
              width={28}
              height={28}
              className="rounded-full"
            />
            <h1 className="font-bold gold-text">Admin - Omani Barbershop</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary"
              onClick={() => window.open("/", "_blank")}
            >
              Ver Web
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-red-400"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-1" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { key: "all", label: "Total", icon: <CalendarCheck className="w-4 h-4" /> },
            { key: "pending", label: "Pendientes", icon: <AlertCircle className="w-4 h-4" /> },
            { key: "confirmed", label: "Confirmadas", icon: <CheckCircle2 className="w-4 h-4" /> },
            { key: "completed", label: "Completadas", icon: <CheckCircle2 className="w-4 h-4" /> },
            { key: "cancelled", label: "Canceladas", icon: <XCircle className="w-4 h-4" /> },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`flex items-center gap-2 px-3 py-3 rounded-xl border transition-colors text-left ${
                filter === s.key
                  ? "bg-primary/10 border-primary/40 text-primary"
                  : "bg-card border-border text-muted-foreground hover:border-primary/20"
              }`}
            >
              {s.icon}
              <div>
                <p className="text-lg font-bold leading-none">
                  {counts[s.key as keyof typeof counts] || 0}
                </p>
                <p className="text-xs mt-0.5">{s.label}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Header Row: Title + Actions */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">
            {filter === "all" ? "Todas las Citas" : STATUS_CONFIG[filter]?.label || "Citas"}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? (
                <X className="w-4 h-4 mr-1" />
              ) : (
                <Plus className="w-4 h-4 mr-1" />
              )}
              Nueva Cita
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchAppointments}
              disabled={loading}
              className="text-muted-foreground"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-1" />
              )}
              Actualizar
            </Button>
          </div>
        </div>

        {/* Create Appointment Form */}
        {showCreateForm && (
          <div className="mb-4">
            <CreateAppointmentForm
              onSave={createAppointment}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        {/* Appointments List */}
        <div className="space-y-3">
          {loading && appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <p>Cargando citas...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <CalendarCheck className="w-12 h-12 mb-3 opacity-30" />
              <p>No hay citas {filter !== "all" ? "con este estado" : "registradas"}</p>
            </div>
          ) : (
            filtered.map((apt) => {
              const statusInfo = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
              const serviceName = SERVICE_NAMES[apt.service] || apt.service;
              const isEditing = editingId === apt.id;

              return (
                <div
                  key={apt.id}
                  className="bg-card border border-border rounded-xl p-4 transition-colors hover:border-primary/20"
                >
                  {/* Top: Status + Actions */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`${statusInfo.color} flex items-center gap-1 text-xs`}
                      >
                        {statusInfo.icon}
                        {statusInfo.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Reservada: {formatCreatedAt(apt.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {apt.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          onClick={() => updateStatus(apt.id, "confirmed")}
                          title="Confirmar cita"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                      {apt.status !== "completed" && apt.status !== "cancelled" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                          onClick={() => updateStatus(apt.id, "completed")}
                          title="Marcar completada"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                      {apt.status !== "cancelled" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => updateStatus(apt.id, "cancelled")}
                          title="Cancelar cita"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 px-2 ${isEditing ? "text-primary" : "text-muted-foreground"} hover:text-primary hover:bg-primary/10`}
                        onClick={() => setEditingId(isEditing ? null : apt.id)}
                        title="Editar cita"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-destructive hover:bg-destructive/10"
                        onClick={() => deleteAppointment(apt.id)}
                        title="Eliminar cita"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-medium truncate">{apt.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-muted-foreground truncate">
                        {apt.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Scissors className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-muted-foreground truncate">
                        {serviceName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-muted-foreground">
                        {formatDate(apt.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-muted-foreground">{apt.time}</span>
                    </div>
                  </div>

                  {apt.notes && (
                    <p className="mt-2 text-xs text-muted-foreground bg-background/50 rounded-lg px-3 py-2 italic">
                      {apt.notes}
                    </p>
                  )}

                  {/* Edit Form */}
                  {isEditing && (
                    <div className="mt-3">
                      <EditAppointmentForm
                        appointment={apt}
                        onSave={(data) => updateAppointment(apt.id, data)}
                        onCancel={() => setEditingId(null)}
                      />
                    </div>
                  )}

                  {/* WhatsApp Contact Button */}
                  {!isEditing && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#25D366] hover:text-[#20bd5a] hover:bg-[#25D366]/10 h-7 px-2 text-xs"
                        onClick={() => openWhatsAppClient(apt)}
                      >
                        <MessageCircle className="w-3.5 h-3.5 mr-1" />
                        Contactar por WhatsApp
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────
export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth");
        const data = await res.json();
        setAuthenticated(data.authenticated);
      } catch {
        setAuthenticated(false);
      } finally {
        setChecking(false);
      }
    };
    checkAuth();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <LoginForm
        onLogin={() => setAuthenticated(true)}
      />
    );
  }

  return (
    <AdminDashboard
      onLogout={() => setAuthenticated(false)}
    />
  );
}
