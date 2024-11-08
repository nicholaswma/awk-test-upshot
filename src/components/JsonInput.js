import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import {} from '../utils/arweaveUtils';
import { DEFAULT_AO_TOKEN } from '../utils/constants';
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
export function JsonInput(props) {
    const { setMessage: setJson } = props;
    const [jsonInput, setJsonInput] = useState(placeholder);
    const [error, setError] = useState(null);
    // const [parsedJson, setParsedJson] = useState(null);
    const handleInputChange = (e) => {
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
        }
        catch (err) {
            setError('Invalid JSON input.');
            console.error(err);
            // setParsedJson(null);
            setJson({ process: '' });
        }
    }, [jsonInput, setJson]);
    return (_jsxs("div", { children: [_jsx("textarea", { className: "rounded-lg border border-slate-300 px-4 py-2 font-mono dark:border-slate-700 dark:bg-slate-950", value: jsonInput, onChange: handleInputChange, placeholder: placeholder, rows: 11, cols: 60 }), error && _jsx("p", { style: { color: 'red' }, children: error })] }));
}
