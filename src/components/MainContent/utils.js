import { sidebarItems } from '../../config/sidebarItems';
export function getSelectedItemTitle(selectedItem) {
    return sidebarItems.find(item => item.id === selectedItem)?.title ?? '';
}
export function renderContent(selectedItem) {
    return sidebarItems.find(item => item.id === selectedItem)?.component ?? null;
}
