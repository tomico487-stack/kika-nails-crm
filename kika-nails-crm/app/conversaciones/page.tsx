'use client'
import { useEffect, useState } from 'react'
import { supabase, type Conversation, type Message } from '@/lib/supabase'
import { formatDateTime } from '@/lib/utils'
import { Search, MessageSquare } from 'lucide-react'

export default function ConversacionesPage() {
  const [convs, setConvs] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('conversations').select('*').order('last_message_at', { ascending: false })
      setConvs(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = convs.filter(c => c.phone?.includes(search))

  const messages: Message[] = selected
    ? (typeof selected.messages === 'string' ? JSON.parse(selected.messages) : selected.messages) || []
    : []

  return (
    <div>
      <h1 className="page-title">Conversaciones</h1>
      <p className="page-subtitle">Historial de chats de WhatsApp</p>

      <div className="mt-6 flex gap-4 h-[calc(100vh-200px)]">
        {/* List */}
        <div className="w-72 shrink-0 flex flex-col gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar teléfono…" className="input pl-9" />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {loading && <p className="text-sm text-gray-400 text-center py-4">Cargando…</p>}
            {filtered.map(c => {
              const msgs: Message[] = typeof c.messages === 'string' ? JSON.parse(c.messages) : (c.messages || [])
              const last = msgs[msgs.length - 1]
              return (
                <div key={c.id} onClick={() => setSelected(c)}
                  className={`bg-white border rounded-xl px-4 py-3 cursor-pointer transition-all ${
                    selected?.id === c.id ? 'border-purple-500 shadow-sm' : 'border-purple-100 hover:border-purple-300'
                  }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                      {c.phone?.[0]}
                    </div>
                    <p className="text-sm font-medium text-gray-800">{c.phone}</p>
                  </div>
                  {last && (
                    <p className="text-xs text-gray-400 truncate">
                      {last.role === 'assistant' ? '🤖 ' : '👤 '}{last.content}
                    </p>
                  )}
                  <p className="text-xs text-gray-300 mt-1">{formatDateTime(c.last_message_at)}</p>
                </div>
              )
            })}
            {!loading && filtered.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Sin conversaciones</p>
            )}
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 bg-white border border-purple-100 rounded-2xl flex flex-col overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center flex-col gap-3 text-gray-300">
              <MessageSquare size={48} />
              <p className="text-sm">Seleccioná una conversación</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-purple-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                  {selected.phone?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{selected.phone}</p>
                  <p className="text-xs text-gray-400">{messages.length} mensajes</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#faf8ff]">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm ${
                      m.role === 'user'
                        ? 'bg-purple-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 border border-purple-100 rounded-bl-sm shadow-sm'
                    }`}>
                      <p>{m.content}</p>
                      <p className={`text-xs mt-1 ${m.role === 'user' ? 'text-purple-200' : 'text-gray-400'}`}>
                        {formatDateTime(m.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-center text-sm text-gray-400">Sin mensajes</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
