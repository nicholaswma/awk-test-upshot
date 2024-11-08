import { jsx as _jsx } from "react/jsx-runtime";
import {} from 'react';
export function Button(props) {
    const { children } = props;
    return (_jsx("button", { ...props, className: `${props.className} min-w-24 rounded-lg bg-slate-900 px-4 py-2 text-slate-50 hover:opacity-90 disabled:opacity-50 dark:bg-slate-200 dark:text-slate-950`, children: children }));
}
