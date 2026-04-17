import sql from 'mssql'
import { getDb } from './pool'
import { T, C } from './tables'
import type { MembInfo } from '@/types/auth'

export async function userExists(username: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.request()
    .input('username', sql.VarChar, username)
    .query(`SELECT TOP 1 1 FROM ${T.MEMB_INFO} WHERE ${C.USERNAME} = @username`)
  return result.recordset.length > 0
}

export async function validateUser(username: string, password: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.request()
    .input('username', sql.VarChar, username)
    .input('password', sql.VarChar, password)
    .query(
      `SELECT TOP 1 1 FROM ${T.MEMB_INFO}
       WHERE ${C.USERNAME} = @username
         AND ${C.PASSWORD} = @password`
    )
  return result.recordset.length > 0
}

export async function getUserByUsername(username: string): Promise<MembInfo | null> {
  const db = await getDb()
  const result = await db.request()
    .input('username', sql.VarChar, username)
    .query(`SELECT TOP 1 * FROM ${T.MEMB_INFO} WHERE ${C.USERNAME} = @username`)
  return result.recordset[0] ?? null
}

export async function getUserById(id: number): Promise<MembInfo | null> {
  const db = await getDb()
  const result = await db.request()
    .input('id', sql.Int, id)
    .query(`SELECT TOP 1 * FROM ${T.MEMB_INFO} WHERE ${C.MEMBER_ID} = @id`)
  return result.recordset[0] ?? null
}

export async function isAccountBlocked(username: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.request()
    .input('username', sql.VarChar, username)
    .query(
      `SELECT TOP 1 ${C.BLOCKED} FROM ${T.MEMB_INFO}
       WHERE ${C.USERNAME} = @username AND ${C.BLOCKED} = 1`
    )
  return result.recordset.length > 0
}
