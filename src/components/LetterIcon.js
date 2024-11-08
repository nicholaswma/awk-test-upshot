import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
export function LetterIcon({ letter, className = '' }) {
    const iconRef = useRef(null);
    const [color, setColor] = useState('');
    const { theme } = useTheme();
    useEffect(() => {
        if (iconRef.current) {
            const computedStyle = getComputedStyle(iconRef.current);
            const inheritedColor = computedStyle.getPropertyValue('color');
            setColor(inheritedColor);
            // console.log(color);
        }
    }, [theme]);
    return (_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", ref: iconRef, className: className, children: [_jsx("circle", { cx: "50%", cy: "50%", r: "30", fill: color ? color : theme === 'dark' ? 'black' : 'white', opacity: "0.5" }), _jsx("text", { "font-size": "20", x: "12", y: "19", "text-anchor": "middle", "font-family": "sans-serif", color: "", children: letter })] }));
}
