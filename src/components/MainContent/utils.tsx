import { sidebarItems } from '../../config/sidebarItems';

export function getSelectedItemTitle(selectedItem: string | null): string {
    return sidebarItems.find(item => item.id === selectedItem)?.title ?? '';
}

export function renderContent(selectedItem: string): React.ReactNode {
    return sidebarItems.find(item => item.id === selectedItem)?.component ?? null;
} 