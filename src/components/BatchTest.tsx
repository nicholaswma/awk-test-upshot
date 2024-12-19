import { useApi } from '../utils/awk';
import { Button } from './Button';
import { DataItem } from 'warp-arbundles';
import TagsDisplay from './TagsDisplay';

export function BatchTest() {
    const api = useApi();

    const tagsExample = [
        { name: 'Content-Type', value: 'image/png' },
        { name: 'Creator', value: '3-wJvHy394n92g' },
        { name: 'Title', value: 'soggystarrynight2' },
        { name: 'Description', value: "ade mc @ ade's press 2023-4" },
        { name: 'Implements', value: 'ANS-110' },
        { name: 'Date-Created', value: '1719048914300' },
        { name: 'Action', value: 'Add-Uploaded-Asset' },
    ];

    const test = async () => {
        if (!api) return;

        const dis = ['a', 'b', 'c'].map((s) => {
            return { data: s, tags: [{ name: 'Peek', value: s }] };
        });
        console.log(dis);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
            <div className="-mt-2 flex w-full flex-col items-center justify-between space-y-2">
                <Button onClick={() => test()} disabled={!api}>
                    Test Batch Sign
                </Button>
                <div className="text-lg font-semibold">Tags Example:</div>
                <TagsDisplay tags={tagsExample} />
            </div>
        </div>
    );
}
