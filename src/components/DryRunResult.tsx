export type DryRunResult = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Output: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Messages: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Spawns: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Error?: any;
};

export const emptyDryRunResult: DryRunResult = {
    Output: '',
    Messages: [],
    Spawns: [],
};

export function DryRunResult(props: { dryRunResult: DryRunResult }) {
    const { dryRunResult = emptyDryRunResult } = props;
    return (
        <div className="flex items-center">
            <pre>{JSON.stringify(dryRunResult, null, 2)}</pre>
        </div>
    );
}
