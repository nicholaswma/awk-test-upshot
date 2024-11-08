import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
export const emptyTxResult = {
    txId: '',
    status: '',
    statusMsg: '',
};
export function TxResult(props) {
    const { txId, status, statusMsg, aoResult = false } = props.txResult;
    return (_jsxs("div", { className: "flex items-center", children: [status !== '200' && (_jsxs("p", { children: ["Result: \u274C Error posting your tx: ", status, " - ", statusMsg] })), status === '200' && (_jsxs("p", { children: ["\u2705 View your tx in", ' ', aoResult ? (_jsx("a", { target: "_blank", className: "font-bold hover:underline", href: `https://www.ao.link/#/message/${txId}`, children: "AO Link" })) : (_jsx("a", { target: "_blank", className: "font-bold hover:underline", href: `https://viewblock.io/arweave/tx/${txId}`, children: "Viewblock" })), "\u00A0(it may take a few minutes for it to be picked up by the explorer)"] }))] }));
}
