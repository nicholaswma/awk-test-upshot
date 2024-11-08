import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { SidebarItem } from "./SidebarItem";
import { sidebarItems } from "../../config/sidebarItems";
export function SidebarNavigation({ connected, selectedItem, onItemClick }) {
    return (_jsx("nav", { className: "flex-1 space-y-1 p-4", children: connected && (_jsx(_Fragment, { children: _jsx("div", { className: "space-y-1", children: sidebarItems.map((item) => (_jsx(SidebarItem, { title: item.title, isActive: selectedItem === item.id, onClick: () => onItemClick(item.id) }, item.id))) }) })) }));
}
