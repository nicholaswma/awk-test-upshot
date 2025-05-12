import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { UpshotCategories } from './UpshotCategories';
import { UpshotEvents } from './UpshotEvents';
import { UpshotPacks } from './UpshotPacks';
import { UpshotCards } from './UpshotCards';

export function Upshot() {
    const [selectedSection, setSelectedSection] = useState<string | null>(null);

    return (
        <div className="flex w-full flex-col items-start justify-between gap-4">
            <div className="flex w-full flex-wrap gap-2">
                <Button
                    onClick={() => setSelectedSection('categories')}
                    className={
                        selectedSection === 'categories' ? 'bg-blue-600' : ''
                    }
                >
                    Categories
                </Button>
                <Button
                    onClick={() => setSelectedSection('events')}
                    className={
                        selectedSection === 'events' ? 'bg-blue-600' : ''
                    }
                >
                    Events
                </Button>
                <Button
                    onClick={() => setSelectedSection('packs')}
                    className={selectedSection === 'packs' ? 'bg-blue-600' : ''}
                >
                    Packs
                </Button>
                <Button
                    onClick={() => setSelectedSection('cards')}
                    className={selectedSection === 'cards' ? 'bg-blue-600' : ''}
                >
                    Cards
                </Button>
            </div>

            <div className="w-full border-t pt-4">
                {selectedSection === 'categories' && <UpshotCategories />}
                {selectedSection === 'events' && <UpshotEvents />}
                {selectedSection === 'packs' && <UpshotPacks />}
                {selectedSection === 'cards' && <UpshotCards />}
                {!selectedSection && (
                    <div className="p-8 text-center text-gray-500">
                        Select a section above to manage Upshot content
                    </div>
                )}
            </div>
        </div>
    );
}
