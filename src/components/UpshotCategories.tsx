import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { emptyTxResult, TxResult } from './TxResult';
import { useArweave } from '../hooks/useArweave';
import { message, createDataItemSigner, result } from '@permaweb/aoconnect';

export function UpshotCategories() {
    const { ao } = useArweave();
    const [loading, setLoading] = useState(false);
    const [process, setProcess] = useState(
        'bAtS9pAgHBghwg7frBYwy7E4bz2lOjcBw-XN9cqSung'
    );
    const [categoryName, setCategoryName] = useState('');
    const [id, setId] = useState('');
    const [image, setImage] = useState('');
    const [colorGradient, setColorGradient] = useState('');
    const [status, setStatus] = useState('active');
    const [txResult, setTxResult] = useState(emptyTxResult);
    const [messageResult, setMessageResult] = useState<any>(null);
    const [listCategoriesResult, setListCategoriesResult] = useState<any>(null);
    const [editCategoryName, setEditCategoryName] = useState('');
    const [editImage, setEditImage] = useState('');
    const [editStatus, setEditStatus] = useState('active');
    const [editGradient, setEditGradient] = useState('');
    const [editId, setEditId] = useState('');
    const [showEditCategory, setShowEditCategory] = useState(false);
    const [showCreateCategory, setShowCreateCategory] = useState(false);

    const sendAOMessage = async () => {
        if (!process || !categoryName) return;
        setLoading(true);
        try {
            const msgId = await message({
                process,
                tags: [{ name: 'Action', value: 'CreateCategory' }],
                data: JSON.stringify({
                    categoryName,
                    image,
                    colorGradient,
                    status,
                }),
                signer: createDataItemSigner(window.arweaveWallet),
            });
            console.log(' | Sent Message Id: ', msgId);
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

    const readListCategories = async () => {
        if (!process || !ao) return;
        setLoading(true);
        try {
            const dryRunResult = await ao.dryrun({
                process,
                tags: [{ name: 'Action', value: 'ListCategories' }],
                data: JSON.stringify({}),
                signer: createDataItemSigner(window.arweaveWallet),
            });

            console.log('Dry Run Result:', dryRunResult);

            if (dryRunResult.Messages && dryRunResult.Messages[0]?.Data) {
                const parsedData = JSON.parse(dryRunResult.Messages[0].Data);
                setListCategoriesResult(parsedData.categories);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const deleteCategory = async () => {
        if (!process || !id) return;
        setLoading(true);
        try {
            const msgId = await message({
                process,
                tags: [{ name: 'Action', value: 'DeleteCategory' }],
                data: JSON.stringify({
                    id: parseInt(id),
                }),
                signer: createDataItemSigner(window.arweaveWallet),
            });
            console.log(' | Sent Delete Message Id: ', msgId);
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

    const editCategory = async () => {
        if (!process || !editId) return;
        setLoading(true);
        try {
            const data: any = {
                id: parseInt(editId),
            };

            if (editCategoryName) data.category_name = editCategoryName;
            if (editImage) data.image = editImage;
            if (editStatus) data.status = editStatus;
            if (editGradient) data.color_gradient = editGradient;

            const msgId = await ao?.message({
                process,
                tags: [{ name: 'Action', value: 'EditCategory' }],
                data: JSON.stringify(data),
                signer: createDataItemSigner(window.arweaveWallet),
            });
            console.log(' | Sent Edit Message Id: ', msgId);
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

    const createCategory = async () => {
        if (!process || !categoryName) return;
        setLoading(true);
        try {
            const msgId = await message({
                process,
                tags: [{ name: 'Action', value: 'CreateCategory' }],
                data: JSON.stringify({
                    category_name: categoryName,
                    image: image || '',
                    color_gradient: colorGradient || '',
                    status,
                }),
                signer: createDataItemSigner(window.arweaveWallet),
            });
            console.log(' | Sent Create Category Message Id: ', msgId);
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
                    <h3 className="text-lg font-bold">Create Category</h3>
                    <Button
                        onClick={() =>
                            setShowCreateCategory(!showCreateCategory)
                        }
                    >
                        {showCreateCategory ? 'Hide' : 'Show'}
                    </Button>
                </div>
                {showCreateCategory && (
                    <>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Category Name:&nbsp;
                                <Input
                                    type="text"
                                    placeholder="Category Name"
                                    value={categoryName}
                                    onChange={(e) =>
                                        setCategoryName(e.target.value)
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
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Color Gradient:&nbsp;
                                <Input
                                    type="text"
                                    placeholder="CSS Gradient"
                                    value={colorGradient}
                                    onChange={(e) =>
                                        setColorGradient(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Status:&nbsp;
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="rounded border bg-white p-2 text-black"
                                >
                                    <option value="active">Active</option>
                                    <option value="coming soon">
                                        Coming Soon
                                    </option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <Button
                                onClick={createCategory}
                                disabled={!process || !categoryName || loading}
                            >
                                Create Category
                            </Button>
                        </div>
                    </>
                )}
            </div>
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-1">
                    Category ID:&nbsp;
                    <select
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        className="w-full rounded border bg-white p-2 text-black"
                    >
                        <option value="">Select a category</option>
                        {listCategoriesResult?.map((category: any) => (
                            <option key={category.id} value={category.id}>
                                {category.category_name}
                            </option>
                        ))}
                    </select>
                </div>
                <Button
                    onClick={deleteCategory}
                    disabled={!process || !id || loading}
                >
                    Delete Category
                </Button>
            </div>
            <div className="flex w-full items-center justify-between">
                <Button
                    onClick={readListCategories}
                    disabled={!process || loading}
                >
                    List Categories (Dry Run)
                </Button>
            </div>
            {listCategoriesResult && (
                <pre className="rounded p-2">
                    {JSON.stringify(listCategoriesResult, null, 2)}
                </pre>
            )}
            <div className="flex w-full flex-col gap-4 border-t pt-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Edit Category</h3>
                    <Button
                        onClick={() => setShowEditCategory(!showEditCategory)}
                    >
                        {showEditCategory ? 'Hide' : 'Show'}
                    </Button>
                </div>
                {showEditCategory && (
                    <>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                Category ID:&nbsp;
                                <Input
                                    type="text"
                                    placeholder="Category ID to Edit"
                                    value={editId}
                                    onChange={(e) => setEditId(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                New Name:&nbsp;
                                <Input
                                    type="text"
                                    placeholder="New Category Name"
                                    value={editCategoryName}
                                    onChange={(e) =>
                                        setEditCategoryName(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                New Image Hash:&nbsp;
                                <Input
                                    type="text"
                                    placeholder="New Arweave Image Hash"
                                    value={editImage}
                                    onChange={(e) =>
                                        setEditImage(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                New Status:&nbsp;
                                <select
                                    value={editStatus}
                                    onChange={(e) =>
                                        setEditStatus(e.target.value)
                                    }
                                    className="rounded border bg-white p-2 text-black"
                                >
                                    <option value="active">Active</option>
                                    <option value="coming soon">
                                        Coming Soon
                                    </option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-1">
                                New Gradient:&nbsp;
                                <Input
                                    type="text"
                                    placeholder="New CSS Gradient"
                                    value={editGradient}
                                    onChange={(e) =>
                                        setEditGradient(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <Button
                                onClick={editCategory}
                                disabled={!process || !editId || loading}
                            >
                                Edit Category
                            </Button>
                        </div>
                    </>
                )}
            </div>
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
