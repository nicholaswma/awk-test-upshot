import { SimpleIcon } from './SimpleIcon';
import { siGithub, siX } from 'simple-icons';

export function Footer() {
    return (
        <div className="flex w-full items-center justify-end">
            <div className="flex items-center gap-2 text-xs">
                2024
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
            </div>
        </div>
    );
}
