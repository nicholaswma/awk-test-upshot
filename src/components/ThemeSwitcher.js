import { jsx as _jsx } from "react/jsx-runtime";
import {} from 'react';
import {} from 'react/jsx-runtime';
import { useTheme } from '../hooks/useTheme';
import { Moon, Sun } from 'lucide-react';
const ThemeSwitcher = (props) => {
    const { theme, toggleTheme } = useTheme();
    return (_jsx("button", { onClick: toggleTheme, ...props, children: theme === 'light' ? (_jsx(Moon, { className: props.className })) : (_jsx(Sun, { className: props.className })) }));
};
export default ThemeSwitcher;
