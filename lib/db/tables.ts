// Tabelas e colunas do SQL Server — espelho do xteam.tables.php + webengine.tables.php
// Não alterar estes valores — o servidor de jogo usa esses nomes exatos

// ─── Tabelas do jogo (game server escreve aqui — somente leitura pelo site) ───

export const T = {
  // Jogo
  MEMB_INFO:    'MEMB_INFO',
  MEMB_STAT:    'MEMB_STAT',
  CHARACTER:    'Character',
  GUILD:        'Guild',
  GUILD_MEMBER: 'GuildMember',
  MASTER_SKILL: 'MasterSkillTree',
  GENS_RANK:    'Gens_Rank',

  // CMS (WEBENGINE_*)
  FLA:                'WEBENGINE_FLA',
  NEWS:               'WEBENGINE_NEWS',
  NEWS_TRANSLATIONS:  'WEBENGINE_NEWS_TRANSLATIONS',
  GUIDES:             'WEBENGINE_GUIDES',
  CHANGELOGS:         'WEBENGINE_CHANGELOGS',
  DOWNLOADS:          'WEBENGINE_DOWNLOADS',
  REGISTER_ACCOUNT:   'WEBENGINE_REGISTER_ACCOUNT',
  VOTES:              'WEBENGINE_VOTES',
  VOTE_SITES:         'WEBENGINE_VOTE_SITES',
  VOTE_LOGS:          'WEBENGINE_VOTE_LOGS',
  CREDITS_CONFIG:     'WEBENGINE_CREDITS_CONFIG',
  CREDITS_LOGS:       'WEBENGINE_CREDITS_LOGS',
  BANS:               'WEBENGINE_BANS',
  BLOCKED_IP:         'WEBENGINE_BLOCKED_IP',
  GIFT_CODE:          'WEBENGINE_GIFT_CODE',
  GIFT_CODE_LOGS:     'WEBENGINE_GIFT_CODE_LOGS',
  PASSCHANGE_REQUEST: 'WEBENGINE_PASSCHANGE_REQUEST',
  PAYPAL_TX:          'WEBENGINE_PAYPAL_TRANSACTIONS',
  CRON:               'WEBENGINE_CRON',
} as const

// ─── Colunas MEMB_INFO ───
export const C = {
  USERNAME:    'memb___id',
  PASSWORD:    'memb__pwd',
  MEMBER_ID:   'memb_guid',
  EMAIL:       'mail_addr',
  MEMB_NAME:   'memb_name',
  SNO:         'sno__numb',
  CTL1:        'ctl1_code',
  BLOCKED:     'bloc_code',
  MAIL_CHECK:  'mail_chek',

  // MEMB_STAT
  CONN_STAT:   'ConnectStat',
  MS_USERNAME: 'memb___id',

  // Character
  CHAR_NAME:    'Name',
  CHAR_ACCOUNT: 'AccountID',
  CHAR_CLASS:   'Class',
  CHAR_LEVEL:   'cLevel',
  CHAR_RESETS:  'ResetCount',
  CHAR_GR:      'MasterResetCount',
  CHAR_MASTER:  'MasterLevel',    // em MasterSkillTree
  CHAR_STRENGTH:    'Strength',
  CHAR_DEXTERITY:   'Dexterity',
  CHAR_VITALITY:    'Vitality',
  CHAR_ENERGY:      'Energy',
  CHAR_LEADERSHIP:  'Leadership',
  CHAR_POINTS:      'LevelUpPoint',
  CHAR_MAP:         'MapNumber',
  CHAR_X:           'MapPosX',
  CHAR_Y:           'MapPosY',
  CHAR_PK_COUNT:    'PkCount',
  CHAR_PK_LEVEL:    'PkLevel',

  // Guild
  GUILD_NAME:   'G_Name',
  GUILD_MARK:   'G_Mark',
  GUILD_SCORE:  'G_Score',
  GUILD_MASTER: 'G_Master',

  // Gens
  GENS_NAME:    'Name',
  GENS_FAMILY:  'Family',
  GENS_CONTRIB: 'Contribution',

  // VIP
  ACCOUNT_LEVEL:  'AccountLevel',
  ACCOUNT_EXPIRE: 'AccountExpireDate',
} as const

// ─── Mapeamento de classes de personagem (xteam) ───
export const CHARACTER_CLASSES: Record<number, string> = {
  0: 'Dark Wizard', 1: 'Soul Master', 2: 'Grand Master', 3: 'Soul Wizard',
  16: 'Dark Knight', 17: 'Blade Knight', 18: 'Blade Master', 19: 'Dragon Knight',
  32: 'Fairy Elf', 33: 'Muse Elf', 34: 'High Elf', 35: 'Noble Elf',
  48: 'Magic Gladiator', 49: 'Duel Master', 50: 'Magic Knight',
  64: 'Dark Lord', 65: 'Lord Emperor', 66: 'Empire Lord',
  80: 'Summoner', 81: 'Bloody Summoner', 82: 'Dimension Master', 83: 'Dimension Summoner',
  96: 'Rage Fighter', 97: 'Fist Master', 98: 'Fist Blazer',
  112: 'Grow Lancer', 113: 'Mirage Lancer', 114: 'Shining Lancer',
  128: 'Rune Wizard', 129: 'Rune Spell Master', 130: 'Grand Rune Master',
  144: 'Slayer', 145: 'Royal Slayer', 146: 'Master Slayer',
  160: 'Gun Crusher', 161: 'Gun Breaker', 162: 'Master Gun Crusher',
  176: 'Light Wizard', 177: 'Shaman', 178: 'Light Master',
}
