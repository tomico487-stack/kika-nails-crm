'use client'
import { useEffect, useState } from 'react'
import { supabase, type Service } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Check, X, Scissors } from 'lucide-react'

export default function ServiciosPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Service>>({})
  const [adding, setAdding] = useState(false)
  const [newService, setNewService] = useState({ name: '', duration: 60, price: 0, description: '' })

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('services').select('*').order('name')
    setServices(data || [])
    setLoading(false)
  }

  async function saveEdit(id: string) {
    await supabase.from('services').update(editData).eq('id', id)
    setEditId(null); setEditData({})
    load()
  }

  async function toggleActive(id: string, active: boolean) {
    await supabase.from('services').update({ active: !active }).eq('id', id)
    load()
  }

  async function addService() {
    if (!newService.name || !newService.price) return
    await supabase.from('services').insert({ ...newService, active: true })
    setNewService({ name: '', duration: 60, price: 0, description: '' })
    setAdding(false)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Servicios y Precios</h1>
          <p className="page-subtitle">{services.filter(s => s.active).length} servicios activos</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-primary">
          <Plus size={16} /> Nuevo servicio
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="card mt-6 border-2 border-purple-300">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Scissors size={18} className="text-purple-600" /> Nuevo servicio
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 font-medium">Nombre *</label>
              <input value={newService.name} onChange={e => setNewService({ ...newService, name: e.target.value })}
                className="input mt-1" placeholder="Ej: Manicura gel" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Precio (ARS) *</label>
              <input type="number" value={newService.price} onChange={e => setNewService({ ...newService, price: +e.target.value })}
                className="input mt-1" placeholder="0" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Duración (minutos)</label>
              <input type="number" value={newService.duration} onChange={e => setNewService({ ...newService, duration: +e.target.value })}
                className="input mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Descripción</label>
              <input value={newService.description} onChange={e => setNewService({ ...newService, description: e.target.value })}
                className="input mt-1" placeholder="Descripción opcional" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addService} className="btn-primary"><Check size={15} /> Guardar</button>
            <button onClick={() => setAdding(false)} className="btn-secondary"><X size={15} /> Cancelar</button>
          </div>
        </div>
      )}

      <div className="card mt-6">
        {loading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Cargando…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-purple-100">
                <th className="pb-3 font-medium">Servicio</th>
                <th className="pb-3 font-medium">Descripción</th>
                <th className="pb-3 font-medium">Duración</th>
                <th className="pb-3 font-medium">Precio</th>
                <th className="pb-3 font-medium">Estado</th>
                <th className="pb-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id} className="table-row">
                  <td className="py-3">
                    {editId === s.id ? (
                      <input value={editData.name ?? s.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className="input py-1 text-xs" />
                    ) : (
                      <span className="font-medium text-gray-800">{s.name}</span>
                    )}
                  </td>
                  <td className="py-3 text-gray-500">
                    {editId === s.id ? (
                      <input value={editData.description ?? s.description ?? ''} onChange={e => setEditData({ ...editData, description: e.target.value })} className="input py-1 text-xs" />
                    ) : s.description || '—'}
                  </td>
                  <td className="py-3 text-gray-600">
                    {editId === s.id ? (
                      <input type="number" value={editData.duration ?? s.duration} onChange={e => setEditData({ ...editData, duration: +e.target.value })} className="input py-1 text-xs w-20" />
                    ) : `${s.duration} min`}
                  </td>
                  <td className="py-3 font-semibold text-purple-700">
                    {editId === s.id ? (
                      <input type="number" value={editData.price ?? s.price} onChange={e => setEditData({ ...editData, price: +e.target.value })} className="input py-1 text-xs w-28" />
                    ) : formatCurrency(s.price)}
                  </td>
                  <td className="py-3">
                    <button onClick={() => toggleActive(s.id, s.active)}
                      className={`badge cursor-pointer ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.active ? '✓ Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="py-3">
                    {editId === s.id ? (
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(s.id)} className="text-green-600 hover:text-green-700"><Check size={16} /></button>
                        <button onClick={() => { setEditId(null); setEditData({}) }} className="text-red-400 hover:text-red-500"><X size={16} /></button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditId(s.id); setEditData({}) }} className="text-purple-400 hover:text-purple-600">
                        <Pencil size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">Sin servicios cargados</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
