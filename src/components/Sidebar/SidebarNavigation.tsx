import { SidebarItem } from "./SidebarItem";
import { sidebarItems } from "../../config/sidebarItems";

interface SidebarNavigationProps {
    connected: boolean;
    selectedItem: string | null;
    onItemClick: (itemId: string) => void;
}

export function SidebarNavigation({ connected, selectedItem, onItemClick }: SidebarNavigationProps) {
    return (
        <nav className="flex-1 space-y-1 p-4">
            {connected && (
                <>
                    <div className="space-y-1">
                        {sidebarItems.map((item) => (
                            <SidebarItem
                                key={item.id}
                                title={item.title}
                                isActive={selectedItem === item.id}
                                onClick={() => onItemClick(item.id)}
                            />
                        ))}
                    </div>
                </>
            )}
        </nav>
    );
} 