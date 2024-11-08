import { type InputHTMLAttributes } from 'react';

export function Select(
    props: React.PropsWithChildren<InputHTMLAttributes<HTMLSelectElement>>
) {
    const { children } = props;
    return (
        <select
            {...props}
            className={`${props.className} rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-950`}
        >
            {children}
        </select>
    );
}
