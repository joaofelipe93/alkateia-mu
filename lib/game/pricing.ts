/**
 * lib/game/pricing.ts
 *
 * Funções puras de cálculo de preço — sem dependências Node.js.
 * Pode ser importado por Client Components.
 */

export interface SemiPriceOptions {
  basePrice: number
  level: number
  life: number
  luck: boolean
  skill: boolean
  exeOPCount: number
  ancient: boolean
  op380: boolean
  harmony: number
  socketCount: number
  costLevel?: number
  costLife?: number
  costLuck?: number
  costSkill?: number
  costExe?: number
  costAncient?: number
  costOp380?: number
  costHarmony?: number
  costSocket?: number
}

export function calculateSemiPrice(opts: SemiPriceOptions): number {
  let total = opts.basePrice
  total += opts.level * (opts.costLevel ?? 0)
  total += opts.life  * (opts.costLife ?? 0)
  if (opts.luck)    total += (opts.costLuck ?? 0)
  if (opts.skill)   total += (opts.costSkill ?? 0)
  total += opts.exeOPCount * (opts.costExe ?? 0)
  if (opts.ancient) total += (opts.costAncient ?? 0)
  if (opts.op380)   total += (opts.costOp380 ?? 0)
  if (opts.harmony > 0) total += (opts.costHarmony ?? 0)
  total += opts.socketCount * (opts.costSocket ?? 0)
  return Math.max(0, total)
}
