'use client'
import { useEffect, useState } from 'react'
import { supabase, type Reminder } from '@/lib/supabase'
import { formatDateTime } from '@/lib/utils'
import { Bell, BellOff, Search } from 'lucide-react'

export default function RecordatoriosPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent'>('all')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('reminders').select('*').order('send_at', { ascending: false })
    setReminders(data || [])
    setLoading(false)
  }

  const filtered = reminders.filter(r => {
    const matchSearch = r.client_name?.toLowerCase().includes(search.toLowerCase()) || r.phone?.includes(search)
    const matchFilter = filter === 'all' ? true : filter === 'sent' ? r.sent : !r.sent
    return matchSearch && matchFilter
  })

  const pending = reminders.filter(r => !r.sent).length
  const sent = reminders.filter(r => r.sent).length

  const typeLabel: Record<string, string> = {
    reminder_24h: '24 horas antes',
    reminder_1h: '1 hora antes',
    custom: 'Personalizado',
  }

  return (
    <div>
      <h1 className="page-title">Recordatorios</h1>
      <p className="page-subtitle">{pending} pendientes · {sent} enviados</p>

      {/* Filters */}
      <div className="flex items-center gap-3 mt-6 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cliente…" className="input pl-9" />
        </div>
        {(['all', 'pending', 'sent'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f ? 'bg-purple-600 text-white' : 'bg-white border border-purple-200 text-gray-600 hover:bg-purple-50'
            }`}>
            {f === 'all' ? 'Todos' : f === 'pending' ? '⏳ Pendientes' : '✅ Enviados'}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Cargando…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-purple-100">
                <th className="pb-3 font-medium">Cliente</th>
                <th className="pb-3 font-medium">Teléfono</th>
                <th className="pb-3 font-medium">Servicio</th>
                <th className="pb-3 font-medium">Turno</th>
                <th className="pb-3 font-medium">Tipo</th>
                <th className="pb-3 font-medium">Enviar a las</th>
                <th className="pb-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="table-row">
                  <td className="py-3 font-medium text-gray-800">{r.client_name || '—'}</td>
                  <td className="py-3 text-gray-500">{r.phone}</td>
                  <td className="py-3 text-gray-700">{r.service_name}</td>
                  <td className="py-3 text-gray-500 text-xs">{r.appointment_date} · {r.appointment_time}</td>
                  <td className="py-3">
                    <span className="badge bg-purple-100 text-purple-700">{typeLabel[r.type] || r.type}</span>
                  </td>
                  <td className="py-3 text-gray-500 text-xs">{formatDateTime(r.send_at)}</td>
                  <td className="py-3">
                    {r.sent ? (
                      <span className="badge bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                        <Bell size={11} /> Enviado
                      </span>
                    ) : (
                      <span className="badge bg-yellow-100 text-yellow-700 flex items-center gap-1 w-fit">
                        <BellOff size={11} /> Pendiente
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400">Sin recordatorios</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
