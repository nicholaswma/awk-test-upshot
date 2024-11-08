import { useApi } from 'arweave-wallet-kit';
import { Button } from './Button';
import { DataItem } from 'warp-arbundles';

export function BatchTest() {
    const api = useApi();

    const test = async () => {
        if (!api) return;

        const dis = ['a', 'b', 'c'].map((s) => {
            return { data: s, tags: [{ name: 'Peek', value: s }] };
        });
        console.log(dis);

        //@ts-ignore
        const signedDis = await api.batchSignDataItem(dis);
        console.log(signedDis);
        for (const rawDI of signedDis) {
            const di = new DataItem(rawDI as Buffer);
            const response = await fetch(`https://upload.ardrive.io/v1/tx`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
                body: di.getRaw(),
            });
            console.log(await response.json());
        }
    };

    return (
        <div className="justify-betweengap-2 flex w-full flex-col items-start">
            <div className="-mt-2 flex w-full items-center justify-between space-y-2">
                <Button onClick={() => test()} disabled={!api}>
                    Test Batch Sign
                </Button>
            </div>
        </div>
    );
}
