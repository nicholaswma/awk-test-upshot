import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
const DEFAULT_GATEWAYS = {
    ARWEAVE: 'https://arweave.net/graphql',
    GOLDSKY: 'https://arweave-search.goldsky.com/graphql',
    AR_IO: 'https://ar-io.dev/graphql',
};
const DEFAULT_QUERY = `{
  transactions(
    first: 5
    tags: [
      { name: "Content-Type", values: ["image/png", "image/jpeg"] }
    ]
  ) {
    edges {
      node {
        id
        tags {
          name
          value
        }
      }
    }
  }
}`;
const DEFAULT_TIMEOUT = 10000; // 10 seconds
export function GraphQLTest() {
    const [selectedGateway, setSelectedGateway] = useState('ARWEAVE');
    const [customGateway, setCustomGateway] = useState('');
    const [query, setQuery] = useState(DEFAULT_QUERY);
    const [, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [, setError] = useState(null);
    // Advanced mode states
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);
    const [gatewayList, setGatewayList] = useState('');
    const [timeout, setTimeout] = useState(DEFAULT_TIMEOUT.toString());
    const [multiResults, setMultiResults] = useState([]);
    const executeQuery = async (gateway, timeoutMs) => {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
        const startTime = Date.now();
        try {
            const response = await fetch(gateway, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
                signal: controller.signal,
            });
            const data = await response.json();
            const time = Date.now() - startTime;
            if (data.errors) {
                return {
                    gateway,
                    status: 'error',
                    error: data.errors.map((e) => e.message).join('\n'),
                    time,
                };
            }
            return {
                gateway,
                status: 'success',
                response: data,
                time,
            };
        }
        catch (err) {
            return {
                gateway,
                status: err.name === 'AbortError'
                    ? 'timeout'
                    : 'error',
                error: err.message ?? 'Unknown error',
                time: Date.now() - startTime,
            };
        }
        finally {
            clearTimeout(timeoutId);
        }
    };
    const handleSingleQuery = async () => {
        setLoading(true);
        setError(null);
        setResponse(null);
        const gateway = customGateway || DEFAULT_GATEWAYS[selectedGateway];
        const result = await executeQuery(gateway, parseInt(timeout));
        if (result.status === 'success') {
            setResponse(result.response);
        }
        else {
            setError(result.error ?? 'Unknown error');
        }
        setLoading(false);
    };
    const handleMultiQuery = async () => {
        setLoading(true);
        setMultiResults([]);
        // Combine default and custom gateways
        const gateways = [
            ...Object.values(DEFAULT_GATEWAYS),
            ...gatewayList.split('\n').filter((g) => g.trim()),
        ];
        // Initialize results
        setMultiResults(gateways.map((gateway) => ({
            gateway,
            status: 'pending',
        })));
        // Execute queries in parallel
        const results = await Promise.all(gateways.map(async (gateway, index) => {
            const result = await executeQuery(gateway, parseInt(timeout));
            // Update individual result as it completes
            setMultiResults((prev) => [
                ...prev.slice(0, index),
                result,
                ...prev.slice(index + 1),
            ]);
            return result;
        }));
        console.log(results);
        setLoading(false);
    };
    return (_jsxs("div", { className: "flex w-full flex-col gap-4", children: [_jsx("div", { className: "flex items-center gap-2", children: _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: isAdvancedMode, onChange: (e) => setIsAdvancedMode(e.target.checked), className: "text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "text-sm font-medium", children: "Advanced Mode" })] }) }), !isAdvancedMode ? (
            /* Single Gateway Selection */
            _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("label", { className: "text-sm font-medium", children: "Gateway:" }), _jsx("div", { className: "flex gap-4", children: Object.keys(DEFAULT_GATEWAYS).map((gateway) => (_jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "radio", name: "gateway", checked: selectedGateway === gateway &&
                                        !customGateway, onChange: () => {
                                        setSelectedGateway(gateway);
                                        setCustomGateway('');
                                    }, className: "text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "text-sm", children: gateway })] }, gateway))) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "radio", name: "gateway", checked: !!customGateway, onChange: () => setCustomGateway(customGateway || 'http://'), className: "text-blue-600 focus:ring-blue-500" }), _jsx(Input, { type: "text", placeholder: "Custom Gateway URL", value: customGateway, onChange: (e) => setCustomGateway(e.target.value), className: "flex-1" })] })] })) : (
            /* Advanced Gateway List */
            _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("label", { className: "text-sm font-medium", children: "Gateway List (one per line):" }), _jsx("textarea", { value: gatewayList, onChange: (e) => setGatewayList(e.target.value), className: "h-32 rounded-lg border border-slate-200 bg-white p-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-800", placeholder: `${Object.values(DEFAULT_GATEWAYS).join('\n')}` }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "text-sm font-medium", children: "Timeout (ms):" }), _jsx(Input, { type: "number", value: timeout, onChange: (e) => setTimeout(e.target.value), className: "w-32", min: "1000", step: "1000" })] })] })), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("label", { className: "text-sm font-medium", children: "Query:" }), _jsx("textarea", { value: query, onChange: (e) => setQuery(e.target.value), className: "h-48 rounded-lg border border-slate-200 bg-white p-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-800", placeholder: "Enter your GraphQL query here..." })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx(Button, { onClick: () => setQuery(DEFAULT_QUERY), disabled: loading, children: "Reset Query" }), _jsx(Button, { onClick: isAdvancedMode ? handleMultiQuery : handleSingleQuery, disabled: loading || !query.trim(), children: loading
                            ? 'Executing...'
                            : isAdvancedMode
                                ? 'Test All Gateways'
                                : 'Execute Query' })] }), isAdvancedMode && (_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("label", { className: "text-sm font-medium", children: "Results:" }), _jsx("div", { className: "rounded-lg border border-slate-200 bg-slate-100 p-4 font-mono text-sm dark:border-slate-700 dark:bg-slate-800", children: multiResults.map((result, index) => (_jsxs("details", { className: "mb-4 last:mb-0", children: [_jsxs("summary", { className: "flex cursor-pointer items-center gap-2 py-1", children: [_jsx("span", { className: "font-semibold", children: result.gateway }), _jsx("span", { className: `ml-2 rounded-full px-2 py-0.5 text-xs ${result.status === 'success'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                                : result.status === 'error'
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                                                    : result.status === 'timeout'
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                                                        : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100'}`, children: result.status.toUpperCase() }), result.time && (_jsxs("span", { className: "text-xs text-slate-500", children: [result.time, "ms"] }))] }), _jsx("div", { className: "mt-2 pl-4", children: result.error ? (_jsx("div", { className: "text-red-500", children: result.error })) : result.response ? (_jsx("pre", { className: "overflow-auto whitespace-pre-wrap", children: JSON.stringify(result.response, null, 2) })) : (_jsx("div", { className: "text-slate-500", children: "Waiting for response..." })) })] }, index))) })] }))] }));
}
