import { useConnection } from 'arweave-wallet-kit';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';

function Main() {
    const { connected } = useConnection();
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    const handleItemClick = (itemId: string) => {
        setSelectedItem(selectedItem === itemId ? null : itemId);
    };

    return (
        <div className="flex h-screen text-slate-950 dark:text-slate-50">
            <Sidebar 
                connected={connected}
                selectedItem={selectedItem}
                onItemClick={handleItemClick}
            />
            <MainContent 
                selectedItem={selectedItem}
            />
        </div>
    );
}

export default Main;
