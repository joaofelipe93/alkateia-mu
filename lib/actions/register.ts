'use server'

import sql from 'mssql'
import { z } from 'zod'
import { getDb } from '@/lib/db/pool'
import { T, C } from '@/lib/db/tables'

const registerSchema = z.object({
  username: z
    .string()
    .min(4, 'Usuário deve ter pelo menos 4 caracteres')
    .max(10, 'Usuário deve ter no máximo 10 caracteres')
    .regex(/^[a-zA-Z0-9]+$/, 'Apenas letras e números são permitidos'),
  password: z
    .string()
    .min(4, 'Senha deve ter pelo menos 4 caracteres')
    .max(20, 'Senha deve ter no máximo 20 caracteres'),
  confirmPassword: z.string(),
  email: z.string().email('E-mail inválido').max(50, 'E-mail muito longo'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

export type RegisterState = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

function generateSerial(): number {
  // Gera um número de 8 dígitos aleatório para sno__numb
  return Math.floor(10000000 + Math.random() * 90000000)
}

export async function registerAction(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const raw = {
    username: formData.get('username') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
    email: formData.get('email') as string,
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { username, password, email } = parsed.data

  try {
    const db = await getDb()

    // Verificar se usuário já existe
    const userCheck = await db.request()
      .input('username', sql.VarChar, username)
      .query(`SELECT TOP 1 1 FROM ${T.MEMB_INFO} WHERE ${C.USERNAME} = @username`)
    if (userCheck.recordset.length > 0) {
      return { success: false, error: 'Este nome de usuário já está em uso.' }
    }

    // Verificar se e-mail já existe
    const emailCheck = await db.request()
      .input('email', sql.VarChar, email)
      .query(`SELECT TOP 1 1 FROM ${T.MEMB_INFO} WHERE ${C.EMAIL} = @email`)
    if (emailCheck.recordset.length > 0) {
      return { success: false, error: 'Este e-mail já está cadastrado.' }
    }

    // Criar conta
    const serial = generateSerial()
    await db.request()
      .input('username', sql.VarChar(10), username)
      .input('password', sql.VarChar(20), password)
      .input('memb_name', sql.VarChar(10), username)
      .input('serial', sql.Int, serial)
      .input('email', sql.VarChar(50), email)
      .query(
        `INSERT INTO ${T.MEMB_INFO}
         (${C.USERNAME}, ${C.PASSWORD}, ${C.MEMB_NAME}, ${C.SNO}, ${C.EMAIL}, ${C.BLOCKED}, ${C.CTL1})
         VALUES (@username, @password, @memb_name, @serial, @email, 0, 0)`
      )

    return { success: true }
  } catch (err) {
    console.error('[register]', err)
    return { success: false, error: 'Erro interno. Tente novamente.' }
  }
}
