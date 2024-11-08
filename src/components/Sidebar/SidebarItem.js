import { jsx as _jsx } from "react/jsx-runtime";
export function SidebarItem({ title, isActive, onClick }) {
    return (_jsx("button", { onClick: onClick, className: `w-full rounded-lg px-3 py-2 text-left text-slate-950 dark:text-slate-50
                hover:bg-slate-200 dark:hover:bg-slate-800 
                ${isActive ? 'bg-slate-200 dark:bg-slate-800' : ''}`, children: title }));
}
