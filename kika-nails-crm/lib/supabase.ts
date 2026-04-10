import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export type Client = {
  id: string
  phone: string
  name: string
  status: string
  created_at: string
  notes?: string
}

export type Appointment = {
  id: string
  client_id: string
  phone: string
  service_name: string
  date: string
  time: string
  status: string
  amount: number
  deposit_paid: boolean
  payment_link?: string
  notes?: string
  created_at: string
}

export type Conversation = {
  id: string
  phone: string
  client_id: string
  messages: Message[]
  last_message_at: string
}

export type Message = {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export type Reminder = {
  id: string
  appointment_id: string
  phone: string
  client_name: string
  appointment_date: string
  appointment_time: string
  service_name: string
  type: string
  send_at: string
  sent: boolean
  sent_at?: string
}

export type WaitlistEntry = {
  id: string
  phone: string
  client_name: string
  service: string
  added_at: string
  status: string
  notes?: string
}

export type Incident = {
  id: string
  phone: string
  client_name: string
  type: string
  description: string
  status: string
  created_at: string
}

export type Service = {
  id: string
  name: string
  duration: number
  price: number
  active: boolean
  description?: string
}

export type BotConfig = {
  id: string
  key: string
  value: string
  description?: string
}

export type Finance = {
  id: string
  type: string
  amount: number
  concept: string
  created_at: string
}
