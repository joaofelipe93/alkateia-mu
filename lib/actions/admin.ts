'use server'

import sql from 'mssql'
import { revalidatePath } from 'next/cache'

function invalidateNews() {
  revalidatePath('/news', 'page')
  revalidatePath('/news', 'layout')
  revalidatePath('/', 'page')
}
import { auth } from '@/auth'
import { getDb } from '@/lib/db/pool'
import { T, C } from '@/lib/db/tables'
import { getCreditConfig, addCredits } from '@/lib/db/credits'
import type { ActionResult } from './character'

async function assertAdmin() {
  const session = await auth()
  if (!session || session.user.adminLevel < 1) throw new Error('Acesso negado.')
  return session
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

export async function banAccount(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
    const id = parseInt(formData.get('userId') as string)
    if (isNaN(id)) return { success: false, message: 'ID inválido.' }
    const db = await getDb()
    await db.request()
      .input('id', sql.Int, id)
      .query(`UPDATE ${T.MEMB_INFO} SET ${C.BLOCKED} = 1 WHERE ${C.MEMBER_ID} = @id`)
    return { success: true, message: 'Conta banida com sucesso.' }
  } catch (e) { return { success: false, message: (e as Error).message } }
}

export async function unbanAccount(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
    const id = parseInt(formData.get('userId') as string)
    if (isNaN(id)) return { success: false, message: 'ID inválido.' }
    const db = await getDb()
    await db.request()
      .input('id', sql.Int, id)
      .query(`UPDATE ${T.MEMB_INFO} SET ${C.BLOCKED} = 0 WHERE ${C.MEMBER_ID} = @id`)
    return { success: true, message: 'Conta desbanida com sucesso.' }
  } catch (e) { return { success: false, message: (e as Error).message } }
}

export async function changeAccountPassword(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
    const id = parseInt(formData.get('userId') as string)
    const password = formData.get('password') as string
    if (isNaN(id) || !password || password.length < 4) {
      return { success: false, message: 'Senha inválida (mín 4 chars).' }
    }
    const db = await getDb()
    await db.request()
      .input('password', sql.VarChar, password)
      .input('id', sql.Int, id)
      .query(`UPDATE ${T.MEMB_INFO} SET ${C.PASSWORD} = @password WHERE ${C.MEMBER_ID} = @id`)
    return { success: true, message: 'Senha alterada com sucesso.' }
  } catch (e) { return { success: false, message: (e as Error).message } }
}

// ─── Characters ───────────────────────────────────────────────────────────────

export async function editCharacter(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const session = await assertAdmin()
    const name = formData.get('name') as string
    if (!name) return { success: false, message: 'Nome obrigatório.' }

    // Verificar se conta está offline
    const db = await getDb()
    const accountId = formData.get('accountId') as string
    if (accountId) {
      const online = await db.request()
        .input('username', sql.VarChar, accountId)
        .query(`SELECT TOP 1 ${C.CONN_STAT} FROM ${T.MEMB_STAT} WHERE ${C.MS_USERNAME} = @username AND ${C.CONN_STAT} = 1`)
      if (online.recordset.length > 0) {
        return { success: false, message: 'A conta precisa estar offline para editar o personagem.' }
      }
    }

    const f = (key: string) => parseInt(formData.get(key) as string) || 0
    await db.request()
      .input('name',    sql.VarChar, name)
      .input('level',   sql.Int, f('level'))
      .input('resets',  sql.Int, f('resets'))
      .input('gresets', sql.Int, f('gresets'))
      .input('points',  sql.Int, f('points'))
      .input('zen',     sql.BigInt, f('zen'))
      .input('pklevel', sql.Int, f('pklevel'))
      .input('str',     sql.Int, f('str'))
      .input('agi',     sql.Int, f('agi'))
      .input('vit',     sql.Int, f('vit'))
      .input('ene',     sql.Int, f('ene'))
      .input('cmd',     sql.Int, f('cmd'))
      .query(
        `UPDATE ${T.CHARACTER} SET
           ${C.CHAR_LEVEL}   = @level,
           ${C.CHAR_RESETS}  = @resets,
           ${C.CHAR_GR}      = @gresets,
           ${C.CHAR_POINTS}  = @points,
           Money             = @zen,
           ${C.CHAR_PK_LEVEL} = @pklevel,
           ${C.CHAR_STRENGTH}   = @str,
           ${C.CHAR_DEXTERITY}  = @agi,
           ${C.CHAR_VITALITY}   = @vit,
           ${C.CHAR_ENERGY}     = @ene,
           ${C.CHAR_LEADERSHIP} = @cmd
         WHERE ${C.CHAR_NAME} = @name`
      )
    return { success: true, message: `Personagem ${name} atualizado.` }
  } catch (e) { return { success: false, message: (e as Error).message } }
}

