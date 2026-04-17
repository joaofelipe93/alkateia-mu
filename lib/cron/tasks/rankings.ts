import { revalidatePath } from 'next/cache'

export async function rankingsTask(): Promise<string> {
  revalidatePath('/rankings', 'layout')
  revalidatePath('/', 'page')
  return 'Rankings cache invalidated'
}
