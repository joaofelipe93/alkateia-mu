import { NextRequest, NextResponse } from 'next/server'
import sql from 'mssql'
import { getDb } from '@/lib/db/pool'
import { CRON_TASKS, CRON_FILE_MAP } from '@/lib/cron/tasks'

/**
 * GET /api/cron?key=YOUR_CRON_KEY
 *
 * Executa todos os cron jobs vencidos.
 * Configurar chamada periódica via cPanel ou serviço externo.
 *
 * Exemplo cPanel (a cada minuto):
 * * * * * curl -s "https://alkateiamu.com.br/api/cron?key=123456" > /dev/null
 */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key')

  if (!process.env.CRON_API_KEY || key !== process.env.CRON_API_KEY) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 403 })
  }

  const now = Math.floor(Date.now() / 1000)
  const executed: string[] = []
  const skipped: string[] = []
  const errors: string[] = []

  try {
    const db = await getDb()

    // Buscar cron jobs ativos — suporte a ambas as variações de nome de coluna
    const result = await db.request().query(`
      SELECT *
      FROM WEBENGINE_CRON
      WHERE cron_active = 1
         OR cron_status = 1
    `)

    for (const job of result.recordset) {
      const lastRun: number = (job.cron_last_run as number) ?? 0
      const interval: number = (job.cron_run_time as number) ?? 300
      const isDue = now > (lastRun === 0 ? 0 : lastRun + interval)

      if (!isDue) {
        skipped.push(String(job.cron_name ?? job.cron_file_run ?? job.id))
        continue
      }

      const fileRun: string = String(job.cron_file_run ?? '')
      const taskKey = CRON_FILE_MAP[fileRun] ?? fileRun.replace('.php', '').replace(/_/g, '-')

      if (taskKey === 'noop' || !CRON_TASKS[taskKey]) {
        // Task não mapeada — apenas atualiza last_run sem executar
        const idCol = job.cron_id !== undefined ? 'cron_id' : 'id'
        await db.request()
          .input('now', sql.Int, now)
          .input('id',  sql.Int, job[idCol])
          .query(`UPDATE WEBENGINE_CRON SET cron_last_run = @now WHERE ${idCol} = @id`)
        skipped.push(`${job.cron_name ?? fileRun} (unmapped)`)
        continue
      }

      try {
        const msg = await CRON_TASKS[taskKey]()
        executed.push(`${job.cron_name ?? fileRun}: ${msg}`)
      } catch (taskErr) {
        errors.push(`${job.cron_name ?? fileRun}: ${(taskErr as Error).message}`)
      }

      // Atualizar cron_last_run
      const idCol = job.cron_id !== undefined ? 'cron_id' : 'id'
      await db.request()
        .input('now', sql.Int, now)
        .input('id',  sql.Int, job[idCol])
        .query(`UPDATE WEBENGINE_CRON SET cron_last_run = @now WHERE ${idCol} = @id`)
    }

    return NextResponse.json({
      code: 200,
      message: 'Cron executed successfully',
      timestamp: now,
      executed,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (err) {
    console.error('[api/cron]', err)
    return NextResponse.json(
      { code: 500, error: (err as Error).message },
      { status: 500 }
    )
  }
}
