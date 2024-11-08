import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useConnection } from 'arweave-wallet-kit';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
function Main() {
    const { connected } = useConnection();
    const [selectedItem, setSelectedItem] = useState(null);
    const handleItemClick = (itemId) => {
        setSelectedItem(selectedItem === itemId ? null : itemId);
    };
    return (_jsxs("div", { className: "flex h-screen text-slate-950 dark:text-slate-50", children: [_jsx(Sidebar, { connected: connected, selectedItem: selectedItem, onItemClick: handleItemClick }), _jsx(MainContent, { selectedItem: selectedItem })] }));
}
export default Main;
