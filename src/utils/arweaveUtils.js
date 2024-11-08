export const DEFAULT_GATEWAY = {
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
};
export const CU_URL = undefined;
// export const CU_URL = 'http://localhost:6363';
export const isValidAddress = (addr) => /^[a-zA-Z0-9_-]{43}$/.test(addr);
export const tag = (k, v) => {
    return { name: k, value: v };
};
export const createMessage = (process, tags) => {
    return {
        process: process,
        tags: tags ? tags : [],
    };
};
