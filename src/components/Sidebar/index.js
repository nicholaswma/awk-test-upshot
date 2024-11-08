import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SidebarHeader } from './SidebarHeader';
import { SidebarNavigation } from './SidebarNavigation';
import { SidebarFooter } from './SidebarFooter';
export function Sidebar({ connected, selectedItem, onItemClick }) {
    return (_jsxs("div", { className: "flex w-64 flex-col border-r border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900", children: [_jsx(SidebarHeader, {}), _jsx(SidebarNavigation, { connected: connected, selectedItem: selectedItem, onItemClick: onItemClick }), _jsx(SidebarFooter, {})] }));
}
