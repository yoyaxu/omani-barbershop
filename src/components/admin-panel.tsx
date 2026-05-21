"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CalendarCheck,
  User,
  Phone,
  Scissors,
  Clock,
  MessageCircle,
  X,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

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

// ─── Admin Panel Component ───────────────────────────────────────
export function AdminPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments");
      if (!res.ok) throw new Error("Error fetching");
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchAppointments();
    }
  }, [open, fetchAppointments]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Error updating");
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status } : apt))
      );
    } catch (err) {
      console.error("Error updating appointment:", err);
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta cita?")) return;
    try {
      const res = await fetch(`/api/appointments?id=${id}`, {
        method: "DELETE",
      });
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
        `✂️ Servicio: ${serviceName}\n` +
        `📅 Fecha: ${apt.date}\n` +
        `🕐 Hora: ${apt.time}\n\n` +
        `¿Confirma su asistencia?`
    );
    // Clean phone number - remove non-digits
    const cleanPhone = apt.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-card border-border max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="gold-text text-2xl flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" />
            Panel de Citas - Admin
          </DialogTitle>
        </DialogHeader>

        {/* Stats + Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: "all", label: "Todas" },
            { key: "pending", label: "Pendientes" },
            { key: "confirmed", label: "Confirmadas" },
            { key: "completed", label: "Completadas" },
            { key: "cancelled", label: "Canceladas" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filter === f.key
                  ? "bg-primary/20 text-primary border-primary/50"
                  : "bg-secondary text-muted-foreground border-border hover:border-primary/30"
              }`}
            >
              {f.label} ({counts[f.key as keyof typeof counts] || 0})
            </button>
          ))}
        </div>

        {/* Refresh */}
        <div className="flex justify-end mb-3">
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

        {/* Appointments List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
          {loading && appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <p>Cargando citas...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CalendarCheck className="w-12 h-12 mb-3 opacity-30" />
              <p>No hay citas {filter !== "all" ? "con este estado" : "registradas"}</p>
            </div>
          ) : (
            filtered.map((apt) => {
              const statusInfo = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
              const serviceName = SERVICE_NAMES[apt.service] || apt.service;

              return (
                <div
                  key={apt.id}
                  className="bg-secondary/50 border border-border rounded-xl p-4 transition-colors hover:border-primary/20"
                >
                  {/* Top: Status + Actions */}
                  <div className="flex items-start justify-between mb-3">
                    <Badge
                      variant="outline"
                      className={`${statusInfo.color} flex items-center gap-1 text-xs`}
                    >
                      {statusInfo.icon}
                      {statusInfo.label}
                    </Badge>
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
                      📝 {apt.notes}
                    </p>
                  )}

                  {/* WhatsApp Contact Button */}
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
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
