'use client'
import { useEffect, useState } from 'react'
import { supabase, type WaitlistEntry } from '@/lib/supabase'
import { formatDateTime } from '@/lib/utils'
import { Clock, CheckCircle, XCircle, Search } from 'lucide-react'

export default function ListaEsperaPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('waitlist').select('*').order('added_at', { ascending: false })
    setEntries(data || [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('waitlist').update({ status }).eq('id', id)
    load()
  }

  const filtered = entries.filter(e =>
    e.client_name?.toLowerCase().includes(search.toLowerCase()) || e.phone?.includes(search)
  )
  const waiting = filtered.filter(e => e.status === 'waiting')
  const rest = filtered.filter(e => e.status !== 'waiting')

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Lista de Espera</h1>
          <p className="page-subtitle">{waiting.length} cliente{waiting.length !== 1 ? 's' : ''} esperando turno</p>
        </div>
      </div>

      <div className="mt-6 relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar cliente…" className="input pl-9 max-w-sm" />
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
                <th className="pb-3 font-medium">Agregado</th>
                <th className="pb-3 font-medium">Estado</th>
                <th className="pb-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {[...waiting, ...rest].map(e => (
                <tr key={e.id} className="table-row">
                  <td className="py-3 font-medium text-gray-800">{e.client_name || '—'}</td>
                  <td className="py-3 text-gray-500">{e.phone}</td>
                  <td className="py-3 text-gray-700">{e.service}</td>
                  <td className="py-3 text-gray-400 text-xs">{formatDateTime(e.added_at)}</td>
                  <td className="py-3">
                    <span className={`badge flex items-center gap-1 w-fit ${
                      e.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                      e.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      <Clock size={11} />
                      {e.status === 'waiting' ? 'En espera' : e.status === 'confirmed' ? 'Confirmado' : e.status}
                    </span>
                  </td>
                  <td className="py-3">
                    {e.status === 'waiting' && (
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(e.id, 'confirmed')}
                          className="flex items-center gap-1 text-xs text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors">
                          <CheckCircle size={13} /> Confirmar
                        </button>
                        <button onClick={() => updateStatus(e.id, 'cancelled')}
                          className="flex items-center gap-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                          <XCircle size={13} /> Cancelar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">Sin entradas en lista de espera</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
