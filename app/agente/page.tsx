'use client'
import { useEffect, useState } from 'react'
import { supabase, type BotConfig } from '@/lib/supabase'
import { Bot, Save, RefreshCw, CreditCard, CheckCircle2, XCircle, Eye, EyeOff, ExternalLink } from 'lucide-react'

const CONFIG_LABELS: Record<string, { label: string; desc: string; type: 'text' | 'textarea' | 'number' | 'time_range' }> = {
  business_name:          { label: 'Nombre del negocio',        desc: 'Nombre que usa el bot al presentarse',         type: 'text' },
  owner_name:             { label: 'Nombre de la dueña',         desc: 'Nombre de Mica para el bot',                  type: 'text' },
  bot_personality:        { label: 'Personalidad del bot',       desc: 'Cómo se comporta y qué tono usa el agente',   type: 'textarea' },
  welcome_message:        { label: 'Mensaje de bienvenida',      desc: 'Primer mensaje al recibir un cliente nuevo',  type: 'textarea' },
  business_hours:         { label: 'Horario de atención',        desc: 'Ej: Lunes a Viernes 9:00-18:00',              type: 'text' },
  reminder_24h_template:  { label: 'Template recordatorio 24h',  desc: 'Usa {nombre}, {hora}, {servicio}, {fecha}',   type: 'textarea' },
  reminder_1h_template:   { label: 'Template recordatorio 1h',   desc: 'Usa {nombre}, {hora}, {servicio}',            type: 'textarea' },
  deposit_percentage:     { label: 'Porcentaje de seña (%)',      desc: 'Ej: 30 significa 30% del precio del servicio', type: 'number' },
  cancellation_hours:     { label: 'Horas mínimas para cancelar', desc: 'Cuántas horas antes puede cancelar el cliente', type: 'number' },
  max_appointments_per_day: { label: 'Turnos máximos por día',   desc: 'Límite de turnos que acepta el sistema por día', type: 'number' },
}

const SECTIONS = [
  { title: '🏪 Negocio', keys: ['business_name', 'owner_name', 'business_hours'] },
  { title: '🤖 Personalidad del Agente', keys: ['bot_personality', 'welcome_message'] },
  { title: '⏰ Recordatorios', keys: ['reminder_24h_template', 'reminder_1h_template'] },
  { title: '⚙️ Configuración de Turnos', keys: ['deposit_percentage', 'cancellation_hours', 'max_appointments_per_day'] },
]

