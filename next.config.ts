import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  // SQL Server mssql é uma dependência nativa — excluir do bundle do servidor
  serverExternalPackages: ['mssql', 'tedious'],
}

export default withNextIntl(nextConfig)
