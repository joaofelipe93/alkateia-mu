'use client'

import { useActionState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ActionFeedback } from '@/components/usercp/ActionFeedback'
import { saveSettings } from '@/lib/actions/admin'
import type { ActionResult } from '@/lib/actions/character'

const initial: ActionResult = { success: false, message: '' }

const FIELD_GROUPS = [
  { section: 'Website', fields: [
    { name: 'server_name',              label: 'Nome do servidor' },
    { name: 'website_title',            label: 'Título do site' },
    { name: 'website_meta_description', label: 'Descrição (meta)' },
    { name: 'language_default',         label: 'Idioma padrão (br/en/es)' },
  ]},
  { section: 'Servidor MU', fields: [
    { name: 'server_info_season',    label: 'Season' },
    { name: 'server_info_exp',       label: 'EXP' },
    { name: 'server_info_drop',      label: 'Drop' },
    { name: 'server_info_masterexp', label: 'Master EXP' },
    { name: 'ip_game_server',        label: 'IP do servidor' },
    { name: 'port_game_server',      label: 'Porta do servidor' },
  ]},
  { section: 'Redes sociais', fields: [
    { name: 'social_link_discord',   label: 'Discord URL' },
    { name: 'social_link_instagram', label: 'Instagram URL' },
    { name: 'social_link_whatsapp',  label: 'WhatsApp URL' },
  ]},
]

export function SettingsForm({ config }: { config: Record<string, string> }) {
  const [state, action, pending] = useActionState(saveSettings, initial)

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="font-display text-2xl font-bold text-[var(--color-game-text)]">Configurações do Site</h1>

      <ActionFeedback result={state.message ? state : null} />

      <form action={action} className="space-y-5">
        {FIELD_GROUPS.map(({ section, fields }) => (
          <div key={section} className="bg-[var(--color-game-surface)] border border-[var(--color-game-border)] rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-[var(--color-game-text)] text-sm border-b border-[var(--color-game-border)] pb-2">{section}</h2>
            {fields.map(({ name, label }) => (
              <div key={name}>
                <label className="block text-xs font-medium text-[var(--color-game-muted)] mb-1">{label}</label>
                <Input name={name} defaultValue={String(config[name] ?? '')} />
              </div>
            ))}
          </div>
        ))}

        <Button type="submit" variant="accent" size="lg" className="w-full" disabled={pending}>
          <Save size={16} /> {pending ? 'Salvando...' : 'Salvar configurações'}
        </Button>
      </form>
    </div>
  )
}
