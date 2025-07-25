import { UploadFile } from '../components/UploadFile';
import { SendAR } from '../components/SendAR';
import { EncryptDecrypt } from '../components/EncryptDecrypt';
import { SendAOToken } from '../components/SendAOToken';
import { SendAOMessage } from '../components/SendAOMessage';
import { DryRunAOMessage } from '../components/DryRunAOMessage';
import { BatchTest } from '../components/BatchTest';
import { GraphQLTest } from '../components/GraphQLTest';
import { SignMessage } from '../components/SignMessage';
import { Upshot } from '../components/Upshot';
import { UpshotAdmin } from '../components/UpshotAdmin';
import { UpshotCategories } from '../components/UpshotCategories';
import { UpshotEvents } from '../components/UpshotEvents';
import { UpshotPacks } from '../components/UpshotPacks';
import { UpshotCards } from '../components/UpshotCards';
import { UpshotMintStatus } from '../components/UpshotMintStatus';

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
        id: 'signMessage',
        title: 'Sign Message',
        component: <SignMessage />,
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
    {
        id: 'upshot',
        title: 'Upshot',
        component: <Upshot />,
    },
    {
        id: 'upshot-admin',
        title: 'Upshot Admin',
        component: <UpshotAdmin />,
    },
    {
        id: 'UTD',
        title: 'UTD',
        component: <UpshotMintStatus />,
    },
    {
        id: 'graphql',
        title: 'Test GraphQL',
        component: <GraphQLTest />,
    },
];
