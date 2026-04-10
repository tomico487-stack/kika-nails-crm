import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "d 'de' MMMM yyyy", { locale: es })
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr: string) {
  try {
    return format(parseISO(dateStr), "d MMM · HH:mm", { locale: es })
  } catch {
    return dateStr
  }
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount)
}

export function statusColor(status: string) {
  const map: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    blacklisted: 'bg-red-100 text-red-800',
    open: 'bg-orange-100 text-orange-800',
    resolved: 'bg-green-100 text-green-800',
    waiting: 'bg-yellow-100 text-yellow-800',
  }
  return map[status] ?? 'bg-gray-100 text-gray-800'
}

export function statusLabel(status: string) {
  const map: Record<string, string> = {
    confirmed: 'Confirmado',
    pending: 'Pendiente',
    cancelled: 'Cancelado',
    completed: 'Completado',
    active: 'Activo',
    blacklisted: 'Bloqueado',
    open: 'Abierto',
    resolved: 'Resuelto',
    waiting: 'En Espera',
  }
  return map[status] ?? status
}
