export const DEFAULT_AO_TOKEN = '4ctcQGCH8ekGw43d9Mdz2Mw6SX1LiAY54mGWdNAYqjM';
// export const LLAMA_AO_PROCESS = "ubyTr1WCG5QuM1i3i87YTQjqkE6f73C9z1mGDh4OEj0";
export const LLAMA_AO_PROCESS = 'YIwYfDvCJl-jZnicAVtGZkcfaRZSaX9L9QuAR8Ewk54';
export const LLAMA_AO_PROCESS_SIMPLE =
    'So8oiDPQTTe1MSW_j9FAnMlnSNUujFva9PgEl9CeKj4';

export const CU_URLS = {
    Llama: 'http://96.30.193.102:6363',
    Localhost: 'http://localhost:6363',
    Default: undefined,
} as const;

export type CuUrlKey = keyof typeof CU_URLS;
