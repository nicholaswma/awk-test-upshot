import { SidebarHeader } from './SidebarHeader';
import { SidebarNavigation } from './SidebarNavigation';
import { SidebarFooter } from './SidebarFooter';

interface SidebarProps {
    connected: boolean;
    selectedItem: string | null;
    onItemClick: (itemId: string) => void;
}

export function Sidebar({ connected, selectedItem, onItemClick }: SidebarProps) {
    return (
        <div className="flex w-64 flex-col border-r border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
            <SidebarHeader />
            <SidebarNavigation 
                connected={connected}
                selectedItem={selectedItem}
                onItemClick={onItemClick}
            />
            <SidebarFooter />
        </div>
    );
} 