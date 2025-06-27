import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { emptyTxResult, TxResult } from './TxResult';
import { useArweave } from '../hooks/useArweave';
import { message, createDataItemSigner, result } from '@permaweb/aoconnect';

export function UpshotEvents() {
    const { ao } = useArweave();
    const [loading, setLoading] = useState(false);
    const [process, setProcess] = useState(
        'bAtS9pAgHBghwg7frBYwy7E4bz2lOjcBw-XN9cqSung'
    );
    const [txResult, setTxResult] = useState(emptyTxResult);
    const [messageResult, setMessageResult] = useState<any>(null);
    const [listEventsResult, setListEventsResult] = useState<any>(null);
    const [cardsByEventResult, setCardsByEventResult] = useState<any>(null);
    const [showCreateEvent, setShowCreateEvent] = useState(false);
    const [showEditEvent, setShowEditEvent] = useState(false);
    const [eventIdForCards, setEventIdForCards] = useState('');
    const [deleteEventId, setDeleteEventId] = useState('');

    // Event creation states
    const [eventName, setEventName] = useState('');
    const [eventCategoryId, setEventCategoryId] = useState('');
    const [eventImage, setEventImage] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [eventRules, setEventRules] = useState('');
    const [eventStatus, setEventStatus] = useState('active');
    const [eventDate, setEventDate] = useState('');
    const [eventOutcomes, setEventOutcomes] = useState('');
    const [eventId, setEventId] = useState('');

    // Event edit states
    const [editEventId, setEditEventId] = useState('');
    const [editEventName, setEditEventName] = useState('');
    const [editEventCategoryIds, setEditEventCategoryIds] = useState('');
    const [editEventImage, setEditEventImage] = useState('');
    const [editEventDescription, setEditEventDescription] = useState('');
    const [editEventRules, setEditEventRules] = useState('');
    const [editEventStatus, setEditEventStatus] = useState('');
    const [editEventDate, setEditEventDate] = useState('');
    const [editEventOutcomes, setEditEventOutcomes] = useState('');
    const [editEventWinningOutcome, setEditEventWinningOutcome] = useState('');

    const readResult = async () => {
        if (!txResult.txId || !process) return;
        try {
            const { Messages, Spawns, Output, Error } = await result({
                message: txResult.txId,
                process: process,
            });
            setMessageResult({ Messages, Spawns, Output, Error });
            console.log('Message Result:', { Messages, Spawns, Output, Error });
        } catch (err) {
            console.error(err);
        }
    };

    const readListEvents = async () => {
        if (!process || !ao) return;
        setLoading(true);
        try {
            const dryRunResult = await ao.dryrun({
                process,
                tags: [{ name: 'Action', value: 'ListEvents' }],
                data: JSON.stringify({}),
                signer: createDataItemSigner(window.arweaveWallet),
            });

            console.log('Dry Run Result:', dryRunResult);

            if (dryRunResult.Messages && dryRunResult.Messages[0]?.Data) {
                const parsedData = JSON.parse(dryRunResult.Messages[0].Data);
                setListEventsResult(parsedData.events);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const readCardsByEvent = async () => {
        if (!process || !eventIdForCards || !ao) return;
        setLoading(true);
        try {
            const dryRunResult = await ao.dryrun({
                process,
                tags: [{ name: 'Action', value: 'GetCardsByEvent' }],
                data: JSON.stringify({
                    eventId: parseInt(eventIdForCards),
                }),
                signer: createDataItemSigner(window.arweaveWallet),
            });

            console.log('Dry Run Result:', dryRunResult);

            if (dryRunResult.Messages && dryRunResult.Messages[0]?.Data) {
                const parsedData = JSON.parse(dryRunResult.Messages[0].Data);
                setCardsByEventResult(parsedData.cards);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const populateEditForm = (event: any) => {
        if (!event) return;

        setEditEventId(event.id.toString());
        setEditEventName(event.event_name || '');
        setEditEventCategoryIds(
            event.category_ids ? event.category_ids.join(',') : ''
        );
        setEditEventImage(event.image || '');
        setEditEventDescription(event.description || '');
        setEditEventRules(event.rules || '');
        setEditEventStatus(event.status || 'active');

        // Convert timestamp to ISO string for datetime-local input
        if (event.event_date) {
            const date = new Date(event.event_date * 1000);
            setEditEventDate(date.toISOString().slice(0, 16)); // Format: YYYY-MM-DDThh:mm
        } else {
            setEditEventDate('');
        }

        // Make sure outcomes is properly handled as an array
        if (event.outcomes && Array.isArray(event.outcomes)) {
            setEditEventOutcomes(event.outcomes.join(', '));
        } else if (event.outcomes) {
            console.log('Outcomes format issue:', event.outcomes);
            // Try to handle the case where outcomes might be an object or string
            try {
                const outcomesArray = Array.isArray(event.outcomes) 
                    ? event.outcomes 
                    : typeof event.outcomes === 'string' 
                        ? event.outcomes.split(',') 
                        : Object.values(event.outcomes);
                setEditEventOutcomes(outcomesArray.join(', '));
            } catch (err) {
                console.error('Error processing outcomes:', err);
                setEditEventOutcomes('');
            }
        } else {
            setEditEventOutcomes('');
        }
        
        // Handle winning outcome (could be ID number or null)
        if (event.winning_outcome !== null && event.winning_outcome !== undefined) {
            setEditEventWinningOutcome(event.winning_outcome.toString());
        } else {
            setEditEventWinningOutcome('');
        }

        setShowEditEvent(true);
    };

    const createEvent = async () => {
        if (
            !process ||
            !eventName ||
            !eventCategoryId ||
            !eventDate ||
            !eventOutcomes ||
            !eventDescription
        )
            return;
        setLoading(true);
        try {
            const outcomesArray = eventOutcomes
                .split(',')
                .map((outcome) => outcome.trim());
            const eventDateTimestamp = Math.floor(
                new Date(eventDate).getTime() / 1000
            );

            console.log('Raw eventDate:', eventDate);
            console.log('Converted timestamp:', eventDateTimestamp);

            console.log('Full event data:', {
                event_name: eventName,
                category_ids: [parseInt(eventCategoryId)],
                image: eventImage || '',
                description: eventDescription,
                rules: eventRules || '',
                status: eventStatus,
                event_date: eventDateTimestamp,
                outcomes: outcomesArray,
                winning_outcome: null,
            });

            const msgId = await ao?.message({
                process,
                tags: [{ name: 'Action', value: 'CreateEvent' }],
                data: JSON.stringify({
                    event_name: eventName,
                    category_ids: [parseInt(eventCategoryId)],
                    image: eventImage || '',
                    description: eventDescription,
                    rules: eventRules || '',
                    status: eventStatus,
                    event_date: eventDateTimestamp,
                    outcomes: outcomesArray,
                    winning_outcome: null,
                }),
                signer: createDataItemSigner(window.arweaveWallet),
            });
            console.log(' | Sent Create Event Message Id: ', msgId);
            setTxResult({
                txId: msgId,
                status: `200`,
                statusMsg: `OK`,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const editEvent = async () => {
        if (!process || !editEventId) return;
        setLoading(true);
        try {
            const data: any = {
                id: parseInt(editEventId),
            };

            if (editEventName) data.event_name = editEventName;
            if (editEventCategoryIds) {
                data.category_ids = editEventCategoryIds
                    .split(',')
                    .map((id) => parseInt(id.trim()));
            }
            if (editEventImage) data.image = editEventImage;
            if (editEventDescription) data.description = editEventDescription;
            if (editEventRules) data.rules = editEventRules;
            if (editEventStatus) data.status = editEventStatus;

            if (editEventDate) {
                data.event_date = Math.floor(
                    new Date(editEventDate).getTime() / 1000
                );
            }

            if (editEventOutcomes) {
                // Ensure we're handling outcomes as a proper array of strings
                const outcomeStrings = typeof editEventOutcomes === 'string' 
                    ? editEventOutcomes.split(',').map(o => o.trim()).filter(o => o !== '') 
                    : Array.isArray(editEventOutcomes) 
                        ? editEventOutcomes 
                        : [];
                        
                if (outcomeStrings.length > 0) {
                    data.outcomes = outcomeStrings;
                }
            }

            if (editEventWinningOutcome) {
                // Convert to number if it's a numeric string
                const winningOutcomeNum = parseInt(editEventWinningOutcome);
                data.winning_outcome = !isNaN(winningOutcomeNum) ? winningOutcomeNum : editEventWinningOutcome;
            }

            console.log('Edit event data:', data);

            const msgId = await ao.message({
                process,
                tags: [{ name: 'Action', value: 'EditEvent' }],
                data: JSON.stringify(data),
                signer: createDataItemSigner(window.arweaveWallet),
            });
            console.log(' | Sent Edit Event Message Id: ', msgId);
            setTxResult({
                txId: msgId,
                status: `200`,
                statusMsg: `OK`,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const deleteEvent = async () => {
        if (!process || !deleteEventId) return;
        setLoading(true);
        try {
            const msgId = await message({
                process,
                tags: [{ name: 'Action', value: 'DeleteEvent' }],
                data: JSON.stringify({
                    id: parseInt(deleteEventId),
                }),
                signer: createDataItemSigner(window.arweaveWallet),
            });
            console.log(' | Sent Delete Event Message Id: ', msgId);
            setTxResult({
                txId: msgId,
                status: `200`,
                statusMsg: `OK`,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full flex-col items-start justify-between gap-2">
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-1">
                    Process ID:&nbsp;
                    <Input
                        type="text"
                        placeholder="AO Process ID"
                        value={process}
                        onChange={(e) => setProcess(e.target.value)}
                        className="w-80"
                    />
                </div>
            </div>
            <div className="flex w-full flex-col gap-4 border-t pt-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Create Event</h3>
                    <Button
                        onClick={() => setShowCreateEvent(!showCreateEvent)}
                    >
                        {showCreateEvent ? 'Hide' : 'Show'}
                    </Button>
                </div>
                {showCreateEvent && (
                    <>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Event Name:&nbsp;
                                <Input
                                    type="text"
                                    placeholder="Event Name"
                                    value={eventName}
                                    onChange={(e) =>
                                        setEventName(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Category ID:&nbsp;
                                <Input
                                    type="text"
                                    placeholder="Category ID"
                                    value={eventCategoryId}
                                    onChange={(e) =>
                                        setEventCategoryId(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Image Hash:&nbsp;
                                <Input
                                    type="text"
                                    placeholder="Arweave Image Hash"
                                    value={eventImage}
                                    onChange={(e) =>
                                        setEventImage(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Description:&nbsp;
                                <Input
                                    type="text"
                                    placeholder="Event Description"
                                    value={eventDescription}
                                    onChange={(e) =>
                                        setEventDescription(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Rules:&nbsp;
                                <Input
                                    type="text"
                                    placeholder="Event Rules"
                                    value={eventRules}
                                    onChange={(e) =>
                                        setEventRules(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Status:&nbsp;
                                <select
                                    value={eventStatus}
                                    onChange={(e) =>
                                        setEventStatus(e.target.value)
                                    }
                                    className="rounded border bg-white p-2 text-black"
                                >
                                    <option value="active">Active</option>
                                    <option value="pending resolution">
                                        Pending Resolution
                                    </option>
                                    <option value="resolved">Resolved</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Event Date:&nbsp;
                                <Input
                                    type="datetime-local"
                                    value={eventDate}
                                    onChange={(e) =>
                                        setEventDate(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Outcomes (comma-separated):&nbsp;
                                <Input
                                    type="text"
                                    placeholder="Outcome1, Outcome2, Outcome3"
                                    value={eventOutcomes}
                                    onChange={(e) =>
                                        setEventOutcomes(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <Button
                                onClick={createEvent}
                                disabled={
                                    !process ||
                                    !eventName ||
                                    !eventCategoryId ||
                                    !eventDate ||
                                    !eventOutcomes ||
                                    loading
                                }
                            >
                                Create Event
                            </Button>
                        </div>
                    </>
                )}
            </div>

            <div className="flex w-full flex-col gap-4 border-t pt-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Edit Event</h3>
                    <Button onClick={() => setShowEditEvent(!showEditEvent)}>
                        {showEditEvent ? 'Hide' : 'Show'}
                    </Button>
                </div>
                {showEditEvent && (
                    <>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Event ID:&nbsp;
                                <select
                                    value={editEventId}
                                    onChange={(e) => {
                                        setEditEventId(e.target.value);
                                        if (
                                            e.target.value &&
                                            listEventsResult
                                        ) {
                                            const event = listEventsResult.find(
                                                (ev: any) =>
                                                    ev.id.toString() ===
                                                    e.target.value
                                            );
                                            if (event) {
                                                populateEditForm(event);
                                            }
                                        }
                                    }}
                                    className="w-full rounded border bg-white p-2 text-black"
                                >
                                    <option value="">Select an event</option>
                                    {listEventsResult?.map((event: any) => (
                                        <option key={event.id} value={event.id}>
                                            {event.event_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Event Name:&nbsp;
                                <Input
                                    type="text"
                                    placeholder="Event Name"
                                    value={editEventName}
                                    onChange={(e) =>
                                        setEditEventName(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Category IDs (comma-separated):&nbsp;
                                <Input
                                    type="text"
                                    placeholder="1,2,3"
                                    value={editEventCategoryIds}
                                    onChange={(e) =>
                                        setEditEventCategoryIds(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Image Hash:&nbsp;
                                <Input
                                    type="text"
                                    placeholder="Arweave Image Hash"
                                    value={editEventImage}
                                    onChange={(e) =>
                                        setEditEventImage(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Description:&nbsp;
                                <Input
                                    type="text"
                                    placeholder="Event Description"
                                    value={editEventDescription}
                                    onChange={(e) =>
                                        setEditEventDescription(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Rules:&nbsp;
                                <Input
                                    type="text"
                                    placeholder="Event Rules"
                                    value={editEventRules}
                                    onChange={(e) =>
                                        setEditEventRules(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Status:&nbsp;
                                <select
                                    value={editEventStatus}
                                    onChange={(e) =>
                                        setEditEventStatus(e.target.value)
                                    }
                                    className="rounded border bg-white p-2 text-black"
                                >
                                    <option value="">No Change</option>
                                    <option value="active">Active</option>
                                    <option value="pending resolution">
                                        Pending Resolution
                                    </option>
                                    <option value="resolved">Resolved</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Event Date:&nbsp;
                                <Input
                                    type="datetime-local"
                                    value={editEventDate}
                                    onChange={(e) =>
                                        setEditEventDate(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Outcomes (comma-separated):&nbsp;
                                <Input
                                    type="text"
                                    placeholder="Outcome1, Outcome2, Outcome3"
                                    value={editEventOutcomes}
                                    onChange={(e) =>
                                        setEditEventOutcomes(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Winning Outcome ID:&nbsp;
                                <Input
                                    type="text"
                                    placeholder="ID of winning outcome, or leave empty"
                                    value={editEventWinningOutcome}
                                    onChange={(e) =>
                                        setEditEventWinningOutcome(
                                            e.target.value
                                        )
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <Button
                                onClick={editEvent}
                                disabled={!process || !editEventId || loading}
                            >
                                Edit Event
                            </Button>
                        </div>
                    </>
                )}
            </div>

            <div className="flex w-full items-center justify-between">
                <Button onClick={readListEvents} disabled={!process || loading}>
                    List Events (Dry Run)
                </Button>
            </div>
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-1">
                    Event ID to Delete:&nbsp;
                    <select
                        value={deleteEventId}
                        onChange={(e) => setDeleteEventId(e.target.value)}
                        className="w-full rounded border bg-white p-2 text-black"
                    >
                        <option value="">Select an event</option>
                        {listEventsResult?.map((event: any) => (
                            <option key={event.id} value={event.id}>
                                {event.event_name}
                            </option>
                        ))}
                    </select>
                </div>
                <Button
                    onClick={deleteEvent}
                    disabled={!process || !deleteEventId || loading}
                >
                    Delete Event
                </Button>
            </div>
            
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-1">
                    Event ID for Cards:&nbsp;
                    <Input
                        type="text"
                        placeholder="Event ID"
                        value={eventIdForCards}
                        onChange={(e) => setEventIdForCards(e.target.value)}
                        className="w-full"
                    />
                </div>
                <Button
                    onClick={readCardsByEvent}
                    disabled={!process || !eventIdForCards || loading}
                >
                    Get Cards by Event (Dry Run)
                </Button>
            </div>
            {listEventsResult && (
                <pre className="rounded p-2">
                    {JSON.stringify(listEventsResult, null, 2)}
                </pre>
            )}
            {cardsByEventResult && (
                <pre className="rounded p-2">
                    {JSON.stringify(cardsByEventResult, null, 2)}
                </pre>
            )}
            {txResult.status && (
                <div className="flex w-full flex-col gap-2">
                    <TxResult txResult={{ ...txResult, aoResult: true }} />
                    <Button
                        onClick={readResult}
                        disabled={!txResult.txId || loading}
                    >
                        Read Result
                    </Button>
                    {messageResult && (
                        <pre className="rounded p-2">
                            {JSON.stringify(messageResult, null, 2)}
                        </pre>
                    )}
                </div>
            )}
        </div>
    );
}
