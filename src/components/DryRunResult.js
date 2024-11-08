import { jsx as _jsx } from "react/jsx-runtime";
export const emptyDryRunResult = {
    Output: '',
    Messages: [],
    Spawns: [],
};
export function DryRunResult(props) {
    const { dryRunResult = emptyDryRunResult } = props;
    return (_jsx("div", { className: "flex items-center", children: _jsx("pre", { children: JSON.stringify(dryRunResult, null, 2) }) }));
}
