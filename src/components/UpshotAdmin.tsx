import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { emptyTxResult, TxResult } from './TxResult';
import { message, createDataItemSigner, result } from '@permaweb/aoconnect';
import { isValidAddress } from '../utils/arweaveUtils';

export function UpshotAdmin() {
    const [listUsersLoading, setListUsersLoading] = useState(false);
    const [checkAdminLoading, setCheckAdminLoading] = useState(false);
    const [editUserLoading, setEditUserLoading] = useState(false);
    const [txResult, setTxResult] = useState(emptyTxResult);
    const [messageResult, setMessageResult] = useState<any>(null);
    const [editAddress, setEditAddress] = useState('');
    const [editName, setEditName] = useState('');
    const [editRole, setEditRole] = useState('admin');
    const [showEditUser, setShowEditUser] = useState(false);
    const process = 'qCf0vvg5Q0Inqyh44H7SPuEzUCk2wXm-asfJmzGOkVY';

    const listUsers = async () => {
        setListUsersLoading(true);
        try {
            const msgId = await message({
                process,
                tags: [{ name: 'Action', value: 'ListUsers' }],
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
            setListUsersLoading(false);
        }
    };

    const checkAdmin = async () => {
        const activeAddress = await window.arweaveWallet?.getActiveAddress();
        if (!activeAddress) return;
        setCheckAdminLoading(true);
        try {
            const msgId = await message({
                process,
                tags: [{ name: 'Action', value: 'CheckAdmin' }],
                data: JSON.stringify({
                    address: activeAddress,
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
            setCheckAdminLoading(false);
        }
    };

    const editUser = async () => {
        if (!editAddress || !isValidAddress(editAddress)) return;
        setEditUserLoading(true);
        try {
            const msgId = await message({
                process,
                tags: [{ name: 'Action', value: 'EditUser' }],
                data: JSON.stringify({
                    address: editAddress,
                    name: editName || undefined,
                    role: editRole,
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
            setEditUserLoading(false);
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

    return (
        <div className="flex w-full flex-col items-start justify-between gap-4">
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-1">
                    Process ID: {process}
                </div>
            </div>

            {/* List Users Section */}
            <div className="flex w-full flex-col gap-2 rounded-xl border border-gray-200 p-4">
                <h2 className="text-lg font-semibold">List Users</h2>
                <div className="flex justify-start">
                    <Button onClick={listUsers} disabled={listUsersLoading}>
                        List Users
                    </Button>
                </div>
            </div>

            {/* Check Admin Section */}
            <div className="flex w-full flex-col gap-2 rounded-xl border border-gray-200 p-4">
                <h2 className="text-lg font-semibold">Check Admin Status</h2>
                <div className="flex justify-start">
                    <Button onClick={checkAdmin} disabled={checkAdminLoading}>
                        Check Admin Status
                    </Button>
                </div>
            </div>

            {/* Edit User Section */}
            <div className="flex w-full flex-col gap-2 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Edit User</h2>
                    <Button onClick={() => setShowEditUser(!showEditUser)}>
                        {showEditUser ? 'Hide' : 'Show'} Edit Form
                    </Button>
                </div>
                {showEditUser && (
                    <div className="flex w-full flex-col gap-2">
                        <div className="flex items-center gap-1">
                            Address:&nbsp;
                            <Input
                                type="text"
                                placeholder="User Address"
                                value={editAddress}
                                onChange={(e) => setEditAddress(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="flex items-center gap-1">
                            Name:&nbsp;
                            <Input
                                type="text"
                                placeholder="User Name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="flex items-center gap-1">
                            Role:&nbsp;
                            <Input
                                type="text"
                                placeholder="User Role"
                                value={editRole}
                                onChange={(e) => setEditRole(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="flex justify-start">
                            <Button
                                onClick={editUser}
                                disabled={
                                    !editAddress ||
                                    !isValidAddress(editAddress) ||
                                    editUserLoading
                                }
                            >
                                Edit User
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Results Section */}
            {txResult.status && (
                <div className="flex w-full flex-col gap-2 rounded-xl border border-gray-200 p-4">
                    <h2 className="text-lg font-semibold">Results</h2>
                    <TxResult txResult={{ ...txResult, aoResult: true }} />
                    <div className="flex justify-start">
                        <Button onClick={readResult} disabled={!txResult.txId}>
                            Read Result
                        </Button>
                    </div>
                    {messageResult && (
                        <pre className="rounded p-2">
                            {messageResult.Messages?.[0]?.Data
                                ? JSON.stringify(
                                      JSON.parse(
                                          messageResult.Messages[0].Data
                                      ),
                                      null,
                                      2
                                  )
                                : JSON.stringify(messageResult, null, 2)}
                        </pre>
                    )}
                </div>
            )}
        </div>
    );
}
