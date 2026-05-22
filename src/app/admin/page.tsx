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
  KeyRound,
  Eye,
  EyeOff,
  BarChart3,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Activity,
  Mail,
  LayoutDashboard,
  ClipboardList,
  Settings,
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DatePickerField } from "@/components/DatePickerField";

// ─── Types ───────────────────────────────────────────────────────
interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
}

interface Appointment {
  id: string;
  name: string;
  phone: string;
  service: { name: string; price: number } | null;
  serviceId: string;
  date: string;
  time: string;
  notes: string | null;
  status: string;
  createdAt: string;
}

interface ShopData {
  id: string;
  name: string;
  slug: string;
  whatsappNumber: string;
  themeColor: string;
}

interface DashboardStats {
  currentMonth: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    revenue: number;
    potentialRevenue: number;
  };
  previousMonth: {
    total: number;
    revenue: number;
  };
  totalChange: number;
  revenueChange: number;
  servicesBreakdown: { name: string; count: number; revenue: number }[];
  dailyStats: { date: string; total: number; completed: number; cancelled: number; revenue: number }[];
  statusDistribution: { name: string; value: number; color: string }[];
  allTime: {
    total: number;
    completed: number;
    revenue: number;
  };
  recentAppointments: Appointment[];
  todayAppointments: Appointment[];
}

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

function formatRD(amount: number) {
  return `RD$${amount.toLocaleString("es-DO")}`;
}

function formatDateShort(dateStr: string) {
  try {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-DO", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateStr;
  }
}

function formatDateFull(dateStr: string) {
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
}

function formatCreatedAt(isoStr: string) {
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
}

// ─── Custom Tooltip for Charts ───────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="text-xs">
          {entry.name}: {entry.name.includes("Ingreso") ? formatRD(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

// ─── Login Component ──────────────────────────────────────────────
function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ email, password }),
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
          <Scissors className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold gold-text mb-1">BarberDo</h1>
          <p className="text-muted-foreground text-sm">
            Panel de Administración
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary border-border pl-9"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary border-border pl-9"
                required
              />
            </div>
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
      </div>
    </div>
  );
}

