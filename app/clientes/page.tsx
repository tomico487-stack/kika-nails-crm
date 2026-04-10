'use client'
import { useEffect, useState } from 'react'
import { supabase, type Client } from '@/lib/supabase'
import { statusColor, statusLabel, formatDate } from '@/lib/utils'
import { Search, UserPlus, Phone } from 'lucide-react'

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Client | null>(null)
  const [appointments, setAppointments] = useState<any[]>([])

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  async function selectClient(client: Client) {
    setSelected(client)
    const { data } = await supabase.from('appointments').select('*').eq('phone', client.phone).order('date', { ascending: false }).limit(10)
    setAppointments(data || [])
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('clients').update({ status }).eq('id', id)
    load()
  }

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  )

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">{clients.length} clientes registrados</p>
        </div>
      </div>

      <div className="mt-6 flex gap-6">
        {/* List */}
        <div className="flex-1">
          <div className="relative mb-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o teléfono…" className="input pl-9" />
          </div>

          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-purple-100 bg-purple-50/50">
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Teléfono</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Registrado</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Cargando…</td></tr>
                ) : filtered.map(c => (
                  <tr key={c.id}
                    onClick={() => selectClient(c)}
                    className={`table-row cursor-pointer ${selected?.id === c.id ? 'bg-purple-50' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-800">{c.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 flex items-center gap-1.5">
                      <Phone size={13} className="text-purple-400" />{c.phone}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${statusColor(c.status)}`}>{statusLabel(c.status)}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(c.created_at)}</td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Sin resultados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-80 shrink-0">
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg">
                  {(selected.name || selected.phone)[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selected.name || 'Sin nombre'}</p>
                  <p className="text-sm text-gray-500">{selected.phone}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs text-gray-500 font-medium">Estado</label>
                <select value={selected.status}
                  onChange={e => updateStatus(selected.id, e.target.value)}
                  className="input mt-1">
                  <option value="active">Activo</option>
                  <option value="blacklisted">Bloqueado</option>
                </select>
              </div>

              {selected.notes && (
                <div className="mb-4 p-3 bg-purple-50 rounded-xl">
                  <p className="text-xs text-gray-500 font-medium mb-1">Notas</p>
                  <p className="text-sm text-gray-700">{selected.notes}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500 font-medium mb-2">Últimos turnos</p>
                <div className="space-y-2">
                  {appointments.map(a => (
                    <div key={a.id} className="text-xs bg-gray-50 rounded-lg px-3 py-2">
                      <p className="font-medium text-gray-700">{a.service_name}</p>
                      <p className="text-gray-400">{a.date} · {a.time}</p>
                    </div>
                  ))}
                  {appointments.length === 0 && <p className="text-xs text-gray-400">Sin turnos</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