export default function AgentePage() {
  const [config, setConfig] = useState<Record<string, BotConfig>>({})
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
    const [mpToken, setMpToken] = useState('')
      const [mpSaved, setMpSaved] = useState(false)
        const [mpSaving, setMpSaving] = useState(false)
          const [mpConnected, setMpConnected] = useState(false)
            const [mpShowToken, setMpShowToken] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('bot_config').select('*')
    const map: Record<string, BotConfig> = {}
    const vals: Record<string, string> = {}
        ;(data || []).forEach((c: BotConfig) => {
                map[c.key] = c; vals[c.key] = c.value
                      if (c.key === 'mercadopago_token' && c.value) { setMpToken(c.value); setMpConnected(true) }
                          })
        })
    setConfig(map); setValues(vals)
    setLoading(false)
  }

  async function save(key: string) {
    setSaving(s => ({ ...s, [key]: true }))
    const existing = config[key]
    if (existing) {
      await supabase.from('bot_config').update({ value: values[key] }).eq('key', key)
    } else {
      await supabase.from('bot_config').insert({ key, value: values[key], description: CONFIG_LABELS[key]?.desc || '' })
    }
    setSaving(s => ({ ...s, [key]: false }))
    setSaved(s => ({ ...s, [key]: true }))
    setTimeout(() => setSaved(s => ({ ...s, [key]: false })), 2000)
    load()
  }

    async function saveMpToken() {
        if (!mpToken.trim()) return
            setMpSaving(true)
                const existing = config['mercadopago_token']
                    if (existing) {
                          await supabase.from('bot_config').update({ value: mpToken.trim() }).eq('key', 'mercadopago_token')
                              } else {
                                    await supabase.from('bot_config').insert({ key: 'mercadopago_token', value: mpToken.trim(), description: 'Access token de Mercado Pago' })
                                        }
                                            setMpSaving(false); setMpSaved(true); setMpConnected(true)
                                                setTimeout(() => setMpSaved(false), 2500)
                                                    load()
                                                      }

                                                        async function disconnectMp() {
                                                            await supabase.from('bot_config').delete().eq('key', 'mercadopago_token')
                                                                setMpToken(''); setMpConnected(false)
                                                                    load()
                                                                      }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3 text-gray-400">
        <RefreshCw size={20} className="animate-spin" />
        <span>Cargando configuración…</span>
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <Bot size={28} className="text-purple-600" />
        <h1 className="page-title">Cerebro del Agente</h1>
      </div>
      <p className="page-subtitle">Configurá el comportamiento del agente receptcionista IA</p>

      <div className="space-y-6 mt-6">
        {SECTIONS.map(({ title, keys }) => (
          <div key={title} className="card">
            <h2 className="font-semibold text-gray-800 text-base mb-5">{title}</h2>
            <div className="space-y-5">
              {keys.map(key => {
                const meta = CONFIG_LABELS[key]
                if (!meta) return null
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{meta.label}</label>
                    <p className="text-xs text-gray-400 mb-2">{meta.desc}</p>
                    <div className="flex gap-3 items-start">
                      {meta.type === 'textarea' ? (
                        <textarea rows={3} value={values[key] || ''} onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                          className="input resize-none flex-1" />
                      ) : meta.type === 'number' ? (
                        <input type="number" value={values[key] || ''} onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                          className="input w-40" />
                      ) : (
                        <input type="text" value={values[key] || ''} onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                          className="input flex-1" />
                      )}
                      <button onClick={() => save(key)} disabled={saving[key]}
                        className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          saved[key] ? 'bg-green-500 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}>
                        <Save size={14} />
                        {saved[key] ? '¡Guardado!' : saving[key] ? 'Guardando…' : 'Guardar'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

                <div className="card border-2 border-dashed border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                                                    <CreditCard size={20} className="text-blue-600" />
                                                                                  </div>
                                                                                                <div>
                                                                                                                <h2 className="font-semibold text-gray-800 text-base">Mercado Pago</h2>
                                                                                                                                <p className="text-xs text-gray-400">Integracion para cobros y links de pago</p>
                                                                                                                                              </div>
                                                                                                                                                          </div>
                                                                                                                                                                      <div className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${
                                                                                                                                                                                    mpConnected ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                                                                                                                                                                                                }`}>
                                                                                                                                                                                                              {mpConnected ? <><CheckCircle2 size={14} /> Conectado</> : <><XCircle size={14} /> No configurado</>}
                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                              <p className="text-sm text-gray-500 mb-4">
                                                                                                                                                                                                                                                          Pega el <strong>Access Token</strong> de Mercado Pago de Kika Nails. Lo encontras en{' '}
                                                                                                                                                                                                                                                                      <a href="https://www.mercadopago.com.ar/developers/panel/app" target="_blank" rel="noopener noreferrer"
                                                                                                                                                                                                                                                                                    className="text-blue-600 hover:underline inline-flex items-center gap-1">
                                                                                                                                                                                                                                                                                                  Panel de Desarrolladores <ExternalLink size={11} />
                                                                                                                                                                                                                                                                                                              </a>{' '}Tu aplicacion - Credenciales de produccion.
                                                                                                                                                                                                                                                                                                                        </p>
                                                                                                                                                                                                                                                                                                                                  <div className="flex gap-3 items-center">
                                                                                                                                                                                                                                                                                                                                              <div className="relative flex-1">
                                                                                                                                                                                                                                                                                                                                                            <input
                                                                                                                                                                                                                                                                                                                                                                            type={mpShowToken ? 'text' : 'password'}
                                                                                                                                                                                                                                                                                                                                                                                            value={mpToken}
                                                                                                                                                                                                                                                                                                                                                                                                            onChange={e => setMpToken(e.target.value)}
                                                                                                                                                                                                                                                                                                                                                                                                                            placeholder="APP_USR-xxxxxxxxxxxxxxxx..."
                                                                                                                                                                                                                                                                                                                                                                                                                                            className="input w-full pr-10"
                                                                                                                                                                                                                                                                                                                                                                                                                                                          />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <button onClick={() => setMpShowToken(v => !v)}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        {mpShowToken ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      </button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <button onClick={saveMpToken} disabled={mpSaving || !mpToken.trim()}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            mpSaved ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40'
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          }`}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <Save size={14} />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      {mpSaved ? 'Conectado!' : mpSaving ? 'Guardando...' : 'Conectar'}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  </button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              {mpConnected && (
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <button onClick={disconnectMp}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            className="shrink-0 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            Desconectar
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      )}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          {mpConnected && (
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      <p className="text-xs text-green-600 mt-3 flex items-center gap-1">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <CheckCircle2 size={12} />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  Token guardado. El agente puede generar links de pago automaticamente.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              </p>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        )}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                </div>
      </div>
    </div>
  )
}
