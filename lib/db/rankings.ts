import sql from 'mssql'
import { unstable_cache } from 'next/cache'
import { getDb } from './pool'
import { T, C, CHARACTER_CLASSES } from './tables'

export interface RankingEntry {
  position: number
  name: string
  class: string
  level?: number
  resets?: number
  grandResets?: number
  masterLevel?: number
  guild?: string
  score?: number
  family?: string
  contribution?: number
}

function getClassName(classCode: number): string {
  return CHARACTER_CLASSES[classCode] ?? `Classe ${classCode}`
}

// ─── Level Ranking ───
async function _getLevelRanking(limit = 100): Promise<RankingEntry[]> {
  const db = await getDb()
  const result = await db.request()
    .input('limit', sql.Int, limit)
    .query(
      `SELECT TOP (@limit)
         c.${C.CHAR_NAME}    AS name,
         c.${C.CHAR_CLASS}   AS class,
         c.${C.CHAR_LEVEL}   AS level,
         c.${C.CHAR_RESETS}  AS resets,
         c.${C.CHAR_GR}      AS grandResets,
         gm.${C.GUILD_NAME}  AS guild
       FROM ${T.CHARACTER} c
       LEFT JOIN ${T.GUILD_MEMBER} gm ON gm.Name = c.${C.CHAR_NAME}
       ORDER BY c.${C.CHAR_LEVEL} DESC, c.${C.CHAR_RESETS} DESC`
    )
  return result.recordset.map((row, i) => ({
    position: i + 1,
    name: row.name,
    class: getClassName(row.class),
    level: row.level,
    resets: row.resets,
    grandResets: row.grandResets,
    guild: row.guild ?? '',
  }))
}

// ─── Resets Ranking ───
async function _getResetsRanking(limit = 100): Promise<RankingEntry[]> {
  const db = await getDb()
  const result = await db.request()
    .input('limit', sql.Int, limit)
    .query(
      `SELECT TOP (@limit)
         c.${C.CHAR_NAME}    AS name,
         c.${C.CHAR_CLASS}   AS class,
         c.${C.CHAR_LEVEL}   AS level,
         c.${C.CHAR_RESETS}  AS resets,
         c.${C.CHAR_GR}      AS grandResets,
         gm.${C.GUILD_NAME}  AS guild
       FROM ${T.CHARACTER} c
       LEFT JOIN ${T.GUILD_MEMBER} gm ON gm.Name = c.${C.CHAR_NAME}
       ORDER BY c.${C.CHAR_RESETS} DESC, c.${C.CHAR_LEVEL} DESC`
    )
  return result.recordset.map((row, i) => ({
    position: i + 1,
    name: row.name,
    class: getClassName(row.class),
    level: row.level,
    resets: row.resets,
    grandResets: row.grandResets,
    guild: row.guild ?? '',
  }))
}

// ─── Grand Resets Ranking ───
async function _getGrandResetsRanking(limit = 100): Promise<RankingEntry[]> {
  const db = await getDb()
  const result = await db.request()
    .input('limit', sql.Int, limit)
    .query(
      `SELECT TOP (@limit)
         c.${C.CHAR_NAME}    AS name,
         c.${C.CHAR_CLASS}   AS class,
         c.${C.CHAR_LEVEL}   AS level,
         c.${C.CHAR_RESETS}  AS resets,
         c.${C.CHAR_GR}      AS grandResets,
         gm.${C.GUILD_NAME}  AS guild
       FROM ${T.CHARACTER} c
       LEFT JOIN ${T.GUILD_MEMBER} gm ON gm.Name = c.${C.CHAR_NAME}
       WHERE c.${C.CHAR_GR} > 0
       ORDER BY c.${C.CHAR_GR} DESC, c.${C.CHAR_RESETS} DESC`
    )
  return result.recordset.map((row, i) => ({
    position: i + 1,
    name: row.name,
    class: getClassName(row.class),
    level: row.level,
    resets: row.resets,
    grandResets: row.grandResets,
    guild: row.guild ?? '',
  }))
}

