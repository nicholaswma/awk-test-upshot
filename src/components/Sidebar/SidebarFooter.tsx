import ThemeSwitcher from '../ThemeSwitcher';
import { SimpleIcon } from '../SimpleIcon';
import { siGithub, siX } from 'simple-icons';

export function SidebarFooter() {
    return (
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                    <a
                        className="inline-flex hover:cursor-pointer hover:opacity-70"
                        href="https://x.com/@7i7o"
                        target="_blank"
                        >
                        <SimpleIcon className="w-3" svgPath={siX.path} />
                    </a>
                    <a
                        className="inline-flex hover:cursor-pointer hover:opacity-70"
                        href="https://github.com/7i7o/awk-test"
                        target="_blank"
                        >
                        <SimpleIcon className="w-3" svgPath={siGithub.path} />
                    </a>
                    2024
                </div>
                <ThemeSwitcher className="h-5 w-5" />
            </div>
        </div>
    );
} 