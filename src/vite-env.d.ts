/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OJS_BASE_URL: string
  readonly VITE_OJS_API_TOKEN: string
  readonly VITE_MATOMO_BASE_URL: string
  readonly VITE_MATOMO_SITE_ID: string
  readonly VITE_MATOMO_API_TOKEN: string
  readonly VITE_WS_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_DESCRIPTION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