// ─── Dashboard Tab ───────────────────────────────────────────────
function DashboardTab({ stats, shop }: { stats: DashboardStats | null; shop: ShopData | null }) {
  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  const cm = stats.currentMonth;
  const now = new Date();
  const monthName = now.toLocaleDateString("es-DO", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Month header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold capitalize">{monthName}</h2>
          <p className="text-sm text-muted-foreground">
            Resumen de actividad de {shop?.name || "tu barbería"}
          </p>
        </div>
        <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10">
          <Activity className="w-3 h-3 mr-1" />
          Este Mes
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/20 transition">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-primary" />
            <div className={`flex items-center text-xs font-medium ${stats.totalChange >= 0 ? "text-green-400" : "text-red-400"}`}>
              {stats.totalChange >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
              {Math.abs(stats.totalChange)}%
            </div>
          </div>
          <p className="text-2xl font-bold">{cm.total}</p>
          <p className="text-xs text-muted-foreground">Citas del mes</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 hover:border-green-500/20 transition">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-xs text-muted-foreground">
              {cm.total > 0 ? Math.round((cm.completed / cm.total) * 100) : 0}%
            </span>
          </div>
          <p className="text-2xl font-bold">{cm.completed}</p>
          <p className="text-xs text-muted-foreground">Completadas</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 hover:border-yellow-500/20 transition">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <div className={`flex items-center text-xs font-medium ${stats.revenueChange >= 0 ? "text-green-400" : "text-red-400"}`}>
              {stats.revenueChange >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
              {Math.abs(stats.revenueChange)}%
            </div>
          </div>
          <p className="text-2xl font-bold">{formatRD(cm.revenue)}</p>
          <p className="text-xs text-muted-foreground">Ingresos completados</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 hover:border-blue-500/20 transition">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-muted-foreground">Potencial</span>
          </div>
          <p className="text-2xl font-bold">{formatRD(cm.potentialRevenue)}</p>
          <p className="text-xs text-muted-foreground">Ingresos potenciales</p>
        </div>
      </div>

      {/* Secondary stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 text-center">
          <AlertCircle className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-yellow-400">{cm.pending}</p>
          <p className="text-xs text-muted-foreground">Pendientes</p>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 text-center">
          <CheckCircle2 className="w-4 h-4 text-blue-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-blue-400">{cm.confirmed}</p>
          <p className="text-xs text-muted-foreground">Confirmadas</p>
        </div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 text-center">
          <XCircle className="w-4 h-4 text-red-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-red-400">{cm.cancelled}</p>
          <p className="text-xs text-muted-foreground">Canceladas</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily Revenue Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Ingresos Diarios ({monthName})
          </h3>
          {stats.dailyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={stats.dailyStats}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4A853" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D4A853" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => formatDateShort(v)}
                  tick={{ fontSize: 10, fill: "#888" }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10, fill: "#888" }} tickFormatter={(v) => `RD$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#D4A853"
                  fill="url(#revenueGrad)"
                  strokeWidth={2}
                  name="Ingresos"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">
              No hay datos este mes
            </div>
          )}
        </div>

        {/* Status Distribution Pie */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Distribución de Estados
          </h3>
          {stats.statusDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={stats.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {stats.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string) => <span className="text-xs text-muted-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">
              No hay citas este mes
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Services + Today */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Services Breakdown */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Scissors className="w-4 h-4 text-primary" />
            Ingresos por Servicio
          </h3>
          {stats.servicesBreakdown.length > 0 ? (
            <div className="space-y-3">
              {stats.servicesBreakdown.map((s, i) => {
                const maxRevenue = stats.servicesBreakdown[0]?.revenue || 1;
                const pct = Math.round((s.revenue / maxRevenue) * 100);
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{s.name}</span>
                      <span className="text-sm font-bold text-primary">{formatRD(s.revenue)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-6 text-right">{s.count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[120px] text-muted-foreground text-sm">
              No hay servicios completados este mes
            </div>
          )}
        </div>

        {/* Today's Appointments */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Citas de Hoy
          </h3>
          {stats.todayAppointments.length > 0 ? (
            <div className="space-y-2 max-h-[240px] overflow-y-auto">
              {stats.todayAppointments.map((apt) => {
                const statusInfo = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
                return (
                  <div key={apt.id} className="flex items-center gap-3 p-2 bg-background/50 rounded-lg">
                    <div className="text-center min-w-[52px]">
                      <p className="text-xs font-bold text-primary">{apt.time}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{apt.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{apt.service?.name}</p>
                    </div>
                    <Badge variant="outline" className={`${statusInfo.color} text-[10px] px-1.5 py-0`}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[120px] text-muted-foreground">
              <CalendarCheck className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">Sin citas hoy</p>
            </div>
          )}
        </div>
      </div>

      {/* All-time Stats */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-primary">
          <TrendingUp className="w-4 h-4" />
          Resumen Histórico
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xl font-bold">{stats.allTime.total}</p>
            <p className="text-xs text-muted-foreground">Citas totales</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-green-400">{stats.allTime.completed}</p>
            <p className="text-xs text-muted-foreground">Completadas</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-primary">{formatRD(stats.allTime.revenue)}</p>
            <p className="text-xs text-muted-foreground">Ingresos totales</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Appointments Tab ────────────────────────────────────────────
function AppointmentsTab({
  shop,
  onLogout,
}: {
  shop: ShopData | null;
  onLogout: () => void;
}) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePwForm, setChangePwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [changePwLoading, setChangePwLoading] = useState(false);
  const [changePwError, setChangePwError] = useState("");
  const [changePwSuccess, setChangePwSuccess] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Fetch services for this shop
  useEffect(() => {
    if (shop?.slug) {
      fetch(`/api/shops/${shop.slug}/services`)
        .then((res) => res.json())
        .then((data) => setServices(data.services || []))
        .catch(() => setServices([]));
    }
  }, [shop?.slug]);

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

  const createAppointment = async (data: any) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, shopId: shop?.id }),
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
    const serviceName = apt.service?.name || "Servicio";
    const msg = encodeURIComponent(
      `Hola ${apt.name}, te escribimos de ${shop?.name || "Barbería"} para confirmar tu cita:\n\n` +
        `Servicio: ${serviceName}\n` +
        `Fecha: ${apt.date}\n` +
        `Hora: ${apt.time}\n\n` +
        `¿Confirma su asistencia?`
    );
    const cleanPhone = apt.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  const handleChangePassword = async () => {
    setChangePwError("");
    setChangePwSuccess(false);

    if (!changePwForm.current || !changePwForm.newPw || !changePwForm.confirm) {
      setChangePwError("Todos los campos son requeridos");
      return;
    }
    if (changePwForm.newPw !== changePwForm.confirm) {
      setChangePwError("Las contraseñas nuevas no coinciden");
      return;
    }
    if (changePwForm.newPw.length < 4) {
      setChangePwError("La nueva contraseña debe tener al menos 4 caracteres");
      return;
    }

    setChangePwLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: changePwForm.current,
          newPassword: changePwForm.newPw,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setChangePwError(data.error || "Error al cambiar la contraseña");
        return;
      }

      setChangePwSuccess(true);
      setChangePwForm({ current: "", newPw: "", confirm: "" });
      setTimeout(() => {
        setShowChangePassword(false);
        setChangePwSuccess(false);
      }, 2000);
    } catch {
      setChangePwError("Error de conexión");
    } finally {
      setChangePwLoading(false);
    }
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

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      {/* Change Password Form */}
      {showChangePassword && (
        <div className="bg-card border border-primary/30 rounded-xl p-5 space-y-4">
          <h3 className="text-base font-bold text-primary flex items-center gap-2">
            <KeyRound className="w-4 h-4" />
            Cambiar Contraseña
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Contraseña actual</Label>
              <div className="relative">
                <Input
                  type={showCurrentPw ? "text" : "password"}
                  value={changePwForm.current}
                  onChange={(e) => setChangePwForm((p) => ({ ...p, current: e.target.value }))}
                  className="h-9 text-sm bg-secondary border-border pr-9"
                  placeholder="Actual"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  type={showNewPw ? "text" : "password"}
                  value={changePwForm.newPw}
                  onChange={(e) => setChangePwForm((p) => ({ ...p, newPw: e.target.value }))}
                  className="h-9 text-sm bg-secondary border-border pr-9"
                  placeholder="Nueva"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Confirmar nueva</Label>
              <Input
                type="password"
                value={changePwForm.confirm}
                onChange={(e) => setChangePwForm((p) => ({ ...p, confirm: e.target.value }))}
                className="h-9 text-sm bg-secondary border-border"
                placeholder="Confirmar"
              />
            </div>
          </div>
          {changePwError && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {changePwError}
            </p>
          )}
          {changePwSuccess && (
            <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
              Contraseña actualizada exitosamente
            </p>
          )}
          <div className="flex gap-2">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleChangePassword} disabled={changePwLoading}>
              {changePwLoading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <KeyRound className="w-3.5 h-3.5 mr-1" />}
              Guardar Contraseña
            </Button>
            <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => { setShowChangePassword(false); setChangePwError(""); setChangePwSuccess(false); setChangePwForm({ current: "", newPw: "", confirm: "" }); }}>
              <X className="w-3.5 h-3.5 mr-1" /> Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
              <p className="text-lg font-bold leading-none">{counts[s.key as keyof typeof counts] || 0}</p>
              <p className="text-xs mt-0.5">{s.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Header Row */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">
          {filter === "all" ? "Todas las Citas" : STATUS_CONFIG[filter]?.label || "Citas"}
        </h2>
        <div className="flex items-center gap-2">
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
            Nueva Cita
          </Button>
          <Button variant="ghost" size="sm" onClick={fetchAppointments} disabled={loading} className="text-muted-foreground">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
            Actualizar
          </Button>
        </div>
      </div>

      {/* Create Appointment Form */}
      {showCreateForm && (
        <CreateAppointmentForm
          services={services}
          shopId={shop?.id}
          onSave={createAppointment}
          onCancel={() => setShowCreateForm(false)}
        />
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
            const serviceName = apt.service?.name || "Servicio";
            const isEditing = editingId === apt.id;

            return (
              <div key={apt.id} className="bg-card border border-border rounded-xl p-4 transition-colors hover:border-primary/20">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`${statusInfo.color} flex items-center gap-1 text-xs`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Reservada: {formatCreatedAt(apt.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {apt.status === "pending" && (
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10" onClick={() => updateStatus(apt.id, "confirmed")} title="Confirmar cita">
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    )}
                    {apt.status !== "completed" && apt.status !== "cancelled" && (
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-green-400 hover:text-green-300 hover:bg-green-500/10" onClick={() => updateStatus(apt.id, "completed")} title="Marcar completada">
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    )}
                    {apt.status !== "cancelled" && (
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => updateStatus(apt.id, "cancelled")} title="Cancelar cita">
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className={`h-7 px-2 ${isEditing ? "text-primary" : "text-muted-foreground"} hover:text-primary hover:bg-primary/10`} onClick={() => setEditingId(isEditing ? null : apt.id)} title="Editar cita">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive hover:bg-destructive/10" onClick={() => deleteAppointment(apt.id)} title="Eliminar cita">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="font-medium truncate">{apt.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-muted-foreground truncate">{apt.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Scissors className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-muted-foreground truncate">{serviceName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-muted-foreground">{formatDateFull(apt.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-muted-foreground">{apt.time}</span>
                  </div>
                  {apt.service?.price && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-green-400 shrink-0" />
                      <span className="text-green-400 font-medium">{formatRD(apt.service.price)}</span>
                    </div>
                  )}
                </div>

                {apt.notes && (
                  <p className="mt-2 text-xs text-muted-foreground bg-background/50 rounded-lg px-3 py-2 italic">
                    {apt.notes}
                  </p>
                )}

                {isEditing && (
                  <div className="mt-3">
                    <EditAppointmentForm
                      appointment={apt}
                      services={services}
                      onSave={(data) => updateAppointment(apt.id, data)}
                      onCancel={() => setEditingId(null)}
                    />
                  </div>
                )}

                {!isEditing && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <Button variant="ghost" size="sm" className="text-[#25D366] hover:text-[#20bd5a] hover:bg-[#25D366]/10 h-7 px-2 text-xs" onClick={() => openWhatsAppClient(apt)}>
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
  );
}

// ─── Create Appointment Component ─────────────────────────────────
function CreateAppointmentForm({
  services,
  shopId,
  onSave,
  onCancel,
}: {
  services: Service[];
  shopId?: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    serviceId: "",
    date: "",
    time: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  useEffect(() => {
    if (form.date && shopId) {
      fetch(`/api/appointments/availability?shopId=${shopId}&date=${form.date}`)
        .then((res) => res.json())
        .then((data) => setBookedTimes(data.bookedTimes || []))
        .catch(() => setBookedTimes([]));
    } else {
      setBookedTimes([]);
    }
  }, [form.date, shopId]);

  const availableSlots = TIME_SLOTS.filter((t) => !bookedTimes.includes(t));

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.serviceId || !form.date || !form.time) return;
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
          <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Nombre del cliente" className="h-9 text-sm bg-secondary border-border" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Teléfono *</Label>
          <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="(809) 555-1234" type="tel" className="h-9 text-sm bg-secondary border-border" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Servicio *</Label>
        <Select value={form.serviceId} onValueChange={(v) => setForm((p) => ({ ...p, serviceId: v }))}>
          <SelectTrigger className="h-9 text-sm bg-secondary border-border">
            <SelectValue placeholder="Selecciona un servicio" />
          </SelectTrigger>
          <SelectContent>
            {services.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} - RD${s.price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Fecha *</Label>
          <DatePickerField value={form.date} onChange={(v) => setForm((p) => ({ ...p, date: v, time: "" }))} min={today} placeholder="Seleccionar" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Hora *</Label>
          <Select value={form.time} onValueChange={(v) => setForm((p) => ({ ...p, time: v }))} disabled={!form.date}>
            <SelectTrigger className="h-9 text-sm bg-secondary border-border">
              <SelectValue placeholder={!form.date ? "Fecha primero" : availableSlots.length === 0 ? "Sin disponibilidad" : "Selecciona hora"} />
            </SelectTrigger>
            <SelectContent>
              {availableSlots.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground text-center">No hay horarios disponibles</div>
              ) : (
                availableSlots.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)
              )}
            </SelectContent>
          </Select>
          {form.date && bookedTimes.length > 0 && (
            <p className="text-[10px] text-muted-foreground">{availableSlots.length} disponible{availableSlots.length !== 1 ? "s" : ""}</p>
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Notas</Label>
        <Textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className="text-sm bg-secondary border-border" rows={2} placeholder="Notas opcionales..." />
      </div>
      <div className="flex gap-2 pt-1">
        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSave} disabled={saving || !form.name || !form.phone || !form.serviceId || !form.date || !form.time}>
          {saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
          Crear Cita
        </Button>
        <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={onCancel}>
          <X className="w-3.5 h-3.5 mr-1" /> Cancelar
        </Button>
      </div>
    </div>
  );
}

// ─── Edit Appointment Component ───────────────────────────────────
function EditAppointmentForm({
  appointment,
  services,
  onSave,
  onCancel,
}: {
  appointment: Appointment;
  services: Service[];
  onSave: (data: Partial<Appointment>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: appointment.name,
    phone: appointment.phone,
    serviceId: appointment.serviceId,
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
        <Pencil className="w-3.5 h-3.5" /> Editar Cita
      </h4>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Nombre</Label>
          <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="h-8 text-sm bg-secondary border-border" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Teléfono</Label>
          <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="h-8 text-sm bg-secondary border-border" />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Servicio</Label>
        <Select value={form.serviceId} onValueChange={(v) => setForm((p) => ({ ...p, serviceId: v }))}>
          <SelectTrigger className="h-8 text-sm bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {services.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Fecha</Label>
          <DatePickerField value={form.date} onChange={(v) => setForm((p) => ({ ...p, date: v }))} placeholder="Seleccionar" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Hora</Label>
          <Select value={form.time} onValueChange={(v) => setForm((p) => ({ ...p, time: v }))}>
            <SelectTrigger className="h-8 text-sm bg-secondary border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Notas</Label>
        <Textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className="text-sm bg-secondary border-border" rows={2} />
      </div>
      <div className="flex gap-2 pt-1">
        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
          Guardar
        </Button>
        <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={onCancel}>
          <X className="w-3.5 h-3.5 mr-1" /> Cancelar
        </Button>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────
export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "appointments" | "settings">("dashboard");
  const [shop, setShop] = useState<ShopData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const router = useRouter();

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth");
        const data = await res.json();
        if (data.authenticated) {
          setAuthenticated(true);
          // Load shop data from auth response
          if (data.user?.shopId) {
            fetchShopData(data.user.shopId);
          }
        } else {
          setAuthenticated(false);
        }
      } catch {
        setAuthenticated(false);
      } finally {
        setChecking(false);
      }
    };
    checkAuth();
  }, []);

  // Fetch shop data
  const fetchShopData = async (shopId: string) => {
    try {
      // Get the shop data through the appointments API which includes shop context
      const shopsRes = await fetch("/api/shops");
      if (shopsRes.ok) {
        const shopsData = await shopsRes.json();
        const userShop = shopsData.shops?.find((s: any) => s.id === shopId);
        if (userShop) {
          setShop(userShop);
        }
      }
    } catch {
      // If super admin or no shop, try another way
    }
  };

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/appointments/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);

        // Also try to get shop info if we don't have it
        if (!shop && data.recentAppointments?.[0]) {
          // Try to infer from the auth check
        }
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [shop]);

  // Fetch shop data on auth
  useEffect(() => {
    if (authenticated) {
      fetchStats();
      // Also try to get shop info from the auth endpoint
      fetch("/api/auth")
        .then(res => res.json())
        .then(async data => {
          if (data.user?.shopId) {
            // Get shop info from public endpoint
            try {
              // Try to find the shop slug
              const shopsRes = await fetch("/api/shops/public");
              if (shopsRes.ok) {
                const shopsData = await shopsRes.json();
                const userShop = shopsData.shops?.find((s: any) => s.id === data.user.shopId);
                if (userShop) {
                  setShop(userShop);
                }
              }
            } catch {}
          }
        })
        .catch(() => {});
    }
  }, [authenticated]);

  const handleLogin = () => {
    setAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
    } catch {}
    setAuthenticated(false);
    setShop(null);
    setStats(null);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const shopName = shop?.name || "Admin";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scissors className="w-6 h-6 text-primary" />
            <div>
              <h1 className="font-bold gold-text text-sm leading-none">{shopName}</h1>
              <p className="text-[10px] text-muted-foreground">Panel de Administración</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" onClick={() => window.open(shop?.slug ? `/shop/${shop.slug}` : "/", "_blank")}>
              Ver Web
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-400" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-border bg-card/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { key: "dashboard" as const, label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
              { key: "appointments" as const, label: "Citas", icon: <ClipboardList className="w-4 h-4" /> },
              { key: "settings" as const, label: "Ajustes", icon: <Settings className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === "dashboard" && (
          <DashboardTab stats={stats} shop={shop} />
        )}
        {activeTab === "appointments" && (
          <AppointmentsTab shop={shop} onLogout={handleLogout} />
        )}
        {activeTab === "settings" && (
          <SettingsTab shop={shop} onLogout={handleLogout} />
        )}
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────
function SettingsTab({ shop, onLogout }: { shop: ShopData | null; onLogout: () => void }) {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePwForm, setChangePwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [changePwLoading, setChangePwLoading] = useState(false);
  const [changePwError, setChangePwError] = useState("");
  const [changePwSuccess, setChangePwSuccess] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Shop settings state
  const [shopSettings, setShopSettings] = useState({
    name: "",
    whatsappNumber: "",
    instagram: "",
    address: "",
    openingTime: "",
    closingTime: "",
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Load shop settings
  useEffect(() => {
    if (shop?.slug) {
      setSettingsLoading(true);
      fetch(`/api/shops/${shop.slug}/settings`)
        .then((res) => res.json())
        .then((data) => {
          if (data.shop) {
            setShopSettings({
              name: data.shop.name || "",
              whatsappNumber: data.shop.whatsappNumber || "",
              instagram: data.shop.instagram || "",
              address: data.shop.address || "",
              openingTime: data.shop.openingTime || "",
              closingTime: data.shop.closingTime || "",
            });
          }
        })
        .catch(() => {})
        .finally(() => setSettingsLoading(false));
    }
  }, [shop?.slug]);

  const handleSaveSettings = async () => {
    if (!shop?.slug) return;
    setSettingsSaving(true);
    setSettingsSuccess(false);
    try {
      const res = await fetch(`/api/shops/${shop.slug}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shopSettings),
      });
      if (res.ok) {
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
      }
    } catch {
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setChangePwError("");
    setChangePwSuccess(false);

    if (!changePwForm.current || !changePwForm.newPw || !changePwForm.confirm) {
      setChangePwError("Todos los campos son requeridos");
      return;
    }
    if (changePwForm.newPw !== changePwForm.confirm) {
      setChangePwError("Las contraseñas nuevas no coinciden");
      return;
    }
    if (changePwForm.newPw.length < 4) {
      setChangePwError("La nueva contraseña debe tener al menos 4 caracteres");
      return;
    }

    setChangePwLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: changePwForm.current,
          newPassword: changePwForm.newPw,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setChangePwError(data.error || "Error al cambiar la contraseña");
        return;
      }
      setChangePwSuccess(true);
      setChangePwForm({ current: "", newPw: "", confirm: "" });
      setTimeout(() => {
        setShowChangePassword(false);
        setChangePwSuccess(false);
      }, 2000);
    } catch {
      setChangePwError("Error de conexión");
    } finally {
      setChangePwLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Settings className="w-5 h-5 text-primary" />
        Ajustes de la Barbería
      </h2>

      {settingsLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="space-y-1.5">
            <Label>Nombre de la barbería</Label>
            <Input value={shopSettings.name} onChange={(e) => setShopSettings((p) => ({ ...p, name: e.target.value }))} className="bg-secondary border-border" />
          </div>
          <div className="space-y-1.5">
            <Label>Número de WhatsApp</Label>
            <Input value={shopSettings.whatsappNumber} onChange={(e) => setShopSettings((p) => ({ ...p, whatsappNumber: e.target.value }))} className="bg-secondary border-border" placeholder="8293196108" />
          </div>
          <div className="space-y-1.5">
            <Label>Instagram</Label>
            <Input value={shopSettings.instagram} onChange={(e) => setShopSettings((p) => ({ ...p, instagram: e.target.value }))} className="bg-secondary border-border" placeholder="@tu_barberia" />
          </div>
          <div className="space-y-1.5">
            <Label>Dirección</Label>
            <Input value={shopSettings.address} onChange={(e) => setShopSettings((p) => ({ ...p, address: e.target.value }))} className="bg-secondary border-border" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Hora de apertura</Label>
              <Input value={shopSettings.openingTime} onChange={(e) => setShopSettings((p) => ({ ...p, openingTime: e.target.value }))} className="bg-secondary border-border" placeholder="9:00 AM" />
            </div>
            <div className="space-y-1.5">
              <Label>Hora de cierre</Label>
              <Input value={shopSettings.closingTime} onChange={(e) => setShopSettings((p) => ({ ...p, closingTime: e.target.value }))} className="bg-secondary border-border" placeholder="7:00 PM" />
            </div>
          </div>

          {settingsSuccess && (
            <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
              Ajustes guardados exitosamente
            </p>
          )}

          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSaveSettings} disabled={settingsSaving}>
            {settingsSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Guardar Ajustes
          </Button>
        </div>
      )}

      {/* Change Password Section */}
      <div className="border-t border-border pt-6">
        <button
          onClick={() => setShowChangePassword(!showChangePassword)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition"
        >
          <KeyRound className="w-4 h-4" />
          {showChangePassword ? "Ocultar cambio de contraseña" : "Cambiar Contraseña"}
        </button>

        {showChangePassword && (
          <div className="mt-4 bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Contraseña actual</Label>
                <div className="relative">
                  <Input type={showCurrentPw ? "text" : "password"} value={changePwForm.current} onChange={(e) => setChangePwForm((p) => ({ ...p, current: e.target.value }))} className="h-9 text-sm bg-secondary border-border pr-9" placeholder="Actual" />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Nueva contraseña</Label>
                <div className="relative">
                  <Input type={showNewPw ? "text" : "password"} value={changePwForm.newPw} onChange={(e) => setChangePwForm((p) => ({ ...p, newPw: e.target.value }))} className="h-9 text-sm bg-secondary border-border pr-9" placeholder="Nueva" />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Confirmar nueva</Label>
                <Input type="password" value={changePwForm.confirm} onChange={(e) => setChangePwForm((p) => ({ ...p, confirm: e.target.value }))} className="h-9 text-sm bg-secondary border-border" placeholder="Confirmar" />
              </div>
            </div>
            {changePwError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{changePwError}</p>
            )}
            {changePwSuccess && (
              <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">Contraseña actualizada exitosamente</p>
            )}
            <div className="flex gap-2">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleChangePassword} disabled={changePwLoading}>
                {changePwLoading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <KeyRound className="w-3.5 h-3.5 mr-1" />}
                Guardar Contraseña
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
