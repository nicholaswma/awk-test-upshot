import { useTheme } from "../../hooks/useTheme";

export function SidebarHeader() {
    const { theme } = useTheme();
    return (
        <div className="p-4 text-center dark:border-slate-800">
            <h1 className="flex items-center justify-center text-3xl font-bold">
                <img src={theme === "dark"? '/awk.dark.svg':'/awk.light.svg'} alt="AWK" className="h-6 mr-1"/>
                Test
            </h1>
        </div>
    );
} 