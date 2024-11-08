import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ConnectButton } from 'arweave-wallet-kit';
export function MainContentHeader({ selectedItemTitle }) {
    return (_jsx("div", { className: "border-b border-slate-200 p-4 dark:border-slate-800", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-xl font-semibold", children: selectedItemTitle }), _jsx(ConnectButton, { showBalance: false, showProfilePicture: false, useAns: false })] }) }));
}