// ─── Bans ─────────────────────────────────────────────────────────────────────

export async function banByUsername(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
    const username = formData.get('username') as string
    const reason   = (formData.get('reason') as string) ?? ''
    if (!username) return { success: false, message: 'Usuário obrigatório.' }
    const db = await getDb()
    await db.request()
      .input('username', sql.VarChar, username)
      .query(`UPDATE ${T.MEMB_INFO} SET ${C.BLOCKED} = 1 WHERE ${C.USERNAME} = @username`)
    await db.request()
      .input('username', sql.VarChar, username)
      .input('reason',   sql.VarChar, reason)
      .input('date',     sql.Int, Math.floor(Date.now() / 1000))
      .query(`INSERT INTO ${T.BANS} (username, reason, ban_date) VALUES (@username, @reason, @date)`)
    return { success: true, message: `${username} banido.` }
  } catch (e) { return { success: false, message: (e as Error).message } }
}

export async function unbanByUsername(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
    const username = formData.get('username') as string
    if (!username) return { success: false, message: 'Usuário obrigatório.' }
    const db = await getDb()
    await db.request()
      .input('username', sql.VarChar, username)
      .query(`UPDATE ${T.MEMB_INFO} SET ${C.BLOCKED} = 0 WHERE ${C.USERNAME} = @username`)
    await db.request()
      .input('username', sql.VarChar, username)
      .query(`DELETE FROM ${T.BANS} WHERE username = @username`)
    return { success: true, message: `${username} desbanido.` }
  } catch (e) { return { success: false, message: (e as Error).message } }
}

export async function deleteBlockedIp(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
    const id = parseInt(formData.get('id') as string)
    const db = await getDb()
    await db.request().input('id', sql.Int, id).query(`DELETE FROM ${T.BLOCKED_IP} WHERE id = @id`)
    return { success: true, message: 'IP removido.' }
  } catch (e) { return { success: false, message: (e as Error).message } }
}

// ─── Credits Manager ──────────────────────────────────────────────────────────

export async function manageCredits(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
    const configId    = parseInt(formData.get('configId') as string)
    const identifier  = formData.get('identifier') as string
    const amount      = parseInt(formData.get('amount') as string)
    const transaction = formData.get('transaction') as 'add' | 'subtract'

    if (!identifier || isNaN(amount) || amount <= 0) {
      return { success: false, message: 'Dados inválidos.' }
    }

    const config = await getCreditConfig(configId)
    if (!config) return { success: false, message: 'Configuração não encontrada.' }

    const db = await getDb()
    if (transaction === 'subtract') {
      await db.request()
        .input('amount',     sql.Int, amount)
        .input('identifier', sql.VarChar, identifier)
        .query(
          `UPDATE ${config.config_table}
           SET ${config.config_credits_col} = ${config.config_credits_col} - @amount
           WHERE ${config.config_user_col} = @identifier`
        )
    } else {
      await addCredits(config, identifier, amount, 'admincp')
    }

    return { success: true, message: `${amount} créditos ${transaction === 'add' ? 'adicionados' : 'removidos'} de ${identifier}.` }
  } catch (e) { return { success: false, message: (e as Error).message } }
}

// ─── News ─────────────────────────────────────────────────────────────────────

export async function publishNews(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const session = await assertAdmin()
    const title   = formData.get('title') as string
    const content = formData.get('content') as string
    const author  = (formData.get('author') as string) || session.user.username

    if (!title || !content) return { success: false, message: 'Título e conteúdo são obrigatórios.' }

    const titleB64   = Buffer.from(title).toString('base64')
    const contentB64 = Buffer.from(content).toString('base64')
    const db = await getDb()
    await db.request()
      .input('title',   sql.VarChar, titleB64)
      .input('content', sql.VarChar(8000), contentB64)
      .input('author',  sql.VarChar, author)
      .input('date',    sql.Int, Math.floor(Date.now() / 1000))
      .query(
        `INSERT INTO ${T.NEWS} (news_title, news_content, news_author, news_date, allow_comments)
         VALUES (@title, @content, @author, @date, 1)`
      )
    invalidateNews()
    return { success: true, message: 'Notícia publicada com sucesso.' }
  } catch (e) { return { success: false, message: (e as Error).message } }
}

