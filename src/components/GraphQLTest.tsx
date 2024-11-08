import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';

const DEFAULT_GATEWAYS = {
    ARWEAVE: 'https://arweave.net/graphql',
    GOLDSKY: 'https://arweave-search.goldsky.com/graphql',
    AR_IO: 'https://ar-io.dev/graphql',
} as const;

interface GatewayResult {
    gateway: string;
    status: 'pending' | 'success' | 'error' | 'timeout';
    response?: any;
    error?: string;
    time?: number;
}

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
    const [selectedGateway, setSelectedGateway] =
        useState<keyof typeof DEFAULT_GATEWAYS>('ARWEAVE');
    const [customGateway, setCustomGateway] = useState('');
    const [query, setQuery] = useState(DEFAULT_QUERY);
    const [response, setResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Advanced mode states
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);
    const [gatewayList, setGatewayList] = useState('');
    const [timeout, setTimeout] = useState(DEFAULT_TIMEOUT.toString());
    const [multiResults, setMultiResults] = useState<GatewayResult[]>([]);

    const executeQuery = async (
        gateway: string,
        timeoutMs: number
    ): Promise<GatewayResult> => {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(
            () => controller.abort(),
            timeoutMs
        );

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
                    error: data.errors.map((e: any) => e.message).join('\n'),
                    time,
                };
            }

            return {
                gateway,
                status: 'success',
                response: data,
                time,
            };
        } catch (err) {
            return {
                gateway,
                status:
                    (err as { name?: string }).name === 'AbortError'
                        ? 'timeout'
                        : 'error',
                error: (err as { message?: string }).message ?? 'Unknown error',
                time: Date.now() - startTime,
            };
        } finally {
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
        } else {
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
        setMultiResults(
            gateways.map((gateway) => ({
                gateway,
                status: 'pending',
            }))
        );

        // Execute queries in parallel
        const results = await Promise.all(
            gateways.map(async (gateway, index) => {
                const result = await executeQuery(gateway, parseInt(timeout));
                // Update individual result as it completes
                setMultiResults((prev) => [
                    ...prev.slice(0, index),
                    result,
                    ...prev.slice(index + 1),
                ]);
                return result;
            })
        );

        setLoading(false);
    };

    return (
        <div className="flex w-full flex-col gap-4">
            {/* Advanced Mode Toggle */}
            <div className="flex items-center gap-2">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={isAdvancedMode}
                        onChange={(e) => setIsAdvancedMode(e.target.checked)}
                        className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Advanced Mode</span>
                </label>
            </div>

            {!isAdvancedMode ? (
                /* Single Gateway Selection */
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Gateway:</label>
                    <div className="flex gap-4">
                        {Object.keys(DEFAULT_GATEWAYS).map((gateway) => (
                            <label
                                key={gateway}
                                className="flex items-center gap-2"
                            >
                                <input
                                    type="radio"
                                    name="gateway"
                                    checked={
                                        selectedGateway === gateway &&
                                        !customGateway
                                    }
                                    onChange={() => {
                                        setSelectedGateway(
                                            gateway as keyof typeof DEFAULT_GATEWAYS
                                        );
                                        setCustomGateway('');
                                    }}
                                    className="text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm">{gateway}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="gateway"
                            checked={!!customGateway}
                            onChange={() =>
                                setCustomGateway(customGateway || 'http://')
                            }
                            className="text-blue-600 focus:ring-blue-500"
                        />
                        <Input
                            type="text"
                            placeholder="Custom Gateway URL"
                            value={customGateway}
                            onChange={(e) => setCustomGateway(e.target.value)}
                            className="flex-1"
                        />
                    </div>
                </div>
            ) : (
                /* Advanced Gateway List */
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                        Gateway List (one per line):
                    </label>
                    <textarea
                        value={gatewayList}
                        onChange={(e) => setGatewayList(e.target.value)}
                        className="h-32 rounded-lg border border-slate-200 bg-white p-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-800"
                        placeholder={`${Object.values(DEFAULT_GATEWAYS).join('\n')}`}
                    />
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">
                            Timeout (ms):
                        </label>
                        <Input
                            type="number"
                            value={timeout}
                            onChange={(e) => setTimeout(e.target.value)}
                            className="w-32"
                            min="1000"
                            step="1000"
                        />
                    </div>
                </div>
            )}

            {/* Query Input */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Query:</label>
                <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-48 rounded-lg border border-slate-200 bg-white p-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-800"
                    placeholder="Enter your GraphQL query here..."
                />
            </div>

            {/* Execute Button */}
            <div className="flex justify-between">
                <Button
                    onClick={() => setQuery(DEFAULT_QUERY)}
                    disabled={loading}
                >
                    Reset Query
                </Button>
                <Button
                    onClick={
                        isAdvancedMode ? handleMultiQuery : handleSingleQuery
                    }
                    disabled={loading || !query.trim()}
                >
                    {loading
                        ? 'Executing...'
                        : isAdvancedMode
                          ? 'Test All Gateways'
                          : 'Execute Query'}
                </Button>
            </div>

            {/* Response Area for Advanced Mode */}
            {isAdvancedMode && (
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Results:</label>
                    <div className="rounded-lg border border-slate-200 bg-slate-100 p-4 font-mono text-sm dark:border-slate-700 dark:bg-slate-800">
                        {multiResults.map((result, index) => (
                            <details key={index} className="mb-4 last:mb-0">
                                <summary className="flex cursor-pointer items-center gap-2 py-1">
                                    <span className="font-semibold">
                                        {result.gateway}
                                    </span>
                                    <span
                                        className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                                            result.status === 'success'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                                : result.status === 'error'
                                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                                                  : result.status === 'timeout'
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                                                    : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
                                        }`}
                                    >
                                        {result.status.toUpperCase()}
                                    </span>
                                    {result.time && (
                                        <span className="text-xs text-slate-500">
                                            {result.time}ms
                                        </span>
                                    )}
                                </summary>

                                <div className="mt-2 pl-4">
                                    {result.error ? (
                                        <div className="text-red-500">
                                            {result.error}
                                        </div>
                                    ) : result.response ? (
                                        <pre className="overflow-auto whitespace-pre-wrap">
                                            {JSON.stringify(
                                                result.response,
                                                null,
                                                2
                                            )}
                                        </pre>
                                    ) : (
                                        <div className="text-slate-500">
                                            Waiting for response...
                                        </div>
                                    )}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
