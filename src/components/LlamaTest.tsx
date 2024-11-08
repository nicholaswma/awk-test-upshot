import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { LLAMA_AO_PROCESS } from '../utils/constants';
import { createMessage, Tag, tag } from '../utils/arweaveUtils';
import { createDataItemSigner } from '@permaweb/aoconnect';
import { useArweave } from '../hooks/useArweave';
import { CU_URLS, type CuUrlKey } from '../utils/constants';

export function LlamaTest() {
    const [prompt, setPrompt] = useState('');
    const [numTokens, setNumTokens] = useState('10');
    const [response, setResponse] = useState<string[]>([]);
    const [prompting, setPrompting] = useState(false);
    const [prompted, setPrompted] = useState(false);
    const [running, setRunning] = useState(false);
    const [selectedCuUrl, setSelectedCuUrl] = useState<CuUrlKey>('Localhost');
    const { ao } = useArweave({ cuUrl: CU_URLS[selectedCuUrl] });

    const handlePrompt = async () => {
        let start, end;
        if (!prompt || prompting) return;
        setPrompting(true);
        setResponse([]);

        try {
            console.log('handlePrompt Started', LLAMA_AO_PROCESS);
            start = Date.now();
            const response = await ao?.message({
                ...createMessage(LLAMA_AO_PROCESS, [
                    tag('Action', 'Prompt'),
                    tag('Prompt', prompt),
                ]),
                signer: createDataItemSigner(window.arweaveWallet),
            });
            const { Messages } = await ao?.result({
                message: response,
                process: LLAMA_AO_PROCESS,
            });
            end = Date.now();
            setPrompted(true);
            console.log(Messages[0].Tags);
            console.log('handlePrompt Ended: ', (end - start) / 1000);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setPrompting(false);
        }
    };

    const handleRun = async () => {
        let start, end;
        if (!prompt || prompting) return;
        setRunning(true);

        try {
            console.log('handleRun Started');
            const tokens = parseInt(numTokens);
            start = Date.now();
            const response = await ao?.message({
                ...createMessage(LLAMA_AO_PROCESS, [
                    tag('Action', 'Run'),
                    tag('Max-Tokens', tokens.toString()),
                ]),
                signer: createDataItemSigner(window.arweaveWallet),
            });
            console.log('response', response);
            const { Messages } = await ao?.result({
                message: response,
                process: LLAMA_AO_PROCESS,
            });
            const tags = Messages?.[0]?.Tags;
            const res = tags?.find(
                (tag: Tag) => tag.name === 'Llama-Response'
            )?.value;
            const finished = tags?.find(
                (tag: Tag) => tag.name === 'Llama-Finished'
            )?.value;
            if (res) {
                setResponse(res);
            }
            console.log('Llama-Finished? ', finished);
            end = Date.now();
            console.log(
                `handleRun Ended: ${(end - start) / 1000} -> ${(end - start) / 1000 / tokens}s/token`
            );
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="flex w-full flex-col gap-4">
            {/* CU_URL Selection */}
            <div className="flex items-center gap-4">
                <label className="text-sm font-medium">AO Compute Unit:</label>
                <div className="flex gap-4">
                    {(Object.keys(CU_URLS) as CuUrlKey[]).map((urlKey) => (
                        <label key={urlKey} className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="cuUrl"
                                checked={selectedCuUrl === urlKey}
                                onChange={() => setSelectedCuUrl(urlKey)}
                                className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">{urlKey}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex items-end gap-4">
                <div className="flex-1">
                    <Input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        maxLength={100}
                        placeholder="Enter your prompt here"
                        className="w-full"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handlePrompt}
                        disabled={
                            !prompt ||
                            prompting ||
                            prompt.length > 100 ||
                            running
                        }
                    >
                        {prompting ? 'Setting...' : 'Prompt'}
                    </Button>
                    <Input
                        type="number"
                        value={numTokens}
                        onChange={(e) => setNumTokens(e.target.value)}
                        min="1"
                        max="100"
                        className="w-full"
                    />
                    <Button
                        onClick={handleRun}
                        disabled={!prompt || prompting || running || !prompted}
                    >
                        {running ? 'Running...' : 'Run'}
                    </Button>
                </div>
            </div>

            {/* Response area */}
            <div className="min-h-[100px] rounded-lg border border-slate-200 bg-slate-100 p-4 dark:border-slate-700 dark:bg-slate-800">
                {response.length > 0 ? (
                    <div className="whitespace-pre-wrap break-words">
                        {response.join('')}
                    </div>
                ) : (
                    <div className="text-slate-500">
                        {prompting
                            ? 'Processing...'
                            : running
                              ? 'Checking generation status...'
                              : 'Response will appear here'}
                    </div>
                )}
            </div>
        </div>
    );
}
