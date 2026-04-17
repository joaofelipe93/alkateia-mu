import { rankingsTask }    from './rankings'
import { serverInfoTask }  from './server-info'
import { vipExpiryTask }   from './vip-expiry'
import { temporalBansTask } from './temporal-bans'

// Mapa de task key → função TypeScript
export const CRON_TASKS: Record<string, () => Promise<string>> = {
  'rankings':      rankingsTask,
  'server-info':   serverInfoTask,
  'vip-expiry':    vipExpiryTask,
  'temporal-bans': temporalBansTask,
}

// Mapeamento de nome de arquivo PHP → task key
// Permite compatibilidade com o campo cron_file_run do DB
export const CRON_FILE_MAP: Record<string, string> = {
  // Rankings (todos mapeiam para a mesma task de invalidação)
  'levels_ranking.php':           'rankings',
  'resets_ranking.php':           'rankings',
  'grandresets_ranking.php':      'rankings',
  'general_ranking.php':          'rankings',
  'guilds_ranking.php':           'rankings',
  'killers_ranking.php':          'rankings',
  'masterlevel_ranking.php':      'rankings',
  'gens_ranking.php':             'rankings',
  'online_ranking.php':           'rankings',
  'pvpchampionship_ranking.php':  'rankings',
  'votes_ranking.php':            'rankings',
  'kingguild_ranking.php':        'rankings',
  'kingplayer_ranking.php':       'rankings',
  'bloodcastle_ranking.php':      'rankings',
  'chaoscastle_ranking.php':      'rankings',
  'devilsquare_ranking.php':      'rankings',
  'duel_ranking.php':             'rankings',
  'gvg_ranking.php':              'rankings',
  'illusiontemple_ranking.php':   'rankings',
  'liga_ranking.php':             'rankings',
  'monsterkill_ranking.php':      'rankings',
  'battleroyale_ranking.php':     'rankings',
  'tvt_ranking.php':              'rankings',
  'castle_siege.php':             'rankings',
  // Server info
  'server_info.php':              'server-info',
  'online_characters.php':        'server-info',
  // VIP
  'account_level.php':            'vip-expiry',
  // Bans temporários
  'temporal_bans.php':            'temporal-bans',
  // Não mapeados — cron.php é o próprio loader (ignorar)
  'cron.php':                     'noop',
}

export type CronTaskKey = keyof typeof CRON_TASKS
