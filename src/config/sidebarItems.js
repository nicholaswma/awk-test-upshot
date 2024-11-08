import { jsx as _jsx } from "react/jsx-runtime";
import { UploadFile } from '../components/UploadFile';
import { SendAR } from '../components/SendAR';
import { EncryptDecrypt } from '../components/EncryptDecrypt';
import { SendAOToken } from '../components/SendAOToken';
import { SendAOMessage } from '../components/SendAOMessage';
import { DryRunAOMessage } from '../components/DryRunAOMessage';
import { BatchTest } from '../components/BatchTest';
import { GraphQLTest } from '../components/GraphQLTest';
export const sidebarItems = [
    {
        id: 'upload',
        title: 'Upload a File',
        component: _jsx(UploadFile, {}),
    },
    {
        id: 'send-ar',
        title: 'Send AR',
        component: _jsx(SendAR, {}),
    },
    {
        id: 'encrypt',
        title: 'Encrypt / Decrypt',
        component: _jsx(EncryptDecrypt, {}),
    },
    {
        id: 'send-ao-token',
        title: 'Send AO Token',
        component: _jsx(SendAOToken, {}),
    },
    {
        id: 'send-ao-message',
        title: 'Send AO Message',
        component: _jsx(SendAOMessage, {}),
    },
    {
        id: 'dry-run',
        title: 'Dry Run AO Message',
        component: _jsx(DryRunAOMessage, {}),
    },
    {
        id: 'batch',
        title: 'Test Batch',
        component: _jsx(BatchTest, {}),
    },
    {
        id: 'graphql',
        title: 'Test GraphQL',
        component: _jsx(GraphQLTest, {}),
    },
];
