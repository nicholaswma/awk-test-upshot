import Arweave from 'arweave';
import { createContext, useContext } from 'react';
import { connect } from '@permaweb/aoconnect';
export const ArweaveContext = createContext(undefined);
export const useArweave = (options) => {
    const context = useContext(ArweaveContext);
    if (context === undefined) {
        throw new Error('useArweave must be used within a ArweaveProvider');
    }
    // If options.cuUrl is provided, create a new AO instance with the custom CU_URL
    if (options?.cuUrl && context.ao) {
        const { message, dryrun, result } = connect({ CU_URL: options.cuUrl });
        return {
            ...context,
            ao: { message, dryrun, result },
        };
    }
    return context;
};
