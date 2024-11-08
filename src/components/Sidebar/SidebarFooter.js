import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ThemeSwitcher from '../ThemeSwitcher';
import { SimpleIcon } from '../SimpleIcon';
import { siGithub, siX } from 'simple-icons';
export function SidebarFooter() {
    return (_jsx("div", { className: "border-t border-slate-200 p-4 dark:border-slate-800", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2 text-xs", children: [_jsx("a", { className: "inline-flex hover:cursor-pointer hover:opacity-70", href: "https://x.com/@7i7o", target: "_blank", children: _jsx(SimpleIcon, { className: "w-3", svgPath: siX.path }) }), _jsx("a", { className: "inline-flex hover:cursor-pointer hover:opacity-70", href: "https://github.com/7i7o/awk-test", target: "_blank", children: _jsx(SimpleIcon, { className: "w-3", svgPath: siGithub.path }) }), "2024"] }), _jsx(ThemeSwitcher, { className: "h-5 w-5" })] }) }));
}
