/**
 * lib/game/item.ts
 *
 * Port exato das funções PHP:
 *   - GenerarHexItem()      → generateHexItem()
 *   - SmartSearch()         → smartSearch()
 *   - InsertItemWarehouse() → insertItemToWarehouse()
 *
 * O warehouse do MU Online é um array binário de 120 slots (8 cols × 15 rows).
 * Cada slot = 16 bytes = 32 hex chars uppercase.
 * Total warehouse = 3840 hex chars.
 */

import sql from 'mssql'
import type { ConnectionPool } from 'mssql'

// ─── Constantes ───────────────────────────────────────────────────────────────

const WAREHOUSE_COLS = 8
const WAREHOUSE_ROWS = 15
const SLOT_HEX_LEN = 32         // 16 bytes × 2 chars/byte
const EMPTY_SLOT_MARKER = 'FF'  // primeiro byte de slot vazio

// Tamanho (X, Y) de cada grupo de item no grid do warehouse
export const ITEM_SIZES: Record<number, [number, number]> = {
  0:  [1, 3],  // Swords
  1:  [2, 3],  // Axes
  2:  [1, 3],  // Maces
  3:  [2, 4],  // Spears
  4:  [1, 3],  // Bows
  5:  [1, 3],  // Staffs
  6:  [2, 3],  // Shields
  7:  [2, 2],  // Helmets
  8:  [2, 3],  // Armors
  9:  [2, 3],  // Pants
  10: [2, 2],  // Gloves
  11: [2, 2],  // Boots
  12: [2, 4],  // Wings
  13: [1, 1],  // Misc / Jewels
  14: [2, 3],  // Wings & Orbs
  15: [1, 2],  // Scrolls
}

// ─── Utilitários ──────────────────────────────────────────────────────────────

function toHex(value: number, bytes: number): string {
  return value.toString(16).toUpperCase().padStart(bytes * 2, '0')
}

// ─── Gerar Serial do Item ──────────────────────────────────────────────────────

/**
 * Chama WZ_GetItemSerial2 para obter um serial único de 4 bytes (8 hex chars).
 * Port de: exec WZ_GetItemSerial2 $SerialItem
 */
export async function generateItemSerial(db: ConnectionPool): Promise<string> {
  const result = await db.request().query(`
    DECLARE @serial INT
    EXEC WZ_GetItemSerial2 @serial OUTPUT
    SELECT @serial AS serial
  `)
  const serialNum: number = result.recordset[0]?.serial ?? 0
  return toHex(serialNum, 4)
}

// ─── Gerar Hex do Item ────────────────────────────────────────────────────────

export interface ItemHexParams {
  serial: string    // 8 hex chars de WZ_GetItemSerial2
  iGrupo: number    // 0-15
  iIndex: number    // índice do item no grupo
  level: number     // 0-15
  durability: number // 0-255 (255 = max)
  skill: boolean
  luck: boolean
  life: number      // 0-28 (Life option, múltiplos de 4: 0,4,8,12,16,20,24,28)
  exeOP: number     // bitmask excellent (soma de: 1,2,4,8,16,32)
  setOP: number     // ancient set option (0-63)
  hhOP: number      // harmony option (0-28)
  op380: boolean
  sockets: number[] // 5 valores; 255 = slot vazio, use 0xFE para "sem opção"
}

/**
 * Gera a representação hexadecimal de 32 chars de um item para inserção no warehouse.
 * Port exato de GenerarHexItem() do PHP (class.webshop.php linha 296).
 */
export function generateHexItem(p: ItemHexParams): string {
  // ── Byte 0-1: Item Index
  // Se iGrupo >= 9, o item index é offset por 512 * (grupo - 9 + 1) no client
  // Na prática, o índice armazenado = iIndex (o grupo vai no byte 18)
  const itemIndexByte = toHex(p.iIndex, 1)

  // ── Byte 2-3: LevelLifeSkillLuck (byte composto)
  // v = Level*8 + Life(adjusted) + Skill*128 + Luck*4
  let llsl = p.level * 8
  if (p.luck)  llsl += 4
  if (p.skill) llsl += 128
  // Life: se >= 4, armazena (life - 4); senão armazena life direto
  if (p.life >= 4) llsl += (p.life - 4)
  else             llsl += p.life

  // ── Byte 4-5: Durability
  const durabilityHex = toHex(p.durability, 1)

  // ── Bytes 6-13: Serial (8 chars = 4 bytes)
  const serialHex = p.serial.toUpperCase().padStart(8, '0')

  // ── Bytes 14-15: ExeOP (Excellent options bitmask)
  const exeHex = toHex(p.exeOP, 1)

  // ── Bytes 16-17: SetOP (Ancient)
  const setHex = toHex(p.setOP, 1)

  // ── Byte 18: Item Group (1 hex char)
  const groupHex = p.iGrupo.toString(16).toUpperCase()

  // ── Byte 19: Op380 (8 se ativo, 0 caso contrário)
  const op380Hex = p.op380 ? '8' : '0'

  // ── Bytes 20-21: Harmony (HHOP)
  const harmonyHex = toHex(p.hhOP, 1)

  // ── Bytes 22-31: Sockets 1-5 (2 chars cada)
  const sockets = [...p.sockets]
  while (sockets.length < 5) sockets.push(0xFF) // preencher não usados com FF
  const socketHex = sockets.slice(0, 5).map(s => toHex(s & 0xFF, 1)).join('')

  // Montar o hex completo (32 chars)
  const hex = (
    itemIndexByte +       // 2 chars (byte 0)
    toHex(llsl & 0xFF, 1) + // 2 chars (byte 1 - LevelLifeSkillLuck)
    durabilityHex +       // 2 chars (byte 2)
    '00' +                // byte 3 (padding/reserved)
    serialHex +           // 8 chars (bytes 4-7)
    exeHex +              // 2 chars (byte 8 - ExeOP)
    '00' +                // byte 9 (padding)
    setHex +              // 2 chars (byte 10 - SetOP)
    '00' +                // byte 11 (padding)
    groupHex +            // 1 char (byte 12, nibble high - iGrupo)
    op380Hex +            // 1 char (byte 12, nibble low - Op380)
    harmonyHex +          // 2 chars (byte 13 - Harmony)
    socketHex             // 10 chars (bytes 14-18, sockets 1-5)
  ).toUpperCase()

  if (hex.length !== SLOT_HEX_LEN) {
    throw new Error(`generateHexItem: hex length ${hex.length} !== ${SLOT_HEX_LEN}`)
  }

  return hex
}

