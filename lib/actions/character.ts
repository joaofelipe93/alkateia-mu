'use server'

import sql from 'mssql'
import { z } from 'zod'
import { auth } from '@/auth'
import { getDb } from '@/lib/db/pool'
import { T, C } from '@/lib/db/tables'
import {
  getCharacterByName,
  characterBelongsToAccount,
  isAccountOnline,
  getBaseStats,
} from '@/lib/db/character'
import { validateUser } from '@/lib/db/account'

export type ActionResult = { success: boolean; message: string }

async function getSession() {
  const session = await auth()
  if (!session) throw new Error('Não autorizado.')
  return session
}

async function assertOffline(username: string) {
  if (await isAccountOnline(username)) {
    throw new Error('Sua conta precisa estar offline para realizar esta ação.')
  }
}

async function assertCharacterOwned(charName: string, username: string) {
  if (!(await characterBelongsToAccount(charName, username))) {
    throw new Error('Personagem não encontrado nesta conta.')
  }
}

// ─── Alterar Senha ───────────────────────────────────────────────────────────

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Informe a senha atual'),
  newPassword: z.string().min(4, 'Mínimo 4 caracteres').max(20, 'Máximo 20 caracteres'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'As senhas não coincidem', path: ['confirmPassword'],
})

export async function changePassword(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const session = await getSession()
    await assertOffline(session.user.username)

    const parsed = changePasswordSchema.safeParse({
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword'),
      confirmPassword: formData.get('confirmPassword'),
    })
    if (!parsed.success) return { success: false, message: parsed.error.issues[0].message }

    const valid = await validateUser(session.user.username, parsed.data.currentPassword)
    if (!valid) return { success: false, message: 'Senha atual incorreta.' }

    const db = await getDb()
    await db.request()
      .input('password', sql.VarChar, parsed.data.newPassword)
      .input('userid', sql.Int, parseInt(session.user.id))
      .query(`UPDATE ${T.MEMB_INFO} SET ${C.PASSWORD} = @password WHERE ${C.MEMBER_ID} = @userid`)

    return { success: true, message: 'Senha alterada com sucesso.' }
  } catch (e) {
    return { success: false, message: (e as Error).message }
  }
}

// ─── Adicionar Stats ──────────────────────────────────────────────────────────

const addStatsSchema = z.object({
  character: z.string().min(1),
  str: z.coerce.number().int().min(0).max(32767),
  agi: z.coerce.number().int().min(0).max(32767),
  vit: z.coerce.number().int().min(0).max(32767),
  ene: z.coerce.number().int().min(0).max(32767),
  cmd: z.coerce.number().int().min(0).max(32767),
})

export async function addStats(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const session = await getSession()
    await assertOffline(session.user.username)

    const parsed = addStatsSchema.safeParse({
      character: formData.get('character'),
      str: formData.get('str') || 0,
      agi: formData.get('agi') || 0,
      vit: formData.get('vit') || 0,
      ene: formData.get('ene') || 0,
      cmd: formData.get('cmd') || 0,
    })
    if (!parsed.success) return { success: false, message: 'Valores inválidos.' }

    const { character, str, agi, vit, ene, cmd } = parsed.data
    const total = str + agi + vit + ene + cmd
    if (total <= 0) return { success: false, message: 'Adicione pelo menos 1 ponto.' }

    await assertCharacterOwned(character, session.user.username)
    const charData = await getCharacterByName(character)
    if (!charData) return { success: false, message: 'Personagem não encontrado.' }

    if (charData.LevelUpPoint < total) {
      return { success: false, message: `Pontos insuficientes. Disponível: ${charData.LevelUpPoint}` }
    }

    const db = await getDb()
    await db.request()
      .input('str', sql.Int, charData.Strength + str)
      .input('agi', sql.Int, charData.Dexterity + agi)
      .input('vit', sql.Int, charData.Vitality + vit)
      .input('ene', sql.Int, charData.Energy + ene)
      .input('cmd', sql.Int, charData.Leadership + cmd)
      .input('total', sql.Int, total)
      .input('name', sql.VarChar, character)
      .query(
        `UPDATE ${T.CHARACTER}
         SET Strength = @str, Dexterity = @agi, Vitality = @vit,
             Energy = @ene, Leadership = @cmd,
             LevelUpPoint = LevelUpPoint - @total
         WHERE Name = @name`
      )

    return { success: true, message: `${total} pontos distribuídos com sucesso.` }
  } catch (e) {
    return { success: false, message: (e as Error).message }
  }
}

// ─── Reset de Stats ───────────────────────────────────────────────────────────

