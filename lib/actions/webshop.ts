'use server'

import sql from 'mssql'
import { auth } from '@/auth'
import { getDb } from '@/lib/db/pool'
import {
  getShopItemById,
  getCashShopBalance,
  subtractCashShop,
  logShopPurchase,
} from '@/lib/db/webshop'
import { calculateSemiPrice } from '@/lib/game/pricing'
import { getCreditConfig, getCredits, addCredits } from '@/lib/db/credits'
import {
  generateItemSerial,
  generateHexItem,
  smartSearch,
  insertItemToWarehouse,
  getWarehouseHex,
  ITEM_SIZES,
} from '@/lib/game/item'
import { isAccountOnline, characterBelongsToAccount } from '@/lib/db/character'
import type { ActionResult } from './character'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getSessionOrThrow() {
  const session = await auth()
  if (!session) throw new Error('Não autorizado.')
  return session
}

type Currency = 'WCoinP' | 'WCoinC'

async function getBalance(username: string, userId: number, currency: Currency): Promise<number> {
  if (currency === 'WCoinP') return getCashShopBalance(username)
  const config = await getCreditConfig(parseInt(process.env.PIX_CREDIT_CONFIG_ID ?? '1'))
  if (!config) return 0
  return getCredits(config, username)
}

async function deductBalance(
  username: string,
  userId: number,
  currency: Currency,
  amount: number,
  character: string
): Promise<number> {
  if (currency === 'WCoinP') {
    await subtractCashShop(username, amount)
    return getCashShopBalance(username)
  }
  const configId = parseInt(process.env.PIX_CREDIT_CONFIG_ID ?? '1')
  const config = await getCreditConfig(configId)
  if (!config) throw new Error('Configuração de créditos não encontrada.')
  // Para deduzir, usamos addCredits com valor negativo via query direta
  const db = await getDb()
  await db.request()
    .input('amount', sql.Int, amount)
    .input('identifier', sql.VarChar, username)
    .query(
      `UPDATE ${config.config_table}
       SET ${config.config_credits_col} = ${config.config_credits_col} - @amount
       WHERE ${config.config_user_col} = @identifier`
    )
  return getCredits(config, username)
}

// ─── Compra básica ────────────────────────────────────────────────────────────

