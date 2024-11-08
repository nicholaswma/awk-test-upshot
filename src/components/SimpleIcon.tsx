import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../hooks/useTheme';

export interface SimpleIconProps {
    svgPath: string;
    className?: string;
    fillColor?: string;
}

export function SimpleIcon({ svgPath, className = '' }: SimpleIconProps) {
    const iconRef = useRef<SVGSVGElement | null>(null);
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

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            ref={iconRef}
            className={className}
            fill={color ? color : theme === 'dark' ? 'white' : 'black'}
        >
            <path d={svgPath} />
        </svg>
    );
}
