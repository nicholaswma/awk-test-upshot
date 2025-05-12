export const DEFAULT_GATEWAY = {
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
};

// export const CU_URL = undefined;
// export const CU_URL = 'http://localhost:6363';
export const CU_URL = '/ao:6363';
export const MU_URL = '/ao:3005';

export const isValidAddress = (addr: string) =>
    /^[a-zA-Z0-9_-]{43}$/.test(addr);

export type Tag = {
    name: string;
    value: string;
};

export type Message = {
    process: string;
    data?: string;
    tags?: Tag[];
    anchor?: string;
};

export const tag = (k: string, v: string): Tag => {
    return { name: k, value: v };
};

export const createMessage = (process: string, tags?: Tag[]) => {
    return {
        process: process,
        tags: tags ? tags : [],
    };
};