export async function buyBasicItem(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const session = await getSessionOrThrow()
    const { username, id: userId } = { username: session.user.username, id: parseInt(session.user.id) }

    if (await isAccountOnline(username)) {
      return { success: false, message: 'Sua conta precisa estar offline para comprar itens.' }
    }

    const itemId = parseInt(formData.get('itemId') as string)
    const character = formData.get('character') as string
    const currency = (formData.get('currency') as Currency) ?? 'WCoinP'

    if (!character) return { success: false, message: 'Selecione um personagem.' }
    if (!(await characterBelongsToAccount(character, username))) {
      return { success: false, message: 'Personagem não encontrado nesta conta.' }
    }

    const item = await getShopItemById(itemId)
    if (!item) return { success: false, message: 'Item não encontrado.' }

    const balance = await getBalance(username, userId, currency)
    if (balance < item.Precio) {
      return { success: false, message: `Saldo insuficiente. Você tem ${balance} ${currency}.` }
    }

    const db = await getDb()
    const serial = await generateItemSerial(db)
    const itemHex = generateHexItem({
      serial,
      iGrupo: item.iGrupo,
      iIndex: item.iIndex,
      level: 0,
      durability: 255,
      skill: false,
      luck: false,
      life: 0,
      exeOP: 0,
      setOP: 0,
      hhOP: 0,
      op380: false,
      sockets: [0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
    })

    const [sizeX, sizeY] = ITEM_SIZES[item.iGrupo] ?? [1, 2]
    const warehouseHex = await getWarehouseHex(db, character)
    const slot = smartSearch(warehouseHex, sizeX, sizeY)

    if (slot === 1337) return { success: false, message: 'Baú cheio! Libere espaço e tente novamente.' }

    await insertItemToWarehouse(db, character, slot, itemHex)
    const remaining = await deductBalance(username, userId, currency, item.Precio, character)

    await logShopPurchase({
      username, character, iGrupo: item.iGrupo, itemName: item.Name,
      level: 0, skill: false, luck: false, life: 0, exeOP: 0, setOP: 0,
      harmony: 0, op380: false, sockets: [0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
      totalPrice: item.Precio, currency, remainingBalance: remaining,
    })

    return { success: true, message: `${item.Name} enviado ao baú de ${character}.` }
  } catch (e) {
    return { success: false, message: (e as Error).message }
  }
}

// ─── Compra Semi/Full (com opções) ───────────────────────────────────────────

export async function buySemiItem(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const session = await getSessionOrThrow()
    const { username, id: userId } = { username: session.user.username, id: parseInt(session.user.id) }

    if (await isAccountOnline(username)) {
      return { success: false, message: 'Sua conta precisa estar offline para comprar itens.' }
    }

    const itemId   = parseInt(formData.get('itemId') as string)
    const character = formData.get('character') as string
    const currency  = (formData.get('currency') as Currency) ?? 'WCoinP'

    // Opções do item
    const level    = Math.min(13, Math.max(0, parseInt(formData.get('level') as string) || 0))
    const skill    = formData.get('skill') === '1'
    const luck     = formData.get('luck') === '1'
    const life     = Math.min(28, Math.max(0, parseInt(formData.get('life') as string) || 0))
    const exeOP    = parseInt(formData.get('exeOP') as string) || 0
    const setOP    = parseInt(formData.get('setOP') as string) || 0
    const hhOP     = parseInt(formData.get('hhOP') as string) || 0
    const op380    = formData.get('op380') === '1'
    const sockets  = [1,2,3,4,5].map(i =>
      parseInt(formData.get(`socket${i}`) as string ?? '255') & 0xFF
    )

    if (!character) return { success: false, message: 'Selecione um personagem.' }
    if (!(await characterBelongsToAccount(character, username))) {
      return { success: false, message: 'Personagem não encontrado nesta conta.' }
    }

    const item = await getShopItemById(itemId)
    if (!item) return { success: false, message: 'Item não encontrado.' }

    // Contar opções excellent selecionadas
    const exeCount = [1, 2, 4, 8, 16, 32].filter(bit => (exeOP & bit) !== 0).length

    // Preço total (sem custo extra por opção no config atual — todos 0)
    const totalPrice = calculateSemiPrice({
      basePrice: item.Precio,
      level, life, luck, skill,
      exeOPCount: exeCount,
      ancient: setOP > 0,
      op380, harmony: hhOP,
      socketCount: sockets.filter(s => s !== 0xFF).length,
    })

    const balance = await getBalance(username, userId, currency)
    if (balance < totalPrice) {
      return { success: false, message: `Saldo insuficiente. Você tem ${balance} ${currency}. Preço: ${totalPrice}.` }
    }

    const db = await getDb()
    const serial = await generateItemSerial(db)
    const itemHex = generateHexItem({
      serial,
      iGrupo: item.iGrupo,
      iIndex: item.iIndex,
      level, durability: 255,
      skill, luck, life, exeOP, setOP, hhOP, op380, sockets,
    })

    const [sizeX, sizeY] = ITEM_SIZES[item.iGrupo] ?? [1, 2]
    const warehouseHex = await getWarehouseHex(db, character)
    const slot = smartSearch(warehouseHex, sizeX, sizeY)

    if (slot === 1337) return { success: false, message: 'Baú cheio! Libere espaço e tente novamente.' }

    await insertItemToWarehouse(db, character, slot, itemHex)
    const remaining = await deductBalance(username, userId, currency, totalPrice, character)

    await logShopPurchase({
      username, character, iGrupo: item.iGrupo, itemName: item.Name,
      level, skill, luck, life, exeOP, setOP, harmony: hhOP, op380, sockets,
      totalPrice, currency, remainingBalance: remaining,
    })

    return { success: true, message: `${item.Name} (Lv ${level}) enviado ao baú de ${character}.` }
  } catch (e) {
    return { success: false, message: (e as Error).message }
  }
}

// buyFullItem usa a mesma lógica do semi
export const buyFullItem = buySemiItem
