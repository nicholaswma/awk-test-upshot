import { useState } from 'react';
import { Button } from './Button';
import { message, createDataItemSigner } from '@permaweb/aoconnect';

export function UpshotBuyPack() {
    const [loading, setLoading] = useState(false);
    const [purchaseSuccessModalVisible, setPurchaseSuccessModalVisible] =
        useState(false);

    // Hardcoded pack data
    const pack = {
        description: 'Testing 5cent card',
        status: 'active',
        category_ids: [1],
        card_quantity: 2,
        event_ids: [40],
        id: 10,
        pack_name: 'Sports Pack (T) .05',
        price_per_card: '50000000000',
    };

    const buyPack = async () => {
        setLoading(true);
        try {
            const quantity = 1; // Default to 1 pack
            const totalPrice =
                parseFloat(pack.price_per_card) * pack.card_quantity * quantity;

            const msgId = await message({
                process: 'FBt9A5GA_KXMMSxA2DJ0xZbAq8sLLU2ak-YJe9zDvg8', // Target process
                tags: [
                    { name: 'Action', value: 'Transfer' },
                    {
                        name: 'Recipient',
                        value: 'bAtS9pAgHBghwg7frBYwy7E4bz2lOjcBw-XN9cqSung',
                    }, // PROCESS_IDS.MAIN
                    { name: 'Quantity', value: totalPrice.toString() },
                    { name: 'X-Action', value: 'BuyPack' },
                    { name: 'X-PackId', value: pack.id.toString() },
                    { name: 'X-Pack-Quantity', value: quantity.toString() },
                ],
                signer: createDataItemSigner(window.arweaveWallet),
            });

            console.log('Purchase Message Id: ', msgId);
            setPurchaseSuccessModalVisible(true);
        } catch (err) {
            console.error('Purchase failed:', err);
            // Handle error appropriately
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full flex-col items-start justify-between gap-4">
            <h3 className="text-lg font-bold">Buy Pack</h3>

            <div className="w-full rounded-lg border p-4">
                <h4 className="text-md mb-2 font-semibold">Pack Details</h4>
                <div className="space-y-2 text-sm">
                    <p>
                        <strong>Name:</strong> {pack.pack_name}
                    </p>
                    <p>
                        <strong>Description:</strong> {pack.description}
                    </p>
                    <p>
                        <strong>Cards per pack:</strong> {pack.card_quantity}
                    </p>
                    <p>
                        <strong>Price per card:</strong> {pack.price_per_card}
                    </p>
                    <p>
                        <strong>Total price:</strong>{' '}
                        {(
                            parseFloat(pack.price_per_card) * pack.card_quantity
                        ).toString()}
                    </p>
                    <p>
                        <strong>Status:</strong> {pack.status}
                    </p>
                </div>
            </div>

            <Button
                onClick={buyPack}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
            >
                {loading ? 'Processing...' : 'Buy Pack'}
            </Button>

            {purchaseSuccessModalVisible && (
                <div className="w-full rounded-lg bg-green-50 p-4 text-green-800">
                    <h4 className="font-semibold">Purchase Successful!</h4>
                    <p className="text-sm">
                        Your pack purchase has been submitted successfully.
                    </p>
                    <Button
                        onClick={() => setPurchaseSuccessModalVisible(false)}
                        className="mt-2 bg-green-600 hover:bg-green-700"
                    >
                        Close
                    </Button>
                </div>
            )}
        </div>
    );
}
