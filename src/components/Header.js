import { jsx as _jsx } from "react/jsx-runtime";
import { ConnectButton } from 'arweave-wallet-kit';
export function Header() {
    return (_jsx("div", { className: "flex justify-end p-4", children: _jsx(ConnectButton, { showBalance: false, showProfilePicture: false, useAns: false }) }));
}
