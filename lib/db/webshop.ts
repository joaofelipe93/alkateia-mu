import sql from 'mssql'
import { getDb } from './pool'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ShopItem {
  Id: number
  iGrupo: number
  iIndex: number
  Name: string
  Descripcion: string
  Precio: number
  Activo: number
  X: number
  Y: number
  MinLevel: number
  MaxLevel: number
  MinLevelLife: number
  MaxLevelLife: number
  MinOpExe: number
  MaxOpExe: number
  MaxSockets: number
}

export interface ShopPurchaseLog {
  username: string
  character: string
  iGrupo: number
  itemName: string
  level: number
  skill: boolean
  luck: boolean
  life: number
  exeOP: number
  setOP: number
  harmony: number
  op380: boolean
  sockets: number[]
  totalPrice: number
  currency: string
  remainingBalance: number
}

// ─── Categorias ───────────────────────────────────────────────────────────────

export const SHOP_CATEGORIES = [
  { grupo: 0,  label: 'Espadas',   icon: '⚔️' },
  { grupo: 1,  label: 'Machados',  icon: '🪓' },
  { grupo: 2,  label: 'Maças',     icon: '🔨' },
  { grupo: 3,  label: 'Lanças',    icon: '🏹' },
  { grupo: 4,  label: 'Arcos',     icon: '🏹' },
  { grupo: 5,  label: 'Bastões',   icon: '🪄' },
  { grupo: 6,  label: 'Escudos',   icon: '🛡️' },
  { grupo: 7,  label: 'Elmos',     icon: '⛑️' },
  { grupo: 8,  label: 'Armaduras', icon: '🥋' },
  { grupo: 9,  label: 'Calças',    icon: '👖' },
  { grupo: 10, label: 'Luvas',     icon: '🧤' },
  { grupo: 11, label: 'Botas',     icon: '👢' },
  { grupo: 12, label: 'Asas',      icon: '🦋' },
  { grupo: 13, label: 'Misc',      icon: '💎' },
  { grupo: 14, label: 'Outros',    icon: '✨' },
  { grupo: 15, label: 'Pergaminhos', icon: '📜' },
] as const

// ─── Queries de itens ─────────────────────────────────────────────────────────

export async function getShopItems(grupo?: number): Promise<ShopItem[]> {
  const db = await getDb()
  const req = db.request()
  let query = `SELECT * FROM WEBENGINE_ITEMS_WEBSHOP WHERE Activo = 1`
  if (grupo !== undefined) {
    req.input('grupo', sql.Int, grupo)
    query += ` AND iGrupo = @grupo`
  }
  query += ` ORDER BY iGrupo, iIndex`
  const result = await req.query(query)
  return result.recordset
}

export async function getShopItemById(id: number): Promise<ShopItem | null> {
  const db = await getDb()
  const result = await db.request()
    .input('id', sql.Int, id)
    .query(`SELECT TOP 1 * FROM WEBENGINE_ITEMS_WEBSHOP WHERE Id = @id AND Activo = 1`)
  return result.recordset[0] ?? null
}

// ─── WCoinP (CashShopData) ────────────────────────────────────────────────────

export async function getCashShopBalance(username: string): Promise<number> {
  const db = await getDb()
  const result = await db.request()
    .input('username', sql.VarChar, username)
    .query(`SELECT TOP 1 WCoinP FROM CashShopData WHERE AccountID = @username`)
  return (result.recordset[0]?.WCoinP as number) ?? 0
}

export async function subtractCashShop(username: string, amount: number): Promise<void> {
  const db = await getDb()
  await db.request()
    .input('username', sql.VarChar, username)
    .input('amount', sql.Int, amount)
    .query(
      `UPDATE CashShopData
       SET WCoinP = WCoinP - @amount
       WHERE AccountID = @username`
    )
}

// ─── Log de compra ────────────────────────────────────────────────────────────

export async function logShopPurchase(data: ShopPurchaseLog): Promise<void> {
  const db = await getDb()
  const sockets = [...data.sockets]
  while (sockets.length < 5) sockets.push(0xFF)

  await db.request()
    .input('Grupo', sql.Int, data.iGrupo)
    .input('Usuario', sql.VarChar, data.username)
    .input('Personaje', sql.VarChar, data.character)
    .input('Item', sql.VarChar, data.itemName)
    .input('NivelItem', sql.Int, data.level)
    .input('Skill', sql.Int, data.skill ? 1 : 0)
    .input('Luck', sql.Int, data.luck ? 1 : 0)
    .input('OpLife', sql.Int, data.life)
    .input('OpExe', sql.Int, data.exeOP)
    .input('Acc', sql.Int, data.setOP)
    .input('Harmony', sql.Int, data.harmony)
    .input('Op380', sql.Int, data.op380 ? 1 : 0)
    .input('Socket1', sql.Int, sockets[0])
    .input('Socket2', sql.Int, sockets[1])
    .input('Socket3', sql.Int, sockets[2])
    .input('Socket4', sql.Int, sockets[3])
    .input('Socket5', sql.Int, sockets[4])
    .input('PrecioTotal', sql.Int, data.totalPrice)
    .input('Moneda', sql.VarChar, data.currency)
    .input('SaldoRestante', sql.Int, data.remainingBalance)
    .input('Fecha', sql.Int, Math.floor(Date.now() / 1000))
    .query(
      `INSERT INTO WEBENGINE_WEBSHOP_LOGS
       (Grupo, Usuario, Personaje, Item, NivelItem, Skill, Luck, OpLife, OpExe, Acc,
        Harmony, Op380, Socket1, Socket2, Socket3, Socket4, Socket5,
        PrecioTotal, Moneda, SaldoRestante, Fecha)
       VALUES (@Grupo, @Usuario, @Personaje, @Item, @NivelItem, @Skill, @Luck, @OpLife,
               @OpExe, @Acc, @Harmony, @Op380, @Socket1, @Socket2, @Socket3, @Socket4,
               @Socket5, @PrecioTotal, @Moneda, @SaldoRestante, @Fecha)`
    )
}

// Preço dinâmico está em lib/game/pricing.ts (pode ser importado por client components)
export { calculateSemiPrice } from '@/lib/game/pricing'
export type { SemiPriceOptions } from '@/lib/game/pricing'