// ─── Guild Ranking ───
async function _getGuildRanking(limit = 50): Promise<RankingEntry[]> {
  const db = await getDb()
  const result = await db.request()
    .input('limit', sql.Int, limit)
    .query(
      `SELECT TOP (@limit)
         ${C.GUILD_NAME}  AS name,
         ${C.GUILD_MASTER} AS guild,
         ${C.GUILD_SCORE} AS score
       FROM ${T.GUILD}
       ORDER BY ${C.GUILD_SCORE} DESC`
    )
  return result.recordset.map((row, i) => ({
    position: i + 1,
    name: row.name,
    class: '',
    guild: row.guild ?? '',
    score: row.score,
  }))
}

// ─── Master Level Ranking ───
async function _getMasterRanking(limit = 100): Promise<RankingEntry[]> {
  const db = await getDb()
  const result = await db.request()
    .input('limit', sql.Int, limit)
    .query(
      `SELECT TOP (@limit)
         m.Name          AS name,
         m.MasterLevel   AS masterLevel,
         c.${C.CHAR_CLASS} AS class,
         c.${C.CHAR_RESETS} AS resets,
         gm.${C.GUILD_NAME} AS guild
       FROM ${T.MASTER_SKILL} m
       INNER JOIN ${T.CHARACTER} c ON c.${C.CHAR_NAME} = m.Name
       LEFT JOIN ${T.GUILD_MEMBER} gm ON gm.Name = m.Name
       ORDER BY m.MasterLevel DESC`
    )
  return result.recordset.map((row, i) => ({
    position: i + 1,
    name: row.name,
    class: getClassName(row.class),
    masterLevel: row.masterLevel,
    resets: row.resets,
    guild: row.guild ?? '',
  }))
}

// ─── Gens Ranking ───
async function _getGensRanking(limit = 100): Promise<RankingEntry[]> {
  const db = await getDb()
  const result = await db.request()
    .input('limit', sql.Int, limit)
    .query(
      `SELECT TOP (@limit)
         gr.${C.GENS_NAME}    AS name,
         gr.${C.GENS_FAMILY}  AS family,
         gr.${C.GENS_CONTRIB} AS contribution,
         c.${C.CHAR_CLASS}    AS class
       FROM ${T.GENS_RANK} gr
       INNER JOIN ${T.CHARACTER} c ON c.${C.CHAR_NAME} = gr.${C.GENS_NAME}
       ORDER BY gr.${C.GENS_CONTRIB} DESC`
    )
  return result.recordset.map((row, i) => ({
    position: i + 1,
    name: row.name,
    class: getClassName(row.class),
    family: row.family,
    contribution: row.contribution,
  }))
}

// ─── Cached exports ───
const cacheOpts = { revalidate: 300, tags: ['rankings'] }

export const getLevelRanking      = unstable_cache(_getLevelRanking, ['ranking-level'], cacheOpts)
export const getResetsRanking     = unstable_cache(_getResetsRanking, ['ranking-resets'], cacheOpts)
export const getGrandResetsRanking = unstable_cache(_getGrandResetsRanking, ['ranking-gr'], cacheOpts)
export const getGuildRanking      = unstable_cache(_getGuildRanking, ['ranking-guilds'], cacheOpts)
export const getMasterRanking     = unstable_cache(_getMasterRanking, ['ranking-master'], cacheOpts)
export const getGensRanking       = unstable_cache(_getGensRanking, ['ranking-gens'], cacheOpts)

export const RANKING_TYPES = [
  { key: 'level',       label: 'Top Level',       columns: ['Personagem', 'Classe', 'Level', 'Resets', 'Grand Resets', 'Guild'] },
  { key: 'resets',      label: 'Top Resets',      columns: ['Personagem', 'Classe', 'Level', 'Resets', 'Grand Resets', 'Guild'] },
  { key: 'grand-resets', label: 'Grand Resets',   columns: ['Personagem', 'Classe', 'Level', 'Resets', 'Grand Resets', 'Guild'] },
  { key: 'guilds',      label: 'Guilds',           columns: ['Guild', 'Master', 'Pontos'] },
  { key: 'master',      label: 'Master Level',     columns: ['Personagem', 'Classe', 'Master Level', 'Resets', 'Guild'] },
  { key: 'gens',        label: 'Gens',             columns: ['Personagem', 'Classe', 'Família', 'Contribuição'] },
] as const

export type RankingType = typeof RANKING_TYPES[number]['key']
