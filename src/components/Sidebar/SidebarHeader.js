import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTheme } from "../../hooks/useTheme";
export function SidebarHeader() {
    const { theme } = useTheme();
    return (_jsx("div", { className: "p-4 text-center dark:border-slate-800", children: _jsxs("h1", { className: "flex items-center justify-center text-3xl font-bold", children: [_jsx("img", { src: theme === "dark" ? '/awk.dark.svg' : '/awk.light.svg', alt: "AWK", className: "h-6 mr-1" }), "Test"] }) }));
}
