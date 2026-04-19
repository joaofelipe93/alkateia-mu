import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db/pool'
import { T } from '@/lib/db/tables'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = await getDb()
    const result = await db.request().query(
      `SELECT news_id, news_title, news_author, news_date, allow_comments
       FROM ${T.NEWS}
       ORDER BY news_date DESC`
    )
    return NextResponse.json({
      ok: true,
      count: result.recordset.length,
      table: T.NEWS,
      rows: result.recordset.map(r => ({
        ...r,
        news_title_preview: r.news_title?.slice?.(0, 40),
      })),
    })
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack?.split('\n').slice(0, 5) : undefined,
    }, { status: 500 })
  }
}
