'use client'
import { useEffect, useState } from 'react'
import { supabase, type Appointment } from '@/lib/supabase'
import { formatCurrency, statusColor, statusLabel } from '@/lib/utils'
import { Calendar, Search, ChevronLeft, ChevronRight } from 'lucide-react'

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [selectedDate])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', selectedDate)
      .order('time')
    setAppointments(data || [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('appointments').update({ status }).eq('id', id)
    load()
  }

  const filtered = appointments.filter(a =>
    a.phone?.includes(search) || a.service_name?.toLowerCase().includes(search.toLowerCase())
  )

  function changeDay(delta: number) {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + delta)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const displayDate = new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div>
      <h1 className="page-title">Agenda</h1>
      <p className="page-subtitle">Turnos del día</p>

      {/* Date nav */}
      <div className="flex items-center gap-4 mt-6 mb-4">
        <button onClick={() => changeDay(-1)} className="btn-secondary"><ChevronLeft size={16} /></button>
        <div className="flex items-center gap-2 bg-white border border-purple-200 rounded-xl px-4 py-2">
          <Calendar size={16} className="text-purple-600" />
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="text-sm font-medium text-gray-800 outline-none" />
        </div>
        <button onClick={() => changeDay(1)} className="btn-secondary"><ChevronRight size={16} /></button>
        <span className="text-sm text-gray-500 capitalize">{displayDate}</span>
        <div className="ml-auto">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..." className="input pl-9 w-48" />
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Cargando turnos…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No hay turnos para este día</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-purple-100">
                <th className="pb-3 font-medium">Hora</th>
                <th className="pb-3 font-medium">Teléfono</th>
                <th className="pb-3 font-medium">Servicio</th>
                <th className="pb-3 font-medium">Monto</th>
                <th className="pb-3 font-medium">Seña</th>
                <th className="pb-3 font-medium">Estado</th>
                <th className="pb-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="table-row">
                  <td className="py-3 font-semibold text-purple-700">{a.time}</td>
                  <td className="py-3 text-gray-700">{a.phone}</td>
                  <td className="py-3 text-gray-700">{a.service_name}</td>
                  <td className="py-3 text-gray-700">{formatCurrency(a.amount || 0)}</td>
                  <td className="py-3">
                    <span className={`badge ${a.deposit_paid ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {a.deposit_paid ? '✓ Pagada' : 'Sin seña'}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`badge ${statusColor(a.status)}`}>{statusLabel(a.status)}</span>
                  </td>
                  <td className="py-3">
                    <select value={a.status}
                      onChange={e => updateStatus(a.id, e.target.value)}
                      className="text-xs border border-purple-200 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-purple-400">
                      <option value="pending">Pendiente</option>
                      <option value="confirmed">Confirmado</option>
                      <option value="completed">Completado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-400">
        {filtered.length} turno{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
