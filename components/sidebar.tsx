'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Calendar, Users, MessageSquare,
  Clock, Bell, AlertTriangle, Scissors, Bot
} from 'lucide-react'

const links = [
  { href: '/',                 label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/agenda',           label: 'Agenda',           icon: Calendar },
  { href: '/clientes',         label: 'Clientes',         icon: Users },
  { href: '/conversaciones',   label: 'Conversaciones',   icon: MessageSquare },
  { href: '/lista-espera',     label: 'Lista de Espera',  icon: Clock },
  { href: '/recordatorios',    label: 'Recordatorios',    icon: Bell },
  { href: '/seguimientos',     label: 'Seguimientos',     icon: AlertTriangle },
  { href: '/servicios',        label: 'Servicios',        icon: Scissors },
  { href: '/agente',           label: 'Cerebro del Agente', icon: Bot },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-64 bg-[#160d2e] flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-purple-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <span className="text-purple-700 font-bold text-sm">KN</span>
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">Kika Nails</p>
            <p className="text-purple-400 text-xs">Panel de gestión</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-purple-600/60 text-white'
                  : 'text-purple-300 hover:bg-purple-900/40 hover:text-white'
              }`}>
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-purple-900/50">
        <p className="text-purple-500 text-xs">Kika Nails © 2025</p>
        <p className="text-purple-600 text-xs">Powered by IA 💜</p>
      </div>
    </aside>
  )
}
