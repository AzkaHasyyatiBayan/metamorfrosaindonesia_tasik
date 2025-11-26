// app/lib/validation.ts
import { z } from 'zod'

export const eventSchema = z.object({
  title: z.string().min(1, 'Judul harus diisi').max(255, 'Judul terlalu panjang'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  date_time: z.string().refine((val) => new Date(val) > new Date(), {
    message: 'Tanggal harus di masa depan'
  }),
  location: z.string().min(1, 'Lokasi harus diisi'),
  category: z.array(z.string()).min(1, 'Pilih minimal 1 kategori'),
  max_participants: z.number().min(1).optional().nullable(),
  image_url: z.string().url('URL tidak valid').optional().or(z.literal('')),
})

export const registrationSchema = z.object({
  type: z.enum(['PARTICIPANT', 'VOLUNTEER']),
  notes: z.string().max(500, 'Catatan terlalu panjang').optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export type EventFormData = z.infer<typeof eventSchema>
export type RegistrationFormData = z.infer<typeof registrationSchema>
export type LoginFormData = z.infer<typeof loginSchema>