export async function updateNews(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
    const id      = parseInt(formData.get('id') as string)
    const title   = formData.get('title') as string
    const content = formData.get('content') as string
    const author  = formData.get('author') as string

    if (!title || !content) return { success: false, message: 'Título e conteúdo são obrigatórios.' }

    const titleB64   = Buffer.from(title).toString('base64')
    const contentB64 = Buffer.from(content).toString('base64')
    const db = await getDb()
    await db.request()
      .input('id',      sql.Int, id)
      .input('title',   sql.VarChar, titleB64)
      .input('content', sql.VarChar(8000), contentB64)
      .input('author',  sql.VarChar, author)
      .query(
        `UPDATE ${T.NEWS} SET news_title = @title, news_content = @content, news_author = @author
         WHERE news_id = @id`
      )
    invalidateNews()
    return { success: true, message: 'Notícia atualizada.' }
  } catch (e) { return { success: false, message: (e as Error).message } }
}

export async function deleteNews(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
    const id = parseInt(formData.get('id') as string)
    const db = await getDb()
    await db.request().input('id', sql.Int, id).query(`DELETE FROM ${T.NEWS} WHERE news_id = @id`)
    invalidateNews()
    return { success: true, message: 'Notícia deletada.' }
  } catch (e) { return { success: false, message: (e as Error).message } }
}

// ─── Cache ────────────────────────────────────────────────────────────────────

export async function clearCache(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
    const tags = (formData.get('tags') as string ?? '').split(',').filter(Boolean)
    // Invalidar paths correspondentes às tags
    for (const tag of tags) {
      if (tag === 'news')     { revalidatePath('/news', 'page'); revalidatePath('/', 'page') }
      if (tag === 'rankings') { revalidatePath('/rankings', 'layout') }
    }
    return { success: true, message: `Cache limpo: ${tags.join(', ')}` }
  } catch (e) { return { success: false, message: (e as Error).message } }
}

// ─── Cron ─────────────────────────────────────────────────────────────────────

export async function toggleCron(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
    const id     = parseInt(formData.get('id') as string)
    const active = parseInt(formData.get('active') as string)
    const db = await getDb()
    await db.request()
      .input('id', sql.Int, id)
      .input('active', sql.Int, active ? 0 : 1)
      .query(`UPDATE ${T.CRON} SET cron_active = @active WHERE id = @id`)
    return { success: true, message: `Cron job ${active ? 'desativado' : 'ativado'}.` }
  } catch (e) { return { success: false, message: (e as Error).message } }
}

export async function runCronNow(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
    const id = parseInt(formData.get('id') as string)
    const db = await getDb()
    await db.request()
      .input('id', sql.Int, id)
      .query(`UPDATE ${T.CRON} SET cron_last_run = 0 WHERE id = @id`)
    return { success: true, message: 'Cron resetado — será executado no próximo ciclo.' }
  } catch (e) { return { success: false, message: (e as Error).message } }
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function saveSettings(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
    const fs = await import('fs')
    const path = await import('path')
    const configPath = path.join(process.cwd(), '..', 'Downloads', 'alkateia-mu', 'includes', 'config', 'webengine.json')

    let existing: Record<string, unknown> = {}
    try { existing = JSON.parse(fs.readFileSync(configPath, 'utf-8')) } catch { /* ignore */ }

    const editableFields = [
      'server_name', 'website_title', 'website_meta_description',
      'server_info_season', 'server_info_exp', 'server_info_drop', 'server_info_masterexp',
      'ip_game_server', 'port_game_server',
      'social_link_discord', 'social_link_instagram', 'social_link_whatsapp',
      'language_default',
    ]

    for (const field of editableFields) {
      const val = formData.get(field)
      if (val !== null) existing[field] = val
    }

    fs.writeFileSync(configPath, JSON.stringify(existing, null, 4))
    return { success: true, message: 'Configurações salvas.' }
  } catch (e) { return { success: false, message: (e as Error).message } }
}
