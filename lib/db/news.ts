import sql from 'mssql'
import { unstable_cache } from 'next/cache'
import { getDb } from './pool'
import { T } from './tables'

export interface NewsItem {
  news_id: number
  news_title: string       // base64 decoded
  news_author: string
  news_date: number        // unix timestamp
  news_content: string     // base64 decoded
  allow_comments: number
}

function decodeBase64(value: string | null): string {
  if (!value) return ''
  try {
    return Buffer.from(value, 'base64').toString('utf-8')
  } catch {
    return value
  }
}

function decodeNewsRow(row: Record<string, unknown>): NewsItem {
  return {
    news_id: Number(row.news_id),
    news_title: decodeBase64(row.news_title as string),
    news_author: (row.news_author as string) ?? 'Staff',
    news_date: Number(row.news_date),
    news_content: decodeBase64(row.news_content as string),
    allow_comments: Number(row.allow_comments) || 0,
  }
}

async function _getNewsList(limit = 10, offset = 0): Promise<NewsItem[]> {
  const db = await getDb()
  const total = limit + offset
  const result = await db.request()
    .input('total', sql.Int, total)
    .query(
      `SELECT TOP (@total) news_id, news_title, news_author, news_date, news_content, allow_comments
       FROM ${T.NEWS}
       ORDER BY news_date DESC`
    )
  return result.recordset.slice(offset).map(decodeNewsRow)
}

async function _getNewsById(id: number): Promise<NewsItem | null> {
  const db = await getDb()
  const result = await db.request()
    .input('id', sql.Int, id)
    .query(
      `SELECT news_id, news_title, news_author, news_date, news_content, allow_comments
       FROM ${T.NEWS}
       WHERE news_id = @id`
    )
  if (result.recordset.length === 0) return null
  return decodeNewsRow(result.recordset[0])
}

async function _getNewsCount(): Promise<number> {
  const db = await getDb()
  const result = await db.request().query(`SELECT COUNT(*) AS total FROM ${T.NEWS}`)
  return result.recordset[0]?.total ?? 0
}

export const getNewsList = unstable_cache(_getNewsList, ['news-list'], {
  revalidate: 300,
  tags: ['news'],
})

export function getNewsById(id: number): Promise<NewsItem | null> {
  return unstable_cache(
    () => _getNewsById(id),
    ['news-item', String(id)],
    { revalidate: 300, tags: ['news'] }
  )()
}

export const getNewsCount = unstable_cache(_getNewsCount, ['news-count'], {
  revalidate: 300,
  tags: ['news'],
})
