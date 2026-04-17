import { readFileSync } from 'fs'
import { join } from 'path'
import { SettingsForm } from './SettingsForm'

function loadConfig(): Record<string, string> {
  try {
    const configPath = join(process.cwd(), '..', 'Downloads', 'alkateia-mu', 'includes', 'config', 'webengine.json')
    return JSON.parse(readFileSync(configPath, 'utf-8'))
  } catch {
    return {}
  }
}

export default function SettingsPage() {
  const config = loadConfig()
  return <SettingsForm config={config} />
}
