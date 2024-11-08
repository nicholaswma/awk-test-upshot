import { ChangeEvent, useEffect, useState } from 'react';
import { Message } from '../utils/arweaveUtils';
import { DEFAULT_AO_TOKEN } from '../utils/constants';

export interface JsonInputProps {
    setMessage: (parsed: Message) => void;
}

const placeholder = `{ "process": "${DEFAULT_AO_TOKEN}",
  "tags": [
    {
      "name": "Action",
      "value": "Info"
    },
    {
      "name": "Another-Tag",
      "value": "Tag-Value"
    }
]}`;

export function JsonInput(props: JsonInputProps) {
    const { setMessage: setJson } = props;
    const [jsonInput, setJsonInput] = useState(placeholder);
    const [error, setError] = useState<string | null>(null);
    // const [parsedJson, setParsedJson] = useState(null);

    const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setJsonInput(e.target.value);
        setError(null);
    };

    useEffect(() => {
        try {
            const parsed = JSON.parse(jsonInput);
            // setParsedJson(parsed);
            setJson(parsed);
            console.log(parsed);
            setError(null);
        } catch (err) {
            setError('Invalid JSON input.');
            console.error(err);
            // setParsedJson(null);
            setJson({ process: '' });
        }
    }, [jsonInput, setJson]);

    return (
        <div>
            <textarea
                className="rounded-lg border border-slate-300 px-4 py-2 font-mono dark:border-slate-700 dark:bg-slate-950"
                value={jsonInput}
                onChange={handleInputChange}
                placeholder={placeholder}
                rows={11}
                cols={60}
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {/* {parsedJson && <p>{JSON.stringify(parsedJson, null, 2)}</p>} */}
        </div>
    );
}
