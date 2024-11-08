import { ConnectButton } from 'arweave-wallet-kit';

interface MainContentHeaderProps {
    selectedItemTitle: string;
}

export function MainContentHeader({ selectedItemTitle }: MainContentHeaderProps) {
    return (
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{selectedItemTitle}</h2>
                <ConnectButton
                    showBalance={false}
                    showProfilePicture={false}
                    useAns={false}
                />
            </div>
        </div>
    );
} 