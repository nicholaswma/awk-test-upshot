import { jsx as _jsx } from "react/jsx-runtime";
import { ANT, IO } from '@ar.io/sdk/web';
import { Button } from './Button';
import { useMemo } from 'react';
const ARNS_NAMES = ['matias', 'valarmorghulis', 'valardohaeris', 'bark'];
export function ArIOTest() {
    const io = useMemo(() => {
        return IO.init();
    }, []);
    const test = async () => {
        const start = new Date().getTime();
        const times = 100;
        for (let i = 0; i < times; i++) {
            const arns = ARNS_NAMES[i % ARNS_NAMES.length];
            const record = await io.getArNSRecord({
                name: arns ?? '',
            });
            if (record) {
                const ant = ANT.init({ processId: record.processId });
                const info = await ant.getInfo();
                console.log(`${arns} -> ${record.processId} -> ${info.Owner}`);
            }
        }
        console.log((new Date().getTime() - start) / times);
    };
    return (_jsx("div", { className: "justify-betweengap-2 flex w-full flex-col items-start", children: _jsx("div", { className: "-mt-2 flex w-full items-center justify-between space-y-2", children: _jsx(Button, { onClick: test, children: "Test ArIO SDK" }) }) }));
}
