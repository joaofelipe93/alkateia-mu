import sql from 'mssql'
import { getDb } from './pool'
import { T, C, CHARACTER_CLASSES } from './tables'

export interface CharacterData {
  Name: string
  AccountID: string
  Class: number
  className: string
  cLevel: number
  ResetCount: number
  MasterResetCount: number
  Strength: number
  Dexterity: number
  Vitality: number
  Energy: number
  Leadership: number
  LevelUpPoint: number
  Money: number
  MapNumber: number
  MapPosX: number
  MapPosY: number
  PkCount: number
  PkLevel: number
  PkTime: number
}

export interface MembStatData {
  ConnectStat: number
  ConnectTM: string | null
  ServerName: string | null
  IP: string | null
  OnlineHours: number | null
}

function mapCharacter(row: Record<string, unknown>): CharacterData {
  return {
    Name: row.Name as string,
    AccountID: row.AccountID as string,
    Class: row.Class as number,
    className: CHARACTER_CLASSES[row.Class as number] ?? `Classe ${row.Class}`,
    cLevel: row.cLevel as number,
    ResetCount: (row.ResetCount as number) ?? 0,
    MasterResetCount: (row.MasterResetCount as number) ?? 0,
    Strength: row.Strength as number,
    Dexterity: row.Dexterity as number,
    Vitality: row.Vitality as number,
    Energy: row.Energy as number,
    Leadership: (row.Leadership as number) ?? 0,
    LevelUpPoint: (row.LevelUpPoint as number) ?? 0,
    Money: (row.Money as number) ?? 0,
    MapNumber: (row.MapNumber as number) ?? 0,
    MapPosX: (row.MapPosX as number) ?? 0,
    MapPosY: (row.MapPosY as number) ?? 0,
    PkCount: (row.PkCount as number) ?? 0,
    PkLevel: (row.PkLevel as number) ?? 0,
    PkTime: (row.PkTime as number) ?? 0,
  }
}

/** Lista todos os personagens de uma conta */
export async function getAccountCharacters(username: string): Promise<CharacterData[]> {
  const db = await getDb()
  const result = await db.request()
    .input('account', sql.VarChar, username)
    .query(
      `SELECT Name, AccountID, Class, cLevel, ResetCount, MasterResetCount,
              Strength, Dexterity, Vitality, Energy, Leadership, LevelUpPoint,
              Money, MapNumber, MapPosX, MapPosY, PkCount, PkLevel, PkTime
       FROM ${T.CHARACTER}
       WHERE AccountID = @account
       ORDER BY cLevel DESC`
    )
  return result.recordset.map(mapCharacter)
}

/** Busca um personagem pelo nome */
export async function getCharacterByName(name: string): Promise<CharacterData | null> {
  const db = await getDb()
  const result = await db.request()
    .input('name', sql.VarChar, name)
    .query(
      `SELECT Name, AccountID, Class, cLevel, ResetCount, MasterResetCount,
              Strength, Dexterity, Vitality, Energy, Leadership, LevelUpPoint,
              Money, MapNumber, MapPosX, MapPosY, PkCount, PkLevel, PkTime
       FROM ${T.CHARACTER}
       WHERE Name = @name`
    )
  return result.recordset[0] ? mapCharacter(result.recordset[0]) : null
}

/** Verifica se o personagem pertence à conta */
export async function characterBelongsToAccount(name: string, username: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.request()
    .input('name', sql.VarChar, name)
    .input('account', sql.VarChar, username)
    .query(
      `SELECT TOP 1 1 FROM ${T.CHARACTER}
       WHERE Name = @name AND AccountID = @account`
    )
  return result.recordset.length > 0
}

/** Verifica se a conta está online */
export async function isAccountOnline(username: string): Promise<boolean> {
  const db = await getDb()
  const result = await db.request()
    .input('username', sql.VarChar, username)
    .query(
      `SELECT TOP 1 ${C.CONN_STAT} FROM ${T.MEMB_STAT}
       WHERE ${C.MS_USERNAME} = @username AND ${C.CONN_STAT} = 1`
    )
  return result.recordset.length > 0
}

/** Dados de conexão da conta (último login, status) */
export async function getMembStat(username: string): Promise<MembStatData | null> {
  const db = await getDb()
  const result = await db.request()
    .input('username', sql.VarChar, username)
    .query(
      `SELECT ConnectStat, ConnectTM, ServerName, IP, OnlineHours
       FROM ${T.MEMB_STAT}
       WHERE ${C.MS_USERNAME} = @username`
    )
  return result.recordset[0] ?? null
}

/** Stats base por classe (para reset de stats) */
const BASE_STATS: Record<number, { str: number; agi: number; vit: number; ene: number; cmd: number }> = {
  // Dark Wizard / Soul Master / Grand Master
  0: { str: 18, agi: 18, vit: 15, ene: 30, cmd: 0 },
  1: { str: 18, agi: 18, vit: 15, ene: 30, cmd: 0 },
  2: { str: 18, agi: 18, vit: 15, ene: 30, cmd: 0 },
  3: { str: 18, agi: 18, vit: 15, ene: 30, cmd: 0 },
  // Dark Knight / Blade Knight / Blade Master
  16: { str: 28, agi: 20, vit: 25, ene: 10, cmd: 0 },
  17: { str: 28, agi: 20, vit: 25, ene: 10, cmd: 0 },
  18: { str: 28, agi: 20, vit: 25, ene: 10, cmd: 0 },
  19: { str: 28, agi: 20, vit: 25, ene: 10, cmd: 0 },
  // Fairy Elf / Muse Elf / High Elf
  32: { str: 22, agi: 25, vit: 20, ene: 15, cmd: 0 },
  33: { str: 22, agi: 25, vit: 20, ene: 15, cmd: 0 },
  34: { str: 22, agi: 25, vit: 20, ene: 15, cmd: 0 },
  35: { str: 22, agi: 25, vit: 20, ene: 15, cmd: 0 },
  // Magic Gladiator / Duel Master
  48: { str: 26, agi: 26, vit: 26, ene: 16, cmd: 0 },
  49: { str: 26, agi: 26, vit: 26, ene: 16, cmd: 0 },
  50: { str: 26, agi: 26, vit: 26, ene: 16, cmd: 0 },
  // Dark Lord / Lord Emperor
  64: { str: 26, agi: 20, vit: 20, ene: 15, cmd: 25 },
  65: { str: 26, agi: 20, vit: 20, ene: 15, cmd: 25 },
  66: { str: 26, agi: 20, vit: 20, ene: 15, cmd: 25 },
  // Summoner / Bloody Summoner / Dimension Master
  80: { str: 21, agi: 21, vit: 18, ene: 23, cmd: 0 },
  81: { str: 21, agi: 21, vit: 18, ene: 23, cmd: 0 },
  82: { str: 21, agi: 21, vit: 18, ene: 23, cmd: 0 },
  83: { str: 21, agi: 21, vit: 18, ene: 23, cmd: 0 },
  // Rage Fighter / Fist Master
  96: { str: 32, agi: 27, vit: 25, ene: 20, cmd: 0 },
  97: { str: 32, agi: 27, vit: 25, ene: 20, cmd: 0 },
  98: { str: 32, agi: 27, vit: 25, ene: 20, cmd: 0 },
}

export function getBaseStats(classCode: number) {
  const base = BASE_STATS[classCode] ?? BASE_STATS[Math.floor(classCode / 16) * 16] ?? { str: 20, agi: 20, vit: 20, ene: 20, cmd: 0 }
  return base
}
