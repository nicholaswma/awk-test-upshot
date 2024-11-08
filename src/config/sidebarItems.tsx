import { UploadFile } from '../components/UploadFile';
import { SendAR } from '../components/SendAR';
import { EncryptDecrypt } from '../components/EncryptDecrypt';
import { SendAOToken } from '../components/SendAOToken';
import { SendAOMessage } from '../components/SendAOMessage';
import { DryRunAOMessage } from '../components/DryRunAOMessage';
import { BatchTest } from '../components/BatchTest';
import { BoltTest } from '../components/BoltTest';
import { ArIOTest } from '../components/ArIOTest';
import { LlamaTest } from '../components/LlamaTest';
import { LlamaTestSimple } from '../components/LlamaTestSimple';
import { GraphQLTest } from '../components/GraphQLTest';

export interface SidebarItemConfig {
    id: string;
    title: string;
    component: React.ReactNode;
}

export const sidebarItems: SidebarItemConfig[] = [
    {
        id: 'upload',
        title: 'Upload a File',
        component: <UploadFile />,
    },
    {
        id: 'send-ar',
        title: 'Send AR',
        component: <SendAR />,
    },
    {
        id: 'encrypt',
        title: 'Encrypt / Decrypt',
        component: <EncryptDecrypt />,
    },
    {
        id: 'send-ao-token',
        title: 'Send AO Token',
        component: <SendAOToken />,
    },
    {
        id: 'send-ao-message',
        title: 'Send AO Message',
        component: <SendAOMessage />,
    },
    {
        id: 'dry-run',
        title: 'Dry Run AO Message',
        component: <DryRunAOMessage />,
    },
    {
        id: 'batch',
        title: 'Test Batch',
        component: <BatchTest />,
    },
    // {
    //     id: 'bolt',
    //     title: 'Test Bolt',
    //     component: <BoltTest />,
    // },
    // {
    //     id: 'ario',
    //     title: 'Test ArIO SDK',
    //     component: <ArIOTest />,
    // },
    // {
    //     id: 'llama',
    //     title: 'Test Llama',
    //     component: <LlamaTest />,
    // },
    // {
    //     id: 'llama-simple',
    //     title: 'Test Llama Simple',
    //     component: <LlamaTestSimple />,
    // },
    {
        id: 'graphql',
        title: 'Test GraphQL',
        component: <GraphQLTest />,
    },
];
