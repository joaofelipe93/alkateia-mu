import { NextRequest, NextResponse } from 'next/server'
import sql from 'mssql'
import { getDb } from '@/lib/db/pool'
import { CRON_TASKS, CRON_FILE_MAP } from '@/lib/cron/tasks'

/**
 * GET /api/cron/[id]?key=YOUR_CRON_KEY
 *
 * Executa um job específico independente do schedule e status.
 * Usado pelo Admin Panel → Cron Jobs → "Executar agora".
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const key = req.nextUrl.searchParams.get('key')
  if (!process.env.CRON_API_KEY || key !== process.env.CRON_API_KEY) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 403 })
  }

  const { id } = await params
  const jobId = parseInt(id)
  if (isNaN(jobId)) {
    return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 })
  }

  try {
    const db = await getDb()
    const result = await db.request()
      .input('id', sql.Int, jobId)
      .query(`
        SELECT * FROM WEBENGINE_CRON
        WHERE cron_id = @id OR id = @id
      `)

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Cron job not found' }, { status: 404 })
    }

    const job = result.recordset[0]
    const fileRun: string = String(job.cron_file_run ?? '')
    const taskKey = CRON_FILE_MAP[fileRun] ?? fileRun.replace('.php', '').replace(/_/g, '-')

    let message = 'Task not mapped'
    if (CRON_TASKS[taskKey] && taskKey !== 'noop') {
      message = await CRON_TASKS[taskKey]()
    }

    const now = Math.floor(Date.now() / 1000)
    const idCol = job.cron_id !== undefined ? 'cron_id' : 'id'
    await db.request()
      .input('now', sql.Int, now)
      .input('id',  sql.Int, job[idCol])
      .query(`UPDATE WEBENGINE_CRON SET cron_last_run = @now WHERE ${idCol} = @id`)

    return NextResponse.json({
      code: 200,
      job: job.cron_name ?? fileRun,
      result: message,
      timestamp: now,
    })

  } catch (err) {
    console.error('[api/cron/id]', err)
    return NextResponse.json(
      { code: 500, error: (err as Error).message },
      { status: 500 }
    )
  }
}
