/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_FIREBASE_API_KEY: string
    readonly VITE_FIREBASE_AUTH_DOMAIN: string
    // Ajoutez ici les autres variables si vous voulez un autocomplétage précis
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}