import { jsx as _jsx } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { ThemeContext } from '../hooks/useTheme';
export const ThemeProvider = ({ children, }) => {
    const [theme, setTheme] = useState('light');
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('theme', newTheme);
    };
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }, []);
    return (_jsx(ThemeContext.Provider, { value: { theme, toggleTheme }, children: children }));
};