export async function resetStats(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const session = await getSession()
    await assertOffline(session.user.username)

    const character = formData.get('character') as string
    if (!character) return { success: false, message: 'Selecione um personagem.' }

    await assertCharacterOwned(character, session.user.username)
    const charData = await getCharacterByName(character)
    if (!charData) return { success: false, message: 'Personagem não encontrado.' }

    const base = getBaseStats(charData.Class)
    const currentTotal = charData.Strength + charData.Dexterity + charData.Vitality + charData.Energy + charData.Leadership
    const baseTotal = base.str + base.agi + base.vit + base.ene + base.cmd
    const pointsReturn = currentTotal - baseTotal

    const db = await getDb()
    await db.request()
      .input('str', sql.Int, base.str)
      .input('agi', sql.Int, base.agi)
      .input('vit', sql.Int, base.vit)
      .input('ene', sql.Int, base.ene)
      .input('cmd', sql.Int, base.cmd)
      .input('points', sql.Int, charData.LevelUpPoint + pointsReturn)
      .input('name', sql.VarChar, character)
      .query(
        `UPDATE ${T.CHARACTER}
         SET Strength = @str, Dexterity = @agi, Vitality = @vit,
             Energy = @ene, Leadership = @cmd, LevelUpPoint = @points
         WHERE Name = @name`
      )

    return { success: true, message: `Stats resetados. ${pointsReturn} pontos devolvidos.` }
  } catch (e) {
    return { success: false, message: (e as Error).message }
  }
}

// ─── Reset de Personagem (Level → 1) ─────────────────────────────────────────

export async function resetCharacter(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const session = await getSession()
    await assertOffline(session.user.username)

    const character = formData.get('character') as string
    if (!character) return { success: false, message: 'Selecione um personagem.' }

    await assertCharacterOwned(character, session.user.username)
    const charData = await getCharacterByName(character)
    if (!charData) return { success: false, message: 'Personagem não encontrado.' }

    if (charData.cLevel < 400) {
      return { success: false, message: 'É necessário estar no nível 400 para resetar.' }
    }

    const db = await getDb()
    await db.request()
      .input('name', sql.VarChar, character)
      .query(
        `UPDATE ${T.CHARACTER}
         SET cLevel = 1, ResetCount = ResetCount + 1, LevelUpPoint = 0
         WHERE Name = @name`
      )

    return { success: true, message: `Reset realizado! ${charData.Name} agora tem ${charData.ResetCount + 1} reset(s).` }
  } catch (e) {
    return { success: false, message: (e as Error).message }
  }
}

// ─── Unstick ──────────────────────────────────────────────────────────────────

export async function unstickCharacter(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const session = await getSession()
    await assertOffline(session.user.username)

    const character = formData.get('character') as string
    if (!character) return { success: false, message: 'Selecione um personagem.' }

    await assertCharacterOwned(character, session.user.username)
    const charData = await getCharacterByName(character)
    if (!charData) return { success: false, message: 'Personagem não encontrado.' }

    if (charData.MapNumber === 0 && charData.MapPosX === 125 && charData.MapPosY === 125) {
      return { success: false, message: 'Personagem já está em local seguro.' }
    }

    const db = await getDb()
    await db.request()
      .input('name', sql.VarChar, character)
      .query(
        `UPDATE ${T.CHARACTER}
         SET MapNumber = 0, MapPosX = 125, MapPosY = 125
         WHERE Name = @name`
      )

    return { success: true, message: 'Personagem movido para Lorencia (125, 125).' }
  } catch (e) {
    return { success: false, message: (e as Error).message }
  }
}

// ─── Limpar PK ────────────────────────────────────────────────────────────────

export async function clearPK(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const session = await getSession()
    await assertOffline(session.user.username)

    const character = formData.get('character') as string
    if (!character) return { success: false, message: 'Selecione um personagem.' }

    await assertCharacterOwned(character, session.user.username)
    const charData = await getCharacterByName(character)
    if (!charData) return { success: false, message: 'Personagem não encontrado.' }

    if (charData.PkLevel <= 3) {
      return { success: false, message: 'Personagem não está com status PK.' }
    }

    const db = await getDb()
    await db.request()
      .input('name', sql.VarChar, character)
      .query(
        `UPDATE ${T.CHARACTER}
         SET PkCount = 0, PkLevel = 3, PkTime = 0
         WHERE Name = @name`
      )

    return { success: true, message: 'Status PK limpo com sucesso.' }
  } catch (e) {
    return { success: false, message: (e as Error).message }
  }
}
