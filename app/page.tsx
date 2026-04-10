'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Users, Calendar, DollarSign, Clock, TrendingUp, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [stats, setStats] = useState({ clients: 0, todayAppts: 0, monthRevenue: 0, pending: 0, waitlist: 0, incidents: 0 })
  const [recentAppts, setRecentAppts] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split('T')[0]
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

      const [
        { count: clients },
        { count: todayAppts },
        { data: finances },
        { count: pending },
        { count: waitlist },
        { count: incidents },
        { data: recent },
      ] = await Promise.all([
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('date', today),
        supabase.from('finances').select('amount').eq('type', 'ingreso').gte('created_at', monthStart),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('waitlist').select('*', { count: 'exact', head: true }).eq('status', 'waiting'),
        supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('appointments').select('*').order('created_at', { ascending: false }).limit(5),
      ])

      const monthRevenue = (finances || []).reduce((s: number, f: any) => s + (f.amount || 0), 0)
      setStats({ clients: clients || 0, todayAppts: todayAppts || 0, monthRevenue, pending: pending || 0, waitlist: waitlist || 0, incidents: incidents || 0 })
      setRecentAppts(recent || [])

      // Chart: last 7 days
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i))
        return d.toISOString().split('T')[0]
      })
      const { data: apptsByDay } = await supabase.from('appointments').select('date').in('date', days)
      const chart = days.map(d => ({
        day: new Date(d).toLocaleDateString('es-AR', { weekday: 'short' }),
        turnos: (apptsByDay || []).filter((a: any) => a.date === d).length
      }))
      setChartData(chart)
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { label: 'Clientes totales', value: stats.clients, icon: Users, color: 'bg-purple-100 text-purple-700' },
    { label: 'Turnos hoy', value: stats.todayAppts, icon: Calendar, color: 'bg-blue-100 text-blue-700' },
    { label: 'Ingresos del mes', value: formatCurrency(stats.monthRevenue), icon: DollarSign, color: 'bg-green-100 text-green-700' },
    { label: 'Turnos pendientes', value: stats.pending, icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'En lista de espera', value: stats.waitlist, icon: TrendingUp, color: 'bg-indigo-100 text-indigo-700' },
    { label: 'Incidencias abiertas', value: stats.incidents, icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
  ]

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Resumen general de Kika Nails</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '…' : value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Turnos — últimos 7 días</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="turnos" fill="#9333ea" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Últimos turnos</h2>
          {loading ? <p className="text-sm text-gray-400">Cargando…</p> : (
            <div className="space-y-3">
              {recentAppts.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-purple-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{a.phone}</p>
                    <p className="text-xs text-gray-500">{a.service_name} · {a.date} {a.time}</p>
                  </div>
                  <span className={`badge ${a.status === 'confirmed' ? 'bg-green-100 text-green-700' : a.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {a.status === 'confirmed' ? 'Confirmado' : a.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                  </span>
                </div>
              ))}
              {recentAppts.length === 0 && <p className="text-sm text-gray-400">Sin turnos recientes</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
