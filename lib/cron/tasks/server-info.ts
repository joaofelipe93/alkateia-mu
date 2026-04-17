import { revalidatePath } from 'next/cache'

export async function serverInfoTask(): Promise<string> {
  // No Next.js, dados são consultados on-demand — não há cache de arquivo.
  // Apenas revalidamos a homepage para refletir stats atualizados.
  revalidatePath('/', 'page')
  revalidatePath('/admincp', 'page')
  return 'Server info paths revalidated'
}
