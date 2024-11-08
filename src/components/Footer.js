import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SimpleIcon } from './SimpleIcon';
import { siGithub, siX } from 'simple-icons';
export function Footer() {
    return (_jsx("div", { className: "flex w-full items-center justify-end", children: _jsxs("div", { className: "flex items-center gap-2 text-xs", children: ["2024", _jsx("a", { className: "inline-flex hover:cursor-pointer hover:opacity-70", href: "https://x.com/@7i7o", target: "_blank", children: _jsx(SimpleIcon, { className: "w-3", svgPath: siX.path }) }), _jsx("a", { className: "inline-flex hover:cursor-pointer hover:opacity-70", href: "https://github.com/7i7o/awk-test", target: "_blank", children: _jsx(SimpleIcon, { className: "w-3", svgPath: siGithub.path }) })] }) }));
}
