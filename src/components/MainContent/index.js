import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MainContentHeader } from './MainContentHeader';
import { getSelectedItemTitle, renderContent } from './utils';
export function MainContent({ selectedItem }) {
    return (_jsxs("div", { className: "flex flex-1 flex-col bg-slate-50 dark:bg-slate-950", children: [_jsx(MainContentHeader, { selectedItemTitle: getSelectedItemTitle(selectedItem) }), _jsx("div", { className: "flex-1 p-4", children: selectedItem && (_jsx("div", { className: "flex w-full flex-col items-center justify-center", children: renderContent(selectedItem) })) })] }));
}
