import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
export function SimpleIcon({ svgPath, className = '' }) {
    const iconRef = useRef(null);
    const [color, setColor] = useState('');
    const { theme } = useTheme();
    useEffect(() => {
        if (iconRef.current) {
            const computedStyle = getComputedStyle(iconRef.current);
            const inheritedColor = computedStyle.getPropertyValue('color');
            setColor(inheritedColor);
            console.log(color);
        }
    }, [theme]);
    return (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", ref: iconRef, className: className, fill: color ? color : theme === 'dark' ? 'white' : 'black', children: _jsx("path", { d: svgPath }) }));
}
