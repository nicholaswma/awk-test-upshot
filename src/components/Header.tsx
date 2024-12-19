import { ConnectButton } from '../utils/awk';

export function Header() {
    return (
        <div className="flex justify-end p-4">
            <ConnectButton
                showBalance={false}
                showProfilePicture={false}
                useAns={false}
            />
        </div>
    );
}
