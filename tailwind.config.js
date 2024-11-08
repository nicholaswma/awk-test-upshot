/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                roboto: ['"Roboto"', ...defaultTheme.fontFamily.sans],
                ['roboto-mono']: [
                    '"Roboto Mono"',
                    ...defaultTheme.fontFamily.mono,
                ],
            },
        },
    },
    plugins: [],
};
