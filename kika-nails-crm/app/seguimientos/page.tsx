'use client'
import { useEffect, useState } from 'react'
import { supabase, type Incident } from '@/lib/supabase'
import { formatDateTime, statusColor, statusLabel } from '@/lib/utils'
import { Search, AlertTriangle } from 'lucide-react'

export default function SeguimientosPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('incidents').select('*').order('created_at', { ascending: false })
    setIncidents(data || [])
    setLoading(false)
  }

  async function resolve(id: string) {
    await supabase.from('incidents').update({ status: 'resolved' }).eq('id', id)
    load()
  }

  const filtered = incidents.filter(i => {
    const matchSearch = i.client_name?.toLowerCase().includes(search.toLowerCase()) || i.phone?.includes(search)
    const matchFilter = filter === 'all' ? true : i.status === filter
    return matchSearch && matchFilter
  })

  const typeLabel: Record<string, string> = {
    complaint: '😤 Queja',
    escalation: '📞 Escalado',
    refund: '💸 Reembolso',
    other: '📋 Otro',
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <AlertTriangle size={24} className="text-orange-500" />
        <h1 className="page-title">Seguimientos</h1>
      </div>
      <p className="page-subtitle">Incidencias y casos que requieren atención</p>

      <div className="flex items-center gap-3 mt-6 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cliente…" className="input pl-9" />
        </div>
        {(['all', 'open', 'resolved'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f ? 'bg-purple-600 text-white' : 'bg-white border border-purple-200 text-gray-600 hover:bg-purple-50'
            }`}>
            {f === 'all' ? 'Todos' : f === 'open' ? '🔴 Abiertos' : '✅ Resueltos'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading && <p className="text-sm text-gray-400 text-center py-8">Cargando…</p>}
        {filtered.map(i => (
          <div key={i.id} className={`card flex items-start gap-4 ${i.status === 'open' ? 'border-l-4 border-l-orange-400' : ''}`}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-800">{i.client_name || '—'}</span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500">{i.phone}</span>
                <span className="badge bg-orange-100 text-orange-700 ml-1">{typeLabel[i.type] || i.type}</span>
                <span className={`badge ml-1 ${statusColor(i.status)}`}>{statusLabel(i.status)}</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{i.description}</p>
              <p className="text-xs text-gray-400 mt-2">{formatDateTime(i.created_at)}</p>
            </div>
            {i.status === 'open' && (
              <button onClick={() => resolve(i.id)}
                className="btn-secondary text-green-700 bg-green-50 hover:bg-green-100 shrink-0">
                ✓ Resolver
              </button>
            )}
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="card text-center py-12 text-gray-400">
            <AlertTriangle size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm">Sin seguimientos</p>
          </div>
        )}
      </div>
    </div>
  )
}
