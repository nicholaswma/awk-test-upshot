import { MainContentHeader } from './MainContentHeader';
import { getSelectedItemTitle, renderContent } from './utils';

interface MainContentProps {
    selectedItem: string | null;
}

export function MainContent({ selectedItem }: MainContentProps) {
    return (
        <div className="flex flex-1 flex-col bg-slate-50 dark:bg-slate-950">
            <MainContentHeader selectedItemTitle={getSelectedItemTitle(selectedItem)} />
            <div className="flex-1 p-4">
                {selectedItem && (
                    <div className="flex w-full flex-col items-center justify-center">
                        {renderContent(selectedItem)}
                    </div>
                )}
            </div>
        </div>
    );
}
