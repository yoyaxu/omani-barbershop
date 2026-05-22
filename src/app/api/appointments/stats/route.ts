import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin } from '@/lib/auth'

// GET - Dashboard statistics for the admin panel
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let shopId: string | null = null

    if (auth.role === 'super_admin') {
      const { searchParams } = new URL(request.url)
      shopId = searchParams.get('shopId') || null
    } else {
      shopId = auth.shopId || null
    }

    if (!shopId) {
      return NextResponse.json({ error: 'Barbería no especificada' }, { status: 400 })
    }

    // Current month range
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0]
    const endOfMonthStr = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    // Previous month range
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const startOfPrevMonthStr = startOfPrevMonth.toISOString().split('T')[0]
    const endOfPrevMonthStr = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]

    // Current month appointments
    const currentMonthAppointments = await db.appointment.findMany({
      where: {
        shopId,
        date: { gte: startOfMonthStr, lte: endOfMonthStr },
      },
      include: {
        service: { select: { name: true, price: true } },
      },
    })

    // Previous month appointments
    const previousMonthAppointments = await db.appointment.findMany({
      where: {
        shopId,
        date: { gte: startOfPrevMonthStr, lte: endOfPrevMonthStr },
      },
      include: {
        service: { select: { name: true, price: true } },
      },
    })

    // All appointments for totals
    const allAppointments = await db.appointment.findMany({
      where: { shopId },
      include: {
        service: { select: { name: true, price: true } },
      },
    })

    // Calculate stats
    const currentMonth = {
      total: currentMonthAppointments.length,
      pending: currentMonthAppointments.filter(a => a.status === 'pending').length,
      confirmed: currentMonthAppointments.filter(a => a.status === 'confirmed').length,
      completed: currentMonthAppointments.filter(a => a.status === 'completed').length,
      cancelled: currentMonthAppointments.filter(a => a.status === 'cancelled').length,
      revenue: currentMonthAppointments
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + (a.service?.price || 0), 0),
      potentialRevenue: currentMonthAppointments
        .filter(a => a.status !== 'cancelled')
        .reduce((sum, a) => sum + (a.service?.price || 0), 0),
    }

    const previousMonth = {
      total: previousMonthAppointments.length,
      revenue: previousMonthAppointments
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + (a.service?.price || 0), 0),
    }

    // Percentage changes
    const totalChange = previousMonth.total > 0
      ? Math.round(((currentMonth.total - previousMonth.total) / previousMonth.total) * 100)
      : (currentMonth.total > 0 ? 100 : 0)

    const revenueChange = previousMonth.revenue > 0
      ? Math.round(((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100)
      : (currentMonth.revenue > 0 ? 100 : 0)

    // Services breakdown for current month
    const servicesMap = new Map<string, { name: string; count: number; revenue: number }>()
    for (const apt of currentMonthAppointments.filter(a => a.status === 'completed')) {
      const key = apt.service?.name || 'Otro'
      const existing = servicesMap.get(key) || { name: key, count: 0, revenue: 0 }
      existing.count++
      existing.revenue += apt.service?.price || 0
      servicesMap.set(key, existing)
    }
    const servicesBreakdown = Array.from(servicesMap.values()).sort((a, b) => b.revenue - a.revenue)

    // Daily appointments for current month (for chart)
    const dailyMap = new Map<string, { date: string; total: number; completed: number; cancelled: number; revenue: number }>()
    for (const apt of currentMonthAppointments) {
      const existing = dailyMap.get(apt.date) || { date: apt.date, total: 0, completed: 0, cancelled: 0, revenue: 0 }
      existing.total++
      if (apt.status === 'completed') {
        existing.completed++
        existing.revenue += apt.service?.price || 0
      }
      if (apt.status === 'cancelled') existing.cancelled++
      dailyMap.set(apt.date, existing)
    }
    const dailyStats = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))

    // Status distribution for current month (for pie chart)
    const statusDistribution = [
      { name: 'Completadas', value: currentMonth.completed, color: '#22c55e' },
      { name: 'Confirmadas', value: currentMonth.confirmed, color: '#3b82f6' },
      { name: 'Pendientes', value: currentMonth.pending, color: '#eab308' },
      { name: 'Canceladas', value: currentMonth.cancelled, color: '#ef4444' },
    ].filter(s => s.value > 0)

    // All-time stats
    const allTime = {
      total: allAppointments.length,
      completed: allAppointments.filter(a => a.status === 'completed').length,
      revenue: allAppointments
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + (a.service?.price || 0), 0),
    }

    // Recent appointments (last 10)
    const recentAppointments = await db.appointment.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        service: { select: { name: true, price: true } },
      },
    })

    // Today's appointments
    const todayStr = now.toISOString().split('T')[0]
    const todayAppointments = await db.appointment.findMany({
      where: {
        shopId,
        date: todayStr,
      },
      include: {
        service: { select: { name: true, price: true } },
      },
      orderBy: { time: 'asc' },
    })

    return NextResponse.json({
      currentMonth,
      previousMonth,
      totalChange,
      revenueChange,
      servicesBreakdown,
      dailyStats,
      statusDistribution,
      allTime,
      recentAppointments,
      todayAppointments,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 })
  }
}