// ─── SmartSearch — Encontrar slot livre no warehouse ──────────────────────────

/**
 * Encontra o primeiro slot livre no warehouse para um item de sizeX × sizeY.
 * Port de SmartSearch() do PHP (class.webshop.php linha 373).
 *
 * @param warehouseHex  Hex do warehouse (3840 chars = 120 slots × 32 chars)
 * @param sizeX         Largura do item em colunas
 * @param sizeY         Altura do item em linhas
 * @returns             Índice do slot (0-119) ou 1337 se sem espaço
 */
export function smartSearch(warehouseHex: string, sizeX: number, sizeY: number): number {
  // Normalizar para 3840 chars (preencher com FF se warehouse menor)
  const totalSlots = WAREHOUSE_COLS * WAREHOUSE_ROWS
  const padded = warehouseHex.toUpperCase().padEnd(totalSlots * SLOT_HEX_LEN, 'F')

  // Ler estado de cada slot (true = livre)
  const free: boolean[] = []
  for (let i = 0; i < totalSlots; i++) {
    const start = i * SLOT_HEX_LEN
    const firstByte = padded.substring(start, start + 2)
    free.push(firstByte === EMPTY_SLOT_MARKER || firstByte === '00')
  }

  // Varrer o grid procurando espaço sizeX × sizeY
  for (let row = 0; row <= WAREHOUSE_ROWS - sizeY; row++) {
    for (let col = 0; col <= WAREHOUSE_COLS - sizeX; col++) {
      let fits = true
      outer: for (let dy = 0; dy < sizeY; dy++) {
        for (let dx = 0; dx < sizeX; dx++) {
          const slot = (row + dy) * WAREHOUSE_COLS + (col + dx)
          if (!free[slot]) { fits = false; break outer }
        }
      }
      if (fits) return row * WAREHOUSE_COLS + col
    }
  }

  return 1337 // warehouse cheio
}

// ─── Inserir item no warehouse ────────────────────────────────────────────────

/**
 * Lê o warehouse do personagem, insere o item no slot encontrado e salva.
 * Port de InsertItemWarehouse() do PHP (class.webshop.php linha 336).
 *
 * @param db          Conexão SQL
 * @param accountId   AccountID do personagem (campo AccountID na tabela warehouse)
 * @param slot        Slot retornado pelo smartSearch (0-119)
 * @param itemHex     Hex de 32 chars gerado por generateHexItem
 */
export async function insertItemToWarehouse(
  db: ConnectionPool,
  accountId: string,
  slot: number,
  itemHex: string
): Promise<void> {
  // 1. Ler warehouse atual como hex string
  const readResult = await db.request()
    .input('accountId', sql.VarChar, accountId)
    .query(
      `SELECT CONVERT(VARCHAR(MAX), Items, 2) AS warehouseHex
       FROM warehouse
       WHERE AccountID = @accountId`
    )

  const currentHex: string = (readResult.recordset[0]?.warehouseHex ?? '').toUpperCase()

  // Garantir tamanho mínimo para o slot alvo
  const minLen = (slot + 1) * SLOT_HEX_LEN
  const padded = currentHex.padEnd(minLen, 'F')

  // 2. Substituir os 32 chars na posição do slot
  const pos = slot * SLOT_HEX_LEN
  const newHex =
    padded.substring(0, pos) +
    itemHex.toUpperCase() +
    padded.substring(pos + SLOT_HEX_LEN)

  // 3. Atualizar o warehouse com o novo hex
  await db.request()
    .input('accountId', sql.VarChar, accountId)
    .query(
      `UPDATE warehouse
       SET Items = 0x${newHex}
       WHERE AccountID = @accountId`
    )
}

// ─── Helper: buscar hex do warehouse para SmartSearch ────────────────────────

export async function getWarehouseHex(db: ConnectionPool, accountId: string): Promise<string> {
  const result = await db.request()
    .input('accountId', sql.VarChar, accountId)
    .query(
      `SELECT CONVERT(VARCHAR(MAX), Items, 2) AS warehouseHex
       FROM warehouse
       WHERE AccountID = @accountId`
    )
  return (result.recordset[0]?.warehouseHex ?? '').toUpperCase()
}
