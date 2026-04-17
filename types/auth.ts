export interface MembInfo {
  memb_guid: number
  memb___id: string
  mail_addr: string
  bloc_code: number
  AccountLevel?: number
  AccountExpireDate?: string | null
}

// Admins config from webengine.json
export const ADMINS: Record<string, number> = {
  admin: 100,
}

export function getAdminLevel(username: string): number {
  return ADMINS[username.toLowerCase()] ?? 0
}
