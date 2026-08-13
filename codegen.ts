import { CodegenConfig } from '@graphql-codegen/cli'
const { loadEnvConfig } = require('@next/env')
loadEnvConfig(process.cwd())

const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL?.replace(/\/$/, '')

if (!wordpressUrl) {
  console.error('❌ NEXT_PUBLIC_WORDPRESS_URL is not set. Codegen cannot fetch the GraphQL schema.')
  process.exit(1)
}

const config: CodegenConfig = {
  schema: `${wordpressUrl}/graphql`,
  documents: ['src/**/*.{tsx,ts}'],
  generates: {
    './src/__generated__/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
      },
    },
  },
  ignoreNoDocuments: true,
}

export default config
